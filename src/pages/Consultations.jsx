import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, FileDown, Edit2, Search, User, Calendar, Hash } from 'lucide-react';
import { getConsultas, getConsultaById } from '../services/consultaService';
import { getAppointments } from '../services/appointmentService';
import { getPatients } from '../services/patientService';
import { getMedicamentos } from '../services/medicamentoService';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const Consultations = () => {
    const navigate = useNavigate();
    const [consultas, setConsultas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [contextData, setContextData] = useState({
        patients: [],
        appointments: [],
        medicamentos: []
    });

    const fetchData = async () => {
        try {
            setLoading(true);
            const [consultasData, patientsData, appointmentsData, medsData] = await Promise.all([
                getConsultas(),
                getPatients(),
                getAppointments(),
                getMedicamentos()
            ]);
            setConsultas(consultasData);
            setContextData({
                patients: patientsData,
                appointments: appointmentsData,
                medicamentos: medsData
            });
        } catch (err) {
            console.error('Error fetching consultations:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const getPatientName = (idCita) => {
        const apt = contextData.appointments.find(a => a.id_cita == idCita);
        if (!apt) return 'Desconocido';
        const patient = contextData.patients.find(p => p.id_paciente == apt.id_paciente);
        return patient ? `${patient.nombre} ${patient.apellido}` : 'Desconocido';
    };

    const generatePDF = async (consultaSummary) => {
        let consulta = consultaSummary;
        setLoading(true);
        
        try {
            console.log('Solicitando detalle completo para ID:', consulta.id_consulta);
            const fullConsulta = await getConsultaById(consulta.id_consulta);
            if (fullConsulta) {
                consulta = fullConsulta;
            }
        } catch (err) {
            console.warn('Error al obtener detalle, usando datos locales:', err);
        } finally {
            setLoading(false);
        }

        console.log('Estructura final de la consulta:', consulta);
        const doc = jsPDF();
        const patientName = getPatientName(consulta.id_cita);
        const apt = contextData.appointments.find(a => a.id_cita == consulta.id_cita);
        const date = apt ? new Date(apt.fecha).toLocaleDateString() : 'N/A';

        // Header
        doc.setFillColor(14, 165, 233);
        doc.rect(0, 0, 210, 40, 'F');
        
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(24);
        doc.setFont('helvetica', 'bold');
        doc.text('MediConnect', 20, 25);
        
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text('Informe de Consulta Médica', 20, 32);
        
        doc.setTextColor(100, 116, 139);
        doc.setFontSize(10);
        doc.text(`Fecha: ${new Date().toLocaleDateString()}`, 160, 50);
        doc.text(`ID Consulta: #${consulta.id_consulta}`, 160, 55);

        // Patient Info
        doc.setTextColor(30, 41, 59);
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('Información del Paciente', 20, 65);
        
        doc.setDrawColor(226, 232, 240);
        doc.line(20, 68, 190, 68);

        doc.setFontSize(11);
        doc.setFont('helvetica', 'normal');
        doc.text(`Nombre: ${patientName}`, 20, 78);
        doc.text(`Fecha de Cita: ${date}`, 20, 85);

        // Diagnostic
        doc.setFont('helvetica', 'bold');
        doc.text('Diagnóstico:', 20, 100);
        doc.setFont('helvetica', 'normal');
        const diagText = doc.splitTextToSize(consulta.diagnostico || 'Sin diagnóstico', 170);
        doc.text(diagText, 20, 107);

        // Treatment
        const diagLines = diagText.length;
        const treatmentY = 107 + (diagLines * 6) + 10;
        
        doc.setFont('helvetica', 'bold');
        doc.text('Tratamiento:', 20, treatmentY);
        doc.setFont('helvetica', 'normal');
        const treatmentText = doc.splitTextToSize(consulta.tratamiento || 'Sin tratamiento especificado', 170);
        doc.text(treatmentText, 20, treatmentY + 7);

        // Medications Table
        const treatmentLines = treatmentText.length;
        const TableY = treatmentY + 7 + (treatmentLines * 6) + 15;

        // Búsqueda flexible de medicamentos
        let medsArray = consulta.medicamentos || consulta.medicamento || consulta.receta || consulta.items;
        if (typeof medsArray === 'string') {
            try { medsArray = JSON.parse(medsArray); } catch { medsArray = []; }
        }

        if (Array.isArray(medsArray) && medsArray.length > 0) {
            console.log('Medicamentos a imprimir:', medsArray);
            doc.setFont('helvetica', 'bold');
            doc.text('Receta de Medicamentos:', 20, TableY - 5);

            const tableData = medsArray.map(m => [
                m.nombre || (contextData.medicamentos.find(med => med.id_medicamento == m.id_medicamento)?.nombre) || `ID: ${m.id_medicamento}`,
                m.dosis || 'N/A'
            ]);

        autoTable(doc, {
                startY: TableY,
                head: [['Medicamento', 'Dosis e Instrucciones']],
                body: tableData,
                theme: 'striped',
                headStyles: { fillColor: [14, 165, 233] },
                margin: { left: 20, right: 20 }
            });
        } else {
            console.warn('Estructura de medicamentos no encontrada:', consulta);
            doc.setFont('helvetica', 'italic');
            doc.setTextColor(150, 150, 150);
            doc.text('No se registraron medicamentos para esta consulta.', 20, TableY);
        }

        // Footer / Signature
        const finalY = doc.lastAutoTable ? doc.lastAutoTable.finalY + 30 : TableY + 40;
        const pageHeight = doc.internal.pageSize.height;
        let signatureY = finalY;
        if (signatureY > pageHeight - 30) {
            doc.addPage();
            signatureY = 40;
        }

        doc.setTextColor(30, 41, 59);
        doc.line(120, signatureY, 180, signatureY);
        doc.setFontSize(9);
        doc.text('Firma del Médico Responsable', 125, signatureY + 5);

        doc.save(`Consulta_${patientName.replace(/\s+/g, '_')}_${consulta.id_consulta}.pdf`);
    };

    const filteredConsultas = consultas.filter(c => {
        const patientName = getPatientName(c.id_cita).toLowerCase();
        return patientName.includes(searchTerm.toLowerCase()) || 
               c.id_consulta.toString().includes(searchTerm) ||
               c.id_cita.toString().includes(searchTerm);
    });

    return (
        <div className="page-container">
            <header className="page-header">
                <div>
                    <h1>Historial de Consultas</h1>
                    <p>Gestión y descarga de reportes médicos.</p>
                </div>
                <div className="search-bar glass">
                    <Search size={18} className="search-icon" />
                    <input 
                        type="text" 
                        placeholder="Buscar por paciente o ID..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </header>

            {loading ? (
                <div className="loading-state glass">
                    <Loader2 className="animate-spin" size={48} />
                    <p>Cargando historial de consultas...</p>
                </div>
            ) : (
                <div className="table-responsive glass">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th><Hash size={14} /> ID</th>
                                <th><Calendar size={14} /> Cita</th>
                                <th><User size={14} /> Paciente</th>
                                <th>Diagnóstico</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredConsultas.length > 0 ? (
                                filteredConsultas.map((c) => (
                                    <tr key={c.id_consulta}>
                                        <td><span className="id-badge">#{c.id_consulta}</span></td>
                                        <td><span className="apt-link">Cita #{c.id_cita}</span></td>
                                        <td className="font-semibold">{getPatientName(c.id_cita)}</td>
                                        <td>
                                            <p className="truncate-text" title={c.diagnostico}>
                                                {c.diagnostico}
                                            </p>
                                        </td>
                                        <td>
                                            <div className="actions-cell">
                                                <button 
                                                    className="btn-action-view" 
                                                    onClick={() => generatePDF(c)}
                                                    title="Descargar PDF"
                                                >
                                                    <FileDown size={18} />
                                                    <span>PDF</span>
                                                </button>
                                                <button className="btn-action-edit" onClick={() => navigate(`/consultas/editar/${c.id_consulta}`)} title="Editar consulta y receta">
                                                    <Edit2 size={18} />
                                                    <span>Editar</span>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="empty-row"> No se encontraron consultas registradas.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            <style dangerouslySetInnerHTML={{ __html: `
                .search-bar {
                    display: flex;
                    align-items: center;
                    padding: 0.5rem 1rem;
                    gap: 0.75rem;
                    width: 350px;
                }
                .search-icon { color: var(--text-muted); }
                .search-bar input {
                    border: none; background: none; outline: none;
                    width: 100%; font-size: 0.9rem; color: var(--text-main);
                }

                .id-badge {
                    background: rgba(14, 165, 233, 0.1);
                    color: var(--primary);
                    padding: 0.25rem 0.6rem;
                    border-radius: 6px;
                    font-weight: 700;
                    font-size: 0.85rem;
                }

                .apt-link {
                    color: var(--text-muted);
                    font-weight: 600;
                    font-size: 0.9rem;
                }

                .truncate-text {
                    max-width: 300px;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    color: var(--text-muted);
                    font-size: 0.9rem;
                }

                .btn-action-view {
                    display: flex; align-items: center; gap: 0.5rem;
                    background: linear-gradient(135deg, #10b981, #059669);
                    color: white; border: none; padding: 0.5rem 1rem;
                    border-radius: 8px; font-weight: 700; cursor: pointer;
                    transition: var(--transition);
                }
                .btn-action-view:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3); }
                .btn-action-edit { display:flex;align-items:center;gap:.5rem;background:#0ea5e9;color:white;border:0;padding:.5rem 1rem;border-radius:8px;font-weight:700;cursor:pointer; }

                .font-semibold { font-weight: 600; color: var(--text-main); }
            `}} />
        </div>
    );
};

export default Consultations;
