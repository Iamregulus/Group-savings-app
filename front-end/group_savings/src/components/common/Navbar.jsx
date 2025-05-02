import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import NotificationDropdown from './NotificationDropdown';
import '../../styles/notifications.css';
import '../../styles/navbar.css';

const Navbar = ({ toggleSidebar }) => {
  const { currentUser } = useAuth();
  
  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="menu-toggle" onClick={toggleSidebar}>
          <span className="material-icons">menu</span>
        </div>
        
        <div className="navbar-right">
          {currentUser && (
            <NotificationDropdown />
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;