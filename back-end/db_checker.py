from flask import Flask
from flask_sqlalchemy import SQLAlchemy
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Set up app with minimal configuration for db connection
app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

# Import models after initializing db to avoid circular imports
from models.user import User
from models.group import Group, GroupMember
from models.transaction import Transaction

def print_separator(title):
    print("\n" + "=" * 40)
    print(f" {title} ".center(40, "="))
    print("=" * 40)

def check_database():
    with app.app_context():
        # Check users
        print_separator("USERS")
        users = User.query.all()
        print(f"Found {len(users)} users:")
        for user in users:
            print(f"ID: {user.id}, Email: {user.email}, Name: {user.first_name} {user.last_name}")
        
        # Check groups
        print_separator("GROUPS")
        groups = Group.query.all()
        print(f"Found {len(groups)} groups:")
        for group in groups:
            print(f"ID: {group.id}, Name: {group.name}, Public: {group.is_public}, Status: {group.status}")
            print(f"  Creator: {group.creator_id}, Target: {group.target_amount}, Contribution: {group.contribution_amount}")
        
        # Check group memberships
        print_separator("GROUP MEMBERSHIPS")
        memberships = GroupMember.query.all()
        print(f"Found {len(memberships)} group memberships:")
        for membership in memberships:
            user = User.query.get(membership.user_id)
            group = Group.query.get(membership.group_id)
            user_name = f"{user.first_name} {user.last_name}" if user else "Unknown"
            group_name = group.name if group else "Unknown"
            
            print(f"User: {user_name} (ID: {membership.user_id})")
            print(f"  Group: {group_name} (ID: {membership.group_id})")
            print(f"  Role: {membership.role}, Active: {membership.is_active}")
            print(f"  Joined: {membership.joined_at}")
            print("-" * 40)
        
        # Check transactions
        print_separator("TRANSACTIONS")
        transactions = Transaction.query.all()
        print(f"Found {len(transactions)} transactions:")
        for transaction in transactions:
            print(f"ID: {transaction.id}, Type: {transaction.transaction_type}, Amount: {transaction.amount}")
            print(f"  Group: {transaction.group_id}, User: {transaction.user_id}")
            print(f"  Status: {transaction.status}, Created: {transaction.created_at}")
            print("-" * 40)

if __name__ == "__main__":
    try:
        check_database()
    except Exception as e:
        print(f"Error checking database: {e}")
        import traceback
        traceback.print_exc() 