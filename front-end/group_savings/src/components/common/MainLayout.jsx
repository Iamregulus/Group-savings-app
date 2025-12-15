import React, { useState } from 'react';
import Sidebar from './Sidebar';
import NotificationDropdown from './NotificationDropdown';
import { useTheme } from '../../context/ThemeContext';

const MainLayout = ({ children }) => {
  const { darkMode } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const closeSidebar = () => setSidebarOpen(false);
  const openSidebar = () => setSidebarOpen(true);

  return (
    <div className={`app ${darkMode ? 'dark-mode' : 'light-mode'}`}>
      <Sidebar isOpen={sidebarOpen} onNavigate={closeSidebar} onClose={closeSidebar} />

      {/* Mobile top bar */}
      <div className="mobile-nav">
        <button className="menu-button" onClick={openSidebar} aria-label="Open menu">
          <span className="material-icons">menu</span>
        </button>
        <div className="mobile-actions">
          <NotificationDropdown />
        </div>
      </div>

      {/* Backdrop for mobile drawer */}
      {sidebarOpen && <div className="sidebar-backdrop" onClick={closeSidebar} />}

      <div className="content-wrapper">
        <div className="notification-bar flex justify-end px-4 py-2">
          <NotificationDropdown />
        </div>
        <main className="main-content">
          {children}
        </main>
      </div>
    </div>
  );
};

export default MainLayout; 