import React from 'react';
import { UserPlus, Search, Filter, MoreVertical } from 'lucide-react';

const Patients = () => {
  const patients = [
    { id: '1', name: 'Juan Pérez', age: 45, gender: 'M', lastVisit: '10 Feb 2025', status: 'Activo' },
    { id: '2', name: 'María García', age: 32, gender: 'F', lastVisit: '15 Feb 2025', status: 'Activo' },
    { id: '3', name: 'Carlos López', age: 28, gender: 'M', lastVisit: '20 Feb 2025', status: 'Pendiente' },
  ];

  return (
    <div className="page-container">
      <header className="page-header">
        <div>
          <h1>Gestión de Pacientes</h1>
          <p>Visualiza y administra todos los registros de pacientes.</p>
        </div>
        <button className="btn-primary">
          <UserPlus size={18} />
          <span>Nuevo Paciente</span>
        </button>
      </header>

      <section className="table-controls glass">
        <div className="search-box">
          <Search size={18} />
          <input type="text" placeholder="Buscar por nombre o ID..." />
        </div>
        <button className="btn-icon">
          <Filter size={18} />
          <span>Filtros</span>
        </button>
      </section>

      <div className="table-responsive glass">
        <table className="data-table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Edad</th>
              <th>Género</th>
              <th>Última Visita</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {patients.map((p) => (
              <tr key={p.id}>
                <td className="font-semibold">{p.name}</td>
                <td>{p.age}</td>
                <td>{p.gender}</td>
                <td>{p.lastVisit}</td>
                <td>
                  <span className={`badge ${p.status.toLowerCase()}`}>
                    {p.status}
                  </span>
                </td>
                <td>
                  <button className="btn-ghost">
                    <MoreVertical size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .page-container {
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }

        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .page-header h1 {
          font-size: 1.75rem;
          font-weight: 700;
          color: var(--text-main);
        }

        .page-header p {
          color: var(--text-muted);
        }

        .table-controls {
          padding: 1rem;
          display: flex;
          gap: 1rem;
          border-radius: var(--radius);
        }

        .search-box {
          flex: 1;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          background: var(--background);
          padding: 0.5rem 1rem;
          border-radius: var(--radius);
          border: 1px solid var(--border);
        }

        .search-box input {
          background: none;
          border: none;
          outline: none;
          width: 100%;
          font-size: 0.9rem;
        }

        .table-responsive {
          border-radius: var(--radius);
          overflow: hidden;
        }

        .data-table {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
        }

        .data-table th {
          padding: 1rem 1.5rem;
          background: rgba(14, 165, 233, 0.05);
          color: var(--text-muted);
          font-weight: 600;
          font-size: 0.875rem;
          border-bottom: 1px solid var(--border);
        }

        .data-table td {
          padding: 1rem 1.5rem;
          border-bottom: 1px solid var(--border);
          font-size: 0.9rem;
        }

        .data-table tr:last-child td {
          border-bottom: none;
        }

        .font-semibold {
          font-weight: 600;
          color: var(--text-main);
        }

        .badge.activo {
          background: rgba(34, 197, 94, 0.1);
          color: #16a34a;
        }

        .badge.pendiente {
          background: rgba(245, 158, 11, 0.1);
          color: #d97706;
        }

        .btn-ghost {
          background: none;
          color: var(--text-muted);
          padding: 0.25rem;
          border-radius: 4px;
          transition: var(--transition);
        }

        .btn-ghost:hover {
          background: var(--background);
          color: var(--primary);
        }
      `}} />
    </div>
  );
};

export default Patients;
