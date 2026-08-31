import pytest

from app import create_app, db as _db


@pytest.fixture
def app():
    flask_app = create_app(test_config={
        'TESTING': True,
        'SECRET_KEY': 'test',
        'SQLALCHEMY_DATABASE_URI': 'sqlite:///:memory:',
        'SQLALCHEMY_TRACK_MODIFICATIONS': False,
        'JWT_SECRET_KEY': 'test',
    })

    with flask_app.app_context():
        _db.create_all()
        yield flask_app
        _db.session.remove()
        _db.drop_all()


@pytest.fixture
def client(app):
    return app.test_client()


def register(client, email='alice@example.com', password='password123',
             first_name='Alice', last_name='Anderson'):
    return client.post('/api/auth/register', json={
        'email': email,
        'password': password,
        'firstName': first_name,
        'lastName': last_name,
    })


def auth_headers(token):
    return {'Authorization': f'Bearer {token}'}
