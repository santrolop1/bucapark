// src/pages/EventsPage.jsx
// ============================================================
// EVENTS PAGE - BUCAPARK
// ============================================================
// Todo el contenido editable está ARRIBA en objetos/arrays.
// Abajo solo está la UI y las animaciones.
// Fácil de editar para juniors.
// ============================================================

import { useState, useEffect, useMemo, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { eventService } from '../api/services';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Search,
  Heart,
  Share2,
  ArrowLeft,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  X,
  SlidersHorizontal,
  Grid3X3,
  List,
  Plus,
  Flame,
  Music,
  Dumbbell,
  Palette,
  BookOpen,
  TreePine,
  Sun,
} from 'lucide-react';

// ============================================================
// 1. CONTENIDO EDITABLE - Todo acá arriba
// ============================================================

// --- Textos generales ---
const TEXTS = {
  pageTitle: 'Eventos',
  pageSubtitle: 'Descubre actividades, deportes y cultura en los parques de Bucaramanga',
  backButton: 'Volver',
  searchPlaceholder: 'Buscar eventos...',
  filterAll: 'Todos',
  filterToday: 'Hoy',
  filterWeek: 'Esta semana',
  filterMonth: 'Este mes',
  categoriesTitle: 'Categorías',
  featuredTitle: 'Destacado',
  upcomingTitle: 'Próximos eventos',
  statsTitle: 'En números',
  emptyTitle: 'No se encontraron eventos',
  emptySubtitle: 'Intenta con otros filtros o búsqueda',
  emptyButton: 'Ver todos los eventos',
  loadingText: 'Cargando eventos...',
  seeMore: 'Ver más',
  seeLess: 'Ver menos',
  attendButton: 'Asistir',
  attendingButton: 'Asistiendo',
  fullButton: 'Completo',
  viewEvent: 'Ver evento',
  organizerLabel: 'Organiza',
  attendeesLabel: 'asistentes',
  spotsLeft: 'cupos',
  freeEvent: 'Gratuito',
  paidEvent: 'Pago',
};

// --- Filtros de tiempo (fácil de editar) ---
const FILTERS = [
  { id: 'all', label: TEXTS.filterAll, icon: Calendar },
  { id: 'today', label: TEXTS.filterToday, icon: Sun },
  { id: 'week', label: TEXTS.filterWeek, icon: Clock },
  { id: 'month', label: TEXTS.filterMonth, icon: Calendar },
];

// --- Categorías de eventos (fácil de editar) ---
const CATEGORIES = [
  { id: 'all', label: 'Todos', icon: Grid3X3, color: '#2d4a3e' },
  { id: 'deporte', label: 'Deporte', icon: Dumbbell, color: '#8bc34a' },
  { id: 'cultura', label: 'Cultura', icon: Palette, color: '#ff9800' },
  { id: 'musica', label: 'Música', icon: Music, color: '#e91e63' },
  { id: 'educacion', label: 'Educación', icon: BookOpen, color: '#2196f3' },
  { id: 'naturaleza', label: 'Naturaleza', icon: TreePine, color: '#4caf50' },
  { id: 'social', label: 'Social', icon: Users, color: '#9c27b0' },
];

// --- Evento destacado (fácil de editar) ---
// TODO: Reemplazar por evento destacado real cuando exista endpoint/backend.
const FEATURED_EVENT = {
  id: 0,
  nombre: 'Festival de Verano Bucaramanga',
  descripcion: 'El evento más grande del año. Música en vivo, food trucks, actividades para toda la familia y espectáculos de drones al cierre.',
  fecha: 'Sáb 20 de Julio',
  hora: '2:00 PM - 10:00 PM',
  parque: 'Parque San Pío',
  direccion: 'Carrera 27 #45-67, Centro',
  categoria: 'social',
  categoriaLabel: 'Social',
  categoriaColor: '#9c27b0',
  asistentes: 342,
  maxAsistentes: 500,
  estado: 'confirmado', // confirmado | pendiente | cancelado | completo
  estadoLabel: 'Confirmado',
  organizador: 'Alcaldía de Bucaramanga',
  precio: 'Gratuito',
  destacado: true,
  imagenColor: 'bg-[#2d4a3e]',
};

// --- Eventos (fácil de editar) ---
// TODO: Reemplazar por eventos reales al integrar con events-service.
const EVENTS = [
  {
    id: 1,
    nombre: 'Yoga al amanecer',
    descripcion: 'Sesión de yoga y meditación al aire libre. Traé tu mat y agua.',
    fecha: 'Hoy',
    fechaCompleta: '2024-07-15',
    hora: '6:00 AM',
    duracion: '1h 30min',
    parque: 'Parque San Pío',
    categoria: 'naturaleza',
    categoriaLabel: 'Naturaleza',
    categoriaColor: '#4caf50',
    asistentes: 24,
    maxAsistentes: 30,
    estado: 'confirmado',
    estadoLabel: 'Confirmado',
    organizador: 'Comunidad Zen Bucaramanga',
    precio: 'Gratuito',
    imagenColor: 'bg-[#4a6741]',
    popular: true,
  },
  {
    id: 2,
    nombre: 'Torneo Barrial Fútbol',
    descripcion: 'Cuadrangular de barrios. Entrada libre para espectadores.',
    fecha: 'Mañana',
    fechaCompleta: '2024-07-16',
    hora: '8:00 AM',
    duracion: '4h',
    parque: 'Parque de los Niños',
    categoria: 'deporte',
    categoriaLabel: 'Deporte',
    categoriaColor: '#8bc34a',
    asistentes: 156,
    maxAsistentes: 200,
    estado: 'confirmado',
    estadoLabel: 'Confirmado',
    organizador: 'Liga de Fútbol Amateur',
    precio: '$5.000',
    imagenColor: 'bg-[#5a7a6b]',
    popular: true,
  },
  {
    id: 3,
    nombre: 'Cine bajo las estrellas',
    descripcion: 'Proyección de "El Abrazo de la Serpiente". Traé silla o manta.',
    fecha: 'Vie 19',
    fechaCompleta: '2024-07-19',
    hora: '7:00 PM',
    duracion: '2h 30min',
    parque: 'Parque del Agua',
    categoria: 'cultura',
    categoriaLabel: 'Cultura',
    categoriaColor: '#ff9800',
    asistentes: 89,
    maxAsistentes: 150,
    estado: 'pendiente',
    estadoLabel: 'Pendiente',
    organizador: 'CineClub Bucaramanga',
    precio: 'Gratuito',
    imagenColor: 'bg-[#6b8a7a]',
    popular: false,
  },
  {
    id: 4,
    nombre: 'Clase de pintura al aire libre',
    descripcion: 'Taller introductorio de acuarela. Materiales incluidos.',
    fecha: 'Sáb 20',
    fechaCompleta: '2024-07-20',
    hora: '9:00 AM',
    duracion: '3h',
    parque: 'Parque San Pío',
    categoria: 'cultura',
    categoriaLabel: 'Cultura',
    categoriaColor: '#ff9800',
    asistentes: 12,
    maxAsistentes: 20,
    estado: 'confirmado',
    estadoLabel: 'Confirmado',
    organizador: 'Escuela de Artes Visuales',
    precio: '$15.000',
    imagenColor: 'bg-[#4a5d41]',
    popular: false,
  },
  {
    id: 5,
    nombre: 'Maratón 5K Nocturna',
    descripcion: 'Carrera nocturna por el centro de la ciudad. Incluye medalla.',
    fecha: 'Sáb 20',
    fechaCompleta: '2024-07-20',
    hora: '7:00 PM',
    duracion: '2h',
    parque: 'Parque del Agua',
    categoria: 'deporte',
    categoriaLabel: 'Deporte',
    categoriaColor: '#8bc34a',
    asistentes: 234,
    maxAsistentes: 300,
    estado: 'confirmado',
    estadoLabel: 'Confirmado',
    organizador: 'Runners Bucaramanga',
    precio: '$25.000',
    imagenColor: 'bg-[#5a6b4a]',
    popular: true,
  },
  {
    id: 6,
    nombre: 'Concierto de Jazz',
    descripcion: 'Noche de jazz con artistas locales. Traé tu bebida.',
    fecha: 'Dom 21',
    fechaCompleta: '2024-07-21',
    hora: '6:00 PM',
    duracion: '3h',
    parque: 'Parque de los Niños',
    categoria: 'musica',
    categoriaLabel: 'Música',
    categoriaColor: '#e91e63',
    asistentes: 67,
    maxAsistentes: 100,
    estado: 'confirmado',
    estadoLabel: 'Confirmado',
    organizador: 'Jazz Club Bucaramanga',
    precio: '$10.000',
    imagenColor: 'bg-[#6b7a5b]',
    popular: false,
  },
  {
    id: 7,
    nombre: 'Taller de jardinería urbana',
    descripcion: 'Aprendé a crear tu huerta en casa. Plantines incluidos.',
    fecha: 'Lun 22',
    fechaCompleta: '2024-07-22',
    hora: '10:00 AM',
    duracion: '2h',
    parque: 'Parque San Pío',
    categoria: 'educacion',
    categoriaLabel: 'Educación',
    categoriaColor: '#2196f3',
    asistentes: 18,
    maxAsistentes: 25,
    estado: 'confirmado',
    estadoLabel: 'Confirmado',
    organizador: 'Huertas Urbanas BGA',
    precio: '$8.000',
    imagenColor: 'bg-[#4a6741]',
    popular: false,
  },
  {
    id: 8,
    nombre: 'Encuentro de lectura',
    descripcion: 'Lectura compartida de poesía colombiana. Café incluido.',
    fecha: 'Mar 23',
    fechaCompleta: '2024-07-23',
    hora: '4:00 PM',
    duracion: '2h',
    parque: 'Parque del Agua',
    categoria: 'educacion',
    categoriaLabel: 'Educación',
    categoriaColor: '#2196f3',
    asistentes: 15,
    maxAsistentes: 30,
    estado: 'pendiente',
    estadoLabel: 'Pendiente',
    organizador: 'Biblioteca Pública',
    precio: 'Gratuito',
    imagenColor: 'bg-[#5a7a6b]',
    popular: false,
  },
  {
    id: 9,
    nombre: 'Zumba en el parque',
    descripcion: 'Clase masiva de zumba al aire libre. Traé tu botella.',
    fecha: 'Mié 24',
    fechaCompleta: '2024-07-24',
    hora: '6:00 PM',
    duracion: '1h',
    parque: 'Parque de los Niños',
    categoria: 'deporte',
    categoriaLabel: 'Deporte',
    categoriaColor: '#8bc34a',
    asistentes: 45,
    maxAsistentes: 60,
    estado: 'confirmado',
    estadoLabel: 'Confirmado',
    organizador: 'Zumba BGA Fitness',
    precio: 'Gratuito',
    imagenColor: 'bg-[#6b8a7a]',
    popular: true,
  },
];

// --- Estadísticas (fácil de editar) ---
// TODO: Reemplazar por métricas reales cuando exista endpoint agregado de eventos.
const STATS = [
  { label: 'Eventos este mes', value: 24, icon: Calendar, color: '#2d4a3e' },
  { label: 'Asistentes hoy', value: 342, icon: Users, color: '#8bc34a' },
  { label: 'Eventos gratuitos', value: 12, icon: Sparkles, color: '#ff9800' },
  { label: 'Parques activos', value: 5, icon: MapPin, color: '#2196f3' },
];

// --- Días del mini calendario (fácil de editar) ---
// TODO: Reemplazar por agenda real al conectar calendario de eventos.
const CALENDAR_DAYS = [
  { day: 'Lun', date: '15', active: true, events: 2 },
  { day: 'Mar', date: '16', active: false, events: 1 },
  { day: 'Mié', date: '17', active: false, events: 0 },
  { day: 'Jue', date: '18', active: false, events: 0 },
  { day: 'Vie', date: '19', active: false, events: 1 },
  { day: 'Sáb', date: '20', active: false, events: 3 },
  { day: 'Dom', date: '21', active: false, events: 1 },
];

// ============================================================
// 2. COMPONENTES AUXILIARES - Pequeños y reutilizables
// ============================================================

// Badge de estado para eventos
function StatusBadge({ estado, label }) {
  const styles = {
    confirmado: 'bg-[#e8f5e9] text-[#2e7d32] border-[#c8e6c9]',
    pendiente: 'bg-[#fff8e1] text-[#f9a825] border-[#ffecb3]',
    cancelado: 'bg-[#ffebee] text-[#c62828] border-[#ffcdd2]',
    completo: 'bg-[#f3e5f5] text-[#7b1fa2] border-[#e1bee7]',
  };
  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${styles[estado] || styles.confirmado}`}>
      {label}
    </span>
  );
}

// Badge de categoría
function CategoryBadge({ color, label }) {
  return (
    <span
      className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider text-white"
      style={{ backgroundColor: color }}
    >
      {label}
    </span>
  );
}

// Barra de progreso animada
function ProgressBar({ value, max, color }) {
  const safeValue = Number.isFinite(value) ? value : 0;
  const safeMax = Number.isFinite(max) && max > 0 ? max : 100;
  const percentage = Math.min((safeValue / safeMax) * 100, 100);
  return (
    <div className="h-1.5 bg-[#f8faf6] rounded-full overflow-hidden">
      <motion.div
        className="h-full rounded-full"
        style={{ backgroundColor: color }}
        initial={{ width: 0 }}
        animate={{ width: `${percentage}%` }}
        transition={{ duration: 1, ease: 'easeOut' }}
      />
    </div>
  );
}

// Skeleton loader para cards
function EventCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-[#e0e8db] overflow-hidden animate-pulse">
      <div className="h-40 bg-[#f8faf6]" />
      <div className="p-4 space-y-3">
        <div className="h-4 bg-[#f8faf6] rounded w-3/4" />
        <div className="h-3 bg-[#f8faf6] rounded w-1/2" />
        <div className="h-3 bg-[#f8faf6] rounded w-full" />
        <div className="h-8 bg-[#f8faf6] rounded-xl" />
      </div>
    </div>
  );
}

// ============================================================
// 3. PÁGINA PRINCIPAL
// ============================================================

// Mapea un evento del backend al formato que usa la UI
const mapApiEvent = (event, index) => {
  const fecha = event.fecha ? new Date(event.fecha) : null;
  const hoy = new Date();
  const manana = new Date(hoy);
  manana.setDate(manana.getDate() + 1);

  let fechaLabel = 'Próximo';
  if (fecha) {
    if (fecha.toDateString() === hoy.toDateString()) fechaLabel = 'Hoy';
    else if (fecha.toDateString() === manana.toDateString()) fechaLabel = 'Mañana';
    else fechaLabel = fecha.toLocaleDateString('es-CO', { weekday: 'short', day: 'numeric', month: 'short' });
  }

  const categoriaMap = { deporte: '#8bc34a', cultura: '#ff9800', musica: '#e91e63', educacion: '#2196f3', naturaleza: '#4caf50', social: '#9c27b0' };
  // Normaliza alias de categoría que llegan del backend (ej: 'cultural' → 'cultura')
  const catAlias = { cultural: 'cultura', deportivo: 'deporte', educativo: 'educacion', musical: 'musica' };
  const rawCat = (event.categoria || '').toLowerCase();
  const normalizedCat = catAlias[rawCat] || rawCat;
  const fallbackCatKey = Object.keys(categoriaMap)[index % Object.keys(categoriaMap).length];
  const categoriaKey = categoriaMap[normalizedCat] ? normalizedCat : fallbackCatKey;
  const COLORS = ['bg-[#4a6741]', 'bg-[#5a7a6b]', 'bg-[#6b8a7a]', 'bg-[#4a5d41]', 'bg-[#5a6b4a]', 'bg-[#6b7a5b]'];

  return {
    id: event.id || event._id || index,
    nombre: event.nombre || 'Evento',
    descripcion: event.descripcion || '',
    fecha: fechaLabel,
    fechaCompleta: event.fecha,
    hora: event.horaInicio || '10:00',
    duracion: event.horaFin && event.horaInicio ? event.horaFin : '2h',
    parque: event.parque?.nombre || event.espacio || event.parkId || 'Parque municipal',
    categoria: categoriaKey,
    categoriaLabel: CATEGORIES.find(c => c.id === categoriaKey)?.label || categoriaKey,
    categoriaColor: categoriaMap[categoriaKey] || '#2d4a3e',
    asistentes: event.inscritos || 0,
    maxAsistentes: event.capacidadMaxima || event.capacidad || 100,
    estado: event.estado === 'Aprobado' ? 'confirmado' : event.estado === 'Rechazado' ? 'cancelado' : 'pendiente',
    estadoLabel: event.estado || 'Pendiente',
    organizador: event.organizadorId || 'Organizador',
    precio: event.precio || 'Gratuito',
    imagenColor: COLORS[index % COLORS.length],
    popular: (event.inscritos || 0) > 50,
  };
};

export default function EventsPage() {
  const navigate = useNavigate();
  // Estados de la UI
  const [activeFilter, setActiveFilter] = useState('all');
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid');
  const [likedEvents, setLikedEvents] = useState(new Set());
  const [attendingEvents, setAttendingEvents] = useState(new Set());
  const [showFilters, setShowFilters] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const [apiEvents, setApiEvents] = useState(null); // null = no intentado, [] = vacío, [...] = datos

  // Carga eventos desde el backend; fallback silencioso al mock si falla
  const loadEvents = useCallback(async () => {
    try {
      const res = await eventService.getPublic();
      const data = res.data?.data ?? res.data ?? [];
      setApiEvents(Array.isArray(data) ? data : []);
    } catch {
      setApiEvents(null); // null → usar mock
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  // Usa eventos reales si la API respondió (aunque sean 0); mock como fallback
  const activeEvents = useMemo(() => {
    if (apiEvents === null) return EVENTS;
    if (apiEvents.length === 0) return EVENTS;
    return apiEvents.map(mapApiEvent);
  }, [apiEvents]);

  // Evita uso directo de window.innerWidth en render.
  useEffect(() => {
    const onResize = () => setIsDesktop(window.innerWidth >= 640);
    onResize();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const filteredEvents = useMemo(() => {
    let result = [...activeEvents];

    // Filtro por categoría
    if (activeCategory !== 'all') {
      result = result.filter((e) => e?.categoria === activeCategory);
    }

    // Filtro por tiempo
    if (activeFilter === 'today') {
      result = result.filter((e) => e?.fecha === 'Hoy');
    } else if (activeFilter === 'week') {
      result = result.filter((e) => ['Hoy', 'Mañana', 'Vie 19', 'Sáb 20', 'Dom 21'].includes(e?.fecha));
    }

    // Búsqueda
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter((e) =>
        (e?.nombre || '').toLowerCase().includes(q) ||
        (e?.parque || '').toLowerCase().includes(q) ||
        (e?.organizador || '').toLowerCase().includes(q) ||
        (e?.categoriaLabel || '').toLowerCase().includes(q)
      );
    }

    return result;
  }, [activeCategory, activeFilter, searchQuery]);

  // Toggle like
  const toggleLike = (id) => {
    setLikedEvents((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Toggle attend
  const toggleAttend = (id) => {
    setAttendingEvents((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Calcular si evento está completo
  const isFull = (event) => {
    const attendees = Number(event?.asistentes) || 0;
    const maxAttendees = Number(event?.maxAsistentes) || 0;
    if (maxAttendees <= 0) return false;
    return attendees >= maxAttendees;
  };

  const featuredSpotsLeft = Math.max(
    (Number(FEATURED_EVENT?.maxAsistentes) || 0) - (Number(FEATURED_EVENT?.asistentes) || 0),
    0
  );

  return (
    <div className="min-h-screen bg-[#f4f7f0] text-[#1a332a]">
      {/* ============================================
          NAVBAR SIMPLE
      ============================================ */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-[#e0e8db] sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <Link
            to="/"
            className="flex items-center gap-2 text-sm font-bold text-[#5a6b5f] hover:text-[#2d4a3e] transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            {TEXTS.backButton}
          </Link>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
              className="p-2 hover:bg-[#f8faf6] rounded-lg transition-colors lg:hidden"
            >
              {viewMode === 'grid' ? <List className="h-5 w-5 text-[#a8b5a0]" /> : <Grid3X3 className="h-5 w-5 text-[#a8b5a0]" />}
            </button>
            <button type="button" className="p-2 hover:bg-[#f8faf6] rounded-lg transition-colors">
              <Share2 className="h-5 w-5 text-[#a8b5a0]" />
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* ============================================
            HEADER / HERO
        ============================================ */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-10"
        >
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4 mb-8">
            <div>
              <h1 className="text-4xl sm:text-5xl font-black leading-tight mb-2">
                {TEXTS.pageTitle}
              </h1>
              <p className="text-[#5a6b5f] text-lg max-w-2xl">
                {TEXTS.pageSubtitle}
              </p>
            </div>

            {/* Stats rápidos en el header */}
            <div className="flex gap-4 flex-wrap">
              {STATS.slice(0, 3).map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: i * 0.1 }}
                  className="bg-white rounded-xl border border-[#e0e8db] px-4 py-3 flex items-center gap-3"
                >
                  <div
                    className="h-10 w-10 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: `${stat.color}15` }}
                  >
                    <stat.icon className="h-5 w-5" style={{ color: stat.color }} />
                  </div>
                  <div>
                    <p className="text-xl font-black" style={{ color: stat.color }}>{stat.value}</p>
                    <p className="text-[10px] text-[#a8b5a0] uppercase tracking-wider font-bold">{stat.label}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Barra de búsqueda y filtros */}
          <div className="bg-white rounded-2xl border border-[#e0e8db] p-4 shadow-sm">
            <div className="flex flex-col sm:flex-row gap-3">
              {/* Búsqueda */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[#a8b5a0]" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={TEXTS.searchPlaceholder}
                  className="w-full pl-10 pr-4 py-3 bg-[#f8faf6] rounded-xl border border-transparent focus:border-[#8bc34a] focus:bg-white transition-all outline-none text-sm font-medium placeholder:text-[#a8b5a0]"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                  >
                    <X className="h-4 w-4 text-[#a8b5a0] hover:text-[#1a332a]" />
                  </button>
                )}
              </div>

              {/* Filtros de tiempo */}
              <div className="flex gap-2 overflow-x-auto pb-1 sm:pb-0">
                {FILTERS.map((filter) => (
                  <button
                    key={filter.id}
                    type="button"
                    onClick={() => setActiveFilter(filter.id)}
                    className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${
                      activeFilter === filter.id
                        ? 'bg-[#2d4a3e] text-white shadow-lg shadow-[#2d4a3e]/20'
                        : 'bg-[#f8faf6] text-[#5a6b5f] hover:bg-[#e0e8db]'
                    }`}
                  >
                    <filter.icon className="h-4 w-4" />
                    {filter.label}
                  </button>
                ))}
              </div>

              {/* Toggle filtros mobile */}
              <button
                type="button"
                onClick={() => setShowFilters(!showFilters)}
                className="sm:hidden p-3 bg-[#f8faf6] rounded-xl hover:bg-[#e0e8db] transition-colors"
              >
                <SlidersHorizontal className="h-5 w-5 text-[#5a6b5f]" />
              </button>
            </div>

            {/* Categorías */}
            <AnimatePresence>
              {(showFilters || isDesktop) && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="flex gap-2 mt-3 overflow-x-auto pb-1"
                >
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setActiveCategory(cat.id)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                        activeCategory === cat.id
                          ? 'text-white shadow-md'
                          : 'bg-[#f8faf6] text-[#5a6b5f] hover:bg-[#e0e8db]'
                      }`}
                      style={activeCategory === cat.id ? { backgroundColor: cat.color } : {}}
                    >
                      <cat.icon className="h-3.5 w-3.5" />
                      {cat.label}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.section>

        {/* ============================================
            EVENTO DESTACADO
        ============================================ */}
        {!isLoading && filteredEvents.length > 0 && !searchQuery && activeCategory === 'all' && activeFilter === 'all' && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mb-10"
          >
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="h-5 w-5 text-[#ff9800]" />
              <h2 className="text-xl font-black">{TEXTS.featuredTitle}</h2>
            </div>

            <div className="bg-white rounded-3xl border border-[#e0e8db] overflow-hidden shadow-lg shadow-[#2d4a3e]/5">
              <div className="grid lg:grid-cols-2">
                {/* Imagen placeholder */}
                <div className={`${FEATURED_EVENT.imagenColor} h-64 lg:h-auto flex items-center justify-center relative`}>
                  <TreePine className="h-32 w-32 text-white opacity-20" />
                  <div className="absolute top-4 left-4">
                    <CategoryBadge color={FEATURED_EVENT.categoriaColor} label={FEATURED_EVENT.categoriaLabel} />
                  </div>
                  <div className="absolute top-4 right-4 flex gap-2">
                    <button
                      type="button"
                      onClick={() => toggleLike(FEATURED_EVENT.id)}
                      className="bg-white/90 backdrop-blur-sm rounded-full p-2.5 hover:bg-white transition-colors"
                    >
                      <Heart
                        className={`h-5 w-5 transition-colors ${likedEvents.has(FEATURED_EVENT.id) ? 'text-red-500 fill-red-500' : 'text-[#2d4a3e]'}`}
                      />
                    </button>
                    <button type="button" className="bg-white/90 backdrop-blur-sm rounded-full p-2.5 hover:bg-white transition-colors">
                      <Share2 className="h-5 w-5 text-[#2d4a3e]" />
                    </button>
                  </div>
                </div>

                {/* Info */}
                <div className="p-6 lg:p-8 flex flex-col justify-center">
                  <StatusBadge estado={FEATURED_EVENT.estado} label={FEATURED_EVENT.estadoLabel} />

                  <h3 className="text-2xl lg:text-3xl font-black mt-3 mb-2">{FEATURED_EVENT.nombre}</h3>
                  <p className="text-[#5a6b5f] mb-4 leading-relaxed">{FEATURED_EVENT.descripcion}</p>

                  <div className="space-y-2 mb-5">
                    <div className="flex items-center gap-2 text-sm text-[#5a6b5f]">
                      <Calendar className="h-4 w-4 text-[#8bc34a]" />
                      <span className="font-medium">{FEATURED_EVENT.fecha}</span>
                      <span className="text-[#a8b5a0]">·</span>
                      <Clock className="h-4 w-4 text-[#8bc34a]" />
                      <span>{FEATURED_EVENT.hora}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-[#5a6b5f]">
                      <MapPin className="h-4 w-4 text-[#8bc34a]" />
                      <span>{FEATURED_EVENT.parque}</span>
                      <span className="text-[#a8b5a0] text-xs">{FEATURED_EVENT.direccion}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-[#5a6b5f]">
                      <Users className="h-4 w-4 text-[#8bc34a]" />
                      <span className="font-medium">{FEATURED_EVENT.asistentes}</span>
                      <span className="text-[#a8b5a0]">/ {FEATURED_EVENT.maxAsistentes} {TEXTS.attendeesLabel}</span>
                    </div>
                  </div>

                  {/* Progress de cupos */}
                  <div className="mb-5">
                    <ProgressBar
                      value={FEATURED_EVENT.asistentes}
                      max={FEATURED_EVENT.maxAsistentes}
                      color="#8bc34a"
                    />
                    <p className="text-xs text-[#a8b5a0] mt-1">
                      {featuredSpotsLeft} {TEXTS.spotsLeft} disponibles
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => toggleAttend(FEATURED_EVENT.id)}
                      className={`flex-1 py-3.5 rounded-xl font-black text-sm transition-all flex items-center justify-center gap-2 ${
                        attendingEvents.has(FEATURED_EVENT.id)
                          ? 'bg-[#8bc34a] text-[#1a332a]'
                          : 'bg-[#2d4a3e] text-white hover:bg-[#1a332a] shadow-lg shadow-[#2d4a3e]/20'
                      }`}
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      {attendingEvents.has(FEATURED_EVENT.id) ? TEXTS.attendingButton : TEXTS.attendButton}
                    </motion.button>
                    <span className="px-4 py-3.5 bg-[#f8faf6] rounded-xl text-sm font-bold text-[#2d4a3e]">
                      {FEATURED_EVENT.precio}
                    </span>
                  </div>

                  <p className="text-xs text-[#a8b5a0] mt-3">
                    {TEXTS.organizerLabel}: <span className="text-[#5a6b5f] font-medium">{FEATURED_EVENT.organizador}</span>
                  </p>
                </div>
              </div>
            </div>
          </motion.section>
        )}

        <div className="grid lg:grid-cols-4 gap-6 lg:gap-8">
          {/* ============================================
              COLUMNA IZQUIERDA (3/4) - Grid de eventos
          ============================================ */}
          <div className="lg:col-span-3">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-black">{TEXTS.upcomingTitle}</h2>
              <span className="text-sm text-[#a8b5a0] font-medium">
                {filteredEvents.length} eventos
              </span>
            </div>

            {/* Loading state */}
            {isLoading ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <EventCardSkeleton key={i} />
                ))}
              </div>
            ) : filteredEvents.length === 0 ? (
              /* Empty state */
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-2xl border border-[#e0e8db] p-12 text-center"
              >
                <div className="h-16 w-16 bg-[#f8faf6] rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="h-8 w-8 text-[#a8b5a0]" />
                </div>
                <h3 className="text-lg font-black mb-2">{TEXTS.emptyTitle}</h3>
                <p className="text-[#5a6b5f] mb-4">{TEXTS.emptySubtitle}</p>
                <button
                  type="button"
                  onClick={() => { setActiveCategory('all'); setActiveFilter('all'); setSearchQuery(''); }}
                  className="px-6 py-2.5 bg-[#2d4a3e] text-white rounded-xl font-bold text-sm hover:bg-[#1a332a] transition-colors"
                >
                  {TEXTS.emptyButton}
                </button>
              </motion.div>
            ) : (
              /* Grid de eventos */
              <div className={`grid gap-4 ${
                viewMode === 'grid'
                  ? 'sm:grid-cols-2 lg:grid-cols-3'
                  : 'grid-cols-1'
              }`}>
                <AnimatePresence mode="popLayout">
                  {filteredEvents.map((evento, i) => (
                    <motion.div
                      key={evento.id}
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.3, delay: i * 0.05 }}
                      whileHover={{ y: -4 }}
                      className="bg-white rounded-2xl border border-[#e0e8db] overflow-hidden hover:border-[#8bc34a] hover:shadow-lg hover:shadow-[#8bc34a]/5 transition-all group"
                    >
                      {/* Imagen placeholder */}
                      <div className={`${evento.imagenColor} h-40 relative flex items-center justify-center`}>
                        <TreePine className="h-16 w-16 text-white opacity-20" />

                        {/* Badge categoría */}
                        <div className="absolute top-3 left-3">
                          <CategoryBadge color={evento.categoriaColor} label={evento.categoriaLabel} />
                        </div>

                        {/* Badge popular */}
                        {evento.popular && (
                          <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-full px-2 py-1 flex items-center gap-1">
                            <Flame className="h-3 w-3 text-[#ff5722]" />
                            <span className="text-[10px] font-bold text-[#ff5722]">Popular</span>
                          </div>
                        )}

                        {/* Like button */}
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); toggleLike(evento.id); }}
                          className="absolute bottom-3 right-3 bg-white/90 backdrop-blur-sm rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
                        >
                          <Heart
                            className={`h-4 w-4 transition-colors ${likedEvents.has(evento.id) ? 'text-red-500 fill-red-500' : 'text-[#a8b5a0]'}`}
                          />
                        </button>
                      </div>

                      {/* Contenido */}
                      <div className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-bold text-[#1a332a] line-clamp-1">{evento.nombre}</h3>
                        </div>

                        <div className="space-y-1.5 mb-3">
                          <div className="flex items-center gap-2 text-xs text-[#5a6b5f]">
                            <Calendar className="h-3.5 w-3.5 text-[#8bc34a]" />
                            <span className="font-medium">{evento.fecha}</span>
                            <span className="text-[#a8b5a0]">·</span>
                            <Clock className="h-3.5 w-3.5 text-[#8bc34a]" />
                            <span>{evento.hora}</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-[#5a6b5f]">
                            <MapPin className="h-3.5 w-3.5 text-[#8bc34a]" />
                            <span>{evento.parque}</span>
                          </div>
                        </div>

                        {/* Asistentes */}
                        <div className="mb-3">
                          <div className="flex items-center justify-between text-xs mb-1">
                            <span className="text-[#a8b5a0]">{evento.asistentes} / {evento.maxAsistentes}</span>
                            <span className="text-[10px] text-[#a8b5a0]">{TEXTS.attendeesLabel}</span>
                          </div>
                          <ProgressBar
                            value={evento.asistentes}
                            max={evento.maxAsistentes}
                            color={evento.categoriaColor}
                          />
                        </div>

                        {/* Footer */}
                        <div className="flex items-center justify-between">
                          <StatusBadge estado={evento.estado} label={evento.estadoLabel} />
                          <span className="text-xs font-bold text-[#2d4a3e]">{evento.precio}</span>
                        </div>

                        {/* Botón */}
                        <motion.button
                          type="button"
                          whileHover={{ scale: 1.01 }}
                          whileTap={{ scale: 0.99 }}
                          onClick={() => toggleAttend(evento.id)}
                          disabled={isFull(evento)}
                          className={`w-full mt-3 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1.5 ${
                            isFull(evento)
                              ? 'bg-[#f8faf6] text-[#a8b5a0] cursor-not-allowed'
                              : attendingEvents.has(evento.id)
                                ? 'bg-[#8bc34a] text-[#1a332a]'
                                : 'bg-[#2d4a3e] text-white hover:bg-[#1a332a]'
                          }`}
                        >
                          {isFull(evento) ? (
                            <>
                              <AlertCircle className="h-3.5 w-3.5" />
                              {TEXTS.fullButton}
                            </>
                          ) : attendingEvents.has(evento.id) ? (
                            <>
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              {TEXTS.attendingButton}
                            </>
                          ) : (
                            <>
                              <Plus className="h-3.5 w-3.5" />
                              {TEXTS.attendButton}
                            </>
                          )}
                        </motion.button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>

          {/* ============================================
              COLUMNA DERECHA (1/4) - Sidebar
          ============================================ */}
          <div className="space-y-6">
            {/* Mini calendario */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-white rounded-2xl border border-[#e0e8db] p-5"
            >
              <h3 className="font-bold text-sm uppercase tracking-wider text-[#a8b5a0] mb-4">
                Próximos días
              </h3>
              <div className="space-y-2">
                {CALENDAR_DAYS.map((day, i) => (
                  <motion.div
                    key={day.date}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: i * 0.05 }}
                    className={`flex items-center justify-between p-3 rounded-xl transition-colors cursor-pointer ${
                      day.active ? 'bg-[#2d4a3e] text-white' : 'hover:bg-[#f8faf6]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`h-10 w-10 rounded-lg flex items-center justify-center text-sm font-black ${
                        day.active ? 'bg-white/20' : 'bg-[#f8faf6] text-[#2d4a3e]'
                      }`}>
                        {day.date}
                      </div>
                      <div>
                        <p className={`text-sm font-bold ${day.active ? 'text-white' : 'text-[#1a332a]'}`}>
                          {day.day}
                        </p>
                        <p className={`text-xs ${day.active ? 'text-white/70' : 'text-[#a8b5a0]'}`}>
                          {day.events} eventos
                        </p>
                      </div>
                    </div>
                    {day.events > 0 && (
                      <div className={`h-2 w-2 rounded-full ${day.active ? 'bg-[#8bc34a]' : 'bg-[#8bc34a]'}`} />
                    )}
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Estadísticas */}
            <div className="bg-white rounded-2xl border border-[#e0e8db] p-5">
              <h3 className="font-bold text-sm uppercase tracking-wider text-[#a8b5a0] mb-4">
                {TEXTS.statsTitle}
              </h3>
              <div className="space-y-4">
                {STATS.map((stat, i) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: i * 0.1 }}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <stat.icon className="h-4 w-4" style={{ color: stat.color }} />
                        <span className="text-sm text-[#5a6b5f]">{stat.label}</span>
                      </div>
                      <span className="text-lg font-black" style={{ color: stat.color }}>{stat.value}</span>
                    </div>
                    <ProgressBar value={stat.value} max={Math.max(stat.value * 1.5, 100)} color={stat.color} />
                  </motion.div>
                ))}
              </div>
            </div>

            {/* CTA crear evento */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="bg-[#2d4a3e] rounded-2xl p-5 text-white"
            >
              <h3 className="font-bold text-lg mb-2">¿Tenés un evento?</h3>
              <p className="text-sm text-white/70 mb-4">
                Publicá tu actividad en BUCAPARK y llegá a miles de personas.
              </p>
              <motion.button
                type="button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate('/events/new')}
                className="w-full bg-[#8bc34a] text-[#1a332a] py-3 rounded-xl font-black text-sm hover:bg-[#9ccc65] transition-colors flex items-center justify-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Crear evento
              </motion.button>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
