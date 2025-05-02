from app import create_app, db
from models.user import User
from models.group import Group, GroupMember
from models.transaction import Transaction
import uuid
import datetime

def init_db():
    app = create_app()
    with app.app_context():
        # Create all tables
        db.create_all()
        
        # Check if there are any users (to avoid recreating admin)
        if User.query.count() == 0:
            print("Creating initial admin user...")
            
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
            
            db.session.add_all([admin, user])
            db.session.commit()
            
            print(f"Admin user created with ID: {admin.id}")
            print("Email: admin@example.com")
            print("Password: admin123")
            
            print(f"Regular user created with ID: {user.id}")
            print("Email: user@example.com")
            print("Password: password")
            
            # Create a sample group
            group = Group(
                name="Sample Savings Group",
                description="This is a sample group for demonstration purposes",
                target_amount=1000.00,
                contribution_amount=100.00,
                contribution_frequency="monthly",
                max_members=10,
                is_public=True,
                creator_id=admin.id,
                status='active'
            )
            
            db.session.add(group)
            db.session.commit()
            
            # Add admin as group admin
            admin_member = GroupMember(
                group_id=group.id,
                user_id=admin.id,
                role="admin"
            )
            
            # Add user as group member
            user_member = GroupMember(
                group_id=group.id,
                user_id=user.id,
                role="member"
            )
            
            db.session.add_all([admin_member, user_member])
            db.session.commit()
            
            print(f"Sample group created: {group.name}")

if __name__ == "__main__":
    init_db()
    print("Database initialization completed.") 