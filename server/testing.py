from flask import Flask, jsonify, send_file, send_from_directory, request
from flask_cors import CORS
from flask_socketio import SocketIO
from ultralytics import YOLO
from ultralytics.solutions.object_counter import ObjectCounter
import os
import cv2
from threading import Thread
import subprocess
from extensions import db
from models import *
import time

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})
socketio = SocketIO(app, cors_allowed_origins="*")

# Configuration for the RTSP stream
RTSP_URL = "rtsp://c200North:c200North@192.168.153.165:554/stream1"  # Replace with your RTSP URL

def create_app():
    # Initialize database
    app.config["SQLALCHEMY_DATABASE_URI"] = "postgresql://postgres:postgres@localhost/atls"
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

    # Initialize the database with the app
    db.init_app(app)
    return app

STREAM_DIR = "stream"
M3U8_PATH = os.path.join(STREAM_DIR, "stream.m3u8")
os.makedirs(STREAM_DIR, exist_ok=True)

# Initialize YOLO model
model = YOLO("yolov8n.pt")  # Load your YOLO model

counting_thread = None  # Global variable to track the counting thread

def start_streaming():
    """Starts the HLS stream and saves a separate AVI file for object counting."""
    timestamp = int(time.time())  # Get the current timestamp
    output_filename = f"stream_for_counting_{timestamp}.avi"
    command = [
        "ffmpeg",
        "-fflags",
        "+genpts",
        "-i",
        RTSP_URL,
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
        output_filename  # Use the dynamic filename here
    ]
    subprocess.Popen(command)

def process_video_segment():
    """Process the saved AVI stream for object counting and send real-time updates."""
    while True:
        # Get the latest AVI file created for counting
        avi_files = sorted([f for f in os.listdir('.') if f.startswith('stream_for_counting_') and f.endswith('.avi')])
        
        if not avi_files:
            print("No AVI files found for processing.")
            time.sleep(5)  # Wait before checking again
            continue
        
        latest_file = avi_files[-1]  # Get the most recent file
        print(f"Processing file: {latest_file}")

        # Adding a slight delay to ensure the file is ready for reading
        time.sleep(5)  # Adjust this based on buffering requirements

        video_capture = cv2.VideoCapture(latest_file)
        if not video_capture.isOpened():
            print(f"Error opening {latest_file}.")
            return

        line_points = [(0, 180), (640, 180)]  # Centered line points for a 640x360 frame
        counter = ObjectCounter(
            names=model.names,
            reg_pts=line_points,
            view_img=True,
            draw_tracks=False,
        )

        frame_skip = 2  # Process every 2nd frame
        frame_count = 0

        while True:
            success, frame = video_capture.read()
            if not success:
                print("End of video or empty frame.")
                break

            frame_count += 1
            if frame_count % frame_skip != 0:
                continue

            # Resize the frame before processing
            frame = cv2.resize(frame, (640, 360))
            tracks = model.track(frame, persist=True, show=False)
            counter.start_counting(frame, tracks)

            socketio.emit("update_message", {
                "in_counts": counter.in_counts,
                "out_counts": counter.out_counts
            })
            socketio.sleep(0.1)

        # Save counts to the database at the end of processing
        with app.app_context():
            new_video = Video(
                in_counts=counter.in_counts,
                out_counts=counter.out_counts,
                filename=latest_file  # Save the name of the processed AVI file
            )
            try:
                db.session.add(new_video)
                db.session.commit()
            except Exception as e:
                db.session.rollback()
                print(f"Error saving to database: {e}")

        video_capture.release()
        cv2.destroyAllWindows()

        # Optionally, delete the processed file or move it to a different directory
        os.remove(latest_file)  # Delete the processed file if no longer needed

@app.route("/start_counting", methods=["POST"])
def start_counting():
    """Start processing frames from the RTSP stream for object counting."""
    global counting_thread
    if counting_thread is None or not counting_thread.is_alive():
        counting_thread = Thread(target=process_video_segment)
        counting_thread.start()
        return jsonify({"message": "Started counting"}), 200
    else:
        return jsonify({"message": "Counting is already in progress."}), 400

@app.route("/start_hls", methods=["POST"])
def start_hls():
    """Start the HLS streaming process."""
    thread = Thread(target=start_streaming)  # Run HLS in a separate thread
    thread.start()
    return jsonify({"message": "HLS streaming started"}), 200

# Route to serve the HLS playlist
@app.route('/stream.m3u8')
def stream_playlist():
    """Serve the HLS playlist."""
    return send_file(M3U8_PATH)  # Serve the specific m3u8 file

# Route to serve the .ts segment files
@app.route('/<path:filename>')
def stream_segment(filename):
    """Serve the HLS segments."""
    return send_from_directory(STREAM_DIR, filename)  # Ensure segments are served from STREAM_DIR

@socketio.on("connect")
def handle_connect():
    print("Client connected")

def send_real_time_updates():
    """Optional background process for periodic server messages to client."""
    while True:
        socketio.emit("update_message", {"message": "Live update from the server"})
        time.sleep(10)

@app.route("/add_camera", methods=["POST"])
def add_camera():
    data = request.get_json()

    if not data:
        return jsonify({"error": "No data provided!"}), 400
    
    name = data.get("name")
    rtsp_url = data.get("rtsp_url")
    location = data.get("location", "")

    if not name or not rtsp_url:
        return jsonify({"error": "Name and RTSP URL are required!"}), 400
    
    new_camera = Camera(name=name, rtsp_url=rtsp_url, location=location)
    db.session.add(new_camera)
    db.session.commit()
    
    return jsonify({"message": "Camera added successfully!"})

def format_cameras(camera):
    return {
        "id": camera.id,
        "name": camera.name,
        "rtsp_url": camera.rtsp_url,
        "location": camera.location,
        "created_at": camera.created_at,
    }

@app.route("/get_camera", methods=["GET"])
def get_camera():
    try:
        cameras = Camera.query.order_by(Camera.id.asc()).all()
        cameras_url = [format_cameras(camera) for camera in cameras]
        return jsonify(cameras_url), 200
    except Exception as e:
        return jsonify({"error": "Error occurred when getting cameras"}), 500

if __name__ == "__main__":
    app = create_app()
    with app.app_context():
        db.create_all() 
    socketio.run(app, host="0.0.0.0", port=5000, debug=True)
