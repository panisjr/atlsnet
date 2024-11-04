from extensions import db
from datetime import datetime

class WeekPlan(db.Model):
    __tablename__ = 'weekplan'
    id = db.Column(db.Integer, primary_key=True)
    # Foreign key to Intersection with explicit name 'intersection_id_fkey'
    intersection_id = db.Column(db.Integer, db.ForeignKey('intersection.id', name='intersection_id_fkey'), nullable=False)
    traffic_light_id = db.Column(db.Integer, db.ForeignKey('traffic_light_setting.id', name='traffic_light_id_fkey'), nullable=True) # TO SET THE SELECTED INTERSECTION FIRST
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.now)
    modified_at = db.Column(db.DateTime, nullable=False, default=datetime.now)
