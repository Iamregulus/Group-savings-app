from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from flask_mail import Message
from models.notification import Notification
from models.user import User
from app import db, mail

notifications_bp = Blueprint('notifications', __name__)


def create_notification(recipient_id, transaction_id, message, notification_type):
    """Create a single notification and best-effort email it. Never raises
    on email failure — notification creation must not be blocked by mail
    delivery issues."""
    notification = Notification(
        recipient_id=recipient_id,
        transaction_id=transaction_id,
        message=message,
        notification_type=notification_type,
        is_read=False
    )
    db.session.add(notification)

    recipient = User.query.get(recipient_id)
    if recipient and recipient.email:
        try:
            email_message = Message(
                subject=f"New {notification_type.replace('_', ' ')} notification",
                recipients=[recipient.email],
                body=f"""
                Hello {recipient.first_name},

                {message}

                Please log in to the platform to take action if needed.

                Regards,
                SaccoSave Team
                """
            )
            mail.send(email_message)
        except Exception as e:
            print(f"Error sending email notification: {e}")

    return notification


def notify_group_admins(group_id, transaction_id, message, notification_type, exclude_user_id=None):
    """Notify every active admin of a group (used for events needing admin
    action, e.g. a new contribution or withdrawal request)."""
    from models.group import GroupMember

    admins = GroupMember.query.filter_by(group_id=group_id, role='admin', is_active=True).all()
    for membership in admins:
        if membership.user_id == exclude_user_id:
            continue
        create_notification(membership.user_id, transaction_id, message, notification_type)
    db.session.commit()


def notify_group_members(group_id, transaction_id, message, notification_type, exclude_user_id=None):
    """Notify every active member of a group (used for cash-flow events that
    concern the whole group, e.g. a completed contribution or withdrawal)."""
    from models.group import GroupMember

    members = GroupMember.query.filter_by(group_id=group_id, is_active=True).all()
    for membership in members:
        if membership.user_id == exclude_user_id:
            continue
        create_notification(membership.user_id, transaction_id, message, notification_type)
    db.session.commit()



@notifications_bp.route('/', methods=['GET'])
@jwt_required()
def get_notifications():
    """Get current user's notifications"""
    user_id = get_jwt_identity()
    
    # Check if user exists
    user = User.query.get(user_id)
    if not user:
        return jsonify({'message': 'User not found'}), 404
    
    # Get pagination parameters
    limit = request.args.get('limit', 10, type=int)
    offset = request.args.get('offset', 0, type=int)
    unread_only = request.args.get('unread', 'false').lower() == 'true'
    
    # Build query
    query = Notification.query.filter_by(recipient_id=user_id)
    if unread_only:
        query = query.filter_by(is_read=False)
    
    # Get total count for pagination
    total_count = query.count()
    
    # Get notifications with pagination and ordering
    notifications = query.order_by(Notification.created_at.desc()).offset(offset).limit(limit).all()
    
    return jsonify({
        'notifications': [notification.to_dict() for notification in notifications],
        'meta': {
            'total': total_count,
            'offset': offset,
            'limit': limit,
            'unreadCount': Notification.query.filter_by(recipient_id=user_id, is_read=False).count()
        }
    }), 200

@notifications_bp.route('/<notification_id>/read', methods=['PUT'])
@jwt_required()
def mark_as_read(notification_id):
    """Mark a notification as read"""
    user_id = get_jwt_identity()
    
    # Find notification
    notification = Notification.query.get(notification_id)
    if not notification:
        return jsonify({'message': 'Notification not found'}), 404
    
    # Check if user owns this notification
    if notification.recipient_id != user_id:
        return jsonify({'message': 'You do not have permission to modify this notification'}), 403
    
    # Mark as read
    notification.is_read = True
    db.session.commit()
    
    return jsonify({
        'message': 'Notification marked as read',
        'notification': notification.to_dict()
    }), 200

@notifications_bp.route('/read-all', methods=['PUT'])
@jwt_required()
def mark_all_as_read():
    """Mark all user's notifications as read"""
    user_id = get_jwt_identity()
    
    # Update all unread notifications for this user
    notifications = Notification.query.filter_by(recipient_id=user_id, is_read=False).all()
    
    for notification in notifications:
        notification.is_read = True
    
    db.session.commit()
    
    return jsonify({
        'message': f'Marked {len(notifications)} notifications as read'
    }), 200 