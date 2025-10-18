import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000',  // Adjust if your backend runs on a different port/URL
  timeout: 10000,
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

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      // Optionally trigger a redirect or event here
    }
    return Promise.reject(error);
  }
);

export default api;