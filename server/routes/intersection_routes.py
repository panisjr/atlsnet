from flask import Blueprint, jsonify, request
from datetime import datetime
from extensions import db
from models import *
import jwt
import re
intersection_routes = Blueprint('intersection_routes', __name__)

# GET INTERSECTIONS
@intersection_routes.route('/get_intersections', methods=['GET'])
def get_intersections():
    roads = Intersection.query.order_by(Intersection.id.asc()).all()

    road_list = []
    for road in roads:
        road_data = {
            'id': road.id,
            'intersection_name': road.intersection_name,
            'road_name': road.road_name,
            'created_at': road.created_at.strftime('%Y-%m-%d %H:%M:%S'),
            'modified_at': road.modified_at.strftime('%Y-%m-%d %H:%M:%S')
        }
        road_list.append(road_data)

    return jsonify(road_list), 200

# ADD INTERSECTION
def format_cameras(camera):
    return {
        "id": camera.id,
        "name": camera.name,
        "rtsp_url": camera.rtsp_url,
        "location": camera.location,
        "status": camera.status,
        "created_at": camera.created_at,
    }
@intersection_routes.route("/get_cameras", methods=["GET"])
def get_camera():
    try:
        cameras = Camera.query.order_by(Camera.id.asc()).all()
        cameras_url = [format_cameras(camera) for camera in cameras]
        return jsonify(cameras_url), 200
    except Exception as e:
        return jsonify({"error": "Error occurred when getting cameras"}), 500
@intersection_routes.route('/add_intersections', methods=['POST'])
def add_intersection():
    data = request.get_json()
    new_intersection = data['newIntersection']
    intersection = Intersection.query.filter_by(intersection_name=new_intersection).one_or_none()
    if intersection:
        return jsonify({"error": "This intersection already exists!"}), 400
    try:
        new_road = Intersection(
            intersection_name=data['newIntersection'],
            created_at=datetime.now()
        )
        db.session.add(new_road)
        db.session.commit()
        return jsonify({"message": "Intersection added successfully"}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "An error occurred while creating the intersection"}), 500

# DELETE INTERSECTION
@intersection_routes.route('/delete_intersection/<int:id>', methods=['DELETE'])
def delete_intersection(id):
    token = request.headers.get("Authorization")
    if not token:
        return jsonify({"error": "Token is missing"}), 401
    intersection = Intersection.query.filter_by(id=id).one_or_none()
    if not intersection:
        return jsonify({"error": "Intersection not found!"}), 404
    check_intersection_id = WeekPlan.query.filter_by(intersection_id=intersection.id).one_or_none()
    print(intersection.id)
    print("Intersection id from WeekPlan model:", check_intersection_id.intersection_id if check_intersection_id else "Not found")
    if check_intersection_id:
        return jsonify({"error":"This intersection has data! Make sure it don't have any data."}), 409
    try:
        
        db.session.delete(intersection)
        db.session.commit()
        return jsonify({"message": "Intersection deleted successfully!"}), 200
    except jwt.ExpiredSignatureError:
        return jsonify({"error": "Token has expired!"}), 401
    except jwt.InvalidTokenError:
        return jsonify({"error": "Invalid token!"}), 401
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "An error occurred while deleting the intersection!"}), 500

# UPDATE INTERSECTION
@intersection_routes.route('/update_intersections/<int:id>', methods=['PUT'])
def update_intersection(id):
    token = request.headers.get("Authorization")
    if not token:
        return jsonify({"error": "Token is missing"}), 401

    try:
        intersection = Intersection.query.filter_by(id=id).one_or_none()
        if not intersection:
            return jsonify({"error": "Intersection not found"}), 404
        
        data = request.get_json()
        intersection.intersection_name = data.get("intersection_name", intersection.intersection_name)
        intersection.modified_at = datetime.now()

        db.session.commit()
        return jsonify({"message": "Intersection updated successfully"}), 200

    except jwt.ExpiredSignatureError:
        return jsonify({"error": "Token has expired!"}), 401
    except jwt.InvalidTokenError:
        return jsonify({"error": "Invalid token!"}), 401
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "An error occurred while updating the intersection!"}), 500
    

# ADD CAMERA
def validate_rtsp_url(rtsp_url):
    # Regex pattern to match RTSP URL with username, password, IP address, port, and stream path
    rtsp_pattern = r"^rtsp://([a-zA-Z0-9_-]+):([a-zA-Z0-9_-]+)@([a-zA-Z0-9.-]+)(:[0-9]+)?(/.*)?$"
    if re.match(rtsp_pattern, rtsp_url):
        return True
    else:
        return False
@intersection_routes.route("/add_camera", methods=["POST"])
def add_camera():
    data = request.get_json()

    if not data:
        return jsonify({"error": "No data provided!"}), 400
    
    name = data.get("name")
    rtsp_url = data.get("rtsp_url")
    location = data.get("location", "")

    if not name or not rtsp_url or not location:
        return jsonify({"error": "All fields are required! Make sure to fill all the field."}), 400
    
    new_camera = Camera(name=name, rtsp_url=rtsp_url, location=location)
    db.session.add(new_camera)
    db.session.commit()
    
    return jsonify({"message": "Camera added successfully!"})
# DELETE CAMERA
@intersection_routes.route('/delete_camera/<int:camera_id>', methods=['DELETE'])
def delete_camera(camera_id):
    token = request.headers.get("Authorization")
    if not token:
        return jsonify({"error": "Unauthorized! Invalid action!"}), 401
    try:
        # Find the camera by ID
        camera = Camera.query.get(camera_id)
        if camera is None:
            return jsonify({"error": "Camera not found!"}), 404

        # Remove the camera record from the database
        db.session.delete(camera)
        db.session.commit()

        return jsonify({"message": "Camera deleted successfully!"}), 200
    except Exception as e:
        return jsonify({"error": "Error occured while deleting camera!"}), 500
# Edit Camera
@intersection_routes.route("/edit_camera/<int:camera_id>", methods=["PUT"])
def edit_camera(camera_id):
    data = request.get_json()
    if not data:
        return jsonify({"error": "No data provided!"}), 400

    # Validate Authorization Header
    token = request.headers.get("Authorization")
    if not token or not token.startswith("Bearer "):
        return jsonify({"error": "Unauthorized! Invalid action!"}), 401

    # Extract Fields from Request Data
    name = data.get("name")
    rtsp_url = data.get("rtsp_url")
    location = data.get("location")
    status = data.get("status")  # Optional field

    # Validate RTSP URL
    if rtsp_url and not validate_rtsp_url(rtsp_url):  # Define validate_rtsp_url
        return jsonify({"error": "Invalid RTSP URL format!"}), 400

    # Retrieve Camera
    camera = Camera.query.get(camera_id)
    if camera is None:
        return jsonify({"error": "Camera not found!"}), 404

    # Validate Required Fields
    if not name or not rtsp_url or not location:
        return jsonify({"error": "All fields are required! Please fill all the fields."}), 400

    # Update Fields
    camera.name = name
    camera.rtsp_url = rtsp_url
    camera.location = location
    if status is not None:  # Update status if provided
        camera.status = status
    camera.modified_at = datetime.now()

    # Commit Changes
    try:
        db.session.commit()
        return jsonify({"message": "Camera updated successfully"}), 200
    except Exception as e:
        db.session.rollback()  # Rollback in case of error
        return jsonify({"error": f"Error occurred while editing camera: {str(e)}"}), 500

