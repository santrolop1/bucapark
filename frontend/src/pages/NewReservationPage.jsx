// src/pages/NewReservationPage.jsx
// ============================================================
// NEW RESERVATION PAGE - BUCAPARK
// ============================================================
// Todo el contenido editable está ARRIBA en objetos/arrays.
// Abajo solo está la UI y las animaciones.
// Fácil de editar para juniors.
// ============================================================

import { useState, useEffect, useMemo, useCallback } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { parkService, reservationService } from '../api/services';
import {
  ArrowLeft,
  Calendar,
  Clock,
  Users,
  MapPin,
  TreePine,
  CheckCircle2,
  AlertTriangle,
  Info,
  ChevronRight,
  CreditCard,
  Shield,
  Sparkles,
  Minus,
  Plus,
  Loader2,
  Check,
  Timer,
  Sun,
  Moon,
  CloudSun,
  Zap,
} from 'lucide-react';

// ============================================================
// 1. CONTENIDO EDITABLE - Todo acá arriba
// ============================================================

// --- Textos generales ---
const TEXTS = {
  backButton: 'Volver al parque',
  pageTitle: 'Nueva reserva',
  pageSubtitle: 'Reservá tu espacio en minutos',
  submitButton: 'Confirmar reserva',
  submitLoading: 'Procesando...',
  submitSuccess: '¡Reserva confirmada!',
  summaryTitle: 'Resumen de tu reserva',
  summarySubtext: 'Revisá los detalles antes de confirmar',
  formTitle: 'Detalles de la reserva',
  formSubtext: 'Completá los campos para reservar',
  availabilityTitle: 'Disponibilidad',
  priceTitle: 'Precio estimado',
  priceSubtext: 'Se cobra al momento de la reserva',
  notesLabel: 'Notas adicionales (opcional)',
  notesPlaceholder: 'Ej: Necesito iluminación extra, traigo equipo propio...',
  requiredField: 'Campo requerido',
  invalidDate: 'Seleccioná una fecha válida',
  invalidTime: 'Seleccioná un horario',
  invalidPeople: 'Seleccioná al menos 1 persona',
  successMessage: 'Tu reserva fue confirmada exitosamente.',
  successSubtext: 'Recibirás un email con los detalles.',
  newReservation: 'Hacer otra reserva',
  viewReservations: 'Ver mis reservas',
  loadingText: 'Verificando disponibilidad...',
  emptySlots: 'No hay horarios disponibles para esta fecha',
  selectDateFirst: 'Seleccioná una fecha para ver horarios',
  parkLoadingTitle: 'Cargando parque...',
  parkErrorTitle: 'No se pudo cargar el parque',
  parkNotFoundTitle: 'Parque no encontrado',
  parkMissingTitle: 'Falta seleccionar un parque',
  parkErrorMessage: 'Verificá el enlace o intentá nuevamente.',
  retryButton: 'Reintentar',
  invalidReservationWindow: 'Elegí un horario que termine antes de medianoche.',
  reservationErrorGeneric: 'No se pudo crear la reserva. Intentá de nuevo.',
};

// --- Tipos de espacio del sistema ---
// Configuración local del sistema. El backend actual no expone un endpoint de espacios por parque,
// por lo que se usan los valores permitidos por la API de reservas.
const SYSTEM_SPACE_TYPES = [
  {
    id: 'cancha-futbol',
    nombre: 'Cancha de Fútbol',
    descripcion: 'Césped sintético profesional',
    icon: 'futbol',
    precioBase: 25000,
    unidad: 'hora',
    capacidadMax: 22,
    popular: true,
    color: '#2d4a3e',
    bgColor: '#e8f5e9',
    imagenColor: 'bg-[#4a6741]',
  },
  {
    id: 'basquetbol',
    nombre: 'Cancha de Baloncesto',
    descripcion: 'Parquet cubierto premium',
    icon: 'basket',
    precioBase: 20000,
    unidad: 'hora',
    capacidadMax: 10,
    popular: true,
    color: '#1565c0',
    bgColor: '#e3f2fd',
    imagenColor: 'bg-[#5a7a6b]',
  },
  {
    id: 'auditorio',
    nombre: 'Auditorio al Aire Libre',
    descripcion: 'Graderías y escenario',
    icon: 'auditorio',
    precioBase: 80000,
    unidad: 'evento',
    capacidadMax: 200,
    popular: false,
    color: '#6a1b9a',
    bgColor: '#f3e5f5',
    imagenColor: 'bg-[#6b8a7a]',
  },
  {
    id: 'yoga',
    nombre: 'Zona Yoga',
    descripcion: 'Deck de madera natural',
    icon: 'yoga',
    precioBase: 0,
    unidad: 'sesión',
    capacidadMax: 30,
    popular: false,
    color: '#8bc34a',
    bgColor: '#f1f8e9',
    imagenColor: 'bg-[#5a6b4a]',
  },
  {
    id: 'picnic-bbq',
    nombre: 'Zona de Picnic',
    descripcion: 'Áreas verdes con mesas',
    icon: 'picnic',
    precioBase: 15000,
    unidad: 'hora',
    capacidadMax: 15,
    popular: false,
    color: '#e65100',
    bgColor: '#fbe9e7',
    imagenColor: 'bg-[#6b7a5b]',
  },
];

// --- Duraciones disponibles ---
const DURATIONS = [
  { value: 1, label: '1 hora', factor: 1 },
  { value: 1.5, label: '1 hora 30 min', factor: 1.5 },
  { value: 2, label: '2 horas', factor: 2 },
  { value: 3, label: '3 horas', factor: 2.8 },
  { value: 4, label: '4 horas', factor: 3.5 },
];

// --- Horarios disponibles por turno ---
// Valores estáticos. El backend no expone un endpoint de horarios disponibles actualmente.
const TIME_SLOTS = [
  { time: '05:00', period: 'morning', label: '5:00 AM', available: true },
  { time: '06:00', period: 'morning', label: '6:00 AM', available: true },
  { time: '07:00', period: 'morning', label: '7:00 AM', available: true },
  { time: '08:00', period: 'morning', label: '8:00 AM', available: true },
  { time: '09:00', period: 'morning', label: '9:00 AM', available: true },
  { time: '10:00', period: 'morning', label: '10:00 AM', available: false },
  { time: '11:00', period: 'morning', label: '11:00 AM', available: true },
  { time: '12:00', period: 'midday', label: '12:00 PM', available: true },
  { time: '13:00', period: 'midday', label: '1:00 PM', available: true },
  { time: '14:00', period: 'afternoon', label: '2:00 PM', available: true },
  { time: '15:00', period: 'afternoon', label: '3:00 PM', available: false },
  { time: '16:00', period: 'afternoon', label: '4:00 PM', available: true },
  { time: '17:00', period: 'afternoon', label: '5:00 PM', available: true },
  { time: '18:00', period: 'evening', label: '6:00 PM', available: true },
  { time: '19:00', period: 'evening', label: '7:00 PM', available: true },
  { time: '20:00', period: 'evening', label: '8:00 PM', available: true },
];

// --- Labels para turnos ---
const PERIOD_LABELS = {
  morning: { label: 'Mañana', icon: Sun },
  midday: { label: 'Mediodía', icon: CloudSun },
  afternoon: { label: 'Tarde', icon: Sun },
  evening: { label: 'Noche', icon: Moon },
};

// --- Features / beneficios visuales ---
const FEATURES = [
  { icon: Shield, text: 'Cancelación gratuita hasta 24h antes' },
  { icon: CreditCard, text: 'Pago seguro en línea' },
  { icon: Sparkles, text: 'Instalaciones verificadas' },
  { icon: Zap, text: 'Confirmación instantánea' },
];


// --- Meses para selector de fecha ---
const MONTHS = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

// --- Días de la semana ---
const WEEKDAYS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

const getParkPayload = (response) => response?.data?.data ?? response?.data ?? null;

const getApiErrorMessage = (error, fallbackMessage) =>
  error?.response?.data?.error ||
  error?.response?.data?.message ||
  fallbackMessage;

const getCreatedDateLabel = (createdAtValue) => {
  if (!createdAtValue) return null;
  const parsed = new Date(createdAtValue);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed.toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' });
};

const toIsoDate = (dateValue) => {
  if (!(dateValue instanceof Date) || Number.isNaN(dateValue.getTime())) return null;
  return dateValue.toISOString();
};

const addDurationToTime = (startTime, durationHours) => {
  if (typeof startTime !== 'string' || !Number.isFinite(durationHours)) return null;

  const [rawHours, rawMinutes] = startTime.split(':');
  const hours = Number(rawHours);
  const minutes = Number(rawMinutes);
  if (!Number.isInteger(hours) || !Number.isInteger(minutes)) return null;

  const startMinutes = hours * 60 + minutes;
  const durationMinutes = Math.round(durationHours * 60);
  const endMinutes = startMinutes + durationMinutes;

  // El backend valida que horaFin > horaInicio en el mismo día.
  if (endMinutes >= 24 * 60) return null;

  const endHours = String(Math.floor(endMinutes / 60)).padStart(2, '0');
  const endRemainingMinutes = String(endMinutes % 60).padStart(2, '0');
  return `${endHours}:${endRemainingMinutes}`;
};

// ============================================================
// 2. COMPONENTES AUXILIARES - Pequeños y reutilizables
// ============================================================

// Botón de acción principal
function PrimaryButton({ children, onClick, disabled, loading, type = 'button', className = '' }) {
  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      whileHover={!disabled && !loading ? { scale: 1.02 } : {}}
      whileTap={!disabled && !loading ? { scale: 0.98 } : {}}
      className={`
        w-full py-4 rounded-xl font-black text-lg
        flex items-center justify-center gap-2
        transition-all duration-300
        shadow-lg shadow-[#2d4a3e]/20
        ${disabled || loading
          ? 'bg-[#a8b5a0] text-white/70 cursor-not-allowed'
          : 'bg-[#2d4a3e] text-white hover:bg-[#1a332a]'
        }
        ${className}
      `}
    >
      {loading && <Loader2 className="h-5 w-5 animate-spin" />}
      {!loading && children}
    </motion.button>
  );
}

// Card contenedor reutilizable
function Card({ children, className = '', delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className={`bg-white rounded-2xl border border-[#e0e8db] overflow-hidden ${className}`}
    >
      {children}
    </motion.div>
  );
}

// Input de formulario estilizado
function FormField({ label, error, children, required = false }) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-bold text-[#1a332a] flex items-center gap-1">
        {label}
        {required && <span className="text-[#f44336]">*</span>}
      </label>
      {children}
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-xs text-[#f44336] font-medium flex items-center gap-1"
        >
          <AlertTriangle className="h-3 w-3" />
          {error}
        </motion.p>
      )}
    </div>
  );
}

// Selector de cantidad con +/-
function QuantitySelector({ value, onChange, min = 1, max = 50 }) {
  return (
    <div className="flex items-center gap-3">
      <motion.button
        type="button"
        whileTap={{ scale: 0.9 }}
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
        className="h-10 w-10 rounded-xl bg-[#f8faf6] border border-[#e0e8db] flex items-center justify-center text-[#2d4a3e] hover:bg-[#e0e8db] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
      >
        <Minus className="h-4 w-4" />
      </motion.button>
      <span className="w-12 text-center font-black text-lg text-[#1a332a]">{value}</span>
      <motion.button
        type="button"
        whileTap={{ scale: 0.9 }}
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
        className="h-10 w-10 rounded-xl bg-[#f8faf6] border border-[#e0e8db] flex items-center justify-center text-[#2d4a3e] hover:bg-[#e0e8db] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
      >
        <Plus className="h-4 w-4" />
      </motion.button>
    </div>
  );
}

// ============================================================
// 3. SECCIONES DE LA PÁGINA
// ============================================================

// --- Navbar simple ---
function Navbar({ backTo = '/parks' }) {
  return (
    <nav className="bg-white/80 backdrop-blur-md border-b border-[#e0e8db] sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        <Link
          to={backTo}
          className="flex items-center gap-2 text-sm font-bold text-[#5a6b5f] hover:text-[#2d4a3e] transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          {TEXTS.backButton}
        </Link>
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 bg-[#2d4a3e] rounded-lg flex items-center justify-center">
            <TreePine className="h-4 w-4 text-white" />
          </div>
          <span className="font-black text-sm text-[#1a332a] hidden sm:block">BUCAPARK</span>
        </div>
      </div>
    </nav>
  );
}

// --- Hero con info del parque ---
function HeroSection({ parkInfo, parkStats }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="mb-8"
    >
      <div className="grid lg:grid-cols-5 gap-4 lg:gap-6">
        {/* Imagen del parque */}
        <div className="lg:col-span-2">
          <div className={`${parkInfo.imagenColor} rounded-2xl h-48 sm:h-56 lg:h-full min-h-[180px] flex items-center justify-center relative overflow-hidden`}>
            <TreePine className="h-24 w-24 text-white opacity-20" />
          </div>
        </div>

        {/* Info del parque */}
        <div className="lg:col-span-3 flex flex-col justify-center">
          <div>
            <h1 className="text-3xl sm:text-4xl font-black leading-tight mb-4 text-[#1a332a]">
              {TEXTS.pageTitle}
            </h1>

            <div className="flex items-start gap-2 mb-4">
              <MapPin className="h-4 w-4 text-[#8bc34a] mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm text-[#5a6b5f]">{parkInfo.direccion}</p>
                <p className="text-xs text-[#a8b5a0]">{parkInfo.ciudad}</p>
              </div>
            </div>

            {/* Stats rápidos */}
            <div className="flex flex-wrap gap-3">
              {parkStats.map((stat, i) => (
                <div key={i} className="bg-[#f8faf6] rounded-xl px-4 py-2.5">
                  <p className="text-sm font-black text-[#2d4a3e]">{stat.value}</p>
                  <p className="text-[10px] text-[#a8b5a0] uppercase tracking-wider font-bold">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.section>
  );
}

// --- Selector de tipo de reserva ---
function TypeSelector({ selected, onSelect }) {
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {SYSTEM_SPACE_TYPES.map((tipo, i) => (
        <motion.button
          key={tipo.id}
          type="button"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: i * 0.05 }}
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onSelect(tipo.id)}
          className={`
            relative text-left rounded-xl border-2 p-4 transition-all duration-300
            ${selected === tipo.id
              ? 'border-[#8bc34a] bg-[#f8faf6] shadow-md'
              : 'border-[#e0e8db] bg-white hover:border-[#c8e6c9] hover:shadow-sm'
            }
          `}
        >
          {/* Imagen placeholder */}
          <div className={`${tipo.imagenColor} rounded-xl h-20 mb-3 flex items-center justify-center`}>
            <TreePine className="h-8 w-8 text-white opacity-30" />
          </div>

          <div className="flex items-start justify-between mb-1">
            <h3 className="font-bold text-sm text-[#1a332a]">{tipo.nombre}</h3>
            {tipo.popular && (
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#ff9800]">★ Popular</span>
            )}
          </div>
          <p className="text-xs text-[#a8b5a0] mb-2">{tipo.descripcion}</p>

          <div className="flex items-center justify-between">
            <span className="text-sm font-black text-[#2d4a3e]">
              {tipo.precioBase === 0 ? 'Gratuito' : `$${tipo.precioBase.toLocaleString()}/${tipo.unidad}`}
            </span>
            <span className="text-xs text-[#a8b5a0] flex items-center gap-1">
              <Users className="h-3 w-3" /> {tipo.capacidadMax}
            </span>
          </div>

          {/* Check indicator */}
          {selected === tipo.id && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute top-3 right-3 h-6 w-6 bg-[#8bc34a] rounded-full flex items-center justify-center"
            >
              <Check className="h-3.5 w-3.5 text-white" />
            </motion.div>
          )}
        </motion.button>
      ))}
    </div>
  );
}

// --- Calendario custom ---
function CalendarPicker({ selectedDate, onSelect }) {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();

  const isToday = (day) => {
    return day === today.getDate() && currentMonth === today.getMonth() && currentYear === today.getFullYear();
  };

  const isSelected = (day) => {
    if (!(selectedDate instanceof Date)) return false;
    return day === selectedDate.getDate() && currentMonth === selectedDate.getMonth() && currentYear === selectedDate.getFullYear();
  };

  const isPast = (day) => {
    const checkDate = new Date(currentYear, currentMonth, day);
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    return checkDate < now;
  };

  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const days = [];
  for (let i = 0; i < firstDayOfMonth; i += 1) {
    days.push(null);
  }
  for (let i = 1; i <= daysInMonth; i += 1) {
    days.push(i);
  }

  return (
    <div className="bg-white rounded-2xl border border-[#e0e8db] p-5">
      {/* Header del calendario */}
      <div className="flex items-center justify-between mb-4">
        <button
          type="button"
          onClick={prevMonth}
          className="p-1.5 hover:bg-[#f8faf6] rounded-lg transition-colors"
        >
          <ChevronRight className="h-4 w-4 text-[#5a6b5f] rotate-180" />
        </button>
        <h3 className="font-bold text-sm text-[#1a332a]">
          {MONTHS[currentMonth]} {currentYear}
        </h3>
        <button
          type="button"
          onClick={nextMonth}
          className="p-1.5 hover:bg-[#f8faf6] rounded-lg transition-colors"
        >
          <ChevronRight className="h-4 w-4 text-[#5a6b5f]" />
        </button>
      </div>

      {/* Días de la semana */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {WEEKDAYS.map((day) => (
          <div key={day} className="text-center text-[10px] font-bold text-[#a8b5a0] uppercase tracking-wider py-1">
            {day}
          </div>
        ))}
      </div>

      {/* Grilla de días */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((day, i) => {
          if (day === null) {
            return <div key={`empty-${i}`} className="h-9" />;
          }

          const past = isPast(day);
          const selected = isSelected(day);
          const todayFlag = isToday(day);

          return (
            <motion.button
              key={day}
              type="button"
              whileHover={!past ? { scale: 1.1 } : {}}
              whileTap={!past ? { scale: 0.95 } : {}}
              onClick={() => !past && onSelect(new Date(currentYear, currentMonth, day))}
              disabled={past}
              className={`
                h-9 w-9 mx-auto rounded-xl text-sm font-bold transition-all duration-200
                ${past
                  ? 'text-[#d0d8cc] cursor-not-allowed'
                  : selected
                    ? 'bg-[#2d4a3e] text-white shadow-md'
                    : todayFlag
                      ? 'bg-[#8bc34a] text-white'
                      : 'text-[#1a332a] hover:bg-[#e8f5e9]'
                }
              `}
            >
              {day}
            </motion.button>
          );
        })}
      </div>

      {/* Leyenda */}
      <div className="flex items-center gap-4 mt-4 pt-3 border-t border-[#f8faf6]">
        <div className="flex items-center gap-1.5">
          <div className="h-3 w-3 rounded-full bg-[#8bc34a]" />
          <span className="text-[10px] text-[#a8b5a0]">Hoy</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-3 w-3 rounded-full bg-[#2d4a3e]" />
          <span className="text-[10px] text-[#a8b5a0]">Seleccionado</span>
        </div>
      </div>
    </div>
  );
}

// --- Selector de horarios ---
function TimeSlotPicker({ selectedTime, onSelect, selectedDate }) {
  const [loading, setLoading] = useState(false);

  // TODO: Simula consulta de disponibilidad hasta integrar backend real.
  useEffect(() => {
    if (selectedDate) {
      const startTimer = setTimeout(() => setLoading(true), 0);
      const endTimer = setTimeout(() => setLoading(false), 600);
      return () => {
        clearTimeout(startTimer);
        clearTimeout(endTimer);
      };
    }
    const resetTimer = setTimeout(() => setLoading(false), 0);
    return () => clearTimeout(resetTimer);
  }, [selectedDate]);

  if (!selectedDate) {
    return (
      <div className="bg-[#f8faf6] rounded-2xl border border-dashed border-[#e0e8db] p-8 text-center">
        <Calendar className="h-8 w-8 text-[#a8b5a0] mx-auto mb-2" />
        <p className="text-sm text-[#a8b5a0] font-medium">{TEXTS.selectDateFirst}</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-[#e0e8db] p-8 text-center">
        <Loader2 className="h-8 w-8 text-[#8bc34a] mx-auto mb-2 animate-spin" />
        <p className="text-sm text-[#a8b5a0] font-medium">{TEXTS.loadingText}</p>
      </div>
    );
  }

  // Agrupar por turno
  const grouped = {};
  TIME_SLOTS.forEach((slot) => {
    if (!grouped[slot.period]) grouped[slot.period] = [];
    grouped[slot.period].push(slot);
  });

  return (
    <div className="space-y-4">
      {Object.entries(grouped).map(([period, slots]) => {
        const PeriodIcon = PERIOD_LABELS[period]?.icon || Sun;
        return (
          <div key={period}>
            <div className="flex items-center gap-2 mb-2">
              <PeriodIcon className="h-4 w-4 text-[#a8b5a0]" />
              <span className="text-xs font-bold text-[#a8b5a0] uppercase tracking-wider">
                {PERIOD_LABELS[period]?.label || period}
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {slots.map((slot) => (
                <motion.button
                  key={slot.time}
                  type="button"
                  whileHover={slot.available ? { scale: 1.05 } : {}}
                  whileTap={slot.available ? { scale: 0.95 } : {}}
                  onClick={() => slot.available && onSelect(slot.time)}
                  disabled={!slot.available}
                  className={`
                    px-3 py-2 rounded-xl text-sm font-bold transition-all duration-200
                    ${!slot.available
                      ? 'bg-[#f8faf6] text-[#d0d8cc] cursor-not-allowed line-through'
                      : selectedTime === slot.time
                        ? 'bg-[#2d4a3e] text-white shadow-md'
                        : 'bg-[#f8faf6] text-[#1a332a] hover:bg-[#e8f5e9] border border-[#e0e8db]'
                    }
                  `}
                >
                  {slot.label}
                </motion.button>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// --- Selector de duración ---
function DurationSelector({ selected, onSelect }) {
  return (
    <div className="flex flex-wrap gap-2">
      {DURATIONS.map((dur) => (
        <motion.button
          key={dur.value}
          type="button"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onSelect(dur.value)}
          className={`
            px-4 py-2.5 rounded-xl text-sm font-bold transition-all duration-200
            ${selected === dur.value
              ? 'bg-[#2d4a3e] text-white shadow-md'
              : 'bg-[#f8faf6] text-[#1a332a] hover:bg-[#e8f5e9] border border-[#e0e8db]'
            }
          `}
        >
          {dur.label}
        </motion.button>
      ))}
    </div>
  );
}

const formatReservationDate = (date) => {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) return 'Fecha no válida';
  return date.toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long' });
};

// --- Resumen visual de la reserva ---
function ReservationSummary({ formData, selectedType }) {
  const tipo = SYSTEM_SPACE_TYPES.find((t) => t.id === selectedType) || null;
  const duracion = DURATIONS.find((d) => d.value === formData.duration) || null;

  const precioTotal = useMemo(() => {
    if (!tipo || tipo.precioBase === 0) return 0;
    const factor = duracion?.factor || 1;
    return Math.round(tipo.precioBase * factor);
  }, [tipo, duracion]);

  const isComplete = Boolean(selectedType && formData.date && formData.time && formData.duration > 0);

  return (
    <div className="space-y-4">
      {/* Card del tipo seleccionado */}
      {tipo && (
        <div className="bg-[#f8faf6] rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className={`${tipo.imagenColor} h-12 w-12 rounded-xl flex items-center justify-center flex-shrink-0`}>
              <TreePine className="h-5 w-5 text-white opacity-50" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-sm text-[#1a332a]">{tipo.nombre}</p>
              <p className="text-xs text-[#a8b5a0]">{tipo.descripcion}</p>
            </div>
          </div>
        </div>
      )}

      {/* Detalles */}
      <div className="space-y-3">
        {formData.date && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-[#5a6b5f]">
              <Calendar className="h-4 w-4 text-[#8bc34a]" />
              Fecha
            </div>
            <span className="text-sm font-bold text-[#1a332a]">
              {formatReservationDate(formData.date)}
            </span>
          </div>
        )}

        {formData.time && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-[#5a6b5f]">
              <Clock className="h-4 w-4 text-[#8bc34a]" />
              Hora
            </div>
            <span className="text-sm font-bold text-[#1a332a]">{formData.time}</span>
          </div>
        )}

        {formData.duration > 0 && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-[#5a6b5f]">
              <Timer className="h-4 w-4 text-[#8bc34a]" />
              Duración
            </div>
            <span className="text-sm font-bold text-[#1a332a]">{duracion?.label}</span>
          </div>
        )}

        {formData.people > 0 && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-[#5a6b5f]">
              <Users className="h-4 w-4 text-[#8bc34a]" />
              Personas
            </div>
            <span className="text-sm font-bold text-[#1a332a]">{formData.people}</span>
          </div>
        )}
      </div>

      {/* Divider */}
      {(isComplete || precioTotal > 0) && <div className="border-t border-[#e0e8db] pt-3" />}

      {/* Precio */}
      {precioTotal > 0 && (
        <div className="flex items-center justify-between">
          <span className="text-sm text-[#5a6b5f]">Total estimado</span>
          <span className="text-2xl font-black text-[#2d4a3e]">
            ${precioTotal.toLocaleString()}
          </span>
        </div>
      )}

      {tipo && tipo.precioBase === 0 && isComplete && (
        <div className="flex items-center justify-between">
          <span className="text-sm text-[#5a6b5f]">Total</span>
          <span className="text-2xl font-black text-[#8bc34a]">Gratuito</span>
        </div>
      )}

      {/* Estado */}
      {!isComplete && (
        <div className="bg-[#fff8e1] rounded-xl p-3 flex items-center gap-2">
          <Info className="h-4 w-4 text-[#f9a825] flex-shrink-0" />
          <p className="text-xs text-[#5a6b5f]">Completá todos los campos para ver el resumen</p>
        </div>
      )}

      {isComplete && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-[#e8f5e9] rounded-xl p-3 flex items-center gap-2"
        >
          <CheckCircle2 className="h-4 w-4 text-[#2e7d32] flex-shrink-0" />
          <p className="text-xs text-[#2e7d32] font-medium">Listo para confirmar</p>
        </motion.div>
      )}
    </div>
  );
}

// --- Estado de éxito ---
function SuccessState({ onNewReservation, onViewReservations }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-[60vh] flex items-center justify-center"
    >
      <div className="text-center max-w-md mx-auto px-4">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.2 }}
          className="h-24 w-24 bg-[#e8f5e9] rounded-full flex items-center justify-center mx-auto mb-6"
        >
          <CheckCircle2 className="h-12 w-12 text-[#2e7d32]" />
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-3xl font-black text-[#1a332a] mb-2"
        >
          {TEXTS.submitSuccess}
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="text-[#5a6b5f] mb-2"
        >
          {TEXTS.successMessage}
        </motion.p>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="text-sm text-[#a8b5a0] mb-8"
        >
          {TEXTS.successSubtext}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="space-y-3"
        >
          <PrimaryButton onClick={onNewReservation}>
            {TEXTS.newReservation}
          </PrimaryButton>
          <button
            type="button"
            onClick={onViewReservations}
            className="w-full py-3 rounded-xl font-bold text-sm text-[#2d4a3e] border-2 border-[#2d4a3e] hover:bg-[#f8faf6] transition-colors"
          >
            {TEXTS.viewReservations}
          </button>
        </motion.div>
      </div>
    </motion.div>
  );
}

// --- Features / beneficios ---
function FeaturesBar() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {FEATURES.map((feature, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 * i }}
          className="flex items-center gap-2.5 bg-white rounded-xl border border-[#e0e8db] p-3"
        >
          <div className="h-8 w-8 bg-[#f8faf6] rounded-lg flex items-center justify-center flex-shrink-0">
            <feature.icon className="h-4 w-4 text-[#8bc34a]" />
          </div>
          <p className="text-xs font-bold text-[#5a6b5f] leading-tight">{feature.text}</p>
        </motion.div>
      ))}
    </div>
  );
}

function PageState({ title, message, onRetry, backTo }) {
  return (
    <div className="min-h-screen bg-[#f4f7f0] text-[#1a332a]">
      <Navbar backTo={backTo} />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="min-h-[60vh] flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl border border-[#e0e8db] p-8 text-center max-w-md w-full"
          >
            <AlertTriangle className="h-12 w-12 text-[#ff9800] mx-auto mb-4" />
            <h2 className="text-2xl font-black mb-2">{title}</h2>
            {message && <p className="text-sm text-[#5a6b5f] mb-6">{message}</p>}
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                to="/parks"
                className="flex-1 py-3 rounded-xl font-bold text-sm bg-[#f8faf6] text-[#2d4a3e] hover:bg-[#e0e8db] transition-colors"
              >
                Volver a parques
              </Link>
              {typeof onRetry === 'function' && (
                <button
                  type="button"
                  onClick={onRetry}
                  className="flex-1 py-3 rounded-xl font-bold text-sm bg-[#2d4a3e] text-white hover:bg-[#1a332a] transition-colors"
                >
                  {TEXTS.retryButton}
                </button>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// 4. PÁGINA PRINCIPAL
// ============================================================

export default function NewReservationPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const parkFromQuery = (searchParams.get('park') || '').trim();

  // Estados del formulario
  const [selectedType, setSelectedType] = useState('');
  const [formData, setFormData] = useState({
    date: null,
    time: '',
    duration: 1,
    people: 1,
    notes: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [park, setPark] = useState(null);
  const [parkLoading, setParkLoading] = useState(true);
  const [parkError, setParkError] = useState(null);

  const loadPark = useCallback(async () => {
    if (!parkFromQuery) {
      setPark(null);
      setParkError({ title: TEXTS.parkMissingTitle, message: TEXTS.parkErrorMessage });
      setParkLoading(false);
      return;
    }

    setParkLoading(true);
    setParkError(null);

    try {
      const response = await parkService.getById(parkFromQuery);
      const parkData = getParkPayload(response);

      if (!parkData || typeof parkData !== 'object') {
        setPark(null);
        setParkError({ title: TEXTS.parkNotFoundTitle, message: TEXTS.parkErrorMessage });
        return;
      }

      setPark(parkData);
    } catch (error) {
      const isNotFound = error?.response?.status === 404;
      setPark(null);
      setParkError({
        title: isNotFound ? TEXTS.parkNotFoundTitle : TEXTS.parkErrorTitle,
        message: isNotFound ? TEXTS.parkErrorMessage : getApiErrorMessage(error, TEXTS.parkErrorMessage),
      });
    } finally {
      setParkLoading(false);
    }
  }, [parkFromQuery]);

  useEffect(() => {
    const timer = setTimeout(loadPark, 0);
    return () => clearTimeout(timer);
  }, [loadPark]);

  const parkInfo = useMemo(() => ({
    id:          park?._id || park?.id || parkFromQuery || '',
    nombre:      park?.nombre || 'Parque',
    descripcion: park?.descripcion || '',
    direccion:   park?.direccion || '',
    ciudad:      park?.ciudad || '',
    imagenColor: 'bg-[#4a6741]', // placeholder visual
  }), [park, parkFromQuery]);

  const visibleParkStats = useMemo(() => {
    const stats = [];
    if (park?.capacidad) stats.push({ label: 'Capacidad', value: String(park.capacidad) });
    const createdLabel = getCreatedDateLabel(park?.createdAt);
    if (createdLabel) stats.push({ label: 'Registro', value: createdLabel });
    return stats;
  }, [park]);

  const selectedTypeData = useMemo(
    () => SYSTEM_SPACE_TYPES.find((type) => type.id === selectedType) || null,
    [selectedType]
  );

  const selectedTypeMaxCapacity = selectedTypeData?.capacidadMax || 50;

  const backToParkPath = parkInfo.id ? `/parks/${parkInfo.id}` : '/parks';

  // Validación
  const validate = () => {
    const newErrors = {};
    if (!parkInfo.id) newErrors.submit = TEXTS.parkMissingTitle;
    if (!selectedType) newErrors.type = 'Seleccioná un tipo de reserva';
    if (!formData.date) newErrors.date = TEXTS.invalidDate;
    if (!formData.time) newErrors.time = TEXTS.invalidTime;
    if (formData.people < 1) newErrors.people = TEXTS.invalidPeople;
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // TODO: Falta integración de pagos/aprobaciones y disponibilidad en tiempo real.
  const handleSubmit = async (e) => {
    e?.preventDefault?.();
    if (loading) return;
    if (!validate()) return;

    const fechaIso = toIsoDate(formData.date);
    const horaFin = addDurationToTime(formData.time, formData.duration);
    if (!fechaIso || !horaFin) {
      setErrors((prev) => ({
        ...prev,
        time: TEXTS.invalidReservationWindow,
      }));
      return;
    }

    const payload = {
      parkId: parkInfo.id,
      tipoEspacio: selectedTypeData?.id || '',
      fecha: fechaIso,
      horaInicio: formData.time,
      duracion: formData.duration,
      personas: formData.people,
      proposito: selectedTypeData?.nombre || 'Reserva',
      notas: formData.notes.trim(),
      precioTotal: Number.isFinite(selectedTypeData?.precioBase)
        ? selectedTypeData.precioBase * formData.duration
        : undefined,
    };

    setLoading(true);
    setErrors((prev) => {
      const next = { ...prev };
      delete next.submit;
      return next;
    });

    try {
      await reservationService.create(payload);
      setSuccess(true);
    } catch (error) {
      setErrors((prev) => ({
        ...prev,
        submit: getApiErrorMessage(error, TEXTS.reservationErrorGeneric),
      }));
    } finally {
      setLoading(false);
    }
  };

  // Reset
  const handleNewReservation = () => {
    setSelectedType('');
    setFormData({ date: null, time: '', duration: 1, people: 1, notes: '' });
    setErrors({});
    setSuccess(false);
  };

  // Update form field helper
  const updateField = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field] || errors.submit) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        delete next.submit;
        return next;
      });
    }
  };

  if (parkLoading) {
    return (
      <div className="min-h-screen bg-[#f4f7f0] text-[#1a332a]">
        <Navbar backTo="/parks" />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
          <div className="min-h-[60vh] flex items-center justify-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl border border-[#e0e8db] p-8 text-center"
            >
              <Loader2 className="h-10 w-10 text-[#8bc34a] mx-auto mb-3 animate-spin" />
              <p className="font-black">{TEXTS.parkLoadingTitle}</p>
            </motion.div>
          </div>
        </div>
      </div>
    );
  }

  if (parkError) {
    return (
      <PageState
        title={parkError.title}
        message={parkError.message}
        onRetry={parkFromQuery ? loadPark : null}
        backTo={backToParkPath}
      />
    );
  }

  // Si está en estado de éxito, mostrar pantalla de éxito
  if (success) {
    return (
      <div className="min-h-screen bg-[#f4f7f0] text-[#1a332a]">
        <Navbar backTo={backToParkPath} />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
          <SuccessState
            onNewReservation={handleNewReservation}
            onViewReservations={() => navigate('/reservations')}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f4f7f0] text-[#1a332a]">
      <Navbar backTo={backToParkPath} />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {/* Hero */}
        <HeroSection parkInfo={parkInfo} parkStats={visibleParkStats} />

        {/* Features bar */}
        <div className="mb-8">
          <FeaturesBar />
        </div>

        <div className="grid lg:grid-cols-5 gap-6 lg:gap-8">
          {/* ============================================
              COLUMNA IZQUIERDA (3/5) - Formulario
          ============================================ */}
          <div className="lg:col-span-3 space-y-8">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Sección: Tipo de reserva */}
              <Card delay={0.1}>
                <div className="p-5 sm:p-6">
                  <FormField label="¿Qué querés reservar?" error={errors.type} required>
                    <TypeSelector selected={selectedType} onSelect={(id) => {
                      setSelectedType(id);
                      setErrors((prev) => {
                        const next = { ...prev };
                        delete next.type;
                        delete next.submit;
                        return next;
                      });
                    }} />
                  </FormField>
                </div>
              </Card>

              {/* Sección: Fecha y hora */}
              <Card delay={0.2}>
                <div className="p-5 sm:p-6 space-y-6">
                  <h2 className="text-lg font-black text-[#1a332a]">{TEXTS.availabilityTitle}</h2>

                  <div className="grid sm:grid-cols-2 gap-6">
                    <FormField label="Fecha" error={errors.date} required>
                      <CalendarPicker
                        selectedDate={formData.date}
                        onSelect={(date) => {
                          updateField('date', date);
                          updateField('time', ''); // Reset time on date change
                        }}
                      />
                    </FormField>

                    <FormField label="Horario" error={errors.time} required>
                      <TimeSlotPicker
                        selectedDate={formData.date}
                        selectedTime={formData.time}
                        onSelect={(time) => updateField('time', time)}
                      />
                    </FormField>
                  </div>
                </div>
              </Card>

              {/* Sección: Duración y personas */}
              <Card delay={0.3}>
                <div className="p-5 sm:p-6 space-y-6">
                  <FormField label="Duración" required>
                    <DurationSelector
                      selected={formData.duration}
                      onSelect={(d) => updateField('duration', d)}
                    />
                  </FormField>

                  <FormField label="Cantidad de personas" error={errors.people} required>
                    <QuantitySelector
                      value={formData.people}
                      onChange={(v) => updateField('people', v)}
                      max={selectedTypeMaxCapacity}
                    />
                  </FormField>
                </div>
              </Card>

              {/* Sección: Notas */}
              <Card delay={0.4}>
                <div className="p-5 sm:p-6">
                  <FormField label={TEXTS.notesLabel}>
                    <textarea
                      value={formData.notes}
                      onChange={(e) => updateField('notes', e.target.value)}
                      placeholder={TEXTS.notesPlaceholder}
                      rows={3}
                      className="w-full bg-[#f8faf6] border border-[#e0e8db] rounded-xl px-4 py-3 text-sm text-[#1a332a] placeholder:text-[#a8b5a0] focus:outline-none focus:border-[#8bc34a] focus:ring-2 focus:ring-[#8bc34a]/20 transition-all resize-none"
                    />
                  </FormField>
                </div>
              </Card>

              {/* Submit button (mobile only - visible también en desktop al final del form) */}
              {errors.submit && (
                <div className="bg-[#fff8e1] rounded-xl p-3 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-[#f9a825] flex-shrink-0" />
                  <p className="text-xs text-[#5a6b5f]">{errors.submit}</p>
                </div>
              )}
              <div className="lg:hidden">
                <PrimaryButton type="submit" loading={loading} disabled={loading}>
                  {loading ? TEXTS.submitLoading : TEXTS.submitButton}
                </PrimaryButton>
              </div>
            </form>
          </div>

          {/* ============================================
              COLUMNA DERECHA (2/5) - Sidebar resumen
          ============================================ */}
          <div className="lg:col-span-2">
            <div className="lg:sticky lg:top-20 space-y-6">
              {/* Resumen de reserva */}
              <Card delay={0.3}>
                <div className="p-5 sm:p-6">
                  <h3 className="font-bold text-lg text-[#1a332a] mb-1">{TEXTS.summaryTitle}</h3>
                  <p className="text-xs text-[#a8b5a0] mb-5">{TEXTS.summarySubtext}</p>

                  <ReservationSummary formData={formData} selectedType={selectedType} />
                </div>
              </Card>

              {/* Precio y CTA */}
              <Card delay={0.4}>
                <div className="p-5 sm:p-6 space-y-4">
                  <div className="flex items-center gap-2 mb-2">
                    <CreditCard className="h-4 w-4 text-[#8bc34a]" />
                    <span className="text-xs font-bold text-[#a8b5a0] uppercase tracking-wider">
                      {TEXTS.priceTitle}
                    </span>
                  </div>

                  <ReservationSummary formData={formData} selectedType={selectedType} />

                  {errors.submit && (
                    <div className="bg-[#fff8e1] rounded-xl p-3 flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-[#f9a825] flex-shrink-0" />
                      <p className="text-xs text-[#5a6b5f]">{errors.submit}</p>
                    </div>
                  )}

                  <div className="hidden lg:block pt-2">
                    <PrimaryButton
                      onClick={handleSubmit}
                      loading={loading}
                      disabled={loading}
                    >
                      {loading ? TEXTS.submitLoading : TEXTS.submitButton}
                    </PrimaryButton>
                  </div>

                  <p className="text-[10px] text-[#a8b5a0] text-center leading-relaxed">
                    Al confirmar, aceptás los términos y condiciones de uso del parque.
                    Cancelación gratuita hasta 24 horas antes.
                  </p>
                </div>
              </Card>

              {/* Info de contacto */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
                className="bg-[#2d4a3e] rounded-2xl p-5 text-white"
              >
                <h3 className="font-bold text-sm uppercase tracking-wider text-[#8bc34a] mb-3">
                  ¿Necesitás ayuda?
                </h3>
                <p className="text-sm text-white/80">
                  Si tenés dudas sobre tu reserva, contactanos por los canales oficiales de BUCAPARK.
                </p>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
