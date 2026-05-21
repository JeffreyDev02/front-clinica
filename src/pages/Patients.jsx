import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserPlus, Search, Filter, MoreVertical, Edit2, Trash2, X, Save, Loader2, FileDown, FolderOpen } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { getPatients, createPatient, updatePatient, deletePatient } from '../services/patientService';

const Patients = () => {
  const navigate = useNavigate();
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    fecha_nacimiento: '',
    telefono: '',
    direccion: ''
  });
  const [formErrors, setFormErrors] = useState({});

  const validateForm = () => {
    const errors = {};
    const namePattern = /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ\s'-]{2,}$/;
    const phonePattern = /^[0-9+\s()\-]{7,20}$/;
    const today = new Date();
    const birthDate = formData.fecha_nacimiento ? new Date(formData.fecha_nacimiento) : null;

    if (!formData.nombre.trim()) {
      errors.nombre = 'El nombre es obligatorio.';
    } else if (!namePattern.test(formData.nombre.trim())) {
      errors.nombre = 'Ingresa un nombre válido (solo letras y espacios).';
    }

    if (!formData.apellido.trim()) {
      errors.apellido = 'El apellido es obligatorio.';
    } else if (!namePattern.test(formData.apellido.trim())) {
      errors.apellido = 'Ingresa un apellido válido (solo letras y espacios).';
    }

    if (!formData.fecha_nacimiento) {
      errors.fecha_nacimiento = 'La fecha de nacimiento es obligatoria.';
    } else if (!(birthDate instanceof Date) || Number.isNaN(birthDate.getTime())) {
      errors.fecha_nacimiento = 'Fecha de nacimiento no válida.';
    } else if (birthDate > today) {
      errors.fecha_nacimiento = 'La fecha de nacimiento no puede ser futura.';
    } else {
      const age = Math.floor((today - birthDate) / (365.25 * 24 * 60 * 60 * 1000));
      if (age < 1) {
        errors.fecha_nacimiento = 'El paciente debe tener al menos 1 año.';
      } else if (age > 120) {
        errors.fecha_nacimiento = 'Ingresa una fecha de nacimiento válida.';
      }
    }

    if (!formData.telefono.trim()) {
      errors.telefono = 'El teléfono es obligatorio.';
    } else if (!/^\d{8}$/.test(formData.telefono.trim())) {
      errors.telefono = 'El teléfono debe contener exactamente 8 dígitos.';
    }

    if (!formData.direccion.trim()) {
      errors.direccion = 'La dirección es obligatoria.';
    } else if (formData.direccion.trim().length < 5) {
      errors.direccion = 'La dirección debe tener al menos 5 caracteres.';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const fetchPatients = async () => {
    try {
      setLoading(true);
      const data = await getPatients();
      setPatients(data);
      setError(null);
    } catch (err) {
      setError('Error al cargar los pacientes. Asegúrate de que la API está corriendo.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  const handleOpenModal = (patient = null) => {
    if (patient) {
      setEditingPatient(patient);
      setFormData({
        nombre: patient.nombre,
        apellido: patient.apellido,
        fecha_nacimiento: patient.fecha_nacimiento ? patient.fecha_nacimiento.split('T')[0] : '',
        telefono: patient.telefono,
        direccion: patient.direccion
      });
    } else {
      setEditingPatient(null);
      setFormData({
        nombre: '',
        apellido: '',
        fecha_nacimiento: '',
        telefono: '',
        direccion: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingPatient(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      if (editingPatient) {
        await updatePatient(editingPatient.id_paciente, formData);
      } else {
        await createPatient(formData);
      }
      handleCloseModal();
      fetchPatients();
    } catch (err) {
      alert('Error al guardar el paciente');
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este paciente?')) {
      try {
        await deletePatient(id);
        fetchPatients();
      } catch (err) {
        alert('Error al eliminar el paciente');
        console.error(err);
      }
    }
  };

  const filteredPatients = patients.filter(p => 
    `${p.nombre} ${p.apellido}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.id_paciente?.toString().includes(searchTerm)
  );

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.setFillColor(14, 165, 233);
    doc.rect(0, 0, 210, 35, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('MediConnect — Reporte de Pacientes', 15, 22);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(`Generado: ${new Date().toLocaleString()} · Total: ${filteredPatients.length}`, 15, 30);
    doc.setTextColor(30, 41, 59);
    autoTable(doc, {
      startY: 42,
      head: [['ID', 'Nombre', 'Apellido', 'Fecha Nacimiento', 'Teléfono', 'Dirección']],
      body: filteredPatients.map(p => [
        p.id_paciente,
        p.nombre,
        p.apellido,
        p.fecha_nacimiento ? new Date(p.fecha_nacimiento).toLocaleDateString() : 'N/A',
        p.telefono || '—',
        p.direccion || '—',
      ]),
      theme: 'striped',
      headStyles: { fillColor: [14, 165, 233] },
      styles: { fontSize: 9 },
    });
    doc.save(`pacientes_${new Date().toISOString().slice(0,10)}.pdf`);
  };

  return (
    <div className="page-container">
      <header className="page-header">
        <div>
          <h1>Gestión de Pacientes</h1>
          <p>Visualiza y administra todos los registros de pacientes.</p>
        </div>
        <button className="btn-primary" onClick={() => handleOpenModal()}>
          <UserPlus size={18} />
          <span>Nuevo Paciente</span>
        </button>
        <button className="btn-secondary" onClick={exportPDF} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <FileDown size={18} />
          <span>Exportar PDF</span>
        </button>
      </header>

      <section className="table-controls glass">
        <div className="search-box">
          <Search size={18} />
          <input 
            type="text" 
            placeholder="Buscar por nombre o ID..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button className="btn-icon">
          <Filter size={18} />
          <span>Filtros</span>
        </button>
      </section>

      <div className="table-responsive glass">
        {loading ? (
          <div className="loading-state">
            <Loader2 className="animate-spin" size={32} />
            <p>Cargando pacientes...</p>
          </div>
        ) : error ? (
          <div className="error-state">
            <p>{error}</p>
            <button className="btn-secondary" onClick={fetchPatients}>Reintentar</button>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>Apellido</th>
                <th>Fecha Nacimiento</th>
                <th>Teléfono</th>
                <th>Dirección</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredPatients.length > 0 ? (
                filteredPatients.map((p) => (
                  <tr key={p.id_paciente}>
                    <td>{p.id_paciente}</td>
                    <td className="font-semibold">{p.nombre}</td>
                    <td>{p.apellido}</td>
                    <td>{p.fecha_nacimiento ? new Date(p.fecha_nacimiento).toLocaleDateString() : 'N/A'}</td>
                    <td>{p.telefono}</td>
                    <td>{p.direccion}</td>
                    <td>
                      <div className="actions-cell">
                        <button className="btn-ghost" title="Ver Expediente" onClick={() => navigate(`/expediente/${p.id_paciente}`)} style={{ color: '#0ea5e9' }}>
                          <FolderOpen size={16} />
                        </button>
                        <button className="btn-ghost edit" title="Editar" onClick={() => handleOpenModal(p)}>
                          <Edit2 size={16} />
                        </button>
                        <button className="btn-ghost delete" title="Eliminar" onClick={() => handleDelete(p.id_paciente)}>
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '2rem' }}>
                    No se encontraron pacientes.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal - Could be a separate component but for simplicity in this task we keep it here */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content glass">
            <header className="modal-header">
              <h2>{editingPatient ? 'Editar Paciente' : 'Nuevo Paciente'}</h2>
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
                    value={formData.nombre}
                    onChange={handleInputChange}
                    placeholder="Ej. Juan"
                    aria-invalid={!!formErrors.nombre}
                  />
                  {formErrors.nombre && <span className="field-error">{formErrors.nombre}</span>}
                </div>
                <div className="form-group">
                  <label>Apellido</label>
                  <input 
                    type="text" 
                    name="apellido" 
                    value={formData.apellido}
                    onChange={handleInputChange}
                    placeholder="Ej. Pérez"
                    aria-invalid={!!formErrors.apellido}
                  />
                  {formErrors.apellido && <span className="field-error">{formErrors.apellido}</span>}
                </div>
                <div className="form-group">
                  <label>Fecha de Nacimiento</label>
                  <input 
                    type="date" 
                    name="fecha_nacimiento" 
                    value={formData.fecha_nacimiento}
                    onChange={handleInputChange}
                    aria-invalid={!!formErrors.fecha_nacimiento}
                  />
                  {formErrors.fecha_nacimiento && <span className="field-error">{formErrors.fecha_nacimiento}</span>}
                </div>
                <div className="form-group">
                  <label>Teléfono</label>
                  <input 
                    type="tel" 
                    name="telefono" 
                    value={formData.telefono}
                    onChange={handleInputChange}
                    placeholder="Ej. 12345678"
                    maxLength={8}
                    aria-invalid={!!formErrors.telefono}
                  />
                  {formErrors.telefono && <span className="field-error">{formErrors.telefono}</span>}
                </div>
                <div className="form-group full-width">
                  <label>Dirección</label>
                  <input 
                    type="text" 
                    name="direccion" 
                    value={formData.direccion}
                    onChange={handleInputChange}
                    placeholder="Ej. Calle 123, Ciudad"
                    aria-invalid={!!formErrors.direccion}
                  />
                  {formErrors.direccion && <span className="field-error">{formErrors.direccion}</span>}
                </div>
              </div>
              <footer className="modal-footer">
                <button type="button" className="btn-secondary" onClick={handleCloseModal}>Cancelar</button>
                <button type="submit" className="btn-primary">
                  <Save size={18} />
                  <span>{editingPatient ? 'Actualizar' : 'Guardar'}</span>
                </button>
              </footer>
            </form>
          </div>
        </div>
      )}

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
          background: var(--surface);
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
          color: var(--text-main);
        }

        .table-responsive {
          border-radius: var(--radius);
          overflow: hidden;
          min-height: 200px;
          display: flex;
          flex-direction: column;
        }

        .loading-state, .error-state {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 1rem;
          padding: 3rem;
          color: var(--text-muted);
        }

        .animate-spin {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
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

        .actions-cell {
          display: flex;
          gap: 0.5rem;
        }

        .btn-ghost {
          background: none;
          color: var(--text-muted);
          padding: 0.5rem;
          border-radius: 6px;
          transition: var(--transition);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .btn-ghost:hover {
          background: var(--background);
        }

        .btn-ghost.edit:hover {
          color: var(--primary);
        }

        .btn-ghost.delete:hover {
          color: #ef4444;
        }

        /* Modal Styles */
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
          max-width: 600px;
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

        .modal-header h2 {
          font-size: 1.25rem;
          font-weight: 700;
        }

        .btn-close {
          background: none;
          color: var(--text-muted);
          transition: var(--transition);
        }

        .btn-close:hover {
          color: var(--text-main);
          transform: rotate(90deg);
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
          transition: var(--transition);
        }

        .form-group input:focus {
          border-color: var(--primary);
          box-shadow: 0 0 0 2px rgba(14, 165, 233, 0.1);
        }

        .modal-footer {
          margin-top: 2rem;
          display: flex;
          justify-content: flex-end;
          gap: 1rem;
          padding-top: 1.5rem;
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

        .field-error {
          color: #dc2626;
          font-size: 0.825rem;
          margin-top: 0.25rem;
        }

        .form-group input[aria-invalid="true"] {
          border-color: #dc2626;
        }
      `}} />
    </div>
  );
};

export default Patients;
