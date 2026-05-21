import React, { useState } from 'react';
import { ShieldCheck, Eye, EyeOff, Loader2, ArrowLeft } from 'lucide-react';
import { seedAdmin } from '../services/authService';
import { useNavigate, Link } from 'react-router-dom';

const Register = () => {
    const [nombre, setNombre] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [rol, setRol] = useState('admin');
    const [showPass, setShowPass] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await seedAdmin({ nombre, email, password, rol });
            setSuccess(true);
            setTimeout(() => {
                navigate('/login');
            }, 2000);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'linear-gradient(135deg, #e0f2fe 0%, #f0fdf4 100%)',
        }}>
            <div style={{
                background: '#fff', borderRadius: 20, padding: '2.5rem',
                width: '100%', maxWidth: 420,
                boxShadow: '0 20px 60px rgba(14,165,233,0.12)',
                position: 'relative'
            }}>
                {/* Botón Volver */}
                <Link to="/login" style={{
                    position: 'absolute', top: '1.5rem', left: '1.5rem',
                    color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.25rem',
                    textDecoration: 'none', fontSize: '0.85rem', fontWeight: 600,
                    transition: 'color 0.2s'
                }}
                onMouseEnter={e => e.currentTarget.style.color = '#0ea5e9'}
                onMouseLeave={e => e.currentTarget.style.color = '#64748b'}>
                    <ArrowLeft size={16} /> Volver
                </Link>

                {/* Logo */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '2rem', marginTop: '1rem', gap: '0.5rem' }}>
                    <div style={{
                        background: 'linear-gradient(135deg,#0ea5e9,#38bdf8)',
                        borderRadius: 16, padding: '0.85rem',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                        <ShieldCheck size={32} color="#fff" />
                    </div>
                    <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800, color: '#0f172a' }}>Registro</h1>
                    <p style={{ margin: 0, color: '#64748b', fontSize: '0.875rem' }}>Crea tu cuenta de acceso</p>
                </div>

                {success ? (
                    <div style={{
                        background: '#f0fdf4', border: '1px solid #bbf7d0',
                        borderRadius: 8, padding: '1.5rem', textAlign: 'center',
                        color: '#166534', fontSize: '0.95rem', fontWeight: 500,
                    }}>
                        ¡Cuenta creada exitosamente!<br/>Redirigiendo a inicio de sesión...
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div>
                            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '0.4rem' }}>
                                Nombre completo
                            </label>
                            <input
                                type="text"
                                value={nombre}
                                onChange={e => setNombre(e.target.value)}
                                placeholder="Ej: Dr. Juan Pérez"
                                required
                                style={{
                                    width: '100%', boxSizing: 'border-box',
                                    border: '1.5px solid #e2e8f0', borderRadius: 10,
                                    padding: '0.65rem 0.9rem', fontSize: '0.95rem',
                                    outline: 'none', transition: 'border-color 0.2s',
                                }}
                                onFocus={e => e.target.style.borderColor = '#0ea5e9'}
                                onBlur={e => e.target.style.borderColor = '#e2e8f0'}
                            />
                        </div>

                        <div>
                            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '0.4rem' }}>
                                Correo electrónico
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                placeholder="tu@correo.com"
                                required
                                style={{
                                    width: '100%', boxSizing: 'border-box',
                                    border: '1.5px solid #e2e8f0', borderRadius: 10,
                                    padding: '0.65rem 0.9rem', fontSize: '0.95rem',
                                    outline: 'none', transition: 'border-color 0.2s',
                                }}
                                onFocus={e => e.target.style.borderColor = '#0ea5e9'}
                                onBlur={e => e.target.style.borderColor = '#e2e8f0'}
                            />
                        </div>

                        <div>
                            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '0.4rem' }}>
                                Contraseña
                            </label>
                            <div style={{ position: 'relative' }}>
                                <input
                                    type={showPass ? 'text' : 'password'}
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    required
                                    style={{
                                        width: '100%', boxSizing: 'border-box',
                                        border: '1.5px solid #e2e8f0', borderRadius: 10,
                                        padding: '0.65rem 2.5rem 0.65rem 0.9rem', fontSize: '0.95rem',
                                        outline: 'none', transition: 'border-color 0.2s',
                                    }}
                                    onFocus={e => e.target.style.borderColor = '#0ea5e9'}
                                    onBlur={e => e.target.style.borderColor = '#e2e8f0'}
                                />
                                <button type="button" onClick={() => setShowPass(v => !v)}
                                    style={{
                                        position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
                                        background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: 0,
                                    }}>
                                    {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        <div>
                            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '0.4rem' }}>
                                Rol en la Clínica
                            </label>
                            <select
                                value={rol}
                                onChange={e => setRol(e.target.value)}
                                style={{
                                    width: '100%', boxSizing: 'border-box',
                                    border: '1.5px solid #e2e8f0', borderRadius: 10,
                                    padding: '0.65rem 0.9rem', fontSize: '0.95rem',
                                    outline: 'none', transition: 'border-color 0.2s',
                                    backgroundColor: '#fff', color: '#0f172a'
                                }}
                                onFocus={e => e.target.style.borderColor = '#0ea5e9'}
                                onBlur={e => e.target.style.borderColor = '#e2e8f0'}
                            >
                                <option value="admin">Administrador</option>
                                <option value="medico">Médico</option>
                                <option value="recepcion">Recepcionista</option>
                            </select>
                        </div>

                        {error && (
                            <div style={{
                                background: '#fef2f2', border: '1px solid #fecaca',
                                borderRadius: 8, padding: '0.6rem 0.9rem',
                                color: '#dc2626', fontSize: '0.85rem', fontWeight: 500,
                            }}>
                                {error}
                            </div>
                        )}

                        <button type="submit" disabled={loading}
                            style={{
                                background: 'linear-gradient(135deg,#0ea5e9,#38bdf8)',
                                color: '#fff', border: 'none', borderRadius: 10,
                                padding: '0.75rem', fontSize: '1rem', fontWeight: 700,
                                cursor: loading ? 'not-allowed' : 'pointer',
                                opacity: loading ? 0.7 : 1,
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                                marginTop: '0.5rem',
                                boxShadow: '0 4px 14px rgba(14,165,233,0.3)',
                                transition: 'opacity 0.2s',
                            }}>
                            {loading && <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />}
                            {loading ? 'Creando cuenta...' : 'Crear cuenta'}
                        </button>
                    </form>
                )}

                <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.8rem', color: '#94a3b8' }}>
                    © 2026 MediConnect · Sistema de Gestión de Citas Médicas
                </p>
            </div>

            <style>{`
                @keyframes spin { to { transform: rotate(360deg); } }
            `}</style>
        </div>
    );
};

export default Register;
