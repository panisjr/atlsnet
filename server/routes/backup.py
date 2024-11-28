from flask import Blueprint, request, jsonify, send_file, send_from_directory
import os
import cv2
import re
from ultralytics import YOLO
from ultralytics.solutions.object_counter import ObjectCounter
from models import *  # Ensure you import your Video model correctly
from extensions import db
from extensions import socketio
from werkzeug.utils import secure_filename
from datetime import datetime, timedelta 
from sqlalchemy import func, cast, Integer
import time
from threading import Thread
import subprocess

video_routes = Blueprint("video_routes", __name__)

# Initialize YOLO model
model = YOLO("best.pt")

# Configuration for the RTSP stream
# RTSP_URL = "rtsp://c200North:c200North@192.168.153.165:554/stream1"  # Replace with your RTSP URL
STREAM_DIR = "stream"
M3U8_PATH = os.path.join(STREAM_DIR, "stream.m3u8")
os.makedirs(STREAM_DIR, exist_ok=True)

# Define the upload folder
UPLOAD_FOLDER = os.path.join(os.getcwd(), 'static', 'Videos')
# Create the upload folder if it doesn't exist
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs('counting_stream', exist_ok=True)

def format_videos(video):
    return {
        "id": video.id,
        "intersection_id": video.intersection_id,
        "in_counts": video.in_counts,
        "out_counts": video.out_counts,
        "filename": f"{request.host_url}static/Videos/{video.filename}",
        "created_at": video.created_at,
    }

def start_streaming(rtsp_url):
    """Starts the HLS stream and saves a separate AVI file for object counting."""
    timestamp = int(time.time())  # Get the current timestamp
    # Ensure the 'counting_stream' folder exists
    output_filename = os.path.join('counting_stream', f"stream_for_counting_{timestamp}.avi")
    command = [
        "ffmpeg",
        "-fflags",
        "+genpts",
        "-i",
        rtsp_url,
        "-preset",
        "ultrafast",
        "-tune",
        "zerolatency",
        "-hls_time",
        "10",
        "-hls_list_size",
        "10",
        "-hls_flags",
        "delete_segments",
        "-hls_segment_filename",
        os.path.join(STREAM_DIR, "stream%03d.ts"),
        M3U8_PATH,
        "-f", "avi",
        output_filename
    ]
    subprocess.Popen(command)

def process_video_segment():
    """Process the saved AVI stream for object counting and send real-time updates."""
    while True:
        avi_files = sorted([f for f in os.listdir('counting_stream') if f.startswith('stream_for_counting_') and f.endswith('.avi')])
        
        if not avi_files:
            print("No AVI files found for processing.")
            time.sleep(5)
            continue
         
        latest_file = avi_files[-1]
        latest_file_path = f"counting_stream/{latest_file}"
        
        print(f"Processing file: {latest_file}")
        print("File exists:", os.path.exists(latest_file_path))
        
        # Allow some time for the file to fully save
        time.sleep(5)

        video_capture = cv2.VideoCapture(latest_file_path)
        if not video_capture.isOpened():
            print(f"Error opening {latest_file_path}.")
            continue

        # Process the video as before
        line_points = [(0, 180), (640, 180)]
        counter = ObjectCounter(
            names=model.names,
            reg_pts=line_points,
            view_img=True,
            draw_tracks=False,
        )

        frame_skip = 2
        frame_count = 0

        while True:
            success, frame = video_capture.read()
            if not success:
                print("End of video or empty frame.")
                break

            frame_count += 1
            if frame_count % frame_skip != 0:
                continue

            frame = cv2.resize(frame, (640, 360))
            tracks = model.track(frame, persist=True, show=False)
            counter.start_counting(frame, tracks)

            socketio.emit("update_message", {
                "in_counts": counter.in_counts,
                "out_counts": counter.out_counts
            })
            socketio.sleep(0.1)

        # Save counts to the database at the end of processing
        with video_routes.app_context():
            new_video = Video(
                in_counts=counter.in_counts,
                out_counts=counter.out_counts,
                filename=latest_file
            )
            try:
                db.session.add(new_video)
                db.session.commit()
                print(f"Successfully saved counts for {latest_file}")
            except Exception as e:
                db.session.rollback()
                print(f"Error saving to database: {e}")

        video_capture.release()
        cv2.destroyAllWindows()

        # Remove the processed file to free up space or for re-processing
        os.remove(latest_file_path)

counting_thread = None  # Initialize counting thread

@video_routes.route("/start_hls/<int:camera_id>", methods=["POST"])
def start_hls(camera_id):
    camera = Camera.query.filter_by(id=camera_id).one_or_none()
    if camera and camera.status:
        print("Camera name: " , camera.name)
        print("Camera id:", camera.id)
        rtsp_url = camera.rtsp_url
        print("Camera rtsp url:", rtsp_url)
        """Start the HLS streaming process."""  
        thread = Thread(target=start_streaming, args=(rtsp_url,))  # Run HLS in a separate thread
        thread.start()
        return jsonify({'message': 'HLS stream started', 'rtsp_url': rtsp_url}), 200
    else:
        return jsonify({'message': 'Camera not found or inactive'}), 404
@video_routes.route("/start_counting/<int:camera_id>", methods=["POST"])
def start_counting(camera_id):
    camera = Camera.query.get(camera_id)
    if camera and camera.status:
        rtsp_url = camera.rtsp_url
        print("This is the rtsp url start_counting",rtsp_url)
        """Start processing frames from the RTSP stream for object counting."""
        global counting_thread
        if counting_thread is None or not counting_thread.is_alive():
            counting_thread = Thread(target=process_video_segment)
            counting_thread.start()
            return jsonify({'message': 'Detection started', 'rtsp_url': rtsp_url}), 200
        else:
            return jsonify({"message": "Counting is already in progress."}), 400
    else:
        return jsonify({'message': 'Camera not found or inactive'}), 404
 

# Route to serve the HLS playlist
@video_routes.route('/stream.m3u8')
def stream_playlist():
    """Serve the HLS playlist."""
    return send_file(M3U8_PATH)  # Serve the specific m3u8 file

# Route to serve the .ts segment files
@video_routes.route('/<path:filename>')
def stream_segment(filename):
    """Serve the HLS segments."""
    return send_from_directory(STREAM_DIR, filename)  # Ensure segments are served from STREAM_DIR

@socketio.on("connect")
def handle_connect():
    print("Client connected")

# Route to process uploaded video file
@video_routes.route("/video_feed", methods=["POST"])
def process_video_frame():
    try:
        # Check if the post request has the file part
        if "video_file" not in request.files:
            return jsonify({"error": "No file part"}), 400

        file = request.files["video_file"]

        # Check if the user selected a file
        if file.filename == "":
            return jsonify({"error": "No selected file"}), 400

        # Secure the filename
        filename = secure_filename(file.filename)
        original_file_path = os.path.join(UPLOAD_FOLDER, filename)
        file.save(original_file_path)

        # Open the video file using OpenCV
        video_capture = cv2.VideoCapture(original_file_path)

        # Assert that the video capture is successfully opened
        if not video_capture.isOpened():
            return jsonify({"error": "Error reading video file"}), 400

        # Get video properties: width, height, and FPS
        width = int(video_capture.get(cv2.CAP_PROP_FRAME_WIDTH))
        height = int(video_capture.get(cv2.CAP_PROP_FRAME_HEIGHT))
        fps = int(video_capture.get(cv2.CAP_PROP_FPS)) or 30  # Default FPS to 30 if not available

        # Define region points as a polygon
        region_points = [
            (400, 190),
            (1105, 520),
            (990, 680),
            (220, 239),
            (400, 190),
        ]

        # Create a distinct filename for the processed video
        processed_video_filename = f"processed_{filename}"
        processed_video_path = os.path.join(UPLOAD_FOLDER, processed_video_filename)

        # Initialize video writer
        video_writer = cv2.VideoWriter(
            processed_video_path,
            cv2.VideoWriter_fourcc(*"avc1"),  # Use "mp4v" for wider compatibility
            fps,
            (width, height),
        )

        # Initialize object counter
        counter = ObjectCounter(
            names=model.names,
            reg_pts=region_points,
            view_img=True,
            draw_tracks=True,
        )

        # Process each frame in the video stream
        while video_capture.isOpened():
            success, frame = video_capture.read()
            if not success:
                print("Video frame is empty or video processing has been successfully completed.")
                break

            # Perform object detection and counting
            tracks = model.track(frame, persist=True, show=False)
            processed_frame = counter.start_counting(frame, tracks)

            # Write the processed frame to the output video
            video_writer.write(processed_frame)

        # Release resources
        video_capture.release()
        video_writer.release()
        cv2.destroyAllWindows()

        # Access the in_counts and out_counts attributes of the counter object
        in_counts = counter.in_counts
        out_counts = counter.out_counts
        print("In counts:", in_counts)
        print("Out counts:", out_counts)

        # Save the processed video counts to the database
        new_video = Video(in_counts=in_counts, out_counts=out_counts, filename=processed_video_filename)
        db.session.add(new_video)
        db.session.commit()

        # Construct the video source URL for the frontend
        video_source_url = f"{request.host_url}static/Videos/{processed_video_filename}"

        return jsonify(
            {
                "in_counts": in_counts,
                "out_counts": out_counts,
                "video_file": processed_video_path,
                "vid_src": video_source_url,
            }
        )

    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
@video_routes.route("/processed_video/<int:video_id>", methods=["GET"])
def get_processed_video(video_id):
    try:
        # Assuming you want to get the specific processed video by ID
        video = Video.query.get(video_id)
        if not video:
            return jsonify({"error": "Video not found!"}), 404
        
        processed_video_path = os.path.join(UPLOAD_FOLDER, video.filename)
        return send_file(processed_video_path, mimetype="video/mp4")
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@video_routes.route("/get_videos", methods=["GET"])
def get_videos():
    try:
        videos = Video.query.order_by(Video.id.asc()).all()
        video_urls = [format_videos(video) for video in videos]
        print(video_urls)
        return jsonify(video_urls), 200
    except Exception as e:
        return jsonify({"error": "Can't get the videos!"}), 500

@video_routes.route("/daily_counts", methods=["GET"])
def get_daily_counts():
    try:
        # Define start of the week (Monday) and get current date
        today = datetime.now()
        start_of_week = today - timedelta(days=today.weekday())
        
        # Query for daily aggregated counts
        daily_counts = (
            db.session.query(
                func.date_trunc('day', Video.created_at).label('day'),  # Group by day
                func.sum(cast(Video.in_counts, Integer)).label('in_counts'),
                func.sum(cast(Video.out_counts, Integer)).label('out_counts')
            )
            # .filter(Video.created_at >= start_of_week)  # Filter to current week
            .group_by('day')
            .order_by('day')
            .all()
        )
        
        # Format data for the frontend chart
        result = [
            {
                "day": day.strftime('%A'),  # Convert datetime to day name (e.g., "Monday")
                "in_counts": in_counts or 0,
                "out_counts": out_counts or 0
            }
            for day, in_counts, out_counts in daily_counts
        ]
        
        return jsonify(result), 200
    except Exception as e:
        print(f"Error fetching daily counts: {e}")
        return jsonify({"error": "Could not fetch daily counts"}), 500
    
# DELETE VIDEO
@video_routes.route('/delete_video/<int:video_id>', methods=['DELETE'])
def delete_video(video_id):
    token = request.headers.get("Authorization")
    if not token:
        return jsonify({"error": "Unauthorized! Token is missing!"}), 401
    try:
        # Find the video by ID
        video = Video.query.get(video_id)
        if video is None:
            return jsonify({"error": "Video not found!"}), 404

        # Get the full file path
        file_path = os.path.join(UPLOAD_FOLDER, video.filename)

        # Remove the video file if it exists
        if os.path.exists(file_path):
            os.remove(file_path)

        # Remove the video record from the database
        db.session.delete(video)
        db.session.commit()

        return jsonify({"msg": "Video deleted successfully!"}), 200
    except Exception as e:
        return jsonify({"error": "Error deleting video!"}), 500
