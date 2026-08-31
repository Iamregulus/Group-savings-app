from .conftest import register, auth_headers


def test_repeated_small_contributions_sum_exactly(client):
    resp = register(client)
    token = resp.get_json()['token']
    headers = auth_headers(token)

    resp = client.post('/api/groups', json={
        'name': 'Coffee Fund',
        'targetAmount': 100,
        'contributionAmount': 0.10,
        'contributionFrequency': 'daily',
        'maxMembers': 5,
    }, headers=headers)
    assert resp.status_code == 201
    group_id = resp.get_json()['id']

    # Three float-imprecise contributions: 0.1 + 0.1 + 0.1 != 0.3 in binary
    # floating point, but must sum exactly once stored as Decimal/Numeric.
    for _ in range(3):
        resp = client.post(f'/api/groups/{group_id}/contributions', json={
            'amount': 0.10,
            'paymentMethod': 'cash',
        }, headers=headers)
        assert resp.status_code == 201

    resp = client.get(f'/api/groups/{group_id}/stats', headers=headers)
    assert resp.status_code == 200
    total = resp.get_json()['stats']['totalContributions']
    assert total == 0.3
