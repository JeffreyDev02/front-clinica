const API_URL = 'http://localhost:3000/api/medicamentos';
import { authHeaders } from './apiClient';

export const getMedicamentos = async () => {
  const response = await fetch(API_URL, { headers: authHeaders() });
  if (!response.ok) throw new Error('Error al obtener medicamentos');
  return response.json();
};

const send = async (url, options) => {
  const response = await fetch(url, {
    headers: authHeaders(true),
    ...options,
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Error al procesar medicamento');
  return data;
};

export const createMedicamento = (medicamento) =>
  send(API_URL, { method: 'POST', body: JSON.stringify(medicamento) });

export const updateMedicamento = (id, medicamento) =>
  send(`${API_URL}/${id}`, { method: 'PUT', body: JSON.stringify(medicamento) });

export const deleteMedicamento = (id) =>
  send(`${API_URL}/${id}`, { method: 'DELETE' });
