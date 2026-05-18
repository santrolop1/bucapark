import axios from 'axios';

const TOKEN_KEY = 'bucapark_token';

// En producción (Vercel): VITE_API_BASE_URL=https://gateway-3xen.onrender.com
// (con o sin /api al final — se normaliza automáticamente)
// En desarrollo local: vacío → el proxy de Vite maneja /api automáticamente
const rawBase = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/+$/, '');
const baseURL = rawBase
  ? (rawBase.endsWith('/api') ? rawBase : `${rawBase}/api`)
  : '/api';

const axiosClient = axios.create({
  baseURL,
  timeout: 60000,
  headers: { 'Content-Type': 'application/json' },
});

// Inyecta el token en cada request
axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Rutas accesibles sin sesión — un 401 aquí no debe redirigir al login
const PUBLIC_ROUTES = ['/', '/parks', '/events', '/login', '/register'];

const isPublicRoute = () =>
  PUBLIC_ROUTES.some((r) => window.location.pathname === r || window.location.pathname.startsWith(r + '/'));

// Limpia sesión si el servidor responde 401
axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem('bucapark_user');
      // Solo redirige en rutas que requieren autenticación
      if (!isPublicRoute()) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default axiosClient;
