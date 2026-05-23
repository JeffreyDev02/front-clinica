import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Clock, ChevronLeft, ChevronRight, Plus, Edit2, Trash2, X, Save, Loader2, User, Stethoscope, FileText, FileDown } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useNavigate } from 'react-router-dom';
import { getAppointments, createAppointment, updateAppointment, deleteAppointment } from '../services/appointmentService';
import { getPatients } from '../services/patientService';
import { getDoctors } from '../services/doctorService';

const Appointments = () => {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState(null);
  const [formData, setFormData] = useState({
    id_paciente: '',
    id_medico: '',
    fecha: '',
    hora: '',
    estado: 'Normal'
  });
  const [patientQuery, setPatientQuery] = useState('');
  const [doctorQuery, setDoctorQuery] = useState('');
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [filteredDoctors, setFilteredDoctors] = useState([]);
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const [view, setView] = useState('calendar'); // 'calendar' or 'list'

  const fetchData = async () => {
    try {
      setLoading(true);
      const [appointmentsData, patientsData, doctorsData] = await Promise.all([
        getAppointments(),
        getPatients(),
        getDoctors()
      ]);
      setAppointments(appointmentsData);
      setPatients(patientsData);
      setDoctors(doctorsData);
      setError(null);
    } catch (err) {
      setError('Error al cargar los datos. Asegúrate de que la API está corriendo.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Calendar logic
  const days = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
  const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year, month) => {
    const day = new Date(year, month, 1).getDay();
    return day === 0 ? 6 : day - 1; // Adjust for Monday start
  };

  const currentDate = new Date();
  const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  const currentMonth = monthNames[currentDate.getMonth()];
  const currentYear = currentDate.getFullYear();

  const daysInMonth = getDaysInMonth(currentYear, currentDate.getMonth());
  const startingDay = getFirstDayOfMonth(currentYear, currentDate.getMonth());
  const dates = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const getAppointmentsForDate = (date) => {
    return appointments.filter(apt => {
      const aptDate = new Date(apt.fecha);
      return aptDate.getDate() === date && 
             aptDate.getMonth() === currentDate.getMonth() && 
             aptDate.getFullYear() === currentYear;
    });
  };

  const handleOpenModal = (appointment = null) => {
    if (appointment) {
      setEditingAppointment(appointment);
      setFormData({
        id_paciente: appointment.id_paciente,
        id_medico: appointment.id_medico,
        fecha: appointment.fecha ? new Date(appointment.fecha).toISOString().split('T')[0] : '',
        hora: appointment.hora,
        estado: appointment.estado || 'Normal'
      });
      setPatientQuery(getPatientName(appointment.id_paciente));
      setDoctorQuery(getDoctorName(appointment.id_medico));
    } else {
      setEditingAppointment(null);
      setFormData({
        id_paciente: '',
        id_medico: '',
        fecha: new Date().toISOString().split('T')[0],
        hora: '09:00',
        estado: 'Normal'
      });
      setPatientQuery('');
      setDoctorQuery('');
    }
    setFilteredPatients([]);
    setFilteredDoctors([]);
    setFormErrors({});
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingAppointment(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setFormErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handlePatientQueryChange = (e) => {
    const query = e.target.value;
    setPatientQuery(query);
    setFormData(prev => ({ ...prev, id_paciente: '' }));
    setFormErrors(prev => ({ ...prev, id_paciente: '' }));
    const results = query.trim().length > 2 ? patients.filter(p => {
      const fullName = `${p.nombre} ${p.apellido}`.toLowerCase();
      return fullName.includes(query.toLowerCase());
    }).slice(0, 6) : [];
    setFilteredPatients(results);
  };

  const handleDoctorQueryChange = (e) => {
    const query = e.target.value;
    setDoctorQuery(query);
    setFormData(prev => ({ ...prev, id_medico: '' }));
    setFormErrors(prev => ({ ...prev, id_medico: '' }));
    const results = query.trim().length > 2 ? doctors.filter(d => {
      const fullName = `${d.nombre} ${d.apellido}`.toLowerCase();
      return fullName.includes(query.toLowerCase());
    }).slice(0, 6) : [];
    setFilteredDoctors(results);
  };

  const selectPatient = (patient) => {
    setFormData(prev => ({ ...prev, id_paciente: patient.id_paciente }));
    setPatientQuery(`${patient.nombre} ${patient.apellido}`);
    setFilteredPatients([]);
    setFormErrors(prev => ({ ...prev, id_paciente: '' }));
  };

  const selectDoctor = (doctor) => {
    setFormData(prev => ({ ...prev, id_medico: doctor.id_medico }));
    setDoctorQuery(`${doctor.nombre} ${doctor.apellido}`);
    setFilteredDoctors([]);
    setFormErrors(prev => ({ ...prev, id_medico: '' }));
  };

  const normalizeDate = (dateString) => {
    return new Date(`${dateString}T00:00:00`);
  };

  const normalizeTime = (timeString) => {
    if (!timeString) return '';
    const match = timeString.match(/^(\d{1,2}):(\d{2})/);
    return match ? `${match[1].padStart(2, '0')}:${match[2]}` : timeString;
  };

  const validateAppointmentForm = () => {
    const errors = {};
    const today = normalizeDate(new Date().toISOString().split('T')[0]);
    const selectedDate = formData.fecha ? normalizeDate(formData.fecha) : null;
    const selectedTime = normalizeTime(formData.hora || '');
    const currentTime = new Date().toTimeString().slice(0, 5); // Get HH:MM format

    if (!formData.id_paciente) {
      errors.id_paciente = 'Selecciona un paciente válido de la lista';
    }
    if (!formData.id_medico) {
      errors.id_medico = 'Selecciona un médico válido de la lista';
    }
    if (!selectedDate) {
      errors.fecha = 'Selecciona una fecha';
    } else if (selectedDate < today) {
      errors.fecha = 'No puedes agendar una cita en una fecha anterior a hoy';
    }
    if (!selectedTime) {
      errors.hora = 'Selecciona una hora dentro del horario de atención (08:00 - 17:00)';
    } else if (!/^([01]\d|2[0-3]):([0-5]\d)$/.test(selectedTime) || selectedTime < '08:00' || selectedTime > '17:00') {
      errors.hora = 'La hora debe ser entre 08:00 y 17:00';
    } else if (selectedDate?.getTime() === today.getTime() && selectedTime < currentTime) {
      errors.hora = 'No puedes agendar una cita a una hora que ya pasó hoy';
    }

    const sameDate = (apt) => {
      return normalizeDate(apt.fecha).getTime() === selectedDate?.getTime();
    };

    const normalizeId = (id) => (id === null || id === undefined) ? '' : id.toString();
    const sameAppointment = (apt) => editingAppointment ? normalizeId(apt.id_cita) !== normalizeId(editingAppointment.id_cita) : true;
    const selectedDoctorId = normalizeId(formData.id_medico);
    const selectedPatientId = normalizeId(formData.id_paciente);
    const selectedNormalizedTime = selectedTime;

    const sameTimeAndDate = (apt) => normalizeTime(apt.hora) === selectedNormalizedTime && sameDate(apt);

    const conflictDoctor = appointments.find((apt) => {
      return sameAppointment(apt) && sameTimeAndDate(apt) && normalizeId(apt.id_medico) === selectedDoctorId;
    });

    const conflictPatient = appointments.find((apt) => {
      return sameAppointment(apt) && sameTimeAndDate(apt) && normalizeId(apt.id_paciente) === selectedPatientId;
    });

    if (conflictDoctor) {
      errors.id_medico = 'El médico ya tiene una cita en ese día y hora';
    }

    if (conflictPatient) {
      errors.id_paciente = 'El paciente ya tiene una cita en ese día y hora';
    }

    if ((conflictDoctor || conflictPatient) && selectedDate && selectedTime) {
      if (!errors.hora) {
        errors.hora = 'Ya existe una cita en esta fecha/hora';
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Refresh appointments from server to reduce race conditions
    try {
      await fetchData();
    } catch (err) {
      console.warn('No se pudo refrescar datos antes de validar, procediendo con validación local', err);
    }

    if (!validateAppointmentForm()) return;

    setSubmitting(true);
    try {
      // Re-fetch before final submit to ensure latest state
      await fetchData();
      if (!validateAppointmentForm()) {
        return;
      }

      if (editingAppointment) {
        await updateAppointment(editingAppointment.id_cita, formData);
      } else {
        await createAppointment(formData);
      }
      handleCloseModal();
      await fetchData();
    } catch (err) {
      alert('Error al guardar la cita');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar esta cita?')) {
      try {
        await deleteAppointment(id);
        fetchData();
      } catch (err) {
        alert('Error al eliminar la cita');
        console.error(err);
      }
    }
  };

  const getPatientName = (id) => {
    const patient = patients.find(p => p.id_paciente == id);
    return patient ? `${patient.nombre} ${patient.apellido}` : 'Desconocido';
  };

  const getDoctorName = (id) => {
    const doctor = doctors.find(d => d.id_medico == id);
    return doctor ? `${doctor.nombre} ${doctor.apellido}` : 'Desconocido';
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.setFillColor(14, 165, 233);
    doc.rect(0, 0, 210, 35, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('MediConnect \u2014 Reporte de Citas', 15, 22);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(`Generado: ${new Date().toLocaleString()} \u00b7 Total: ${appointments.length}`, 15, 30);
    doc.setTextColor(30, 41, 59);
    autoTable(doc, {
      startY: 42,
      head: [['#', 'Paciente', 'M\u00e9dico', 'Fecha', 'Hora', 'Estado']],
      body: appointments.map((a, i) => [
        i + 1,
        getPatientName(a.id_paciente),
        getDoctorName(a.id_medico),
        a.fecha ? new Date(a.fecha).toLocaleDateString() : '\u2014',
        a.hora || '\u2014',
        a.estado || '\u2014',
      ]),
      theme: 'striped',
      headStyles: { fillColor: [14, 165, 233] },
      styles: { fontSize: 8 },
    });
    doc.save(`citas_${new Date().toISOString().slice(0,10)}.pdf`);
  };

  return (
    <div className="page-container">
      <header className="page-header">
        <div>
          <h1>Gestión de Citas</h1>
          <p>Organiza y supervisa la agenda médica.</p>
        </div>
        <div className="header-actions">
          <div className="view-toggle glass">
             <button 
               className={view === 'calendar' ? 'active' : ''} 
               onClick={() => setView('calendar')}
             >
               Calendario
             </button>
             <button 
               className={view === 'list' ? 'active' : ''} 
               onClick={() => setView('list')}
             >
               Lista
             </button>
          </div>
          <button className="btn-primary" onClick={() => handleOpenModal()}>
            <Plus size={18} />
            <span>Agendar Cita</span>
          </button>
          <button className="btn-secondary" onClick={exportPDF} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <FileDown size={18} />
            <span>Exportar PDF</span>
          </button>
        </div>
      </header>

      {loading ? (
        <div className="loading-state glass">
          <Loader2 className="animate-spin" size={48} />
          <p>Cargando citas y personal...</p>
        </div>
      ) : error ? (
        <div className="error-state glass">
          <p>{error}</p>
          <button className="btn-primary" onClick={fetchData}>Reintentar</button>
        </div>
      ) : view === 'list' ? (
        <div className="table-responsive glass">
          <table className="data-table">
            <thead>
              <tr>
                <th>Paciente</th>
                <th>Médico</th>
                <th>Fecha</th>
                <th>Hora</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {appointments.length > 0 ? (
                appointments.map((apt) => (
                  <tr key={apt.id_cita}>
                    <td className="font-semibold">
                       <div className="entity-cell">
                         <User size={14} className="icon" />
                         {getPatientName(apt.id_paciente)}
                       </div>
                    </td>
                    <td>
                      <div className="entity-cell">
                        <Stethoscope size={14} className="icon" />
                        {getDoctorName(apt.id_medico)}
                      </div>
                    </td>
                    <td>{new Date(apt.fecha).toLocaleDateString()}</td>
                    <td>
                      <div className="time-cell">
                        <Clock size={14} />
                        {apt.hora}
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${apt.estado?.toLowerCase() || 'normal'}`}>
                        {apt.estado || 'Normal'}
                      </span>
                    </td>
                    <td>
                      <div className="actions-cell">
                          <button className="btn-ghost edit" onClick={() => handleOpenModal(apt)} title="Editar Cita">
                            <Edit2 size={16} />
                          </button>
                          <button className="btn-ghost edit" onClick={() => navigate(`/consultas/nueva/${apt.id_cita}`)} title="Generar Consulta">
                            <FileText size={16} />
                          </button>
                          <button className="btn-ghost delete" onClick={() => handleDelete(apt.id_cita)} title="Eliminar Cita">
                            <Trash2 size={16} />
                          </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="empty-row">No hay citas programadas.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      ) : (
        <section className="calendar-container glass">
          <header className="calendar-header">
            <div className="current-month">
              <CalendarIcon size={20} />
              <h2>{currentMonth} {currentYear}</h2>
            </div>
          </header>

          <div className="calendar-grid">
            {days.map(day => <div key={day} className="day-name">{day}</div>)}
            {Array.from({ length: startingDay }).map((_, i) => (
              <div key={`empty-${i}`} className="day-slot empty"></div>
            ))}
            {dates.map(date => {
              const dateAppointments = getAppointmentsForDate(date);
              return (
                <div key={date} className={`day-slot ${date === currentDate.getDate() ? 'today' : ''}`}>
                  <span className="date-number">{date}</span>
                  {dateAppointments.length > 0 && (
                    <div className="events-container">
                      {dateAppointments.slice(0, 3).map((apt) => (
                        <div 
                          key={apt.id_cita} 
                          className={`calendar-event ${apt.estado?.toLowerCase() || 'normal'}`}
                          title={`${getPatientName(apt.id_paciente)} - ${apt.hora}`}
                          onClick={() => handleOpenModal(apt)}
                        >
                          {apt.hora} - {getPatientName(apt.id_paciente).split(' ')[0]}
                        </div>
                      ))}
                      {dateAppointments.length > 3 && (
                        <div className="more-events">+{dateAppointments.length - 3} más</div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Modal - Could be a separate component but for simplicity in this task we keep it here */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content glass">
            <header className="modal-header">
              <h2>{editingAppointment ? 'Editar Cita' : 'Agendar Nueva Cita'}</h2>
              <button className="btn-close" onClick={handleCloseModal}>
                <X size={20} />
              </button>
            </header>
            <form onSubmit={handleSubmit} className="modal-form" noValidate>
              <div className="form-grid">
                <div className="form-group">
                  <label>Paciente</label>
                  <input
                    type="text"
                    name="patientQuery"
                    value={patientQuery}
                    onChange={handlePatientQueryChange}
                    placeholder="Buscar paciente por nombre"
                    autoComplete="off"
                  />
                  <input type="hidden" name="id_paciente" value={formData.id_paciente} />
                  <span className="field-note">Escribe al menos 3 caracteres para buscar</span>
                  {formErrors.id_paciente && <span className="field-error">{formErrors.id_paciente}</span>}
                  {filteredPatients.length > 0 && (
                    <ul className="suggestions-list">
                      {filteredPatients.map((p) => (
                        <li key={p.id_paciente} onMouseDown={() => selectPatient(p)}>
                          {p.nombre} {p.apellido}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                <div className="form-group">
                  <label>Médico</label>
                  <input
                    type="text"
                    name="doctorQuery"
                    value={doctorQuery}
                    onChange={handleDoctorQueryChange}
                    placeholder="Buscar médico por nombre"
                    autoComplete="off"
                  />
                  <input type="hidden" name="id_medico" value={formData.id_medico} />
                  <span className="field-note">Escribe al menos 3 caracteres para buscar</span>
                  {formErrors.id_medico && <span className="field-error">{formErrors.id_medico}</span>}
                  {filteredDoctors.length > 0 && (
                    <ul className="suggestions-list">
                      {filteredDoctors.map((d) => (
                        <li key={d.id_medico} onMouseDown={() => selectDoctor(d)}>
                          {d.nombre} {d.apellido}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                <div className="form-group">
                  <label>Fecha</label>
                  <input 
                    type="date" 
                    name="fecha" 
                    required 
                    value={formData.fecha}
                    onChange={handleInputChange}
                  />
                  {formErrors.fecha && <span className="field-error">{formErrors.fecha}</span>}
                </div>
                <div className="form-group">
                  <label>Hora</label>
                  <input 
                    type="time" 
                    name="hora" 
                    step="900"
                    value={formData.hora}
                    onChange={handleInputChange}
                  />
                  {formErrors.hora && <span className="field-error">{formErrors.hora}</span>}
                </div>
                <div className="form-group full-width">
                  <label>Estado</label>
                  <select 
                    name="estado" 
                    required 
                    value={formData.estado}
                    onChange={handleInputChange}
                  >
                    <option value="Normal">Normal</option>
                    <option value="Urgente">Urgente</option>
                    <option value="Cancelada">Cancelada</option>
                    <option value="Completada">Completada</option>
                  </select>
                </div>
              </div>
              <footer className="modal-footer">
                <button type="button" className="btn-secondary" onClick={handleCloseModal}>Cancelar</button>
                <button type="submit" className="btn-primary" disabled={submitting} aria-busy={submitting}>
                  <Save size={18} />
                  <span>{submitting ? 'Guardando...' : (editingAppointment ? 'Actualizar Cita' : 'Confirmar Cita')}</span>
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
          font-weight: 700;
          font-size: 0.85rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          border-bottom: 1px solid var(--border);
        }

        .data-table td {
          padding: 1.25rem 1.5rem;
          border-bottom: 1px solid var(--border);
          font-size: 0.95rem;
        }

        .header-actions {
          display: flex;
          align-items: center;
          gap: 1.5rem;
        }

        .view-toggle {
          display: flex;
          padding: 0.3rem;
          border-radius: 12px;
          background: rgba(14, 165, 233, 0.05);
        }

        .view-toggle button {
          padding: 0.5rem 1.25rem;
          border-radius: 9px;
          font-size: 0.85rem;
          font-weight: 700;
          color: var(--text-muted);
          transition: var(--transition);
          border: none;
          background: none;
          cursor: pointer;
        }

        .view-toggle button.active {
          background: white;
          color: var(--primary);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
        }

        /* Calendar Grid Styles */
        .calendar-container {
          padding: 2rem;
          border-radius: 20px;
        }

        .calendar-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
        }

        .current-month {
          display: flex;
          align-items: center;
          gap: 1rem;
          color: var(--text-main);
        }

        .calendar-grid {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: 1px;
          background: var(--border);
          border: 1px solid var(--border);
          border-radius: 12px;
          overflow: hidden;
        }

        .day-name {
          background: var(--surface);
          padding: 1.25rem 1rem;
          text-align: center;
          font-weight: 800;
          font-size: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--text-muted);
        }

        .day-slot {
          background: var(--surface);
          min-height: 140px;
          padding: 1rem;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          transition: var(--transition);
        }

        .day-slot.empty { background: var(--background); }
        .day-slot.today { background: rgba(14, 165, 233, 0.03); }

        .date-number { font-weight: 700; font-size: 0.9rem; color: var(--text-muted); }
        .today .date-number { 
          color: var(--primary); 
          background: rgba(14, 165, 233, 0.1);
          width: 28px; height: 28px;
          display: flex; align-items: center; justify-content: center;
          border-radius: 50%;
        }

        .events-container {
           display: flex; flex-direction: column; gap: 0.4rem;
        }

        .calendar-event {
          font-size: 0.7rem;
          font-weight: 700;
          padding: 0.35rem 0.6rem;
          border-radius: 6px;
          cursor: pointer;
          transition: var(--transition);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .calendar-event:hover { transform: translateX(4px); }

        .calendar-event.normal { background: rgba(34, 197, 94, 0.1); color: #16a34a; border-left: 3px solid #16a34a; }
        .calendar-event.urgente { background: rgba(239, 68, 68, 0.1); color: #ef4444; border-left: 3px solid #ef4444; }
        .calendar-event.cancelada { background: rgba(100, 116, 139, 0.1); color: #64748b; border-left: 3px solid #64748b; }
        .calendar-event.completada { background: rgba(14, 165, 233, 0.1); color: var(--primary); border-left: 3px solid var(--primary); }

        .more-events {
          font-size: 0.7rem; font-weight: 700; color: var(--text-muted); padding-left: 0.5rem;
        }

        .entity-cell {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .entity-cell .icon {
          color: var(--primary);
          opacity: 0.7;
        }

        .time-cell {
           display: flex;
           align-items: center;
           gap: 0.5rem;
           color: var(--text-muted);
           font-weight: 600;
        }

        .badge {
          padding: 0.35rem 0.75rem;
          border-radius: 6px;
          font-size: 0.75rem;
          font-weight: 700;
        }

        .badge.normal { background: rgba(34, 197, 94, 0.1); color: #16a34a; }
        .badge.urgente { background: rgba(239, 68, 68, 0.1); color: #ef4444; }
        .badge.cancelada { background: rgba(100, 116, 139, 0.1); color: #64748b; }
        .badge.completada { background: rgba(14, 165, 233, 0.1); color: var(--primary); }

        .actions-cell {
          display: flex;
          gap: 0.75rem;
        }

        .btn-ghost {
          background: none;
          padding: 0.5rem;
          border-radius: 8px;
          color: var(--text-muted);
          transition: var(--transition);
        }

        .btn-ghost:hover {
          background: var(--background);
        }

        .btn-ghost.edit:hover { color: var(--primary); }
        .btn-ghost.delete:hover { color: #ef4444; }

        .empty-row {
          text-align: center;
          padding: 4rem !important;
          color: var(--text-muted);
        }

        /* Modal Styles */
        .modal-overlay {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(15, 23, 42, 0.6);
          backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 2000;
          padding: 1.5rem;
        }

        .modal-content {
          width: 100%;
          max-width: 600px;
          background: var(--surface);
          border-radius: 20px;
          box-shadow: var(--shadow-lg);
          animation: slideUp 0.3s ease-out;
        }

        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .modal-header {
           padding: 1.5rem 2rem;
           border-bottom: 1px solid var(--border);
           display: flex; justify-content: space-between; align-items: center;
        }

        .modal-form { padding: 2rem; }
        .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; }
        .form-group { display: flex; flex-direction: column; gap: 0.5rem; }
        .full-width { grid-column: span 2; }

        .form-group label {
          font-size: 0.85rem; font-weight: 700; color: var(--text-muted);
        }

        .form-group input, .form-group select {
          padding: 0.85rem 1rem;
          border-radius: 12px;
          border: 1px solid var(--border);
          background: white;
          font-size: 0.95rem;
          outline: none;
          transition: var(--transition);
          color: #1e293b; /* Dark text for readability */
        }

        .suggestions-list {
          margin: 0.5rem 0 0;
          padding: 0.35rem 0;
          border-radius: 12px;
          border: 1px solid var(--border);
          background: #fff;
          max-height: 240px;
          overflow-y: auto;
          box-shadow: 0 12px 30px rgba(15, 23, 42, 0.08);
          list-style: none;
          z-index: 20;
        }

        .suggestions-list li {
          padding: 0.75rem 1rem;
          cursor: pointer;
          transition: background 0.2s ease;
        }

        .suggestions-list li:hover {
          background: rgba(14, 165, 233, 0.08);
        }

        .form-group select option {
          color: #1e293b;
          background: white;
        }

        .form-group input:focus, .form-group select:focus {
           border-color: var(--primary);
           box-shadow: 0 0 0 4px rgba(14, 165, 233, 0.1);
           background: white;
        }

        .modal-footer {
          margin-top: 2.5rem;
          padding-top: 1.5rem;
          border-top: 1px solid var(--border);
          display: flex; justify-content: flex-end; gap: 1rem;
        }

        .btn-primary, .btn-secondary {
          padding: 0.85rem 1.75rem;
          border-radius: 12px;
          font-weight: 700;
          display: flex; align-items: center; gap: 0.75rem;
          transition: var(--transition);
          cursor: pointer;
          border: none;
        }

        .btn-primary {
          background: linear-gradient(135deg, var(--primary), #0284c7);
          color: white !important;
        }

        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 25px rgba(14, 165, 233, 0.4);
        }

        .btn-secondary {
          background: white; border: 1px solid var(--border); color: var(--text-main);
        }

        .btn-secondary:hover {
          background: var(--background); border-color: var(--primary); color: var(--primary);
        }

        .field-note {
          display: block;
          color: var(--text-muted);
          font-size: 0.78rem;
          margin-top: 0.25rem;
        }

        .field-error {
          display: block;
          color: #dc2626;
          font-size: 0.78rem;
          margin-top: 0.25rem;
        }

        .loading-state {
           display: flex; flex-direction: column; align-items: center; padding: 5rem; gap: 1.5rem;
        }

        .animate-spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}} />
    </div>
  );
};

export default Appointments;
