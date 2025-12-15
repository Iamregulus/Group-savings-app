from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt
from models.user import User
from models.group import Group
from models.transaction import Transaction
from app import db

admin_bp = Blueprint('admin', __name__)

# A decorator to check if the user is an admin
def admin_required():
    def wrapper(fn):
        @jwt_required()
        def decorator(*args, **kwargs):
            claims = get_jwt()
            if claims.get('role') == 'admin':
                return fn(*args, **kwargs)
            else:
                return jsonify(msg="Admins only!"), 403
        return decorator
    return wrapper

@admin_bp.route('/stats', methods=['GET'])
@admin_required()
def get_admin_stats():
    """
    Provides key statistics for the admin dashboard.
    """
    total_groups = db.session.query(Group).count()
    total_members = db.session.query(User).count()
    
    # Calculate total savings by summing all successful contributions
    total_savings = db.session.query(db.func.sum(Transaction.amount))\
        .filter(Transaction.transaction_type == 'contribution', Transaction.status == 'completed')\
        .scalar() or 0
        
    # Count pending withdrawals
    pending_withdrawals = db.session.query(Transaction)\
        .filter(Transaction.transaction_type == 'withdrawal', Transaction.status == 'pending')\
        .count()
        
    # Get recent groups
    recent_groups = Group.query.order_by(Group.created_at.desc()).limit(5).all()
    
    stats = {
        'totalGroups': total_groups,
        'totalMembers': total_members,
        'totalSavings': total_savings,
        'pendingWithdrawals': pending_withdrawals,
    }
    
    # Include recent groups in the response
    return jsonify({
        'stats': stats,
        'recentGroups': [group.to_dict() for group in recent_groups]
    }) 