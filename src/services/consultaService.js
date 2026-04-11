const API_URL = 'http://localhost:3000/api/consultas';

export const getConsultas = async () => {
  const response = await fetch(API_URL);
  if (!response.ok) throw new Error('Error fetching consultas');
  return response.json();
};

export const createConsulta = async (consultaData) => {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(consultaData),
  });
  if (!response.ok) throw new Error('Error creating consulta');
  return response.json();
};

export const getConsultaById = async (id) => {
    const response = await fetch(`${API_URL}/${id}`);
    if (!response.ok) throw new Error('Error fetching consulta');
    return response.json();
};
