import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import NotificationDropdown from './NotificationDropdown';
import ThemeToggle from './ThemeToggle';
import '../../styles/notifications.css';
import '../../styles/navbar.css';

const Navbar = ({ toggleSidebar }) => {
  const { currentUser } = useAuth();
  
  return (
    <nav className="bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <button 
              className="p-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-purple-500"
              onClick={toggleSidebar}
            >
              <span className="sr-only">Open sidebar</span>
              <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
          
          <div className="flex items-center space-x-4">
            <ThemeToggle />
            
            {currentUser && (
              <NotificationDropdown />
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;