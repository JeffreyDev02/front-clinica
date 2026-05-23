import React, { useState, useEffect } from 'react';
import { UserPlus, Stethoscope, Star, Mail, Edit2, Trash2, X, Save, Loader2, Phone, FileDown } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { getDoctors, createDoctor, updateDoctor, deleteDoctor, assignDoctorSpecialty, removeDoctorSpecialty, getDoctorSpecialties } from '../services/doctorService';
import { getSpecialties } from '../services/specialtyService';

const Doctors = () => {
  const [doctors, setDoctors] = useState([]);
  const [specialties, setSpecialties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState(null);
  const [originalSpecialtyIds, setOriginalSpecialtyIds] = useState([]);
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    telefono: '',
    especialidades: []
  });
  const [successMessage, setSuccessMessage] = useState('');
  const [formErrors, setFormErrors] = useState({});

  const fetchSpecialties = async () => {
    try {
      const data = await getSpecialties();
      setSpecialties(data);
    } catch (err) {
      console.error('Error al cargar especialidades', err);
    }
  };

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
    fetchSpecialties();
  }, []);

  const getSpecialtyName = (id) => {
    const s = specialties.find(sp => (sp.id_especialidad || sp.id || '').toString() === id?.toString());
    return s ? (s.nombre || s.nombre_especialidad || id) : id;
  };

  const handleOpenModal = (doctor = null) => {
    if (doctor) {
      setEditingDoctor(doctor);
      setFormData(prev => ({
        ...prev,
        nombre: doctor.nombre,
        apellido: doctor.apellido,
        telefono: doctor.telefono,
      }));

      // derive specialties from doctor object; if missing, fetch from API
      (async () => {
        try {
          let selectedSpecialties = [];
          if (Array.isArray(doctor.especialidades) && doctor.especialidades.length > 0) {
            selectedSpecialties = doctor.especialidades.map(s => (s.id_especialidad?.toString() || s.id?.toString() || s.toString()));
          } else {
            const data = await getDoctorSpecialties(doctor.id_medico || doctor.id);
            if (Array.isArray(data)) {
              selectedSpecialties = data.map(s => (s.id_especialidad?.toString() || s.id?.toString() || s.toString()));
            }
          }
          setOriginalSpecialtyIds(selectedSpecialties);
          setFormData(prev => ({ ...prev, especialidades: selectedSpecialties }));
        } catch (err) {
          console.error('Error al obtener especialidades del doctor', err);
          setOriginalSpecialtyIds([]);
          setFormData(prev => ({ ...prev, especialidades: [] }));
        }
      })();
    } else {
      setEditingDoctor(null);
      setOriginalSpecialtyIds([]);
      setFormData({
        nombre: '',
        apellido: '',
        telefono: '',
        especialidades: []
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingDoctor(null);
    setOriginalSpecialtyIds([]);
  };

  const handleInputChange = (e) => {
    const { name, value, type, selectedOptions } = e.target;
    if (name === 'especialidades') {
      // kept for potential non-checkbox inputs, but handled elsewhere
      const values = selectedOptions ? Array.from(selectedOptions, option => option.value) : [];
      setFormData(prev => ({ ...prev, especialidades: values }));
      return;
    }
    if (name === 'telefono') {
      // allow only digits and limit to 8 characters
      const digits = value.replace(/\D/g, '').slice(0, 8);
      setFormData(prev => ({ ...prev, telefono: digits }));
      return;
    }
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    const errors = {};
    const namePattern = /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s'-]+$/;
    if (!formData.nombre || formData.nombre.trim().length < 2 || !namePattern.test(formData.nombre.trim())) {
      errors.nombre = 'Nombre inválido (solo letras, mínimo 2 caracteres)';
    }
    if (!formData.apellido || formData.apellido.trim().length < 2 || !namePattern.test(formData.apellido.trim())) {
      errors.apellido = 'Apellido inválido (solo letras, mínimo 2 caracteres)';
    }
    if (!formData.telefono || !/^\d{8}$/.test(formData.telefono)) {
      errors.telefono = 'Teléfono inválido (debe tener exactamente 8 dígitos)';
    }
    if (!Array.isArray(formData.especialidades) || formData.especialidades.length < 1) {
      errors.especialidades = 'Selecciona al menos una especialidad';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSpecialtyToggle = (e) => {
    const { value, checked } = e.target;
    setFormData(prev => {
      const current = Array.isArray(prev.especialidades) ? [...prev.especialidades] : [];
      if (checked) {
        if (!current.includes(value)) current.push(value);
      } else {
        const idx = current.indexOf(value);
        if (idx > -1) current.splice(idx, 1);
      }
      return { ...prev, especialidades: current };
    });
  };

  const syncDoctorSpecialties = async (doctorId, selectedIds, originalIds) => {
    const uniqueSelected = Array.from(new Set(selectedIds));
    const uniqueOriginal = Array.from(new Set(originalIds));

    const toAdd = uniqueSelected.filter(id => !uniqueOriginal.includes(id));
    const toRemove = uniqueOriginal.filter(id => !uniqueSelected.includes(id));

    const medId = parseInt(doctorId, 10);
    await Promise.all(toAdd.map(id => assignDoctorSpecialty(medId, parseInt(id, 10))));
    await Promise.all(toRemove.map(id => removeDoctorSpecialty(medId, parseInt(id, 10))));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    try {
      const doctorPayload = {
        nombre: formData.nombre,
        apellido: formData.apellido,
        telefono: formData.telefono,
      };

      let savedDoctor;
      let doctorId = null;
      if (editingDoctor) {
        savedDoctor = await updateDoctor(editingDoctor.id_medico, doctorPayload);
        doctorId = editingDoctor.id_medico;
      } else {
        savedDoctor = await createDoctor(doctorPayload);
        // backend may return different id fields; try common ones
        doctorId = savedDoctor?.id_medico || savedDoctor?.id || savedDoctor?.insertId || null;
      }

      if (doctorId) {
        await syncDoctorSpecialties(doctorId, formData.especialidades, originalSpecialtyIds);
      } else {
        console.warn('No se obtuvo id del doctor creado/actualizado, no se sincronizaron especialidades', savedDoctor);
      }

      // show success message
      setSuccessMessage(editingDoctor ? 'Doctor actualizado correctamente' : 'Doctor creado correctamente');
      setTimeout(() => setSuccessMessage(''), 4000);

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
        {successMessage && (
          <div className="success-alert" role="status">{successMessage}</div>
        )}
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
                <div className="specialty-list">
                  {Array.isArray(doc.especialidades) && doc.especialidades.length > 0 ? (
                    doc.especialidades.map((s, idx) => {
                      const id = (s.id_especialidad || s.id || s).toString();
                      const name = s.nombre || s.nombre_especialidad || getSpecialtyName(id);
                      return (
                        <span key={idx} className="spec-badge">{name}</span>
                      );
                    })
                  ) : (
                    <span className="spec-badge muted">Médico General</span>
                  )}
                </div>
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
                    value={formData.nombre}
                    onChange={handleInputChange}
                    placeholder="Ej. Alejandro"
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
                    placeholder="Ej. Silva"
                    aria-invalid={!!formErrors.apellido}
                  />
                  {formErrors.apellido && <span className="field-error">{formErrors.apellido}</span>}
                </div>
                <div className="form-group full-width">
                  <label>Especialidades</label>
                  <div style={{ margin: '0.5rem 0 0 0', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {Array.isArray(formData.especialidades) && formData.especialidades.length > 0 ? (
                      formData.especialidades.map(id => (
                        <span key={id} className="spec-badge selected">{getSpecialtyName(id)}</span>
                      ))
                    ) : (
                      <span className="spec-badge muted">Ninguna seleccionada</span>
                    )}
                  </div>
                  {formErrors.especialidades && <span className="field-error">{formErrors.especialidades}</span>}
                  <div className="checkbox-grid" style={{ minHeight: '8rem', padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--border)', marginTop: '0.6rem' }}>
                    {specialties.map(spec => {
                      const id = (spec.id_especialidad || spec.id || '').toString();
                      return (
                        <label key={id} className="checkbox-item">
                          <input
                            type="checkbox"
                            name="especialidades"
                            value={id}
                            checked={Array.isArray(formData.especialidades) && formData.especialidades.includes(id)}
                            onChange={handleSpecialtyToggle}
                          />
                          <span className="checkbox-label">{spec.nombre || spec.nombre_especialidad || 'Sin nombre'}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
                <div className="form-group full-width">
                  <label>Teléfono</label>
                  <input 
                    type="tel" 
                    name="telefono" 
                    value={formData.telefono}
                    onChange={handleInputChange}
                    placeholder="Ej. 5555-5555"
                    aria-invalid={!!formErrors.telefono}
                  />
                  {formErrors.telefono && <span className="field-error">{formErrors.telefono}</span>}
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
          background: rgba(0, 0, 0, 0.45);
          backdrop-filter: blur(3px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 0.5rem;
        }

        .modal-content {
          width: min(100%, 680px);
          max-width: 680px;
          max-height: calc(100vh - 2rem);
          border-radius: var(--radius);
          overflow: hidden;
          overflow-y: auto;
          box-shadow: var(--shadow-lg);
          background: var(--surface);
          animation: modalSlideUp 0.22s ease-out;
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
          padding: 1.25rem;
        }

        .form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }

        @media (max-width: 720px) {
          .modal-content { max-width: 420px; }
          .form-grid { grid-template-columns: 1fr; }
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

        /* Specialty badges and checkbox grid */
        .spec-badge {
          display: inline-block;
          background: rgba(14,165,233,0.08);
          color: var(--primary);
          padding: 0.25rem 0.55rem;
          border-radius: 999px;
          font-size: 0.78rem;
          font-weight: 700;
          margin-right: 0.35rem;
          margin-bottom: 0.35rem;
        }

        .spec-badge.selected {
          background: linear-gradient(90deg,#e0f2fe,#bae6fd);
          color: #075985;
          border: 1px solid #7dd3fc;
        }

        .spec-badge.muted {
          background: transparent;
          color: var(--text-muted);
          border: 1px dashed var(--border);
        }

        .checkbox-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
          gap: 0.5rem;
          align-items: center;
          max-height: 260px;
          overflow-y: auto;
          padding-right: 0.25rem;
        }

        .checkbox-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.45rem 0.5rem;
          border-radius: 8px;
          cursor: pointer;
        }

        .checkbox-item input {
          width: 16px;
          height: 16px;
        }

        .checkbox-item:hover { background: rgba(2,132,199,0.04); }

        .checkbox-label { font-size: 0.95rem; color: var(--text-main); }

        .specialty-list { display: flex; gap: 0.4rem; flex-wrap: wrap; justify-content: center; margin-bottom: 0.4rem; }
        .error-text { color: #dc2626; font-size: 0.72rem; margin-top: 0.2rem; display: block; }
        .field-error { color: #dc2626; font-size: 0.72rem; margin-top: 0.2rem; }
        .success-alert {
          position: absolute;
          left: 50%;
          transform: translateX(-50%);
          top: 12px;
          background: linear-gradient(90deg,#bbf7d0,#86efac);
          padding: 0.6rem 1rem;
          border-radius: 8px;
          color: #064e3b;
          font-weight: 700;
          box-shadow: 0 8px 20px rgba(16,185,129,0.12);
          z-index: 1100;
          animation: toastIn .28s ease-out;
        }

        @keyframes toastIn {
          from { opacity: 0; transform: translateX(-50%) translateY(-8px); }
          to { opacity: 1; transform: translateX(-50%) translateY(0); }
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
