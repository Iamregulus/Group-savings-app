from flask import Blueprint, request, jsonify, url_for, current_app
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from flask_mail import Message
from models.user import User
from app import db, mail
import datetime
import os

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    
    # Check if user already exists
    if User.query.filter_by(email=data.get('email')).first():
        return jsonify({'message': 'Email already registered'}), 409
    
    # Create new user
    user = User(
        email=data.get('email'),
        first_name=data.get('firstName'),
        last_name=data.get('lastName'),
        phone_number=data.get('phoneNumber')
    )
    
    # Set password (using property setter)
    user.password = data.get('password')
    
    # Save to database
    db.session.add(user)
    db.session.commit()
    
    # Create access token
    access_token = create_access_token(
        identity=user.id,
        additional_claims={'role': user.role, 'email': user.email}
    )
    
    return jsonify({
        'message': 'User registered successfully',
        'user': user.to_dict(),
        'token': access_token
    }), 201

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    
    # Find user by email
    user = User.query.filter_by(email=email).first()
    
    # Check if user exists and password is correct
    if not user or not user.verify_password(password):
        return jsonify({'message': 'Invalid email or password'}), 401
    
    # Check if user is active
    if not user.is_active:
        return jsonify({'message': 'Account is deactivated'}), 403
    
    # Create access token
    access_token = create_access_token(
        identity=user.id,
        additional_claims={'role': user.role, 'email': user.email}
    )
    
    return jsonify({
        'message': 'Login successful',
        'user': user.to_dict(),
        'token': access_token
    }), 200

@auth_bp.route('/profile', methods=['GET'])
@jwt_required()
def get_profile():
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    
    if not user:
        return jsonify({'message': 'User not found'}), 404
    
    return jsonify(user.to_dict()), 200

@auth_bp.route('/profile', methods=['PUT'])
@jwt_required()
def update_profile():
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    
    if not user:
        return jsonify({'message': 'User not found'}), 404
    
    data = request.get_json()
    
    # Update fields if provided
    if 'firstName' in data:
        user.first_name = data['firstName']
    if 'lastName' in data:
        user.last_name = data['lastName']
    if 'phoneNumber' in data:
        user.phone_number = data['phoneNumber']
    if 'profilePicture' in data:
        user.profile_picture = data['profilePicture']
    
    db.session.commit()
    
    return jsonify({
        'message': 'Profile updated successfully',
        'user': user.to_dict()
    }), 200

@auth_bp.route('/password', methods=['PUT'])
@jwt_required()
def change_password():
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    
    if not user:
        return jsonify({'message': 'User not found'}), 404
    
    data = request.get_json()
    current_password = data.get('currentPassword')
    new_password = data.get('newPassword')
    
    # Verify current password
    if not user.verify_password(current_password):
        return jsonify({'message': 'Current password is incorrect'}), 401
    
    # Set new password
    user.password = new_password
    db.session.commit()
    
    return jsonify({'message': 'Password changed successfully'}), 200

@auth_bp.route('/reset-password', methods=['POST'])
def request_password_reset():
    data = request.get_json()
    email = data.get('email')
    
    if not email:
        return jsonify({'message': 'Email is required'}), 400
    
    # Check if user exists
    user = User.query.filter_by(email=email).first()
    if not user:
        # For security reasons, still return successful response even if user doesn't exist
        return jsonify({'message': 'If the email exists, a password reset link has been sent'}), 200
    
    # Generate reset token
    token = user.generate_reset_token()
    db.session.commit()
    
    # Create reset URL (frontend URL)
    frontend_url = os.getenv('FRONTEND_URL', 'http://localhost:5173')
    reset_url = f"{frontend_url}/#/reset-password/{token}"
    
    # Send email with reset link
    try:
        msg = Message(
            'Password Reset Request',
            recipients=[user.email],
            sender=current_app.config.get('MAIL_DEFAULT_SENDER')
        )
        
        msg.body = f"""
        Hello {user.first_name},
        
        You recently requested to reset your password for your SaverCircle account.
        
        Please click the link below to reset your password:
        {reset_url}
        
        This link is valid for 24 hours. If you did not request a password reset, please ignore this email.
        
        Regards,
        SaverCircle Team
        """
        
        mail.send(msg)
    except Exception as e:
        # Log the error but don't expose details to user
        print(f"Error sending password reset email: {str(e)}")
    
    return jsonify({'message': 'If the email exists, a password reset link has been sent'}), 200

@auth_bp.route('/reset-password/<token>', methods=['POST'])
def reset_password(token):
    data = request.get_json()
    new_password = data.get('password')
    
    if not new_password:
        return jsonify({'message': 'New password is required'}), 400
    
    # Find the user with this token
    user = User.query.filter_by(reset_token=token).first()
    
    if not user or not user.verify_reset_token(token):
        return jsonify({'message': 'Invalid or expired reset token'}), 400
    
    # Update the password and clear the token
    user.password = new_password
    user.clear_reset_token()
    db.session.commit()
    
    return jsonify({'message': 'Password has been reset successfully'}), 200

@auth_bp.route('/verify-email/<token>', methods=['GET'])
def verify_email(token):
    # TODO: Implement email verification
    # This would typically involve:
    # 1. Verifying the token is valid
    # 2. Finding the user associated with the token
    # 3. Marking the user's email as verified
    
    # Mock implementation (replace with actual implementation)
    return jsonify({'message': 'Email verified successfully'}), 200 