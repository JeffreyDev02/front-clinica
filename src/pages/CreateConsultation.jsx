import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Save, X, Plus, Trash2, Loader2, ClipboardCheck, Pill } from 'lucide-react';
import Select from 'react-select';
import { createConsulta } from '../services/consultaService';
import { getMedicamentos } from '../services/medicamentoService';
import { getAppointments } from '../services/appointmentService';

const CreateConsultation = () => {
    const { idCita } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [medicamentos, setMedicamentos] = useState([]);
    const [appointment, setAppointment] = useState(null);
    
    const [formData, setFormData] = useState({
        id_cita: parseInt(idCita),
        diagnostico: '',
        tratamiento: '',
        medicamentos: [{ id_medicamento: '', dosis: '' }]
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [medsData, appointmentsData] = await Promise.all([
                    getMedicamentos(),
                    getAppointments()
                ]);
                
                // Set medicamentos for select
                setMedicamentos(medsData.map(m => ({
                    value: m.id_medicamento,
                    label: m.nombre || `Med #${m.id_medicamento}`
                })));

                // Find specific appointment
                const apt = appointmentsData.find(a => a.id_cita == idCita);
                setAppointment(apt);
            } catch (err) {
                console.error('Error fetching data:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [idCita]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleMedChange = (index, field, value) => {
        const updatedMeds = [...formData.medicamentos];
        updatedMeds[index][field] = value;
        setFormData(prev => ({ ...prev, medicamentos: updatedMeds }));
    };

    const addMedication = () => {
        setFormData(prev => ({
            ...prev,
            medicamentos: [...prev.medicamentos, { id_medicamento: '', dosis: '' }]
        }));
    };

    const removeMedication = (index) => {
        if (formData.medicamentos.length === 1) return;
        const updatedMeds = formData.medicamentos.filter((_, i) => i !== index);
        setFormData(prev => ({ ...prev, medicamentos: updatedMeds }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setSaving(true);
            // Basic validation
            if (!formData.diagnostico || !formData.tratamiento) {
                alert('Por favor complete el diagnóstico y tratamiento');
                return;
            }

            // Filter out empty medications
            const finalData = {
                ...formData,
                medicamentos: formData.medicamentos.filter(m => m.id_medicamento && m.dosis)
            };

            await createConsulta(finalData);
            alert('Consulta guardada exitosamente');
            navigate('/consultas');
        } catch (err) {
            console.error('Error saving consulta:', err);
            alert('Error al guardar la consulta. Verifique que la cita no tenga ya una consulta asignada.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="loading-state glass">
                <Loader2 className="animate-spin" size={48} />
                <p>Cargando información de la cita...</p>
            </div>
        );
    }

    return (
        <div className="page-container">
            <header className="page-header">
                <div className="title-with-icon">
                    <div className="header-icon-container">
                        <ClipboardCheck size={28} className="header-icon" />
                    </div>
                    <div>
                        <h1>Nueva Consulta Médica</h1>
                        <p>Registro detallado de diagnóstico para la cita #{idCita}</p>
                    </div>
                </div>
                <button className="btn-secondary" onClick={() => navigate('/citas')}>
                    <X size={18} />
                    <span>Cancelar</span>
                </button>
            </header>

            <div className="content-grid">
                <section className="appointment-summary glass">
                    <h2 className="section-title">Resumen de la Cita</h2>
                    {appointment ? (
                        <div className="summary-details">
                            <div className="summary-item">
                                <span className="label">Paciente:</span>
                                <span className="value">#{appointment.id_paciente}</span>
                            </div>
                            <div className="summary-item">
                                <span className="label">Médico:</span>
                                <span className="value">#{appointment.id_medico}</span>
                            </div>
                            <div className="summary-item">
                                <span className="label">Fecha/Hora:</span>
                                <span className="value">{new Date(appointment.fecha).toLocaleDateString()} - {appointment.hora}</span>
                            </div>
                        </div>
                    ) : (
                        <p>Información de cita no encontrada.</p>
                    )}
                </section>

                <form onSubmit={handleSubmit} className="consulta-form">
                    <div className="form-sections-container">
                        <section className="form-section glass">
                            <h2 className="section-title">Resultados de Evaluación</h2>
                            <div className="form-group">
                                <label>Diagnóstico Médico</label>
                                <textarea 
                                    name="diagnostico" 
                                    rows="4" 
                                    required 
                                    placeholder="Escriba el diagnóstico detallado..."
                                    value={formData.diagnostico}
                                    onChange={handleInputChange}
                                    style={{ color: '#0f172a', background: '#fff' }}
                                />
                            </div>
                            <div className="form-group">
                                <label>Instrucciones de Tratamiento</label>
                                <textarea 
                                    name="tratamiento" 
                                    rows="4" 
                                    required 
                                    placeholder="Indique el tratamiento y recomendaciones generales..."
                                    value={formData.tratamiento}
                                    onChange={handleInputChange}
                                    style={{ color: '#0f172a', background: '#fff' }}
                                />
                            </div>
                        </section>

                        <section className="form-section glass">
                            <div className="section-header">
                                <h2 className="section-title">Medicamentos Recetados</h2>
                                <button type="button" className="btn-add-med" onClick={addMedication}>
                                    <Plus size={16} />
                                    <span>Agregar Medicamento</span>
                                </button>
                            </div>
                            
                            <div className="medications-list">
                                {formData.medicamentos.map((med, index) => (
                                    <div key={index} className="medication-row glass">
                                        <div className="med-fields">
                                            <div className="form-group med-select">
                                                <label><Pill size={14} /> Medicamento</label>
                                                <Select
                                                    options={medicamentos}
                                                    placeholder="Seleccionar..."
                                                    value={medicamentos.find(m => m.value === med.id_medicamento)}
                                                    onChange={(opt) => handleMedChange(index, 'id_medicamento', opt.value)}
                                                    classNamePrefix="react-select"
                                                />
                                            </div>
                                            <div className="form-group med-dosis">
                                                <label>Dosis e Instrucciones</label>
                                                <input 
                                                    type="text" 
                                                    placeholder="Ej: 500mg cada 8 horas"
                                                    value={med.dosis}
                                                    onChange={(e) => handleMedChange(index, 'dosis', e.target.value)}
                                                    style={{ color: '#0f172a', background: '#fff' }}
                                                />
                                            </div>
                                        </div>
                                        <button 
                                            type="button" 
                                            className="btn-remove-med" 
                                            onClick={() => removeMedication(index)}
                                            disabled={formData.medicamentos.length === 1}
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </section>
                    </div>

                    <footer className="form-actions">
                        <button type="submit" className="btn-primary btn-large" disabled={saving}>
                            {saving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                            <span>Guardar Consulta Médica</span>
                        </button>
                    </footer>
                </form>
            </div>

            <style dangerouslySetInnerHTML={{ __html: `
                .content-grid {
                    display: grid;
                    grid-template-columns: 300px 1fr;
                    gap: 2rem;
                }

                @media (max-width: 1024px) {
                    .content-grid { grid-template-columns: 1fr; }
                }

                .title-with-icon { display: flex; align-items: center; gap: 1.5rem; }
                .header-icon-container {
                    background: var(--primary);
                    width: 50px; height: 50px;
                    border-radius: 12px;
                    display: flex; align-items: center; justify-content: center;
                    color: white;
                    box-shadow: 0 8px 16px rgba(14, 165, 233, 0.3);
                }

                .appointment-summary { padding: 1.5rem; height: fit-content; }
                .section-title { font-size: 1.1rem; font-weight: 700; margin-bottom: 1.5rem; color: var(--text-main); }
                .summary-details { display: flex; flex-direction: column; gap: 1rem; }
                .summary-item { display: flex; flex-direction: column; gap: 0.25rem; }
                .summary-item .label { font-size: 0.75rem; color: var(--text-muted); font-weight: 700; text-transform: uppercase; }
                .summary-item .value { font-weight: 600; font-size: 1rem; }

                .form-sections-container { display: flex; flex-direction: column; gap: 2rem; }
                .form-section { padding: 2rem; }
                
                .section-header { 
                    display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;
                }
                .section-header .section-title { margin-bottom: 0; }

                .btn-add-med {
                    display: flex; align-items: center; gap: 0.5rem;
                    background: rgba(14, 165, 233, 0.1);
                    color: var(--primary);
                    border: none; padding: 0.6rem 1rem;
                    border-radius: 10px; font-weight: 700; cursor: pointer;
                    transition: var(--transition);
                }
                .btn-add-med:hover { background: var(--primary); color: white; }

                .medications-list { display: flex; flex-direction: column; gap: 1rem; }
                .medication-row { 
                    display: flex; gap: 1rem; padding: 1.25rem; 
                    align-items: flex-end; border: 1px solid var(--border);
                }
                .med-fields { flex: 1; display: grid; grid-template-columns: 1fr 1.5fr; gap: 1.5rem; }
                
                .react-select__control {
                    border-radius: 10px !important;
                    border-color: var(--border) !important;
                    height: 45px;
                }
                .react-select__value-container { padding: 0 1rem !important; }

                .btn-remove-med {
                    background: none; border: none; color: #ef4444; 
                    padding: 0.5rem; cursor: pointer; border-radius: 8px;
                    transition: var(--transition);
                }
                .btn-remove-med:hover:not(:disabled) { background: rgba(239, 68, 68, 0.1); }
                .btn-remove-med:disabled { opacity: 0.3; cursor: not-allowed; }

                .form-actions { margin-top: 2rem; display: flex; justify-content: flex-end; }
                .btn-large { padding: 1.25rem 2.5rem; font-size: 1.1rem; }

                textarea {
                    width: 100%; padding: 1rem; border-radius: 12px;
                    border: 1px solid var(--border); background: white;
                    font-size: 1rem; font-family: inherit; resize: vertical;
                    transition: var(--transition);
                }
                textarea:focus { border-color: var(--primary); outline: none; box-shadow: 0 0 0 4px rgba(14, 165, 233, 0.1); }

                label { display: flex; align-items: center; gap: 0.5rem; font-size: 0.9rem; font-weight: 700; color: var(--text-muted); margin-bottom: 0.5rem; }
            `}} />
        </div>
    );
};

export default CreateConsultation;
