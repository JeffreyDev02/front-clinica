import React, { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Trash2, Printer, Save, Loader2, FileCheck } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { createFactura } from '../services/facturaService';
import { getPatients } from '../services/patientService';
import { getAppointments } from '../services/appointmentService';
import { getConsultas } from '../services/consultaService';

const CreateFactura = () => {
    const navigate = useNavigate();
    const [pacientes, setPacientes] = useState([]);
    const [consultas, setConsultas] = useState([]);
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    
    // Formulario Factura
    const [idPaciente, setIdPaciente] = useState('');
    const [idConsulta, setIdConsulta] = useState('');
    const [nombrePaciente, setNombrePaciente] = useState('');
    const [metodoPago, setMetodoPago] = useState('Transferencia');
    const [estado, setEstado] = useState('Pagada');
    
    const [items, setItems] = useState([
        { id: Date.now(), descripcion: '', cantidad: 1, precio_unitario: 0 }
    ]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [patientsData, appointmentsData, consultasData] = await Promise.all([
                    getPatients(),
                    getAppointments(),
                    getConsultas()
                ]);
                setPacientes(patientsData);
                setAppointments(appointmentsData);
                setConsultas(consultasData);
            } catch (error) {
                console.error('Error fetching billing data:', error);
                setPacientes([{ id: 1, nombre: 'Alberto Gómez' }, { id: 2, nombre: 'María Silva' }]);
                setAppointments([]);
                setConsultas([]);
            }
        };
        fetchData();
    }, []);

    const getPatientNameByAppointment = (idCita) => {
        const apt = appointments.find(a => a.id_cita?.toString() === idCita?.toString());
        if (!apt) return 'Paciente desconocido';
        const patient = pacientes.find(p => (p.id_paciente?.toString() || p.id?.toString()) === apt.id_paciente?.toString());
        return patient ? `${patient.nombre} ${patient.apellido || ''}`.trim() : 'Paciente desconocido';
    };

    const filteredConsultas = consultas.filter((consulta) => {
        if (!idPaciente) return true;
        const apt = appointments.find(a => a.id_cita?.toString() === consulta.id_cita?.toString());
        return apt && (apt.id_paciente?.toString() === idPaciente?.toString() || apt.id_paciente?.toString() === (pacientes.find(p => (p.id_paciente?.toString() || p.id?.toString()) === idPaciente)?.id_paciente?.toString()));
    });

    // Handlers
    const handleAddRow = () => setItems([...items, { id: Date.now(), descripcion: '', cantidad: 1, precio_unitario: 0 }]);
    const handleRemoveRow = (id) => setItems(items.filter(item => item.id !== id));
    
    const handleItemChange = (id, field, value) => {
        setItems(items.map(item => item.id === id ? { ...item, [field]: value } : item));
    };

    const handlePacienteChange = (e) => {
        const val = e.target.value;
        setIdPaciente(val);
        setIdConsulta('');
        const p = pacientes.find(x => (x.id_paciente?.toString() || x.id?.toString()) === val);
        if (p) setNombrePaciente(p.nombre);
        else setNombrePaciente('');
    };

    const handleConsultaChange = (e) => {
        const value = e.target.value;
        setIdConsulta(value);

        if (value) {
            const consulta = consultas.find(c => c.id_consulta?.toString() === value?.toString());
            if (consulta) {
                const apt = appointments.find(a => a.id_cita?.toString() === consulta.id_cita?.toString());
                if (apt) {
                    const paciente = pacientes.find(p => (p.id_paciente?.toString() || p.id?.toString()) === apt.id_paciente?.toString());
                    if (paciente) {
                        const pacienteId = paciente.id_paciente || paciente.id;
                        setIdPaciente(pacienteId?.toString());
                        setNombrePaciente(paciente.nombre);
                    }
                }
            }
        }
    };

    // Calculations
    const subtotal = items.reduce((acc, item) => acc + (parseFloat(item.precio_unitario || 0) * (item.cantidad || 1)), 0);
    const impuestos = subtotal * 0.16; // 16% IVA por ejemplo
    const total = subtotal + impuestos;

    const handleSave = async () => {
        if (!idPaciente) return alert('Selecciona un paciente.');
        if (!idConsulta) return alert('Selecciona la consulta asociada.');
        if (items.some(i => !i.descripcion)) return alert('Llena las descripciones de los conceptos.');
        
        setSaving(true);
        try {
            await createFactura({
                id_paciente: idPaciente,
                id_consulta: idConsulta,
                subtotal, impuestos, total,
                metodo_pago: metodoPago,
                estado,
                detalles: items.map(i => ({ descripcion: i.descripcion, cantidad: i.cantidad, precio_unitario: parseFloat(i.precio_unitario) }))
            });
            alert('Factura creada exitosamente en el sistema.');
            navigate('/facturacion');
        } catch (err) {
            console.error(err);
            alert('Error al crear la factura. Verifica la consulta y vuelve a intentarlo.');
        } finally {
            setSaving(false);
        }
    };

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="page-container fade-in">
            <div className="page-header no-print">
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <Link to="/facturacion" className="btn-icon" style={{ padding: '0.5rem', background: 'var(--surface)', borderRadius: '50%', color: 'var(--text-muted)' }}>
                        <ArrowLeft size={20} />
                    </Link>
                    <div>
                        <h1 className="page-title">Emitir Factura</h1>
                        <p className="page-subtitle">Genera un nuevo comprobante de pago o recibo de honorarios</p>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button onClick={handlePrint} className="btn" style={{ background: '#f1f5f9', color: '#334155', border: '1px solid #cbd5e1' }}>
                        <Printer size={18} /> Imprimir PDF
                    </button>
                    <button onClick={handleSave} disabled={saving} className="btn btn-primary">
                        {saving ? <Loader2 size={18} className="spin" /> : <Save size={18} />}
                        Guardar Registro
                    </button>
                </div>
            </div>

            <div className="billing-layout">
                {/* Lado izquierdo: Formulario de Control (No imprimible) */}
                <div className="billing-form glass no-print">
                    <h3 style={{ marginBottom: '1.5rem', fontSize: '1.1rem', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <FileCheck size={20}/> Datos de Emisión
                    </h3>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                        <div>
                            <label className="form-label">Paciente</label>
                            <select value={idPaciente} onChange={handlePacienteChange} className="form-input">
                                <option value="">-- Seleccionar Paciente --</option>
                                {pacientes.map(p => {
                                    const pacienteId = p.id_paciente || p.id;
                                    return (
                                        <option key={pacienteId} value={pacienteId}>{p.nombre} {p.apellido || ''}</option>
                                    );
                                })}
                            </select>
                        </div>
                        <div>
                            <label className="form-label">Consulta</label>
                            <select value={idConsulta} onChange={handleConsultaChange} className="form-input">
                                <option value="">-- Seleccionar Consulta --</option>
                                {filteredConsultas.length > 0 ? (
                                    filteredConsultas.map(c => (
                                        <option key={c.id_consulta} value={c.id_consulta}>
                                            Consulta #{c.id_consulta} - {getPatientNameByAppointment(c.id_cita)}
                                        </option>
                                    ))
                                ) : (
                                    <option value="" disabled>No hay consultas disponibles para este paciente</option>
                                )}
                            </select>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div>
                                <label className="form-label">Método de Pago</label>
                                <select value={metodoPago} onChange={e => setMetodoPago(e.target.value)} className="form-input">
                                    <option value="Efectivo">Efectivo</option>
                                    <option value="Tarjeta">Tarjeta (TDD/TDC)</option>
                                    <option value="Transferencia">Transferencia</option>
                                </select>
                            </div>
                            <div>
                                <label className="form-label">Estado</label>
                                <select value={estado} onChange={e => setEstado(e.target.value)} className="form-input">
                                    <option value="Pagada">Pagada</option>
                                    <option value="Pendiente">Pendiente</option>
                                </select>
                            </div>
                        </div>

                        <div style={{ marginTop: '1rem', borderTop: '1px solid var(--border)', paddingTop: '1.5rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                <label className="form-label" style={{ margin: 0 }}>Conceptos a Facturar</label>
                                <button onClick={handleAddRow} className="btn" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', background: '#e0f2fe', color: '#0369a1', border: 'none' }}>
                                    <Plus size={14}/> Añadir fila
                                </button>
                            </div>

                            {items.map((item, index) => (
                                <div key={item.id} style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start', marginBottom: '0.75rem', background: 'var(--surface)', padding: '0.75rem', borderRadius: 'var(--radius)' }}>
                                    <div style={{ flex: 2 }}>
                                        <input type="text" placeholder="Ej. Consulta General" className="form-input" value={item.descripcion} onChange={e => handleItemChange(item.id, 'descripcion', e.target.value)} style={{ padding: '0.4rem', fontSize: '0.85rem' }}/>
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <input type="number" placeholder="Cant" min="1" className="form-input" value={item.cantidad} onChange={e => handleItemChange(item.id, 'cantidad', e.target.value)} style={{ padding: '0.4rem', fontSize: '0.85rem' }}/>
                                    </div>
                                    <div style={{ flex: 1.5 }}>
                                        <input type="number" placeholder="Precio $" min="0" step="0.01" className="form-input" value={item.precio_unitario} onChange={e => handleItemChange(item.id, 'precio_unitario', e.target.value)} style={{ padding: '0.4rem', fontSize: '0.85rem' }}/>
                                    </div>
                                    <button onClick={() => handleRemoveRow(item.id)} disabled={items.length === 1} style={{ background: 'none', border: 'none', color: items.length === 1 ? '#cbd5e1' : '#ef4444', cursor: items.length === 1 ? 'not-allowed' : 'pointer', padding: '0.4rem' }}>
                                        <Trash2 size={16}/>
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Lado derecho: Visualización del Recibo (IMPRIMIBLE) */}
                <div className="billing-preview-wrapper print-area">
                    <div className="invoice-paper glass">
                        {/* Cabecera factura */}
                        <div className="invoice-header">
                            <div>
                                <h1 style={{ margin: 0, color: 'var(--primary)', fontSize: '1.8rem', fontWeight: 800 }}>MediConnect</h1>
                                <p style={{ margin: 0, color: '#64748b', fontSize: '0.85rem' }}>Clínica de Especialidades Médicas</p>
                                <p style={{ margin: 0, color: '#64748b', fontSize: '0.85rem' }}>Av. Principal 123, Ciudad Salud</p>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <h2 style={{ margin: 0, fontSize: '1.5rem', color: '#0f172a' }}>FACTURA</h2>
                                <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.9rem', color: '#64748b' }}>N° <strong>[Borrador]</strong></p>
                                <p style={{ margin: 0, fontSize: '0.9rem', color: '#64748b' }}>Fecha: {new Date().toLocaleDateString()}</p>
                            </div>
                        </div>

                        {/* Datos del Cliente */}
                        <div className="invoice-client">
                            <h4 style={{ margin: '0 0 0.5rem 0', color: '#475569', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Facturado a:</h4>
                            <p style={{ margin: 0, fontWeight: 600, fontSize: '1.05rem', color: '#0f172a' }}>{nombrePaciente || 'Sin especificar'}</p>
                            <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.9rem', color: '#64748b' }}>Paciente Registrado</p>
                            <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.9rem', color: '#64748b' }}>Método de pago: <strong>{metodoPago}</strong></p>
                        </div>

                        {/* Detalles de Factura */}
                        <div className="invoice-items">
                            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '1rem' }}>
                                <thead>
                                    <tr style={{ borderBottom: '2px solid #e2e8f0' }}>
                                        <th style={{ textAlign: 'left', padding: '0.75rem 0', color: '#475569', fontSize: '0.85rem' }}>Descripción / Concepto</th>
                                        <th style={{ textAlign: 'center', padding: '0.75rem 0', color: '#475569', fontSize: '0.85rem' }}>Cant.</th>
                                        <th style={{ textAlign: 'right', padding: '0.75rem 0', color: '#475569', fontSize: '0.85rem' }}>P. Unitario</th>
                                        <th style={{ textAlign: 'right', padding: '0.75rem 0', color: '#475569', fontSize: '0.85rem' }}>Subtotal</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {items.map((it) => (
                                        <tr key={it.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                            <td style={{ padding: '0.75rem 0', fontSize: '0.95rem', color: '#1e293b' }}>{it.descripcion || '-'}</td>
                                            <td style={{ padding: '0.75rem 0', textAlign: 'center', fontSize: '0.95rem', color: '#475569' }}>{it.cantidad}</td>
                                            <td style={{ padding: '0.75rem 0', textAlign: 'right', fontSize: '0.95rem', color: '#475569' }}>${parseFloat(it.precio_unitario||0).toFixed(2)}</td>
                                            <td style={{ padding: '0.75rem 0', textAlign: 'right', fontSize: '0.95rem', color: '#0f172a', fontWeight: 500 }}>
                                                ${(parseFloat(it.precio_unitario||0) * (it.cantidad||1)).toFixed(2)}
                                            </td>
                                        </tr>
                                    ))}
                                    {items.length === 0 && (
                                        <tr><td colSpan="4" style={{ textAlign: 'center', padding: '1rem', color: '#94a3b8' }}>Añade conceptos en el panel</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Totales */}
                        <div className="invoice-totals">
                            <div style={{ flex: 1.5 }}></div>
                            <div style={{ flex: 1 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', color: '#64748b' }}>
                                    <span>Subtotal:</span>
                                    <span>${subtotal.toFixed(2)}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid #e2e8f0', color: '#64748b' }}>
                                    <span>Impuestos (16%):</span>
                                    <span>${impuestos.toFixed(2)}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem 0', color: '#0f172a', fontSize: '1.25rem', fontWeight: 800 }}>
                                    <span>Total Final:</span>
                                    <span>${total.toFixed(2)}</span>
                                </div>
                                {estado === 'Pagada' ? (
                                    <div style={{ background: '#dcfce7', color: '#166534', padding: '0.5rem', textAlign: 'center', borderRadius: '8px', fontSize: '0.9rem', fontWeight: 700, marginTop: '1rem', border: '1px dashed #22c55e' }}>
                                        PAGADO EL {new Date().toLocaleDateString()}
                                    </div>
                                ) : (
                                    <div style={{ background: '#fef2f2', color: '#b91c1c', padding: '0.5rem', textAlign: 'center', borderRadius: '8px', fontSize: '0.9rem', fontWeight: 700, marginTop: '1rem', border: '1px dashed #ef4444' }}>
                                        SALDO PENDIENTE
                                    </div>
                                )}
                            </div>
                        </div>
                        
                        <div style={{ marginTop: '3rem', borderTop: '2px dashed #e2e8f0', paddingTop: '1.5rem', textAlign: 'center', color: '#94a3b8', fontSize: '0.8rem' }}>
                            <p style={{ margin: 0 }}>Gracias por confiar en MedicalConnect. El cuidado de su salud es nuestra prioridad.</p>
                            <p style={{ margin: '0.25rem 0 0 0' }}>Para cualquier duda sobre esta factura comuníquese al (555) 123-4567.</p>
                        </div>
                    </div>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{__html: `
                .billing-layout {
                    display: grid;
                    grid-template-columns: 350px 1fr;
                    gap: 1.5rem;
                    align-items: flex-start;
                    margin-top: 1.5rem;
                }
                .billing-form {
                    padding: 1.5rem;
                    border-radius: var(--radius);
                    position: sticky;
                    top: 100px;
                }
                .form-label { font-size: 0.85rem; font-weight: 600; color: #475569; margin-bottom: 0.4rem; display: block; }
                .form-input {
                    display: block; width: 100%; border: 1px solid var(--border); border-radius: 8px;
                    padding: 0.5rem 0.75rem; outline: none; transition: all 0.2s; box-sizing: border-box; font-family: inherit;
                }
                .form-input:focus { border-color: var(--primary); box-shadow: 0 0 0 3px rgba(14,165,233,0.1); }
                
                .invoice-paper {
                    background: white;
                    border-radius: 12px;
                    padding: 3rem;
                    box-shadow: 0 10px 40px rgba(0,0,0,0.08); /* estilo premium */
                    min-height: 800px; /* para simular A4 aprox en pantalla */
                    display: flex;
                    flex-direction: column;
                }
                .invoice-header { display: flex; justify-content: space-between; border-bottom: 2px solid #f1f5f9; padding-bottom: 2rem; margin-bottom: 2rem; }
                .invoice-client { margin-bottom: 2.5rem; }
                .invoice-totals { display: flex; margin-top: auto; padding-top: 2rem; }

                /* Lógica de Impresión Nativa de Navegador */
                @media print {
                    @page { margin: 0; size: auto; }
                    body { -webkit-print-color-adjust: exact; print-color-adjust: exact; background: white; }
                    .no-print, .sidebar, .navbar { display: none !important; }
                    .page-container { margin: 0; padding: 0; max-width: 100%; }
                    .billing-layout { display: block; }
                    .invoice-paper { box-shadow: none; padding: 2cm; margin: 0; width: 100%; border: none; min-height: auto; }
                }
                
                @media (max-width: 1024px) {
                    .billing-layout { grid-template-columns: 1fr; }
                    .billing-form { position: static; }
                    .invoice-paper { padding: 1.5rem; min-height: auto; }
                }
                .spin { animation: spin 1s linear infinite; }
                @keyframes spin { 100% { transform: rotate(360deg); } }
            `}} />
        </div>
    );
};

export default CreateFactura;
