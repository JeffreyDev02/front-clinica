import React from 'react';
import { Search, Bell, User, Menu } from 'lucide-react';

const Navbar = ({ toggleSidebar }) => {
  return (
    <nav className="navbar glass">
      <div className="navbar-left">
        <button className="menu-toggle" onClick={toggleSidebar}>
          <Menu size={24} />
        </button>
        <div className="search-bar">
          <Search size={18} className="search-icon" />
          <input type="text" placeholder="Buscar pacientes, doctores..." />
        </div>
      </div>
      
      <div className="navbar-right">
        <button className="nav-icon-btn">
          <Bell size={20} />
          <span className="badge"></span>
        </button>
        <div className="user-profile">
          <div className="user-info">
            <span className="user-name">Admin</span>
            <span className="user-role">Gestor Médico</span>
          </div>
          <div className="user-avatar">
            <User size={20} />
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .navbar {
          height: var(--navbar-height);
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 2rem;
          position: sticky;
          top: 0;
          z-index: 100;
          box-shadow: var(--shadow);
        }

        .navbar-left, .navbar-right {
          display: flex;
          align-items: center;
          gap: 1.5rem;
        }

        .menu-toggle {
          background: none;
          color: var(--text-main);
          display: none;
        }

        @media (max-width: 768px) {
          .menu-toggle {
            display: block;
          }
        }

        .search-bar {
          position: relative;
          display: flex;
          align-items: center;
          background: var(--background);
          padding: 0.5rem 1rem;
          border-radius: var(--radius);
          width: 300px;
          border: 1px solid var(--border);
        }

        .search-bar input {
          background: none;
          border: none;
          outline: none;
          margin-left: 0.5rem;
          width: 100%;
          font-size: 0.9rem;
        }

        .search-icon {
          color: var(--text-muted);
        }

        .nav-icon-btn {
          background: var(--background);
          color: var(--text-muted);
          padding: 0.5rem;
          border-radius: 50%;
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: var(--transition);
        }

        .nav-icon-btn:hover {
          background: var(--border);
          color: var(--primary);
        }

        .badge {
          position: absolute;
          top: 0;
          right: 0;
          width: 10px;
          height: 10px;
          background: #ef4444;
          border-radius: 50%;
          border: 2px solid var(--surface);
        }

        .user-profile {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.25rem 0.5rem;
          border-radius: var(--radius);
          cursor: pointer;
          transition: var(--transition);
        }

        .user-profile:hover {
          background: var(--background);
        }

        .user-info {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
        }

        .user-name {
          font-weight: 600;
          font-size: 0.9rem;
        }

        .user-role {
          font-size: 0.75rem;
          color: var(--text-muted);
        }

        .user-avatar {
          width: 38px;
          height: 38px;
          background: var(--primary);
          color: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }
      `}} />
    </nav>
  );
};

export default Navbar;
