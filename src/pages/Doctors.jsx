import React, { useState, useEffect } from 'react';
import { UserPlus, Stethoscope, Star, Mail, Edit2, Trash2, X, Save, Loader2, Phone, FileDown } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { getDoctors, createDoctor, updateDoctor, deleteDoctor } from '../services/doctorService';

const Doctors = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    telefono: ''
  });

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      const data = await getDoctors();
      setDoctors(data);
      setError(null);
    } catch (err) {
      setError('Error al cargar los doctores. Asegúrate de que la API está corriendo.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  const handleOpenModal = (doctor = null) => {
    if (doctor) {
      setEditingDoctor(doctor);
      setFormData({
        nombre: doctor.nombre,
        apellido: doctor.apellido,
        telefono: doctor.telefono
      });
    } else {
      setEditingDoctor(null);
      setFormData({
        nombre: '',
        apellido: '',
        telefono: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingDoctor(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingDoctor) {
        await updateDoctor(editingDoctor.id_medico, formData);
      } else {
        await createDoctor(formData);
      }
      handleCloseModal();
      fetchDoctors();
    } catch (err) {
      alert('Error al guardar el doctor');
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este doctor?')) {
      try {
        await deleteDoctor(id);
        fetchDoctors();
      } catch (err) {
        alert('Error al eliminar el doctor');
        console.error(err);
      }
    }
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.setFillColor(14, 165, 233);
    doc.rect(0, 0, 210, 35, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('MediConnect \u2014 Equipo M\u00e9dico', 15, 22);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(`Generado: ${new Date().toLocaleString()} \u00b7 Total: ${doctors.length}`, 15, 30);
    doc.setTextColor(30, 41, 59);
    autoTable(doc, {
      startY: 42,
      head: [['ID', 'Nombre', 'Apellido', 'Tel\u00e9fono']],
      body: doctors.map(d => [d.id_medico, d.nombre, d.apellido, d.telefono || '\u2014']),
      theme: 'striped',
      headStyles: { fillColor: [14, 165, 233] },
    });
    doc.save(`medicos_${new Date().toISOString().slice(0,10)}.pdf`);
  };

  return (
    <div className="page-container">
      <header className="page-header">
        <div>
          <h1>Nuestro Equipo Médico</h1>
          <p>Gestiona los perfiles y especialidades de los doctores.</p>
        </div>
        <button className="btn-primary" onClick={() => handleOpenModal()}>
          <UserPlus size={18} />
          <span>Añadir Doctor</span>
        </button>        <button className="btn-secondary" onClick={exportPDF} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <FileDown size={18} />
          <span>Exportar PDF</span>
        </button>      </header>

      {loading ? (
        <div className="loading-state glass">
          <Loader2 className="animate-spin" size={48} />
          <p>Cargando equipo médico...</p>
        </div>
      ) : error ? (
        <div className="error-state glass">
          <p>{error}</p>
          <button className="btn-primary" onClick={fetchDoctors}>Reintentar</button>
        </div>
      ) : (
        <section className="doctors-grid">
          {doctors.map((doc) => (
            <div key={doc.id_medico} className="doctor-card glass">
              <div className="status-dot active"></div>
              <div className="doctor-avatar">
                <Stethoscope size={32} />
              </div>
              <div className="doctor-info">
                <h3>{doc.nombre} {doc.apellido}</h3>
                <p className="specialty">Médico General</p>
                <div className="contact">
                  <Phone size={14} />
                  <span>{doc.telefono}</span>
                </div>
                <div className="doctor-id">
                  <span>ID: {doc.id_medico}</span>
                </div>
              </div>
              <div className="card-actions">
                <button className="btn-edit" onClick={() => handleOpenModal(doc)}>
                  <Edit2 size={16} />
                  <span>Editar</span>
                </button>
                <button className="btn-delete-card" onClick={() => handleDelete(doc.id_medico)}>
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
          {doctors.length === 0 && (
            <div className="empty-state full-width">
              <p>No hay doctores registrados.</p>
            </div>
          )}
        </section>
      )}

      {/* Modal CRUD */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content glass">
            <header className="modal-header">
              <h2>{editingDoctor ? 'Editar Doctor' : 'Añadir Doctor'}</h2>
              <button className="btn-close" onClick={handleCloseModal}>
                <X size={20} />
              </button>
            </header>
            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-grid">
                <div className="form-group">
                  <label>Nombre</label>
                  <input 
                    type="text" 
                    name="nombre" 
                    required 
                    value={formData.nombre}
                    onChange={handleInputChange}
                    placeholder="Ej. Alejandro"
                  />
                </div>
                <div className="form-group">
                  <label>Apellido</label>
                  <input 
                    type="text" 
                    name="apellido" 
                    required 
                    value={formData.apellido}
                    onChange={handleInputChange}
                    placeholder="Ej. Silva"
                  />
                </div>
                <div className="form-group full-width">
                  <label>Teléfono</label>
                  <input 
                    type="tel" 
                    name="telefono" 
                    required 
                    value={formData.telefono}
                    onChange={handleInputChange}
                    placeholder="Ej. 5555-5555"
                  />
                </div>
              </div>
              <footer className="modal-footer">
                <button type="button" className="btn-secondary" onClick={handleCloseModal}>Cancelar</button>
                <button type="submit" className="btn-primary">
                  <Save size={18} />
                  <span>{editingDoctor ? 'Actualizar' : 'Guardar'}</span>
                </button>
              </footer>
            </form>
          </div>
        </div>
      )}

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
          background: #22c55e;
          border-radius: 50%;
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

        .contact {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          font-size: 0.875rem;
          color: var(--text-muted);
        }

        .doctor-id {
          margin-top: 0.5rem;
          font-size: 0.75rem;
          color: var(--text-muted);
          opacity: 0.7;
        }

        .card-actions {
          display: flex;
          width: 100%;
          gap: 0.75rem;
          margin-top: 1rem;
          padding-top: 1rem;
          border-top: 1px solid var(--border);
        }

        .btn-primary, .btn-secondary {
          padding: 0.8rem 1.75rem;
          border-radius: 10px;
          font-weight: 700;
          font-size: 0.925rem;
          display: flex;
          align-items: center;
          gap: 0.6rem;
          transition: var(--transition);
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
          border: none;
          outline: none;
          cursor: pointer;
        }

        .btn-primary {
          background: linear-gradient(135deg, var(--primary), #0284c7);
          color: white !important;
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
        }

        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(14, 165, 233, 0.35);
          filter: brightness(1.1);
        }

        .btn-primary:active {
          transform: translateY(0);
        }

        .btn-secondary {
          background: white;
          border: 1px solid var(--border);
          color: var(--text-main);
        }

        .btn-secondary:hover {
          background: var(--background);
          border-color: var(--primary);
          color: var(--primary);
          transform: translateY(-2px);
          box-shadow: 0 8px 15px rgba(0, 0, 0, 0.05);
        }

        .btn-edit {
          flex: 1;
          background: rgba(14, 165, 233, 0.1);
          color: var(--primary);
          padding: 0.6rem;
          border-radius: 8px;
          font-weight: 600;
          font-size: 0.875rem;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          transition: var(--transition);
        }

        .btn-edit:hover {
          background: var(--primary);
          color: white;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(14, 165, 233, 0.3);
        }

        .btn-delete-card {
          background: rgba(239, 68, 68, 0.05);
          color: #ef4444;
          padding: 0.6rem;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: var(--transition);
        }

        .btn-delete-card:hover {
          background: #ef4444;
          color: white;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
        }

        /* Loading & Error States */
        .loading-state, .error-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 1.5rem;
          padding: 5rem;
          border-radius: var(--radius);
          text-align: center;
        }

        .animate-spin {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .full-width {
          grid-column: 1 / -1;
          text-align: center;
          padding: 3rem;
          color: var(--text-muted);
        }

        /* Modal Styles (Same as Patients for consistency) */
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 1rem;
        }

        .modal-content {
          width: 100%;
          max-width: 500px;
          border-radius: var(--radius);
          overflow: hidden;
          box-shadow: var(--shadow-lg);
          background: var(--surface);
          animation: modalSlideUp 0.3s ease-out;
        }

        @keyframes modalSlideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .modal-header {
          padding: 1.5rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid var(--border);
        }

        .modal-form {
          padding: 1.5rem;
        }

        .form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.5rem;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .full-width {
          grid-column: span 2;
        }

        .form-group label {
          font-size: 0.875rem;
          font-weight: 600;
          color: var(--text-muted);
        }

        .form-group input {
          padding: 0.75rem 1rem;
          border-radius: 8px;
          border: 1px solid var(--border);
          background: var(--background);
          color: var(--text-main);
          outline: none;
        }

        .modal-footer {
          margin-top: 2rem;
          display: flex;
          justify-content: flex-end;
          gap: 1rem;
          padding-top: 1.5rem;
          border-top: 1px solid var(--border);
        }
      `}} />
    </div>
  );
};

export default Doctors;
