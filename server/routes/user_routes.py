from flask import Blueprint, jsonify, request
from datetime import datetime, timedelta
from werkzeug.security import generate_password_hash, check_password_hash
import jwt
import os
from extensions import db  # Ensure this is after the initializations in app.py
from models import Users, Video
from sqlalchemy import func, Integer
import re
user_routes = Blueprint("user_routes", __name__)

# Generate a secret key
secret_key = os.urandom(24)


# Format user data for the frontend
def format_user(user):
    return {
        "id": user.id,
        "user_id": user.user_id,
        "firstname": user.firstname,
        "middlename": user.middlename,
        "lastname": user.lastname,
        "email": user.email,
        "contact": user.contact,
        "address": user.address,
        "role": user.role,
        "status": user.status,
        "created_at": user.created_at,
    }
def validate_password(password):
    if len(password) < 8:
        return jsonify({"error": "Password must be at least 8 characters long."}), 400
    
    if not any(char.isupper() for char in password):
        return jsonify({"error": "Password must include at least one uppercase letter."}), 400
    
    if not any(char.islower() for char in password):
        return jsonify({"error": "Password must include at least one lowercase letter."}), 400
    
    if not any(char.isdigit() for char in password):
        return jsonify({"error": "Password must include at least one number."}), 400
    
    if not re.search(r"[!@#$%^&*(),.?\":{}|<>]", password):
        return jsonify({"error": "Password must include at least one special character."}), 400
    
    # If all checks pass
    return None  # No errors
def validate_user_id(user_id):
    """
    Validate the user ID to ensure it contains only numbers and is exactly 8 digits long.
    """
    # Regular expression for numeric user IDs with exactly 8 digits
    user_id_regex = r"^\d{8}$"

    # Validate user ID using regex
    if not re.match(user_id_regex, user_id):
        if not user_id.isdigit():
            return jsonify({"error": "User ID must contain only numbers."}), 400
        elif len(user_id) != 8:
            return jsonify({"error": "User ID must be exactly 8 digits long."}), 400

    return None
# CREATE USER
@user_routes.route("/create_user", methods=["POST"])
def create_users():
    data = request.get_json()
    email = data.get("email")
    user_id = data.get("user_id")
    password = data.get("password")
    contact = data.get("contact")
    firstname = data.get("firstname")
    middlename = data.get("middlename")
    lastname = data.get("lastname")
    address = data.get("address")

    # Check for existing user ID
    new_user_id = Users.query.filter_by(user_id=user_id).first()
    if new_user_id:
        return jsonify({"error": "User ID already exists!"}), 400

    # Validate user id
    error = validate_user_id(user_id)
    if error:
        return error
    
    # Validate Names
    names = {
        "Firstname": firstname,
        "Lastname": lastname,
    }
    if middlename:  # Only validate if middlename is provided
        names["Middlename"] = middlename
    for name_type, name_value in names.items():
        if not re.match(r"^[A-Za-z\s.]+$", name_value):
            return jsonify({"error": f"{name_type} must not contain special characters."}), 400
    
    # Check for existing email
    existing_user = Users.query.filter_by(email=email).first()
    if existing_user:
        return jsonify({"error": "Email already exists!"}), 400
    
    # Validate contact number
    if not re.match(r"^09\d{9}$", contact):
        return jsonify({"error": "Contact number is invalid. Try again!"}), 400

    # Validate address
    if not re.match(r"^[A-Za-z0-9\s,.-]+$", address):
        return jsonify({"error": "Address must contain only letters, numbers, spaces, and basic punctuation."}), 400
    
    # Validate password
    error = validate_password(password)
    if error:
        return error

    # Create new user
    user = Users(
        user_id=user_id,
        firstname=firstname,
        middlename=middlename,
        lastname=lastname,
        email=email,
        password=password,
        contact=contact,
        address=address,
        role=data.get("role"),
        status=data.get("status"),
    )
    try:
        db.session.add(user)
        db.session.commit()
        return jsonify({"message": "User created successfully"}), 201
    except Exception as e:
        db.session.rollback()
        print(f"Error while creating user: {e}")  # Log the error for debugging
        return jsonify({"error": "An error occurred while creating the user"}), 500



@user_routes.route("/get_users", methods=["GET"])
def get_users():
    users = Users.query.order_by(Users.id.asc()).all()
    total_users = Users.query.count()
    users_list = [format_user(user) for user in users]

    # Assuming current date
    today = datetime.now()

    # Calculate the start and end dates for the current and last month
    first_day_current_month = today.replace(day=1)
    last_day_current_month = (first_day_current_month + timedelta(days=31)).replace(day=1) - timedelta(days=1)
    first_day_last_month = first_day_current_month - timedelta(days=first_day_current_month.day)
    last_day_last_month = first_day_current_month - timedelta(days=1)

    # Count users for the current and last month
    current_month_user_count = Users.query.filter(
        Users.created_at.between(first_day_current_month, last_day_current_month)
    ).count()

    last_month_user_count = Users.query.filter(
        Users.created_at.between(first_day_last_month, last_day_last_month)
    ).count()

    # Calculate percentage increase
    if last_month_user_count > 0:
        increase_percentage = (
            (current_month_user_count - last_month_user_count) / last_month_user_count
        ) * 100
    else:
        increase_percentage = 100.0 if current_month_user_count > 0 else 0.0  # 100% increase if no users last month

    # Get today's date at midnight
    today_start = today.replace(hour=0, minute=0, second=0, microsecond=0)

    # Count users registered today
    daily_count = Users.query.filter(Users.created_at >= today_start).count()

    # Get yesterday's date at midnight
    yesterday_start = today_start - timedelta(days=1)

    # Count users registered yesterday
    yesterday_count = Users.query.filter(
        Users.created_at >= yesterday_start, Users.created_at < today_start
    ).count()

    # Calculate percentage increase or decrease
    if yesterday_count > 0:
        result = ((daily_count - yesterday_count) / yesterday_count) * 100
        percentage_today = result / 100 
    else:
        percentage_today = 100.0 if daily_count > 0 else 0.0  # If no users registered yesterday

    # Calculate the total sum of all values in the in_counts column
    total_vehicle_count = Video.query.with_entities(func.sum(func.cast(Video.in_counts, Integer))).scalar() or 0  # If null, default to 0
    yesterday_end = today_start
    # Count users for the current and last month
    # Sum `in_counts` for yesterday
    yesterday_vehicle_count = Video.query.with_entities(
    func.sum(func.cast(Video.in_counts, Integer))).filter(Video.created_at.between(yesterday_start, yesterday_end)).scalar() or 0

    # Calculate percentage increase from yesterday to today
    today_vehicle_count = Video.query.with_entities(
    func.sum(func.cast(Video.in_counts, Integer))).filter(Video.created_at >= today_start).scalar() or 0
    # Calculate the percentage increase or decrease
    if yesterday_vehicle_count > 0:
        result = (
        (today_vehicle_count - yesterday_vehicle_count) / yesterday_vehicle_count) * 100
        vehicle_percentage_today = round(result, 2)  # Round to 2 decimal places
    else:
        vehicle_percentage_today = round(100.0 if today_vehicle_count > 0 else 0.0, 2) 
        
        print("Yesterday vehicle count: ", vehicle_percentage_today)
    return jsonify({
        # Users
        "users": users_list,
        "total_users": total_users,
        "increase_percentage": increase_percentage,
        "daily_count": daily_count,
        "percentage_today": percentage_today,
        # Vehicles
        "total_vehicle_count": total_vehicle_count,
        "today_vehicle_count": today_vehicle_count,
        "vehicle_percentage_today": vehicle_percentage_today,
    }), 200


# GET USER BY ID
@user_routes.route("/get_user/<id>", methods=["GET"])
def get_user(id):
    user = Users.query.filter_by(id=id).one_or_none()
    if user:
        return jsonify({"user": format_user(user)}), 200
    else:
        return jsonify({"error": "User not found"}), 404


# DELETE USER
@user_routes.route("/delete_user/<id>", methods=["DELETE"])
def delete_user(id):
    token = request.headers.get("Authorization")
    if not token:
        return jsonify({"error": "Token is missing"}), 401

    try:
        decoded_token = jwt.decode(token, secret_key, algorithms=["HS256"])
        current_user_id = str(decoded_token.get("id"))

        # Check if the current user is trying to delete their own account
        if current_user_id == id:
            return (
                jsonify(
                    {
                        "error": "You're trying to delete your own account and is currently logged in! Please try again later."
                    }
                ),
                403,
            )

        user = Users.query.filter_by(id=id).one_or_none()
        if not user:
            return jsonify({"error": "User not found!"}), 404

        db.session.delete(user)
        db.session.commit()
        return jsonify({"message": "User deleted successfully!"}), 200
    except jwt.ExpiredSignatureError:
        return jsonify({"error": "Token has expired!"}), 401
    except jwt.InvalidTokenError:
        return jsonify({"error": "Invalid token!"}), 401
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "An error occurred while deleting the user!"}), 500
# UPDATE USER
@user_routes.route("/update_user/<id>", methods=["PUT"])
def update_user(id):
    user = Users.query.filter_by(id=id).one_or_none()
    if not user:
        return jsonify({"error": "User not found"}), 404

    data = request.get_json()  # Corrected this line by adding parentheses
    user_id = data.get("user_id")
    newPassword = data.get("newPassword")
    
    # Validate user ID
    error = validate_user_id(user_id)
    if error:
        return error

    # Check if newPassword is provided and not empty
    if newPassword:  # Only proceed if the field is not empty
        print("New password provided: Validating...")
        error = validate_password(newPassword)
        if error:
            return error
        # If the password is valid, hash and update it
        user.password = generate_password_hash(newPassword)  # Hash and update the password
    else:
        print("Password not updated as newPassword is empty or not provided.")
    
    # Check for email uniqueness only if the email has changed
    if "email" in data and data["email"] != user.email:
        existing_user = Users.query.filter_by(email=data["email"]).first()
        if existing_user:
            return jsonify({"error": "Email already in use!"}), 400
        user.email = data["email"]

    # Update other fields
    user.user_id = data.get("user_id", user.user_id)
    user.firstname = data.get("firstname", user.firstname)
    user.middlename = data.get("middlename", user.middlename)
    user.lastname = data.get("lastname", user.lastname)
    user.contact = data.get("contact", user.contact)
    user.address = data.get("address", user.address)
    user.role = data.get("role", user.role)
    user.modified_at = datetime.now()

    try:
        db.session.commit()
        return jsonify({"message": "User updated successfully"}), 200
    except Exception as e:
        db.session.rollback()
        print(f"Error during commit: {e}")
        return jsonify({"error": "An error occurred while updating the user"}), 500



# LOGIN USER
@user_routes.route("/signIn", methods=["POST"])
def user_login():
    data = request.get_json()
    # Check if email and password are provided
    email = data.get("email")
    password = data.get("password")
    
    if not email or not password:
        return jsonify({"error": "Email and password are required"}), 400

    # Query the user by email
    user = Users.query.filter_by(email=email).first()
    if not user:
        return jsonify({"error": "Invalid email! Make sure you have an account."}), 401
    
    # Check if the account is deactivated
    if user.status == "Deactivated":
        return (
            jsonify({"error": "Account is deactivated. Please contact support."}),
            403,
        )

    # Verify password
    if not check_password_hash(user.password, password):
        return jsonify({"error":"Password is incorrect"}), 401

    if check_password_hash(user.password, password):
        # Generate JWT token
        try:
            token = jwt.encode(
                {
                    "id": user.id,
                    "firstname": user.firstname,
                    "lastname": user.lastname,
                    "email": user.email,
                    "role": user.role,
                    "exp": datetime.utcnow() + timedelta(hours=1),
                },
                secret_key,
                algorithm="HS256",
            )

            return jsonify({"message": "Login successful", "token": token}), 200
        except Exception as e:
            return jsonify({"error": "Token generation failed", "details": str(e)}), 500
    else:
        return jsonify({"error": "Invalid credentials"}), 401


# DEACTIVATE USER
@user_routes.route("/deactivate_user/<id>", methods=["PUT"])
def deactivate_user(id):
    token = request.headers.get("Authorization")
    if not token:
        return jsonify({"error": "Unauthorized Access!"}), 401

    try:
        decoded_token = jwt.decode(token, secret_key, algorithms=["HS256"])
        current_user_id = str(decoded_token.get("id"))

        if current_user_id == id:
            return jsonify({"error": "Invalid! You are can't deactivate your account."}), 403
        user = Users.query.filter_by(id=id).one_or_none()
        if not user:
            return jsonify({"error": "User not found"}), 404
        if user.status == "Deactivated":
            return jsonify({"error": "User is already deactivated"}), 400

        if user.status == "Active":
            user.status = "Deactivated"
            print(user.status)
            db.session.commit()
            return jsonify({"message": "User account deactivated successfully"}), 200
    except Exception as e:
        db.session.rollback()
        print(f"An error occurred: {str(e)}")
        return (
            jsonify({"error": "An error occurred while deactivating the user account"}),
            500,
        )


# ACTIVATE USER
@user_routes.route("/activate_user/<id>", methods=["PUT"])
def activate_user(id):
    token = request.headers.get("Authorization")
    if not token:
        return jsonify({"error": "Unauthorized Access!"}), 401

    try:
        decoded_token = jwt.decode(token, secret_key, algorithms=["HS256"])
        current_user_id = str(decoded_token.get("id"))

        if current_user_id == id:
            return jsonify({"error": "Invalid! You are currently logged in."}), 403
        user = Users.query.filter_by(id=id).one_or_none()
        if not user:
            return jsonify({"error": "User not found"}), 404
        if user.status == "Active":
            return jsonify({"error": "User is already active"}), 400

        user.status = "Active"
        db.session.commit()
        return jsonify({"message": "User account activated successfully"}), 200
    except Exception as e:
        db.session.rollback()
        return (
            jsonify({"error": "An error occurred while activating the user account"}),
            500,
        )
