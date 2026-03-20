import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Users, UserRound, Calendar, LogOut, HeartPulse } from 'lucide-react';

const Sidebar = () => {
  const menuItems = [
    { name: 'Inicio', icon: <Home size={20} />, path: '/' },
    { name: 'Pacientes', icon: <Users size={20} />, path: '/pacientes' },
    { name: 'Doctores', icon: <UserRound size={20} />, path: '/doctores' },
    { name: 'Citas', icon: <Calendar size={20} />, path: '/citas' },
  ];

  return (
    <aside className="sidebar glass">
      <div className="sidebar-header">
        <HeartPulse size={30} className="logo-icon" />
        <h1 className="logo-text">MediConnect</h1>
      </div>

      <nav className="sidebar-nav">
        <ul>
          {menuItems.map((item) => (
            <li key={item.name}>
              <NavLink 
                to={item.path} 
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              >
                {item.icon}
                <span>{item.name}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className="sidebar-footer">
        <button className="logout-btn">
          <LogOut size={20} />
          <span>Cerrar Sesión</span>
        </button>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .sidebar {
          width: var(--sidebar-width);
          height: 100vh;
          display: flex;
          flex-direction: column;
          position: fixed;
          left: 0;
          top: 0;
          z-index: 200;
          padding: 1.5rem;
          box-shadow: var(--shadow-lg);
          transition: var(--transition);
        }

        .sidebar-header {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 2.5rem;
          padding-left: 0.5rem;
        }

        .logo-icon {
          color: var(--primary);
        }

        .logo-text {
          font-size: 1.25rem;
          font-weight: 700;
          color: var(--text-main);
          letter-spacing: -0.5px;
        }

        .sidebar-nav {
          flex: 1;
        }

        .sidebar-nav ul {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .nav-link {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 0.875rem 1rem;
          border-radius: var(--radius);
          color: var(--text-muted);
          font-weight: 500;
          transition: var(--transition);
        }

        .nav-link:hover {
          background: rgba(14, 165, 233, 0.1);
          color: var(--primary);
        }

        .nav-link.active {
          background: var(--primary);
          color: white;
          box-shadow: 0 4px 12px rgba(14, 165, 233, 0.3);
        }

        .sidebar-footer {
          margin-top: auto;
          padding-top: 1rem;
          border-top: 1px solid var(--border);
        }

        .logout-btn {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 0.875rem 1rem;
          border-radius: var(--radius);
          background: none;
          color: #ef4444;
          font-weight: 500;
          transition: var(--transition);
        }

        .logout-btn:hover {
          background: rgba(239, 68, 68, 0.1);
        }

        @media (max-width: 768px) {
          .sidebar {
            transform: translateX(-100%);
          }
          .sidebar.open {
            transform: translateX(0);
          }
        }
      `}} />
    </aside>
  );
};

export default Sidebar;
