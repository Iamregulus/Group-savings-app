import React from 'react';
import Sidebar from './Sidebar';
import NotificationDropdown from './NotificationDropdown';
import { useTheme } from '../../context/ThemeContext';

const MainLayout = ({ children }) => {
  const { darkMode } = useTheme();

  return (
    <div className={`app ${darkMode ? 'dark-mode' : 'light-mode'}`} style={{ display: 'flex', width: '100%', height: '100vh', overflow: 'hidden' }}>
      <Sidebar />
      <div className="content-wrapper" style={{ flex: 1, marginLeft: 0 }}>
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