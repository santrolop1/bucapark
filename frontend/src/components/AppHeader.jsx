import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const AppHeader = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="bg-white border-b border-[#e0e8db] px-6 py-3 flex items-center justify-between">
      <span className="font-black text-[#2d4a3e] tracking-tight">BUCAPARK</span>

      <div className="flex items-center gap-4">
        {user ? (
          <>
            <span className="text-sm text-[#5a6b5f] font-medium">
              Hola, {user.nombre || user.name || user.email}
            </span>
            <button
              onClick={handleLogout}
              className="text-sm font-bold text-[#2d4a3e] border-2 border-[#2d4a3e] px-4 py-1.5 rounded-lg hover:bg-[#2d4a3e] hover:text-white transition-colors"
            >
              Cerrar sesión
            </button>
          </>
        ) : (
          <button
            onClick={() => navigate('/login')}
            className="text-sm font-bold bg-[#8bc34a] text-[#1a332a] px-4 py-1.5 rounded-lg hover:bg-[#9ccc65] transition-colors"
          >
            Iniciar sesión
          </button>
        )}
      </div>
    </header>
  );
};

export default AppHeader;
