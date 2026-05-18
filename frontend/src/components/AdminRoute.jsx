import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f4f7f0] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#8bc34a] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  if (user.rol !== 'admin') return <Navigate to="/dashboard" replace />;

  return children;
};

export default AdminRoute;
