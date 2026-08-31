import React from 'react';

const SIZES = {
  small: 'h-8 w-8 text-xs',
  medium: 'h-10 w-10 text-sm',
  large: 'h-16 w-16 text-lg',
  xlarge: 'h-24 w-24 text-2xl',
};

const UserAvatar = ({ user, size = 'medium', showName = false }) => {
  const initials = user
    ? `${(user.firstName || '?')[0]}${(user.lastName || '')[0] || ''}`.toUpperCase()
    : '?';

  return (
    <div className="flex items-center gap-2">
      <div className={`flex items-center justify-center rounded-full bg-emerald-600 text-white font-semibold flex-shrink-0 ${SIZES[size] || SIZES.medium}`}>
        {user?.profilePicture ? (
          <img src={user.profilePicture} alt={`${user.firstName} ${user.lastName}`} className="h-full w-full rounded-full object-cover" />
        ) : (
          initials
        )}
      </div>
      {showName && user && (
        <span className="font-medium text-gray-900 dark:text-white">{user.firstName} {user.lastName}</span>
      )}
    </div>
  );
};

export default UserAvatar;
