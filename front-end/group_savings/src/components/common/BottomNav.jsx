import React from 'react';
import { NavLink } from 'react-router-dom';
import { HiHome, HiOutlineHome, HiUserGroup, HiOutlineUserGroup, HiChartBar, HiOutlineChartBar, HiUser, HiOutlineUser } from 'react-icons/hi2';

const TABS = [
  { to: '/dashboard', label: 'Home', Icon: HiOutlineHome, ActiveIcon: HiHome },
  { to: '/groups', label: 'Groups', Icon: HiOutlineUserGroup, ActiveIcon: HiUserGroup },
  { to: '/analytics', label: 'Analytics', Icon: HiOutlineChartBar, ActiveIcon: HiChartBar },
  { to: '/profile', label: 'Profile', Icon: HiOutlineUser, ActiveIcon: HiUser },
];

const BottomNav = () => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 pb-[env(safe-area-inset-bottom)]">
      <div className="max-w-lg mx-auto grid grid-cols-4">
        {TABS.map(({ to, label, Icon, ActiveIcon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center gap-0.5 py-2.5 text-xs font-medium ${
                isActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-500 dark:text-gray-400'
              }`
            }
          >
            {({ isActive }) => {
              const TabIcon = isActive ? ActiveIcon : Icon;
              return (
                <>
                  <TabIcon className="h-6 w-6" />
                  <span>{label}</span>
                </>
              );
            }}
          </NavLink>
        ))}
      </div>
    </nav>
  );
};

export default BottomNav;
