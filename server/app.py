from flask import Flask
from flask_cors import CORS
from flask_socketio import SocketIO
from extensions import db,socketio  # Import your db instance
from routes import main_routes  # Import the main_routes blueprint
import os

# Initialize SocketIO instance


def create_app():
    app = Flask(__name__)
    CORS(app, resources={r"/*": {"origins": os.getenv("ALLOWED_ORIGINS", "*").split(",")}})
    socketio.init_app(app)
    # CORS(app, origins=["https://atlsnet.tech", "https://dev.atlsnet.tech", "https://www.atlsnet.tech", "https://atlsnetserver.site"])
    # app.config["SQLALCHEMY_DATABASE_URI"] = "postgresql://postgres:atlsnet-postgres@atlsnet-sg.cnoq2uo0erkf.ap-southeast-2.rds.amazonaws.com:5432/atlsnetDB"

    # Initialize database
    app.config["SQLALCHEMY_DATABASE_URI"] = os.getenv("DATABASE_URI", "postgresql://postgres:postgres@localhost/atls")
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['MAX_CONTENT_LENGTH'] = 500 * 1024 * 1024  # Set max size to 500 MB  
    db.init_app(app)

    # Register the main routes blueprint
    app.register_blueprint(main_routes)

    @app.route('/home')
    def home():
        return "Welcome to the Traffic Management API!"

    return app, socketio
# Handle a connection event
@socketio.on('connect')
def handle_connect():
    print("Client connected")


# Handle a disconnection event
@socketio.on('disconnect')
def handle_disconnect():
    print("Client disconnected")

# Create app instance outside the function
app, socketio = create_app()

if __name__ == "__main__":
    # Create database tables (ensure the database is properly connected)
    with app.app_context():
        db.create_all()  # Create database tables

    # Start the server with socketio
    socketio.run(app, host='0.0.0.0', debug=True, use_reloader=False)
