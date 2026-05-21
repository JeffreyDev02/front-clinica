const API = 'http://localhost:3000/api/facturas';

const getHeaders = () => {
    const token = localStorage.getItem('mc_token');
    return {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };
};

export const getFacturas = async () => {
    const res = await fetch(API, { headers: getHeaders() });
    if (!res.ok) throw new Error('Error al obtener facturas');
    return res.json();
};

export const createFactura = async (facturaData) => {
    const res = await fetch(API, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(facturaData),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Error al crear la factura');
    return data;
};

export const getFacturaById = async (id) => {
    const res = await fetch(`${API}/${id}`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Error al obtener los detalles de la factura');
    return res.json();
};

export const updateFacturaEstado = async (id, estado) => {
    const res = await fetch(`${API}/${id}/estado`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({ estado }),
    });
    if (!res.ok) throw new Error('Error al actualizar el estado de la factura');
    return res.json();
};

export const deleteFactura = async (id) => {
    const res = await fetch(`${API}/${id}`, {
        method: 'DELETE',
        headers: getHeaders(),
    });
    if (!res.ok) throw new Error('Error al eliminar la factura');
    return res.json();
};
