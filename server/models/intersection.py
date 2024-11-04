from extensions import db
from datetime import datetime

class Intersection(db.Model):
    __tablename__ = 'intersection'
    id = db.Column(db.Integer, primary_key=True)
    intersection_name = db.Column(db.Text, nullable=False)
    road_name = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.now)
    modified_at = db.Column(db.DateTime, nullable=False, default=datetime.now)

    # Relationship to WeekPlan
    week_plans = db.relationship('WeekPlan', backref='intersection', lazy=True)
