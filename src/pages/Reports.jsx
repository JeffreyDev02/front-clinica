import React, { useState, useEffect } from 'react';
import {
    Users, UserRound, Calendar, ClipboardList,
    Loader2, FileDown, TrendingUp, Pill, Trophy, Award, Search
} from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import {
    getResumen,
    getPacienteFrecuente,
    getDoctorMasTrabajo,
    getPacientesAtendidos,
    getMedicamentosReporte,
    getDoctoresReporte,
    getCitasReporte,
} from '../services/reporteService';

const ESTADO_COLORS = {
    Normal:    '#0ea5e9',
    Urgente:   '#ef4444',
    Cancelada: '#94a3b8',
    Completada:'#22c55e',
};

// â”€â”€ Helpers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const pdfHeader = (doc, title) => {
    doc.setFillColor(14, 165, 233);
    doc.rect(0, 0, 210, 35, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text(`MediConnect - ${title}`, 15, 22);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(`Generado: ${new Date().toLocaleString()}`, 15, 30);
    doc.setTextColor(30, 41, 59);
};

const DateFilter = ({ desde, hasta, onDesde, onHasta, onBuscar, loading }) => (
    <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            <span>Desde:</span>
            <input type="date" value={desde} onChange={e => onDesde(e.target.value)}
                style={{ border: '1px solid #e2e8f0', borderRadius: 8, padding: '4px 8px', fontSize: '0.85rem', background: 'white' }} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            <span>Hasta:</span>
            <input type="date" value={hasta} onChange={e => onHasta(e.target.value)}
                style={{ border: '1px solid #e2e8f0', borderRadius: 8, padding: '4px 8px', fontSize: '0.85rem', background: 'white' }} />
        </div>
        <button onClick={onBuscar} disabled={loading}
            style={{
                display: 'flex', alignItems: 'center', gap: '0.4rem',
                background: 'var(--primary)', color: '#fff',
                border: 'none', borderRadius: 8, padding: '5px 14px',
                fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer',
                fontSize: '0.85rem', opacity: loading ? 0.6 : 1,
            }}>
            {loading ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <Search size={14} />}
            Buscar
        </button>
    </div>
);

const SectionHeader = ({ icon, title, color, onExport }) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {React.cloneElement(icon, { size: 18, style: { color } })}
            <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: 600, color: 'var(--text-main)' }}>{title}</h2>
        </div>
        <button onClick={onExport}
            style={{
                display: 'flex', alignItems: 'center', gap: '0.4rem',
                background: `${color}15`, color,
                border: `1px solid ${color}40`, borderRadius: 8, padding: '5px 12px',
                fontWeight: 600, cursor: 'pointer', fontSize: '0.8rem',
            }}>
            <FileDown size={14} /> Exportar PDF
        </button>
    </div>
);

const SimpleTable = ({ headers, rows, emptyMsg }) => (
    rows.length === 0
        ? <p style={{ color: 'var(--text-muted)', padding: '0.5rem 0' }}>{emptyMsg || 'Sin datos'}</p>
        : <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                <thead>
                    <tr style={{ borderBottom: '2px solid #e2e8f0' }}>
                        {headers.map(h => (
                            <th key={h} style={{ padding: '0.6rem 0.75rem', textAlign: 'left', color: 'var(--text-muted)', fontWeight: 600, whiteSpace: 'nowrap' }}>{h}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>{rows}</tbody>
            </table>
        </div>
);

// â”€â”€ Component â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const Reports = () => {
    const today    = new Date().toISOString().slice(0, 10);
    const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

    // Summary & highlights
    const [resumen,           setResumen]           = useState(null);
    const [pacienteFrecuente, setPacienteFrecuente] = useState([]);
    const [doctorTrabajo,     setDoctorTrabajo]     = useState([]);

    // Section data
    const [pacientesData,    setPacientesData]    = useState([]);
    const [medicamentosData, setMedicamentosData] = useState([]);
    const [doctoresData,     setDoctoresData]     = useState([]);
    const [citasData,        setCitasData]        = useState([]);

    // Date filters
    const [pDesde, setPDesde] = useState(monthAgo);
    const [pHasta, setPHasta] = useState(today);
    const [dDesde, setDDesde] = useState(monthAgo);
    const [dHasta, setDHasta] = useState(today);
    const [cDesde, setCDesde] = useState(monthAgo);
    const [cHasta, setCHasta] = useState(today);

    // Loading states
    const [loading,          setLoading]          = useState(true);
    const [loadingPacientes, setLoadingPacientes] = useState(false);
    const [loadingDoctores,  setLoadingDoctores]  = useState(false);
    const [loadingCitas,     setLoadingCitas]     = useState(false);
    const [error,            setError]            = useState(null);

    const loadPacientes = async (desde, hasta) => {
        setLoadingPacientes(true);
        try { setPacientesData(await getPacientesAtendidos(desde, hasta)); }
        catch (e) { console.error(e); }
        finally { setLoadingPacientes(false); }
    };

    const loadDoctores = async (desde, hasta) => {
        setLoadingDoctores(true);
        try { setDoctoresData(await getDoctoresReporte(desde, hasta)); }
        catch (e) { console.error(e); }
        finally { setLoadingDoctores(false); }
    };

    const loadCitas = async (desde, hasta) => {
        setLoadingCitas(true);
        try { setCitasData(await getCitasReporte(desde, hasta)); }
        catch (e) { console.error(e); }
        finally { setLoadingCitas(false); }
    };

    useEffect(() => {
        const init = async () => {
            try {
                setLoading(true);
                const [r, pf, dt, meds] = await Promise.all([
                    getResumen(),
                    getPacienteFrecuente(),
                    getDoctorMasTrabajo(),
                    getMedicamentosReporte(),
                ]);
                setResumen(r);
                setPacienteFrecuente(pf);
                setDoctorTrabajo(dt);
                setMedicamentosData(meds);
            } catch (err) {
                setError('Error al cargar reportes. Verifica que la API estÃ© corriendo.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        init();
        loadPacientes(monthAgo, today);
        loadDoctores(monthAgo, today);
        loadCitas(monthAgo, today);
    }, []);

    // â”€â”€ PDF Exports â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    const exportPacientesPDF = () => {
        const doc = new jsPDF();
        pdfHeader(doc, 'Reporte de Pacientes Atendidos');
        doc.setFontSize(10);
        doc.text(`Período: ${pDesde}  al  ${pHasta}`, 15, 42);
        autoTable(doc, {
            startY: 48,
            head: [['#', 'Paciente', 'Teléfono', 'Dirección', 'Citas en período']],
            body: pacientesData.map((p, i) => [i + 1, p.paciente, p.telefono || '-', p.direccion || '-', p.total_citas]),
            theme: 'striped',
            headStyles: { fillColor: [14, 165, 233] },
        });
        doc.save(`pacientes_atendidos_${pDesde}_${pHasta}.pdf`);
    };

    const exportMedicamentosPDF = () => {
        const doc = new jsPDF();
        pdfHeader(doc, 'Reporte de Medicamentos');
        autoTable(doc, {
            startY: 42,
            head: [['#', 'Medicamento', 'Descripción', 'Veces Recetado']],
            body: medicamentosData.map((m, i) => [i + 1, m.nombre, m.descripcion?.slice(0, 50) || '-', m.veces_recetado]),
            theme: 'striped',
            headStyles: { fillColor: [34, 197, 94] },
        });
        doc.save(`reporte_medicamentos_${today}.pdf`);
    };

    const exportDoctoresPDF = () => {
        const doc = new jsPDF();
        pdfHeader(doc, 'Actividad de Médicos');
        doc.setFontSize(10);
        doc.text(`Período: ${dDesde}  al  ${dHasta}`, 15, 42);
        autoTable(doc, {
            startY: 48,
            head: [['#', 'Médico', 'Teléfono', 'Citas', 'Consultas']],
            body: doctoresData.map((d, i) => [i + 1, d.medico, d.telefono || '-', d.total_citas, d.total_consultas]),
            theme: 'striped',
            headStyles: { fillColor: [139, 92, 246] },
        });
        doc.save(`reporte_medicos_${dDesde}_${dHasta}.pdf`);
    };

    const exportCitasPDF = () => {
        const doc = new jsPDF();
        pdfHeader(doc, 'Reporte de Citas');
        doc.setFontSize(10);
        doc.text(`Período: ${cDesde}  al  ${cHasta}`, 15, 42);
        autoTable(doc, {
            startY: 48,
            head: [['#', 'Fecha', 'Hora', 'Paciente', 'Médico', 'Estado']],
            body: citasData.map((c, i) => [
                i + 1,
                c.fecha ? new Date(c.fecha).toLocaleDateString() : '-',
                c.hora || '-',
                c.paciente,
                c.medico,
                c.estado || '-',
            ]),
            theme: 'striped',
            headStyles: { fillColor: [245, 158, 11] },
            styles: { fontSize: 8 },
        });
        doc.save(`reporte_citas_${cDesde}_${cHasta}.pdf`);
    };

    // â”€â”€ Render â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    if (loading) return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
            <Loader2 size={40} style={{ color: 'var(--primary)', animation: 'spin 1s linear infinite' }} />
        </div>
    );
    if (error) return (
        <div style={{ padding: '2rem', color: '#ef4444', background: '#fef2f2', borderRadius: '12px' }}>{error}</div>
    );

    const statCards = resumen ? [
        { label: 'Pacientes',  value: resumen.total_pacientes,  icon: <Users size={22} />,         color: '#0ea5e9' },
        { label: 'Médicos',    value: resumen.total_medicos,     icon: <UserRound size={22} />,     color: '#8b5cf6' },
        { label: 'Citas',      value: resumen.total_citas,       icon: <Calendar size={22} />,      color: '#f59e0b' },
        { label: 'Consultas',  value: resumen.total_consultas,   icon: <ClipboardList size={22} />, color: '#22c55e' },
    ] : [];

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', animation: 'fadeIn 0.5s ease' }}>

            {/* Page header */}
            <div>
                <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>Reportes</h1>
                <p style={{ color: 'var(--text-muted)', margin: '4px 0 0' }}>EstadÃ­sticas y reportes detallados de la clÃ­nica</p>
            </div>

            {/* Stat cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '1.25rem' }}>
                {statCards.map((s, i) => (
                    <div key={i} className="glass" style={{ borderRadius: '14px', padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ width: 46, height: 46, borderRadius: '12px', background: `${s.color}18`, color: s.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{s.icon}</div>
                        <div>
                            <div style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--text-main)', lineHeight: 1 }}>{s.value}</div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 4 }}>{s.label}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Highlights */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
                {/* Paciente mÃ¡s frecuente */}
                <div className="glass" style={{ borderRadius: '14px', padding: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
                        <Trophy size={18} style={{ color: '#f59e0b' }} />
                        <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: 600, color: 'var(--text-main)' }}>Paciente MÃ¡s Frecuente</h2>
                    </div>
                    {pacienteFrecuente.length === 0
                        ? <p style={{ color: 'var(--text-muted)' }}>Sin datos</p>
                        : pacienteFrecuente.map((p, i) => (
                            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.55rem 0', borderBottom: i < pacienteFrecuente.length - 1 ? '1px solid #f1f5f9' : 'none' }}>
                                <div style={{ width: 28, height: 28, borderRadius: '50%', background: i === 0 ? '#f59e0b18' : '#f1f5f9', color: i === 0 ? '#f59e0b' : '#94a3b8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.8rem', flexShrink: 0 }}>{i + 1}</div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-main)' }}>{p.paciente}</div>
                                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{p.telefono || '-'}</div>
                                </div>
                                <div style={{ fontWeight: 700, color: '#f59e0b', fontSize: '0.875rem', whiteSpace: 'nowrap' }}>{p.total_visitas} visitas</div>
                            </div>
                        ))
                    }
                </div>

                {/* Doctor con mÃ¡s trabajo */}
                <div className="glass" style={{ borderRadius: '14px', padding: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
                        <Award size={18} style={{ color: '#8b5cf6' }} />
                        <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: 600, color: 'var(--text-main)' }}>Doctor con MÃ¡s Trabajo</h2>
                    </div>
                    {doctorTrabajo.length === 0
                        ? <p style={{ color: 'var(--text-muted)' }}>Sin datos</p>
                        : doctorTrabajo.map((d, i) => (
                            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.55rem 0', borderBottom: i < doctorTrabajo.length - 1 ? '1px solid #f1f5f9' : 'none' }}>
                                <div style={{ width: 28, height: 28, borderRadius: '50%', background: i === 0 ? '#8b5cf618' : '#f1f5f9', color: i === 0 ? '#8b5cf6' : '#94a3b8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.8rem', flexShrink: 0 }}>{i + 1}</div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-main)' }}>{d.medico}</div>
                                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{d.total_consultas} consultas</div>
                                </div>
                                <div style={{ fontWeight: 700, color: '#8b5cf6', fontSize: '0.875rem', whiteSpace: 'nowrap' }}>{d.total_citas} citas</div>
                            </div>
                        ))
                    }
                </div>
            </div>

            {/* â”€â”€ Pacientes Atendidos â”€â”€ */}
            <div className="glass" style={{ borderRadius: '14px', padding: '1.5rem' }}>
                <SectionHeader icon={<Users />} title="Pacientes Atendidos" color="#0ea5e9" onExport={exportPacientesPDF} />
                <DateFilter desde={pDesde} hasta={pHasta} onDesde={setPDesde} onHasta={setPHasta} loading={loadingPacientes} onBuscar={() => loadPacientes(pDesde, pHasta)} />
                {loadingPacientes
                    ? <div style={{ textAlign: 'center', padding: '1.5rem' }}><Loader2 size={24} style={{ color: 'var(--primary)', animation: 'spin 1s linear infinite' }} /></div>
                    : <SimpleTable
                        headers={['#', 'Paciente', 'Teléfono', 'Dirección', 'Citas en período']}
                        emptyMsg="No hay pacientes atendidos en este período."
                        rows={pacientesData.map((p, i) => (
                            <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                <td style={{ padding: '0.6rem 0.75rem', color: 'var(--text-muted)', width: 32 }}>{i + 1}</td>
                                <td style={{ padding: '0.6rem 0.75rem', fontWeight: 600, color: 'var(--text-main)' }}>{p.paciente}</td>
                                <td style={{ padding: '0.6rem 0.75rem', color: 'var(--text-muted)' }}>{p.telefono || '-'}</td>
                                <td style={{ padding: '0.6rem 0.75rem', color: 'var(--text-muted)' }}>{p.direccion || '-'}</td>
                                <td style={{ padding: '0.6rem 0.75rem' }}>
                                    <span style={{ background: '#0ea5e918', color: '#0ea5e9', padding: '2px 10px', borderRadius: 20, fontWeight: 700, fontSize: '0.8rem' }}>{p.total_citas}</span>
                                </td>
                            </tr>
                        ))}
                    />
                }
            </div>

            {/* â”€â”€ Medicamentos â”€â”€ */}
            <div className="glass" style={{ borderRadius: '14px', padding: '1.5rem' }}>
                <SectionHeader icon={<Pill />} title="Reporte de Medicamentos" color="#22c55e" onExport={exportMedicamentosPDF} />
                <SimpleTable
                    headers={['#', 'Medicamento', 'Descripción', 'Veces Recetado']}
                    emptyMsg="No hay medicamentos registrados."
                    rows={medicamentosData.map((m, i) => (
                        <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                            <td style={{ padding: '0.6rem 0.75rem', color: 'var(--text-muted)', width: 32 }}>{i + 1}</td>
                            <td style={{ padding: '0.6rem 0.75rem', fontWeight: 600, color: 'var(--text-main)' }}>{m.nombre}</td>
                            <td style={{ padding: '0.6rem 0.75rem', color: 'var(--text-muted)', maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.descripcion || '-'}</td>
                            <td style={{ padding: '0.6rem 0.75rem' }}>
                                <span style={{ background: '#22c55e18', color: '#22c55e', padding: '2px 10px', borderRadius: 20, fontWeight: 700, fontSize: '0.8rem' }}>{m.veces_recetado}</span>
                            </td>
                        </tr>
                    ))}
                />
            </div>

            {/* â”€â”€ Actividad de Médicos â”€â”€ */}
            <div className="glass" style={{ borderRadius: '14px', padding: '1.5rem' }}>
                <SectionHeader icon={<TrendingUp />} title="Actividad de Médicos" color="#8b5cf6" onExport={exportDoctoresPDF} />
                <DateFilter desde={dDesde} hasta={dHasta} onDesde={setDDesde} onHasta={setDHasta} loading={loadingDoctores} onBuscar={() => loadDoctores(dDesde, dHasta)} />
                {loadingDoctores
                    ? <div style={{ textAlign: 'center', padding: '1.5rem' }}><Loader2 size={24} style={{ color: '#8b5cf6', animation: 'spin 1s linear infinite' }} /></div>
                    : <SimpleTable
                        headers={['#', 'Médico', 'Teléfono', 'Citas', 'Consultas']}
                        rows={doctoresData.map((d, i) => (
                            <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                <td style={{ padding: '0.6rem 0.75rem', color: 'var(--text-muted)', width: 32 }}>{i + 1}</td>
                                <td style={{ padding: '0.6rem 0.75rem', fontWeight: 600, color: 'var(--text-main)' }}>{d.medico}</td>
                                <td style={{ padding: '0.6rem 0.75rem', color: 'var(--text-muted)' }}>{d.telefono || '-'}</td>
                                <td style={{ padding: '0.6rem 0.75rem' }}>
                                    <span style={{ background: '#8b5cf618', color: '#8b5cf6', padding: '2px 10px', borderRadius: 20, fontWeight: 700, fontSize: '0.8rem' }}>{d.total_citas}</span>
                                </td>
                                <td style={{ padding: '0.6rem 0.75rem' }}>
                                    <span style={{ background: '#22c55e18', color: '#22c55e', padding: '2px 10px', borderRadius: 20, fontWeight: 700, fontSize: '0.8rem' }}>{d.total_consultas}</span>
                                </td>
                            </tr>
                        ))}
                    />
                }
            </div>

            {/* â”€â”€ Citas â”€â”€ */}
            <div className="glass" style={{ borderRadius: '14px', padding: '1.5rem' }}>
                <SectionHeader icon={<Calendar />} title="Reporte de Citas" color="#f59e0b" onExport={exportCitasPDF} />
                <DateFilter desde={cDesde} hasta={cHasta} onDesde={setCDesde} onHasta={setCHasta} loading={loadingCitas} onBuscar={() => loadCitas(cDesde, cHasta)} />
                {loadingCitas
                    ? <div style={{ textAlign: 'center', padding: '1.5rem' }}><Loader2 size={24} style={{ color: '#f59e0b', animation: 'spin 1s linear infinite' }} /></div>
                    : <SimpleTable
                        headers={['#', 'Fecha', 'Hora', 'Paciente', 'Médico', 'Estado']}
                        emptyMsg="No hay citas en este período."
                        rows={citasData.map((c, i) => (
                            <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                <td style={{ padding: '0.6rem 0.75rem', color: 'var(--text-muted)', width: 32 }}>{i + 1}</td>
                                <td style={{ padding: '0.6rem 0.75rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{c.fecha ? new Date(c.fecha).toLocaleDateString() : '-'}</td>
                                <td style={{ padding: '0.6rem 0.75rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{c.hora || '-'}</td>
                                <td style={{ padding: '0.6rem 0.75rem', fontWeight: 600, color: 'var(--text-main)' }}>{c.paciente}</td>
                                <td style={{ padding: '0.6rem 0.75rem', color: 'var(--text-muted)' }}>{c.medico}</td>
                                <td style={{ padding: '0.6rem 0.75rem' }}>
                                    <span style={{ background: `${ESTADO_COLORS[c.estado] || '#94a3b8'}18`, color: ESTADO_COLORS[c.estado] || '#94a3b8', padding: '2px 10px', borderRadius: 20, fontWeight: 600, fontSize: '0.78rem' }}>
                                        {c.estado || '-'}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    />
                }
            </div>
        </div>
    );
};

export default Reports;
