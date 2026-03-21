import React, { useState, useEffect } from 'react';
import { Plus, Tag, Edit2, Trash2, X, Save, Loader2, Sparkles } from 'lucide-react';
import { getSpecialties, createSpecialty, updateSpecialty, deleteSpecialty } from '../services/specialtyService';

const Specialties = () => {
  const [specialties, setSpecialties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSpecialty, setEditingSpecialty] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: ''
  });

  const fetchSpecialties = async () => {
    try {
      setLoading(true);
      const data = await getSpecialties();
      setSpecialties(data);
      setError(null);
    } catch (err) {
      setError('Error al cargar las especialidades. Asegúrate de que la API está corriendo.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSpecialties();
  }, []);

  const handleOpenModal = (specialty = null) => {
    if (specialty) {
      setEditingSpecialty(specialty);
      setFormData({
        nombre: specialty.nombre,
        descripcion: specialty.descripcion || ''
      });
    } else {
      setEditingSpecialty(null);
      setFormData({
        nombre: '',
        descripcion: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingSpecialty(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingSpecialty) {
        await updateSpecialty(editingSpecialty.id_especialidad, formData);
      } else {
        await createSpecialty(formData);
      }
      handleCloseModal();
      fetchSpecialties();
    } catch (err) {
      alert('Error al guardar la especialidad');
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar esta especialidad?')) {
      try {
        await deleteSpecialty(id);
        fetchSpecialties();
      } catch (err) {
        alert('Error al eliminar la especialidad');
        console.error(err);
      }
    }
  };

  return (
    <div className="page-container">
      <header className="page-header">
        <div>
          <h1>Especialidades Médicas</h1>
          <p>Gestiona las diferentes áreas de atención de la clínica.</p>
        </div>
        <button className="btn-primary" onClick={() => handleOpenModal()}>
          <Plus size={18} />
          <span>Nueva Especialidad</span>
        </button>
      </header>

      {loading ? (
        <div className="loading-state glass">
          <Loader2 className="animate-spin" size={48} />
          <p>Cargando especialidades...</p>
        </div>
      ) : error ? (
        <div className="error-state glass">
          <p>{error}</p>
          <button className="btn-primary" onClick={fetchSpecialties}>Reintentar</button>
        </div>
      ) : (
        <section className="specialties-grid">
          {specialties.map((spec) => (
            <div key={spec.id_especialidad} className="spec-card glass">
              <div className="spec-icon">
                <Tag size={24} />
              </div>
              <div className="spec-info">
                <h3>{spec.nombre}</h3>
                <p>{spec.descripcion || 'Sin descripción disponible.'}</p>
                <div className="spec-badge">
                  <Sparkles size={12} />
                  <span>Activa</span>
                </div>
              </div>
              <div className="card-actions">
                <button className="btn-edit" onClick={() => handleOpenModal(spec)}>
                  <Edit2 size={16} />
                  <span>Editar</span>
                </button>
                <button className="btn-delete-card" onClick={() => handleDelete(spec.id_especialidad)}>
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
          {specialties.length === 0 && (
            <div className="empty-state full-width">
              <p>No hay especialidades registradas.</p>
            </div>
          )}
        </section>
      )}

      {/* Modal CRUD */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content glass">
            <header className="modal-header">
              <h2>{editingSpecialty ? 'Editar Especialidad' : 'Nueva Especialidad'}</h2>
              <button className="btn-close" onClick={handleCloseModal}>
                <X size={20} />
              </button>
            </header>
            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-group">
                <label>Nombre de la Especialidad</label>
                <input 
                  type="text" 
                  name="nombre" 
                  required 
                  value={formData.nombre}
                  onChange={handleInputChange}
                  placeholder="Ej. Cardiología"
                />
              </div>
              <div className="form-group">
                <label>Descripción (Opcional)</label>
                <textarea 
                  name="descripcion" 
                  rows="3"
                  value={formData.descripcion}
                  onChange={handleInputChange}
                  placeholder="Describe brevemente la especialidad..."
                  style={{ 
                    width: '100%', 
                    padding: '0.75rem', 
                    borderRadius: '8px', 
                    border: '1px solid var(--border)',
                    background: 'var(--background)',
                    color: 'var(--text-main)',
                    resize: 'none'
                  }}
                />
              </div>
              <footer className="modal-footer">
                <button type="button" className="btn-secondary" onClick={handleCloseModal}>Cancelar</button>
                <button type="submit" className="btn-primary">
                  <Save size={18} />
                  <span>{editingSpecialty ? 'Actualizar' : 'Guardar'}</span>
                </button>
              </footer>
            </form>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        .specialties-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 1.5rem;
        }

        .spec-card {
          padding: 1.5rem;
          border-radius: var(--radius);
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
          transition: var(--transition);
        }

        .spec-card:hover {
          transform: translateY(-5px);
          border-color: var(--primary);
        }

        .spec-icon {
          width: 50px;
          height: 50px;
          background: rgba(14, 165, 233, 0.1);
          color: var(--primary);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .spec-info h3 {
          font-size: 1.25rem;
          font-weight: 700;
          margin-bottom: 0.5rem;
        }

        .spec-info p {
          color: var(--text-muted);
          font-size: 0.9rem;
          line-height: 1.5;
          margin-bottom: 1rem;
        }

        .spec-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          padding: 0.25rem 0.75rem;
          background: rgba(34, 197, 94, 0.1);
          color: #22c55e;
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: 600;
        }

        .card-actions {
          display: flex;
          gap: 0.75rem;
          margin-top: auto;
          padding-top: 1rem;
          border-top: 1px solid var(--border);
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
        }

        .form-group {
          margin-bottom: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
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
      `}} />
    </div>
  );
};

export default Specialties;
