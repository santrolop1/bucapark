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
  AlertTriangle,
  ChevronRight,
  Heart,
  Share2,
  Navigation,
  Camera,
  X,
  AlertCircle,
  RefreshCw,
  Clock,
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

// (constantes PARK_INFO, WEATHER, SCHEDULES, ZONES, EVENTS, STATS, ACTIVITY, REVIEWS eliminadas —
//  esos datos eran inventados; ahora se usan solo datos reales del backend)

// TODO: Galería placeholder temporal; backend no guarda imágenes de parque.
const GALLERY = [
  { id: 1, alt: 'Vista aérea del parque', color: 'bg-[#4a6741]' },
  { id: 2, alt: 'Cancha de fútbol', color: 'bg-[#5a7a6b]' },
  { id: 3, alt: 'Zona de picnic', color: 'bg-[#6b8a7a]' },
  { id: 4, alt: 'Auditorio al aire libre', color: 'bg-[#4a5d41]' },
  { id: 5, alt: 'Juegos infantiles', color: 'bg-[#5a6b4a]' },
  { id: 6, alt: 'Sendero principal', color: 'bg-[#6b7a5b]' },
];


// ============================================================
// 2. COMPONENTES AUXILIARES - Pequeños y reutilizables
// ============================================================

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
    if (!park) return null;
    return {
      id:          park._id || park.id || id,
      nombre:      park.nombre || 'Parque',
      descripcion: park.descripcion || '',
      direccion:   park.direccion || 'Bucaramanga',
      ciudad:      park.ciudad || '',
      estado:      (park.estado || 'activo').toLowerCase(),
      capacidad:   park.capacidad ?? null,
      inauguracion: getCreatedYear(park.createdAt, null),
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

  if (error || !park || !parkInfo) {
    return (
      <StateView
        title={error === TEXTS.notFoundTitle ? TEXTS.notFoundTitle : TEXTS.errorTitle}
        message={error === TEXTS.notFoundTitle ? null : error}
        actionLabel={TEXTS.retryButton}
        onAction={loadPark}
      />
    );
  }

  // Stats reales: solo eventos y reservas del backend
  const realStats = [
    ...(eventsForPark.length > 0
      ? [{ id: 'eventos', label: 'Eventos activos', value: eventsForPark.length, icon: Calendar, color: '#8bc34a' }]
      : []),
    ...(Number.isFinite(reservationsCount)
      ? [{ id: 'reservas', label: 'Reservas', value: reservationsCount, icon: Users, color: '#2d4a3e' }]
      : []),
    ...(parkInfo?.capacidad
      ? [{ id: 'capacidad', label: 'Capacidad', value: parkInfo.capacidad, icon: Users, color: '#2196f3' }]
      : []),
  ];

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
                      (parkInfo.estado || '').toLowerCase() === 'activo' ? 'bg-[#8bc34a] text-[#1a332a]' : 'bg-[#ff9800] text-white'
                    }`}>
                      {(parkInfo.estado || '').toLowerCase() === 'activo' ? 'Abierto ahora' : 'Cerrado'}
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
                <h1 className="text-3xl font-black leading-tight mb-4">{parkInfo.nombre}</h1>

                <div className="flex items-start gap-2 mb-4">
                  <MapPin className="h-4 w-4 text-[#8bc34a] mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-[#5a6b5f]">{parkInfo.direccion}</p>
                    <p className="text-xs text-[#a8b5a0]">{parkInfo.ciudad}</p>
                  </div>
                </div>

                {/* Solo datos reales disponibles en el backend */}
                {(parkInfo.capacidad || parkInfo.inauguracion) && (
                  <div className="grid grid-cols-2 gap-3 mb-5">
                    {parkInfo.capacidad && (
                      <div className="bg-[#f8faf6] rounded-xl p-3 text-center">
                        <p className="text-lg font-black text-[#2d4a3e]">{parkInfo.capacidad}</p>
                        <p className="text-xs text-[#a8b5a0]">Capacidad</p>
                      </div>
                    )}
                    {parkInfo.inauguracion && (
                      <div className="bg-[#f8faf6] rounded-xl p-3 text-center">
                        <p className="text-lg font-black text-[#2d4a3e]">{parkInfo.inauguracion}</p>
                        <p className="text-xs text-[#a8b5a0]">Desde</p>
                      </div>
                    )}
                  </div>
                )}

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
              <div className="bg-white rounded-2xl border border-[#e0e8db] p-8 text-center">
                <Clock className="h-10 w-10 text-[#e0e8db] mx-auto mb-3" />
                <p className="font-bold text-[#1a332a] mb-1">Próximamente</p>
                <p className="text-sm text-[#a8b5a0]">Las zonas y canchas disponibles estarán cargadas próximamente.</p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-black mb-4">{TEXTS.eventsTitle}</h2>
              <div className="bg-white rounded-2xl border border-[#e0e8db] overflow-hidden">
                {eventsForPark.length === 0 ? (
                  <p className="text-[#a8b5a0] text-sm py-10 text-center">No hay eventos próximos para este parque.</p>
                ) : (
                  eventsForPark.map((evento, i) => (
                    <motion.div
                      key={evento.id}
                      initial={{ opacity: 0, x: -15 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.4, delay: i * 0.1 }}
                      className={`flex items-center gap-4 p-4 ${i !== eventsForPark.length - 1 ? 'border-b border-[#f8faf6]' : ''} hover:bg-[#f8faf6] transition-colors`}
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
                    </motion.div>
                  ))
                )}
              </div>
            </section>

            <section>
              <h2 className="text-xl font-black mb-4">{TEXTS.reviewsTitle}</h2>
              <div className="bg-white rounded-2xl border border-[#e0e8db] p-8 text-center">
                <Clock className="h-10 w-10 text-[#e0e8db] mx-auto mb-3" />
                <p className="font-bold text-[#1a332a] mb-1">Próximamente</p>
                <p className="text-sm text-[#a8b5a0]">Las opiniones de los usuarios estarán disponibles próximamente.</p>
              </div>
            </section>
          </div>

          <div className="space-y-6">
            {/* Clima — sin endpoint real */}
            <div className="bg-white rounded-2xl border border-[#e0e8db] p-5">
              <h3 className="font-bold text-sm uppercase tracking-wider text-[#a8b5a0] mb-4">{TEXTS.weatherTitle}</h3>
              <div className="flex flex-col items-center py-3 text-center">
                <Clock className="h-8 w-8 text-[#e0e8db] mb-2" />
                <p className="font-bold text-sm text-[#1a332a]">Próximamente</p>
                <p className="text-xs text-[#a8b5a0] mt-1">El clima en tiempo real no está disponible aún.</p>
              </div>
            </div>

            {/* Horarios — sin endpoint real */}
            <div className="bg-white rounded-2xl border border-[#e0e8db] p-5">
              <h3 className="font-bold text-sm uppercase tracking-wider text-[#a8b5a0] mb-4">{TEXTS.scheduleTitle}</h3>
              <div className="flex flex-col items-center py-3 text-center">
                <Clock className="h-8 w-8 text-[#e0e8db] mb-2" />
                <p className="font-bold text-sm text-[#1a332a]">No disponible aún</p>
                <p className="text-xs text-[#a8b5a0] mt-1">Los horarios del parque aún no están en el sistema.</p>
              </div>
            </div>

            {/* Stats reales */}
            {realStats.length > 0 && (
              <div className="bg-white rounded-2xl border border-[#e0e8db] p-5">
                <h3 className="font-bold text-sm uppercase tracking-wider text-[#a8b5a0] mb-4">{TEXTS.statsTitle}</h3>
                <div className="space-y-4">
                  {realStats.map((stat, i) => (
                    <motion.div key={stat.id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4, delay: i * 0.1 }}>
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
            )}

            {/* Actividad — sin endpoint real */}
            <div className="bg-white rounded-2xl border border-[#e0e8db] p-5">
              <h3 className="font-bold text-sm uppercase tracking-wider text-[#a8b5a0] mb-4">{TEXTS.activityTitle}</h3>
              <div className="flex flex-col items-center py-3 text-center">
                <Clock className="h-8 w-8 text-[#e0e8db] mb-2" />
                <p className="font-bold text-sm text-[#1a332a]">Próximamente</p>
                <p className="text-xs text-[#a8b5a0] mt-1">La actividad reciente del parque estará disponible próximamente.</p>
              </div>
            </div>

            {/* Cómo llegar — solo dato real (dirección) */}
            <div className="bg-[#2d4a3e] rounded-2xl p-5 text-white">
              <h3 className="font-bold text-sm uppercase tracking-wider text-[#8bc34a] mb-3">Ubicación</h3>
              <p className="text-sm text-white/80 mb-1">{parkInfo.direccion}</p>
              {parkInfo.ciudad && <p className="text-xs text-white/60 mb-4">{parkInfo.ciudad}</p>}
              <button
                onClick={handleDirections}
                className="mt-2 w-full bg-[#8bc34a] text-[#1a332a] py-2.5 rounded-xl font-bold text-sm hover:bg-[#9ccc65] transition-colors flex items-center justify-center gap-2"
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
