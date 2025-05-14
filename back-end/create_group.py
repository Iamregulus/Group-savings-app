from app import create_app, db
from models.user import User
from models.group import Group, GroupMember

def create_sample_group():
    app = create_app()
    with app.app_context():
        # Get admin and regular user
        admin = User.query.filter_by(email="admin@example.com").first()
        user = User.query.filter_by(email="user@example.com").first()
        
        if not admin or not user:
            print("Admin or regular user not found")
            return

        # Check if a group already exists
        existing_group = Group.query.filter_by(name="Sample Savings Group").first()
        if existing_group:
            print("Sample group already exists")
            return
            
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
        print(f"Group ID: {group.id}")

if __name__ == "__main__":
    create_sample_group() 