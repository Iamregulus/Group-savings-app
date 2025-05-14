from app import create_app, db
from models.user import User

app = create_app()
with app.app_context():
    # Check if test user already exists
    test_user = User.query.filter_by(email='test@example.com').first()
    if not test_user:
        # Create test user
        user = User(
            email='test@example.com',
            first_name='Test',
            last_name='User',
            is_email_verified=True,
            is_active=True,
            role='user'
        )
        user.password = 'password123'
        db.session.add(user)
        db.session.commit()
        print(f"Test user created with ID: {user.id}")
        print(f"Login with: test@example.com / password123")
    else:
        print(f"Test user already exists with ID: {test_user.id}")
        print(f"Login with: test@example.com / password123") 