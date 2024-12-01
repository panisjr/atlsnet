import os
import cv2
import numpy as np
import pytesseract
from flask import Blueprint, request, jsonify
from werkzeug.utils import secure_filename
from models import Images
from extensions import db

# Blueprint for OCR-related routes
ocr_routes = Blueprint("ocr_routes", __name__)

# Configuration for file uploads
UPLOAD_FOLDER = os.path.join(os.getcwd(), 'static', 'Images')  # Directory to save uploaded images
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg'}  # Allowed file types for upload

# Ensure the upload folder exists
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# Utility function to check allowed file types
def allowed_file(filename):
    """
    Check if the uploaded file has an allowed extension.
    """
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

# Set the Tesseract executable path explicitly
pytesseract.pytesseract.tesseract_cmd = r"/usr/bin/tesseract"  # Adjust path as needed

def preprocess_license_plate(image_path):
    """
    Dynamically preprocess the license plate image by adjusting the processing steps
    based on image quality, contrast, and text characteristics for better OCR performance.
    """
    # Load the image
    image = cv2.imread(image_path)

    # Check if the image is loaded properly
    if image is None:
        raise ValueError("Image not found or unsupported format")

    # Convert the image to grayscale
    gray_image = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

    # Calculate image variance to check image sharpness/quality
    var = np.var(gray_image)
    
    # Apply different processing steps based on the image quality
    if var < 1000:  # Low sharpness, apply denoising and contrast adjustment
        gray_image = cv2.equalizeHist(gray_image)  # Enhance contrast for better visibility
    
    # Denoise if necessary
    if var < 500:  # High noise (low variance)
        gray_image = cv2.fastNlMeansDenoising(gray_image, None, 30, 7, 21)
    
    # Check if the image is very dark or very light (for thresholding)
    mean_pixel_value = np.mean(gray_image)

    if mean_pixel_value < 100:  # Dark image, use adaptive thresholding
        _, thresholded_image = cv2.threshold(gray_image, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
    else:  # Bright image, apply global thresholding
        _, thresholded_image = cv2.threshold(gray_image, 150, 255, cv2.THRESH_BINARY)

    # Resize the image dynamically based on image dimensions (to better capture text)
    # Resize if the image is too small
    height, width = thresholded_image.shape
    if height < 200 or width < 200:
        thresholded_image = cv2.resize(thresholded_image, None, fx=2, fy=2, interpolation=cv2.INTER_CUBIC)

    # Perform morphological operations (closing) if the image has noise or gaps
    kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (3, 3))
    morph_image = cv2.morphologyEx(thresholded_image, cv2.MORPH_CLOSE, kernel)

    # Perform OCR using Tesseract with custom configurations
    custom_config = r'--oem 1 --psm 6'  # LSTM OCR engine, assuming a single block of text
    extracted_text = pytesseract.image_to_string(morph_image, config=custom_config)

    return extracted_text

# Format database image records for frontend display
def format_images(image):
    """
    Format the image data into a dictionary for JSON response.
    """
    return {
        "id": image.id,
        "filename": f"{request.host_url}static/Images/{image.filename}",
        "extracted_text": image.extracted_text,
        "uploaded_at": image.uploaded_at,
    }

# Route: Upload an image and perform OCR
@ocr_routes.route('/upload', methods=['POST'])
def upload_image():
    """
    Handle image upload, preprocess the image, perform OCR, and store results in the database.
    """
    # Check if the file is in the request
    if 'file' not in request.files:
        return jsonify({"error": "No file part in the request"}), 400

    file = request.files['file']

    # Validate the file
    if not file or file.filename == '':
        return jsonify({"error": "No file selected"}), 400

    if not allowed_file(file.filename):
        return jsonify({"error": "File type not allowed"}), 400

    # Save the uploaded file
    filename = secure_filename(file.filename)
    file_path = os.path.join(UPLOAD_FOLDER, filename)
    file.save(file_path)

    try:
        # Preprocess the image and extract text using OCR
        extracted_text = preprocess_license_plate(file_path)

        # Save the image and extracted text to the database
        new_image = Images(filename=filename, extracted_text=extracted_text)
        db.session.add(new_image)
        db.session.commit()

        # Return the result to the client
        return jsonify({
            "message": "Successfully processed!",
            "extracted_text": extracted_text,
            "img_src": f"{request.host_url}static/Images/{filename}",
        }), 200
    except Exception as e:
        # Handle processing errors
        return jsonify({"error": f"Failed to process the image: {str(e)}"}), 500

# Route: Retrieve all uploaded images
@ocr_routes.route('/images', methods=['GET'])
def get_images():
    """
    Fetch all images and their OCR results from the database.
    """
    try:
        images = Images.query.order_by(Images.id.asc()).all()
        image_data = [format_images(image) for image in images]
        return jsonify(image_data), 200
    except Exception as e:
        # Handle errors in fetching images
        return jsonify({"error": f"Failed to retrieve images: {str(e)}"}), 500

# Route: Delete an uploaded image
@ocr_routes.route('/delete_image/<int:image_id>', methods=['DELETE'])
def delete_image(image_id):
    """
    Delete an image and its associated OCR data from the database and filesystem.
    """
    try:
        # Find the image by its ID
        image = Images.query.get(image_id)
        if not image:
            return jsonify({"error": "Image not found"}), 404

        # Get the file path
        file_path = os.path.join(UPLOAD_FOLDER, image.filename)

        # Remove the image file if it exists
        if os.path.exists(file_path):
            os.remove(file_path)

        # Remove the image record from the database
        db.session.delete(image)
        db.session.commit()

        return jsonify({"message": "Image deleted successfully"}), 200
    except Exception as e:
        # Handle errors during deletion
        return jsonify({"error": f"Failed to delete image: {str(e)}"}), 500
