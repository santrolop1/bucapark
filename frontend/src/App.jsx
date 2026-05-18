import { useEffect } from 'react';
import axiosClient from './api/axiosClient';
import { AuthProvider } from "./contexts/AuthContext";
import AppRouter from "./routes/AppRouter";

function App() {
  useEffect(() => {
    // Despierta los microservicios de Render en background al cargar la app
    axiosClient.get('/status').catch(() => {});
  }, []);

  return (
    <AuthProvider>
      <AppRouter />
    </AuthProvider>
  );
}

export default App;
