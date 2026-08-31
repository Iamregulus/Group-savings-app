from datetime import datetime
import uuid
from app import db

class WithdrawalApproval(db.Model):
    __tablename__ = 'withdrawal_approvals'
    __table_args__ = (
        db.UniqueConstraint('transaction_id', 'admin_id', name='uq_withdrawal_approval_transaction_admin'),
    )

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    transaction_id = db.Column(db.String(36), db.ForeignKey('transactions.id'), nullable=False)
    admin_id = db.Column(db.String(36), db.ForeignKey('users.id'), nullable=False)
    decision = db.Column(db.String(20), nullable=False)  # 'approved', 'rejected'
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    transaction = db.relationship('Transaction', backref='approvals')
    admin = db.relationship('User')

    def to_dict(self):
        return {
            'id': self.id,
            'transactionId': self.transaction_id,
            'adminId': self.admin_id,
            'decision': self.decision,
            'createdAt': self.created_at.isoformat() if self.created_at else None
        }

    def __repr__(self):
        return f'<WithdrawalApproval {self.admin_id} {self.decision} on {self.transaction_id}>'
