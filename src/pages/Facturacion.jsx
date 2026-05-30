import React, { useState, useEffect } from 'react';
import { Plus, Search, FileText, Download, CheckCircle, Clock, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getFacturas, updateFacturaEstado, deleteFactura } from '../services/facturaService';

const Facturacion = () => {
    const [facturas, setFacturas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const data = await getFacturas();
            setFacturas(data);
        } catch (error) {
            console.error('Error:', error);
            // Fallback data for frontend demonstration if API is missing
            setFacturas([
                { id: 1, numero_factura: 'F-001', paciente_nombre: 'Alberto Gómez', fecha_emision: '2026-05-14', total: 150.00, estado: 'Pagada' },
                { id: 2, numero_factura: 'F-002', paciente_nombre: 'María Silva', fecha_emision: '2026-05-15', total: 80.50, estado: 'Pendiente' }
            ]);
        } finally {
            setLoading(false);
        }
    };

    const handleMarkAsPaid = async (facturaId) => {
        try {
            await updateFacturaEstado(facturaId, 'Pagada');
            fetchData();
        } catch (error) {
            console.error(error);
            alert('Error o API no disponible: Simulando actualización en vista');
            setFacturas(facturas.map(f => (f.id || f._id || f.id_factura) === facturaId ? { ...f, estado: 'Pagada' } : f));
        }
    };

    const handleDelete = async (facturaId) => {
        if (!window.confirm('¿Seguro que deseas anular y eliminar esta factura y sus detalles?')) return;
        try {
            await deleteFactura(facturaId);
            fetchData();
        } catch (error) {
            console.error(error);
            alert('Error o API no disponible: Simulando eliminación');
            setFacturas(facturas.filter(f => (f.id || f._id || f.id_factura) !== facturaId));
        }
    };

    const StatusBadge = ({ status }) => {
        const isPaid = status === 'Pagada';
        return (
            <span style={{
                background: isPaid ? '#dcfce7' : '#fef9c3',
                color: isPaid ? '#166534' : '#854d0e',
                padding: '0.25rem 0.75rem',
                borderRadius: '9999px',
                fontSize: '0.85rem',
                fontWeight: 600,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.25rem'
            }}>
                {isPaid ? <CheckCircle size={14} /> : <Clock size={14} />}
                {status}
            </span>
        );
    };

    const filteredFacturas = facturas.filter(f => 
        (f.paciente_nombre || `${f.nombre || ''} ${f.apellido || ''}`).toLowerCase().includes(searchTerm.toLowerCase()) || 
        f.numero_factura?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="page-container fade-in">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Facturación</h1>
                    <p className="page-subtitle">Gestiona los cobros y facturas emitidas a los pacientes</p>
                </div>
                <Link to="/facturacion/nueva" className="btn btn-primary" style={{ textDecoration: 'none' }}>
                    <Plus size={20} />
                    <span>Nueva Factura</span>
                </Link>
            </div>

            <div className="card glass">
                <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <div style={{ position: 'relative', width: '300px' }}>
                        <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                        <input
                            type="text"
                            placeholder="Buscar por paciente o N° factura..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{ padding: '0.6rem 1rem 0.6rem 2.5rem', width: '100%', borderRadius: 'var(--radius)', border: '1px solid var(--border)', outline: 'none' }}
                        />
                    </div>
                </div>

                <div className="table-responsive">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>N° Factura</th>
                                <th>Paciente</th>
                                <th>Fecha Emisión</th>
                                <th>Total</th>
                                <th>Estado</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="6" style={{ textAlign: 'center', padding: '2rem' }}>Cargando facturas...</td></tr>
                            ) : filteredFacturas.length > 0 ? (
                                filteredFacturas.map((factura, index) => {
                                    const facturaId = factura.id || factura._id || factura.id_factura || index;
                                    return (
                                        <tr key={facturaId}>
                                            <td style={{ fontWeight: 600 }}>{factura.numero_factura || `FA-${facturaId}`}</td>
                                            <td>{factura.paciente_nombre || `${factura.nombre || ''} ${factura.apellido || ''}`.trim() || 'N/A'}</td>
                                            <td>{new Date(factura.fecha_emision || Date.now()).toLocaleDateString()}</td>
                                            <td style={{ fontWeight: 600 }}>Q {parseFloat(factura.total || 0).toFixed(2)}</td>
                                            <td><StatusBadge status={factura.estado} /></td>
                                            <td>
                                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                    {factura.estado !== 'Pagada' && (
                                                        <button onClick={() => handleMarkAsPaid(facturaId)} className="btn-icon" title="Marcar como pagada" style={{ background: '#dcfce7', color: '#166534' }}>
                                                            <CheckCircle size={18} />
                                                        </button>
                                                    )}
                                                    <Link to={`/facturacion/${facturaId}`} className="btn-icon" title="Ver Factura" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
                                                        <FileText size={18} color="var(--primary)" />
                                                    </Link>
                                                    <button onClick={() => handleDelete(facturaId)} className="btn-icon" title="Anular Factura" style={{ background: '#fef2f2', color: '#dc2626' }}>
                                                        <Trash2 size={18} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan="6" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                                        <FileText size={48} style={{ opacity: 0.2, marginBottom: '1rem' }} />
                                        <p>No se encontraron facturas</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
            <style dangerouslySetInnerHTML={{__html: `
                .btn-icon {
                    width: 32px; height: 32px; border-radius: 6px; display: flex; align-items: center; justify-content: center; border: none; cursor: pointer; transition: all 0.2s;
                }
                .btn-icon:hover { transform: translateY(-2px); box-shadow: 0 4px 6px rgba(0,0,0,0.05); }
            `}} />
        </div>
    );
};

export default Facturacion;
