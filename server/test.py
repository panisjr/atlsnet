from flask import Flask, Response, send_from_directory
from flask_cors import CORS
from flask_socketio import SocketIO
import os
import subprocess
import time
import cv2
from ultralytics import YOLO  # Assuming you are using the ultralytics library for YOLO

app = Flask(__name__)
CORS(app)
socketio = SocketIO(app, cors_allowed_origins="*")

RTSP_URL = "rtsp://tapooc200North:tapooc200cctvcameraramz@192.168.100.25:554/stream1"  # Replace with your RTSP URL
STREAM_DIR = "stream"
M3U8_PATH = os.path.join(STREAM_DIR, "stream.m3u8")

# Ensure the stream directory exists
os.makedirs(STREAM_DIR, exist_ok=True)

# Initialize the YOLO model
model = YOLO("yolov9m.pt")  # Replace with the path to your YOLO model
print(model.names)  # Check that "car" and "person" are correctly labeled

# Start streaming with FFmpeg
def start_streaming():
    try:
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
    except Exception as e:
        print(f"Error starting FFmpeg stream: {e}")



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

# Object detection and counting function
def send_real_time_updates():
    cap = cv2.VideoCapture(RTSP_URL)  # Open the RTSP stream
    while True:
        ret, frame = cap.read()
        if not ret:
            print("Failed to read frame. Reconnecting in 3 seconds...")
            cap.release()
            time.sleep(3)
            cap = cv2.VideoCapture(RTSP_URL)
            continue

        # Perform object detection
        results = model(frame)  # Run inference on the frame
        object_counts = {"car": 0, "person": 0}

        # Iterate over the results
        for result in results:
            # Check if boxes attribute exists
            if hasattr(result, 'boxes'):
                for box in result.boxes:
                    class_index = int(box.cls)  # Get the class index
                    class_name = model.names[class_index]  # Get the class name
                    if class_name == "car":
                        object_counts["car"] += 1
                    elif class_name == "person":
                        object_counts["person"] += 1

        # Emit object counts to the client
        socketio.emit("update_message", {
            "message": f"Live update: Cars: {object_counts['car']}, People: {object_counts['person']}",
            "object_counts": object_counts
        })

        # Optional: Display the frame with bounding boxes
        # for box in result.boxes:
        #     x1, y1, x2, y2 = box.xyxy  # Get bounding box coordinates
        #     cv2.rectangle(frame, (int(x1), int(y1)), (int(x2), int(y2)), (255, 0, 0), 2)  # Draw rectangle
        #     cv2.putText(frame, model.names[int(box.cls)], (int(x1), int(y1) - 5), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 0, 0), 2)

        # Show frame (uncomment if you want to see the video feed)
        # cv2.imshow("Detected Objects", frame)
        # if cv2.waitKey(1) & 0xFF == ord('q'):
        #     break

        # Sleep briefly to control update frequency
        time.sleep(1)  # Adjust the sleep time as needed for real-time updates

    cap.release()
    cv2.destroyAllWindows()  # Clean up OpenCV windows


if __name__ == "__main__":
    socketio.start_background_task(send_real_time_updates)
    socketio.run(app, host="0.0.0.0", port=5000, debug=True)
