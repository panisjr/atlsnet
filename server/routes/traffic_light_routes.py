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
    new_day = data.get("day")
    new_traffic_mode = data.get("traffic_mode")
    new_traffic_light_name = data.get("traffic_light_name")
    selected_camera_id = data.get("selectedCameraId")

    # Check if traffic light exists
    traffic_light = TrafficLightSetting.query.filter_by(id=id).one_or_none()
    if not traffic_light:
        return jsonify({"error": "Traffic Light not found"}), 404

    # Convert `selected_camera_id` to `None` if it's invalid
    if selected_camera_id in [None, "", 0]:
        camera_id = None
    else:
        try:
            camera_id = int(selected_camera_id)
            camera = Camera.query.get(camera_id)
            if not camera:
                return jsonify({"error": "Selected camera does not exist."}), 400
        except ValueError:
            return jsonify({"error": "Invalid camera ID format."}), 400
    
    # Validate time format based on mode
    if new_traffic_mode == "Static":
        if not re.match(r"^[0-9]{2}:[0-9]{2} - [0-9]{2}:[0-9]{2} : \d+$", new_time):
            return jsonify({"error": "Invalid static time format. Use HH:MM - HH:MM : Timer format"}), 400
    elif new_traffic_mode == "Dynamic":
        if not re.match(r"^[0-9]{2}:[0-9]{2} - [0-9]{2}:[0-9]{2}$", new_time):
            return jsonify({"error": "Invalid dynamic time format. Use HH:MM - HH:MM format"}), 400

    # Parse start and end times from the new time range
    time_match = re.match(r"^([0-9]{2}:[0-9]{2}) - ([0-9]{2}:[0-9]{2})", new_time)
    if not time_match:
        return jsonify({"error": "Failed to parse time range."}), 400
    new_start_time, new_end_time = time_match.groups()

    # Check for overlapping time ranges on the same day and mode
    traffic_lights = TrafficLightSetting.query.filter_by(intersection_id=id, day=new_day, traffic_mode=new_traffic_mode).all()
    for existing_light in traffic_lights:
        if existing_light.traffic_mode == "Static":
            existing_match = re.match(r"^([0-9]{2}:[0-9]{2}) - ([0-9]{2}:[0-9]{2}) : \d+", existing_light.traffic_light_timer)
        else:
            existing_match = re.match(r"^([0-9]{2}:[0-9]{2}) - ([0-9]{2}:[0-9]{2})", existing_light.traffic_light_timer)
        
        if existing_match:
            existing_start_time, existing_end_time = existing_match.groups()
            
            # Check for any overlap within the time ranges
            if (
                (new_start_time <= existing_end_time and new_end_time >= existing_start_time) or
                (new_start_time == existing_start_time and new_end_time == existing_end_time)
            ):
                return jsonify({
                    "error": f"Cannot set time {new_start_time} - {new_end_time}. It conflicts with an existing time range "
                             f"{existing_start_time} - {existing_end_time} set to {existing_light.traffic_mode} mode."
                }), 409

    # # Prevent duplicate traffic light names on the same day and mode
    # if any(existing_light.traffic_light_name == new_traffic_light_name and
    #        existing_light.day == new_day and
    #        existing_light.traffic_mode == new_traffic_mode
    #        for existing_light in traffic_lights):
    #     return jsonify({"error": "Traffic Light with this name and mode already set!"}), 409

    try:
        # Create a new TrafficLightSetting instance
        new_timer_setting = TrafficLightSetting(
            intersection_id=traffic_light.intersection_id,
            camera_id=camera_id,
            day=new_day,
            traffic_light_name=new_traffic_light_name,
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

