"""Dual-admin approvals, super_user role, group flagging

Revision ID: bcad943ab8e0
Revises: 84efc7328e5f
Create Date: 2026-08-31 00:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'bcad943ab8e0'
down_revision = '84efc7328e5f'
branch_labels = None
depends_on = None


def upgrade():
    with op.batch_alter_table('groups') as batch_op:
        batch_op.add_column(sa.Column('is_flagged', sa.Boolean(), nullable=False, server_default=sa.false()))

    op.create_table(
        'withdrawal_approvals',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('transaction_id', sa.String(length=36), nullable=False),
        sa.Column('admin_id', sa.String(length=36), nullable=False),
        sa.Column('decision', sa.String(length=20), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['transaction_id'], ['transactions.id']),
        sa.ForeignKeyConstraint(['admin_id'], ['users.id']),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('transaction_id', 'admin_id', name='uq_withdrawal_approval_transaction_admin'),
    )

    # The global 'admin' role is retired in favor of the read-only 'super_user'
    # role; group-level admin (GroupMember.role) is unaffected.
    op.execute("UPDATE users SET role = 'super_user' WHERE role = 'admin'")


def downgrade():
    op.execute("UPDATE users SET role = 'admin' WHERE role = 'super_user'")

    op.drop_table('withdrawal_approvals')

    with op.batch_alter_table('groups') as batch_op:
        batch_op.drop_column('is_flagged')
