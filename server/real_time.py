from flask import Flask, Response, send_from_directory
from flask_cors import CORS
from flask_socketio import SocketIO
import os
import subprocess
import time

app = Flask(__name__)
CORS(app)
socketio = SocketIO(app, cors_allowed_origins="*")

RTSP_URL = "rtsp://c200North:c200North@192.168.153.165:554/stream1"  # Replace with your RTSP URL

STREAM_DIR = "stream"
M3U8_PATH = os.path.join(STREAM_DIR, "stream.m3u8")

# Ensure the stream directory exists
os.makedirs(STREAM_DIR, exist_ok=True)


def start_streaming():
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
    ]
    subprocess.Popen(command)


start_streaming()

@app.route("/stream.m3u8")
def stream():
    return send_from_directory(STREAM_DIR, "stream.m3u8")


@app.route("/<path:filename>")
def send_hls(filename):
    return send_from_directory(STREAM_DIR, filename)


@socketio.on("connect")
def handle_connect():
    print("Client connected")


def send_real_time_updates():
    while True:
        socketio.emit("update_message", {"message": "Live update from the server"})
        time.sleep(10)


if __name__ == "__main__":
    socketio.start_background_task(send_real_time_updates)
    socketio.run(app, host="0.0.0.0", port=5000, debug=True)