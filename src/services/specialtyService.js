const API_URL = 'http://localhost:3000/api/especialidades';

export const getSpecialties = async () => {
  const response = await fetch(API_URL);
  if (!response.ok) throw new Error('Error fetching specialties');
  return response.json();
};

export const getSpecialtyById = async (id) => {
  const response = await fetch(`${API_URL}/${id}`);
  if (!response.ok) throw new Error('Error fetching specialty');
  return response.json();
};

export const createSpecialty = async (specialtyData) => {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(specialtyData),
  });
  if (!response.ok) throw new Error('Error creating specialty');
  return response.json();
};

export const updateSpecialty = async (id, specialtyData) => {
  const response = await fetch(`${API_URL}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(specialtyData),
  });
  if (!response.ok) throw new Error('Error updating specialty');
  return response.json();
};

export const deleteSpecialty = async (id) => {
  const response = await fetch(`${API_URL}/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) throw new Error('Error deleting specialty');
  return response.json();
};
