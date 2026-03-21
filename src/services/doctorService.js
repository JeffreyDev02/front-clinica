const API_URL = 'http://localhost:3000/api/medicos';

export const getDoctors = async () => {
  const response = await fetch(API_URL);
  if (!response.ok) throw new Error('Error fetching doctors');
  return response.json();
};

export const getDoctorById = async (id) => {
  const response = await fetch(`${API_URL}/${id}`);
  if (!response.ok) throw new Error('Error fetching doctor');
  return response.json();
};

export const createDoctor = async (doctorData) => {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(doctorData),
  });
  if (!response.ok) throw new Error('Error creating doctor');
  return response.json();
};

export const updateDoctor = async (id, doctorData) => {
  const response = await fetch(`${API_URL}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(doctorData),
  });
  if (!response.ok) throw new Error('Error updating doctor');
  return response.json();
};

export const deleteDoctor = async (id) => {
  const response = await fetch(`${API_URL}/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) throw new Error('Error deleting doctor');
  return response.json();
};
