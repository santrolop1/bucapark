// src/pages/DashboardPage.jsx
// BUCAPARK Dashboard — conectado al backend real

import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { parkService, eventService, reservationService, incidentService } from '../api/services';
import {
  TreePine, Calendar, AlertTriangle, MapPin, Plus, Bell, Search,
  LogOut, ChevronRight, TrendingUp, Users, Clock, CheckCircle2,
  MoreHorizontal, Filter, ArrowUpRight, Leaf,
} from 'lucide-react';

// ─── Textos editables ─────────────────────────────────────────────────────────
// Cambiá cualquier texto de la UI aquí, sin tocar el JSX.
const TEXTS = {
  brandLine1: 'BUCA',
  brandLine2: 'PARK',
  navGreeting: 'Buenos días,',
  dashboardLabel: 'Dashboard',
  heroTitle2: 'bienvenido al',
  heroTitle3: 'panel',
  heroFallbackDesc: 'No hay datos de actividad reciente.',
  parksSection: 'Parques',
  eventsSection: 'Próximos eventos',
  eventsViewAll: 'Ver todos',
  activitySection: 'Actividad',
  actionsSection: 'Acciones',
  calendarLabel: 'Calendario',
  calendarFooter: 'Hoy',
  parksError: 'No se pudieron cargar los parques.',
  parksRetry: 'Reintentar',
  parksEmpty: 'No hay parques registrados todavía.',
  eventsEmpty: 'No hay eventos próximos.',
  // Tabs de filtro de parques
  tabAll: 'Todos',
  tabActive: 'Abiertos',
  tabMaintenance: 'Mtto.',
};

// ─── Config visual de stats ───────────────────────────────────────────────────
// Valores reales se computan en el componente desde el backend.
// mockValue y mockTrend son el fallback cuando el dato no está disponible.
const STATS_CONFIG = [
  {
    key: 'parques',
    label: 'Parques activos',
    icon: TreePine,
    color: 'from-[#2d4a3e] to-[#3d5a4e]',
    textColor: 'text-white',
    accent: '#8bc34a',
    mockValue: 0,
    mockTrend: '—',
  },
  {
    key: 'reservas',
    label: 'Mis reservas',
    icon: Calendar,
    color: 'from-[#f4f7f0] to-[#e8ece4]',
    textColor: 'text-[#1a332a]',
    accent: '#2d4a3e',
    mockValue: 0,      // mock — no hay endpoint de "reservas hoy"
    mockTrend: '—',
  },
  {
    key: 'incidencias',
    label: 'Incidencias',
    icon: AlertTriangle,
    color: 'from-[#fff3e0] to-[#ffe0b2]',
    textColor: 'text-[#e65100]',
    accent: '#ff9800',
    mockValue: 0,      // mock — se puede conectar a incidentService.getMine()
    mockTrend: '—',
  },
  {
    key: 'eventos',
    label: 'Eventos activos',
    icon: Users,
    color: 'from-[#e8f5e9] to-[#c8e6c9]',
    textColor: 'text-[#2e7d32]',
    accent: '#4caf50',
    mockValue: 0,
    mockTrend: '—',
  },
];

// ─── Botones de acción rápida ─────────────────────────────────────────────────
// Para agregar una acción, agregá un objeto aquí.
// `to` es la ruta React Router. Rutas sin página aún van a NotFoundPage.
const ACTIONS = [
  {
    id: 1,
    label: 'Nueva reserva',
    icon: Plus,
    color: 'bg-[#2d4a3e] text-white',
    desc: 'Reservar espacio',
    to: '/reservations/new',
  },
  {
    id: 2,
    label: 'Reportar',
    icon: AlertTriangle,
    color: 'bg-[#fff3e0] text-[#e65100]',
    desc: 'Incidencia',
    to: '/incidents/new',
  },
  {
    id: 3,
    label: 'Crear evento',
    icon: Calendar,
    color: 'bg-[#e8f5e9] text-[#2e7d32]',
    desc: 'Nuevo evento',
    to: '/events/new',
  },
  {
    id: 4,
    label: 'Ver parques',
    icon: MapPin,
    color: 'bg-[#e3f2fd] text-[#1565c0]',
    desc: 'Explorar',
    to: '/parks',
  },
];

// ─── Tabs de filtro ───────────────────────────────────────────────────────────
const TAB_OPTIONS = [
  { key: 'todos', label: TEXTS.tabAll },
  { key: 'activo', label: TEXTS.tabActive },
  { key: 'mantenimiento', label: TEXTS.tabMaintenance },
];

// ─── Colores de imagen por índice ─────────────────────────────────────────────
const PARK_COLORS = ['bg-[#4a6741]', 'bg-[#5a7a6b]', 'bg-[#6b8a7a]', 'bg-[#4a5d41]'];
const EVENT_COLORS = ['#8bc34a', '#ff9800', '#f44336', '#2196f3'];

// ─── Mapeo de datos del backend al formato de display ─────────────────────────

// Convierte un parque real del backend al formato que espera la UI
// Normaliza estado a minúsculas para comparación consistente
const mapPark = (park, index) => ({
  id: park._id || index,
  nombre: park.nombre || 'Parque',
  direccion: park.direccion || 'Bucaramanga',
  ciudad: park.ciudad || '',
  estado: (park.estado || 'activo').toLowerCase(),
  capacidad: park.capacidad || 100,
  imagen: PARK_COLORS[index % PARK_COLORS.length],
});

// Formatea la fecha de un evento para mostrar "Hoy", "Mañana" o "Vie 16"
const formatEventDate = (fechaStr) => {
  if (!fechaStr) return 'Próximo';
  const fecha = new Date(fechaStr);
  const hoy = new Date();
  const manana = new Date(hoy);
  manana.setDate(manana.getDate() + 1);
  if (fecha.toDateString() === hoy.toDateString()) return 'Hoy';
  if (fecha.toDateString() === manana.toDateString()) return 'Mañana';
  return fecha.toLocaleDateString('es-CO', { weekday: 'short', day: 'numeric' });
};

// Convierte un evento real del backend al formato que espera la UI
const mapEvent = (event, index, parkNameById = {}) => ({
  id: event.id || event._id || index,
  nombre: event.nombre || event.titulo || 'Evento',
  parque: parkNameById[event.parkId] || event.parque?.nombre || event.parque || 'Parque municipal',
  fecha: formatEventDate(event.fecha),
  hora: event.hora || event.horaInicio || '10:00 AM',
  estado:
    event.estado === 'Aprobado'
      ? 'confirmado'
      : event.estado === 'Rechazado'
        ? 'rechazado'
        : 'pendiente',
  asistentes: event.inscritos || event.asistentes || 0,
  color: EVENT_COLORS[index % EVENT_COLORS.length],
});

const getTimestamp = (value) => {
  const date = value ? new Date(value) : null;
  return date && !Number.isNaN(date.getTime()) ? date.getTime() : 0;
};

const formatRelativeTime = (value) => {
  const timestamp = getTimestamp(value);
  if (!timestamp) return 'Reciente';
  const diffMinutes = Math.round((Date.now() - timestamp) / 60000);
  if (diffMinutes < 1) return 'Hace unos segundos';
  if (diffMinutes < 60) return `Hace ${diffMinutes} min`;
  const diffHours = Math.round(diffMinutes / 60);
  if (diffHours < 24) return `Hace ${diffHours} hora${diffHours === 1 ? '' : 's'}`;
  const diffDays = Math.round(diffHours / 24);
  return `Hace ${diffDays} día${diffDays === 1 ? '' : 's'}`;
};

// ─── Componentes auxiliares ───────────────────────────────────────────────────

const StatusBadge = ({ estado }) => {
  const styles = {
    activo:        'bg-[#e8f5e9] text-[#2e7d32] border-[#c8e6c9]',
    mantenimiento: 'bg-[#fff3e0] text-[#e65100] border-[#ffe0b2]',
    confirmado:    'bg-[#e8f5e9] text-[#2e7d32] border-[#c8e6c9]',
    pendiente:     'bg-[#fff8e1] text-[#f9a825] border-[#ffecb3]',
    lleno:         'bg-[#ffebee] text-[#c62828] border-[#ffcdd2]',
    rechazado:     'bg-[#ffebee] text-[#c62828] border-[#ffcdd2]',
  };
  const labels = {
    activo: 'Abierto', mantenimiento: 'Mantenimiento',
    confirmado: 'Confirmado', pendiente: 'Pendiente',
    lleno: 'Lleno', rechazado: 'Rechazado',
  };
  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${styles[estado] || styles.pendiente}`}>
      {labels[estado] || estado}
    </span>
  );
};

// ─── Componente principal ─────────────────────────────────────────────────────
const DashboardPage = () => {
  // ── Auth real ──────────────────────────────────────────────────
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Deriva datos del usuario para mostrar en la UI
  const userDisplay = {
    nombre:    user?.nombre?.split(' ')[0] || 'Usuario',
    rol:       user?.rol === 'admin'    ? 'Administrador'
             : user?.rol === 'operario' ? 'Operario'
             : 'Ciudadano',
    // Iniciales para el avatar (ej. "SR" de "Santiago Rincón")
    avatar:    user?.nombre
      ? user.nombre.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
      : 'U',
  };

  const handleLogout = () => {
    logout();
    navigate('/', { replace: true });
  };

  // ── Estado local ───────────────────────────────────────────────
  const [parks,            setParks]            = useState([]);
  const [events,           setEvents]           = useState([]); // eventos públicos
  const [myEvents,         setMyEvents]         = useState([]); // eventos del usuario
  const [incidents,        setIncidents]        = useState([]);
  const [parksLoading,     setParksLoading]     = useState(true);
  const [eventsLoading,    setEventsLoading]    = useState(true);
  const [myEventsLoading,  setMyEventsLoading]  = useState(true);
  const [incidentsLoading, setIncidentsLoading] = useState(true);
  const [myReservationsLoading, setMyReservationsLoading] = useState(true);
  const [parksError,       setParksError]       = useState(null);
  const [myReservations,   setMyReservations]   = useState([]);
  const [activeTab,        setActiveTab]        = useState('todos');
  const [searchOpen,       setSearchOpen]       = useState(false);

  // ── Fetch parques ──────────────────────────────────────────────
  const fetchParks = useCallback(async () => {
    setParksLoading(true);
    setParksError(null);
    try {
      const res = await parkService.getAll();
      const data = res.data?.data ?? res.data ?? [];
      setParks(Array.isArray(data) ? data : []);
    } catch (err) {
      setParksError(TEXTS.parksError);
      console.error('Dashboard — error cargando parques:', err);
    } finally {
      setParksLoading(false);
    }
  }, []);

  // ── Fetch eventos públicos ─────────────────────────────────────
  const fetchEvents = useCallback(async () => {
    setEventsLoading(true);
    try {
      const res = await eventService.getPublic();
      const data = res.data?.data ?? res.data ?? [];
      setEvents(Array.isArray(data) ? data : []);
    } catch (err) {
      console.warn('Dashboard — no se pudieron cargar los eventos públicos:', err);
      setEvents([]);
    } finally {
      setEventsLoading(false);
    }
  }, []);

  const fetchMyEvents = useCallback(async () => {
    setMyEventsLoading(true);
    try {
      const res = await eventService.getMine();
      const data = res.data?.data ?? res.data ?? [];
      setMyEvents(Array.isArray(data) ? data : []);
    } catch (err) {
      console.warn('Dashboard — no se pudieron cargar mis eventos:', err);
      setMyEvents([]);
    } finally {
      setMyEventsLoading(false);
    }
  }, []);

  const fetchIncidents = useCallback(async () => {
    setIncidentsLoading(true);
    try {
      const res = await incidentService.getMine();
      const data = res.data?.data ?? res.data ?? [];
      setIncidents(Array.isArray(data) ? data : []);
    } catch (err) {
      console.warn('Dashboard — no se pudieron cargar mis incidencias:', err);
      setIncidents([]);
    } finally {
      setIncidentsLoading(false);
    }
  }, []);

  // ── Fetch mis reservas ───────────────────────────────────────
  const fetchMyReservations = useCallback(async () => {
    setMyReservationsLoading(true);
    try {
      const res = await reservationService.getMine();
      const data = res.data?.data ?? res.data ?? [];
      setMyReservations(Array.isArray(data) ? data : []);
    } catch (err) {
      console.warn('Dashboard — no se pudieron cargar mis reservas:', err);
      setMyReservations([]);
    } finally {
      setMyReservationsLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchParks();
      fetchEvents();
      fetchMyEvents();
      fetchIncidents();
      fetchMyReservations();
    }, 0);
    return () => clearTimeout(timer);
  }, [fetchParks, fetchEvents, fetchMyEvents, fetchIncidents, fetchMyReservations]);

  // ── Datos derivados ────────────────────────────────────────────

  // Parques mapeados al formato de display
  const displayParks = parks.map(mapPark);
  const parkNameById = parks.reduce((acc, park) => {
    if (park?._id && park?.nombre) acc[park._id] = park.nombre;
    return acc;
  }, {});

  // Eventos mapeados al formato de display (máximo 4)
  const displayEvents = events.slice(0, 4).map((event, index) => mapEvent(event, index, parkNameById));

  // Parques filtrados según el tab activo
  const filteredParques = activeTab === 'todos'
    ? displayParks
    : displayParks.filter((p) => p.estado === activeTab);

  // Stats: todos los contadores se derivan de datos reales del backend
  const uniqueEventCount = useMemo(() => {
    const ids = new Set();
    [...events, ...myEvents].forEach((ev) => {
      const id = ev._id ?? ev.id ?? ev.eventId ?? null;
      if (id != null) ids.add(id);
    });
    return ids.size || events.length + myEvents.length;
  }, [events, myEvents]);

  const computedStats = STATS_CONFIG.map((cfg) => ({
    ...cfg,
    value: cfg.key === 'parques'
      ? parks.filter((p) => (p.estado || '').toLowerCase() === 'activo').length
      : cfg.key === 'eventos'
      ? uniqueEventCount
      : cfg.key === 'reservas'
      ? myReservations.length
      : cfg.key === 'incidencias'
      ? incidents.length
      : cfg.mockValue,
    trend: cfg.mockTrend,
    loading: cfg.key === 'parques'
      ? parksLoading
      : cfg.key === 'eventos'
      ? eventsLoading || myEventsLoading
      : cfg.key === 'reservas'
      ? myReservationsLoading
      : cfg.key === 'incidencias'
      ? incidentsLoading
      : false,
  }));

  const activityItems = useMemo(() => {
    const items = [];

    incidents.forEach((inc, i) => {
      const title = inc.titulo || inc.descripcion || inc.tipo || 'Incidencia reportada';
      const state = inc.estado ? inc.estado.toString() : 'Pendiente';
      const timestamp = getTimestamp(inc.createdAt || inc.fecha || inc.fechaCreacion || inc.fechaReporte);
      items.push({
        id: `inc-${inc._id || i}`,
        texto: `[INCIDENTE] ${title} • ${state}`,
        tiempo: formatRelativeTime(timestamp),
        icon: AlertTriangle,
        color: '#ff9800',
        timestamp,
      });
    });

    myEvents.forEach((ev, i) => {
      const title = ev.nombre || ev.titulo || 'Evento';
      const timestamp = getTimestamp(ev.createdAt || ev.fecha || ev.fechaInicio);
      items.push({
        id: `ev-${ev._id || i}`,
        texto: `[EVENTO] ${title}`,
        tiempo: formatRelativeTime(timestamp),
        icon: Calendar,
        color: EVENT_COLORS[i % EVENT_COLORS.length],
        timestamp,
      });
    });

    myReservations.forEach((res, i) => {
      const title = res.espacio || res.tipo || res.pista || 'Reserva';
      const timestamp = getTimestamp(res.createdAt || res.fecha || res.fechaInicio || res.hora);
      items.push({
        id: `res-${res._id || i}`,
        texto: `[RESERVA] ${title}`,
        tiempo: formatRelativeTime(timestamp),
        icon: CheckCircle2,
        color: '#4a6741',
        timestamp,
      });
    });

    return items
      .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0))
      .slice(0, 5);
  }, [incidents, myEvents, myReservations]);

  // Mes y año actuales para el mini-calendario
  const now = new Date();
  const calendarMonth = now.toLocaleDateString('es-CO', { month: 'long', year: 'numeric' });
  const diasEnMes = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const hoyDia = now.getDate();

  return (
    <div className="min-h-screen bg-[#f4f7f0] text-[#1a332a]">

      {/* ── Navbar ── */}
      <nav className="bg-white border-b border-[#e0e8db] sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">

            {/* Logo */}
            <Link to="/" className="flex items-center gap-3">
              <div className="h-9 w-9 bg-[#2d4a3e] rounded-lg flex items-center justify-center">
                <TreePine className="h-5 w-5 text-[#8bc34a]" />
              </div>
              <div className="leading-none">
                <span className="text-lg font-black tracking-tight">{TEXTS.brandLine1}</span>
                <span className="text-lg font-black tracking-tight text-[#8bc34a]">{TEXTS.brandLine2}</span>
              </div>
            </Link>

            {/* Saludo — visible solo en desktop */}
            <div className="hidden md:flex items-center gap-2 text-sm">
              <span className="text-[#a8b5a0]">{TEXTS.navGreeting}</span>
              <span className="font-bold">{userDisplay.nombre}</span>
              <span className="text-[#8a9e93] text-xs">({userDisplay.rol})</span>
              <Leaf className="h-3.5 w-3.5 text-[#8bc34a]" />
            </div>

            {/* Acciones de la navbar */}
            <div className="flex items-center gap-2">
              {/* Búsqueda expandible */}
              <AnimatePresence>
                {searchOpen && (
                  <motion.div
                    initial={{ width: 0, opacity: 0 }}
                    animate={{ width: 200, opacity: 1 }}
                    exit={{ width: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <input
                      type="text"
                      placeholder="Buscar..."
                      className="w-full px-3 py-1.5 bg-[#f8faf6] border border-[#e0e8db] rounded-lg text-sm outline-none focus:border-[#8bc34a]"
                      autoFocus
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              <button
                onClick={() => setSearchOpen((v) => !v)}
                className="p-2 hover:bg-[#f8faf6] rounded-lg transition-colors"
                aria-label="Buscar"
              >
                <Search className="h-5 w-5 text-[#5a6b5f]" />
              </button>

              {/* Notificaciones */}
              <button className="p-2 hover:bg-[#f8faf6] rounded-lg transition-colors" aria-label="Notificaciones">
                <Bell className="h-5 w-5 text-[#5a6b5f]" />
              </button>

              {/* Avatar + logout */}
              <div className="flex items-center gap-2 ml-2 pl-2 border-l border-[#e0e8db]">
                <div className="h-8 w-8 bg-[#2d4a3e] rounded-full flex items-center justify-center text-white text-xs font-bold select-none">
                  {userDisplay.avatar}
                </div>
                <motion.button
                  onClick={handleLogout}
                  className="p-1.5 hover:bg-[#ffebee] rounded-lg transition-colors group"
                  whileTap={{ scale: 0.9 }}
                  aria-label="Cerrar sesión"
                  title="Cerrar sesión"
                >
                  <LogOut className="h-4 w-4 text-[#a8b5a0] group-hover:text-[#f44336] transition-colors" />
                </motion.button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* ── Hero / encabezado ── */}
        <motion.section
          className="mb-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-3">
                <div className="h-px w-8 bg-[#8bc34a]" />
                <span className="text-xs font-bold text-[#8bc34a] uppercase tracking-widest">
                  {TEXTS.dashboardLabel}
                </span>
              </div>
              <h1 className="text-4xl lg:text-5xl font-black leading-[0.95] tracking-tight mb-3">
                {TEXTS.navGreeting}<br />
                <span className="text-[#2d4a3e]">{userDisplay.nombre}</span>
              </h1>
              <p className="text-[#5a6b5f] text-lg max-w-md leading-relaxed">
                {parks.length > 0 || parksLoading ? (
                  <>
                    Hay{' '}
                    <span className="font-bold text-[#1a332a]">
                      {parks.filter((p) => (p.estado || '').toLowerCase() === 'activo').length} parques abiertos
                    </span>
                    <span className="text-[#7a8a7f]"> de {parks.length}</span>
                    {events.length > 0 && (
                      <> y{' '}
                        <span className="font-bold text-[#8bc34a]">
                          {events.length} eventos
                        </span>{' '}próximos
                      </>
                    )}.
                  </>
                ) : (
                  TEXTS.heroFallbackDesc
                )}
              </p>
            </div>

            {/* Acciones rápidas del hero */}
            <div className="flex flex-wrap gap-2 lg:gap-3">
              {ACTIONS.slice(0, 3).map((accion) => (
                <motion.div key={accion.id} whileHover={{ y: -2 }} whileTap={{ scale: 0.95 }}>
                  <Link
                    to={accion.to}
                    className={`${accion.color} px-4 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 shadow-sm hover:shadow-md transition-shadow`}
                  >
                    <accion.icon className="h-4 w-4" />
                    <span className="hidden sm:inline">{accion.label}</span>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* ── Stats ── */}
        <section className="mb-10">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
            {computedStats.map((stat, i) => (
              <motion.div
                key={stat.key}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                whileHover={{ y: -3 }}
                className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${stat.color} p-5 lg:p-6 ${stat.textColor} shadow-sm hover:shadow-lg transition-shadow`}
              >
                {/* Ícono decorativo grande */}
                <stat.icon
                  className="absolute -right-2 -top-2 h-16 w-16 opacity-10"
                  style={{ color: stat.accent }}
                />
                <div className="relative">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold uppercase tracking-wider opacity-70">
                      {stat.label}
                    </span>
                    <div
                      className="h-8 w-8 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: `${stat.accent}20` }}
                    >
                      <stat.icon className="h-4 w-4" style={{ color: stat.accent }} />
                    </div>
                  </div>
                  <div className="flex items-end gap-2">
                    <span className="text-3xl lg:text-4xl font-black tracking-tight">
                      {stat.loading ? '…' : stat.value}
                    </span>
                    <span className="text-xs font-bold mb-1.5 opacity-60 flex items-center gap-0.5">
                      <TrendingUp className="h-3 w-3" />
                      {stat.trend}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">

          {/* ── Columna izquierda: parques + eventos ── */}
          <div className="lg:col-span-2 space-y-8">

            {/* Sección parques */}
            <section>
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                  <h2 className="text-xl font-black">{TEXTS.parksSection}</h2>
                  {/* Tabs de filtro */}
                  <div className="flex gap-1">
                    {TAB_OPTIONS.map((tab) => (
                      <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                          activeTab === tab.key
                            ? 'bg-[#2d4a3e] text-white'
                            : 'bg-[#f8faf6] text-[#a8b5a0] hover:text-[#5a6b5f]'
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>
                </div>
                <Link to="/parks">
                  <Filter className="h-4 w-4 text-[#a8b5a0] hover:text-[#5a6b5f] transition-colors" />
                </Link>
              </div>

              {/* Error al cargar parques */}
              {parksError && (
                <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-5 py-4 mb-4 flex items-center justify-between">
                  <span className="text-sm font-medium">{parksError}</span>
                  <button
                    onClick={fetchParks}
                    className="text-sm font-bold bg-red-100 hover:bg-red-200 px-3 py-1.5 rounded-lg transition-colors"
                  >
                    {TEXTS.parksRetry}
                  </button>
                </div>
              )}

              {/* Skeletons mientras carga */}
              {parksLoading && (
                <div className="grid sm:grid-cols-2 gap-4">
                  {[1, 2, 3, 4].map((n) => (
                    <div key={n} className="bg-white rounded-2xl border border-[#e0e8db] overflow-hidden">
                      <motion.div
                        className="h-32 bg-[#e8ece4]"
                        animate={{ opacity: [0.4, 0.7, 0.4] }}
                        transition={{ duration: 2, repeat: Infinity, delay: n * 0.15 }}
                      />
                      <div className="p-4 space-y-2">
                        <motion.div className="h-5 bg-[#e8ece4] rounded w-3/4"
                          animate={{ opacity: [0.4, 0.6, 0.4] }}
                          transition={{ duration: 2, repeat: Infinity, delay: n * 0.15 + 0.1 }}
                        />
                        <motion.div className="h-4 bg-[#e8ece4] rounded w-1/2"
                          animate={{ opacity: [0.4, 0.6, 0.4] }}
                          transition={{ duration: 2, repeat: Infinity, delay: n * 0.15 + 0.2 }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Grid de parques reales */}
              {!parksLoading && !parksError && (
                <>
                  {filteredParques.length === 0 ? (
                    <p className="text-[#a8b5a0] text-sm py-8 text-center">{TEXTS.parksEmpty}</p>
                  ) : (
                    <div className="grid sm:grid-cols-2 gap-4">
                      <AnimatePresence mode="popLayout">
                        {filteredParques.map((parque, i) => (
                          <motion.div
                            key={parque.id}
                            layout
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={{ duration: 0.3, delay: i * 0.05 }}
                            whileHover={{ y: -4 }}
                            className="bg-white rounded-2xl border border-[#e0e8db] overflow-hidden hover:border-[#8bc34a] hover:shadow-lg transition-all group"
                          >
                            {/* Header de color */}
                            <div className={`${parque.imagen} h-32 relative overflow-hidden`}>
                              <TreePine className="absolute right-4 bottom-4 h-20 w-20 text-white opacity-20" />
                              <div className="absolute top-4 left-4">
                                <StatusBadge estado={parque.estado} />
                              </div>
                            </div>

                            <div className="p-4">
                              <div className="flex items-start justify-between mb-2">
                                <div>
                                  <h3 className="font-bold text-lg text-[#1a332a] group-hover:text-[#2d4a3e] transition-colors">
                                    {parque.nombre}
                                  </h3>
                                  <p className="text-xs text-[#a8b5a0] flex items-center gap-1 mt-0.5">
                                    <MapPin className="h-3 w-3" />
                                    {parque.direccion}{parque.ciudad ? `, ${parque.ciudad}` : ''}
                                  </p>
                                </div>
                                <Link to={`/parks/${parque.id}`}>
                                  <MoreHorizontal className="h-4 w-4 text-[#a8b5a0] hover:text-[#5a6b5f] transition-colors" />
                                </Link>
                              </div>

                              <div className="mt-4 pt-3 border-t border-[#f8faf6]">
                                <span className="text-xs font-bold text-[#5a6b5f]">
                                  Capacidad: {parque.capacidad}
                                </span>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>
                  )}
                </>
              )}
            </section>

            {/* Sección eventos */}
            <section>
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-xl font-black">{TEXTS.eventsSection}</h2>
                <Link
                  to="/events"
                  className="text-sm font-bold text-[#8bc34a] hover:text-[#2d4a3e] transition-colors flex items-center gap-1"
                >
                  {TEXTS.eventsViewAll} <ChevronRight className="h-4 w-4" />
                </Link>
              </div>

              <div className="bg-white rounded-2xl border border-[#e0e8db] overflow-hidden">
                {eventsLoading ? (
                  /* Skeleton de eventos */
                  [1, 2, 3].map((n) => (
                    <div key={n} className="flex items-center gap-4 p-4 border-b border-[#f8faf6]">
                      <motion.div className="h-14 w-14 bg-[#e8ece4] rounded-xl flex-shrink-0"
                        animate={{ opacity: [0.4, 0.7, 0.4] }}
                        transition={{ duration: 2, repeat: Infinity, delay: n * 0.1 }}
                      />
                      <div className="flex-1 space-y-2">
                        <motion.div className="h-4 bg-[#e8ece4] rounded w-3/4"
                          animate={{ opacity: [0.4, 0.6, 0.4] }}
                          transition={{ duration: 2, repeat: Infinity, delay: n * 0.1 + 0.1 }}
                        />
                        <motion.div className="h-3 bg-[#e8ece4] rounded w-1/2"
                          animate={{ opacity: [0.4, 0.6, 0.4] }}
                          transition={{ duration: 2, repeat: Infinity, delay: n * 0.1 + 0.2 }}
                        />
                      </div>
                    </div>
                  ))
                ) : displayEvents.length === 0 ? (
                  <p className="text-[#a8b5a0] text-sm py-10 text-center">{TEXTS.eventsEmpty}</p>
                ) : (
                  displayEvents.map((evento, i) => (
                    <motion.div
                      key={evento.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.4, delay: i * 0.1 }}
                      className={`flex items-center gap-4 p-4 ${
                        i !== displayEvents.length - 1 ? 'border-b border-[#f8faf6]' : ''
                      } hover:bg-[#f8faf6] transition-colors group cursor-pointer`}
                    >
                      {/* Caja de fecha */}
                      <div
                        className="h-14 w-14 rounded-xl flex flex-col items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: `${evento.color}15` }}
                      >
                        <span className="text-xs font-bold" style={{ color: evento.color }}>
                          {evento.fecha}
                        </span>
                        <span className="text-[10px] font-medium text-[#a8b5a0]">{evento.hora}</span>
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <h4 className="font-bold text-[#1a332a] truncate">{evento.nombre}</h4>
                          <StatusBadge estado={evento.estado} />
                        </div>
                        <p className="text-xs text-[#a8b5a0] flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {evento.parque}
                        </p>
                      </div>

                      <div className="flex items-center gap-1.5 text-sm text-[#5a6b5f]">
                        <Users className="h-4 w-4" />
                        <span className="font-bold">{evento.asistentes}</span>
                      </div>

                      <ArrowUpRight className="h-4 w-4 text-[#e0e8db] group-hover:text-[#8bc34a] transition-colors" />
                    </motion.div>
                  ))
                )}
              </div>
            </section>

            <section>
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-xl font-black">Incidencias recientes</h2>
              </div>

              <div className="bg-white rounded-2xl border border-[#e0e8db] overflow-hidden">
                {incidentsLoading ? (
                  [1, 2, 3].map((n) => (
                    <div key={n} className="flex items-center gap-4 p-4 border-b border-[#f8faf6]">
                      <motion.div className="h-12 w-12 bg-[#e8ece4] rounded-xl flex-shrink-0"
                        animate={{ opacity: [0.4, 0.7, 0.4] }}
                        transition={{ duration: 2, repeat: Infinity, delay: n * 0.1 }}
                      />
                      <div className="flex-1 space-y-2">
                        <motion.div className="h-4 bg-[#e8ece4] rounded w-3/4"
                          animate={{ opacity: [0.4, 0.6, 0.4] }}
                          transition={{ duration: 2, repeat: Infinity, delay: n * 0.1 + 0.1 }}
                        />
                        <motion.div className="h-3 bg-[#e8ece4] rounded w-1/2"
                          animate={{ opacity: [0.4, 0.6, 0.4] }}
                          transition={{ duration: 2, repeat: Infinity, delay: n * 0.1 + 0.2 }}
                        />
                      </div>
                    </div>
                  ))
                ) : incidents.length === 0 ? (
                  <p className="text-[#a8b5a0] text-sm py-10 text-center">No hay incidencias registradas.</p>
                ) : (
                  incidents.slice(0, 3).map((inc, i) => (
                    <motion.div
                      key={inc._id || i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: i * 0.08 }}
                      className={`flex items-center gap-4 p-4 ${
                        i !== incidents.slice(0, 3).length - 1 ? 'border-b border-[#f8faf6]' : ''
                      }`}
                    >
                      <div className="h-12 w-12 rounded-xl bg-[#fff3e0] flex items-center justify-center">
                        <AlertTriangle className="h-5 w-5 text-[#e65100]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-[#1a332a] truncate">
                          {inc.titulo || inc.descripcion || inc.tipo || 'Incidencia'}
                        </p>
                        <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-[#5a6b5f]">
                          <StatusBadge estado={(inc.estado || '').toLowerCase()} />
                          <span>{formatRelativeTime(inc.createdAt || inc.fecha || inc.fechaCreacion || inc.fechaReporte)}</span>
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </section>
          </div>

          {/* ── Columna derecha: actividad + acciones + calendario ── */}
          <div className="space-y-8">

            {/* Actividad reciente */}
            <section>
              <h2 className="text-xl font-black mb-5">{TEXTS.activitySection}</h2>
              <div className="bg-white rounded-2xl border border-[#e0e8db] p-4">
                {eventsLoading || myEventsLoading || myReservationsLoading || incidentsLoading ? (
                  [1, 2, 3].map((n) => (
                    <div key={n} className="flex items-center gap-3 py-3 border-b border-[#f8faf6] last:border-0">
                      <motion.div className="h-8 w-8 bg-[#e8ece4] rounded-lg flex-shrink-0"
                        animate={{ opacity: [0.4, 0.7, 0.4] }}
                        transition={{ duration: 2, repeat: Infinity, delay: n * 0.1 }}
                      />
                      <motion.div className="h-4 bg-[#e8ece4] rounded w-3/4"
                        animate={{ opacity: [0.4, 0.6, 0.4] }}
                        transition={{ duration: 2, repeat: Infinity, delay: n * 0.1 + 0.1 }}
                      />
                    </div>
                  ))
                ) : activityItems.length === 0 ? (
                  <p className="text-[#a8b5a0] text-sm py-6 text-center">{TEXTS.heroFallbackDesc}</p>
                ) : (
                  activityItems.map((act, i) => (
                    <motion.div
                      key={act.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.4, delay: i * 0.08 }}
                      className={`flex items-start gap-3 py-3 ${
                        i !== activityItems.length - 1 ? 'border-b border-[#f8faf6]' : ''
                      }`}
                    >
                      <div
                        className="h-8 w-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                        style={{ backgroundColor: `${act.color}15` }}
                      >
                        <act.icon className="h-4 w-4" style={{ color: act.color }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-[#1a332a] leading-snug">{act.texto}</p>
                        <p className="text-xs text-[#a8b5a0] mt-1">{act.tiempo}</p>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </section>

            {/* Acciones rápidas */}
            <section>
              <h2 className="text-xl font-black mb-5">{TEXTS.actionsSection}</h2>
              <div className="grid grid-cols-2 gap-3">
                {ACTIONS.map((accion, i) => (
                  <motion.div
                    key={accion.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: i * 0.05 }}
                    whileHover={{ y: -2, scale: 1.02 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Link
                      to={accion.to}
                      className={`${accion.color} p-4 rounded-2xl text-left shadow-sm hover:shadow-md transition-all block`}
                    >
                      <accion.icon className="h-6 w-6 mb-3" />
                      <p className="font-bold text-sm">{accion.label}</p>
                      <p className="text-xs opacity-70 mt-0.5">{accion.desc}</p>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </section>

            {/* Mini calendario */}
            <section>
              <div className="bg-[#2d4a3e] rounded-2xl p-5 text-white">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#8bc34a] capitalize">
                    {calendarMonth}
                  </span>
                  <Calendar className="h-5 w-5 text-[#8bc34a]" />
                </div>
                <div className="grid grid-cols-7 gap-1 text-center text-xs">
                  {['L', 'M', 'X', 'J', 'V', 'S', 'D'].map((d) => (
                    <span key={d} className="text-[#8a9e93] font-bold py-1">{d}</span>
                  ))}
                  {Array.from({ length: diasEnMes }, (_, i) => i + 1).map((dia) => (
                    <span
                      key={dia}
                      className={`py-1.5 rounded-lg font-medium ${
                        dia === hoyDia
                          ? 'bg-[#8bc34a] text-[#1a332a] font-bold'
                          : 'text-[#c8ddd0]'
                      }`}
                    >
                      {dia}
                    </span>
                  ))}
                </div>
                <div className="mt-4 pt-4 border-t border-[#3d5a4e]">
                  <p className="text-xs text-[#8a9e93]">
                    {TEXTS.calendarFooter}: {events.length} eventos activos
                  </p>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
