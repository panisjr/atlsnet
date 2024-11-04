import os  
import cv2  # Import OpenCV
from flask import Blueprint, Flask, render_template, request, jsonify, url_for
from werkzeug.utils import secure_filename
from .ocr_core import ocr_core  # Importing your existing OCR function
from models import *
from extensions import db

ocr_routes = Blueprint("ocr_routes", __name__)

# Define a folder to store and later serve the images
UPLOAD_FOLDER = os.path.join(os.getcwd(), 'static', 'Test_Images')
ALLOWED_EXTENSIONS = set(['png', 'jpg', 'jpeg'])

# Function to check the file extension
def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

# Function to preprocess the image for license plate detection
def preprocess_license_plate(image_path):
    # Load the image
    image = cv2.imread(image_path)

    # Convert to grayscale
    gray_image = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

    # Apply Gaussian Blur
    blurred_image = cv2.GaussianBlur(gray_image, (5, 5), 0)

    # Use Canny edge detection
    edges = cv2.Canny(blurred_image, 100, 200)

    # Save the processed image temporarily for OCR
    processed_image_path = os.path.join(UPLOAD_FOLDER, 'processed_' + os.path.basename(image_path))
    cv2.imwrite(processed_image_path, gray_image)

    # Perform OCR on the processed image using your ocr_core function
    extracted_text = ocr_core(processed_image_path)

    # Optionally, remove the processed image if you don't need to keep it
    os.remove(processed_image_path)

    return extracted_text

# Format user data for the frontend
def format_images(image):
    return {
        "id": image.id,
        "filename": f"{request.host_url}static/Test_Images/{image.filename}",
        "extracted_text": image.extracted_text,
        "uploaded_at": image.uploaded_at,
    }

# Route to handle the upload page
@ocr_routes.route('/upload', methods=['POST'])
def upload_page():
    if 'file' not in request.files:
        return jsonify({"msg": "No file selected"}), 400

    file = request.files['file']

    if file.filename == '':
        return jsonify({"msg": "No file selected"}), 400

    if file and allowed_file(file.filename):
        # Save the file to the upload folder
        filename = secure_filename(file.filename)
        file_path = os.path.join(UPLOAD_FOLDER, filename)
        file.save(file_path)
        
        # Preprocess the image and perform OCR
        extracted_text = preprocess_license_plate(file_path)

        # Save to database
        new_image = Images(filename=filename , extracted_text=extracted_text)
        db.session.add(new_image)
        db.session.commit()

        # Construct the image source URL for the frontend
        img_src = f"{request.host_url}static/Test_Images/{filename}"
        
        # Send the result back
        return jsonify({
            "msg": "Successfully processed!",
            "extracted_text": extracted_text,
            "img_src": img_src
        }), 200

    return jsonify({"msg": "File type not allowed"}), 400

# GET ALL IMAGES
@ocr_routes.route('/images', methods=['GET'])
def get_images():
    try: 
        images = Images.query.order_by(Images.id.asc()).all()
        image_urls = [format_images(image) for image in images]
        print(image_urls)
        return jsonify(image_urls), 200
    except Exception as e: 
        return jsonify({"error": "Can't get the images!!!!"})    

# DELETE IMAGE
@ocr_routes.route('/delete_image/<int:image_id>', methods=['DELETE'])
def delete_image(image_id):
    token = request.headers.get("Authorization")
    if not token:
        return jsonify({"error": "Unauthorized! Token is missing!"}), 401
    try:
        # Find the image by ID
        image = Images.query.get(image_id)
        print("This is the id: ", image_id)
        print("This is the image found: ", image)
        if image is None:
            return jsonify({"error": "Image not found!"}), 404

        # Get the full file path
        file_path = os.path.join(UPLOAD_FOLDER, image.filename)

        # Remove the image file if it exists
        if os.path.exists(file_path):
            os.remove(file_path)

        # Remove the image record from the database
        db.session.delete(image)
        db.session.commit()

        return jsonify({"msg": "Image deleted successfully!"}), 200
    except Exception as e:
        return jsonify({"error": "Error deleting image!"}), 500
