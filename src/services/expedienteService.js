const API = 'http://localhost:3000/api/expediente';

export const getExpediente = async (id) => {
    const res = await fetch(`${API}/${id}`);
    if (!res.ok) throw new Error('Error al obtener expediente');
    return res.json();
};

export const agregarHistorial = async (id, descripcion) => {
    const res = await fetch(`${API}/${id}/historial`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ descripcion }),
    });
    if (!res.ok) throw new Error('Error al agregar nota');
    return res.json();
};
