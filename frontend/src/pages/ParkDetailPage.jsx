// src/pages/ParkDetailPage.jsx
// ============================================================
// PARK DETAIL PAGE - BUCAPARK
// ============================================================
// Todo el contenido editable está ARRIBA en objetos/arrays.
// Abajo solo está la UI y las animaciones.
// Fácil de editar para juniors.
// ============================================================

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { parkService, eventService, reservationService } from '../api/services';
import { useAuth } from '../contexts/AuthContext';
import {
  TreePine,
  MapPin,
  ArrowLeft,
  Calendar,
  Users,
  Sun,
  CloudRain,
  Wind,
  Droplets,
  AlertTriangle,
  ChevronRight,
  Star,
  Heart,
  Share2,
  Navigation,
  Phone,
  Mail,
  Globe,
  Camera,
  X,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';

// ============================================================
// 1. CONTENIDO EDITABLE - Todo acá arriba
// ============================================================

const TEXTS = {
  backButton: 'Volver a parques',
  reserveButton: 'Reservar ahora',
  reserveSubtext: 'Elegí tu espacio y fecha',
  eventsTitle: 'Próximos eventos',
  zonesTitle: 'Zonas disponibles',
  scheduleTitle: 'Horarios',
  statsTitle: 'En números',
  activityTitle: 'Actividad reciente',
  galleryTitle: 'Galería',
  weatherTitle: 'Clima ahora',
  infoTitle: 'Información',
  contactTitle: 'Contacto',
  reviewsTitle: 'Opiniones',
  seeMore: 'Ver más',
  seeLess: 'Ver menos',
  fullCapacity: 'Completo',
  available: 'Disponible',
  maintenance: 'En mantenimiento',
  closed: 'Cerrado',
  loadingTitle: 'Cargando parque...',
  errorTitle: 'No se pudo cargar el parque',
  errorMessage: 'Verificá que el gateway esté corriendo o intentá de nuevo.',
  notFoundTitle: 'Parque no encontrado',
  retryButton: 'Reintentar',
};

// Info base del parque.
// TODO: Cuando el backend exponga estos campos, reemplazar estos valores mock
// por datos reales: slogan, capacidadTotal, ocupacionActual, superficie,
// inauguracion, rating, reviewsCount, telefono, email y web.
const PARK_INFO = {
  id: 1,
  nombre: 'Parque San Pío',
  slogan: 'El corazón verde de Bucaramanga',
  descripcion: 'Espacio emblemático del centro de la ciudad. Canchas de fútbol, baloncesto, auditorio al aire libre, zona de juegos infantiles y amplias áreas verdes para picnics y eventos comunitarios. Ideal para deportes, cultura y descanso familiar.',
  direccion: 'Carrera 27 #45-67, Centro',
  ciudad: 'Bucaramanga',
  estado: 'activo',
  capacidadTotal: 500,
  ocupacionActual: 78,
  superficie: '2.4 hectáreas',
  inauguracion: '1987',
  rating: 4.8,
  reviewsCount: 124,
  telefono: '+57 607 123 4567',
  email: 'sanpio@bucapark.gov.co',
  web: 'bucapark.gov.co/sanpio',
};

// TODO: Clima mock temporal; no existe endpoint de clima en el backend.
const WEATHER = {
  temp: 24,
  feelsLike: 26,
  condition: 'soleado',
  humidity: 65,
  wind: 12,
  uv: 7,
  forecast: [
    { day: 'Lun', temp: 25, icon: 'soleado' },
    { day: 'Mar', temp: 23, icon: 'nublado' },
    { day: 'Mie', temp: 22, icon: 'lluvia' },
    { day: 'Jue', temp: 26, icon: 'soleado' },
    { day: 'Vie', temp: 27, icon: 'soleado' },
  ],
};

// TODO: Horarios mock temporal; no existe este dato en el modelo de parques.
const SCHEDULES = [
  { day: 'Lunes a Viernes', hours: '5:00 AM - 9:00 PM', note: '' },
  { day: 'Sábados', hours: '5:00 AM - 10:00 PM', note: 'Eventos especiales hasta medianoche' },
  { day: 'Domingos', hours: '6:00 AM - 8:00 PM', note: 'Mantenimiento de canchas: 12:00 - 2:00 PM' },
  { day: 'Festivos', hours: '6:00 AM - 6:00 PM', note: 'Solo áreas verdes' },
];

// TODO: Zonas/canchas mock temporal; no existe endpoint conectado a parques.
const ZONES = [
  { id: 1, nombre: 'Cancha Fútbol 1', tipo: 'cancha', estado: 'disponible', capacidad: 22, superficie: 'Césped sintético', precio: '$25.000/hora', popular: true, icon: 'futbol' },
  { id: 2, nombre: 'Cancha Fútbol 2', tipo: 'cancha', estado: 'ocupado', capacidad: 22, superficie: 'Césped sintético', precio: '$25.000/hora', popular: false, icon: 'futbol' },
  { id: 3, nombre: 'Cancha Baloncesto', tipo: 'cancha', estado: 'disponible', capacidad: 10, superficie: 'Parquet cubierto', precio: '$20.000/hora', popular: true, icon: 'basket' },
  { id: 4, nombre: 'Auditorio Libre', tipo: 'espacio', estado: 'disponible', capacidad: 200, superficie: 'Cemento / graderías', precio: '$80.000/evento', popular: false, icon: 'auditorio' },
  { id: 5, nombre: 'Zona Yoga', tipo: 'zona', estado: 'disponible', capacidad: 30, superficie: 'Deck de madera', precio: 'Gratuito', popular: false, icon: 'yoga' },
  { id: 6, nombre: 'Juegos Infantiles', tipo: 'zona', estado: 'mantenimiento', capacidad: 15, superficie: 'Caucho de seguridad', precio: 'Gratuito', popular: false, icon: 'juegos' },
];

// TODO: Eventos mock temporal; la página de detalle aún no tiene endpoint por parque.
const EVENTS = [
  { id: 1, nombre: 'Yoga al amanecer', fecha: 'Hoy', hora: '6:00 AM', duracion: '1h 30min', asistentes: 24, maxAsistentes: 30, estado: 'confirmado', organizador: 'Comunidad Zen Bucaramanga', descripcion: 'Sesión de yoga y meditación al aire libre. Traé tu mat y agua.', color: '#8bc34a' },
  { id: 2, nombre: 'Torneo Barrial Fútbol', fecha: 'Mañana', hora: '8:00 AM', duracion: '4h', asistentes: 156, maxAsistentes: 200, estado: 'confirmado', organizador: 'Liga de Fútbol Amateur', descripcion: 'Cuadrangular de barrios. Entrada libre para espectadores.', color: '#2196f3' },
  { id: 3, nombre: 'Cine bajo las estrellas', fecha: 'Vie 16', hora: '7:00 PM', duracion: '2h 30min', asistentes: 89, maxAsistentes: 150, estado: 'pendiente', organizador: 'CineClub Bucaramanga', descripcion: 'Proyección de "El Abrazo de la Serpiente". Traé silla o manta.', color: '#ff9800' },
];

// TODO: Estadísticas mock temporal; backend no expone métricas por parque.
const STATS = [
  { id: 1, label: 'Visitas hoy', value: 342, icon: Users, color: '#2d4a3e' },
  { id: 2, label: 'Reservas', value: 8, icon: Calendar, color: '#8bc34a' },
  { id: 3, label: 'Eventos mes', value: 12, icon: Star, color: '#ff9800' },
  { id: 4, label: 'Incidencias', value: 2, icon: AlertTriangle, color: '#f44336' },
];

// TODO: Actividad reciente mock temporal; no existe feed real por parque.
const ACTIVITY = [
  { id: 1, texto: 'Reserva confirmada: Cancha Fútbol 1 - 10:00 AM', tiempo: '5 min', tipo: 'reserva', color: '#8bc34a' },
  { id: 2, texto: 'Evento "Yoga al amanecer" iniciado', tiempo: '1 h', tipo: 'evento', color: '#2196f3' },
  { id: 3, texto: 'Reporte: Foco de luz fundido en zona norte', tiempo: '2 h', tipo: 'incidencia', color: '#ff9800' },
  { id: 4, texto: 'Mantenimiento completado: Cancha Baloncesto', tiempo: '3 h', tipo: 'mantenimiento', color: '#9c27b0' },
  { id: 5, texto: 'Nueva reseña: 5 estrellas de María G.', tiempo: '4 h', tipo: 'review', color: '#ffeb3b' },
];

// TODO: Galería placeholder temporal; backend no guarda imágenes de parque.
const GALLERY = [
  { id: 1, alt: 'Vista aérea del parque', color: 'bg-[#4a6741]' },
  { id: 2, alt: 'Cancha de fútbol', color: 'bg-[#5a7a6b]' },
  { id: 3, alt: 'Zona de picnic', color: 'bg-[#6b8a7a]' },
  { id: 4, alt: 'Auditorio al aire libre', color: 'bg-[#4a5d41]' },
  { id: 5, alt: 'Juegos infantiles', color: 'bg-[#5a6b4a]' },
  { id: 6, alt: 'Sendero principal', color: 'bg-[#6b7a5b]' },
];

// TODO: Reviews mock temporal; no existe endpoint de reseñas por parque.
const REVIEWS = [
  { id: 1, nombre: 'María G.', rating: 5, texto: 'Hermoso parque, muy bien cuidado. Las canchas están en excelente estado.', tiempo: '2 días' },
  { id: 2, nombre: 'Carlos R.', rating: 4, texto: 'Buen espacio para hacer deporte. Falta más iluminación en las noches.', tiempo: '1 semana' },
  { id: 3, nombre: 'Ana L.', rating: 5, texto: 'Los eventos son increíbles. El yoga al amanecer es mi favorito.', tiempo: '2 semanas' },
];

// ============================================================
// 2. COMPONENTES AUXILIARES - Pequeños y reutilizables
// ============================================================

function ZoneStatusBadge({ estado }) {
  const styles = {
    disponible: 'bg-[#e8f5e9] text-[#2e7d32] border-[#c8e6c9]',
    ocupado: 'bg-[#ffebee] text-[#c62828] border-[#ffcdd2]',
    mantenimiento: 'bg-[#fff3e0] text-[#e65100] border-[#ffe0b2]',
  };
  const labels = {
    disponible: TEXTS.available,
    ocupado: TEXTS.fullCapacity,
    mantenimiento: TEXTS.maintenance,
  };
  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${styles[estado] || styles.mantenimiento}`}>
      {labels[estado] || TEXTS.maintenance}
    </span>
  );
}

function EventStatusBadge({ estado }) {
  const styles = {
    confirmado: 'bg-[#e8f5e9] text-[#2e7d32]',
    pendiente: 'bg-[#fff8e1] text-[#f9a825]',
    cancelado: 'bg-[#ffebee] text-[#c62828]',
  };
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${styles[estado] || styles.pendiente}`}>
      {estado}
    </span>
  );
}

function WeatherIcon({ condition, className = '' }) {
  const icons = {
    soleado: Sun,
    nublado: CloudRain,
    lluvia: Droplets,
    ventoso: Wind,
  };
  const Icon = icons[condition] || Sun;
  return <Icon className={className} />;
}

function ProgressBar({ value, max = 100, color }) {
  const safeValue = Number.isFinite(value) ? value : 0;
  const safeMax = Number.isFinite(max) && max > 0 ? max : 100;
  const percentage = Math.min((safeValue / safeMax) * 100, 100);
  return (
    <div className="h-2.5 bg-[#f8faf6] rounded-full overflow-hidden">
      <motion.div
        className="h-full rounded-full"
        style={{ backgroundColor: color }}
        initial={{ width: 0 }}
        animate={{ width: `${percentage}%` }}
        transition={{ duration: 1.2, ease: 'easeOut' }}
      />
    </div>
  );
}

function StateView({ title, message, actionLabel, onAction }) {
  return (
    <div className="min-h-screen bg-[#f4f7f0] flex items-center justify-center px-4 text-[#1a332a]">
      <motion.div
        className="bg-white rounded-2xl border border-[#e0e8db] p-8 max-w-md w-full text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <AlertCircle className="h-14 w-14 text-[#ff9800] mx-auto mb-4" />
        <h1 className="text-2xl font-black mb-2">{title}</h1>
        {message && <p className="text-sm text-[#5a6b5f] mb-6">{message}</p>}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            to="/parks"
            className="bg-[#f8faf6] text-[#2d4a3e] px-5 py-3 rounded-xl font-bold text-sm hover:bg-[#e0e8db] transition-colors"
          >
            {TEXTS.backButton}
          </Link>
          {onAction && (
            <button
              onClick={onAction}
              className="bg-[#2d4a3e] text-white px-5 py-3 rounded-xl font-bold text-sm hover:bg-[#1a332a] transition-colors flex items-center justify-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              {actionLabel}
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
}

const getParkPayload = (response) => response?.data?.data ?? response?.data ?? null;
const getListPayload = (response) => {
  const data = response?.data?.data ?? response?.data ?? [];
  return Array.isArray(data) ? data : [];
};

const formatEventDateLabel = (dateValue) => {
  if (!dateValue) return 'Próximo';
  const parsed = new Date(dateValue);
  if (Number.isNaN(parsed.getTime())) return 'Próximo';
  return parsed.toLocaleDateString('es-CO', { day: '2-digit', month: 'short' });
};

const formatEventHour = (hourValue) => {
  if (!hourValue || typeof hourValue !== 'string') return '--:--';
  return hourValue;
};

const getCreatedYear = (createdAtValue, fallbackYear) => {
  if (!createdAtValue) return fallbackYear;
  const parsed = new Date(createdAtValue);
  if (Number.isNaN(parsed.getTime())) return fallbackYear;
  return String(parsed.getFullYear());
};

// ============================================================
// 3. PÁGINA PRINCIPAL
// ============================================================

export default function ParkDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAuth();

  const [activeImage, setActiveImage] = useState(0);
  const [showAllSchedule, setShowAllSchedule] = useState(false);
  const [liked, setLiked] = useState(false);
  const [showGallery, setShowGallery] = useState(false);
  const [park, setPark] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [eventsForPark, setEventsForPark] = useState([]);
  const [reservationsCount, setReservationsCount] = useState(null);

  const loadPark = useCallback(async () => {
    if (!id) {
      setError(TEXTS.notFoundTitle);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await parkService.getById(id);
      const data = getParkPayload(res);
      setPark(data && typeof data === 'object' ? data : null);
      if (!data) setError(TEXTS.notFoundTitle);
    } catch (err) {
      const status = err?.response?.status;
      setError(status === 404 ? TEXTS.notFoundTitle : TEXTS.errorMessage);
      setPark(null);
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    const timer = setTimeout(loadPark, 0);
    return () => clearTimeout(timer);
  }, [loadPark]);

  useEffect(() => {
    let mounted = true;

    const loadExtras = async () => {
      if (!id) return;

      try {
        const [eventsRes, reservationsRes] = await Promise.all([
          eventService.getPublic(),
          reservationService.getAll(),
        ]);

        if (!mounted) return;

        const events = getListPayload(eventsRes);
        const reservations = getListPayload(reservationsRes);
        const parkIdString = String(id);

        const filteredEvents = events
          .filter((evt) => String(evt?.parkId || '') === parkIdString)
          .map((evt, index) => ({
            id: evt?.id || evt?._id || `evt-${index}`,
            nombre: evt?.nombre || 'Evento',
            fecha: formatEventDateLabel(evt?.fecha),
            hora: formatEventHour(evt?.horaInicio),
            duracion: evt?.horaFin && evt?.horaInicio ? `${evt.horaInicio} - ${evt.horaFin}` : 'Por confirmar',
            asistentes: 0,
            maxAsistentes: 0,
            estado: evt?.estado === 'Aprobado' ? 'confirmado' : evt?.estado === 'Rechazado' ? 'cancelado' : 'pendiente',
            organizador: 'Organización BUCAPARK',
            descripcion: evt?.descripcion || '',
            color: '#8bc34a',
          }));

        const filteredReservations = reservations.filter(
          (reservation) => String(reservation?.parkId || '') === parkIdString
        );

        setEventsForPark(filteredEvents);
        setReservationsCount(filteredReservations.length);
      } catch {
        if (!mounted) return;
        // TODO: Mantener fallback mock mientras estos endpoints no estén garantizados en todos los ambientes.
        setEventsForPark([]);
        setReservationsCount(null);
      }
    };

    const timer = setTimeout(loadExtras, 0);
    return () => {
      mounted = false;
      clearTimeout(timer);
    };
  }, [id]);

  const parkInfo = useMemo(() => {
    if (!park) return PARK_INFO;
    return {
      ...PARK_INFO,
      id: park._id || park.id || id,
      nombre: park.nombre || PARK_INFO.nombre,
      descripcion: park.descripcion || PARK_INFO.descripcion,
      direccion: park.direccion || PARK_INFO.direccion,
      ciudad: park.ciudad || PARK_INFO.ciudad,
      estado: park.estado || PARK_INFO.estado,
      inauguracion: getCreatedYear(park.createdAt, PARK_INFO.inauguracion),
    };
  }, [id, park]);

  const handleReserve = () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: location } });
      return;
    }
    navigate(`/reservations/new?park=${encodeURIComponent(String(parkInfo.id || ''))}`);
  };

  const handleDirections = () => {
    const query = encodeURIComponent(`${parkInfo.direccion}, ${parkInfo.ciudad}`);
    window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank', 'noopener,noreferrer');
  };

  const handleShare = async () => {
    const shareUrl = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title: parkInfo.nombre, text: parkInfo.descripcion, url: shareUrl });
      } catch {
        // El usuario puede cerrar el diálogo nativo.
      }
      return;
    }

    if (navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(shareUrl);
      } catch {
        // Falla en contextos no-HTTPS o sin permiso de portapapeles
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f4f7f0] flex items-center justify-center px-4 text-[#1a332a]">
        <motion.div
          className="bg-white rounded-2xl border border-[#e0e8db] p-8 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
            className="inline-block mb-4"
          >
            <RefreshCw className="h-10 w-10 text-[#8bc34a]" />
          </motion.div>
          <p className="font-black">{TEXTS.loadingTitle}</p>
        </motion.div>
      </div>
    );
  }

  if (error || !park) {
    return (
      <StateView
        title={error === TEXTS.notFoundTitle ? TEXTS.notFoundTitle : TEXTS.errorTitle}
        message={error === TEXTS.notFoundTitle ? null : error}
        actionLabel={TEXTS.retryButton}
        onAction={loadPark}
      />
    );
  }

  const ocupacionColor = parkInfo.ocupacionActual > 80 ? '#ff5722' :
                         parkInfo.ocupacionActual > 50 ? '#ff9800' : '#8bc34a';
  const freeSpaces = Math.max(
    parkInfo.capacidadTotal - Math.floor((parkInfo.capacidadTotal * parkInfo.ocupacionActual) / 100),
    0
  );
  const visibleEvents = eventsForPark.length > 0 ? eventsForPark : EVENTS;
  const visibleStats = STATS.map((stat) => {
    if (stat.id === 2 && Number.isFinite(reservationsCount)) {
      return { ...stat, value: reservationsCount };
    }
    if (stat.id === 3 && eventsForPark.length > 0) {
      return { ...stat, value: eventsForPark.length };
    }
    return stat;
  });

  return (
    <div className="min-h-screen bg-[#f4f7f0] text-[#1a332a]">
      <nav className="bg-white border-b border-[#e0e8db] sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <Link
            to="/parks"
            className="flex items-center gap-2 text-sm font-bold text-[#5a6b5f] hover:text-[#2d4a3e] transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            {TEXTS.backButton}
          </Link>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setLiked(!liked)}
              className="p-2 hover:bg-[#f8faf6] rounded-lg transition-colors"
              aria-label="Guardar parque"
            >
              <Heart className={`h-5 w-5 transition-colors ${liked ? 'text-red-500 fill-red-500' : 'text-[#a8b5a0]'}`} />
            </button>
            <button
              onClick={handleShare}
              className="p-2 hover:bg-[#f8faf6] rounded-lg transition-colors"
              aria-label="Compartir parque"
            >
              <Share2 className="h-5 w-5 text-[#a8b5a0]" />
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <section className="mb-10">
          <div className="grid lg:grid-cols-5 gap-4 lg:gap-6">
            <div className="lg:col-span-3 relative">
              <motion.div
                className={`${GALLERY[activeImage]?.color || GALLERY[0].color} rounded-2xl h-64 sm:h-80 lg:h-96 flex items-center justify-center relative overflow-hidden cursor-pointer`}
                onClick={() => setShowGallery(true)}
                whileHover={{ scale: 1.01 }}
                transition={{ duration: 0.3 }}
              >
                <TreePine className="h-32 w-32 text-white opacity-20" />

                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-6">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                      parkInfo.estado === 'activo' ? 'bg-[#8bc34a] text-[#1a332a]' : 'bg-[#ff9800] text-white'
                    }`}>
                      {parkInfo.estado === 'activo' ? 'Abierto ahora' : 'Cerrado'}
                    </span>
                    <span className="flex items-center gap-1 text-white/90 text-xs font-medium">
                      <Star className="h-3.5 w-3.5 text-[#ffd54f] fill-[#ffd54f]" />
                      {parkInfo.rating} ({parkInfo.reviewsCount})
                    </span>
                  </div>
                </div>

                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full p-2.5">
                  <Camera className="h-5 w-5 text-[#2d4a3e]" />
                </div>
              </motion.div>

              <div className="flex gap-2 mt-3 overflow-x-auto pb-2">
                {GALLERY.map((img, i) => (
                  <button
                    key={img.id}
                    onClick={() => setActiveImage(i)}
                    className={`${img.color} h-16 w-16 rounded-xl flex-shrink-0 flex items-center justify-center border-2 transition-all ${
                      activeImage === i ? 'border-[#8bc34a] shadow-md' : 'border-transparent opacity-60 hover:opacity-100'
                    }`}
                    aria-label={img.alt}
                  >
                    <TreePine className="h-6 w-6 text-white/40" />
                  </button>
                ))}
              </div>
            </div>

            <div className="lg:col-span-2 flex flex-col">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="bg-white rounded-2xl border border-[#e0e8db] p-6 flex-1"
              >
                <h1 className="text-3xl font-black leading-tight mb-1">{parkInfo.nombre}</h1>
                <p className="text-sm text-[#8bc34a] font-bold mb-4">{parkInfo.slogan}</p>

                <div className="flex items-start gap-2 mb-4">
                  <MapPin className="h-4 w-4 text-[#8bc34a] mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-[#5a6b5f]">{parkInfo.direccion}</p>
                    <p className="text-xs text-[#a8b5a0]">{parkInfo.ciudad}</p>
                  </div>
                </div>

                <div className="mb-5">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="font-bold text-[#1a332a]">Ocupación ahora</span>
                    <span className="font-black text-lg" style={{ color: ocupacionColor }}>
                      {parkInfo.ocupacionActual}%
                    </span>
                  </div>
                  <ProgressBar value={parkInfo.ocupacionActual} color={ocupacionColor} />
                  <p className="text-xs text-[#a8b5a0] mt-1.5">
                    {freeSpaces} espacios libres de {parkInfo.capacidadTotal}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-5">
                  <div className="bg-[#f8faf6] rounded-xl p-3 text-center">
                    <p className="text-lg font-black text-[#2d4a3e]">{parkInfo.superficie}</p>
                    <p className="text-xs text-[#a8b5a0]">Superficie</p>
                  </div>
                  <div className="bg-[#f8faf6] rounded-xl p-3 text-center">
                    <p className="text-lg font-black text-[#2d4a3e]">{parkInfo.inauguracion}</p>
                    <p className="text-xs text-[#a8b5a0]">Inauguración</p>
                  </div>
                </div>

                <motion.button
                  onClick={handleReserve}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full bg-[#2d4a3e] text-white py-4 rounded-xl font-black text-lg hover:bg-[#1a332a] transition-colors flex items-center justify-center gap-2 shadow-lg shadow-[#2d4a3e]/20"
                >
                  <Calendar className="h-5 w-5" />
                  {TEXTS.reserveButton}
                </motion.button>
                <p className="text-xs text-center text-[#a8b5a0] mt-2">{TEXTS.reserveSubtext}</p>
              </motion.div>
            </div>
          </div>
        </section>

        <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
          <div className="lg:col-span-2 space-y-8">
            <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}>
              <h2 className="text-xl font-black mb-3">{TEXTS.infoTitle}</h2>
              <p className="text-[#5a6b5f] leading-relaxed text-lg">{parkInfo.descripcion}</p>
            </motion.section>

            <section>
              <h2 className="text-xl font-black mb-4">{TEXTS.zonesTitle}</h2>
              <div className="grid sm:grid-cols-2 gap-3">
                {ZONES.map((zona, i) => (
                  <motion.div
                    key={zona.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: i * 0.05 }}
                    whileHover={{ y: -3 }}
                    className="bg-white rounded-xl border border-[#e0e8db] p-4 hover:border-[#8bc34a] hover:shadow-md transition-all cursor-pointer"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-bold text-[#1a332a]">{zona.nombre}</h3>
                      <ZoneStatusBadge estado={zona.estado} />
                    </div>
                    <p className="text-xs text-[#a8b5a0] mb-2">{zona.superficie}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-[#2d4a3e]">{zona.precio}</span>
                      <span className="text-xs text-[#a8b5a0] flex items-center gap-1">
                        <Users className="h-3 w-3" /> {zona.capacidad}
                      </span>
                    </div>
                    {zona.popular && (
                      <span className="inline-block mt-2 text-[10px] font-bold uppercase tracking-wider text-[#ff9800]">
                        ★ Popular
                      </span>
                    )}
                  </motion.div>
                ))}
              </div>
            </section>

            <section>
              <h2 className="text-xl font-black mb-4">{TEXTS.eventsTitle}</h2>
              <div className="bg-white rounded-2xl border border-[#e0e8db] overflow-hidden">
                {visibleEvents.map((evento, i) => (
                  <motion.div
                    key={evento.id}
                    initial={{ opacity: 0, x: -15 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: i * 0.1 }}
                    className={`flex items-center gap-4 p-4 ${i !== visibleEvents.length - 1 ? 'border-b border-[#f8faf6]' : ''} hover:bg-[#f8faf6] transition-colors`}
                  >
                    <div className="h-14 w-14 rounded-xl flex flex-col items-center justify-center flex-shrink-0" style={{ backgroundColor: `${evento.color}15` }}>
                      <span className="text-xs font-bold" style={{ color: evento.color }}>{evento.fecha}</span>
                      <span className="text-[10px] text-[#a8b5a0]">{evento.hora}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <h4 className="font-bold text-[#1a332a] truncate">{evento.nombre}</h4>
                        <EventStatusBadge estado={evento.estado} />
                      </div>
                      <p className="text-xs text-[#a8b5a0]">{evento.organizador}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-sm font-bold text-[#5a6b5f]">{evento.asistentes}/{evento.maxAsistentes}</p>
                      <p className="text-[10px] text-[#a8b5a0]">asistentes</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </section>

            <section>
              <h2 className="text-xl font-black mb-4">{TEXTS.reviewsTitle}</h2>
              <div className="space-y-3">
                {REVIEWS.map((review, i) => (
                  <motion.div
                    key={review.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: i * 0.08 }}
                    className="bg-white rounded-xl border border-[#e0e8db] p-4"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 bg-[#2d4a3e] rounded-full flex items-center justify-center text-white text-xs font-bold">
                          {review.nombre.split(' ').map((n) => n[0]).join('')}
                        </div>
                        <div>
                          <p className="font-bold text-sm text-[#1a332a]">{review.nombre}</p>
                          <div className="flex items-center gap-0.5">
                            {Array.from({ length: 5 }).map((_, s) => (
                              <Star key={s} className={`h-3 w-3 ${s < review.rating ? 'text-[#ffd54f] fill-[#ffd54f]' : 'text-[#e0e8db]'}`} />
                            ))}
                          </div>
                        </div>
                      </div>
                      <span className="text-xs text-[#a8b5a0]">{review.tiempo}</span>
                    </div>
                    <p className="text-sm text-[#5a6b5f]">{review.texto}</p>
                  </motion.div>
                ))}
              </div>
            </section>
          </div>

          <div className="space-y-6">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }} className="bg-white rounded-2xl border border-[#e0e8db] p-5">
              <h3 className="font-bold text-sm uppercase tracking-wider text-[#a8b5a0] mb-4">{TEXTS.weatherTitle}</h3>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-4xl font-black">{WEATHER.temp}°</p>
                  <p className="text-sm text-[#5a6b5f]">Sensación {WEATHER.feelsLike}°</p>
                </div>
                <WeatherIcon condition={WEATHER.condition} className="h-12 w-12 text-[#ffd54f]" />
              </div>
              <div className="grid grid-cols-3 gap-2 mb-4">
                <div className="bg-[#f8faf6] rounded-lg p-2 text-center">
                  <Droplets className="h-4 w-4 text-[#42a5f5] mx-auto mb-1" />
                  <p className="text-xs font-bold">{WEATHER.humidity}%</p>
                  <p className="text-[10px] text-[#a8b5a0]">Humedad</p>
                </div>
                <div className="bg-[#f8faf6] rounded-lg p-2 text-center">
                  <Wind className="h-4 w-4 text-[#90a4ae] mx-auto mb-1" />
                  <p className="text-xs font-bold">{WEATHER.wind}km/h</p>
                  <p className="text-[10px] text-[#a8b5a0]">Viento</p>
                </div>
                <div className="bg-[#f8faf6] rounded-lg p-2 text-center">
                  <Sun className="h-4 w-4 text-[#ff9800] mx-auto mb-1" />
                  <p className="text-xs font-bold">{WEATHER.uv}</p>
                  <p className="text-[10px] text-[#a8b5a0]">UV</p>
                </div>
              </div>
              <div className="flex justify-between">
                {WEATHER.forecast.map((d) => (
                  <div key={d.day} className="text-center">
                    <p className="text-[10px] text-[#a8b5a0] mb-1">{d.day}</p>
                    <WeatherIcon condition={d.icon} className="h-4 w-4 mx-auto mb-1 text-[#8bc34a]" />
                    <p className="text-xs font-bold">{d.temp}°</p>
                  </div>
                ))}
              </div>
            </motion.div>

            <div className="bg-white rounded-2xl border border-[#e0e8db] p-5">
              <h3 className="font-bold text-sm uppercase tracking-wider text-[#a8b5a0] mb-4">{TEXTS.scheduleTitle}</h3>
              <div className="space-y-3">
                {(showAllSchedule ? SCHEDULES : SCHEDULES.slice(0, 2)).map((s, i, items) => (
                  <div key={s.day} className={`pb-3 ${i !== items.length - 1 ? 'border-b border-[#f8faf6]' : ''}`}>
                    <p className="font-bold text-sm text-[#1a332a]">{s.day}</p>
                    <p className="text-sm text-[#8bc34a] font-medium">{s.hours}</p>
                    {s.note && <p className="text-xs text-[#a8b5a0] mt-0.5">{s.note}</p>}
                  </div>
                ))}
              </div>
              <button
                onClick={() => setShowAllSchedule(!showAllSchedule)}
                className="mt-3 text-xs font-bold text-[#8bc34a] hover:text-[#2d4a3e] transition-colors flex items-center gap-1"
              >
                {showAllSchedule ? TEXTS.seeLess : TEXTS.seeMore}
                <ChevronRight className={`h-3 w-3 transition-transform ${showAllSchedule ? 'rotate-90' : ''}`} />
              </button>
            </div>

            <div className="bg-white rounded-2xl border border-[#e0e8db] p-5">
              <h3 className="font-bold text-sm uppercase tracking-wider text-[#a8b5a0] mb-4">{TEXTS.statsTitle}</h3>
              <div className="space-y-4">
                {visibleStats.map((stat, i) => (
                  <motion.div key={stat.id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4, delay: i * 0.1 }}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-sm text-[#5a6b5f]">{stat.label}</span>
                      <span className="text-lg font-black" style={{ color: stat.color }}>{stat.value}</span>
                    </div>
                    <ProgressBar value={stat.value} max={Math.max(stat.value * 1.5, 100)} color={stat.color} />
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-[#e0e8db] p-5">
              <h3 className="font-bold text-sm uppercase tracking-wider text-[#a8b5a0] mb-4">{TEXTS.activityTitle}</h3>
              <div className="space-y-3">
                {ACTIVITY.map((act, i) => (
                  <motion.div key={act.id} initial={{ opacity: 0, x: 15 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3, delay: i * 0.06 }} className="flex items-start gap-2.5">
                    <div className="h-7 w-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5" style={{ backgroundColor: `${act.color}15` }}>
                      <div className="h-2 w-2 rounded-full" style={{ backgroundColor: act.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-[#1a332a] leading-snug">{act.texto}</p>
                      <p className="text-[10px] text-[#a8b5a0] mt-0.5">{act.tiempo}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="bg-[#2d4a3e] rounded-2xl p-5 text-white">
              <h3 className="font-bold text-sm uppercase tracking-wider text-[#8bc34a] mb-4">{TEXTS.contactTitle}</h3>
              <div className="space-y-3">
                <a href={`tel:${parkInfo.telefono}`} className="flex items-center gap-2 text-sm hover:text-[#8bc34a] transition-colors">
                  <Phone className="h-4 w-4" />
                  {parkInfo.telefono}
                </a>
                <a href={`mailto:${parkInfo.email}`} className="flex items-center gap-2 text-sm hover:text-[#8bc34a] transition-colors">
                  <Mail className="h-4 w-4" />
                  {parkInfo.email}
                </a>
                <a href={`https://${parkInfo.web}`} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-sm hover:text-[#8bc34a] transition-colors">
                  <Globe className="h-4 w-4" />
                  {parkInfo.web}
                </a>
              </div>
              <button
                onClick={handleDirections}
                className="mt-4 w-full bg-[#8bc34a] text-[#1a332a] py-2.5 rounded-xl font-bold text-sm hover:bg-[#9ccc65] transition-colors flex items-center justify-center gap-2"
              >
                <Navigation className="h-4 w-4" />
                Cómo llegar
              </button>
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showGallery && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
            onClick={() => setShowGallery(false)}
          >
            <button
              className="absolute top-4 right-4 text-white p-2 hover:bg-white/10 rounded-full transition-colors"
              onClick={() => setShowGallery(false)}
              aria-label="Cerrar galería"
            >
              <X className="h-6 w-6" />
            </button>
            <div className={`${GALLERY[activeImage]?.color || GALLERY[0].color} w-full max-w-4xl h-[60vh] rounded-2xl flex items-center justify-center`}>
              <TreePine className="h-40 w-40 text-white opacity-30" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
