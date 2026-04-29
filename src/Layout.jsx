import { useContext } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Upload, FileText, LogOut, ShieldAlert, Sun, Moon } from 'lucide-react';
import { ThemeContext } from './App';
import './Layout.css';

const Layout = () => {
  const location = useLocation();
  const { isDarkMode, toggleTheme } = useContext(ThemeContext);

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/upload', label: 'Upload Documents', icon: Upload },
    { path: '/results', label: 'Results', icon: ShieldAlert },
    { path: '/reports', label: 'Reports', icon: FileText },
  ];

  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="logo-container">
            <ShieldAlert size={32} color="#dc2626" />
            <h2>DealerGuard AI</h2>
          </div>
          <button className="theme-toggle mobile-only" onClick={toggleTheme} aria-label="Toggle Theme">
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </div>
        <div className="dealership-info">
          <p className="dealership-name">TATA Motors - Delhi South</p>
        </div>

        <nav className="sidebar-nav">
          <ul>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={`nav-link ${isActive ? 'active' : ''}`}
                  >
                    <Icon size={20} />
                    <span>{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="sidebar-footer">
          <Link to="/" className="nav-link logout">
            <LogOut size={20} />
            <span>Logout</span>
          </Link>
        </div>
      </aside>
      
      <main className="main-content">
        <header className="topbar">
          <div className="topbar-actions">
            <button className="theme-toggle desktop-only" onClick={toggleTheme} aria-label="Toggle Theme">
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <div className="user-profile">
              <div className="avatar">A</div>
              <span>Admin User</span>
            </div>
          </div>
        </header>
        <div className="content-area">
          <Outlet />
        </div>
      </main>
    </div>
  );
};


export default Layout;
