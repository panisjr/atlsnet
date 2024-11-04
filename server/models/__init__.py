# models/__init__.py
from .intersection import Intersection
from .traffic_light_setting import TrafficLightSetting
from .user import Users
from .week_plan import WeekPlan
from .images import Images
from .video import Video
from .camera import Camera
# Use __all__ to specify what gets imported when using 'from models import *'
__all__ = ['Intersection','TrafficLightSetting','Users','WeekPlan', 'Images', 'Video', 'Camera' ]
