import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

export default api;

// Transaction CRUD helpers
export const getTransactions = () => api.get('/transactions');

export const addTransaction = (transaction) => api.post('/transactions', transaction);

export const updateTransaction = (id, transaction) => api.put(`/transactions/${id}`, transaction);

export const deleteTransaction = (id) => api.delete(`/transactions/${id}`);

