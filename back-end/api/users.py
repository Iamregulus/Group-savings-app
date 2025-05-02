from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models.user import User
from models.group import GroupMember
from models.transaction import Transaction
from app import db

users_bp = Blueprint('users', __name__)

@users_bp.route('/<user_id>/groups', methods=['GET'])
@jwt_required()
def get_user_groups(user_id):
    current_user_id = get_jwt_identity()
    
    # Users can only view their own groups unless they're an admin
    user = User.query.get(current_user_id)
    if user_id != current_user_id and user.role != 'admin':
        return jsonify({'message': 'You do not have permission to view this user\'s groups'}), 403
    
    # Get groups the user is a member of
    memberships = GroupMember.query.filter_by(user_id=user_id, is_active=True).all()
    
    # Get group details for each membership
    result = []
    for membership in memberships:
        group = membership.group
        if group:
            group_dict = group.to_dict()
            group_dict['role'] = membership.role
            group_dict['joinedAt'] = membership.joined_at.isoformat() if membership.joined_at else None
            result.append(group_dict)
    
    return jsonify(result), 200

@users_bp.route('/<user_id>/transactions', methods=['GET'])
@jwt_required()
def get_user_transactions(user_id):
    current_user_id = get_jwt_identity()
    
    # Users can only view their own transactions unless they're an admin
    user = User.query.get(current_user_id)
    if user_id != current_user_id and user.role != 'admin':
        return jsonify({'message': 'You do not have permission to view this user\'s transactions'}), 403
    
    # Get request parameters for filtering and pagination
    limit = request.args.get('limit', 10, type=int)
    offset = request.args.get('offset', 0, type=int)
    transaction_type = request.args.get('type')
    start_date = request.args.get('startDate')
    end_date = request.args.get('endDate')
    
    # Base query
    query = Transaction.query.filter_by(user_id=user_id)
    
    # Apply filters
    if transaction_type:
        query = query.filter_by(transaction_type=transaction_type)
    if start_date:
        query = query.filter(Transaction.created_at >= start_date)
    if end_date:
        query = query.filter(Transaction.created_at <= end_date)
    
    # Get total count for pagination
    total_count = query.count()
    
    # Get transactions with pagination
    transactions = query.order_by(Transaction.created_at.desc()).offset(offset).limit(limit).all()
    
    return jsonify({
        'transactions': [t.to_dict() for t in transactions],
        'meta': {
            'total': total_count,
            'offset': offset,
            'limit': limit
        }
    }), 200

@users_bp.route('/<user_id>/transactions/summary', methods=['GET'])
@jwt_required()
def get_user_transaction_summary(user_id):
    current_user_id = get_jwt_identity()
    
    # Users can only view their own transaction summary unless they're an admin
    user = User.query.get(current_user_id)
    if user_id != current_user_id and user.role != 'admin':
        return jsonify({'message': 'You do not have permission to view this user\'s transaction summary'}), 403
    
    # Get period parameter (week, month, year, all)
    period = request.args.get('period', 'all')
    
    # Calculate user's total contributions
    total_contributions = Transaction.query.filter_by(
        user_id=user_id,
        transaction_type='contribution',
        status='completed'
    ).with_entities(db.func.sum(Transaction.amount)).scalar() or 0
    
    # Calculate user's total withdrawals
    total_withdrawals = Transaction.query.filter_by(
        user_id=user_id,
        transaction_type='withdrawal',
        status='completed'
    ).with_entities(db.func.sum(Transaction.amount)).scalar() or 0
    
    # Calculate user's current balance
    current_balance = total_contributions - total_withdrawals
    
    # Get user's groups
    user_groups = []
    memberships = GroupMember.query.filter_by(user_id=user_id, is_active=True).all()
    
    for membership in memberships:
        group = membership.group
        if group:
            # Calculate user's contributions to this group
            group_contributions = Transaction.query.filter_by(
                user_id=user_id,
                group_id=group.id,
                transaction_type='contribution',
                status='completed'
            ).with_entities(db.func.sum(Transaction.amount)).scalar() or 0
            
            # Calculate user's withdrawals from this group
            group_withdrawals = Transaction.query.filter_by(
                user_id=user_id,
                group_id=group.id,
                transaction_type='withdrawal',
                status='completed'
            ).with_entities(db.func.sum(Transaction.amount)).scalar() or 0
            
            # Calculate user's balance in this group
            group_balance = group_contributions - group_withdrawals
            
            user_groups.append({
                'groupId': group.id,
                'name': group.name,
                'contributions': group_contributions,
                'withdrawals': group_withdrawals,
                'balance': group_balance
            })
    
    return jsonify({
        'summary': {
            'totalContributions': total_contributions,
            'totalWithdrawals': total_withdrawals,
            'currentBalance': current_balance
        },
        'groups': user_groups
    }), 200 