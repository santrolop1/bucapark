import axios from 'axios';

const TOKEN_KEY = 'bucapark_token';

// En producción (Vercel) definir VITE_API_BASE_URL=https://tu-gateway.onrender.com
// En desarrollo local queda vacío y el proxy de Vite lo maneja automáticamente
const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

// Inyecta el token en cada request
axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Limpia sesión si el servidor responde 401
axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem('bucapark_user');
      // Redirige a login solo si no estamos ya ahí
      if (!window.location.pathname.startsWith('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default axiosClient;
