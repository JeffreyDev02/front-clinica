import React, { useState } from 'react';
import { ShieldCheck, Eye, EyeOff, Loader2 } from 'lucide-react';
import { login } from '../services/authService';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPass, setShowPass] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const { signIn } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const { token, user } = await login(email, password);
            signIn(token, user);
            navigate('/');
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
            }}>
                {/* Logo */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '2rem', gap: '0.5rem' }}>
                    <div style={{
                        background: 'linear-gradient(135deg,#0ea5e9,#38bdf8)',
                        borderRadius: 16, padding: '0.85rem',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                        <ShieldCheck size={32} color="#fff" />
                    </div>
                    <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800, color: '#0f172a' }}>MediConnect</h1>
                    <p style={{ margin: 0, color: '#64748b', fontSize: '0.875rem' }}>Sistema de Gestión Médica</p>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div>
                        <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '0.4rem' }}>
                            Correo electrónico
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            placeholder="admin@mediconnect.com"
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
                        {loading ? 'Ingresando...' : 'Iniciar Sesión'}
                    </button>
                </form>

                <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
                    <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '0.5rem' }}>¿No tienes cuenta?</p>
                    <Link to="/register" style={{
                        color: '#0ea5e9', fontSize: '0.85rem', fontWeight: 600, textDecoration: 'none',
                    }}
                    onMouseEnter={e => e.target.style.textDecoration = 'underline'}
                    onMouseLeave={e => e.target.style.textDecoration = 'none'}
                    >
                        Regístrate aquí
                    </Link>
                </div>

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

export default Login;
