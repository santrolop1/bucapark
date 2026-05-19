import { useEffect } from 'react';
import axiosClient from './api/axiosClient';
import { AuthProvider } from "./contexts/AuthContext";
import AppRouter from "./routes/AppRouter";

// Render free tier duerme después de 15 min sin tráfico.
// Pingar cada 14 min mantiene los servicios despiertos mientras la app está abierta.
const PING_INTERVAL_MS = 14 * 60 * 1000;

const pingServices = () => axiosClient.get('status').catch(() => {});

function App() {
  useEffect(() => {
    // Primer ping inmediato al cargar
    pingServices();

    // Pings periódicos para mantener servicios despiertos
    const interval = setInterval(pingServices, PING_INTERVAL_MS);

    // Re-pingar cuando el usuario vuelve al tab después de haberlo dejado
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') pingServices();
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  return (
    <AuthProvider>
      <AppRouter />
    </AuthProvider>
  );
}

export default App;
