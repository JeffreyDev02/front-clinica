import React, { createContext, useContext, useState, useCallback } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        try {
            const stored = localStorage.getItem('mc_user');
            return stored ? JSON.parse(stored) : null;
        } catch {
            return null;
        }
    });

    const signIn = useCallback((token, userData) => {
        localStorage.setItem('mc_token', token);
        localStorage.setItem('mc_user', JSON.stringify(userData));
        setUser(userData);
    }, []);

    const signOut = useCallback(() => {
        localStorage.removeItem('mc_token');
        localStorage.removeItem('mc_user');
        setUser(null);
    }, []);

    return (
        <AuthContext.Provider value={{ user, signIn, signOut, isAuthenticated: !!user }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
