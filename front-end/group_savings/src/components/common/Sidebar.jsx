import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import ThemeToggle from './ThemeToggle';

const Sidebar = ({ isOpen, onNavigate, onClose }) => {
  const location = useLocation();
  const { currentUser, logout } = useAuth();

  const isActive = (path) => {
    return location.pathname === path;
  };

  const sidebarClasses = `sidebar ${
    isOpen ? 'open' : ''
  }`;

  const navItemClasses = (active) =>
    `flex items-center px-4 py-3 transition-colors ${
      active 
        ? 'bg-purple-800 dark:bg-gray-800 text-white font-medium' 
        : 'text-purple-100 dark:text-gray-300 hover:bg-purple-600 dark:hover:bg-gray-700'
    }`;

  const handleLogout = () => {
    logout();
  };

  const handleNavClick = () => {
    if (onNavigate) onNavigate();
  };

  return (
    <aside className={sidebarClasses}>
      <div className="flex h-full flex-col relative">
        <div className="p-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold">SaverCircle</h1>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <button 
              className="sidebar-close"
              onClick={onClose}
              aria-label="Close menu"
            >
              <span className="material-icons">close</span>
            </button>
          </div>
        </div>

        <div className="flex flex-col flex-grow">
          {currentUser && (
            <div className="p-4">
              <div className="h-12 w-12 rounded-full bg-purple-800 dark:bg-gray-800 flex items-center justify-center text-xl font-bold">
                {currentUser.firstName?.charAt(0) || 'U'}
              </div>
            </div>
          )}

          <nav className="flex-grow space-y-1 px-2">
            <Link to="/dashboard" onClick={handleNavClick} className={navItemClasses(isActive('/dashboard'))}>
              <span className="material-icons mr-3">dashboard</span>
              Dashboard
            </Link>

            <Link to="/create-group" onClick={handleNavClick} className={navItemClasses(isActive('/create-group'))}>
              <span className="material-icons mr-3">group_add</span>
              Create Group
            </Link>

            <Link to="/profile" onClick={handleNavClick} className={navItemClasses(isActive('/profile'))}>
              <span className="material-icons mr-3">person</span>
              Profile
            </Link>

            <Link to="/notifications" onClick={handleNavClick} className={navItemClasses(isActive('/notifications'))}>
              <span className="material-icons mr-3">notifications</span>
              Notifications
            </Link>
          </nav>

          <div className="mt-auto p-4">
            <button 
              onClick={handleLogout}
              className="flex w-full items-center justify-center rounded-md bg-purple-900 dark:bg-gray-800 px-4 py-2 text-white hover:bg-purple-800 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-300 dark:focus:ring-gray-500"
            >
              <span className="material-icons mr-2">logout</span>
              Logout
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar; 