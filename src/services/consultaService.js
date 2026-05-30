const API_URL = 'http://localhost:3000/api/consultas';
import { authHeaders } from './apiClient';

export const getConsultas = async () => {
  const response = await fetch(API_URL, { headers: authHeaders() });
  if (!response.ok) throw new Error('Error fetching consultas');
  return response.json();
};

export const createConsulta = async (consultaData) => {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: authHeaders(true),
    body: JSON.stringify(consultaData),
  });
  if (!response.ok) throw new Error('Error creating consulta');
  return response.json();
};

export const getConsultaById = async (id) => {
    const response = await fetch(`${API_URL}/${id}`, { headers: authHeaders() });
    if (!response.ok) throw new Error('Error fetching consulta');
    return response.json();
};

export const updateConsulta = async (id, consultaData) => {
  const response = await fetch(`${API_URL}/${id}`, {
    method: 'PUT',
    headers: authHeaders(true),
    body: JSON.stringify(consultaData),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Error al actualizar consulta');
  return data;
};
