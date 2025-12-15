from flask import Blueprint, request, jsonify, Response
from flask_jwt_extended import jwt_required, get_jwt_identity
from models.transaction import Transaction
from models.user import User
from models.group import Group, GroupMember
from app import db
import csv
import io
from datetime import datetime

transactions_bp = Blueprint('transactions', __name__)

@transactions_bp.route('/<transaction_id>', methods=['GET'])
@jwt_required()
def get_transaction(transaction_id):
    current_user_id = get_jwt_identity()
    
    # Get transaction
    transaction = Transaction.query.get(transaction_id)
    if not transaction:
        return jsonify({'message': 'Transaction not found'}), 404
    
    # Check if user has permission to view this transaction
    user = User.query.get(current_user_id)
    # Allow if it's their transaction or they're an admin
    if transaction.user_id != current_user_id and user.role != 'admin':
        # Also allow if they're a group admin
        is_group_admin = GroupMember.query.filter_by(
            user_id=current_user_id,
            group_id=transaction.group_id,
            role='admin',
            is_active=True
        ).first() is not None
        
        if not is_group_admin:
            return jsonify({'message': 'You do not have permission to view this transaction'}), 403
    
    # Get additional info
    group = Group.query.get(transaction.group_id)
    transaction_user = User.query.get(transaction.user_id)
    
    # Build response
    transaction_dict = transaction.to_dict()
    transaction_dict['group'] = {
        'id': group.id,
        'name': group.name
    } if group else None
    
    transaction_dict['user'] = {
        'id': transaction_user.id,
        'firstName': transaction_user.first_name,
        'lastName': transaction_user.last_name,
        'email': transaction_user.email
    } if transaction_user else None
    
    if transaction.approved_by:
        approver = User.query.get(transaction.approved_by)
        transaction_dict['approver'] = {
            'id': approver.id,
            'firstName': approver.first_name,
            'lastName': approver.last_name,
            'email': approver.email
        } if approver else None
    
    return jsonify(transaction_dict), 200

@transactions_bp.route('/export', methods=['GET'])
@jwt_required()
def export_transactions():
    current_user_id = get_jwt_identity()
    
    # Get request parameters
    group_id = request.args.get('groupId')
    user_id = request.args.get('userId')
    format = request.args.get('format', 'csv')
    start_date = request.args.get('startDate')
    end_date = request.args.get('endDate')
    transaction_type = request.args.get('type')
    
    # Check permissions
    current_user = User.query.get(current_user_id)
    if user_id and user_id != current_user_id and current_user.role != 'admin':
        return jsonify({'message': 'You do not have permission to export this user\'s transactions'}), 403
    
    if group_id:
        # Check if user is a member of the group
        membership = GroupMember.query.filter_by(
            user_id=current_user_id,
            group_id=group_id,
            is_active=True
        ).first()
        
        if not membership and current_user.role != 'admin':
            return jsonify({'message': 'You do not have permission to export this group\'s transactions'}), 403
    
    # Build query
    query = Transaction.query
    
    # Apply filters
    if group_id:
        query = query.filter_by(group_id=group_id)
    if user_id:
        query = query.filter_by(user_id=user_id)
    if start_date:
        query = query.filter(Transaction.created_at >= start_date)
    if end_date:
        query = query.filter(Transaction.created_at <= end_date)
    if transaction_type:
        query = query.filter_by(transaction_type=transaction_type)
    
    # Get transactions
    transactions = query.order_by(Transaction.created_at.desc()).all()
    
    # Handle different export formats
    if format == 'csv':
        output = io.StringIO()
        writer = csv.writer(output)
        
        # Write header
        writer.writerow([
            'Transaction ID',
            'User ID',
            'Group ID',
            'Group Name',
            'Type',
            'Amount',
            'Status',
            'Payment Method',
            'Reference Number',
            'Description',
            'Created Date',
            'Processed Date'
        ])
        
        # Write rows
        for transaction in transactions:
            group = Group.query.get(transaction.group_id)
            writer.writerow([
                transaction.id,
                transaction.user_id,
                transaction.group_id,
                group.name if group else '',
                transaction.transaction_type,
                transaction.amount,
                transaction.status,
                transaction.payment_method or '',
                transaction.reference_number or '',
                transaction.description or '',
                transaction.created_at.strftime('%Y-%m-%d %H:%M:%S') if transaction.created_at else '',
                transaction.processed_at.strftime('%Y-%m-%d %H:%M:%S') if transaction.processed_at else ''
            ])
        
        # Create response
        output.seek(0)
        timestamp = datetime.now().strftime('%Y%m%d%H%M%S')
        return Response(
            output.getvalue(),
            mimetype='text/csv',
            headers={
                'Content-Disposition': f'attachment; filename=transactions_{timestamp}.csv'
            }
        )
    
    # Default JSON format
    return jsonify({
        'transactions': [t.to_dict() for t in transactions],
        'meta': {
            'total': len(transactions),
            'filters': {
                'groupId': group_id,
                'userId': user_id,
                'startDate': start_date,
                'endDate': end_date,
                'type': transaction_type
            }
        }
    }), 200

# Add new endpoint for group transactions
@transactions_bp.route('/group/<group_id>', methods=['GET'])
@jwt_required()
def get_group_transactions(group_id):
    current_user_id = get_jwt_identity()
    
    # Check if group exists
    group = Group.query.get(group_id)
    if not group:
        return jsonify({'message': 'Group not found'}), 404
    
    # Check if user is a member of the group
    membership = GroupMember.query.filter_by(
        user_id=current_user_id,
        group_id=group_id,
        is_active=True
    ).first()
    
    if not membership:
        return jsonify({'message': 'You do not have permission to view this group\'s transactions'}), 403
    
    # Get request parameters
    limit = request.args.get('limit', 10, type=int)
    offset = request.args.get('offset', 0, type=int)
    transaction_type = request.args.get('type')
    start_date = request.args.get('startDate')
    end_date = request.args.get('endDate')
    user_id = request.args.get('userId')
    
    # Build query
    query = Transaction.query.filter_by(group_id=group_id)
    
    # Apply filters
    if transaction_type:
        query = query.filter_by(transaction_type=transaction_type)
    if start_date:
        query = query.filter(Transaction.created_at >= start_date)
    if end_date:
        query = query.filter(Transaction.created_at <= end_date)
    if user_id:
        query = query.filter_by(user_id=user_id)
    
    # Get total count
    total = query.count()
    
    # Apply pagination
    transactions = query.order_by(Transaction.created_at.desc()).offset(offset).limit(limit).all()
    
    # Prepare response
    transaction_list = []
    for transaction in transactions:
        transaction_dict = transaction.to_dict()
        
        # Add user info
        user = User.query.get(transaction.user_id)
        transaction_dict['user'] = {
            'id': user.id,
            'firstName': user.first_name,
            'lastName': user.last_name,
            'email': user.email
        } if user else None
        
        transaction_list.append(transaction_dict)
    
    return jsonify({
        'transactions': transaction_list,
        'meta': {
            'total': total,
            'offset': offset,
            'limit': limit
        }
    }), 200 