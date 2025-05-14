from app import create_app, db
from models.user import User

def list_users():
    app = create_app()
    with app.app_context():
        users = User.query.all()
        print('Users in database:')
        for user in users:
            print(f'ID: {user.id}, Email: {user.email}, Is active: {user.is_active}')

if __name__ == "__main__":
    list_users() 