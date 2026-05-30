const API = 'http://localhost:3000/api/expediente';
import { authHeaders } from './apiClient';

export const getExpediente = async (id) => {
    const res = await fetch(`${API}/${id}`, { headers: authHeaders() });
    if (!res.ok) throw new Error('Error al obtener expediente');
    return res.json();
};

export const agregarHistorial = async (id, descripcion) => {
    const res = await fetch(`${API}/${id}/historial`, {
        method: 'POST',
        headers: authHeaders(true),
        body: JSON.stringify({ descripcion }),
    });
    if (!res.ok) throw new Error('Error al agregar nota');
    return res.json();
};
