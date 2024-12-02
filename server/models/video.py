from extensions import db
from datetime import datetime

class Video(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    camera_id = db.Column(db.Integer, db.ForeignKey('cameras.id', name='camera_id_fkey'), nullable=True )
    in_counts = db.Column(db.Text, nullable=False)
    out_counts = db.Column(db.Text, nullable=False)
    filename = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.now())

    #Relationship to WeekPlan
    camera = db.relationship('Camera', backref="video", lazy=True)

