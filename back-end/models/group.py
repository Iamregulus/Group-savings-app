from datetime import datetime
import uuid
from app import db

class Group(db.Model):
    __tablename__ = 'groups'

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text, nullable=True)
    target_amount = db.Column(db.Float, nullable=False)
    contribution_amount = db.Column(db.Float, nullable=False)
    contribution_frequency = db.Column(db.String(20), nullable=False)  # 'daily', 'weekly', 'monthly'
    max_members = db.Column(db.Integer, nullable=False)
    is_public = db.Column(db.Boolean, default=True)
    join_code = db.Column(db.String(20), nullable=True)
    status = db.Column(db.String(20), default='active')  # 'active', 'completed', 'cancelled'
    start_date = db.Column(db.DateTime, nullable=True)
    end_date = db.Column(db.DateTime, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Created by (admin)
    creator_id = db.Column(db.String(36), db.ForeignKey('users.id'), nullable=False)
    
    # Relationships
    members = db.relationship('GroupMember', back_populates='group', lazy='dynamic')
    transactions = db.relationship('Transaction', back_populates='group', lazy='dynamic')
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'targetAmount': self.target_amount,
            'contributionAmount': self.contribution_amount,
            'contributionFrequency': self.contribution_frequency,
            'maxMembers': self.max_members,
            'isPublic': self.is_public,
            'joinCode': self.join_code if self.is_public is False else None,
            'status': self.status,
            'startDate': self.start_date.isoformat() if self.start_date else None,
            'endDate': self.end_date.isoformat() if self.end_date else None,
            'createdAt': self.created_at.isoformat() if self.created_at else None,
            'updatedAt': self.updated_at.isoformat() if self.updated_at else None,
            'creatorId': self.creator_id
        }
    
    def __repr__(self):
        return f'<Group {self.name}>'


class GroupMember(db.Model):
    __tablename__ = 'group_members'

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    group_id = db.Column(db.String(36), db.ForeignKey('groups.id'), nullable=False)
    user_id = db.Column(db.String(36), db.ForeignKey('users.id'), nullable=False)
    role = db.Column(db.String(20), default='member')  # 'admin', 'member'
    joined_at = db.Column(db.DateTime, default=datetime.utcnow)
    is_active = db.Column(db.Boolean, default=True)
    
    # Relationships
    group = db.relationship('Group', back_populates='members')
    user = db.relationship('User', back_populates='groups')
    
    def to_dict(self):
        return {
            'id': self.id,
            'groupId': self.group_id,
            'userId': self.user_id,
            'role': self.role,
            'joinedAt': self.joined_at.isoformat() if self.joined_at else None,
            'isActive': self.is_active
        }
    
    def __repr__(self):
        return f'<GroupMember {self.user_id} in {self.group_id}>' 