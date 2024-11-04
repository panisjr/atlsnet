from flask import Flask
from flask_cors import CORS
from .extensions import db  # Import your db instance
from .routes import main_routes  # Import the main_routes blueprint

def create_app():
    app = Flask(__name__)
    CORS(app, origins="*")

    # Initialize database
    app.config["SQLALCHEMY_DATABASE_URI"] = "postgresql://postgres:postgres@localhost/atls"
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

    # Initialize the database with the app
    db.init_app(app)

    # Register the main routes blueprint
    app.register_blueprint(main_routes)

    @app.route('/')
    def home():
        return "Welcome to the Traffic Management API!"

    return app
