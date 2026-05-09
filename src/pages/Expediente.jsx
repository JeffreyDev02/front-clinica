import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    User, Calendar, ClipboardList, Pill, BookOpen,
    ArrowLeft, Plus, Loader2, FileDown, ChevronDown, ChevronUp
} from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { getExpediente, agregarHistorial } from '../services/expedienteService';

// ── Helpers ──────────────────────────────────────────────────
const fmtDate = (d) => d ? new Date(d).toLocaleDateString('es-GT', { year: 'numeric', month: 'long', day: 'numeric' }) : '—';
const fmtShort = (d) => d ? new Date(d).toLocaleDateString() : '—';

const ESTADO_STYLE = {
    Completada: { bg: '#dcfce7', color: '#16a34a' },
    Normal:     { bg: '#e0f2fe', color: '#0369a1' },
    Urgente:    { bg: '#fee2e2', color: '#dc2626' },
    Cancelada:  { bg: '#f1f5f9', color: '#64748b' },
};

const Badge = ({ estado }) => {
    const s = ESTADO_STYLE[estado] || ESTADO_STYLE['Normal'];
    return (
        <span style={{
            background: s.bg, color: s.color,
            borderRadius: 50, padding: '2px 10px',
            fontSize: '0.75rem', fontWeight: 700,
        }}>{estado}</span>
    );
};

const Section = ({ icon, title, color, children, count }) => {
    const [open, setOpen] = useState(true);
    return (
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 14, overflow: 'hidden', marginBottom: '1.5rem' }}>
            <button onClick={() => setOpen(v => !v)}
                style={{
                    width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '1rem 1.25rem', background: 'none', border: 'none', cursor: 'pointer',
                    borderBottom: open ? '1px solid #e2e8f0' : 'none',
                }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    {React.cloneElement(icon, { size: 18, style: { color } })}
                    <span style={{ fontWeight: 700, fontSize: '0.95rem', color: '#0f172a' }}>{title}</span>
                    {count !== undefined && (
                        <span style={{ background: `${color}20`, color, borderRadius: 50, padding: '1px 8px', fontSize: '0.75rem', fontWeight: 700 }}>
                            {count}
                        </span>
                    )}
                </div>
                {open ? <ChevronUp size={16} style={{ color: '#94a3b8' }} /> : <ChevronDown size={16} style={{ color: '#94a3b8' }} />}
            </button>
            {open && <div style={{ padding: '1rem 1.25rem' }}>{children}</div>}
        </div>
    );
};

// ── Component ─────────────────────────────────────────────────
const Expediente = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [data, setData]       = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError]     = useState(null);
    const [nota, setNota]       = useState('');
    const [saving, setSaving]   = useState(false);

    const load = () => {
        setLoading(true);
        getExpediente(id)
            .then(d => { setData(d); setLoading(false); })
            .catch(() => { setError('No se pudo cargar el expediente.'); setLoading(false); });
    };

    useEffect(() => { load(); }, [id]);

    const handleAgregarNota = async (e) => {
        e.preventDefault();
        if (!nota.trim()) return;
        setSaving(true);
        try {
            await agregarHistorial(id, nota);
            setNota('');
            load();
        } catch {
            alert('Error al guardar la nota');
        } finally {
            setSaving(false);
        }
    };

    const exportPDF = () => {
        if (!data) return;
        const { paciente, historial, citas, consultas, medicamentos } = data;
        const doc = new jsPDF();

        // Header
        doc.setFillColor(14, 165, 233);
        doc.rect(0, 0, 210, 38, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(18); doc.setFont('helvetica', 'bold');
        doc.text('MediConnect - Expediente Medico', 15, 20);
        doc.setFontSize(10); doc.setFont('helvetica', 'normal');
        doc.text(`${paciente.nombre} ${paciente.apellido}  |  Generado: ${new Date().toLocaleString()}`, 15, 31);
        doc.setTextColor(30, 41, 59);

        let y = 46;

        // Datos del paciente
        doc.setFontSize(12); doc.setFont('helvetica', 'bold');
        doc.text('Datos del Paciente', 15, y); y += 7;
        doc.setFontSize(9); doc.setFont('helvetica', 'normal');
        doc.text(`Nombre: ${paciente.nombre} ${paciente.apellido}`, 15, y); y += 5;
        doc.text(`Fecha de nacimiento: ${fmtShort(paciente.fecha_nacimiento)}`, 15, y); y += 5;
        doc.text(`Telefono: ${paciente.telefono || '-'}    Direccion: ${paciente.direccion || '-'}`, 15, y); y += 10;

        // Historial
        if (historial.length > 0) {
            doc.setFontSize(12); doc.setFont('helvetica', 'bold');
            doc.text('Historial Medico', 15, y); y += 3;
            autoTable(doc, {
                startY: y,
                head: [['Fecha', 'Descripcion']],
                body: historial.map(h => [fmtShort(h.fecha), h.descripcion]),
                theme: 'striped',
                headStyles: { fillColor: [14, 165, 233] },
                styles: { fontSize: 8 },
                columnStyles: { 0: { cellWidth: 30 } },
            });
            y = doc.lastAutoTable.finalY + 8;
        }

        // Consultas
        if (consultas.length > 0) {
            if (y > 230) { doc.addPage(); y = 20; }
            doc.setFontSize(12); doc.setFont('helvetica', 'bold');
            doc.text('Consultas', 15, y); y += 3;
            autoTable(doc, {
                startY: y,
                head: [['Fecha', 'Medico', 'Diagnostico', 'Tratamiento']],
                body: consultas.map(c => [fmtShort(c.fecha), c.medico, c.diagnostico, c.tratamiento]),
                theme: 'striped',
                headStyles: { fillColor: [139, 92, 246] },
                styles: { fontSize: 7 },
                columnStyles: { 0: { cellWidth: 22 }, 1: { cellWidth: 35 } },
            });
            y = doc.lastAutoTable.finalY + 8;
        }

        // Medicamentos
        if (medicamentos.length > 0) {
            if (y > 230) { doc.addPage(); y = 20; }
            doc.setFontSize(12); doc.setFont('helvetica', 'bold');
            doc.text('Medicamentos Recetados', 15, y); y += 3;
            autoTable(doc, {
                startY: y,
                head: [['Fecha', 'Medicamento', 'Dosis', 'Medico']],
                body: medicamentos.map(m => [fmtShort(m.fecha_receta), m.medicamento, m.dosis, m.medico]),
                theme: 'striped',
                headStyles: { fillColor: [34, 197, 94] },
                styles: { fontSize: 7 },
            });
        }

        doc.save(`Expediente_${paciente.apellido}_${paciente.nombre}.pdf`);
    };

    if (loading) return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh', flexDirection: 'column', gap: '1rem' }}>
            <Loader2 size={40} style={{ animation: 'spin 1s linear infinite', color: '#0ea5e9' }} />
            <p style={{ color: '#64748b' }}>Cargando expediente...</p>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );

    if (error) return (
        <div style={{ padding: '2rem', color: '#ef4444' }}>
            <p>{error}</p>
            <button onClick={() => navigate('/pacientes')} style={{ marginTop: '1rem', padding: '0.5rem 1rem', background: '#0ea5e9', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer' }}>
                Volver a Pacientes
            </button>
        </div>
    );

    const { paciente, historial, citas, consultas, medicamentos } = data;
    const edad = paciente.fecha_nacimiento
        ? Math.floor((Date.now() - new Date(paciente.fecha_nacimiento)) / (365.25 * 24 * 60 * 60 * 1000))
        : null;

    return (
        <div style={{ maxWidth: 960, margin: '0 auto' }}>
            {/* Toolbar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.75rem' }}>
                <button onClick={() => navigate('/pacientes')}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'none', border: '1px solid #e2e8f0', borderRadius: 8, padding: '0.5rem 1rem', cursor: 'pointer', color: '#64748b', fontWeight: 600, fontSize: '0.875rem' }}>
                    <ArrowLeft size={16} /> Volver
                </button>
                <button onClick={exportPDF}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: '#0ea5e9', color: '#fff', border: 'none', borderRadius: 8, padding: '0.5rem 1rem', cursor: 'pointer', fontWeight: 600, fontSize: '0.875rem' }}>
                    <FileDown size={16} /> Exportar PDF
                </button>
            </div>

            {/* Patient card */}
            <div style={{ background: 'linear-gradient(135deg, #0ea5e9, #38bdf8)', borderRadius: 16, padding: '1.75rem', color: '#fff', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
                <div style={{ background: 'rgba(255,255,255,0.2)', borderRadius: '50%', width: 70, height: 70, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <User size={36} color="#fff" />
                </div>
                <div style={{ flex: 1 }}>
                    <h1 style={{ margin: '0 0 0.25rem', fontSize: '1.5rem', fontWeight: 800 }}>
                        {paciente.nombre} {paciente.apellido}
                    </h1>
                    <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', fontSize: '0.875rem', opacity: 0.9 }}>
                        <span>ID: #{paciente.id_paciente}</span>
                        {edad !== null && <span>Edad: {edad} años</span>}
                        <span>Nacimiento: {fmtDate(paciente.fecha_nacimiento)}</span>
                    </div>
                    <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', fontSize: '0.875rem', opacity: 0.85, marginTop: '0.3rem' }}>
                        {paciente.telefono && <span>Tel: {paciente.telefono}</span>}
                        {paciente.direccion && <span>Dir: {paciente.direccion}</span>}
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                    {[
                        { label: 'Citas', value: citas.length },
                        { label: 'Consultas', value: consultas.length },
                        { label: 'Medicamentos', value: medicamentos.length },
                    ].map(s => (
                        <div key={s.label} style={{ background: 'rgba(255,255,255,0.2)', borderRadius: 10, padding: '0.6rem 1rem', textAlign: 'center' }}>
                            <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>{s.value}</div>
                            <div style={{ fontSize: '0.75rem', opacity: 0.85 }}>{s.label}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* ── Historial médico ── */}
            <Section icon={<BookOpen />} title="Historial Médico" color="#0ea5e9" count={historial.length}>
                {/* Agregar nota */}
                <form onSubmit={handleAgregarNota} style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                    <textarea
                        value={nota}
                        onChange={e => setNota(e.target.value)}
                        placeholder="Agregar nueva nota al historial..."
                        rows={2}
                        style={{ flex: 1, minWidth: 200, border: '1.5px solid #e2e8f0', borderRadius: 8, padding: '0.6rem 0.8rem', fontSize: '0.875rem', resize: 'vertical', outline: 'none', fontFamily: 'inherit' }}
                    />
                    <button type="submit" disabled={saving || !nota.trim()}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: '#0ea5e9', color: '#fff', border: 'none', borderRadius: 8, padding: '0 1rem', fontWeight: 600, cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1, fontSize: '0.875rem', alignSelf: 'flex-start', height: 36 }}>
                        {saving ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <Plus size={14} />}
                        Agregar
                    </button>
                </form>

                {historial.length === 0
                    ? <p style={{ color: '#94a3b8', fontSize: '0.875rem' }}>Sin registros en el historial.</p>
                    : <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {historial.map((h, i) => (
                            <div key={i} style={{ display: 'flex', gap: '1rem', padding: '0.75rem', background: '#f8fafc', borderRadius: 8, borderLeft: '3px solid #0ea5e9' }}>
                                <div style={{ fontSize: '0.78rem', color: '#64748b', whiteSpace: 'nowrap', minWidth: 85 }}>{fmtShort(h.fecha)}</div>
                                <div style={{ fontSize: '0.875rem', color: '#334155' }}>{h.descripcion}</div>
                            </div>
                        ))}
                    </div>
                }
            </Section>

            {/* ── Consultas ── */}
            <Section icon={<ClipboardList />} title="Consultas" color="#8b5cf6" count={consultas.length}>
                {consultas.length === 0
                    ? <p style={{ color: '#94a3b8', fontSize: '0.875rem' }}>Sin consultas registradas.</p>
                    : <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {consultas.map((c, i) => (
                            <div key={i} style={{ border: '1px solid #e2e8f0', borderRadius: 10, padding: '1rem', background: '#fafafa' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                                    <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
                                        <span style={{ fontWeight: 700, fontSize: '0.875rem', color: '#0f172a' }}>{fmtShort(c.fecha)}</span>
                                        <span style={{ fontSize: '0.8rem', color: '#64748b' }}>{c.medico}</span>
                                        {c.especialidad && <span style={{ fontSize: '0.75rem', color: '#8b5cf6', background: '#f3f4ff', borderRadius: 50, padding: '1px 8px' }}>{c.especialidad}</span>}
                                    </div>
                                    <Badge estado={c.estado} />
                                </div>
                                <div style={{ fontSize: '0.875rem' }}>
                                    <span style={{ color: '#64748b', fontWeight: 600 }}>Diagnóstico: </span>
                                    <span style={{ color: '#334155' }}>{c.diagnostico}</span>
                                </div>
                                <div style={{ fontSize: '0.875rem', marginTop: '0.25rem' }}>
                                    <span style={{ color: '#64748b', fontWeight: 600 }}>Tratamiento: </span>
                                    <span style={{ color: '#334155' }}>{c.tratamiento}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                }
            </Section>

            {/* ── Medicamentos ── */}
            <Section icon={<Pill />} title="Medicamentos Recetados" color="#22c55e" count={medicamentos.length}>
                {medicamentos.length === 0
                    ? <p style={{ color: '#94a3b8', fontSize: '0.875rem' }}>Sin medicamentos recetados.</p>
                    : <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                            <thead>
                                <tr style={{ borderBottom: '2px solid #e2e8f0' }}>
                                    {['Fecha', 'Medicamento', 'Dosis', 'Diagnóstico', 'Médico'].map(h => (
                                        <th key={h} style={{ padding: '0.6rem 0.75rem', textAlign: 'left', color: '#64748b', fontWeight: 600, whiteSpace: 'nowrap' }}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {medicamentos.map((m, i) => (
                                    <tr key={i} style={{ borderBottom: '1px solid #f1f5f9', background: i % 2 === 0 ? '#fff' : '#f8fafc' }}>
                                        <td style={{ padding: '0.6rem 0.75rem', color: '#64748b', whiteSpace: 'nowrap' }}>{fmtShort(m.fecha_receta)}</td>
                                        <td style={{ padding: '0.6rem 0.75rem', fontWeight: 600, color: '#0f172a' }}>{m.medicamento}</td>
                                        <td style={{ padding: '0.6rem 0.75rem', color: '#334155' }}>{m.dosis}</td>
                                        <td style={{ padding: '0.6rem 0.75rem', color: '#64748b', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.diagnostico}</td>
                                        <td style={{ padding: '0.6rem 0.75rem', color: '#64748b' }}>{m.medico}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                }
            </Section>

            {/* ── Citas ── */}
            <Section icon={<Calendar />} title="Historial de Citas" color="#f59e0b" count={citas.length}>
                {citas.length === 0
                    ? <p style={{ color: '#94a3b8', fontSize: '0.875rem' }}>Sin citas registradas.</p>
                    : <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                            <thead>
                                <tr style={{ borderBottom: '2px solid #e2e8f0' }}>
                                    {['Fecha', 'Hora', 'Médico', 'Especialidad', 'Estado'].map(h => (
                                        <th key={h} style={{ padding: '0.6rem 0.75rem', textAlign: 'left', color: '#64748b', fontWeight: 600, whiteSpace: 'nowrap' }}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {citas.map((c, i) => (
                                    <tr key={i} style={{ borderBottom: '1px solid #f1f5f9', background: i % 2 === 0 ? '#fff' : '#f8fafc' }}>
                                        <td style={{ padding: '0.6rem 0.75rem', whiteSpace: 'nowrap' }}>{fmtShort(c.fecha)}</td>
                                        <td style={{ padding: '0.6rem 0.75rem', color: '#64748b' }}>{c.hora ? c.hora.slice(0,5) : '—'}</td>
                                        <td style={{ padding: '0.6rem 0.75rem', fontWeight: 600, color: '#0f172a' }}>{c.medico}</td>
                                        <td style={{ padding: '0.6rem 0.75rem', color: '#64748b' }}>{c.especialidad || '—'}</td>
                                        <td style={{ padding: '0.6rem 0.75rem' }}><Badge estado={c.estado} /></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                }
            </Section>

            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );
};

export default Expediente;
