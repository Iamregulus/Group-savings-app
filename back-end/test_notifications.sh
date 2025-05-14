#!/bin/bash

# Store the tokens and IDs
ADMIN_TOKEN=$(curl -s -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"admin123"}' | \
  python3 -c "import sys, json; print(json.load(sys.stdin)['token'])")

USER_TOKEN=$(curl -s -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password"}' | \
  python3 -c "import sys, json; print(json.load(sys.stdin)['token'])")

# Hard-code the group ID from our create_group.py output
GROUP_ID="943d51e1-0035-4e00-9f7c-c05fa513d8bb"

echo "Admin Token: $ADMIN_TOKEN"
echo "User Token: $USER_TOKEN"
echo "Group ID: $GROUP_ID"

# 1. Check admin notifications before any activity
echo "Checking admin notifications before any activity..."
curl -s -X GET http://localhost:5000/api/notifications/ \
  -H "Authorization: Bearer $ADMIN_TOKEN" | python3 -m json.tool

# 2. Make a contribution as a regular user
echo -e "\nMaking a contribution as regular user..."
CONTRIBUTION_RESPONSE=$(curl -s -X POST http://localhost:5000/api/groups/$GROUP_ID/contributions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $USER_TOKEN" \
  -d '{"amount": 100, "paymentMethod": "bank_transfer", "referenceNumber": "TEST12345", "description": "Test contribution"}')

echo $CONTRIBUTION_RESPONSE | python3 -m json.tool

# 3. Check admin notifications again (should have a contribution notification)
echo -e "\nChecking admin notifications after contribution..."
curl -s -X GET http://localhost:5000/api/notifications/ \
  -H "Authorization: Bearer $ADMIN_TOKEN" | python3 -m json.tool

# 4. Request a withdrawal as a regular user
echo -e "\nRequesting a withdrawal as regular user..."
WITHDRAWAL_RESPONSE=$(curl -s -X POST http://localhost:5000/api/groups/$GROUP_ID/withdrawals \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $USER_TOKEN" \
  -d '{"amount": 50, "description": "Test withdrawal request"}')

echo $WITHDRAWAL_RESPONSE | python3 -m json.tool

# 5. Check admin notifications again (should have a withdrawal request notification too)
echo -e "\nChecking admin notifications after withdrawal request..."
curl -s -X GET http://localhost:5000/api/notifications/ \
  -H "Authorization: Bearer $ADMIN_TOKEN" | python3 -m json.tool

# Extract the transaction ID from the withdrawal response
TRANSACTION_ID=$(echo $WITHDRAWAL_RESPONSE | python3 -c "import sys, json; print(json.load(sys.stdin)['transaction']['id'])")

echo "Withdrawal Transaction ID: $TRANSACTION_ID"

echo -e "\nApproving withdrawal request as admin..."
curl -s -X PUT http://localhost:5000/api/groups/$GROUP_ID/withdrawals/$TRANSACTION_ID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{"status": "completed", "remarks": "Approved by admin"}' | python3 -m json.tool

# 7. Check user notifications (should have a withdrawal approval notification)
echo -e "\nChecking user notifications after withdrawal approval..."
curl -s -X GET http://localhost:5000/api/notifications/ \
  -H "Authorization: Bearer $USER_TOKEN" | python3 -m json.tool 