from flask import Flask
from flask_cors import CORS
from extensions import db  # Import your db instance
from routes import main_routes  # Import the main_routes blueprint
from extensions import socketio

def create_app():
    app = Flask(__name__)
    CORS(app, origins="*")

    # Initialize database
    app.config["SQLALCHEMY_DATABASE_URI"] = "postgresql://postgres:atls-postgres@atls-postgres.cnoq2uo0erkf.ap-southeast-2.rds.amazonaws.com:5432/atlshub"
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

    # Initialize the database with the app
    db.init_app(app)

    # Register the main routes blueprint
    app.register_blueprint(main_routes)

    @app.route('/home')
    def home():
        return "Welcome to the Traffic Management API!"

    return app, socketio  # Return both app and socketio instances

if __name__ == "__main__":
    # Create app and socketio instances
    app, socketio = create_app()  # Unpack the returned values
    
    # Initialize socketio with the app
    socketio.init_app(app)  
    
    # Create database tables (ensure the database is properly connected)
    with app.app_context():
        db.create_all()  # Create database tables

    # Start the server with socketio
    socketio.run(app, host='0.0.0.0', port=8000)
