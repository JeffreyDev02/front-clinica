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

const DOCTOR_SPECIALTY_API_URL = 'http://localhost:3000/api/medico_especialidad';

export const assignDoctorSpecialty = async (id_medico, id_especialidad) => {
  const payload = { id_medico, id_especialidad };
  const response = await fetch(DOCTOR_SPECIALTY_API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    const respText = await response.text();
    throw new Error(`Error assigning specialty to doctor: ${response.status} ${respText}`);
  }
  return response.json();
};

export const removeDoctorSpecialty = async (id_medico, id_especialidad) => {
  const payload = { id_medico, id_especialidad };
  const response = await fetch(DOCTOR_SPECIALTY_API_URL, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    const respText = await response.text();
    throw new Error(`Error removing specialty from doctor: ${response.status} ${respText}`);
  }
  return response.json();
};

export const getDoctorSpecialties = async (id_medico) => {
  const response = await fetch(`${DOCTOR_SPECIALTY_API_URL}/medico/${id_medico}`);
  if (!response.ok) throw new Error('Error fetching doctor specialties');
  return response.json();
};

export const deleteDoctor = async (id) => {
  const response = await fetch(`${API_URL}/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) throw new Error('Error deleting doctor');
  return response.json();
};
