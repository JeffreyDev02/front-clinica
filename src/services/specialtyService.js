const API_URL = 'http://localhost:3000/api/especialidades';
import { authHeaders } from './apiClient';

export const getSpecialties = async () => {
  const response = await fetch(API_URL, { headers: authHeaders() });
  if (!response.ok) throw new Error('Error fetching specialties');
  return response.json();
};

export const getSpecialtyById = async (id) => {
  const response = await fetch(`${API_URL}/${id}`, { headers: authHeaders() });
  if (!response.ok) throw new Error('Error fetching specialty');
  return response.json();
};

export const createSpecialty = async (specialtyData) => {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: authHeaders(true),
    body: JSON.stringify(specialtyData),
  });
  if (!response.ok) throw new Error('Error creating specialty');
  return response.json();
};

export const updateSpecialty = async (id, specialtyData) => {
  const response = await fetch(`${API_URL}/${id}`, {
    method: 'PUT',
    headers: authHeaders(true),
    body: JSON.stringify(specialtyData),
  });
  if (!response.ok) throw new Error('Error updating specialty');
  return response.json();
};

export const deleteSpecialty = async (id) => {
  const response = await fetch(`${API_URL}/${id}`, {
    method: 'DELETE', headers: authHeaders(),
  });
  if (!response.ok) throw new Error('Error deleting specialty');
  return response.json();
};
