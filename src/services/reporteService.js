const API_URL = 'http://localhost:3000/api/reportes';
import { authHeaders } from './apiClient';

export const getResumen = async () => {
    const res = await fetch(`${API_URL}/resumen`, { headers: authHeaders() });
    if (!res.ok) throw new Error('Error al obtener resumen');
    return res.json();
};

export const getCitasPorEstado = async () => {
    const res = await fetch(`${API_URL}/citas-por-estado`, { headers: authHeaders() });
    if (!res.ok) throw new Error('Error al obtener citas por estado');
    return res.json();
};

export const getCitasPorMedico = async () => {
    const res = await fetch(`${API_URL}/citas-por-medico`, { headers: authHeaders() });
    if (!res.ok) throw new Error('Error al obtener citas por médico');
    return res.json();
};

export const getMedicamentosTop = async () => {
    const res = await fetch(`${API_URL}/medicamentos-top`, { headers: authHeaders() });
    if (!res.ok) throw new Error('Error al obtener medicamentos top');
    return res.json();
};

export const getConsultasRecientes = async () => {
    const res = await fetch(`${API_URL}/consultas-recientes`, { headers: authHeaders() });
    if (!res.ok) throw new Error('Error al obtener consultas recientes');
    return res.json();
};

export const getPacientesAtendidos = async (desde, hasta) => {
    const p = new URLSearchParams();
    if (desde) p.set('desde', desde);
    if (hasta) p.set('hasta', hasta);
    const res = await fetch(`${API_URL}/pacientes-atendidos?${p}`, { headers: authHeaders() });
    if (!res.ok) throw new Error('Error al obtener pacientes atendidos');
    return res.json();
};

export const getMedicamentosReporte = async () => {
    const res = await fetch(`${API_URL}/medicamentos-reporte`, { headers: authHeaders() });
    if (!res.ok) throw new Error('Error al obtener reporte de medicamentos');
    return res.json();
};

export const getDoctoresReporte = async (desde, hasta) => {
    const p = new URLSearchParams();
    if (desde) p.set('desde', desde);
    if (hasta) p.set('hasta', hasta);
    const res = await fetch(`${API_URL}/doctores-reporte?${p}`, { headers: authHeaders() });
    if (!res.ok) throw new Error('Error al obtener reporte de médicos');
    return res.json();
};

export const getCitasReporte = async (desde, hasta) => {
    const p = new URLSearchParams();
    if (desde) p.set('desde', desde);
    if (hasta) p.set('hasta', hasta);
    const res = await fetch(`${API_URL}/citas-reporte?${p}`, { headers: authHeaders() });
    if (!res.ok) throw new Error('Error al obtener reporte de citas');
    return res.json();
};

export const getPacienteFrecuente = async () => {
    const res = await fetch(`${API_URL}/paciente-frecuente`, { headers: authHeaders() });
    if (!res.ok) throw new Error('Error al obtener paciente frecuente');
    return res.json();
};

export const getDoctorMasTrabajo = async () => {
    const res = await fetch(`${API_URL}/doctor-mas-trabajo`, { headers: authHeaders() });
    if (!res.ok) throw new Error('Error al obtener doctor con más trabajo');
    return res.json();
};
