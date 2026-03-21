const API_URL = 'http://localhost:3000/api/pacientes';

export const getPatients = async () => {
  const response = await fetch(API_URL);
  if (!response.ok) throw new Error('Error fetching patients');
  return response.json();
};

export const getPatientById = async (id) => {
  const response = await fetch(`${API_URL}/${id}`);
  if (!response.ok) throw new Error('Error fetching patient');
  return response.json();
};

export const createPatient = async (patientData) => {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(patientData),
  });
  if (!response.ok) throw new Error('Error creating patient');
  return response.json();
};

export const updatePatient = async (id, patientData) => {
  const response = await fetch(`${API_URL}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(patientData),
  });
  if (!response.ok) throw new Error('Error updating patient');
  return response.json();
};

export const deletePatient = async (id) => {
  const response = await fetch(`${API_URL}/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) throw new Error('Error deleting patient');
  return response.json();
};
