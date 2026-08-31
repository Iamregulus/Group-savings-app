"""
Create (or replace) a super_user account.

Reads credentials from environment variables -- never hardcode a real
email/password here, since this file is committed to git. Usage:

    SUPER_USER_EMAIL=you@example.com SUPER_USER_PASSWORD=... python manage_super_user.py

If a user with that email already exists, it is deleted (along with its
group memberships, transactions, notifications, and withdrawal votes) and
recreated fresh as a super_user. Intended to be run once, ad hoc, against
a specific environment -- not part of the normal boot sequence.
"""
import os
import sys

from app import create_app, db
from models.user import User
from models.group import GroupMember
from models.transaction import Transaction
from models.notification import Notification
from models.withdrawal_approval import WithdrawalApproval


def run():
    email = os.environ.get('SUPER_USER_EMAIL')
    password = os.environ.get('SUPER_USER_PASSWORD')
    first_name = os.environ.get('SUPER_USER_FIRST_NAME', 'Super')
    last_name = os.environ.get('SUPER_USER_LAST_NAME', 'User')

    if not email or not password:
        print('SUPER_USER_EMAIL and SUPER_USER_PASSWORD must both be set.')
        sys.exit(1)

    app = create_app()
    with app.app_context():
        existing = User.query.filter_by(email=email).first()
        if existing:
            print(f'Existing account found for {email} -- removing it first.')
            WithdrawalApproval.query.filter_by(admin_id=existing.id).delete()
            Notification.query.filter_by(recipient_id=existing.id).delete()
            Transaction.query.filter(
                (Transaction.user_id == existing.id) | (Transaction.approved_by == existing.id)
            ).delete(synchronize_session=False)
            GroupMember.query.filter_by(user_id=existing.id).delete()
            db.session.delete(existing)
            db.session.commit()

        user = User(
            email=email,
            first_name=first_name,
            last_name=last_name,
            role='super_user',
            is_active=True,
            is_email_verified=True,
        )
        user.password = password
        db.session.add(user)
        db.session.commit()

        print(f'super_user account ready: {email} (id={user.id})')


if __name__ == '__main__':
    run()
