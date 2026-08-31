from .conftest import register, auth_headers


def test_health_check(client):
    resp = client.get('/health')
    assert resp.status_code == 200
    assert resp.get_json()['status'] == 'healthy'


def test_register_and_login(client):
    resp = register(client)
    assert resp.status_code == 201
    body = resp.get_json()
    assert body['user']['email'] == 'alice@example.com'
    assert 'token' in body

    resp = client.post('/api/auth/login', json={
        'email': 'alice@example.com',
        'password': 'password123',
    })
    assert resp.status_code == 200
    assert 'token' in resp.get_json()


def test_login_rejects_wrong_password(client):
    register(client)

    resp = client.post('/api/auth/login', json={
        'email': 'alice@example.com',
        'password': 'not-the-password',
    })
    assert resp.status_code == 401


def test_register_rejects_duplicate_email(client):
    register(client)
    resp = register(client)
    assert resp.status_code == 409


def test_profile_requires_auth(client):
    resp = register(client)
    token = resp.get_json()['token']

    resp = client.get('/api/auth/profile')
    assert resp.status_code == 401

    resp = client.get('/api/auth/profile', headers=auth_headers(token))
    assert resp.status_code == 200
    assert resp.get_json()['email'] == 'alice@example.com'
