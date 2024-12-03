from flask import Blueprint, request, jsonify, send_file, send_from_directory, current_app
import os
import cv2
from ultralytics import YOLO
from ultralytics.solutions.object_counter import ObjectCounter
from models import Camera, Video  # Ensure models are imported correctly
from extensions import db, socketio
from werkzeug.utils import secure_filename
from datetime import datetime, timedelta
from sqlalchemy import func, cast, Integer
from threading import Thread
import numpy as np
# import util
from plate_number_detection.sort.sort import *
from plate_number_detection.util import get_car, read_license_plate, write_csv
license_plate_detector = YOLO('./plate_number_detection/models/license_plate_detector.pt')

video_routes = Blueprint("video_routes", __name__)

# Initialize YOLO model
model = YOLO("best.pt")

# Configuration
STREAM_DIR = "hls"

# Define the upload folder
UPLOAD_FOLDER = os.path.join(os.getcwd(), 'static', 'Videos')
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# Define for License Plate detection
# Initialize SORT tracker
mot_tracker = Sort()

# Initialize results
results = {}

# Define vehicles (class ids)
vehicles = [2, 3, 5, 7]
def format_video_data(video):
    """Format video data for JSON response."""
    return {
        "id": video.id,
        "intersection_id": video.intersection_id,
        "in_counts": video.in_counts,
        "out_counts": video.out_counts,
        "filename": f"{request.host_url}static/Videos/{video.filename}",
        "created_at": video.created_at,
    }

def start_streaming(rtsp_url, camera_id):
    """Start HLS streaming and generate playlist with correct relative paths."""
    camera_hls_dir = os.path.join(STREAM_DIR, str(camera_id))  # Directory for camera-specific HLS content
    os.makedirs(camera_hls_dir, exist_ok=True)

    hls_stream_path = os.path.join(camera_hls_dir, "stream.m3u8")
    
    # HLS segment filename pattern
    segment_filename_pattern = os.path.join(camera_hls_dir, "stream%03d.ts")

    # Command for ffmpeg to start streaming and generate the playlist
    command = [
        "ffmpeg",
        "-fflags", "+genpts",
        "-i", rtsp_url,
        "-preset", "ultrafast",
        "-tune", "zerolatency",
        "-hls_time", "10",  # Segment duration in seconds
        "-hls_list_size", "10",  # Max number of segments in the playlist
        "-hls_flags", "delete_segments",  # Delete older segments
        "-hls_segment_filename", segment_filename_pattern,  # Set the pattern for segment filenames
        hls_stream_path  # Output the playlist file at the camera's directory
    ]
    
    os.system(" ".join(command))  # Execute the command to start streaming


# Function to process the RTSP stream
def process_rtsp_stream(rtsp_url, app,camera_id):
    """Process RTSP stream for object counting and license plate detection."""
    with app.app_context():  # Explicitly push app context for database operations
        cap = cv2.VideoCapture(rtsp_url)
        if not cap.isOpened():
            print(f"Error: Unable to open RTSP stream: {rtsp_url}")
            return

    # Define line points for object counting (can be adjusted per camera setup)
    line_points = [(10, 80), (630, 280)]  # Example line for counting
    counter = ObjectCounter(
        names=model.names,
        reg_pts=line_points,
        view_img=True,  # Set to False to avoid showing frames
        draw_tracks=False,
    )

    frame_skip = 2  # Skip frames for performance optimization
    frame_count = 0

    while True:
        ret, frame = cap.read()
        if not ret:
            print("Stream ended or interrupted.")
            break

        frame_count += 1
        if frame_count % frame_skip != 0:
            continue

        # Detect vehicles using YOLO model
        detections = model(frame)[0]
        print(detections.boxes.data)
        detections_ = []
        for detection in detections.boxes.data.tolist():
            # Slice to handle cases with extra fields
            x1, y1, x2, y2, score, class_id = detection[:6]
            if int(class_id) in vehicles:
                detections_.append([x1, y1, x2, y2, score])


        # Track vehicles using SORT tracker
        track_ids = mot_tracker.update(np.asarray(detections_))

        # Detect license plates using license plate detection model
        license_plates = license_plate_detector(frame)[0]
        for license_plate in license_plates.boxes.data.tolist():
            x1, y1, x2, y2, score, class_id = license_plate

            # Assign license plate to car (vehicle)
            xcar1, ycar1, xcar2, ycar2, car_id = get_car(license_plate, track_ids)

            if car_id != -1:
                # Crop and process license plate for recognition
                license_plate_crop = frame[int(y1):int(y2), int(x1): int(x2), :]
                license_plate_crop_gray = cv2.cvtColor(license_plate_crop, cv2.COLOR_BGR2GRAY)
                _, license_plate_crop_thresh = cv2.threshold(license_plate_crop_gray, 64, 255, cv2.THRESH_BINARY_INV)

                # Read license plate number
                license_plate_text, license_plate_text_score = read_license_plate(license_plate_crop_thresh)

                if license_plate_text is not None:
                    # Store results for vehicle and license plate data
                    results[frame_count] = results.get(frame_count, {})
                    results[frame_count][car_id] = {
                        'car': {'bbox': [xcar1, ycar1, xcar2, ycar2]},
                        'license_plate': {
                            'bbox': [x1, y1, x2, y2],
                            'text': license_plate_text,
                            'bbox_score': score,
                            'text_score': license_plate_text_score
                        }
                    }

        # Count vehicles passing the defined line
        tracks = model.track(frame, persist=True, show=False)  # Track objects
        counter.start_counting(frame, tracks)

        # Emit real-time updates to the client
        socketio.emit("update_message", {
            "in_counts": counter.in_counts,
            "out_counts": counter.out_counts
        })

        socketio.sleep(0.1)  # Allow time for other tasks

    # Save counts to the database after stream ends
    cap.release()
    cv2.destroyAllWindows()

    # Save video data with the counting results (this could be modified depending on your database structure)
    new_video = Video(
        in_counts=counter.in_counts,
        out_counts=counter.out_counts,
        filename="real-time-stream",
        camera_id=camera_id  # Store the associated camera_id
    )
    try:
        db.session.add(new_video)
        db.session.commit()
        print(f"Saved counts for camera {camera_id}: {new_video.in_counts}, {new_video.out_counts}")
    except Exception as e:
        db.session.rollback()  # Rollback on error
        print(f"Error saving to database: {e}")
# ============ HLS STREAM START ================
@video_routes.route("/start_hls/<int:camera_id>", methods=["POST"])
def start_hls(camera_id):
    """Start HLS streaming for the given camera."""
    camera = Camera.query.filter_by(id=camera_id).one_or_none()
    if not camera:
        return jsonify({"error": "Camera not found"}), 404

    camera_hls_dir = os.path.join(STREAM_DIR, str(camera.id))
    hls_stream_path = os.path.join(camera_hls_dir, "stream.m3u8")

    # Ensure the parent directory exists
    if not os.path.exists(camera_hls_dir):
        os.makedirs(camera_hls_dir, exist_ok=True)

    # Do not create the file if it already exists
    if not os.path.exists(hls_stream_path):
        open(hls_stream_path, 'w').close()  # Creates an empty file


    # Check if the HLS playlist file exists (stream is ready)
    if not os.path.exists(hls_stream_path):
        return jsonify({"error": "HLS stream not found"}), 404

    if camera and camera.status:
        rtsp_url = camera.rtsp_url
        # Start the RTSP to HLS streaming in a separate thread
        thread = Thread(target=start_streaming, args=(rtsp_url, camera.id))  # Pass camera_id here
        thread.start()

        return jsonify({'message': 'HLS stream started', 'rtsp_url': rtsp_url}), 200

    return jsonify({'message': 'Camera not found or inactive'}), 404

@video_routes.route("/hls/<int:camera_id>/stream.m3u8", methods=["GET"])
def serve_hls(camera_id):
    """Serve the HLS playlist file for the given camera."""
    camera = Camera.query.filter_by(id=camera_id).one_or_none()
    if not camera:
        return jsonify({"error": "Camera not found"}), 404

    camera_hls_dir = os.path.join(STREAM_DIR, str(camera.id))
    hls_stream_path = os.path.join(camera_hls_dir, "stream.m3u8")

    # Ensure the HLS stream exists before serving it
    if not os.path.exists(hls_stream_path):
        return jsonify({"error": "HLS stream not found"}), 404
    
    return send_from_directory(camera_hls_dir, "stream.m3u8")

@video_routes.route("/hls/<int:camera_id>/<path:filename>")
def stream_segment(camera_id, filename):
    """Serve HLS segment files for a specific camera."""
    camera_hls_dir = os.path.join(STREAM_DIR, str(camera_id))
    segment_file_path = os.path.join(camera_hls_dir, filename)

    # Ensure the segment exists before serving it
    if not os.path.exists(segment_file_path):
        return jsonify({"error": "Segment not found"}), 404
    
    return send_from_directory(camera_hls_dir, filename)

# =============== HLS STREAM END ======================

@video_routes.route("/start_counting/<int:camera_id>", methods=["POST"])
def start_counting(camera_id):
    """Start real-time object counting for the given camera."""
    camera = Camera.query.get(camera_id)
    if camera and camera.status:
        rtsp_url = camera.rtsp_url
        app = current_app._get_current_object()  # Get the Flask app instance
        thread = Thread(target=process_rtsp_stream, args=(rtsp_url, app, camera_id))
        thread.start()
        return jsonify({'message': 'Real-time counting started', 'rtsp_url': rtsp_url}), 200
    return jsonify({'message': 'Camera not found or inactive'}), 404

@socketio.on("connect")
def handle_connect():
    """Handle client connection."""
    print("Client connected")

@video_routes.route("/daily_counts", methods=["GET"])
def get_daily_counts():
    """Get daily aggregated counts."""
    try:
        # Query the database for daily counts of in and out traffic
        daily_counts = (
            db.session.query(
                func.date_trunc('day', Video.created_at).label('day'),
                func.sum(cast(Video.in_counts, Integer)).label('in_counts'),
                func.sum(cast(Video.out_counts, Integer)).label('out_counts')
            )
            .group_by('day')
            .order_by('day')
            .all()
        )

        result = [
            {
                "day": day.strftime('%A'),
                "in_counts": in_counts or 0,
                "out_counts": out_counts or 0
            }
            for day, in_counts, out_counts in daily_counts
        ]
        return jsonify(result), 200
    except Exception as e:
        print(f"Error fetching daily counts: {e}")
        return jsonify({"error": "Could not fetch daily counts"}), 500
