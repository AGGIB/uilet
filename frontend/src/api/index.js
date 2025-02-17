import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Интерцептор для обработки ошибок
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response) {
            // Показываем ошибку пользователю
            const message = error.response.data.error || 'Произошла ошибка';
            // Здесь можно добавить вызов toast или другого UI компонента для отображения ошибки
            console.error(message);
        }
        return Promise.reject(error);
    }
);

// Интерцептор для добавления токена
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export const auth = {
    signUp: (data) => api.post('/auth/sign-up', data),
    signIn: (data) => api.post('/auth/sign-in', data),
    getProfile: () => api.get('/api/user/profile'),
};

export default api; 