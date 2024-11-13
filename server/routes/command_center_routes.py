from flask import Blueprint, jsonify, request, send_from_directory
import os
import subprocess
from extensions import db
from models import Camera

command_center_routes = Blueprint("command_center_routes", __name__)

UPLOAD_FOLDER = 'hls'  # Main folder to store HLS streams
os.makedirs(UPLOAD_FOLDER, exist_ok=True)  # Ensure the main HLS folder exists

# Start HLS stream for a camera
@command_center_routes.route("/videos/start_hls/<int:camera_id>", methods=["POST"])
def start_hls(camera_id):
    camera = Camera.query.get(camera_id)
    if not camera:
        return jsonify({"error": "Starting ... Camera not found"}), 404
    
    # Create directory for the specific camera's HLS stream
    camera_hls_dir = os.path.join(UPLOAD_FOLDER, str(camera.id))
    os.makedirs(camera_hls_dir, exist_ok=True)  # Create camera-specific folder if it doesn't exist

    hls_stream_path = os.path.join(camera_hls_dir, "stream.m3u8")

    # Command to convert RTSP to HLS using FFmpeg
    command = [
        "ffmpeg",
        "-i", camera.rtsp_url,
        "-c:v", "libx264",
        "-preset", "ultrafast",
        "-f", "hls",
        "-hls_time", "2",
        "-hls_list_size", "3",
        "-hls_flags", "delete_segments",
        hls_stream_path
    ]

    try:
        subprocess.Popen(command, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        camera.status = "active"  # Update camera status
        db.session.commit()
        return jsonify({"message": f"HLS streaming started for camera ID {camera.id}"}), 200
    except Exception as e:
        return jsonify({"error": f"Failed to start HLS: {str(e)}"}), 500

# Serve the HLS playlist (m3u8)
@command_center_routes.route("/videos/<int:camera_id>/stream.m3u8", methods=["GET"])
def serve_hls(camera_id):
    camera = Camera.query.get(camera_id)
    if not camera:
        return jsonify({"error": "Camera not found"}), 404

    camera_hls_dir = os.path.join(UPLOAD_FOLDER, str(camera.id))
    hls_stream_path = os.path.join(camera_hls_dir, "stream.m3u8")

    # Check if the HLS playlist file exists
    if not os.path.exists(hls_stream_path):
        return jsonify({"error": "HLS stream not found"}), 404

    # Serve the actual .m3u8 file
    return send_from_directory(camera_hls_dir, "stream.m3u8")

# Serve the HLS segment files (.ts)
@command_center_routes.route("/videos/<int:camera_id>/<filename>", methods=["GET"])
def serve_hls_segment(camera_id, filename):
    camera = Camera.query.get(camera_id)
    if not camera:
        return jsonify({"error": "Camera not found"}), 404

    camera_hls_dir = os.path.join(UPLOAD_FOLDER, str(camera.id))
    file_path = os.path.join(camera_hls_dir, filename)

    # Check if the segment file exists
    if not os.path.exists(file_path):
        return jsonify({"error": "File not found"}), 404

    # Serve the actual .ts segment file
    return send_from_directory(camera_hls_dir, filename)
