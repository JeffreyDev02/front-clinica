import React from 'react';
import { UserPlus, Stethoscope, Star, Mail } from 'lucide-react';

const Doctors = () => {
  const doctors = [
    { id: '1', name: 'Dr. Alejandro Silva', specialty: 'Cardiología', email: 'a.silva@mediconnect.com', rating: 4.9, active: true },
    { id: '2', name: 'Dra. Elena Martínez', specialty: 'Pediatría', email: 'e.martinez@mediconnect.com', rating: 4.8, active: true },
    { id: '3', name: 'Dr. Roberto Gómez', specialty: 'Neurología', email: 'r.gomez@mediconnect.com', rating: 4.7, active: false },
  ];

  return (
    <div className="page-container">
      <header className="page-header">
        <div>
          <h1>Nuestro Equipo Médico</h1>
          <p>Gestiona los perfiles y especialidades de los doctores.</p>
        </div>
        <button className="btn-primary">
          <UserPlus size={18} />
          <span>Añadir Doctor</span>
        </button>
      </header>

      <section className="doctors-grid">
        {doctors.map((doc) => (
          <div key={doc.id} className="doctor-card glass">
            <div className={`status-dot ${doc.active ? 'active' : ''}`}></div>
            <div className="doctor-avatar">
              <Stethoscope size={32} />
            </div>
            <div className="doctor-info">
              <h3>{doc.name}</h3>
              <p className="specialty">{doc.specialty}</p>
              <div className="rating">
                <Star size={14} fill="#f59e0b" color="#f59e0b" />
                <span>{doc.rating}</span>
              </div>
              <div className="contact">
                <Mail size={14} />
                <span>{doc.email}</span>
              </div>
            </div>
            <button className="btn-secondary full-width">Ver Perfil</button>
          </div>
        ))}
      </section>

      <style dangerouslySetInnerHTML={{ __html: `
        .doctors-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 1.5rem;
        }

        .doctor-card {
          padding: 2rem;
          border-radius: var(--radius);
          text-align: center;
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1.25rem;
          transition: var(--transition);
        }

        .doctor-card:hover {
          transform: translateY(-5px);
          border-color: var(--primary);
        }

        .status-dot {
          position: absolute;
          top: 1.5rem;
          right: 1.5rem;
          width: 10px;
          height: 10px;
          background: #94a3b8;
          border-radius: 50%;
        }

        .status-dot.active {
          background: #22c55e;
          box-shadow: 0 0 8px rgba(34, 197, 94, 0.4);
        }

        .doctor-avatar {
          width: 80px;
          height: 80px;
          background: rgba(14, 165, 233, 0.1);
          color: var(--primary);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .doctor-info h3 {
          font-size: 1.125rem;
          font-weight: 700;
          margin-bottom: 0.25rem;
        }

        .specialty {
          color: var(--primary);
          font-weight: 600;
          font-size: 0.875rem;
          margin-bottom: 0.75rem;
        }

        .rating, .contact {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          font-size: 0.875rem;
          color: var(--text-muted);
        }

        .contact {
          margin-top: 0.25rem;
        }

        .full-width {
          width: 100%;
          margin-top: 0.5rem;
        }
      `}} />
    </div>
  );
};

export default Doctors;
