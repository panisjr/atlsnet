from extensions import db
from datetime import datetime

class Video(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    intersection_id = db.Column(db.Integer, db.ForeignKey('intersection.id', name="intersection_id_fkey"), nullable=True)
    in_counts = db.Column(db.Text, nullable=False)
    out_counts = db.Column(db.Text, nullable=False)
    filename = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.now())

    #Relationship to WeekPlan
    week_plans = db.relationship('Intersection', backref='video', lazy=True)
