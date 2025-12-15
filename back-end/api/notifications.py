from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from flask_mail import Message
from models.notification import Notification
from models.user import User
from app import db, mail

notifications_bp = Blueprint('notifications', __name__)

# Helper function to notify admins
def notify_admins(transaction_id, user_id, group_id, notification_type, custom_message=None):
    """
    Create notifications for all admin users and group admins
    
    Args:
        transaction_id: ID of the related transaction
        user_id: ID of the user who initiated the transaction
        group_id: ID of the group related to the transaction
        notification_type: Type of notification ('contribution' or 'withdrawal_request')
        custom_message: Optional custom message to include in notification
    """
    from models.transaction import Transaction
    from models.group import GroupMember
    
    # Find the transaction
    transaction = Transaction.query.get(transaction_id)
    if not transaction:
        return
    
    # Find the user who made the transaction
    user = User.query.get(user_id)
    if not user:
        return
    
    # Get all system admins
    system_admins = User.query.filter_by(role='admin').all()
    
    # Get all group admins for this group
    group_admins = User.query.join(GroupMember).filter(
        GroupMember.group_id == group_id,
        GroupMember.role == 'admin',
        GroupMember.is_active == True
    ).all()
    
    # Combine and remove duplicates
    admin_ids = set()
    admins_to_notify = []
    
    for admin in system_admins + group_admins:
        if admin.id not in admin_ids and admin.id != user_id:  # Don't notify yourself
            admin_ids.add(admin.id)
            admins_to_notify.append(admin)
    
    # Prepare notification message based on type
    if notification_type == 'contribution':
        message = custom_message or f"{user.first_name} {user.last_name} has made a contribution of ${transaction.amount} to the group."
    elif notification_type == 'withdrawal_request':
        message = custom_message or f"{user.first_name} {user.last_name} has requested a withdrawal of ${transaction.amount} from the group."
    else:
        message = custom_message or f"New transaction from {user.first_name} {user.last_name}."
    
    # Create notifications for each admin
    for admin in admins_to_notify:
        notification = Notification(
            recipient_id=admin.id,
            transaction_id=transaction_id,
            message=message,
            notification_type=notification_type,
            is_read=False
        )
        db.session.add(notification)
        
        # Optional: Send email notification
        try:
            email_subject = f"New {notification_type.replace('_', ' ')} notification"
            email_message = Message(
                subject=email_subject,
                recipients=[admin.email],
                body=f"""
                Hello {admin.first_name},
                
                {message}
                
                Please log in to the platform to take action if needed.
                
                Regards,
                Group Savings App Team
                """
            )
            mail.send(email_message)
        except Exception as e:
            # Log error but continue (don't fail if email fails)
            print(f"Error sending email notification: {e}")
    
    # Commit all notifications
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