import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { incidentService, parkService } from '../api/services';
import { useAuth } from '../contexts/AuthContext';
import {
  ArrowLeft, MapPin, CheckCircle2, AlertTriangle,
  Loader2, AlertCircle, Shield, Info,
} from 'lucide-react';

const URGENCY_LEVELS = [
  { id: 'Bajo', label: 'Bajo', color: '#8bc34a', bg: '#f1f8e9', desc: 'No requiere atención inmediata' },
  { id: 'Medio', label: 'Medio', color: '#ff9800', bg: '#fff3e0', desc: 'Debe atenderse pronto' },
  { id: 'Alto', label: 'Alto', color: '#f44336', bg: '#ffebee', desc: 'Requiere atención urgente' },
];

const INCIDENT_TYPES = [
  'Mobiliario dañado o roto',
  'Iluminación deficiente',
  'Basura acumulada',
  'Vandalismo o graffiti',
  'Animales peligrosos',
  'Accidente o lesión',
  'Infraestructura en mal estado',
  'Otro',
];

export default function NewIncidentPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [parks, setParks] = useState([]);
  const [parksLoading, setParksLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const [form, setForm] = useState({
    parkId: '',
    tipoIncidente: '',
    descripcion: '',
    ubicacionAprox: '',
    nivelUrgencia: 'Medio',
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

  useEffect(() => {
    const timer = setTimeout(loadParks, 0);
    return () => clearTimeout(timer);
  }, [loadParks]);

  const update = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setErrors(prev => { const n = { ...prev }; delete n[field]; return n; });
    if (submitError) setSubmitError('');
  };

  const validate = () => {
    const e = {};
    if (!form.parkId) e.parkId = 'Seleccioná un parque';
    if (!form.descripcion.trim() && !form.tipoIncidente) e.descripcion = 'Describí el incidente';
    if (!form.descripcion.trim()) e.descripcion = 'La descripción es requerida';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    if (!isAuthenticated) { navigate('/login', { state: { from: { pathname: '/incidents/new' } } }); return; }

    setSubmitting(true);
    setSubmitError('');
    const descFinal = form.tipoIncidente
      ? `[${form.tipoIncidente}] ${form.descripcion.trim()}`
      : form.descripcion.trim();

    try {
      await incidentService.create({
        parkId: form.parkId,
        descripcion: descFinal,
        ubicacionAprox: form.ubicacionAprox.trim() || 'No especificada',
        nivelUrgencia: form.nivelUrgencia,
      });
      setSuccess(true);
    } catch (err) {
      setSubmitError(
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        'No se pudo enviar el reporte. Intentá de nuevo.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setSuccess(false);
    setForm({ parkId: '', tipoIncidente: '', descripcion: '', ubicacionAprox: '', nivelUrgencia: 'Medio' });
    setErrors({});
  };

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
          <h2 className="text-2xl font-black text-[#1a332a] mb-2">¡Reporte enviado!</h2>
          <p className="text-[#5a6b5f] mb-2">Tu reporte fue registrado correctamente.</p>
          <p className="text-sm text-[#a8b5a0] mb-8">El equipo de mantenimiento lo revisará a la brevedad.</p>
          <div className="space-y-3">
            <button type="button" onClick={resetForm}
              className="w-full py-3 bg-[#2d4a3e] text-white rounded-xl font-bold hover:bg-[#1a332a] transition-colors">
              Reportar otro incidente
            </button>
            <Link to="/dashboard" className="block w-full py-3 bg-[#f8faf6] text-[#2d4a3e] rounded-xl font-bold hover:bg-[#e0e8db] transition-colors text-center">
              Volver al dashboard
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
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link to="/dashboard" className="flex items-center gap-2 text-sm font-bold text-[#5a6b5f] hover:text-[#2d4a3e] transition-colors">
            <ArrowLeft className="h-4 w-4" />
            Volver
          </Link>
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-[#ff9800]" />
            <span className="font-black text-sm hidden sm:block">BUCAPARK</span>
          </div>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-4 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-3xl font-black mb-2">Reportar incidente</h1>
          <p className="text-[#5a6b5f]">Ayudanos a mantener los parques en buen estado reportando problemas que encuentres.</p>
        </motion.div>

        {!isAuthenticated && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="mb-6 bg-[#fff3e0] border border-[#ffcc02] rounded-xl p-4 flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-[#f9a825] flex-shrink-0" />
            <p className="text-sm text-[#5a6b5f]">
              Necesitás <Link to="/login" className="font-bold text-[#2d4a3e] underline">iniciar sesión</Link> para reportar un incidente.
            </p>
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Parque y ubicación */}
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl border border-[#e0e8db] p-6 space-y-5">
            <h2 className="font-bold text-lg flex items-center gap-2">
              <MapPin className="h-5 w-5 text-[#8bc34a]" />
              ¿Dónde está el problema?
            </h2>

            <div className="space-y-1.5">
              <label className="text-sm font-bold">Parque *</label>
              {parksLoading ? (
                <div className="flex items-center gap-2 text-sm text-[#a8b5a0] py-2">
                  <Loader2 className="h-4 w-4 animate-spin" /> Cargando parques...
                </div>
              ) : (
                <select
                  value={form.parkId}
                  onChange={e => update('parkId', e.target.value)}
                  className={`w-full px-4 py-3 bg-[#f8faf6] border-2 rounded-xl text-sm outline-none focus:bg-white transition-all ${errors.parkId ? 'border-red-400' : 'border-[#e0e8db] focus:border-[#8bc34a]'}`}
                >
                  <option value="">Seleccioná el parque afectado</option>
                  {parks.map(p => <option key={p._id} value={p._id}>{p.nombre}</option>)}
                </select>
              )}
              {errors.parkId && <p className="text-xs text-red-500 flex items-center gap-1"><AlertTriangle className="h-3 w-3" />{errors.parkId}</p>}
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-bold">Ubicación aproximada (opcional)</label>
              <input
                type="text"
                value={form.ubicacionAprox}
                onChange={e => update('ubicacionAprox', e.target.value)}
                placeholder="Ej: Cerca de la cancha de fútbol, zona norte del parque"
                className="w-full px-4 py-3 bg-[#f8faf6] border-2 border-[#e0e8db] rounded-xl text-sm outline-none focus:border-[#8bc34a] focus:bg-white transition-all"
              />
            </div>
          </motion.div>

          {/* Tipo y descripción */}
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
            className="bg-white rounded-2xl border border-[#e0e8db] p-6 space-y-5">
            <h2 className="font-bold text-lg flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-[#ff9800]" />
              ¿Qué pasó?
            </h2>

            <div className="space-y-1.5">
              <label className="text-sm font-bold">Tipo de incidente</label>
              <div className="flex flex-wrap gap-2">
                {INCIDENT_TYPES.map(tipo => (
                  <button
                    key={tipo}
                    type="button"
                    onClick={() => update('tipoIncidente', form.tipoIncidente === tipo ? '' : tipo)}
                    className={`px-3 py-2 rounded-lg text-xs font-bold transition-all ${form.tipoIncidente === tipo ? 'bg-[#ff9800] text-white' : 'bg-[#f8faf6] text-[#5a6b5f] hover:bg-[#e0e8db]'}`}
                  >
                    {tipo}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-bold">Descripción detallada *</label>
              <textarea
                value={form.descripcion}
                onChange={e => update('descripcion', e.target.value)}
                placeholder="Describí el problema con el mayor detalle posible..."
                rows={4}
                className={`w-full px-4 py-3 bg-[#f8faf6] border-2 rounded-xl text-sm outline-none focus:bg-white transition-all resize-none ${errors.descripcion ? 'border-red-400' : 'border-[#e0e8db] focus:border-[#8bc34a]'}`}
              />
              {errors.descripcion && <p className="text-xs text-red-500 flex items-center gap-1"><AlertTriangle className="h-3 w-3" />{errors.descripcion}</p>}
            </div>
          </motion.div>

          {/* Urgencia */}
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl border border-[#e0e8db] p-6 space-y-4">
            <h2 className="font-bold text-lg flex items-center gap-2">
              <Info className="h-5 w-5 text-[#2196f3]" />
              Nivel de urgencia
            </h2>
            <div className="grid grid-cols-3 gap-3">
              {URGENCY_LEVELS.map(level => (
                <button
                  key={level.id}
                  type="button"
                  onClick={() => update('nivelUrgencia', level.id)}
                  className={`p-4 rounded-xl border-2 text-center transition-all ${form.nivelUrgencia === level.id ? 'border-current shadow-md' : 'border-[#e0e8db] hover:border-gray-300'}`}
                  style={form.nivelUrgencia === level.id ? { borderColor: level.color, backgroundColor: level.bg } : {}}
                >
                  <p className="font-black text-sm" style={{ color: level.color }}>{level.label}</p>
                  <p className="text-[10px] text-[#a8b5a0] mt-1 leading-tight">{level.desc}</p>
                </button>
              ))}
            </div>
          </motion.div>

          <AnimatePresence>
            {submitError && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="bg-[#ffebee] border border-[#ffcdd2] rounded-xl p-4 flex items-center gap-3">
                <AlertTriangle className="h-5 w-5 text-[#f44336] flex-shrink-0" />
                <p className="text-sm text-[#c62828]">{submitError}</p>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.button
            type="submit"
            disabled={submitting}
            whileHover={!submitting ? { scale: 1.01 } : {}}
            whileTap={!submitting ? { scale: 0.99 } : {}}
            className="w-full py-4 bg-[#e65100] text-white rounded-xl font-black text-lg flex items-center justify-center gap-2 hover:bg-[#bf360c] transition-colors disabled:opacity-60 disabled:cursor-not-allowed shadow-lg"
          >
            {submitting ? (
              <><Loader2 className="h-5 w-5 animate-spin" /> Enviando reporte...</>
            ) : (
              <><AlertTriangle className="h-5 w-5" /> Enviar reporte</>
            )}
          </motion.button>
        </form>
      </div>
    </div>
  );
}
