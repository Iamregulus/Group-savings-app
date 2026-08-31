"""Convert money columns from Float to Numeric(10, 2)

Revision ID: 84efc7328e5f
Revises: 508c7f4aa934
Create Date: 2026-08-31 00:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '84efc7328e5f'
down_revision = '508c7f4aa934'
branch_labels = None
depends_on = None


def upgrade():
    with op.batch_alter_table('groups') as batch_op:
        batch_op.alter_column('target_amount',
            existing_type=sa.Float(),
            type_=sa.Numeric(10, 2),
            existing_nullable=False)
        batch_op.alter_column('contribution_amount',
            existing_type=sa.Float(),
            type_=sa.Numeric(10, 2),
            existing_nullable=False)

    with op.batch_alter_table('transactions') as batch_op:
        batch_op.alter_column('amount',
            existing_type=sa.Float(),
            type_=sa.Numeric(10, 2),
            existing_nullable=False)


def downgrade():
    with op.batch_alter_table('transactions') as batch_op:
        batch_op.alter_column('amount',
            existing_type=sa.Numeric(10, 2),
            type_=sa.Float(),
            existing_nullable=False)

    with op.batch_alter_table('groups') as batch_op:
        batch_op.alter_column('contribution_amount',
            existing_type=sa.Numeric(10, 2),
            type_=sa.Float(),
            existing_nullable=False)
        batch_op.alter_column('target_amount',
            existing_type=sa.Numeric(10, 2),
            type_=sa.Float(),
            existing_nullable=False)
