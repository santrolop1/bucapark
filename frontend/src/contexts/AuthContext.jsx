import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authService } from '../api/services';

const AuthContext = createContext(null);

const TOKEN_KEY = 'bucapark_token';
const USER_KEY = 'bucapark_user';

const isTokenExpired = (token) => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp * 1000 < Date.now();
  } catch {
    return true;
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true); // true mientras hidrata desde localStorage

  // Hidrata sesión al montar — dos fases para no bloquear la UI
  useEffect(() => {
    const hydrate = async () => {
      const storedToken = localStorage.getItem(TOKEN_KEY);

      if (!storedToken) {
        setLoading(false);
        return;
      }

      // Expiración local — descarta inmediatamente sin llamar al backend
      if (isTokenExpired(storedToken)) {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
        setLoading(false);
        return;
      }

      // FASE 1: restaurar desde caché → UI se muestra de inmediato
      console.log('[AUTH] token encontrado');
      const raw = localStorage.getItem(USER_KEY);
      if (raw) {
        try {
          setToken(storedToken);
          setUser(JSON.parse(raw));
        } catch {
          localStorage.removeItem(USER_KEY);
        }
      }
      setLoading(false); // renderiza sin esperar al backend

      // FASE 2: validar contra el backend en segundo plano (no bloquea)
      try {
        const res = await authService.me();
        const userData = res.data?.data?.user || res.data?.data || res.data || null;
        if (userData) {
          console.log('[AUTH] usuario recuperado', userData);
          localStorage.setItem(USER_KEY, JSON.stringify(userData));
          setUser(userData);
        }
      } catch (err) {
        if (err.response?.status === 401) {
          // Token rechazado por el backend — limpiar sesión
          console.log('[AUTH] token inválido');
          localStorage.removeItem(TOKEN_KEY);
          localStorage.removeItem(USER_KEY);
          setToken(null);
          setUser(null);
        }
        // Otros errores (red, backend durmiendo): mantener sesión del caché
      }
    };

    hydrate();
  }, []);

  const _saveSession = useCallback((newToken, newUser) => {
    localStorage.setItem(TOKEN_KEY, newToken);
    localStorage.setItem(USER_KEY, JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
  }, []);

  const login = useCallback(async ({ email, password }) => {
    const res = await authService.login({ email, password });
    const { token: newToken, user: newUser } = res.data.data;
    _saveSession(newToken, newUser);
    return newUser;
  }, [_saveSession]);

  const register = useCallback(async ({ nombre, email, password }) => {
    const res = await authService.register({ nombre, email, password });
    const { token: newToken, user: newUser } = res.data.data;
    _saveSession(newToken, newUser);
    return newUser;
  }, [_saveSession]);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setToken(null);
    setUser(null);
  }, []);

  // Limpia sesión si el token vence mientras la app está abierta
  useEffect(() => {
    if (!token) return;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const msLeft = payload.exp * 1000 - Date.now();
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (msLeft <= 0) { logout(); return; }
      const timer = setTimeout(logout, msLeft);
      return () => clearTimeout(timer);
    } catch {
      logout();
    }
  }, [token, logout]);

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return ctx;
};
