import React from 'react';
import { ShieldCheck, Clock, Users, CalendarCheck, TrendingUp, Activity } from 'lucide-react';

const Home = () => {
  const stats = [
    { label: 'Citas de hoy', value: '24', icon: <CalendarCheck size={24} />, color: '#0ea5e9' },
    { label: 'Nuevos pacientes', value: '12', icon: <Users size={24} />, color: '#2dd4bf' },
    { label: 'Doctores activos', value: '8', icon: <TrendingUp size={24} />, color: '#8b5cf6' },
    { label: 'Eficiencia', value: '98%', icon: <Activity size={24} />, color: '#f59e0b' },
  ];

  return (
    <div className="home-page">
      <header className="hero-section glass">
        <div className="hero-content">
          <div className="hero-badge">
            <ShieldCheck size={16} />
            <span>Sistema Médico Certificado</span>
          </div>
          <h1>Bienvenido a <span>MediConnect</span></h1>
          <p>Gestiona tu clínica con eficiencia, simplicidad y tecnología de vanguardia. Todo lo que necesitas para cuidar a tus pacientes en un solo lugar.</p>
          <div className="hero-actions">
            <button className="btn-primary">Nueva Cita</button>
            <button className="btn-secondary">Ver Reportes</button>
          </div>
        </div>
        <div className="hero-visual">
          <div className="abstract-shape"></div>
        </div>
      </header>

      <section className="stats-grid">
        {stats.map((stat, i) => (
          <div key={i} className="stat-card glass">
            <div className="stat-icon" style={{ backgroundColor: `${stat.color}15`, color: stat.color }}>
              {stat.icon}
            </div>
            <div className="stat-info">
              <h3>{stat.value}</h3>
              <p>{stat.label}</p>
            </div>
          </div>
        ))}
      </section>

      <div className="dashboard-content">
        <div className="content-card glass">
          <h2>Próximas Citas</h2>
          <div className="appointment-list">
            {[1, 2, 3].map((item) => (
              <div key={item} className="appointment-item">
                <div className="time">
                  <Clock size={16} />
                  <span>09:30 AM</span>
                </div>
                <div className="patient">
                  <strong>Juan Pérez</strong>
                  <span>Cardiología</span>
                </div>
                <span className="status confirmed">Confirmada</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .home-page {
          display: flex;
          flex-direction: column;
          gap: 2.5rem;
          animation: fadeIn 0.8s ease-out;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .hero-section {
          padding: 3.5rem;
          border-radius: var(--radius);
          display: flex;
          justify-content: space-between;
          align-items: center;
          overflow: hidden;
          position: relative;
        }

        .hero-content {
          max-width: 600px;
          z-index: 10;
        }

        .hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          background: rgba(14, 165, 233, 0.1);
          color: var(--primary);
          padding: 0.5rem 1rem;
          border-radius: 50px;
          font-size: 0.875rem;
          font-weight: 600;
          margin-bottom: 1.5rem;
        }

        .hero-content h1 {
          font-size: 3rem;
          font-weight: 800;
          line-height: 1.1;
          margin-bottom: 1.5rem;
          color: var(--text-main);
        }

        .hero-content h1 span {
          color: var(--primary);
        }

        .hero-content p {
          font-size: 1.1rem;
          color: var(--text-muted);
          margin-bottom: 2.5rem;
        }

        .hero-actions {
          display: flex;
          gap: 1rem;
        }

        .btn-primary {
          background: var(--primary);
          color: white;
          padding: 0.75rem 1.75rem;
          border-radius: var(--radius);
          font-weight: 600;
          box-shadow: 0 4px 12px rgba(14, 165, 233, 0.3);
          transition: var(--transition);
        }

        .btn-primary:hover {
          background: var(--primary-hover);
          transform: translateY(-2px);
        }

        .btn-secondary {
          background: rgba(100, 116, 139, 0.1);
          color: var(--text-main);
          padding: 0.75rem 1.75rem;
          border-radius: var(--radius);
          font-weight: 600;
          transition: var(--transition);
        }

        .btn-secondary:hover {
          background: rgba(100, 116, 139, 0.2);
        }

        .hero-visual {
          width: 300px;
          height: 300px;
          position: relative;
        }

        .abstract-shape {
          width: 100%;
          height: 100%;
          background: linear-gradient(135deg, var(--primary), var(--accent));
          border-radius: 30% 70% 70% 30% / 30% 30% 70% 70%;
          animation: morph 10s linear infinite alternate;
          filter: blur(40px);
          opacity: 0.4;
        }

        @keyframes morph {
          0% { border-radius: 30% 70% 70% 30% / 30% 30% 70% 70%; }
          100% { border-radius: 70% 30% 30% 70% / 70% 70% 30% 30%; }
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 1.5rem;
        }

        .stat-card {
          padding: 1.5rem;
          border-radius: var(--radius);
          display: flex;
          align-items: center;
          gap: 1.25rem;
          transition: var(--transition);
        }

        .stat-card:hover {
          transform: translateY(-5px);
          border-color: var(--primary);
        }

        .stat-icon {
          width: 50px;
          height: 50px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .stat-info h3 {
          font-size: 1.5rem;
          font-weight: 700;
          margin-bottom: 0.25rem;
        }

        .stat-info p {
          font-size: 0.875rem;
          color: var(--text-muted);
          font-weight: 500;
        }

        .dashboard-content {
          display: grid;
          grid-template-columns: 1fr;
          gap: 1.5rem;
        }

        .content-card {
          padding: 2rem;
          border-radius: var(--radius);
        }

        .content-card h2 {
          margin-bottom: 1.5rem;
          font-size: 1.25rem;
        }

        .appointment-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .appointment-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1rem;
          border: 1px solid var(--border);
          border-radius: var(--radius);
          background: var(--surface);
          transition: var(--transition);
        }

        .appointment-item:hover {
          background: var(--background);
        }

        .time {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: var(--text-muted);
          font-size: 0.875rem;
          width: 100px;
        }

        .patient {
          flex: 1;
          display: flex;
          flex-direction: column;
        }

        .patient strong {
          color: var(--text-main);
        }

        .patient span {
          font-size: 0.75rem;
          color: var(--text-muted);
        }

        .status {
          font-size: 0.75rem;
          font-weight: 700;
          padding: 0.25rem 0.75rem;
          border-radius: 50px;
        }

        .status.confirmed {
          background: rgba(34, 197, 94, 0.1);
          color: #16a34a;
        }

        @media (max-width: 992px) {
          .hero-section {
            padding: 2rem;
          }
          .hero-visual {
            display: none;
          }
        }
      `}} />
    </div>
  );
};

export default Home;
