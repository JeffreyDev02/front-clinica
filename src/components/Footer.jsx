import React from 'react';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-info">
          <p>&copy; 2025 MediConnect - Sistema de Gestión de Citas Médicas</p>
          <p className="footer-links">
            <a href="#">Privacidad</a>
            <span className="dot">•</span>
            <a href="#">Términos</a>
            <span className="dot">•</span>
            <a href="#">Soporte</a>
          </p>
        </div>
        <div className="footer-status">
          <span className="status-dot"></span>
          <span>Sistema Operativo</span>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .footer {
          padding: 2rem;
          border-top: 1px solid var(--border);
          background: var(--surface);
          margin-top: auto;
        }

        .footer-content {
          max-width: 1200px;
          margin: 0 auto;
          display: flex;
          justify-content: space-between;
          align-items: center;
          color: var(--text-muted);
          font-size: 0.875rem;
        }

        .footer-info {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .footer-links {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .footer-links a:hover {
          color: var(--primary);
        }

        .dot {
          opacity: 0.5;
        }

        .footer-status {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-weight: 500;
        }

        .status-dot {
          width: 8px;
          height: 8px;
          background: #22c55e;
          border-radius: 50%;
          box-shadow: 0 0 8px rgba(34, 197, 94, 0.5);
        }

        @media (max-width: 768px) {
          .footer-content {
            flex-direction: column;
            gap: 1.5rem;
            text-align: center;
          }
          .footer-links {
            justify-content: center;
          }
        }
      `}} />
    </footer>
  );
};

export default Footer;
