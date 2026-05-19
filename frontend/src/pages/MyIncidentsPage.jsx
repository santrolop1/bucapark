import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { incidentService } from '../api/services';
import { AlertTriangle, Clock, MapPin, ArrowLeft, AlertCircle } from 'lucide-react';

const formatDate = (value) => {
  if (!value) return 'Fecha desconocida';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Fecha inválida';
  return date.toLocaleDateString('es-CO', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' });
};

const MyIncidentsPage = () => {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadIncidents = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await incidentService.getMine();
      const data = res.data?.data ?? res.data ?? [];
      setIncidents(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('[MY INCIDENTS] error:', err);
      setError('No se pudieron cargar tus incidencias.');
      setIncidents([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadIncidents();
  }, [loadIncidents]);

  return (
    <div className="min-h-screen bg-[#f4f7f0] text-[#1a332a]">
      <div className="bg-white/90 backdrop-blur sticky top-0 z-30 border-b border-[#e0e8db]">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center gap-3">
          <Link to="/dashboard" className="text-[#2d4a3e] flex items-center gap-2 text-sm font-bold hover:text-[#1a332a] transition-colors">
            <ArrowLeft className="h-4 w-4" /> Volver al dashboard
          </Link>
          <h1 className="text-xl font-black">Mis incidencias</h1>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-6">
          <p className="text-sm text-[#5a6b5f]">Aquí están los reportes que has enviado desde tu cuenta.</p>
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
        ) : incidents.length === 0 ? (
          <div className="bg-white rounded-2xl border border-[#e0e8db] p-8 text-center">
            <AlertCircle className="h-10 w-10 text-[#e65100] mx-auto mb-4" />
            <h2 className="text-xl font-black mb-2">No hay incidencias</h2>
            <p className="text-sm text-[#5a6b5f]">Aún no enviaste ningún reporte.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {incidents.map((incident, index) => (
              <motion.div
                key={incident._id || incident.id || index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
                className="bg-white rounded-2xl border border-[#e0e8db] p-5"
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-bold text-[#1a332a]">{incident.titulo || incident.tipo || 'Incidencia'}</h2>
                    <p className="text-sm text-[#5a6b5f]">{incident.nivelUrgencia || 'Urgencia no definida'}</p>
                  </div>
                  <span className="text-xs font-bold uppercase tracking-wider text-[#8bc34a]">
                    {incident.estado || 'Pendiente'}
                  </span>
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  <div className="rounded-2xl bg-[#f8faf6] p-3">
                    <p className="text-xs uppercase tracking-[0.2em] text-[#5a6b5f]">Fecha</p>
                    <p className="mt-2 font-bold text-[#1a332a]">{formatDate(incident.createdAt || incident.fecha || incident.fechaReporte)}</p>
                  </div>
                  <div className="rounded-2xl bg-[#f8faf6] p-3">
                    <p className="text-xs uppercase tracking-[0.2em] text-[#5a6b5f]">Ubicación</p>
                    <p className="mt-2 font-bold text-[#1a332a]">{incident.ubicacionAprox || 'No especificada'}</p>
                  </div>
                  <div className="rounded-2xl bg-[#f8faf6] p-3">
                    <p className="text-xs uppercase tracking-[0.2em] text-[#5a6b5f]">Descripción</p>
                    <p className="mt-2 text-sm text-[#1a332a]">{incident.descripcion || 'Sin detalles'}</p>
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

export default MyIncidentsPage;
