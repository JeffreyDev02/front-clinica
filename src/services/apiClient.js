export const authHeaders = (json = false) => {
  const token = localStorage.getItem('mc_token');
  return {
    ...(json ? { 'Content-Type': 'application/json' } : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};
