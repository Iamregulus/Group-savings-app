from datetime import datetime
import uuid
from app import db

class Notification(db.Model):
    __tablename__ = 'notifications'

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    recipient_id = db.Column(db.String(36), db.ForeignKey('users.id'), nullable=False)
    transaction_id = db.Column(db.String(36), db.ForeignKey('transactions.id'), nullable=True)
    message = db.Column(db.Text, nullable=False)
    notification_type = db.Column(db.String(20), nullable=False)  # 'contribution', 'withdrawal_request'
    is_read = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    # Relationship with User is defined via backref in User model
    transaction = db.relationship('Transaction', foreign_keys=[transaction_id])
    
    def to_dict(self):
        return {
            'id': self.id,
            'recipientId': self.recipient_id,
            'transactionId': self.transaction_id,
            'message': self.message,
            'notificationType': self.notification_type,
            'isRead': self.is_read,
            'createdAt': self.created_at.isoformat() if self.created_at else None
        }
    
    def __repr__(self):
        return f'<Notification {self.id} - {self.notification_type}>' 