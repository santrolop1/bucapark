import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { parkService } from '../api/services';
import { useAuth } from '../contexts/AuthContext';
import {
  MapPin,
  TreePine,
  Search,
  SlidersHorizontal,
  X,
  ArrowRight,
  AlertCircle,
  RefreshCw,
  Wind,
  Droplets,
  Sun,
} from 'lucide-react';

// ─── Textos editables ─────────────────────────────────────────────────────────
// Para cambiar cualquier texto visible, editá solo este objeto.
const TEXTS = {
  // Hero
  heroTitle1: 'Encontrá tu',
  heroTitle2: 'parque ideal',
  heroDescription:
    'Todos los parques municipales de Bucaramanga. Filtrá por estado, buscá por nombre o explorá el mapa.',
  heroLoadingBadge: 'Cargando parques...',
  heroTotalLabel: 'totales',
  heroActiveLabel: 'disponibles',
  // Barra de búsqueda
  searchPlaceholder: 'Buscar por nombre, barrio o dirección...',
  filterBtn: 'Filtros',
  estadoLabel: 'Estado:',
  ordenarLabel: 'Ordenar:',
  clearBtn: 'Limpiar',
  // Cards de parque
  statusActive: '✓ Disponible',
  statusMaintenance: '🔧 Mantenimiento',
  exploreBtn: 'Explorar',
  reserveBtn: 'Reservar',
  fallbackDesc: 'Espacio recreativo municipal con áreas verdes y equipamiento para la comunidad.',
  filterActiveTag: 'Filtros activos',
  // Estados de carga / error / vacío
  errorTitle: 'Algo falló',
  errorMsg: 'No se pudieron cargar los parques. ¿El gateway está corriendo?',
  retryBtn: 'Reintentar',
  emptyWithFiltersTitle: 'No hay parques con esos filtros',
  emptyWithFiltersSubtitle: 'Probá con otros filtros o búsqueda.',
  emptyTitle: 'No hay parques registrados',
  emptySubtitle: 'Todavía no cargaron datos en el sistema.',
  clearFiltersBtn: 'Limpiar filtros',
};

// ─── Opciones de filtros ───────────────────────────────────────────────────────
// Para agregar un estado nuevo, solo agregá un objeto aquí.
const FILTER_OPTIONS = [
  { key: 'todos', label: 'Todos' },
  { key: 'activo', label: 'Disponibles' },
  { key: 'mantenimiento', label: 'En mantenimiento' },
];

// Para agregar una opción de orden, solo agregá un objeto aquí.
const SORT_OPTIONS = [
  { key: 'nombre', label: 'Nombre' },
  { key: 'estado', label: 'Estado' },
];

// ─── Hook de contador animado ──────────────────────────────────────────────────
const useCountUp = (end, duration = 1.5) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (!isInView) return;
    let startTime = null;
    let raf;
    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / (duration * 1000), 1);
      setCount(Math.floor(progress * end));
      if (progress < 1) raf = requestAnimationFrame(animate);
    };
    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, [isInView, end, duration]);

  return { count, ref };
};

// ─── Componente ───────────────────────────────────────────────────────────────
const ParksPage = () => {
  const [parks, setParks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterOpen, setFilterOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState('todos');
  const [sortBy, setSortBy] = useState('nombre');

  const headerRef = useRef(null);
  const isHeaderInView = useInView(headerRef, { once: true });
  const { isAuthenticated } = useAuth();

  // Estadísticas animadas del hero
  const activeCount = useMemo(
    () => parks.filter((p) => p.estado === 'activo').length,
    [parks]
  );
  const { count: countTotal, ref: refTotal } = useCountUp(parks.length);
  const { count: countActivos, ref: refActivos } = useCountUp(activeCount);

  // Carga de parques desde el backend
  const loadParks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await parkService.getAll();
      // El backend devuelve { success: true, data: [...] }
      const data = res.data?.data ?? res.data ?? [];
      setParks(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(TEXTS.errorMsg);
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadParks();
  }, [loadParks]);

  // Filtra, busca y ordena sin estado extra — evita render doble
  const filteredParks = useMemo(() => {
    let result = [...parks];

    if (activeFilter !== 'todos') {
      result = result.filter((p) => p.estado === activeFilter);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.nombre?.toLowerCase().includes(q) ||
          p.direccion?.toLowerCase().includes(q) ||
          p.ciudad?.toLowerCase().includes(q)
      );
    }

    result.sort((a, b) => {
      if (sortBy === 'nombre') return (a.nombre || '').localeCompare(b.nombre || '');
      if (sortBy === 'estado') return (a.estado || '').localeCompare(b.estado || '');
      return 0;
    });

    return result;
  }, [parks, searchQuery, activeFilter, sortBy]);

  const clearFilters = () => {
    setSearchQuery('');
    setActiveFilter('todos');
    setSortBy('nombre');
  };

  const hasActiveFilters = searchQuery || activeFilter !== 'todos';

  // ─── Variantes de animación ────────────────────────────────────────────────
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.2 } },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] },
    },
  };

  const getWeatherIcon = (index) => [Sun, Wind, Droplets][index % 3];

  return (
    <div className="min-h-screen bg-[#f4f7f0]">

      {/* ── Hero ── */}
      <section className="bg-[#2d4a3e] relative overflow-hidden">
        <motion.div
          className="absolute inset-0 opacity-10"
          animate={{ backgroundPosition: ['0% 0%', '100% 100%'] }}
          transition={{ duration: 25, repeat: Infinity, repeatType: 'reverse', ease: 'linear' }}
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            backgroundSize: '60px 60px',
          }}
        />

        <div className="max-w-6xl mx-auto px-6 py-16 md:py-20 relative" ref={headerRef}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isHeaderInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center gap-2 text-[#8bc34a] text-sm font-bold mb-4 tracking-wide uppercase">
              <TreePine className="h-4 w-4" />
              {parks.length > 0
                ? `${parks.length} espacios verdes registrados`
                : TEXTS.heroLoadingBadge}
            </div>

            <h1 className="text-4xl md:text-6xl font-black text-white leading-tight mb-4">
              {TEXTS.heroTitle1}
              <br />
              <span className="text-[#8bc34a]">{TEXTS.heroTitle2}</span>
            </h1>

            <p className="text-[#a8c5b5] text-lg max-w-xl">{TEXTS.heroDescription}</p>
          </motion.div>

          {/* Estadísticas animadas */}
          <div className="flex gap-8 mt-10">
            <div ref={refTotal}>
              <span className="text-3xl font-black text-white block tabular-nums">
                {countTotal}
              </span>
              <span className="text-[#8a9e93] text-sm">{TEXTS.heroTotalLabel}</span>
            </div>
            <div className="w-px bg-[#3d5a4e]" />
            <div ref={refActivos}>
              <span className="text-3xl font-black text-[#8bc34a] block tabular-nums">
                {countActivos}
              </span>
              <span className="text-[#8a9e93] text-sm">{TEXTS.heroActiveLabel}</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Barra de búsqueda y filtros ── */}
      <section className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-[#e0e8db] shadow-sm">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex flex-col md:flex-row gap-3">
            <motion.div
              className="flex-1 relative"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4 }}
            >
              <Search className="absolute left-4 top-3 h-5 w-5 text-[#a8b5a0]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={TEXTS.searchPlaceholder}
                className="w-full pl-12 pr-10 py-2.5 bg-[#f8faf6] border-2 border-[#e0e8db] rounded-xl text-[#1a332a] font-medium placeholder:text-[#a8b5a0] outline-none focus:border-[#8bc34a] focus:bg-white transition-all"
                aria-label="Buscar parques"
              />
              <AnimatePresence>
                {searchQuery && (
                  <motion.button
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-2.5 text-[#a8b5a0] hover:text-[#5a6b5f] transition-colors"
                    aria-label="Limpiar búsqueda"
                  >
                    <X className="h-5 w-5" />
                  </motion.button>
                )}
              </AnimatePresence>
            </motion.div>

            <motion.button
              onClick={() => setFilterOpen((v) => !v)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${
                hasActiveFilters
                  ? 'bg-[#8bc34a] text-[#1a332a]'
                  : 'bg-[#f8faf6] text-[#5a6b5f] border-2 border-[#e0e8db] hover:border-[#8bc34a]'
              }`}
              whileTap={{ scale: 0.95 }}
              aria-expanded={filterOpen}
            >
              <SlidersHorizontal className="h-4 w-4" />
              {TEXTS.filterBtn}
              {hasActiveFilters && (
                <span className="bg-[#1a332a] text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                  !
                </span>
              )}
            </motion.button>
          </div>

          {/* Panel de filtros expandible */}
          <AnimatePresence>
            {filterOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="pt-4 pb-2 flex flex-wrap gap-3 items-center">
                  <span className="text-sm font-bold text-[#5a6b5f] mr-2">{TEXTS.estadoLabel}</span>
                  {FILTER_OPTIONS.map((f) => (
                    <motion.button
                      key={f.key}
                      onClick={() => setActiveFilter(f.key)}
                      className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                        activeFilter === f.key
                          ? 'bg-[#2d4a3e] text-white'
                          : 'bg-[#f8faf6] text-[#5a6b5f] hover:bg-[#e0e8db]'
                      }`}
                      whileTap={{ scale: 0.95 }}
                      layout
                    >
                      {f.label}
                    </motion.button>
                  ))}

                  <div className="w-px h-6 bg-[#e0e8db] mx-2" />

                  <span className="text-sm font-bold text-[#5a6b5f] mr-2">{TEXTS.ordenarLabel}</span>
                  {SORT_OPTIONS.map((s) => (
                    <motion.button
                      key={s.key}
                      onClick={() => setSortBy(s.key)}
                      className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                        sortBy === s.key
                          ? 'bg-[#8bc34a] text-[#1a332a]'
                          : 'bg-[#f8faf6] text-[#5a6b5f] hover:bg-[#e0e8db]'
                      }`}
                      whileTap={{ scale: 0.95 }}
                      layout
                    >
                      {s.label}
                    </motion.button>
                  ))}

                  {hasActiveFilters && (
                    <motion.button
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      onClick={clearFilters}
                      className="ml-auto text-sm text-[#ff9800] font-bold hover:text-[#e65100] transition-colors flex items-center gap-1"
                    >
                      <X className="h-4 w-4" />
                      {TEXTS.clearBtn}
                    </motion.button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* ── Contenido principal ── */}
      <section className="max-w-6xl mx-auto px-6 py-8">

        {/* Skeletons mientras carga */}
        {loading && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <motion.div
                key={n}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: n * 0.05 }}
                className="bg-white rounded-xl border border-[#e0e8db] overflow-hidden"
              >
                <motion.div
                  className="h-48 bg-[#e8ece4]"
                  animate={{ opacity: [0.4, 0.7, 0.4] }}
                  transition={{ duration: 2, repeat: Infinity, delay: n * 0.2 }}
                />
                <div className="p-5 space-y-3">
                  <motion.div
                    className="h-5 bg-[#e8ece4] rounded w-3/4"
                    animate={{ opacity: [0.4, 0.6, 0.4] }}
                    transition={{ duration: 2, repeat: Infinity, delay: n * 0.2 + 0.1 }}
                  />
                  <motion.div
                    className="h-4 bg-[#e8ece4] rounded w-1/2"
                    animate={{ opacity: [0.4, 0.6, 0.4] }}
                    transition={{ duration: 2, repeat: Infinity, delay: n * 0.2 + 0.2 }}
                  />
                  <div className="flex gap-2 pt-2">
                    <motion.div
                      className="h-8 bg-[#e8ece4] rounded flex-1"
                      animate={{ opacity: [0.4, 0.6, 0.4] }}
                      transition={{ duration: 2, repeat: Infinity, delay: n * 0.2 + 0.3 }}
                    />
                    <motion.div
                      className="h-8 w-8 bg-[#e8ece4] rounded"
                      animate={{ opacity: [0.4, 0.6, 0.4] }}
                      transition={{ duration: 2, repeat: Infinity, delay: n * 0.2 + 0.4 }}
                    />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Estado de error */}
        {!loading && error && (
          <motion.div
            className="max-w-md mx-auto text-center py-20"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <AlertCircle className="h-16 w-16 text-[#ff9800] mx-auto mb-4" />
            </motion.div>
            <h3 className="text-xl font-bold text-[#1a332a] mb-2">{TEXTS.errorTitle}</h3>
            <p className="text-[#5a6b5f] mb-6">{error}</p>
            <motion.button
              onClick={loadParks}
              className="bg-[#2d4a3e] text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 mx-auto hover:bg-[#1a332a] transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <RefreshCw className="h-5 w-5" />
              {TEXTS.retryBtn}
            </motion.button>
          </motion.div>
        )}

        {/* Estado vacío (sin resultados) */}
        {!loading && !error && filteredParks.length === 0 && (
          <motion.div
            className="text-center py-20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <TreePine className="h-16 w-16 text-[#e0e8db] mx-auto mb-4" />
            <h3 className="text-xl font-bold text-[#1a332a] mb-2">
              {hasActiveFilters ? TEXTS.emptyWithFiltersTitle : TEXTS.emptyTitle}
            </h3>
            <p className="text-[#5a6b5f] mb-4">
              {hasActiveFilters ? TEXTS.emptyWithFiltersSubtitle : TEXTS.emptySubtitle}
            </p>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="text-[#8bc34a] font-bold hover:underline"
              >
                {TEXTS.clearFiltersBtn}
              </button>
            )}
          </motion.div>
        )}

        {/* Grid de cards */}
        {!loading && !error && filteredParks.length > 0 && (
          <>
            <motion.div
              className="flex items-center justify-between mb-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <p className="text-sm text-[#5a6b5f] font-medium">
                Mostrando{' '}
                <span className="font-bold text-[#1a332a]">{filteredParks.length}</span> de{' '}
                {parks.length} parques
              </p>
              {hasActiveFilters && (
                <span className="text-xs bg-[#8bc34a]/20 text-[#2d4a3e] px-3 py-1 rounded-full font-bold">
                  {TEXTS.filterActiveTag}
                </span>
              )}
            </motion.div>

            <motion.div
              className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              <AnimatePresence mode="popLayout">
                {filteredParks.map((park, i) => {
                  const WeatherIcon = getWeatherIcon(i);
                  const isActive = park.estado === 'activo';

                  return (
                    <motion.div
                      key={park._id}
                      variants={cardVariants}
                      layout
                      exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                      whileHover={{ y: -6, transition: { duration: 0.2 } }}
                    >
                      <div className="bg-white rounded-xl border border-[#e0e8db] overflow-hidden hover:border-[#8bc34a] hover:shadow-xl transition-all group h-full flex flex-col">
                        {/* Imagen del parque (color según posición) */}
                        <div
                          className={`h-44 relative overflow-hidden ${
                            i % 3 === 0
                              ? 'bg-[#4a6741]'
                              : i % 3 === 1
                              ? 'bg-[#5a7a6b]'
                              : 'bg-[#6b8a7a]'
                          }`}
                        >
                          <motion.div
                            className="absolute inset-0 flex items-center justify-center"
                            whileHover={{ scale: 1.15, rotate: 3 }}
                            transition={{ duration: 0.4 }}
                          >
                            <TreePine className="h-20 w-20 text-white opacity-30" />
                          </motion.div>

                          {/* Badge de estado */}
                          <div className="absolute top-4 left-4">
                            <motion.span
                              className={`px-3 py-1.5 rounded-full text-xs font-black ${
                                isActive ? 'bg-[#8bc34a] text-[#1a332a]' : 'bg-[#ff9800] text-white'
                              }`}
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ delay: i * 0.1 + 0.3, type: 'spring' }}
                            >
                              {isActive ? TEXTS.statusActive : TEXTS.statusMaintenance}
                            </motion.span>
                          </div>

                          <div className="absolute top-4 right-4">
                            <div className="bg-white/20 backdrop-blur-sm rounded-full p-2">
                              <WeatherIcon className="h-4 w-4 text-white" />
                            </div>
                          </div>

                          <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-black/40 to-transparent" />
                        </div>

                        {/* Datos del parque */}
                        <div className="p-5 flex-1 flex flex-col">
                          <h3 className="font-black text-xl text-[#1a332a] mb-2 group-hover:text-[#2d4a3e] transition-colors">
                            {park.nombre}
                          </h3>

                          <div className="flex items-start gap-1.5 mb-3">
                            <MapPin className="h-4 w-4 text-[#8bc34a] mt-0.5 flex-shrink-0" />
                            <p className="text-sm text-[#5a6b5f] leading-snug">
                              {park.direccion}
                              {park.ciudad && `, ${park.ciudad}`}
                            </p>
                          </div>

                          <p className="text-sm text-[#7a8a7f] line-clamp-2 mb-4 flex-1">
                            {park.descripcion || TEXTS.fallbackDesc}
                          </p>

                          {/* Botones de acción */}
                          <div className="flex items-center gap-3 pt-3 border-t border-[#f0f4ec]">
                            <Link
                              to={`/parks/${park._id}`}
                              className="flex-1 bg-[#f8faf6] text-[#2d4a3e] py-2.5 rounded-lg font-bold text-sm hover:bg-[#8bc34a] hover:text-[#1a332a] transition-all text-center flex items-center justify-center gap-1 group/btn"
                            >
                              {TEXTS.exploreBtn}
                              <ArrowRight className="h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                            </Link>

                            {isActive && (
                              <Link
                                to={isAuthenticated ? `/reservations/new?park=${park._id}` : '/login'}
                                state={!isAuthenticated ? { from: { pathname: '/parks' } } : undefined}
                                className="bg-[#2d4a3e] text-white px-4 py-2.5 rounded-lg font-bold text-sm hover:bg-[#1a332a] transition-colors"
                              >
                                {TEXTS.reserveBtn}
                              </Link>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </motion.div>
          </>
        )}
      </section>
    </div>
  );
};

export default ParksPage;
