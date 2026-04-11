const API_URL = 'http://localhost:3000/api/medicamentos';

export const getMedicamentos = async () => {
  const response = await fetch(API_URL);
  if (!response.ok) throw new Error('Error fetching medicamentos');
  return response.json();
};
