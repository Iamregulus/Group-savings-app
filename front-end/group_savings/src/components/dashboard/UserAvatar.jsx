import React from 'react';

const UserAvatar = ({ user, size = 'medium', showName = false }) => {
  // Get initials from name
  const getInitials = () => {
    if (!user.name) return '?';
    
    const nameParts = user.name.split(' ');
    if (nameParts.length === 1) {
      return nameParts[0].charAt(0).toUpperCase();
    } else {
      return (
        nameParts[0].charAt(0).toUpperCase() + 
        nameParts[nameParts.length - 1].charAt(0).toUpperCase()
      );
    }
  };
  
  // Get size class
  const getSizeClass = () => {
    switch (size) {
      case 'small': return 'avatar-sm';
      case 'large': return 'avatar-lg';
      case 'xlarge': return 'avatar-xl';
      default: return 'avatar-md';
    }
  };
  
  return (
    <div className="user-avatar-container">
      <div className={`user-avatar ${getSizeClass()}`}>
        {user.profilePicture ? (
          <img 
            src={user.profilePicture} 
            alt={user.name || 'User'} 
            className="avatar-img"
          />
        ) : (
          <div className="avatar-initials">{getInitials()}</div>
        )}
      </div>
      {showName && user.name && (
        <span className="avatar-name">{user.name}</span>
      )}
    </div>
  );
};

export default UserAvatar;