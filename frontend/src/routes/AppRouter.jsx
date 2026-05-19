import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import AppHeader from '../components/AppHeader';
import AdminRoute from '../components/AdminRoute';

import HomePage from '../pages/HomePage';
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import ParksPage from '../pages/ParksPage';
import ParkDetailPage from '../pages/ParkDetailPage';
import NewReservationPage from '../pages/NewReservationPage';
import EventsPage from '../pages/EventsPage';
import NewEventPage from '../pages/NewEventPage';
import NewIncidentPage from '../pages/NewIncidentPage';
import MyReservationsPage from '../pages/MyReservationsPage';
import MyEventsPage from '../pages/MyEventsPage';
import MyIncidentsPage from '../pages/MyIncidentsPage';
import DashboardPage from '../pages/DashboardPage';
import NotFoundPage from '../pages/NotFoundPage';

// Redirige a /login si no hay sesión activa
const PrivateRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();
  if (loading) return null; // espera hidratación antes de decidir
  return isAuthenticated ? children : <Navigate to="/login" replace state={{ from: location }} />;
};

// Redirige a / si ya hay sesión (evita volver al login estando logueado)
const PublicOnlyRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return null;
  return isAuthenticated ? <Navigate to="/" replace /> : children;
};

// /dashboard tiene su propio navbar interno — excluir del header global
const NO_HEADER_PATHS = ['/login', '/register', '/dashboard'];

const Layout = ({ children }) => {
  const { pathname } = useLocation();
  return (
    <>
      {!NO_HEADER_PATHS.includes(pathname) && <AppHeader />}
      {children}
    </>
  );
};

function AppRouter() {
  return (
    <BrowserRouter>
      <Layout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/parks" element={<ParksPage />} />
        <Route path="/parks/:id" element={<ParkDetailPage />} />
        <Route path="/events" element={<EventsPage />} />

        <Route
          path="/login"
          element={
            <PublicOnlyRoute>
              <LoginPage />
            </PublicOnlyRoute>
          }
        />
        <Route
          path="/register"
          element={
            <PublicOnlyRoute>
              <RegisterPage />
            </PublicOnlyRoute>
          }
        />

        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <DashboardPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/reservations/new"
          element={
            <PrivateRoute>
              <NewReservationPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/events/new"
          element={
            <PrivateRoute>
              <NewEventPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/incidents/new"
          element={
            <PrivateRoute>
              <NewIncidentPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/reservations"
          element={
            <PrivateRoute>
              <MyReservationsPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/events/my"
          element={
            <PrivateRoute>
              <MyEventsPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/incidents/my"
          element={
            <PrivateRoute>
              <MyIncidentsPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <AdminRoute allowedRoles={[ 'admin', 'operario' ]}>
              <Navigate to="/dashboard" replace />
            </AdminRoute>
          }
        />

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default AppRouter;
