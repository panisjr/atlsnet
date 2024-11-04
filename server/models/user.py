import re
from extensions import db
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime

# USER MANAGEMENT
class Users(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, nullable=False, unique=True)  # Ensure user_id is unique
    firstname = db.Column(db.Text, nullable=False)
    middlename = db.Column(db.Text, nullable=True)
    lastname = db.Column(db.Text, nullable=False)
    email = db.Column(db.Text, nullable=False, unique=True)
    contact = db.Column(db.Text, nullable=False)
    address = db.Column(db.Text, nullable=False)
    password = db.Column(db.Text, nullable=False)
    role = db.Column(db.Text, nullable=False)
    status = db.Column(db.Text, nullable=False, default="Active")  # Default status
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.now)
    modified_at = db.Column(db.DateTime, default=datetime.now, onupdate=datetime.now)

    def __repr__(self):
        return (f"User: {self.user_id}, {self.firstname}, {self.middlename}, "
                f"{self.lastname}, {self.email}, {self.contact}, {self.address}, "
                f"{self.role}, {self.status}")

    def __init__(self, user_id, firstname, middlename, lastname, email, 
                 password, contact, address, role, status="Active"):  # Default status
        # Validate contact number
        if not re.match(r"^09\d{9}$", contact):
            raise ValueError("Contact number is invalid. Try again!")

        # Validate names
        if not re.match(r"^[A-Za-z\s]+$", firstname):
            raise ValueError("Firstname must not contain special characters.")
        if not re.match(r"^[A-Za-z\s.]+$", lastname):
            raise ValueError("Lastname must not contain special characters.")

        # Validate address
        if not re.match(r"^[A-Za-z0-9\s,.-]+$", address):
            raise ValueError(
                "Address must contain only letters, numbers, spaces, and basic punctuation."
            )

        self.user_id = user_id
        self.firstname = firstname
        self.middlename = middlename
        self.lastname = lastname
        self.email = email
        self.contact = contact
        self.address = address
        self.password = generate_password_hash(password)
        self.role = role
        self.status = status

    def verify_password(self, password):
        """Verify the password."""
        return check_password_hash(self.password, password)
