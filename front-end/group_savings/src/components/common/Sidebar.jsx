import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import '../../styles/sidebar.css';

const Sidebar = ({ className }) => {
  const { currentUser, logout, isAdmin } = useAuth();
  const { darkMode, toggleTheme } = useTheme();
  const navigate = useNavigate();
  
  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  
  if (!currentUser) return null;
  
  return (
    <aside className={`sidebar ${className || ''}`}>
      <div className="sidebar-header">
        <Link to="/" className="sidebar-logo">
          SaverCircle
        </Link>
        <div className="theme-toggle" onClick={toggleTheme} title={darkMode ? "Switch to light mode" : "Switch to dark mode"}>
          {darkMode ? (
            <span className="material-icons">light_mode</span>
          ) : (
            <span className="material-icons">dark_mode</span>
          )}
        </div>
      </div>
      
      <div className="sidebar-user">
        <div className="user-avatar">
          {currentUser.name?.charAt(0).toUpperCase() || 'U'}
        </div>
        <div className="user-info">
          <div className="user-name">{currentUser.name}</div>
        </div>
      </div>
      
      <nav className="sidebar-nav">
        {isAdmin ? (
          <>
            <Link to="/admin" className="nav-item">
              <span className="material-icons">dashboard</span>
              <span>Admin Dashboard</span>
            </Link>
            <Link to="/admin/members" className="nav-item">
              <span className="material-icons">people</span>
              <span>Manage Members</span>
            </Link>
            <Link to="/admin/withdrawals" className="nav-item">
              <span className="material-icons">payments</span>
              <span>Withdrawal Requests</span>
            </Link>
          </>
        ) : (
          <>
            <Link to="/dashboard" className="nav-item">
              <span className="material-icons">dashboard</span>
              <span>Dashboard</span>
            </Link>
            <Link to="/create-group" className="nav-item">
              <span className="material-icons">group_add</span>
              <span>Create Group</span>
            </Link>
          </>
        )}
        <Link to="/profile" className="nav-item">
          <span className="material-icons">person</span>
          <span>Profile</span>
        </Link>
        <Link to="/notifications" className="nav-item">
          <span className="material-icons">notifications</span>
          <span>Notifications</span>
        </Link>
        <div className="nav-item logout" onClick={handleLogout}>
          <span className="material-icons">logout</span>
          <span>Logout</span>
        </div>
      </nav>
    </aside>
  );
};

export default Sidebar; 