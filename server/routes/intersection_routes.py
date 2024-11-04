from flask import Blueprint, jsonify, request
from datetime import datetime
from extensions import db
from models import *
import jwt

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
