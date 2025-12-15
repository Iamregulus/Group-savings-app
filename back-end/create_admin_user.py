from app import create_app, db
from models.user import User
import uuid

def create_admin_user():
    app = create_app()
    with app.app_context():
        # Check if user exists
        admin_email = "admin@example.com"
        existing_user = User.query.filter_by(email=admin_email).first()
        if existing_user:
            print(f"Admin user with email {admin_email} already exists. Ensuring password and role are correct.")
            # Ensure the user has the admin role
            if existing_user.role != 'admin':
                existing_user.role = 'admin'
                print("Updated user to have admin role.")
            
            # Reset the password to the known demo password
            existing_user.password = "adminpassword"
            db.session.commit()
            print("Admin password has been reset to 'adminpassword'.")
            return
            
        # Create admin user
        admin = User(
            id=str(uuid.uuid4()),
            email=admin_email,
            first_name="Admin",
            last_name="User",
            role="admin",  # Set role to 'admin'
            is_active=True,
            is_email_verified=True
        )
        admin.password = "adminpassword"  # Use a secure, memorable password
        
        db.session.add(admin)
        db.session.commit()
        
        print(f"Admin user created successfully with ID: {admin.id}")
        print(f"Email: {admin_email}")
        print("Password: adminpassword")

if __name__ == "__main__":
    create_admin_user() 