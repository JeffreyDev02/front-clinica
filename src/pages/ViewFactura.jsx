import React, { useState, useEffect } from 'react';
import { ArrowLeft, Printer, Loader2 } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { getFacturaById } from '../services/facturaService';

const ViewFactura = () => {
    const { id } = useParams();
    const [factura, setFactura] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchFactura = async () => {
            try {
                const data = await getFacturaById(id);
                setFactura(data);
            } catch (err) {
                console.error(err);
                setError('No se pudo obtener la factura o no existe.');
            } finally {
                setLoading(false);
            }
        };
        fetchFactura();
    }, [id]);

    const handlePrint = () => window.print();

    if (loading) return <div style={{ padding: '3rem', textAlign: 'center' }}><Loader2 className="spin" size={32} color="var(--primary)" /></div>;
    if (error || !factura) return <div style={{ padding: '3rem', textAlign: 'center', color: 'red' }}><h2>{error}</h2><Link to="/facturacion">Volver</Link></div>;

    const { paciente, Paciente, patient, paciente_nombre, paciente_apellido, nombre, apellido, detalles, FacturaDetalles, invoice_items, numero_factura, fecha_emision, metodo_pago, estado, subtotal, impuestos, total } = factura;
    
    // Resolución inteligente del paciente
    const objPaciente = paciente || Paciente || patient;
    let nombreCompleto = 'Paciente no encontrado';
    if (objPaciente) {
        nombreCompleto = `${objPaciente.nombre || objPaciente.name || ''} ${objPaciente.apellido || objPaciente.last_name || ''}`.trim();
    } else if (nombre || apellido) {
        nombreCompleto = `${nombre || ''} ${apellido || ''}`.trim();
    } else if (paciente_nombre) {
        nombreCompleto = `${paciente_nombre} ${paciente_apellido || ''}`.trim();
    }
    if (!nombreCompleto || nombreCompleto === '') nombreCompleto = 'Paciente no encontrado';

    // Resolución inteligente de los detalles (Sequelize suele devolver capitalizado o plural)
    const items = detalles || FacturaDetalles || invoice_items || [];

    return (
        <div className="page-container fade-in">
            <div className="page-header no-print">
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <Link to="/facturacion" className="btn-icon" style={{ padding: '0.5rem', background: 'var(--surface)', borderRadius: '50%', color: 'var(--text-muted)' }}>
                        <ArrowLeft size={20} />
                    </Link>
                    <div>
                        <h1 className="page-title">Vista de Factura</h1>
                        <p className="page-subtitle">Comprobante generado N° {numero_factura || `FA-${factura.id}`}</p>
                    </div>
                </div>
                <button onClick={handlePrint} className="btn btn-primary">
                    <Printer size={18} /> Imprimir Comprobante
                </button>
            </div>

            <div className="billing-preview-wrapper print-area" style={{ maxWidth: '850px', margin: '0 auto' }}>
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
                            <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.9rem', color: '#64748b' }}>N° <strong>{numero_factura || `FA-${factura.id}`}</strong></p>
                            <p style={{ margin: 0, fontSize: '0.9rem', color: '#64748b' }}>Fecha: {new Date(fecha_emision).toLocaleDateString()}</p>
                        </div>
                    </div>

                    {/* Datos del Cliente */}
                    <div className="invoice-client">
                        <h4 style={{ margin: '0 0 0.5rem 0', color: '#475569', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Facturado a:</h4>
                        <p style={{ margin: 0, fontWeight: 600, fontSize: '1.05rem', color: '#0f172a' }}>{nombreCompleto}</p>
                        <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.9rem', color: '#64748b' }}>Paciente Registrado</p>
                        <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.9rem', color: '#64748b' }}>Método de pago: <strong>{metodo_pago || 'No especificado'}</strong></p>
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
                                {items.map((it, idx) => (
                                    <tr key={it.id || idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                        <td style={{ padding: '0.75rem 0', fontSize: '0.95rem', color: '#1e293b' }}>{it.descripcion || '-'}</td>
                                        <td style={{ padding: '0.75rem 0', textAlign: 'center', fontSize: '0.95rem', color: '#475569' }}>{it.cantidad}</td>
                                        <td style={{ padding: '0.75rem 0', textAlign: 'right', fontSize: '0.95rem', color: '#475569' }}>${parseFloat(it.precio_unitario||0).toFixed(2)}</td>
                                        <td style={{ padding: '0.75rem 0', textAlign: 'right', fontSize: '0.95rem', color: '#0f172a', fontWeight: 500 }}>
                                            ${(parseFloat(it.subtotal || (parseFloat(it.precio_unitario||0) * (it.cantidad||1)))).toFixed(2)}
                                        </td>
                                    </tr>
                                ))}
                                {items.length === 0 && (
                                    <tr><td colSpan="4" style={{ textAlign: 'center', padding: '1rem', color: '#94a3b8' }}>Sin conceptos registrados</td></tr>
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
                                <span>${parseFloat(subtotal).toFixed(2)}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid #e2e8f0', color: '#64748b' }}>
                                <span>Impuestos (16%):</span>
                                <span>${parseFloat(impuestos).toFixed(2)}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem 0', color: '#0f172a', fontSize: '1.25rem', fontWeight: 800 }}>
                                <span>Total Final:</span>
                                <span>${parseFloat(total).toFixed(2)}</span>
                            </div>
                            {estado === 'Pagada' ? (
                                <div style={{ background: '#dcfce7', color: '#166534', padding: '0.5rem', textAlign: 'center', borderRadius: '8px', fontSize: '0.9rem', fontWeight: 700, marginTop: '1rem', border: '1px dashed #22c55e' }}>
                                    ESTADO: PAGADA
                                </div>
                            ) : (
                                <div style={{ background: '#fef2f2', color: '#b91c1c', padding: '0.5rem', textAlign: 'center', borderRadius: '8px', fontSize: '0.9rem', fontWeight: 700, marginTop: '1rem', border: '1px dashed #ef4444' }}>
                                    ESTADO: {estado?.toUpperCase()}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{__html: `
                .invoice-paper {
                    background: white;
                    border-radius: 12px;
                    padding: 3rem;
                    box-shadow: 0 10px 40px rgba(0,0,0,0.08);
                    min-height: 800px;
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
                    .invoice-paper { box-shadow: none; padding: 2cm; margin: 0; width: 100%; border: none; min-height: auto; }
                }
                .spin { animation: spin 1s linear infinite; }
                @keyframes spin { 100% { transform: rotate(360deg); } }
            `}} />
        </div>
    );
};

export default ViewFactura;
