from flask import Flask
from flask_socketio import SocketIO
from ultralytics import YOLO
from ultralytics.solutions import object_counter
import cv2
import time
import base64
import numpy as np

app = Flask(__name__)
socketio = SocketIO(app, cors_allowed_origins="*")

# Initialize YOLO model
model = YOLO("yolov8n.pt")

# Define region points as a polygon with 5 points
region_points = [
    (400, 190),
    (1105, 520),
    (990, 680),
    (220, 239),
    (400, 190),  # Closing the polygon
]

# Initialize Object Counter
counter = object_counter.ObjectCounter(names=model.names)

def generate_frames():
    cap = cv2.VideoCapture(0)
    while cap.isOpened():
        success, im0 = cap.read()
        if not success:
            break

        # Perform object detection and get tracks
        tracks = model.track(im0, persist=True, show=False)

        # Loop through detected tracks for counting logic
        for track in tracks:
            # Check if the track contains necessary data
            if len(track) < 4:
                print("Track does not contain enough values:", track)
                continue  # Skip this track if it does not have enough data
            
            # Extract bounding box coordinates
            x1, y1, x2, y2 = track[0], track[1], track[2], track[3]  # Assuming track has these values

            center_x = (x1 + x2) // 2
            center_y = (y1 + y2) // 2
            point = (center_x, center_y)

            # Check if the center of the bounding box is inside the polygon
            if cv2.pointPolygonTest(np.array(region_points), point, False) >= 0:
                # Object is inside the polygon
                # Implement your counting logic here
                pass  # Replace with counting logic if needed

        # Perform object counting
        im0 = counter.start_counting(im0, tracks)

        # Draw the polygon on the frame
        cv2.polylines(im0, [np.array(region_points)], isClosed=True, color=(0, 255, 0), thickness=2)

        # Encode frame to JPEG and then to Base64
        ret, buffer = cv2.imencode('.jpg', im0)
        frame = base64.b64encode(buffer).decode('utf-8')

        # Emit the Base64-encoded frame
        socketio.emit('video_frame', frame)

        # Control frame rate
        time.sleep(1 / 30)  # 30 FPS

    cap.release()


@socketio.on('connect')
def handle_connect():
    socketio.start_background_task(generate_frames)

if __name__ == "__main__":
    socketio.run(app, host="0.0.0.0", port=5000)
