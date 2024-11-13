from flask import Blueprint

# Import your routes
from .user_routes import user_routes
from .intersection_routes import intersection_routes
from .video_routes import video_routes
from .week_plan_routes import week_plan_routes
from .traffic_light_routes import traffic_light_routes
from .ocr_routes import ocr_routes
from .command_center_routes import command_center_routes
# Create a main blueprint for the routes
main_routes = Blueprint('main_routes', __name__)

# Register individual blueprints
main_routes.register_blueprint(user_routes, url_prefix='/users')
main_routes.register_blueprint(intersection_routes, url_prefix='/intersections')
main_routes.register_blueprint(video_routes, url_prefix='/videos')
main_routes.register_blueprint(week_plan_routes, url_prefix='/weekPlan')
main_routes.register_blueprint(traffic_light_routes, url_prefix='/trafficLight')
main_routes.register_blueprint(ocr_routes, url_prefix='/ocr')
main_routes.register_blueprint(command_center_routes, url_prefix='/commandCenter')
