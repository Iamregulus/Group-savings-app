from decimal import Decimal
from .conftest import register, auth_headers


def _create_group_with_contribution(client, creator_token, amount='100.00'):
    resp = client.post('/api/groups', json={
        'name': 'Test Group',
        'targetAmount': 1000,
        'contributionAmount': 10,
        'contributionFrequency': 'monthly',
        'maxMembers': 5,
    }, headers=auth_headers(creator_token))
    group_id = resp.get_json()['id']

    client.post(f'/api/groups/{group_id}/contributions', json={
        'amount': amount,
        'paymentMethod': 'cash',
    }, headers=auth_headers(creator_token))

    return group_id


def _register_and_get_token(client, email):
    resp = register(client, email=email)
    return resp.get_json()['token'], resp.get_json()['user']['id']


def test_withdrawal_blocked_with_only_one_admin(client):
    creator_token, _ = _register_and_get_token(client, 'creator@example.com')
    group_id = _create_group_with_contribution(client, creator_token)

    resp = client.post(f'/api/groups/{group_id}/withdrawals', json={
        'amount': '10.00',
    }, headers=auth_headers(creator_token))

    assert resp.status_code == 400
    assert 'second admin' in resp.get_json()['message']


def test_promote_admin_and_dual_approval_completes_withdrawal(client):
    creator_token, creator_id = _register_and_get_token(client, 'creator2@example.com')
    member_token, member_id = _register_and_get_token(client, 'member2@example.com')
    group_id = _create_group_with_contribution(client, creator_token)

    client.post(f'/api/groups/{group_id}/join', json={}, headers=auth_headers(member_token))

    promote_resp = client.post(
        f'/api/groups/{group_id}/members/{member_id}/promote',
        headers=auth_headers(creator_token)
    )
    assert promote_resp.status_code == 200

    resp = client.post(f'/api/groups/{group_id}/withdrawals', json={
        'amount': '10.00',
    }, headers=auth_headers(creator_token))
    assert resp.status_code == 201
    transaction_id = resp.get_json()['transaction']['id']

    vote1 = client.put(
        f'/api/groups/{group_id}/withdrawals/{transaction_id}',
        json={'status': 'approved'}, headers=auth_headers(creator_token)
    )
    assert vote1.status_code == 200
    assert vote1.get_json()['status'] == 'pending'

    vote2 = client.put(
        f'/api/groups/{group_id}/withdrawals/{transaction_id}',
        json={'status': 'approved'}, headers=auth_headers(member_token)
    )
    assert vote2.status_code == 200
    assert vote2.get_json()['status'] == 'completed'
    assert vote2.get_json()['transaction']['status'] == 'completed'


def test_single_admin_reject_vetoes_withdrawal(client):
    creator_token, creator_id = _register_and_get_token(client, 'creator3@example.com')
    member_token, member_id = _register_and_get_token(client, 'member3@example.com')
    group_id = _create_group_with_contribution(client, creator_token)

    client.post(f'/api/groups/{group_id}/join', json={}, headers=auth_headers(member_token))
    client.post(f'/api/groups/{group_id}/members/{member_id}/promote', headers=auth_headers(creator_token))

    resp = client.post(f'/api/groups/{group_id}/withdrawals', json={
        'amount': '10.00',
    }, headers=auth_headers(creator_token))
    transaction_id = resp.get_json()['transaction']['id']

    reject = client.put(
        f'/api/groups/{group_id}/withdrawals/{transaction_id}',
        json={'status': 'rejected'}, headers=auth_headers(member_token)
    )
    assert reject.status_code == 200
    assert reject.get_json()['status'] == 'rejected'
    assert reject.get_json()['transaction']['status'] == 'rejected'


def test_admin_cannot_vote_twice(client):
    creator_token, creator_id = _register_and_get_token(client, 'creator4@example.com')
    member_token, member_id = _register_and_get_token(client, 'member4@example.com')
    group_id = _create_group_with_contribution(client, creator_token)

    client.post(f'/api/groups/{group_id}/join', json={}, headers=auth_headers(member_token))
    client.post(f'/api/groups/{group_id}/members/{member_id}/promote', headers=auth_headers(creator_token))

    resp = client.post(f'/api/groups/{group_id}/withdrawals', json={
        'amount': '10.00',
    }, headers=auth_headers(creator_token))
    transaction_id = resp.get_json()['transaction']['id']

    client.put(f'/api/groups/{group_id}/withdrawals/{transaction_id}',
               json={'status': 'approved'}, headers=auth_headers(creator_token))

    second_vote = client.put(f'/api/groups/{group_id}/withdrawals/{transaction_id}',
                              json={'status': 'approved'}, headers=auth_headers(creator_token))
    assert second_vote.status_code == 400


def test_promote_rejects_third_admin(client):
    creator_token, creator_id = _register_and_get_token(client, 'creator5@example.com')
    member_token, member_id = _register_and_get_token(client, 'member5@example.com')
    third_token, third_id = _register_and_get_token(client, 'third5@example.com')
    group_id = _create_group_with_contribution(client, creator_token)

    client.post(f'/api/groups/{group_id}/join', json={}, headers=auth_headers(member_token))
    client.post(f'/api/groups/{group_id}/join', json={}, headers=auth_headers(third_token))

    client.post(f'/api/groups/{group_id}/members/{member_id}/promote', headers=auth_headers(creator_token))

    resp = client.post(f'/api/groups/{group_id}/members/{third_id}/promote', headers=auth_headers(creator_token))
    assert resp.status_code == 400


def test_super_user_can_read_admin_endpoints(app, client):
    from app import db
    from models.user import User

    creator_token, creator_id = _register_and_get_token(client, 'creator6@example.com')

    with app.app_context():
        user = User.query.get(creator_id)
        user.role = 'super_user'
        db.session.commit()

    # Re-login to get a token carrying the super_user claim
    login = client.post('/api/auth/login', json={'email': 'creator6@example.com', 'password': 'password123'})
    su_token = login.get_json()['token']

    resp = client.get('/api/admin/groups', headers=auth_headers(su_token))
    assert resp.status_code == 200

    resp = client.get('/api/admin/cashflow', headers=auth_headers(su_token))
    assert resp.status_code == 200
    assert len(resp.get_json()) == 6


def test_regular_user_cannot_read_admin_endpoints(client):
    token, _ = _register_and_get_token(client, 'plainuser@example.com')
    resp = client.get('/api/admin/groups', headers=auth_headers(token))
    assert resp.status_code == 403


def test_departed_admins_vote_does_not_count_toward_completion(client):
    creator_token, creator_id = _register_and_get_token(client, 'creator7@example.com')
    admin2_token, admin2_id = _register_and_get_token(client, 'admin7b@example.com')
    admin3_token, admin3_id = _register_and_get_token(client, 'admin7c@example.com')
    group_id = _create_group_with_contribution(client, creator_token)

    client.post(f'/api/groups/{group_id}/join', json={}, headers=auth_headers(admin2_token))
    client.post(f'/api/groups/{group_id}/join', json={}, headers=auth_headers(admin3_token))
    client.post(f'/api/groups/{group_id}/members/{admin2_id}/promote', headers=auth_headers(creator_token))

    resp = client.post(f'/api/groups/{group_id}/withdrawals', json={
        'amount': '10.00',
    }, headers=auth_headers(creator_token))
    transaction_id = resp.get_json()['transaction']['id']

    # admin2 casts the first approval...
    vote1 = client.put(f'/api/groups/{group_id}/withdrawals/{transaction_id}',
                        json={'status': 'approved'}, headers=auth_headers(admin2_token))
    assert vote1.get_json()['status'] == 'pending'

    # ...then leaves the group, dropping it back to 1 admin.
    leave = client.post(f'/api/groups/{group_id}/leave', headers=auth_headers(admin2_token))
    assert leave.status_code == 200

    # A fresh withdrawal request can't even be made below 2 admins.
    blocked = client.post(f'/api/groups/{group_id}/withdrawals', json={'amount': '5.00'},
                           headers=auth_headers(creator_token))
    assert blocked.status_code == 400

    # Creator promotes a replacement co-admin.
    promote = client.post(f'/api/groups/{group_id}/members/{admin3_id}/promote', headers=auth_headers(creator_token))
    assert promote.status_code == 200

    # The original pending withdrawal still only has admin2's (now-stale)
    # vote plus nothing from creator -- creator must still vote themselves,
    # and admin3's fresh vote is required; admin2's old vote must not count.
    creator_vote = client.put(f'/api/groups/{group_id}/withdrawals/{transaction_id}',
                               json={'status': 'approved'}, headers=auth_headers(creator_token))
    assert creator_vote.get_json()['status'] == 'pending'  # not completed yet

    admin3_vote = client.put(f'/api/groups/{group_id}/withdrawals/{transaction_id}',
                              json={'status': 'approved'}, headers=auth_headers(admin3_token))
    assert admin3_vote.get_json()['status'] == 'completed'


def test_group_transactions_expose_approval_progress(client):
    creator_token, creator_id = _register_and_get_token(client, 'creator8@example.com')
    member_token, member_id = _register_and_get_token(client, 'member8@example.com')
    group_id = _create_group_with_contribution(client, creator_token)

    client.post(f'/api/groups/{group_id}/join', json={}, headers=auth_headers(member_token))
    client.post(f'/api/groups/{group_id}/members/{member_id}/promote', headers=auth_headers(creator_token))

    resp = client.post(f'/api/groups/{group_id}/withdrawals', json={'amount': '10.00'},
                        headers=auth_headers(creator_token))
    transaction_id = resp.get_json()['transaction']['id']

    listing = client.get(f'/api/groups/{group_id}/transactions', headers=auth_headers(creator_token))
    pending = next(t for t in listing.get_json() if t['id'] == transaction_id)
    assert pending['approvedCount'] == 0
    assert pending['requiredApprovals'] == 2
    assert pending['myVote'] is None

    client.put(f'/api/groups/{group_id}/withdrawals/{transaction_id}',
               json={'status': 'approved'}, headers=auth_headers(creator_token))

    listing2 = client.get(f'/api/groups/{group_id}/transactions', headers=auth_headers(creator_token))
    pending2 = next(t for t in listing2.get_json() if t['id'] == transaction_id)
    assert pending2['approvedCount'] == 1
    assert pending2['myVote'] == 'approved'
