from app import create_app, db
from models.user import User
import uuid

def create_regular_user():
    app = create_app()
    with app.app_context():
        # Check if user exists
        existing_user = User.query.filter_by(email="user@example.com").first()
        if existing_user:
            print("Regular user already exists")
            return
            
        # Create regular user
        user = User(
            id=str(uuid.uuid4()),
            email="user@example.com",
            first_name="Regular",
            last_name="User",
            role="user",
            is_active=True,
            is_email_verified=True
        )
        user.password = "password"  # This will be hashed by the setter
        
        db.session.add(user)
        db.session.commit()
        
        print(f"Regular user created with ID: {user.id}")
        print("Email: user@example.com")
        print("Password: password")

if __name__ == "__main__":
    create_regular_user() 