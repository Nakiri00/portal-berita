import axios from 'axios';

// Buat instance axios
const api = axios.create({
  baseURL: 'http://localhost:5000/api', // Sesuaikan port backend Anda
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor untuk menyisipkan Token di setiap request
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

export default api;