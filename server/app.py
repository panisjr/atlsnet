from flask import Flask
from flask_cors import CORS
from extensions import db  # Import your db instance
from routes import main_routes  # Import the main_routes blueprint
from extensions import socketio

def create_app():
    app = Flask(__name__)
    CORS(app, origins="*")

    # Initialize database
    app.config["SQLALCHEMY_DATABASE_URI"] = "postgresql://postgres:atlsnet-postgres@atlsnet-postgres.cnoq2uo0erkf.ap-southeast-2.rds.amazonaws.com:5432/atlsnetdb"
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

    # Initialize the database with the app
    db.init_app(app)

    # Register the main routes blueprint
    app.register_blueprint(main_routes)

    @app.route('/home')
    def home():
        return "Welcome to the Traffic Management API!"

    return app  # Only return the app instance, socketio will be initialized separately

# Create app instance outside the function
app = create_app()

# Initialize socketio with the app
socketio.init_app(app)  

if __name__ == "__main__":
    # Create database tables (ensure the database is properly connected)
    with app.app_context():
        db.create_all()  # Create database tables

    # Start the server with socketio
    socketio.run(app, host='0.0.0.0')
