import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { eventService, parkService } from '../api/services';
import { useAuth } from '../contexts/AuthContext';
import {
  ArrowLeft, Calendar, Clock, MapPin, TreePine, Users, CheckCircle2,
  AlertTriangle, Loader2, Sparkles, Music, Dumbbell, Palette, BookOpen,
} from 'lucide-react';

const CATEGORIES = [
  { id: 'deporte', label: 'Deporte', icon: Dumbbell, color: '#8bc34a' },
  { id: 'cultura', label: 'Cultura', icon: Palette, color: '#ff9800' },
  { id: 'musica', label: 'Música', icon: Music, color: '#e91e63' },
  { id: 'educacion', label: 'Educación', icon: BookOpen, color: '#2196f3' },
  { id: 'naturaleza', label: 'Naturaleza', icon: TreePine, color: '#4caf50' },
  { id: 'social', label: 'Social', icon: Users, color: '#9c27b0' },
];

const HOUR_OPTIONS = Array.from({ length: 17 }, (_, i) => {
  const h = i + 5;
  return { value: `${String(h).padStart(2, '0')}:00`, label: `${h > 12 ? h - 12 : h}:00 ${h >= 12 ? 'PM' : 'AM'}` };
});

export default function NewEventPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [parks, setParks] = useState([]);
  const [parksLoading, setParksLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const [form, setForm] = useState({
    nombre: '',
    descripcion: '',
    parkId: '',
    espacio: '',
    fecha: '',
    horaInicio: '08:00',
    horaFin: '10:00',
    categoria: 'social',
  });
  const [errors, setErrors] = useState({});

  const loadParks = useCallback(async () => {
    try {
      const res = await parkService.getAll();
      const data = res.data?.data ?? res.data ?? [];
      setParks(Array.isArray(data) ? data : []);
    } catch {
      // continúa sin parques
    } finally {
      setParksLoading(false);
    }
  }, []);

  useEffect(() => { loadParks(); }, [loadParks]);

  const update = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setErrors(prev => { const n = { ...prev }; delete n[field]; return n; });
    if (submitError) setSubmitError('');
  };

  const validate = () => {
    const e = {};
    if (!form.nombre.trim()) e.nombre = 'El nombre es requerido';
    if (!form.descripcion.trim()) e.descripcion = 'La descripción es requerida';
    if (!form.parkId) e.parkId = 'Seleccioná un parque';
    if (!form.espacio.trim()) e.espacio = 'Indicá el espacio o zona';
    if (!form.fecha) e.fecha = 'La fecha es requerida';
    if (!form.horaInicio) e.horaInicio = 'Seleccioná hora de inicio';
    if (!form.horaFin) e.horaFin = 'Seleccioná hora de fin';
    if (form.horaInicio >= form.horaFin) e.horaFin = 'La hora de fin debe ser posterior al inicio';
    const selected = new Date(form.fecha);
    const today = new Date(); today.setHours(0, 0, 0, 0);
    if (form.fecha && selected < today) e.fecha = 'La fecha debe ser futura';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    if (!isAuthenticated) { navigate('/login', { state: { from: { pathname: '/events/new' } } }); return; }

    setSubmitting(true);
    setSubmitError('');
    try {
      await eventService.create({
        nombre: form.nombre.trim(),
        descripcion: form.descripcion.trim(),
        parkId: form.parkId,
        espacio: form.espacio.trim(),
        fecha: new Date(form.fecha).toISOString(),
        horaInicio: form.horaInicio,
        horaFin: form.horaFin,
        categoria: form.categoria,
      });
      setSuccess(true);
    } catch (err) {
      setSubmitError(
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        'No se pudo crear el evento. Intentá de nuevo.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const minDate = new Date().toISOString().split('T')[0];

  if (success) {
    return (
      <div className="min-h-screen bg-[#f4f7f0] flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-2xl border border-[#e0e8db] p-10 text-center max-w-md w-full shadow-xl"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
            className="h-20 w-20 bg-[#e8f5e9] rounded-full flex items-center justify-center mx-auto mb-5"
          >
            <CheckCircle2 className="h-10 w-10 text-[#2e7d32]" />
          </motion.div>
          <h2 className="text-2xl font-black text-[#1a332a] mb-2">¡Evento enviado!</h2>
          <p className="text-[#5a6b5f] mb-2">Tu evento fue enviado para revisión.</p>
          <p className="text-sm text-[#a8b5a0] mb-8">Un administrador lo revisará y aprobará pronto.</p>
          <div className="space-y-3">
            <button
              type="button"
              onClick={() => { setSuccess(false); setForm({ nombre: '', descripcion: '', parkId: '', espacio: '', fecha: '', horaInicio: '08:00', horaFin: '10:00', categoria: 'social' }); setErrors({}); }}
              className="w-full py-3 bg-[#2d4a3e] text-white rounded-xl font-bold hover:bg-[#1a332a] transition-colors"
            >
              Crear otro evento
            </button>
            <Link to="/events" className="block w-full py-3 bg-[#f8faf6] text-[#2d4a3e] rounded-xl font-bold hover:bg-[#e0e8db] transition-colors text-center">
              Ver todos los eventos
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f4f7f0] text-[#1a332a]">
      {/* Navbar */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-[#e0e8db] sticky top-0 z-50">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link to="/events" className="flex items-center gap-2 text-sm font-bold text-[#5a6b5f] hover:text-[#2d4a3e] transition-colors">
            <ArrowLeft className="h-4 w-4" />
            Volver a eventos
          </Link>
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-[#8bc34a]" />
            <span className="font-black text-sm hidden sm:block">BUCAPARK</span>
          </div>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-3xl font-black mb-2">Crear evento</h1>
          <p className="text-[#5a6b5f]">Completá el formulario para proponer tu actividad en un parque de Bucaramanga.</p>
        </motion.div>

        {!isAuthenticated && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="mb-6 bg-[#fff3e0] border border-[#ffcc02] rounded-xl p-4 flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-[#f9a825] flex-shrink-0" />
            <p className="text-sm text-[#5a6b5f]">
              Necesitás <Link to="/login" className="font-bold text-[#2d4a3e] underline">iniciar sesión</Link> para crear un evento.
            </p>
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Nombre */}
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl border border-[#e0e8db] p-6 space-y-5">
            <h2 className="font-bold text-lg">Información básica</h2>

            <div className="space-y-1.5">
              <label className="text-sm font-bold text-[#1a332a]">Nombre del evento *</label>
              <input
                type="text"
                value={form.nombre}
                onChange={e => update('nombre', e.target.value)}
                placeholder="Ej: Torneo de Fútbol Barrial"
                className={`w-full px-4 py-3 bg-[#f8faf6] border-2 rounded-xl text-sm transition-all outline-none focus:bg-white ${errors.nombre ? 'border-red-400' : 'border-[#e0e8db] focus:border-[#8bc34a]'}`}
              />
              {errors.nombre && <p className="text-xs text-red-500 flex items-center gap-1"><AlertTriangle className="h-3 w-3" />{errors.nombre}</p>}
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-bold text-[#1a332a]">Descripción *</label>
              <textarea
                value={form.descripcion}
                onChange={e => update('descripcion', e.target.value)}
                placeholder="Describí la actividad, qué se necesita traer, público objetivo..."
                rows={3}
                className={`w-full px-4 py-3 bg-[#f8faf6] border-2 rounded-xl text-sm transition-all outline-none focus:bg-white resize-none ${errors.descripcion ? 'border-red-400' : 'border-[#e0e8db] focus:border-[#8bc34a]'}`}
              />
              {errors.descripcion && <p className="text-xs text-red-500 flex items-center gap-1"><AlertTriangle className="h-3 w-3" />{errors.descripcion}</p>}
            </div>

            {/* Categoría */}
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-[#1a332a]">Categoría</label>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map(cat => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => update('categoria', cat.id)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold transition-all ${form.categoria === cat.id ? 'text-white shadow-md' : 'bg-[#f8faf6] text-[#5a6b5f] hover:bg-[#e0e8db]'}`}
                    style={form.categoria === cat.id ? { backgroundColor: cat.color } : {}}
                  >
                    <cat.icon className="h-3.5 w-3.5" />
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Ubicación */}
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
            className="bg-white rounded-2xl border border-[#e0e8db] p-6 space-y-5">
            <h2 className="font-bold text-lg flex items-center gap-2">
              <MapPin className="h-5 w-5 text-[#8bc34a]" />
              Ubicación
            </h2>

            <div className="space-y-1.5">
              <label className="text-sm font-bold text-[#1a332a]">Parque *</label>
              {parksLoading ? (
                <div className="flex items-center gap-2 text-sm text-[#a8b5a0] py-2">
                  <Loader2 className="h-4 w-4 animate-spin" /> Cargando parques...
                </div>
              ) : (
                <select
                  value={form.parkId}
                  onChange={e => update('parkId', e.target.value)}
                  className={`w-full px-4 py-3 bg-[#f8faf6] border-2 rounded-xl text-sm transition-all outline-none focus:bg-white ${errors.parkId ? 'border-red-400' : 'border-[#e0e8db] focus:border-[#8bc34a]'}`}
                >
                  <option value="">Seleccioná un parque</option>
                  {parks.map(p => (
                    <option key={p._id} value={p._id}>{p.nombre} — {p.direccion}</option>
                  ))}
                </select>
              )}
              {errors.parkId && <p className="text-xs text-red-500 flex items-center gap-1"><AlertTriangle className="h-3 w-3" />{errors.parkId}</p>}
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-bold text-[#1a332a]">Espacio o zona específica *</label>
              <input
                type="text"
                value={form.espacio}
                onChange={e => update('espacio', e.target.value)}
                placeholder="Ej: Cancha principal, Zona de eventos, Auditorio"
                className={`w-full px-4 py-3 bg-[#f8faf6] border-2 rounded-xl text-sm transition-all outline-none focus:bg-white ${errors.espacio ? 'border-red-400' : 'border-[#e0e8db] focus:border-[#8bc34a]'}`}
              />
              {errors.espacio && <p className="text-xs text-red-500 flex items-center gap-1"><AlertTriangle className="h-3 w-3" />{errors.espacio}</p>}
            </div>
          </motion.div>

          {/* Fecha y hora */}
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl border border-[#e0e8db] p-6 space-y-5">
            <h2 className="font-bold text-lg flex items-center gap-2">
              <Calendar className="h-5 w-5 text-[#8bc34a]" />
              Fecha y horario
            </h2>

            <div className="space-y-1.5">
              <label className="text-sm font-bold text-[#1a332a]">Fecha *</label>
              <input
                type="date"
                min={minDate}
                value={form.fecha}
                onChange={e => update('fecha', e.target.value)}
                className={`w-full px-4 py-3 bg-[#f8faf6] border-2 rounded-xl text-sm transition-all outline-none focus:bg-white ${errors.fecha ? 'border-red-400' : 'border-[#e0e8db] focus:border-[#8bc34a]'}`}
              />
              {errors.fecha && <p className="text-xs text-red-500 flex items-center gap-1"><AlertTriangle className="h-3 w-3" />{errors.fecha}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-[#1a332a] flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5 text-[#8bc34a]" /> Hora inicio *
                </label>
                <select
                  value={form.horaInicio}
                  onChange={e => update('horaInicio', e.target.value)}
                  className={`w-full px-4 py-3 bg-[#f8faf6] border-2 rounded-xl text-sm transition-all outline-none focus:bg-white ${errors.horaInicio ? 'border-red-400' : 'border-[#e0e8db] focus:border-[#8bc34a]'}`}
                >
                  {HOUR_OPTIONS.map(h => <option key={h.value} value={h.value}>{h.label}</option>)}
                </select>
                {errors.horaInicio && <p className="text-xs text-red-500">{errors.horaInicio}</p>}
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-bold text-[#1a332a] flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5 text-[#8bc34a]" /> Hora fin *
                </label>
                <select
                  value={form.horaFin}
                  onChange={e => update('horaFin', e.target.value)}
                  className={`w-full px-4 py-3 bg-[#f8faf6] border-2 rounded-xl text-sm transition-all outline-none focus:bg-white ${errors.horaFin ? 'border-red-400' : 'border-[#e0e8db] focus:border-[#8bc34a]'}`}
                >
                  {HOUR_OPTIONS.map(h => <option key={h.value} value={h.value}>{h.label}</option>)}
                </select>
                {errors.horaFin && <p className="text-xs text-red-500">{errors.horaFin}</p>}
              </div>
            </div>
          </motion.div>

          {/* Error de envío */}
          <AnimatePresence>
            {submitError && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="bg-[#ffebee] border border-[#ffcdd2] rounded-xl p-4 flex items-center gap-3"
              >
                <AlertTriangle className="h-5 w-5 text-[#f44336] flex-shrink-0" />
                <p className="text-sm text-[#c62828]">{submitError}</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Botón submit */}
          <motion.button
            type="submit"
            disabled={submitting}
            whileHover={!submitting ? { scale: 1.01 } : {}}
            whileTap={!submitting ? { scale: 0.99 } : {}}
            className="w-full py-4 bg-[#2d4a3e] text-white rounded-xl font-black text-lg flex items-center justify-center gap-2 hover:bg-[#1a332a] transition-colors disabled:opacity-60 disabled:cursor-not-allowed shadow-lg shadow-[#2d4a3e]/20"
          >
            {submitting ? (
              <><Loader2 className="h-5 w-5 animate-spin" /> Enviando evento...</>
            ) : (
              <><Sparkles className="h-5 w-5" /> Proponer evento</>
            )}
          </motion.button>

          <p className="text-xs text-[#a8b5a0] text-center">
            Los eventos deben ser aprobados por un administrador antes de publicarse.
          </p>
        </form>
      </div>
    </div>
  );
}
