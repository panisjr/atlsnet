from flask import Blueprint, jsonify, request
from datetime import datetime
from extensions import db
from models import *
import re
import jwt
import pytz
from sqlalchemy import case
import time
week_plan_routes = Blueprint("week_plan_routes", __name__)

# Assume you have your database models and configurations here
local_tz = pytz.timezone("Asia/Manila")

@week_plan_routes.route("/get_weekPlan", methods=["GET"])
def get_week_plan():
    week_plans = WeekPlan.query.all()
    results = []

    for plan in week_plans:
        intersection = Intersection.query.get(plan.intersection_id)

        # Check if traffic_light_id is not None before querying TrafficLightSetting
        traffic_light_setting = (
            TrafficLightSetting.query.get(plan.traffic_light_id)
            if plan.traffic_light_id is not None else None
        )
        print(traffic_light_setting)
        camera_info = None  # Initialize camera_info
        # Fetch camera information if traffic_light_setting and camera_id exist
        if traffic_light_setting:
            print("Traffic Light Setting:", traffic_light_setting)
            if traffic_light_setting.camera_id:
                camera_info = Camera.query.get(traffic_light_setting.camera_id)
                if camera_info:
                    print("Camera Info Found:", camera_info.id, camera_info.name)
                else:
                    print("No Camera Info Found for Camera ID:", traffic_light_setting.camera_id)
            else:
                print("Traffic Light Setting has no Camera ID")

        # Fetch all traffic lights for the same day if traffic_light_setting exists
        same_day_traffic_lights = (
            TrafficLightSetting.query.filter_by(day=traffic_light_setting.day).all()
            if traffic_light_setting else []
        )
        
        results.append(
            {
                "week_plan_id": plan.id,
                "intersection_id": intersection.id,
                "intersection_name": intersection.intersection_name if intersection else None,
                "traffic_light_id": traffic_light_setting.id if traffic_light_setting else None,
                "camera_id": traffic_light_setting.camera_id if traffic_light_setting else None,
                "camera_info": {
                    "camera_id": camera_info.id if camera_info else None,
                    "camera_name": camera_info.name if camera_info else None,
                    "camera_rtsp_url": camera_info.rtsp_url if camera_info else None,
                    "camera_location": camera_info.location if camera_info else None,
                    "camera_status": camera_info.status if camera_info else None,
                } if camera_info else None,  # Include camera information if available
                "current_timer": traffic_light_setting.traffic_light_timer if traffic_light_setting else None,
                "day": traffic_light_setting.day if traffic_light_setting else None,
                "created_at": plan.created_at,
                "modified_at": plan.modified_at,
            }
        )
    return jsonify(results), 200

# GET TRAFFIC LIGHT SETTING
@week_plan_routes.route("/get_trafficLight", methods=["GET"])
def get_traffic_light():
    try:
        # Query all traffic light settings, ordered by a custom sequence
        traffic_lights = TrafficLightSetting.query.order_by(
            case(
                (TrafficLightSetting.traffic_light_name == "North", 1),
                (TrafficLightSetting.traffic_light_name == "South", 2),
                (TrafficLightSetting.traffic_light_name == "East", 3),
                (TrafficLightSetting.traffic_light_name == "West", 4)
            )
        ).all()

        # Prepare results
        results = []
        # Debugging: Print traffic light settings and their traffic_mode
        for light in traffic_lights:
            results.append(
                {
                    "traffic_light_id": light.id,
                    "intersection_id": light.intersection_id,
                    "camera_id": light.camera_id,
                    "day": light.day,
                    "traffic_light_name": light.traffic_light_name,
                    "traffic_light_name_two_way": light.traffic_light_name_two_way,
                    "traffic_light_timer": light.traffic_light_timer,
                    "traffic_mode": light.traffic_mode,
                    "created_at": light.created_at,
                    "modified_at": light.modified_at,
                }
            )

        return jsonify(results), 200
    except Exception as e:
        return (
            jsonify(
                {"error": "An error occurred while retrieving traffic light settings"}
            ),
            500,
        )


# ADD WEEK PLAN
@week_plan_routes.route("/add_weekPlan/<id>", methods=["POST"])
def add_week_plan(id):
    try:
        data = request.get_json()
        selected_intersection = data.get("selected_intersection")
        selectedCameraId = data.get("selectedCameraId")
        new_time = data.get("time")
        new_traffic_mode = data.get("traffic_mode")

        # Validate `selectedCameraId`
        camera_id = None
        if selectedCameraId:
            try:
                camera_id = int(selectedCameraId)  # Ensure it is a valid integer
                # Validate that the camera ID exists in the database
                camera = Camera.query.get(camera_id)
                if not camera:
                    return jsonify({"error": "Selected camera does not exist."}), 400
            except (ValueError, TypeError):
                return jsonify({"error": "Invalid camera ID format."}), 400

        # Validate intersection
        intersection = Intersection.query.filter_by(id=selected_intersection).one_or_none()
        if not intersection:
            return jsonify({"error": "The selected intersection does not exist!"}), 400

        # Validate time format
        if new_traffic_mode == "Static":
            if not re.match(r"^[0-9]{2}:[0-9]{2} - [0-9]{2}:[0-9]{2} : \d+$", new_time):
                return jsonify({"error": "Invalid time format. Use HH:MM - HH:MM : Timer format"}), 400
        elif new_traffic_mode == "Dynamic":
            if not re.match(r"^[0-9]{2}:[0-9]{2} - [0-9]{2}:[0-9]{2}$", new_time):
                return jsonify({"error": "Invalid time format. Use HH:MM - HH:MM format"}), 400

        # Check if a WeekPlan already exists for the intersection
        existing_week_plan = WeekPlan.query.filter_by(intersection_id=id).one_or_none()
        if existing_week_plan:
            return jsonify({"error": "This intersection already has a plan for the selected day!"}), 401

        # Create the new TrafficLightSetting
        new_traffic_light = TrafficLightSetting(
            intersection_id=intersection.id,
            camera_id=camera_id,
            day=data.get("day"),
            traffic_light_name=data.get("traffic_light_name"),
            traffic_light_name_two_way=data.get("traffic_light_name_two_way"),
            traffic_light_timer=new_time,
            traffic_mode=new_traffic_mode,
            created_at=datetime.now(),
            modified_at=datetime.now(),
        )
        db.session.add(new_traffic_light)
        db.session.commit()

        # Create the WeekPlan
        new_week_plan = WeekPlan(
            intersection_id=intersection.id,
            traffic_light_id=new_traffic_light.id,
            created_at=datetime.now(),
            modified_at=datetime.now(),
        )
        db.session.add(new_week_plan)
        db.session.commit()

        return jsonify({"message": "Week Plan added successfully!"}), 200

    except Exception as e:
        db.session.rollback()
        print("Error occurred: ", str(e))  # Log the error
        return jsonify({"error": f"An error occurred while creating the week plan: {str(e)}"}), 500

@week_plan_routes.route("/set_trafficLight/<int:id>", methods=["POST"])
def set_traffic_light(id):
    data = request.get_json()
    new_time = data.get("time")
    new_day = data.get("day")
    new_traffic_mode = data.get("traffic_mode")
    new_traffic_light_name = data.get("traffic_light_name")
    new_traffic_light_name_two_way = data.get("traffic_light_name_two_way")
    selected_camera_id = data.get("selectedCameraId")

    # Ensure traffic light names are null if they don't contain data
    if not new_traffic_light_name:  # Empty or None will be evaluated as False
        new_traffic_light_name = None

    if not new_traffic_light_name_two_way:  # Same check for two-way
        new_traffic_light_name_two_way = None


    # Convert `selected_camera_id` to `None` if it's an empty string or invalid
    if selected_camera_id in [None, "", 0]:
        camera_id = None
    else:
        try:
            camera_id = int(selected_camera_id)
            # Validate that the camera ID exists in the Camera table
            camera = Camera.query.get(camera_id)
            if not camera:
                return jsonify({"error": "Selected camera does not exist."}), 400
        except ValueError:
            return jsonify({"error": "Invalid camera ID format."}), 400

    # Validate time format based on traffic mode
    if new_traffic_mode == "Static":
        if not re.match(r"^[0-9]{2}:[0-9]{2} - [0-9]{2}:[0-9]{2} : \d+$", new_time):
            return jsonify({"error": "Invalid time format. Use HH:MM - HH:MM : Timer format"}), 400
    elif new_traffic_mode == "Dynamic":
        if not re.match(r"^[0-9]{2}:[0-9]{2} - [0-9]{2}:[0-9]{2}$", new_time):
            return jsonify({"error": "Invalid time format. Use HH:MM - HH:MM format"}), 400

    # Parse start and end times from the new time range
    time_match = re.match(r"^([0-9]{2}:[0-9]{2}) - ([0-9]{2}:[0-9]{2})", new_time)
    if not time_match:
        return jsonify({"error": "Failed to parse time range."}), 400
    new_start_time, new_end_time = time_match.groups()

    # Check for existing traffic light with conflicting modes within the same time range
    traffic_lights = TrafficLightSetting.query.filter_by(intersection_id=id, day=new_day).all()
    for traffic_light in traffic_lights:
        # Parse start and end times for existing traffic light
        existing_match = re.match(r"^([0-9]{2}:[0-9]{2}) - ([0-9]{2}:[0-9]{2})", traffic_light.traffic_light_timer)
        if existing_match:
            existing_start_time, existing_end_time = existing_match.groups()
            
            # Check for overlap in time range
            if (
                new_start_time < existing_end_time and 
                new_end_time > existing_start_time
            ):
                if (
                    new_traffic_mode == "Dynamic" and traffic_light.traffic_mode == "Static" or 
                    new_traffic_mode == "Static" and traffic_light.traffic_mode == "Dynamic"
                ):
                    return jsonify({
                        "error": f"Cannot set {new_traffic_mode} mode within the time range "
                                 f"{existing_start_time} - {existing_end_time}, which is set to "
                                 f"{traffic_light.traffic_mode} mode."
                    }), 409
        if new_traffic_light_name:
            if (traffic_light.traffic_light_name == new_traffic_light_name and 
            traffic_light.day == new_day and 
            traffic_light.traffic_mode == new_traffic_mode):
                return jsonify({"error": "Traffic Light with this name is already set!"}), 409

        if new_traffic_light_name_two_way:
            if (traffic_light.traffic_light_name_two_way == new_traffic_light_name_two_way and 
            traffic_light.day == new_day and 
            traffic_light.traffic_mode == new_traffic_mode):
                return jsonify({"error": "Traffic Light with this name is already set!"}), 409



    try:
        # Create a new traffic light setting
        new_traffic_light = TrafficLightSetting(
            intersection_id=id,
            camera_id=camera_id,
            day=new_day,
            traffic_light_name=new_traffic_light_name,
            traffic_light_name_two_way=new_traffic_light_name_two_way,
            traffic_light_timer=new_time,
            traffic_mode=new_traffic_mode,
            created_at=datetime.now(),
            modified_at=datetime.now(),
        )
        db.session.add(new_traffic_light)
        db.session.commit()

        # Update WeekPlan with the new traffic_light_id if WeekPlan exists
        week_plan = WeekPlan.query.get(id)
        if week_plan:
            week_plan.traffic_light_id = new_traffic_light.id
            db.session.commit()

        return jsonify({"message": "Traffic light added and WeekPlan updated!"}), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"An error occurred: {str(e)}"}), 500

@week_plan_routes.route("/update_weekPlan/<int:id>", methods=["PUT"])
def update_intersection(id):
    token = request.headers.get("Authorization")
    if not token:
        return jsonify({"error": "Token is missing"}), 401
    
    try:
        intersection = Intersection.query.filter_by(id=id).one_or_none()
        if not intersection:
            return jsonify({"error": "Intersection not found"}), 404

        data = request.get_json()
        intersection.intersection_name = data.get(
            "intersection_name", intersection.intersection_name
        )
        intersection.modified_at = datetime.now()

        db.session.commit()
        return jsonify({"message": "Intersection updated successfully"}), 200

    except jwt.ExpiredSignatureError:
        return jsonify({"error": "Token has expired!"}), 401
    except jwt.InvalidTokenError:
        return jsonify({"error": "Invalid token!"}), 401
    except Exception as e:
        db.session.rollback()
        return (
            jsonify({"error": "An error occurred while updating the intersection!"}),
            500,
        )


# DELETE WEEK PLAN
@week_plan_routes.route("/delete_weekPlan/<id>", methods=["DELETE"])
def delete_week_plan(id):
    token = request.headers.get("Authorization")
    if not token:
        return jsonify({"error": "Token is missing"}), 401
    try:
        week_plan = WeekPlan.query.filter_by(id=id).one_or_none()
        if not week_plan:
            return jsonify({"error": "Week Plan not found!"}), 404

        if week_plan.traffic_light_id:
            return (
                jsonify(
                    {
                        "error": "This week plan has data! Make sure it don't have any data."
                    }
                ),
                409,
            )
        db.session.delete(week_plan)
        db.session.commit()
        return jsonify({"message": "Week Plan deleted successfully!"}), 200
    except jwt.ExpiredSignatureError:
        return jsonify({"error": "Token has expired!"}), 401
    except jwt.InvalidTokenError:
        return jsonify({"error": "Invalid token!"}), 401
    except Exception as e:
        db.session.rollback()
        return (
            jsonify({"error": "An error occurred while deleting the week plan!"}),
            500,
        )
