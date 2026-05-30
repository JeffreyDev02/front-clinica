import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Clock, Users, CalendarCheck, TrendingUp, Activity, Loader2, UserRound } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { authHeaders } from '../services/apiClient';

const API = 'http://localhost:3000/api/reportes/home-stats';

const ESTADO_STYLE = {
    Normal:     { bg: 'rgba(14,165,233,0.1)',  color: '#0ea5e9' },
    Urgente:    { bg: 'rgba(239,68,68,0.1)',   color: '#ef4444' },
    Confirmada: { bg: 'rgba(34,197,94,0.1)',   color: '#16a34a' },
    Pendiente:  { bg: 'rgba(245,158,11,0.1)',  color: '#d97706' },
};

const Home = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(user?.rol === 'admin');
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user?.rol !== 'admin') {
      return;
    }
    fetch(API, { headers: authHeaders() })
      .then(r => {
        if (!r.ok) throw new Error('No se pudo cargar el resumen');
        return r.json();
      })
      .then(data => { setStats(data); setLoading(false); })
      .catch(() => { setError('No se pudo conectar con el servidor.'); setLoading(false); });
  }, [user?.rol]);

  const statCards = stats ? [
    { label: 'Citas de hoy',      value: stats.citas_hoy,       icon: <CalendarCheck size={24} />, color: '#0ea5e9' },
    { label: 'Total pacientes',   value: stats.total_pacientes,  icon: <Users size={24} />,         color: '#2dd4bf' },
    { label: 'Doctores activos',  value: stats.total_medicos,    icon: <UserRound size={24} />,     color: '#8b5cf6' },
    { label: 'Citas activas',     value: stats.citas_activas,    icon: <Activity size={24} />,      color: '#f59e0b' },
  ] : [];

  return (
    <div className="home-page">
      <header className="hero-section glass">
        <div className="hero-content">
          <div className="hero-badge">
            <ShieldCheck size={16} />
            <span>Sistema Médico Certificado</span>
          </div>
          <h1>Bienvenido{user?.nombre ? `, ${user.nombre}` : ''} a <span>MediConnect</span></h1>
          <p>Gestiona tu clínica con eficiencia, simplicidad y tecnología de vanguardia. Todo lo que necesitas para cuidar a tus pacientes en un solo lugar.</p>
          <div className="hero-actions">
            {(user?.rol === 'admin' || user?.rol === 'recepcion') && <button className="btn-primary" onClick={() => navigate('/citas')}>Nueva Cita</button>}
            {user?.rol === 'admin' && <button className="btn-secondary" onClick={() => navigate('/reportes')}>Ver Reportes</button>}
            {user?.rol === 'medico' && <button className="btn-primary" onClick={() => navigate('/consultas')}>Ver Consultas</button>}
          </div>
        </div>
        <div className="hero-visual">
          <div className="abstract-shape"></div>
        </div>
      </header>

      {user?.rol === 'admin' && <section className="stats-grid">
        {loading
          ? [1,2,3,4].map(i => (
              <div key={i} className="stat-card glass" style={{ justifyContent: 'center', minHeight: 80 }}>
                <Loader2 size={22} style={{ animation: 'spin 1s linear infinite', color: '#0ea5e9' }} />
              </div>
            ))
          : statCards.map((stat, i) => (
              <div key={i} className="stat-card glass">
                <div className="stat-icon" style={{ backgroundColor: `${stat.color}15`, color: stat.color }}>
                  {stat.icon}
                </div>
                <div className="stat-info">
                  <h3>{stat.value ?? '—'}</h3>
                  <p>{stat.label}</p>
                </div>
              </div>
            ))
        }
      </section>}

      {user?.rol === 'admin' && <div className="dashboard-content">
        <div className="content-card glass">
          <h2>Próximas Citas</h2>
          {loading ? (
            <div style={{ display:'flex', justifyContent:'center', padding:'2rem' }}>
              <Loader2 size={28} style={{ animation:'spin 1s linear infinite', color:'#0ea5e9' }} />
            </div>
          ) : error ? (
            <p style={{ color: '#ef4444' }}>{error}</p>
          ) : stats?.proximas_citas?.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', padding: '0.5rem 0' }}>No hay próximas citas programadas.</p>
          ) : (
            <div className="appointment-list">
              {(stats?.proximas_citas || []).map((cita) => {
                const style = ESTADO_STYLE[cita.estado] || ESTADO_STYLE['Normal'];
                return (
                  <div key={cita.id_cita} className="appointment-item">
                    <div className="time">
                      <Clock size={16} />
                      <span>{cita.hora ? cita.hora.slice(0,5) : '—'}</span>
                    </div>
                    <div className="patient">
                      <strong>{cita.paciente}</strong>
                      <span>{cita.especialidad || cita.medico}</span>
                    </div>
                    <span className="status" style={{ background: style.bg, color: style.color }}>
                      {cita.estado}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>}

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes spin { to { transform: rotate(360deg); } }
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
          cursor: pointer;
          border: none;
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
          cursor: pointer;
          border: 1px solid var(--border);
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
          flex-shrink: 0;
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

        @media (max-width: 992px) {
          .hero-section { padding: 2rem; }
          .hero-visual { display: none; }
        }
      `}} />
    </div>
  );
};

export default Home;
