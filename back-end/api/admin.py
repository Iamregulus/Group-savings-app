from functools import wraps
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt
from datetime import datetime, timedelta
from collections import OrderedDict
from decimal import Decimal
from models.user import User
from models.group import Group, GroupMember
from models.transaction import Transaction
from app import db

admin_bp = Blueprint('admin', __name__)

# Super users have read-only, platform-wide oversight. They are never a
# participant in any group's workflow (no notifications, no approvals).
def super_user_required():
    def wrapper(fn):
        @wraps(fn)
        @jwt_required()
        def decorator(*args, **kwargs):
            claims = get_jwt()
            if claims.get('role') == 'super_user':
                return fn(*args, **kwargs)
            else:
                return jsonify(msg="Super users only!"), 403
        return decorator
    return wrapper


def _completed_sum(group_id, transaction_type, before=None, after=None):
    query = Transaction.query.filter_by(
        group_id=group_id,
        transaction_type=transaction_type,
        status='completed'
    )
    if before is not None:
        query = query.filter(Transaction.processed_at < before)
    if after is not None:
        query = query.filter(Transaction.processed_at >= after)
    return query.with_entities(db.func.sum(Transaction.amount)).scalar() or Decimal('0')


def _group_overview(group):
    total_contributions = _completed_sum(group.id, 'contribution')
    total_withdrawals = _completed_sum(group.id, 'withdrawal')
    pool_total = total_contributions - total_withdrawals

    thirty_days_ago = datetime.utcnow() - timedelta(days=30)
    contributions_before = _completed_sum(group.id, 'contribution', before=thirty_days_ago)
    withdrawals_before = _completed_sum(group.id, 'withdrawal', before=thirty_days_ago)
    pool_30_days_ago = contributions_before - withdrawals_before

    if pool_30_days_ago > 0:
        growth_percentage = float((pool_total - pool_30_days_ago) / pool_30_days_ago * 100)
    else:
        growth_percentage = 100.0 if pool_total > 0 else 0.0

    # Auto-flag rule: a group whose pool has shrunk over the last 30 days is
    # surfaced for review. This is separate from, and OR'd with, the manual
    # super_user flag — see Group.is_flagged.
    is_flagged_auto = growth_percentage < 0

    member_count = GroupMember.query.filter_by(group_id=group.id, is_active=True).count()

    group_dict = group.to_dict()
    group_dict.update({
        'poolTotal': pool_total,
        'moneyIn': total_contributions,
        'moneyOut': total_withdrawals,
        'growthPercentage': round(growth_percentage, 1),
        'memberCount': member_count,
        'isFlaggedAuto': is_flagged_auto,
        'isFlagged': group.is_flagged or is_flagged_auto,
    })
    return group_dict


@admin_bp.route('/stats', methods=['GET'])
@super_user_required()
def get_admin_stats():
    """
    Provides key statistics for the super user overview.
    """
    total_groups = db.session.query(Group).count()
    total_members = db.session.query(User).count()

    total_savings = db.session.query(db.func.sum(Transaction.amount))\
        .filter(Transaction.transaction_type == 'contribution', Transaction.status == 'completed')\
        .scalar() or 0

    pending_withdrawals = db.session.query(Transaction)\
        .filter(Transaction.transaction_type == 'withdrawal', Transaction.status == 'pending')\
        .count()

    recent_groups = Group.query.order_by(Group.created_at.desc()).limit(5).all()

    stats = {
        'totalGroups': total_groups,
        'totalMembers': total_members,
        'totalSavings': total_savings,
        'pendingWithdrawals': pending_withdrawals,
    }

    return jsonify({
        'stats': stats,
        'recentGroups': [group.to_dict() for group in recent_groups]
    })


@admin_bp.route('/groups', methods=['GET'])
@super_user_required()
def get_all_groups():
    """
    Every group on the platform, public and private, with pool totals,
    money in/out, growth, and flagged status. Read-only.
    """
    groups = Group.query.order_by(Group.created_at.desc()).all()
    return jsonify([_group_overview(group) for group in groups]), 200


@admin_bp.route('/groups/<group_id>/flag', methods=['PUT'])
@super_user_required()
def set_group_flag(group_id):
    """Manually flag or unflag a group for review. Does not affect the
    auto-computed flag, which is always reported separately."""
    group = Group.query.get(group_id)
    if not group:
        return jsonify({'message': 'Group not found'}), 404

    data = request.get_json() or {}
    if 'flagged' not in data:
        return jsonify({'message': 'flagged is required'}), 400

    group.is_flagged = bool(data['flagged'])
    db.session.commit()

    return jsonify(_group_overview(group)), 200


def _add_months(dt, delta):
    month_index = dt.month - 1 + delta
    year = dt.year + month_index // 12
    month = month_index % 12 + 1
    return dt.replace(year=year, month=month, day=1, hour=0, minute=0, second=0, microsecond=0)


@admin_bp.route('/cashflow', methods=['GET'])
@super_user_required()
def get_cashflow():
    """
    Monthly money-in/money-out totals across the whole platform, for the
    last 6 months, oldest first.
    """
    current_month_start = _add_months(datetime.utcnow(), 0)

    months = OrderedDict()
    for i in range(5, -1, -1):
        month_start = _add_months(current_month_start, -i)
        key = month_start.strftime('%Y-%m')
        months[key] = {'month': month_start.strftime('%b %Y'), 'moneyIn': Decimal('0'), 'moneyOut': Decimal('0')}

    earliest_start = _add_months(current_month_start, -5)

    transactions = Transaction.query.filter(
        Transaction.status == 'completed',
        Transaction.processed_at.isnot(None),
        Transaction.processed_at >= earliest_start
    ).all()

    for t in transactions:
        key = t.processed_at.strftime('%Y-%m')
        if key not in months:
            continue
        if t.transaction_type == 'contribution':
            months[key]['moneyIn'] += t.amount
        elif t.transaction_type == 'withdrawal':
            months[key]['moneyOut'] += t.amount

    return jsonify(list(months.values())), 200
