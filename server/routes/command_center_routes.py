from flask import Blueprint, jsonify, request, send_from_directory
import os
import subprocess
from extensions import db
from models import Camera

command_center_routes = Blueprint("command_center_routes", __name__)

UPLOAD_FOLDER = 'hls'  # Main folder to store HLS streams
os.makedirs(UPLOAD_FOLDER, exist_ok=True)  # Ensure the main HLS folder exists

@command_center_routes.route("/videos/start_hls/<int:camera_id>", methods=["POST"])
def start_hls(camera_id):
    camera = Camera.query.get(camera_id)
    if not camera:
        return jsonify({"error": "Camera not found"}), 404

    # Create directory for the specific camera's HLS stream
    camera_hls_dir = os.path.join(UPLOAD_FOLDER, str(camera.id))
    os.makedirs(camera_hls_dir, exist_ok=True)  # Create camera-specific folder if it doesn't exist

    hls_stream_path = os.path.join(camera_hls_dir, "stream.m3u8")
    mp4_output_path = os.path.join(camera_hls_dir, "stream.mp4")

    # RTMP URL for live remote access
    rtmp_url = f"rtmp://3.107.195.194/live/camera"  # Replace <ec2_public_ip> with your EC2's public IP or domain

    # Command to convert RTSP to HLS, save to MP4, and stream to RTMP using FFmpeg
    command = [
        "ffmpeg",
        "-i", camera.rtsp_url,              # Input RTSP URL
        "-c:v", "libx264",                  # Video codec
        "-preset", "ultrafast",             # Adjust preset for speed
        "-crf", "28",                       # Compression level
        "-tune", "zerolatency",             # Optimize for real-time streaming
        "-f", "hls",                        # Output format: HLS
        "-hls_time", "10",                  # Segment duration in seconds
        "-hls_list_size", "10",             # Number of segments to keep
        "-hls_flags", "delete_segments",    # Delete old segments
        hls_stream_path,                    # Output HLS playlist path
        "-c:v", "copy",                     # Copy video codec for MP4
        "-c:a", "aac",                      # Audio codec for MP4
        "-movflags", "+faststart",          # Optimize MP4 for playback
        mp4_output_path,                    # Output MP4 file path
        "-f", "flv",                        # Output format for RTMP
        rtmp_url                            # Output RTMP URL
    ]

    try:
        process = subprocess.Popen(command, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        stdout, stderr = process.communicate()

        # Log any FFmpeg output for debugging
        if stderr:
            print("FFmpeg Error:", stderr.decode())
        if stdout:
            print("FFmpeg Output:", stdout.decode())

        # Check if the stream.m3u8 file and MP4 file were created
        if not os.path.exists(hls_stream_path) or not os.path.exists(mp4_output_path):
            return jsonify({"error": "Failed to create HLS or MP4 stream file"}), 500

        camera.status = "active"  # Update camera status
        db.session.commit()
        return jsonify({"message": f"HLS and RTMP streaming started for camera ID {camera.id}"}), 200
    except Exception as e:
        return jsonify({"error": f"Failed to start HLS and RTMP streaming: {str(e)}"}), 500



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
