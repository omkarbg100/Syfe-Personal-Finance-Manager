import { useState, useEffect } from 'react';
import api from '../services/api';
import { AuthContext } from './AuthContextValue';

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState({ demo: true });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            // Assume valid for now, in a real app we might fetch user profile
            setUser({ token });
        } else {
            setUser({ demo: true });
        }
        setLoading(false);
    }, []);

    const login = async (username, password) => {
        const res = await api.post('/auth/login', { username, password });
        localStorage.setItem('token', res.data.token);
        setUser({ token: res.data.token });
    };

    const register = async (username, password, fullName, phoneNumber) => {
        const res = await api.post('/auth/register', { username, password, fullName, phoneNumber });
        localStorage.setItem('token', res.data.token);
        setUser({ token: res.data.token });
    };

    const logout = async () => {
        try {
            await api.post('/auth/logout');
        } catch {
            // This API uses stateless JWT logout, so local cleanup still completes.
        } finally {
            localStorage.removeItem('token');
            setUser({ demo: true });
        }
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};
