from app import create_app, db
from models.user import User
import uuid

def create_admin():
    app = create_app()
    with app.app_context():
        # Check if admin exists
        existing_admin = User.query.filter_by(email="admin@example.com").first()
        if existing_admin:
            print("Admin user already exists")
            return
            
        # Create admin user
        admin = User(
            id=str(uuid.uuid4()),
            email="admin@example.com",
            first_name="Admin",
            last_name="User",
            role="admin",
            is_active=True,
            is_email_verified=True
        )
        admin.password = "admin123"  # This will be hashed by the setter
        
        db.session.add(admin)
        db.session.commit()
        
        print(f"Admin user created with ID: {admin.id}")
        print("Email: admin@example.com")
        print("Password: admin123")

if __name__ == "__main__":
    create_admin() 