import serial.tools.list_ports
import requests  # To make HTTP requests to your Flask API
from flask import Blueprint, jsonify, request
from datetime import datetime
from extensions import db
from models import *  # Assuming your Video model is defined in models.py
import jwt
import re
import os
from sqlalchemy import case

pyduino_routes = Blueprint("pyduino_routes", __name__)

# Global variable to store serial connection
serialInst = None
use = None

# Initialize available ports and COM port selection
def initialize_serial_connection():
    global serialInst, use
    if serialInst and serialInst.is_open:
        print("Serial connection is already open.")
        return

    # List available ports
    ports = serial.tools.list_ports.comports()
    portsList = [str(one) for one in ports]
    
    # Automatically get COM port (e.g., COM3)
    com = '3'  # Use COM3 as default if no port is provided
    for port in portsList:
        if port.startswith("COM" + str(com)):
            use = "COM" + str(com)
            break

    if not use:
        print(f"Error: COM{com} not found in available ports.")
        return
    
    # Open serial connection
    try:
        serialInst = serial.Serial()
        serialInst.baudrate = 9600
        serialInst.port = use
        serialInst.open()
        print(f"Serial connection established on {use}.")
    except Exception as e:
        print(f"Failed to open port: {str(e)}")

# Automatically initialize the serial connection before the first request is processed
@pyduino_routes.before_app_request
def auto_initialize_serial():
    if not serialInst or not serialInst.is_open:
        initialize_serial_connection()

import time  # Import time for sleep functionality

@pyduino_routes.route('/set-green-timer', methods=['POST'])
def set_green_timer():
    # Ensure there's an open serial connection before proceeding
    if not serialInst or not serialInst.is_open:
        return jsonify({"error": "Serial connection not available"}), 500

    # Get the data sent from the frontend
    data = request.json
    lights_data = data.get('lights', [])
    
    if not lights_data:
        return jsonify({"error": "No traffic light data provided"}), 400

    # Sort the lights_data by green_timer in descending order
    lights_data.sort(key=lambda x: x.get('timer', 0), reverse=True)

    for light_data in lights_data:
        intersection_id = light_data.get("intersection_id")
        light_name = light_data.get('traffic_light_name')
        traffic_mode = light_data.get('traffic_mode')
        green_timer = light_data.get('timer')
        # Validate input data for each light
        if not isinstance(intersection_id, int):
            return jsonify({"error": f"Invalid intersection ID for {light_name}"}), 400
        if traffic_mode not in ["Static", "Dynamic"]:
            return jsonify({"error": f"Invalid traffic mode for {light_name}"}), 400
        if not light_name or not (0 <= green_timer <= 120):  # Example timer range (0-120 seconds)
            return jsonify({"error": f"Invalid light name or timer value for {light_name}"}), 400

        try:
            # Prepare the message to send to Arduino
            message = f"Intersection:{intersection_id},Light:{light_name},Mode:{traffic_mode},Green:{green_timer}\\n"
            
            # Send the message to the Arduino
            serialInst.write(message.encode())  # Send message to Arduino
            print(f"Sent to Arduino: {message}")

            # Wait for the green timer to countdown
            time.sleep(green_timer + 3)  # Sleep for the green timer duration before sending the next light data

        except Exception as e:
            print(f"Error sending to Arduino. Data: {light_data}, Error: {str(e)}")
            return jsonify({"error": f"Failed to send data for {light_name} to Arduino"}), 500

    # Return a successful response after processing all lights
    return jsonify({"message": "Green Timers sent successfully", "sent_lights": lights_data}), 200



# GET TRAFFIC LIGHT SETTING
@pyduino_routes.route("/get_trafficLight", methods=["GET"])
def get_traffic_light():
    try:
        traffic_lights = TrafficLightSetting.query.order_by(TrafficLightSetting.id.asc()).all()
        results = [
            {
                "traffic_light_id": light.id,
                "intersection_id": light.intersection_id,
                "day": light.day,
                "traffic_light_name": light.traffic_light_name,
                "traffic_light_timer": light.traffic_light_timer,
                "traffic_mode": light.traffic_mode,
                "created_at": light.created_at,
            }
            for light in traffic_lights
        ]
        return jsonify(results), 200
    except Exception as e:
        return jsonify({"error": "An error occurred while retrieving traffic light settings"}), 500
    
def format_videos(video):
    return {
        "id": video.id,
        "camera_id": video.camera_id,
        "in_counts": video.in_counts,
        "out_counts": video.out_counts,
        # "filename": f"{request.host_url}static/Videos/{video.filename}",
        "filename": video.filename,
        "created_at": video.created_at,
    }
@pyduino_routes.route("/get_videos", methods=["GET"])
def get_videos():
    try:
        videos = Video.query.order_by(Video.id.asc()).all()
        video_urls = [format_videos(video) for video in videos]
        return jsonify(video_urls), 200
    except Exception as e:
        return jsonify({"error": "Can't get the videos!"}), 500
    
# Close the serial connection when the pyduino_routes shuts down
# @pyduino_routes.teardown_appcontext
# def close_serial_connection(exception):
#     global serialInst
#     if serialInst and serialInst.is_open:
#         serialInst.close()
#         print("Serial connection closed.")