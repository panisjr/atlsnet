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

video_routes = Blueprint("video_routes", __name__)

# Initialize YOLO model
model = YOLO("best.pt")

# Configuration
STREAM_DIR = "hls"

# Define the upload folder
UPLOAD_FOLDER = os.path.join(os.getcwd(), 'static', 'Videos')
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

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

def process_rtsp_stream(rtsp_url, app, camera_id):
    """Process RTSP stream for object counting, real-time updates, and saving to the database periodically."""
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
            view_img=False,  # No image display since we're not saving the video
            draw_tracks=True,  # Enable drawing for visualizations
        )

        frame_skip = 2  # Skip frames for performance optimization
        frame_count = 0
        last_save_time = datetime.now()

        while True:
            ret, frame = cap.read()
            if not ret:
                print("Stream ended or interrupted.")
                break

            frame_count += 1
            if frame_count % frame_skip != 0:
                continue

            frame = cv2.resize(frame, (640, 360))  # Resize for faster processing
            tracks = model.track(frame, persist=True, show=False)  # Track objects
            counter.start_counting(frame, tracks)

            # Emit real-time updates to the client
            socketio.emit("update_message", {
                "in_counts": counter.in_counts,
                "out_counts": counter.out_counts
            })

            # Save counts to the database every 15 seconds
            current_time = datetime.now()
            if (current_time - last_save_time).total_seconds() >= 15:
                try:
                    new_video = Video(
                        in_counts=counter.in_counts,
                        out_counts=counter.out_counts,
                        filename=None,  # No filename to save since we're not saving video
                        camera_id=camera_id
                    )
                    db.session.add(new_video)
                    db.session.commit()
                    print(f"Counts saved for camera {camera_id}: {counter.in_counts}, {counter.out_counts}")
                    last_save_time = current_time  # Update the last save time
                except Exception as e:
                    db.session.rollback()
                    print(f"Error saving to database: {e}")

            socketio.sleep(0.1)  # Allow time for other tasks

        # Final cleanup
        cap.release()
        cv2.destroyAllWindows()

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

