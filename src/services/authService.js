const API = 'http://localhost:3000/api/users';

export const login = async (email, password) => {
    const res = await fetch(`${API}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Error al iniciar sesión');
    return data; // { token, user }
};

export const seedAdmin = async (userData) => {
    const res = await fetch(`${API}/seed-admin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Error al crear administrador');
    return data;
};
