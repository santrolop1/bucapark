import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { eventService } from '../api/services';
import { Calendar, Clock, Users, MapPin, ArrowLeft, AlertCircle } from 'lucide-react';

const formatDate = (value) => {
  if (!value) return 'Fecha desconocida';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Fecha inválida';
  return date.toLocaleDateString('es-CO', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' });
};

const MyEventsPage = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadEvents = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await eventService.getMine();
      const data = res.data?.data ?? res.data ?? [];
      setEvents(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('[MY EVENTS] error:', err);
      setError('No se pudieron cargar tus eventos.');
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  return (
    <div className="min-h-screen bg-[#f4f7f0] text-[#1a332a]">
      <div className="bg-white/90 backdrop-blur sticky top-0 z-30 border-b border-[#e0e8db]">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center gap-3">
          <Link to="/dashboard" className="text-[#2d4a3e] flex items-center gap-2 text-sm font-bold hover:text-[#1a332a] transition-colors">
            <ArrowLeft className="h-4 w-4" /> Volver al dashboard
          </Link>
          <h1 className="text-xl font-black">Mis eventos</h1>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-6">
          <p className="text-sm text-[#5a6b5f]">Lista de eventos que has creado o registrado en tu cuenta.</p>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((item) => (
              <div key={item} className="animate-pulse bg-white rounded-2xl border border-[#e0e8db] p-5" />
            ))}
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-2xl p-6">
            <p className="font-bold">Error</p>
            <p className="mt-2 text-sm">{error}</p>
          </div>
        ) : events.length === 0 ? (
          <div className="bg-white rounded-2xl border border-[#e0e8db] p-8 text-center">
            <AlertCircle className="h-10 w-10 text-[#e65100] mx-auto mb-4" />
            <h2 className="text-xl font-black mb-2">No hay eventos</h2>
            <p className="text-sm text-[#5a6b5f]">Aún no creaste ningún evento.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {events.map((event, index) => (
              <motion.div
                key={event._id || event.id || index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
                className="bg-white rounded-2xl border border-[#e0e8db] p-5"
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-bold text-[#1a332a]">{event.nombre || event.titulo || 'Evento'}</h2>
                    <p className="text-sm text-[#5a6b5f]">{event.categoria || 'Categoría'} • {event.parque || event.parkId || 'Parque'}</p>
                  </div>
                  <span className="text-xs font-bold uppercase tracking-wider text-[#8bc34a]">
                    {event.estado || 'Pendiente'}
                  </span>
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  <div className="rounded-2xl bg-[#f8faf6] p-3">
                    <p className="text-xs uppercase tracking-[0.2em] text-[#5a6b5f]">Fecha</p>
                    <p className="mt-2 font-bold text-[#1a332a]">{formatDate(event.fecha)}</p>
                  </div>
                  <div className="rounded-2xl bg-[#f8faf6] p-3">
                    <p className="text-xs uppercase tracking-[0.2em] text-[#5a6b5f]">Horario</p>
                    <p className="mt-2 font-bold text-[#1a332a]">{event.horaInicio || '—'}</p>
                  </div>
                  <div className="rounded-2xl bg-[#f8faf6] p-3">
                    <p className="text-xs uppercase tracking-[0.2em] text-[#5a6b5f]">Asistentes</p>
                    <p className="mt-2 font-bold text-[#1a332a]">{event.inscritos ?? event.asistentes ?? '—'}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyEventsPage;
