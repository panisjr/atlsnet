# models.py
from extensions import db
from datetime import datetime

class Camera(db.Model):
    __tablename__ = 'cameras'
    
    id = db.Column(db.Integer, primary_key=True)
    # intersection_id = db.Column(db.Interger, db.ForeignKey('intersection.id',name='intersection_id_fkey',nullable=False))
    name = db.Column(db.String(50), nullable=False)
    rtsp_url = db.Column(db.String(255), nullable=False)
    location = db.Column(db.String(100), nullable=True)
    status = db.Column(db.Text, nullable=False, default="Inactive")
    created_at = db.Column(db.DateTime,nullable=False, default=datetime.now())

    # intersection = db.relationship('Intersection', backref='cameras', lazy=True)
    def __init__(self, name, rtsp_url, location=None):
        self.name = name
        self.rtsp_url = rtsp_url
        self.location = location
