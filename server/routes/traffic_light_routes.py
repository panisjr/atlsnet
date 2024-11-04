from flask import Blueprint, jsonify, request
from datetime import datetime, timedelta
from werkzeug.security import generate_password_hash, check_password_hash
import jwt
from extensions import db  # Ensure this is after the initializations in app.py
from models import *
import re

traffic_light_routes = Blueprint("traffic_light_routes", __name__)


# DELETE TRAFFIC LIGHT
@traffic_light_routes.route("/delete_trafficLight/<id>", methods=["DELETE"])
def delete_intersection(id):
    token = request.headers.get("Authorization")
    if not token:
        return jsonify({"error": "Token is missing"}), 401
    try:
        trafficLight = TrafficLightSetting.query.filter_by(id=id).one_or_none()
        if not trafficLight:
            return jsonify({"error": "Traffic Light not found!"}), 404
        db.session.delete(trafficLight)
        db.session.commit()
        return jsonify({"message": "Traffic Light deleted successfully!"}), 200
    except jwt.ExpiredSignatureError:
        return jsonify({"error": "Token has expired!"}), 401
    except jwt.InvalidTokenError:
        return jsonify({"error": "Invalid token!"}), 401
    except Exception as e:
        db.session.rollback()
        return (
            jsonify({"error": "An error occurred while deleting the traffic light!"}),
            500,
        )


@traffic_light_routes.route("/update_trafficLight/<int:id>", methods=["PUT"])
def update_intersection(id):
    token = request.headers.get("Authorization")
    if not token:
        return jsonify({"error": "Token is missing"}), 401

    try:
        trafficLight = TrafficLightSetting.query.filter_by(id=id).one_or_none()
        if not trafficLight:
            return jsonify({"error": "Traffic Light not found"}), 404

        data = request.get_json()
        trafficLight.traffic_light_timer = data.get(
            "traffic_light_timer", trafficLight.traffic_light_timer
        )
        trafficLight.modified_at = datetime.now()

        db.session.commit()
        return jsonify({"message": "Traffic Light updated successfully"}), 200

    except jwt.ExpiredSignatureError:
        return jsonify({"error": "Token has expired!"}), 401
    except jwt.InvalidTokenError:
        return jsonify({"error": "Invalid token!"}), 401
    except Exception as e:
        db.session.rollback()
        return (
            jsonify({"error": "An error occurred while updating the traffic light!"}),
            500,
        )


@traffic_light_routes.route("/add_trafficLight/<int:id>/time", methods=["POST"])
def set_timer(id):
    data = request.get_json()
    new_time = data.get("time")
    new_traffic_mode = data.get("traffic_mode")
    camera_id = data.get("selectedCameraId")
    print(camera_id)
    traffic_light = TrafficLightSetting.query.filter_by(id=id).one_or_none()
    if not traffic_light:
        return jsonify({"error": "Traffic Light not found"}), 404

    # Validate time format
    if new_traffic_mode == "Static":
        if not re.match(r"^[0-9]{2}:[0-9]{2} - [0-9]{2}:[0-9]{2} : \d+$", new_time):
            return jsonify({"error": "Invalid time format. Use HH:MM - HH:MM : Timer format"}), 400
    elif new_traffic_mode == "Dynamic":
        if not re.match(r"^[0-9]{2}:[0-9]{2} - [0-9]{2}:[0-9]{2}$", new_time):
            return jsonify({"error": "Invalid time format. Use HH:MM - HH:MM format"}), 400

    # Check for duplicates
    existing_timer = TrafficLightSetting.query.filter_by(
        intersection_id=id,
        traffic_light_timer=new_time,
        traffic_mode=new_traffic_mode
    ).one_or_none()

    if existing_timer:
        return jsonify({"error": "The time is already set!"}), 401

    try:
        # Create a new TrafficLightSetting instance
        new_timer_setting = TrafficLightSetting(
            intersection_id=traffic_light.intersection_id,
            camera_id=traffic_light.camera_id,
            day=traffic_light.day,
            traffic_light_name=traffic_light.traffic_light_name,
            traffic_light_timer=new_time,
            traffic_mode=new_traffic_mode
        )
        
        # Add and commit to the database
        db.session.add(new_timer_setting)
        db.session.commit()

        return jsonify({"message": "New timer set successfully!"}), 201
    except Exception as e:
        db.session.rollback()
        print(f"Error: {str(e)}")  # Log the exception details
        return jsonify({"error": "An error occurred while adding the new timer"}), 500

@traffic_light_routes.route("/add_camera", methods=["POST"])
def add_camera():
    data = request.get_json()

    if not data:
        return jsonify({"error": "No data provided!"}), 400

    name = data.get("name")
    rtsp_url = data.get("rtsp_url")
    location = data.get("location")

    print("Name:", name, "RTSP URL:", rtsp_url, "Location:", location)
    # Check if name or rtsp_url is missing
    if not name or not rtsp_url:
        return jsonify({"error": "Name and RTSP URL are required!"}), 400

    # Add new camera to the database
    new_camera = Camera(name=name, rtsp_url=rtsp_url, location=location)
    db.session.add(new_camera)
    db.session.commit()

    return jsonify({"message": "Camera added successfully!"}), 200

