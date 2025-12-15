from datetime import datetime, timedelta
import uuid
from app import db
import bcrypt
import secrets

class User(db.Model):
    __tablename__ = 'users'

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(128), nullable=False)
    first_name = db.Column(db.String(50), nullable=False)
    last_name = db.Column(db.String(50), nullable=False)
    phone_number = db.Column(db.String(20), nullable=True)
    profile_picture = db.Column(db.String(255), nullable=True)
    is_active = db.Column(db.Boolean, default=True)
    is_email_verified = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Password reset fields
    reset_token = db.Column(db.String(100), nullable=True)
    reset_token_expires_at = db.Column(db.DateTime, nullable=True)

    # User role: 'user' or 'admin'
    role = db.Column(db.String(10), default='user')

    # Relationships
    groups = db.relationship('GroupMember', back_populates='user', lazy='dynamic')
    transactions = db.relationship('Transaction', foreign_keys='Transaction.user_id', back_populates='user', lazy='dynamic')
    approved_transactions = db.relationship('Transaction', foreign_keys='Transaction.approved_by', primaryjoin='User.id==Transaction.approved_by', lazy='dynamic')
    notifications = db.relationship('Notification', foreign_keys='Notification.recipient_id', primaryjoin='User.id==Notification.recipient_id', lazy='dynamic', backref='recipient')
    
    @property
    def password(self):
        raise AttributeError('password is not a readable attribute')
    
    @password.setter
    def password(self, password):
        self.password_hash = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
    
    def verify_password(self, password):
        return bcrypt.checkpw(password.encode('utf-8'), self.password_hash.encode('utf-8'))
    
    def generate_reset_token(self):
        """Generate a random token for password reset"""
        self.reset_token = secrets.token_urlsafe(32)
        self.reset_token_expires_at = datetime.utcnow() + timedelta(hours=24)
        return self.reset_token
    
    def verify_reset_token(self, token):
        """Verify if the reset token is valid and not expired"""
        return (self.reset_token == token and 
                self.reset_token_expires_at and 
                self.reset_token_expires_at > datetime.utcnow())
    
    def clear_reset_token(self):
        """Clear the reset token after use"""
        self.reset_token = None
        self.reset_token_expires_at = None
    
    def to_dict(self):
        return {
            'id': self.id,
            'email': self.email,
            'firstName': self.first_name,
            'lastName': self.last_name,
            'phoneNumber': self.phone_number,
            'profilePicture': self.profile_picture,
            'isActive': self.is_active,
            'isEmailVerified': self.is_email_verified,
            'role': self.role,
            'createdAt': self.created_at.isoformat() if self.created_at else None,
            'updatedAt': self.updated_at.isoformat() if self.updated_at else None
        }
    
    def __repr__(self):
        return f'<User {self.email}>' 