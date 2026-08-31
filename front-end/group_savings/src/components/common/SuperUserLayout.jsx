import React from 'react';
import { HiOutlineArrowRightOnRectangle } from 'react-icons/hi2';
import ThemeToggle from './ThemeToggle';
import { useAuth } from '../../context/AuthContext';

const SuperUserLayout = ({ children }) => {
  const { currentUser, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-600 text-white text-sm font-bold">S</span>
            <span className="font-semibold text-gray-900 dark:text-white">SaccoSave</span>
            <span className="ml-2 rounded-full bg-violet-100 dark:bg-violet-900/50 px-2 py-0.5 text-xs font-medium text-violet-700 dark:text-violet-400">
              Super User &middot; Read only
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500 dark:text-gray-400 hidden sm:inline">
              {currentUser?.firstName} {currentUser?.lastName}
            </span>
            <ThemeToggle />
            <button onClick={logout} className="p-2 rounded-full text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700">
              <HiOutlineArrowRightOnRectangle className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-6">
        {children}
      </main>
    </div>
  );
};

export default SuperUserLayout;
