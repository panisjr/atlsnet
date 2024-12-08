from extensions import db
from datetime import datetime

class TrafficLightSetting(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    intersection_id = db.Column(db.Integer, db.ForeignKey('intersection.id', name='intersection_id_fkey'), nullable=False)
    camera_id = db.Column(db.Integer, db.ForeignKey('cameras.id', name='camera_id_fkey', ondelete='RESTRICT'), nullable=True)
    day = db.Column(db.Text, nullable=True)
    traffic_light_name = db.Column(db.Text, nullable=True)
    traffic_light_name_two_way = db.Column(db.Text, nullable=True)
    traffic_light_timer = db.Column(db.Text, nullable=True)
    traffic_mode = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.now)
    modified_at = db.Column(db.DateTime, nullable=False, default=datetime.now)

    # Relationship to WeekPlan
    week_plans = db.relationship('WeekPlan', backref='traffic_light_setting', lazy=True)
    intersection = db.relationship('Intersection', backref='traffic_light_setting', lazy=True)
    camera = db.relationship('Camera', backref="traffic_light_setting", lazy=True)