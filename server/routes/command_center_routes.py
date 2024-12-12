from flask import Blueprint, jsonify, request, send_from_directory
import os
import subprocess
from extensions import db,socketio
from models import Camera

command_center_routes = Blueprint("command_center_routes", __name__)

UPLOAD_FOLDER = 'hls'  # Main folder to store HLS streams
os.makedirs(UPLOAD_FOLDER, exist_ok=True)  # Ensure the main HLS folder exists

@command_center_routes.route("/videos/start_hls/<int:camera_id>", methods=["POST"])
def start_hls(camera_id):
    camera = Camera.query.get(camera_id)
    if not camera:
        socketio.emit("stream_error", 
                    {"camera_id": camera_id, "message": "Camera not found"}, 
                    namespace="/",  # Explicit namespace
                    broadcast=True)
        return jsonify({"error": "Camera not found"}), 404

    camera_hls_dir = os.path.join(UPLOAD_FOLDER, str(camera.id))
    os.makedirs(camera_hls_dir, exist_ok=True)

    hls_stream_path = os.path.join(camera_hls_dir, "stream.m3u8")
    mp4_output_path = os.path.join(camera_hls_dir, "stream.mp4")

    command = [
        "ffmpeg",
        "-i", camera.rtsp_url,
        "-c:v", "libx264",
        "-preset", "ultrafast",
        "-crf", "28",
        "-f", "hls",
        "-hls_time", "10",
        "-hls_list_size", "10",
        "-hls_flags", "delete_segments",
        "-tune", "zerolatency",
        hls_stream_path,
        "-c:v", "copy",
        "-c:a", "aac",
        "-movflags", "+faststart",
        mp4_output_path
    ]

    try:
        process = subprocess.Popen(command, stdout=subprocess.PIPE, stderr=subprocess.PIPE)

        # Emit an event to notify that the streaming has started
        socketio.emit("stream_started", {"camera_id": camera.id, "message": "HLS streaming started"}, broadcast=True)

        stdout, stderr = process.communicate()
        if stderr:
            print("FFmpeg Error:", stderr.decode())
            socketio.emit("stream_error", {"camera_id": camera.id, "message": stderr.decode()}, broadcast=True)
        if stdout:
            print("FFmpeg Output:", stdout.decode())

        if not os.path.exists(hls_stream_path) or not os.path.exists(mp4_output_path):
            socketio.emit("stream_error", {"camera_id": camera.id, "message": "Failed to create HLS or MP4 stream file"}, broadcast=True)
            return jsonify({"error": "Failed to create HLS or MP4 stream file"}), 500

        camera.status = "active"
        db.session.commit()

        socketio.emit("stream_ready", {"camera_id": camera.id, "message": "HLS streaming is ready"}, broadcast=True)
        return jsonify({"message": f"HLS streaming and MP4 saving started for camera ID {camera.id}"}), 200
    except Exception as e:
        socketio.emit("stream_error", {"camera_id": camera.id, "message": f"Failed to start HLS: {str(e)}"}, broadcast=True)
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
