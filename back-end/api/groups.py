from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models.group import Group, GroupMember
from models.user import User
from models.transaction import Transaction
from app import db
import random
import string
import datetime

groups_bp = Blueprint('groups', __name__)

# Helper function to generate a random join code
def generate_join_code(length=8):
    characters = string.ascii_uppercase + string.digits
    return ''.join(random.choice(characters) for _ in range(length))

# Get all available groups for joining
@groups_bp.route('/available', methods=['GET'])
@jwt_required()
def get_available_groups():
    user_id = get_jwt_identity()
    
    # Get all public groups
    print(f"Looking for public groups for user {user_id}")
    public_groups = Group.query.filter_by(is_public=True, status='active').all()
    print(f"Found {len(public_groups)} public groups")
    
    # Print details for debugging
    for group in public_groups:
        print(f"Group: {group.id}, {group.name}, Public: {group.is_public}, Status: {group.status}, Creator: {group.creator_id}")
    
    # Filter out groups the user is already a member of
    user_memberships = GroupMember.query.filter_by(user_id=user_id).all()
    user_group_ids = [member.group_id for member in user_memberships]
    
    print(f"User {user_id} is already a member of groups: {user_group_ids}")
    
    available_groups = [group for group in public_groups if group.id not in user_group_ids]
    print(f"Filtering to {len(available_groups)} available groups")
    
    return jsonify([group.to_dict() for group in available_groups]), 200

# Get all groups for a user
@groups_bp.route('/my-groups', methods=['GET'])
@jwt_required()
def get_user_groups():
    user_id = get_jwt_identity()
    
    # Get groups the user is a member of
    memberships = GroupMember.query.filter_by(user_id=user_id, is_active=True).all()
    
    groups = []
    for membership in memberships:
        group = Group.query.get(membership.group_id)
        if group:
            group_dict = group.to_dict()
            group_dict['role'] = membership.role  # Add user's role in the group
            
            # Calculate total contributions and withdrawals for the group
            total_contributions = Transaction.query.filter_by(
                group_id=group.id,
                transaction_type='contribution',
                status='completed'
            ).with_entities(db.func.sum(Transaction.amount)).scalar() or 0
            
            total_withdrawals = Transaction.query.filter_by(
                group_id=group.id,
                transaction_type='withdrawal',
                status='completed'
            ).with_entities(db.func.sum(Transaction.amount)).scalar() or 0
            
            # Calculate user's contributions and withdrawals
            user_contributions = Transaction.query.filter_by(
                user_id=user_id,
                group_id=group.id,
                transaction_type='contribution',
                status='completed'
            ).with_entities(db.func.sum(Transaction.amount)).scalar() or 0
            
            user_withdrawals = Transaction.query.filter_by(
                user_id=user_id,
                group_id=group.id,
                transaction_type='withdrawal',
                status='completed'
            ).with_entities(db.func.sum(Transaction.amount)).scalar() or 0
            
            # Get member count
            member_count = GroupMember.query.filter_by(group_id=group.id, is_active=True).count()
            
            # Add additional information to the group dictionary
            group_dict['totalSaved'] = total_contributions
            group_dict['totalWithdrawals'] = total_withdrawals
            group_dict['availableBalance'] = total_contributions - total_withdrawals
            group_dict['userSavings'] = user_contributions - user_withdrawals
            group_dict['memberCount'] = member_count
            
            # Check for pending withdrawals if user is an admin
            if membership.role == 'admin':
                pending_withdrawals = Transaction.query.filter_by(
                    group_id=group.id,
                    transaction_type='withdrawal',
                    status='pending'
                ).count()
                group_dict['pendingWithdrawals'] = pending_withdrawals
            
            groups.append(group_dict)
    
    return jsonify(groups), 200

# Get a specific group by ID
@groups_bp.route('/<group_id>', methods=['GET'])
@jwt_required()
def get_group(group_id):
    user_id = get_jwt_identity()
    
    # Get the group
    group = Group.query.get(group_id)
    if not group:
        return jsonify({'message': 'Group not found'}), 404
    
    # Check if user is a member of the group
    membership = GroupMember.query.filter_by(user_id=user_id, group_id=group_id).first()
    if not membership and not group.is_public:
        return jsonify({'message': 'You do not have permission to view this group'}), 403
    
    group_dict = group.to_dict()
    
    # If user is a member, add their role
    if membership:
        group_dict['userRole'] = membership.role
        group_dict['isUserAdmin'] = membership.role == 'admin'
    
    # Calculate total contributions and withdrawals
    total_contributions = Transaction.query.filter_by(
        group_id=group_id,
        transaction_type='contribution',
        status='completed'
    ).with_entities(db.func.sum(Transaction.amount)).scalar() or 0
    
    total_withdrawals = Transaction.query.filter_by(
        group_id=group_id,
        transaction_type='withdrawal',
        status='completed'
    ).with_entities(db.func.sum(Transaction.amount)).scalar() or 0
    
    # Calculate user's personal contributions and withdrawals
    user_contributions = 0
    user_withdrawals = 0
    if membership:
        user_contributions = Transaction.query.filter_by(
            user_id=user_id,
            group_id=group_id,
            transaction_type='contribution',
            status='completed'
        ).with_entities(db.func.sum(Transaction.amount)).scalar() or 0
        
        user_withdrawals = Transaction.query.filter_by(
            user_id=user_id,
            group_id=group_id,
            transaction_type='withdrawal',
            status='completed'
        ).with_entities(db.func.sum(Transaction.amount)).scalar() or 0
    
    # Get member count
    member_count = GroupMember.query.filter_by(group_id=group_id, is_active=True).count()
    
    # Calculate current balance and add to group data
    current_balance = total_contributions - total_withdrawals
    user_balance = user_contributions - user_withdrawals
    
    group_dict['totalSaved'] = total_contributions
    group_dict['totalWithdrawals'] = total_withdrawals
    group_dict['availableBalance'] = current_balance
    group_dict['userSavings'] = user_balance
    group_dict['memberCount'] = member_count
    
    # Get pending withdrawal requests count if user is admin
    if membership and membership.role == 'admin':
        pending_withdrawals = Transaction.query.filter_by(
            group_id=group_id,
            transaction_type='withdrawal',
            status='pending'
        ).count()
        group_dict['pendingWithdrawals'] = pending_withdrawals
    
    # Get group members if user is a member
    if membership:
        members = []
        group_members = GroupMember.query.filter_by(group_id=group_id, is_active=True).all()
        for member in group_members:
            user = User.query.get(member.user_id)
            if user:
                members.append({
                    'id': user.id,
                    'name': f"{user.first_name} {user.last_name}",
                    'email': user.email,
                    'role': member.role,
                    'joinedAt': member.joined_at.isoformat() if member.joined_at else None
                })
        group_dict['members'] = members
    
    return jsonify(group_dict), 200

# Create a new group
@groups_bp.route('', methods=['POST'])
@groups_bp.route('/', methods=['POST'])
@jwt_required()
def create_group():
    user_id = get_jwt_identity()
    
    # Get user information
    user = User.query.get(user_id)
    if not user:
        return jsonify({'message': 'User not found'}), 404
    
    data = request.get_json()
    print(f"Received data: {data}")
    if not data:
        return jsonify({'message': 'Invalid or missing JSON data'}), 400
    
    # Validate required fields
    required_fields = ['name', 'targetAmount', 'contributionAmount', 'contributionFrequency', 'maxMembers']
    for field in required_fields:
        if field not in data:
            print(f"Missing required field: {field}")
            return jsonify({'message': f'Missing required field: {field}'}), 400
    
    # Create new group
    try:
        print(f"Creating group with: {data}")
        group = Group(
            name=data['name'],
            description=data.get('description', ''),
            target_amount=float(data['targetAmount']),
            contribution_amount=float(data['contributionAmount']),
            contribution_frequency=data['contributionFrequency'],
            max_members=int(data['maxMembers']),
            is_public=data.get('isPublic', True),
            creator_id=user_id,
            status='active'  # Ensure the group is created with active status
        )
        
        # If the group is not public, generate a join code
        if not group.is_public:
            group.join_code = generate_join_code()
        
        # Save to database
        print("About to add group to db.session")
        db.session.add(group)
        print("About to commit group to database")
        db.session.commit()
        print("Group committed successfully, ID:", group.id)
        
        # Add the creator as an admin member
        print("Creating admin membership for user:", user_id)
        member = GroupMember(
            group_id=group.id,
            user_id=user_id,
            role='admin'
        )
        
        print("About to add member to db.session")
        db.session.add(member)
        print("About to commit member to database")
        db.session.commit()
        print("Member committed successfully")
        
        # Return group data with proper id
        group_data = group.to_dict()
        print("Final group data:", group_data)
        
        return jsonify({
            'message': 'Group created successfully',
            'group': group_data,
            'id': group.id  # Ensure ID is included
        }), 201
    except Exception as e:
        db.session.rollback()
        print(f"Error creating group: {str(e)}")
        print(f"Exception type: {type(e).__name__}")
        import traceback
        traceback.print_exc()
        
        # Print additional debug info
        print("User ID:", user_id)
        print("Request data:", data)
        
        if hasattr(e, '__dict__'):
            print("Exception attributes:", {k: v for k, v in e.__dict__.items() if not k.startswith('_')})
        
        return jsonify({
            'message': 'Failed to create group', 
            'error': str(e),
            'error_type': type(e).__name__
        }), 422

# Update a group
@groups_bp.route('/<group_id>', methods=['PUT'])
@jwt_required()
def update_group(group_id):
    user_id = get_jwt_identity()
    
    # Get the group
    group = Group.query.get(group_id)
    if not group:
        return jsonify({'message': 'Group not found'}), 404
    
    # Check if user is an admin of the group
    membership = GroupMember.query.filter_by(user_id=user_id, group_id=group_id, role='admin').first()
    if not membership:
        return jsonify({'message': 'You do not have permission to update this group'}), 403
    
    data = request.get_json()
    
    # Update fields
    if 'name' in data:
        group.name = data['name']
    if 'description' in data:
        group.description = data['description']
    if 'targetAmount' in data:
        group.target_amount = float(data['targetAmount'])
    if 'contributionAmount' in data:
        group.contribution_amount = float(data['contributionAmount'])
    if 'contributionFrequency' in data:
        group.contribution_frequency = data['contributionFrequency']
    if 'maxMembers' in data:
        group.max_members = int(data['maxMembers'])
    if 'isPublic' in data:
        old_is_public = group.is_public
        group.is_public = data['isPublic']
        
        # If changing from public to private, generate a join code
        if old_is_public and not group.is_public:
            group.join_code = generate_join_code()
        # If changing from private to public, remove join code
        elif not old_is_public and group.is_public:
            group.join_code = None
    if 'status' in data:
        group.status = data['status']
    
    db.session.commit()
    
    return jsonify({
        'message': 'Group updated successfully',
        'group': group.to_dict()
    }), 200

# Join a group
@groups_bp.route('/<group_id>/join', methods=['POST'])
@jwt_required()
def join_group(group_id):
    user_id = get_jwt_identity()
    data = request.get_json()
    
    # Get the group
    group = Group.query.get(group_id)
    if not group:
        return jsonify({'message': 'Group not found'}), 404
    
    # Check if group is active
    if group.status != 'active':
        return jsonify({'message': 'This group is not accepting new members'}), 400
    
    # Check if group is full
    current_members_count = GroupMember.query.filter_by(group_id=group_id, is_active=True).count()
    if current_members_count >= group.max_members:
        return jsonify({'message': 'This group is already full'}), 400
    
    # Check if user is already a member
    existing_membership = GroupMember.query.filter_by(user_id=user_id, group_id=group_id).first()
    if existing_membership:
        if existing_membership.is_active:
            return jsonify({'message': 'You are already a member of this group'}), 400
        else:
            # Reactivate membership
            existing_membership.is_active = True
            db.session.commit()
            return jsonify({'message': 'Rejoined group successfully'}), 200
    
    # If group is private, check join code
    if not group.is_public:
        join_code = data.get('joinCode')
        if not join_code or join_code != group.join_code:
            return jsonify({'message': 'Invalid join code'}), 400
    
    # Create new membership
    member = GroupMember(
        group_id=group_id,
        user_id=user_id,
        role='member'
    )
    
    db.session.add(member)
    db.session.commit()
    
    return jsonify({'message': 'Joined group successfully'}), 200

# Join a group using join code
@groups_bp.route('/join-by-code', methods=['POST'])
@jwt_required()
def join_group_by_code():
    user_id = get_jwt_identity()
    data = request.get_json()
    
    if not data or 'joinCode' not in data:
        return jsonify({'message': 'Join code is required'}), 400
    
    join_code = data.get('joinCode')
    
    # Find the group with this join code
    group = Group.query.filter_by(join_code=join_code, status='active').first()
    if not group:
        return jsonify({'message': 'Invalid join code or group not found'}), 404
    
    # Check if group is full
    current_members_count = GroupMember.query.filter_by(group_id=group.id, is_active=True).count()
    if current_members_count >= group.max_members:
        return jsonify({'message': 'This group is already full'}), 400
    
    # Check if user is already a member
    existing_membership = GroupMember.query.filter_by(user_id=user_id, group_id=group.id).first()
    if existing_membership:
        if existing_membership.is_active:
            return jsonify({'message': 'You are already a member of this group'}), 400
        else:
            # Reactivate membership
            existing_membership.is_active = True
            db.session.commit()
            return jsonify({
                'message': 'Rejoined group successfully',
                'groupId': group.id
            }), 200
    
    # Create new membership
    member = GroupMember(
        group_id=group.id,
        user_id=user_id,
        role='member'
    )
    
    db.session.add(member)
    db.session.commit()
    
    return jsonify({
        'message': 'Joined group successfully',
        'groupId': group.id
    }), 200

# Leave a group
@groups_bp.route('/<group_id>/leave', methods=['POST'])
@jwt_required()
def leave_group(group_id):
    user_id = get_jwt_identity()
    
    # Get the membership
    membership = GroupMember.query.filter_by(user_id=user_id, group_id=group_id, is_active=True).first()
    if not membership:
        return jsonify({'message': 'You are not a member of this group'}), 400
    
    # Check if user is the only admin
    if membership.role == 'admin':
        admin_count = GroupMember.query.filter_by(group_id=group_id, role='admin', is_active=True).count()
        if admin_count == 1:
            return jsonify({'message': 'You cannot leave the group as you are the only admin'}), 400
    
    # Set membership as inactive
    membership.is_active = False
    db.session.commit()
    
    return jsonify({'message': 'Left group successfully'}), 200

# Get members of a group
@groups_bp.route('/<group_id>/members', methods=['GET'])
@jwt_required()
def get_group_members(group_id):
    user_id = get_jwt_identity()
    
    # Check if group exists
    group = Group.query.get(group_id)
    if not group:
        return jsonify({'message': 'Group not found'}), 404
    
    # Check if user is a member of the group
    membership = GroupMember.query.filter_by(user_id=user_id, group_id=group_id, is_active=True).first()
    if not membership:
        return jsonify({'message': 'You do not have permission to view this group'}), 403
    
    # Get all active members
    members = GroupMember.query.filter_by(group_id=group_id, is_active=True).all()
    
    # Get user details for each member
    result = []
    for member in members:
        user = User.query.get(member.user_id)
        if user:
            user_dict = {
                'userId': user.id,
                'email': user.email,
                'firstName': user.first_name,
                'lastName': user.last_name,
                'profilePicture': user.profile_picture,
                'role': member.role,
                'joinedAt': member.joined_at.isoformat() if member.joined_at else None
            }
            result.append(user_dict)
    
    return jsonify(result), 200

# Make a contribution to a group
@groups_bp.route('/<group_id>/contributions', methods=['POST'])
@jwt_required()
def make_contribution(group_id):
    user_id = get_jwt_identity()
    data = request.get_json()
    
    # Check if group exists
    group = Group.query.get(group_id)
    if not group:
        return jsonify({'message': 'Group not found'}), 404
    
    # Check if group is active
    if group.status != 'active':
        return jsonify({'message': 'This group is not active'}), 400
    
    # Check if user is a member of the group
    membership = GroupMember.query.filter_by(user_id=user_id, group_id=group_id, is_active=True).first()
    if not membership:
        return jsonify({'message': 'You are not a member of this group'}), 403
    
    # Validate required fields
    required_fields = ['amount', 'paymentMethod']
    for field in required_fields:
        if field not in data:
            return jsonify({'message': f'Missing required field: {field}'}), 400
    
    # Create new transaction
    transaction = Transaction(
        user_id=user_id,
        group_id=group_id,
        amount=float(data['amount']),
        transaction_type='contribution',
        status='completed',  # For simplicity, mark as completed immediately (could be 'pending' in real app)
        payment_method=data['paymentMethod'],
        reference_number=data.get('referenceNumber'),
        description=data.get('description', 'Group contribution'),
        processed_at=datetime.datetime.utcnow()
    )
    
    db.session.add(transaction)
    db.session.commit()
    
    # Notify admins about the contribution
    from api.notifications import notify_admins
    notify_admins(transaction.id, user_id, group_id, 'contribution')
    
    return jsonify({
        'message': 'Contribution made successfully',
        'transaction': transaction.to_dict()
    }), 201

# Request a withdrawal from a group
@groups_bp.route('/<group_id>/withdrawals', methods=['POST'])
@jwt_required()
def request_withdrawal(group_id):
    user_id = get_jwt_identity()
    data = request.get_json()
    
    # Check if user is a member of the group
    membership = GroupMember.query.filter_by(user_id=user_id, group_id=group_id, is_active=True).first()
    if not membership:
        return jsonify({'message': 'You are not a member of this group'}), 403
    
    # Get group
    group = Group.query.get(group_id)
    if not group:
        return jsonify({'message': 'Group not found'}), 404
    
    # Check if required fields are present
    if 'amount' not in data:
        return jsonify({'message': 'Amount is required'}), 400
    
    # Calculate available balance
    total_contributions = Transaction.query.filter_by(
        group_id=group_id,
        transaction_type='contribution',
        status='completed'
    ).with_entities(db.func.sum(Transaction.amount)).scalar() or 0
    
    total_withdrawals = Transaction.query.filter_by(
        group_id=group_id,
        transaction_type='withdrawal',
        status='completed'
    ).with_entities(db.func.sum(Transaction.amount)).scalar() or 0
    
    available_balance = total_contributions - total_withdrawals
    
    # Check if withdrawal amount is valid
    if float(data['amount']) <= 0:
        return jsonify({'message': 'Withdrawal amount must be greater than zero'}), 400
    
    if float(data['amount']) > available_balance:
        return jsonify({'message': 'Insufficient balance for withdrawal'}), 400
    
    # Create new transaction
    transaction = Transaction(
        user_id=user_id,
        group_id=group_id,
        amount=float(data['amount']),
        transaction_type='withdrawal',
        status='pending',  # Withdrawal requests start as pending
        description=data.get('description', 'Withdrawal request')
    )
    
    db.session.add(transaction)
    db.session.commit()
    
    # Get requesting user information for notifications
    requesting_user = User.query.get(user_id)
    requester_name = f"{requesting_user.first_name} {requesting_user.last_name}"
    
    # Find all admins of the group
    admin_members = GroupMember.query.filter_by(group_id=group_id, role='admin', is_active=True).all()
    from models.notification import Notification
    
    # Create notifications for all admins
    for admin_member in admin_members:
        # Skip if it's the same user (though unlikely an admin would request approval from themselves)
        if admin_member.user_id == user_id:
            continue
            
        # Create notification
        notification = Notification(
            recipient_id=admin_member.user_id,
            transaction_id=transaction.id,
            message=f"{requester_name} has requested a withdrawal of ${data['amount']} from group '{group.name}'. Please review.",
            notification_type="withdrawal_request",
            is_read=False
        )
        db.session.add(notification)
    
    db.session.commit()
    
    # Try to send email notifications to all admins
    try:
        from flask_mail import Message
        from app import mail
        
        for admin_member in admin_members:
            if admin_member.user_id == user_id:
                continue
                
            admin = User.query.get(admin_member.user_id)
            if admin and admin.email:
                email_subject = f"New Withdrawal Request - {group.name}"
                email_message = Message(
                    subject=email_subject,
                    recipients=[admin.email],
                    body=f"""
                    Hello {admin.first_name},

                    {requester_name} has requested a withdrawal of ${data['amount']} from group '{group.name}'.
                    
                    Please log in to the platform to review and process this request.

                    Regards,
                    Group Savings App Team
                    """
                )
                mail.send(email_message)
    except Exception as e:
        # Log error but continue (don't fail if email fails)
        print(f"Error sending email notification: {e}")
    
    return jsonify({
        'message': 'Withdrawal request submitted successfully',
        'transaction': transaction.to_dict()
    }), 201

# Process a withdrawal request (approve/reject)
@groups_bp.route('/<group_id>/withdrawals/<transaction_id>', methods=['PUT'])
@jwt_required()
def process_withdrawal(group_id, transaction_id):
    user_id = get_jwt_identity()
    data = request.get_json()
    
    # Get the group
    group = Group.query.get(group_id)
    if not group:
        return jsonify({'message': 'Group not found'}), 404
    
    # Check if user is an admin of the group or the group creator
    membership = GroupMember.query.filter_by(user_id=user_id, group_id=group_id, role='admin', is_active=True).first()
    if not membership:
        return jsonify({'message': 'You do not have permission to process withdrawal requests'}), 403
    
    # Additional check if the user is the group creator for extra security
    is_creator = group.creator_id == user_id
    
    # Get the transaction
    transaction = Transaction.query.get(transaction_id)
    if not transaction:
        return jsonify({'message': 'Transaction not found'}), 404
    
    # Validate transaction belongs to the group and is a pending withdrawal
    if (transaction.group_id != group_id or
        transaction.transaction_type != 'withdrawal' or
        transaction.status != 'pending'):
        return jsonify({'message': 'Invalid transaction'}), 400
    
    # Get action (approve/reject)
    action = data.get('status')
    if action not in ['completed', 'rejected']:
        return jsonify({'message': 'Invalid action. Must be "completed" or "rejected"'}), 400
    
    # Update transaction
    transaction.status = action
    transaction.approved_by = user_id
    transaction.remarks = data.get('remarks')
    transaction.processed_at = datetime.datetime.utcnow()
    
    db.session.commit()
    
    # Get admin and user info for notification
    admin = User.query.get(user_id)
    requester = User.query.get(transaction.user_id)
    
    # Create notification for the user who requested the withdrawal
    from models.notification import Notification
    
    # Prepare notification message
    if action == 'completed':
        message = f"Your withdrawal request for ${transaction.amount} has been approved by {admin.first_name} {admin.last_name}."
    else:  # rejected
        message = f"Your withdrawal request for ${transaction.amount} has been rejected by {admin.first_name} {admin.last_name}."
        if transaction.remarks:
            message += f" Reason: {transaction.remarks}"
    
    # Create notification
    notification = Notification(
        recipient_id=transaction.user_id,
        transaction_id=transaction.id,
        message=message,
        notification_type=f"withdrawal_{action}",
        is_read=False
    )
    
    db.session.add(notification)
    db.session.commit()
    
    # Try to send email notification if email is available
    try:
        from flask_mail import Message
        from app import mail
        
        email_subject = f"Withdrawal Request {action.capitalize()}"
        email_message = Message(
            subject=email_subject,
            recipients=[requester.email],
            body=f"""
            Hello {requester.first_name},

            {message}

            Please log in to the platform for more details.

            Regards,
            Group Savings App Team
            """
        )
        mail.send(email_message)
    except Exception as e:
        # Log error but continue (don't fail if email fails)
        print(f"Error sending email notification: {e}")
    
    return jsonify({
        'message': f'Withdrawal request {action}',
        'transaction': transaction.to_dict(),
        'processedBy': {
            'id': admin.id,
            'name': f"{admin.first_name} {admin.last_name}",
            'isCreator': is_creator
        }
    }), 200

# Get group statistics
@groups_bp.route('/<group_id>/stats', methods=['GET'])
@jwt_required()
def get_group_stats(group_id):
    user_id = get_jwt_identity()
    
    # Check if user is a member of the group
    membership = GroupMember.query.filter_by(user_id=user_id, group_id=group_id, is_active=True).first()
    if not membership:
        return jsonify({'message': 'You do not have permission to view this group'}), 403
    
    # Get group
    group = Group.query.get(group_id)
    if not group:
        return jsonify({'message': 'Group not found'}), 404
    
    # Get total contributions
    total_contributions = Transaction.query.filter_by(
        group_id=group_id,
        transaction_type='contribution',
        status='completed'
    ).with_entities(db.func.sum(Transaction.amount)).scalar() or 0
    
    # Get total withdrawals
    total_withdrawals = Transaction.query.filter_by(
        group_id=group_id,
        transaction_type='withdrawal',
        status='completed'
    ).with_entities(db.func.sum(Transaction.amount)).scalar() or 0
    
    # Get member count
    member_count = GroupMember.query.filter_by(group_id=group_id, is_active=True).count()
    
    # Calculate progress towards target
    current_balance = total_contributions - total_withdrawals
    progress_percentage = (current_balance / group.target_amount) * 100 if group.target_amount > 0 else 0
    
    # Calculate user's personal statistics
    user_contributions = Transaction.query.filter_by(
        user_id=user_id,
        group_id=group_id,
        transaction_type='contribution',
        status='completed'
    ).with_entities(db.func.sum(Transaction.amount)).scalar() or 0
    
    user_withdrawals = Transaction.query.filter_by(
        user_id=user_id,
        group_id=group_id,
        transaction_type='withdrawal',
        status='completed'
    ).with_entities(db.func.sum(Transaction.amount)).scalar() or 0
    
    user_balance = user_contributions - user_withdrawals
    
    # Get recent transactions
    recent_transactions = Transaction.query.filter_by(
        group_id=group_id,
        status='completed'
    ).order_by(Transaction.created_at.desc()).limit(5).all()
    
    return jsonify({
        'groupInfo': {
            'id': group.id,
            'name': group.name,
            'targetAmount': group.target_amount,
            'contributionAmount': group.contribution_amount,
            'contributionFrequency': group.contribution_frequency
        },
        'stats': {
            'totalContributions': total_contributions,
            'totalWithdrawals': total_withdrawals,
            'currentBalance': current_balance,
            'progressPercentage': progress_percentage,
            'memberCount': member_count
        },
        'userStats': {
            'contributions': user_contributions,
            'withdrawals': user_withdrawals,
            'balance': user_balance
        },
        'recentTransactions': [t.to_dict() for t in recent_transactions]
    }), 200 