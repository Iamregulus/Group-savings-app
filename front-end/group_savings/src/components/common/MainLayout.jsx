import React from 'react';
import { Link } from 'react-router-dom';
import BottomNav from './BottomNav';
import NotificationDropdown from './NotificationDropdown';
import ThemeToggle from './ThemeToggle';

const MainLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col">
      <header className="sticky top-0 z-20 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-lg mx-auto flex items-center justify-between px-4 py-3">
          <Link to="/dashboard" className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-600 text-white text-sm font-bold">S</span>
            <span className="font-semibold text-gray-900 dark:text-white">SaccoSave</span>
          </Link>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <NotificationDropdown />
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-lg w-full mx-auto px-4 py-4 pb-24">
        {children}
      </main>

      <BottomNav />
    </div>
  );
};

export default MainLayout;
