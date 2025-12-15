from datetime import datetime
import uuid
from app import db

class Transaction(db.Model):
    __tablename__ = 'transactions'

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = db.Column(db.String(36), db.ForeignKey('users.id'), nullable=False)
    group_id = db.Column(db.String(36), db.ForeignKey('groups.id'), nullable=False)
    amount = db.Column(db.Float, nullable=False)
    transaction_type = db.Column(db.String(20), nullable=False)  # 'contribution', 'withdrawal'
    status = db.Column(db.String(20), default='pending')  # 'pending', 'completed', 'cancelled', 'rejected'
    payment_method = db.Column(db.String(50), nullable=True)
    reference_number = db.Column(db.String(100), nullable=True)
    description = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    processed_at = db.Column(db.DateTime, nullable=True)
    
    # If the transaction is a withdrawal request, who approved/rejected it
    approved_by = db.Column(db.String(36), db.ForeignKey('users.id'), nullable=True)
    remarks = db.Column(db.Text, nullable=True)
    
    # Relationships
    user = db.relationship('User', foreign_keys=[user_id], back_populates='transactions')
    approver = db.relationship('User', foreign_keys=[approved_by], back_populates='approved_transactions')
    group = db.relationship('Group', back_populates='transactions')
    
    def to_dict(self):
        return {
            'id': self.id,
            'userId': self.user_id,
            'groupId': self.group_id,
            'amount': self.amount,
            'transactionType': self.transaction_type,
            'status': self.status,
            'paymentMethod': self.payment_method,
            'referenceNumber': self.reference_number,
            'description': self.description,
            'createdAt': self.created_at.isoformat() if self.created_at else None,
            'updatedAt': self.updated_at.isoformat() if self.updated_at else None,
            'processedAt': self.processed_at.isoformat() if self.processed_at else None,
            'approvedBy': self.approved_by,
            'remarks': self.remarks
        }
    
    def __repr__(self):
        return f'<Transaction {self.id} - {self.transaction_type}>' 