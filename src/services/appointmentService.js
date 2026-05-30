const API_URL = 'http://localhost:3000/api/citas';
import { authHeaders } from './apiClient';

export const getAppointments = async () => {
  const response = await fetch(API_URL, { headers: authHeaders() });
  if (!response.ok) throw new Error('Error fetching appointments');
  return response.json();
};

export const createAppointment = async (appointmentData) => {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: authHeaders(true),
    body: JSON.stringify(appointmentData),
  });
  if (!response.ok) {
    const errorData = await response.json();
    const error = new Error(JSON.stringify(errorData));
    throw error;
  }
  return response.json();
};

export const updateAppointment = async (id, appointmentData) => {
  const response = await fetch(`${API_URL}/${id}`, {
    method: 'PUT',
    headers: authHeaders(true),
    body: JSON.stringify(appointmentData),
  });
  if (!response.ok) throw new Error('Error updating appointment');
  return response.json();
};

export const deleteAppointment = async (id) => {
  const response = await fetch(`${API_URL}/${id}`, {
    method: 'DELETE', headers: authHeaders(),
  });
  if (!response.ok) throw new Error('Error deleting appointment');
  return response.json();
};
