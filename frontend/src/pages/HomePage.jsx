import { Link } from 'react-router-dom';
import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, useScroll, useTransform, useInView, AnimatePresence } from 'framer-motion';
import { MapPin, ArrowRight, Wind, Trees, Mountain, ChevronDown, AlertCircle, RefreshCw } from 'lucide-react';
import { parkService, eventService } from '../api/services';

// ─── Textos y datos editables ─────────────────────────────────────────────────
// Para cambiar cualquier texto visible, editá solo estos objetos.
// No necesitás tocar nada más abajo.

const HERO = {
  badge: '24°C en Bucaramanga — Parcialmente nublado',
  titleLine1: 'Los parques',
  titleLine2: 'no esperan',
  description:
    'Reserva tu cancha los domingos antes de que se la ganen. Reporta el banco roto de San Pío. Organiza el evento que llevas meses pensando.',
  primaryBtn: 'Ver parques',
  secondaryBtn: 'Qué hay esta semana',
};

// Números animados del hero — cambiá value para ajustar la cifra
const STATS = [
  { value: 12,  suffix: '+',   label: 'parques activos' },
  { value: 340, suffix: '',    label: 'reservas este mes' },
  { value: 5,   suffix: 'min', label: 'promedio de reserva' },
];

const PARKS_SECTION = {
  title: 'Dónde ir hoy',
  subtitle: 'Los que tienen más movimiento últimamente',
  allParksLink: 'Todos los parques',
  allParksMobileLink: 'Ver todos los parques →',
  errorMsg: 'No se pudieron cargar los parques. Verifica que el servidor esté corriendo.',
  emptyTitle: 'No hay parques registrados todavía',
  emptySubtitle: 'Crea el primero desde el panel de administración',
  openLabel: 'Abierto ahora',
  maintenanceLabel: 'En mantenimiento',
  exploreLabel: 'Explorar',
  fallbackDesc: 'Espacio recreativo municipal con áreas verdes y equipamiento deportivo.',
};

// Pasos de la sección "Cómo funciona" — para editar, solo cambiá title y desc
const HOW_IT_WORKS = {
  titleLine1: 'No dejes la pelota',
  titleLine2: 'en el techo',
  steps: [
    {
      num: '01',
      title: 'Reservá antes',
      desc: 'Las canchas de San Pío se llenan los sábados a las 8am. Reservá desde el celular y listo, nadie te la quita.',
    },
    {
      num: '02',
      title: 'Reportá lo que veas',
      desc: 'Fuente rota, luz fundida, banco quebrado. Sacá foto, subilo y el operario lo ve en su panel.',
    },
    {
      num: '03',
      title: 'Organizá tu evento',
      desc: 'Yoga, torneos, ferias. Presentalo, esperá la aprobación y te llega la confirmación al mail.',
    },
  ],
};

const CTA_SECTION = {
  title: '¿Tenés un parque favorito?',
  description:
    'Entrá, reservá tu espacio y empezá a usarlo. No hace falta ir a la alcaldía ni hacer fila.',
  btnLabel: 'Crear cuenta gratis',
};

// ─── Hook de contador animado ──────────────────────────────────────────────────
const useCountUp = (end, duration = 2) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (!isInView) return;
    let startTime = null;
    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / (duration * 1000), 1);
      setCount(Math.floor(progress * end));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [isInView, end, duration]);

  return { count, ref };
};

const getListPayload = (response) => {
  const list = response?.data?.data ?? response?.data ?? [];
  return Array.isArray(list) ? list : [];
};

// ─── Componente ───────────────────────────────────────────────────────────────
const HomePage = () => {
  const [parks, setParks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [heroLoaded, setHeroLoaded] = useState(false);
  const [statsData, setStatsData] = useState({
    activeParks: null,
    totalParks: null,
    totalEvents: null,
  });
  const containerRef = useRef(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start'],
  });

  const heroY = useTransform(scrollYProgress, [0, 0.5], [0, 150]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.3], [1, 0]);

  const dynamicStats = [
    {
      ...STATS[0],
      value: Number.isFinite(statsData.activeParks) ? statsData.activeParks : STATS[0].value,
    },
    {
      ...STATS[1],
      value: Number.isFinite(statsData.totalEvents) ? statsData.totalEvents : STATS[1].value,
    },
    STATS[2],
  ];

  // Un hook por stat — los hooks no pueden ir en loops
  const { count: count1, ref: ref1 } = useCountUp(dynamicStats[0].value);
  const { count: count2, ref: ref2 } = useCountUp(dynamicStats[1].value);
  const { count: count3, ref: ref3 } = useCountUp(dynamicStats[2].value);

  const fetchParks = useCallback(() => {
    setLoading(true);
    setError(null);
    parkService
      .getAll()
      .then((res) => {
        const list = getListPayload(res);
        setParks(list.slice(0, 3));
        setStatsData((prev) => ({
          ...prev,
          totalParks: list.length,
          activeParks: list.filter((park) => (park?.estado || '').toLowerCase() === 'activo').length,
        }));
      })
      .catch(() => {
        setError(PARKS_SECTION.errorMsg);
        setParks([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const fetchPublicStats = useCallback(() => {
    // Solo events/public — endpoint público, no requiere auth.
    // reservationService.getAll() requiere auth y causaría redirect a /login en visitantes anónimos.
    eventService.getPublic()
      .then((eventsRes) => {
        const events = getListPayload(eventsRes);
        setStatsData((prev) => ({
          ...prev,
          totalEvents: events.length,
        }));
      })
      .catch(() => {
        setStatsData((prev) => ({ ...prev, totalEvents: null }));
      });
  }, []);

  useEffect(() => {
    // El hero anima siempre, independiente de la carga de datos
    const timer = setTimeout(() => setHeroLoaded(true), 100);
    const dataTimer = setTimeout(() => {
      fetchParks();
      fetchPublicStats();
    }, 0);
    return () => {
      clearTimeout(timer);
      clearTimeout(dataTimer);
    };
  }, [fetchParks, fetchPublicStats]);

  const parksSubtitle = Number.isFinite(statsData.totalParks)
    ? `${PARKS_SECTION.subtitle} · ${statsData.totalParks} parque${statsData.totalParks !== 1 ? 's' : ''}${Number.isFinite(statsData.totalEvents) ? ` · ${statsData.totalEvents} eventos` : ''}`
    : PARKS_SECTION.subtitle;

  // ─── Variantes de animación ────────────────────────────────────────────────
  const fadeInUp = {
    hidden: { opacity: 0, y: 40 },
    visible: (delay = 0) => ({
      opacity: 1,
      y: 0,
      transition: { duration: 0.7, delay, ease: [0.25, 0.46, 0.45, 0.94] },
    }),
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15, delayChildren: 0.2 },
    },
  };

  const cardHover = {
    rest: { scale: 1, y: 0 },
    hover: {
      scale: 1.02,
      y: -4,
      transition: { duration: 0.3, ease: 'easeOut' },
    },
  };

  return (
    <div ref={containerRef} className="bg-[#f4f7f0] overflow-hidden">

      {/* ── HERO ── */}
      <motion.section
        className="relative bg-[#2d4a3e] text-white min-h-[90vh] flex flex-col justify-center overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        {/* Patrón de fondo animado */}
        <motion.div
          className="absolute inset-0 opacity-[0.07]"
          animate={{ backgroundPosition: ['0% 0%', '100% 100%'] }}
          transition={{ duration: 20, repeat: Infinity, repeatType: 'reverse', ease: 'linear' }}
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            backgroundSize: '60px 60px',
          }}
        />

        <motion.div
          className="relative max-w-6xl mx-auto px-6 py-20 md:py-28"
          style={{ y: heroY, opacity: heroOpacity }}
        >
          {/* Badge de clima */}
          <motion.div
            className="flex items-center gap-2 text-[#a8c5b5] text-sm font-medium mb-8 tracking-wide uppercase"
            initial={{ opacity: 0, x: -30 }}
            animate={heroLoaded ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            >
              <Wind className="h-4 w-4" />
            </motion.div>
            {HERO.badge}
          </motion.div>

          {/* Título animado letra por letra */}
          <motion.h1
            className="text-5xl md:text-7xl font-black leading-[0.95] mb-6 tracking-tight"
            variants={staggerContainer}
            initial="hidden"
            animate={heroLoaded ? 'visible' : 'hidden'}
          >
            {HERO.titleLine1.split('').map((char, i) => (
              <motion.span
                key={i}
                variants={fadeInUp}
                custom={i * 0.03}
                className="inline-block"
                style={{ whiteSpace: char === ' ' ? 'pre' : undefined }}
              >
                {char}
              </motion.span>
            ))}
            <br />
            <motion.span
              className="text-[#8bc34a] inline-block"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={heroLoaded ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.8, delay: 0.6, type: 'spring', stiffness: 200 }}
            >
              {HERO.titleLine2}
            </motion.span>
          </motion.h1>

          <motion.p
            className="text-lg md:text-xl text-[#c8ddd0] max-w-lg mb-10 leading-relaxed"
            initial={{ opacity: 0, filter: 'blur(10px)' }}
            animate={heroLoaded ? { opacity: 1, filter: 'blur(0px)' } : {}}
            transition={{ duration: 0.8, delay: 0.8 }}
          >
            {HERO.description}
          </motion.p>

          {/* Botones del hero */}
          <motion.div
            className="flex flex-wrap gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={heroLoaded ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 1.0 }}
          >
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 400, damping: 17 }}
            >
              <Link
                to="/parks"
                className="group bg-[#8bc34a] text-[#1a332a] px-8 py-4 rounded-lg font-bold text-lg hover:bg-[#9ccc65] transition-colors flex items-center gap-2 shadow-lg shadow-[#8bc34a]/20"
              >
                {HERO.primaryBtn}
                <motion.span
                  className="inline-block"
                  animate={{ x: [0, 4, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <ArrowRight className="h-5 w-5" />
                </motion.span>
              </Link>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 400, damping: 17 }}
            >
              <Link
                to="/events"
                className="border-2 border-[#5a8a7a] text-[#a8c5b5] px-8 py-4 rounded-lg font-bold text-lg hover:border-[#8bc34a] hover:text-[#8bc34a] transition-colors backdrop-blur-sm"
              >
                {HERO.secondaryBtn}
              </Link>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Estadísticas animadas */}
        <motion.div
          className="relative max-w-6xl mx-auto px-6 pb-12"
          initial={{ opacity: 0, y: 30 }}
          animate={heroLoaded ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 1.2 }}
        >
          <div className="flex gap-8 md:gap-12 text-sm">
            <div ref={ref1}>
              <motion.span
                className="text-3xl md:text-4xl font-black text-white block tabular-nums"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                {count1}{dynamicStats[0].suffix}
              </motion.span>
              <span className="text-[#8a9e93]">{dynamicStats[0].label}</span>
            </div>
            <div className="hidden md:block w-px bg-[#3d5a4e] self-stretch my-1" />
            <div ref={ref2} className="hidden md:block">
              <span className="text-3xl md:text-4xl font-black text-white block tabular-nums">
                {count2}{dynamicStats[1].suffix}
              </span>
              <span className="text-[#8a9e93]">{dynamicStats[1].label}</span>
            </div>
            <div className="hidden md:block w-px bg-[#3d5a4e] self-stretch my-1" />
            <div ref={ref3} className="hidden md:block">
              <span className="text-3xl md:text-4xl font-black text-white block tabular-nums">
                {count3}{dynamicStats[2].suffix}
              </span>
              <span className="text-[#8a9e93]">{dynamicStats[2].label}</span>
            </div>
          </div>
        </motion.div>

        {/* Indicador de scroll */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-[#5a8a7a]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2 }}
        >
          <span className="text-xs uppercase tracking-widest">Scroll</span>
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          >
            <ChevronDown className="h-5 w-5" />
          </motion.div>
        </motion.div>
      </motion.section>

      {/* ── PARQUES DESTACADOS ── */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <motion.div
          className="flex items-end justify-between mb-12"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
        >
          <div>
            <h2 className="text-3xl md:text-4xl font-black text-[#1a332a] mb-2">
              {PARKS_SECTION.title}
            </h2>
            <p className="text-[#5a6b5f] text-lg">{parksSubtitle}</p>
          </div>
          <Link
            to="/parks"
            className="text-[#2d4a3e] font-bold hover:text-[#8bc34a] transition-colors hidden md:flex items-center gap-1 group"
          >
            {PARKS_SECTION.allParksLink}
            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>

        {/* Banner de error con botón de reintento */}
        <AnimatePresence>
          {error && (
            <motion.div
              className="flex items-center justify-between gap-4 bg-red-50 border border-red-200 text-red-700 rounded-xl px-5 py-4 mb-8"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex items-center gap-3">
                <AlertCircle className="h-5 w-5 shrink-0" />
                <span className="text-sm font-medium">{error}</span>
              </div>
              <button
                onClick={fetchParks}
                className="flex items-center gap-1.5 text-sm font-bold bg-red-100 hover:bg-red-200 px-3 py-1.5 rounded-lg transition-colors shrink-0"
              >
                <RefreshCw className="h-4 w-4" />
                Reintentar
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div
          className="grid md:grid-cols-3 gap-6"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
        >
          <AnimatePresence mode="wait">
            {loading ? (
              /* Skeletons de carga */
              [1, 2, 3].map((n) => (
                <motion.div
                  key={`skeleton-${n}`}
                  className="bg-white rounded-xl overflow-hidden border border-[#e0e8db]"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ delay: n * 0.1 }}
                >
                  <motion.div
                    className="h-48 bg-[#e8ece4]"
                    animate={{ opacity: [0.5, 0.8, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                  />
                  <div className="p-6 space-y-4">
                    <motion.div
                      className="h-6 bg-[#e8ece4] rounded w-3/4"
                      animate={{ opacity: [0.5, 0.7, 0.5] }}
                      transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut', delay: 0.2 }}
                    />
                    <motion.div
                      className="h-4 bg-[#e8ece4] rounded w-1/2"
                      animate={{ opacity: [0.5, 0.7, 0.5] }}
                      transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut', delay: 0.4 }}
                    />
                    <motion.div
                      className="h-4 bg-[#e8ece4] rounded w-full"
                      animate={{ opacity: [0.5, 0.7, 0.5] }}
                      transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut', delay: 0.6 }}
                    />
                  </div>
                </motion.div>
              ))
            ) : parks.length > 0 ? (
              /* Cards reales */
              parks.map((park, i) => (
                <motion.div
                  key={park._id}
                  variants={fadeInUp}
                  custom={i * 0.15}
                  whileHover="hover"
                  initial="rest"
                  animate="rest"
                >
                  <motion.div variants={cardHover}>
                    <Link
                      to={`/parks/${park._id}`}
                      className="group block bg-white rounded-xl overflow-hidden border border-[#e0e8db] hover:border-[#8bc34a] hover:shadow-xl transition-colors"
                    >
                      <div
                        className={`h-48 relative overflow-hidden ${
                          i === 0 ? 'bg-[#4a6741]' : i === 1 ? 'bg-[#5a7a6b]' : 'bg-[#6b8a7a]'
                        }`}
                      >
                        <motion.div
                          className="absolute inset-0 flex items-center justify-center"
                          whileHover={{ scale: 1.1, rotate: 5 }}
                          transition={{ duration: 0.4 }}
                        >
                          <Trees className="h-16 w-16 text-white opacity-30" />
                        </motion.div>
                        <motion.div
                          className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4"
                          initial={{ y: 20, opacity: 0 }}
                          whileInView={{ y: 0, opacity: 1 }}
                          transition={{ delay: 0.3 + i * 0.1 }}
                        >
                          <span
                            className={`text-xs font-bold px-3 py-1.5 rounded-full ${
                              (park.estado || '').toLowerCase() === 'activo'
                                ? 'bg-[#8bc34a] text-[#1a332a]'
                                : 'bg-[#ff9800] text-white'
                            }`}
                          >
                            {(park.estado || '').toLowerCase() === 'activo'
                              ? PARKS_SECTION.openLabel
                              : PARKS_SECTION.maintenanceLabel}
                          </span>
                        </motion.div>
                      </div>
                      <div className="p-6">
                        <h3 className="font-black text-xl text-[#1a332a] mb-2 group-hover:text-[#2d4a3e] transition-colors">
                          {park.nombre}
                        </h3>
                        <p className="text-sm text-[#7a8a7f] flex items-center gap-1.5 mb-3">
                          <MapPin className="h-4 w-4 text-[#8bc34a]" />
                          {park.direccion?.split(',')[0] || park.ciudad || 'Bucaramanga'}
                        </p>
                        <p className="text-sm text-[#5a6b5f] leading-relaxed line-clamp-2">
                          {park.descripcion || PARKS_SECTION.fallbackDesc}
                        </p>
                        <motion.div
                          className="mt-4 flex items-center gap-1 text-sm font-bold text-[#2d4a3e] group-hover:text-[#8bc34a] transition-colors"
                          initial={{ x: 0 }}
                          whileHover={{ x: 4 }}
                        >
                          {PARKS_SECTION.exploreLabel} <ArrowRight className="h-4 w-4" />
                        </motion.div>
                      </div>
                    </Link>
                  </motion.div>
                </motion.div>
              ))
            ) : (
              /* Estado vacío — backend sin datos */
              !error && (
                <motion.div
                  key="empty"
                  className="md:col-span-3 text-center py-16 text-[#7a8a7f]"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <Trees className="h-12 w-12 mx-auto mb-4 opacity-30" />
                  <p className="font-semibold text-lg">{PARKS_SECTION.emptyTitle}</p>
                  <p className="text-sm mt-1">{PARKS_SECTION.emptySubtitle}</p>
                </motion.div>
              )
            )}
          </AnimatePresence>
        </motion.div>

        {/* Link mobile a todos los parques */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
        >
          <Link
            to="/parks"
            className="md:hidden mt-8 block text-center text-[#2d4a3e] font-bold text-lg"
          >
            {PARKS_SECTION.allParksMobileLink}
          </Link>
        </motion.div>
      </section>

      {/* ── CÓMO FUNCIONA ── */}
      <section className="bg-white border-y border-[#e0e8db] overflow-hidden">
        <div className="max-w-6xl mx-auto px-6 py-24">
          <motion.h2
            className="text-3xl md:text-5xl font-black text-[#1a332a] mb-16 text-center"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            {HOW_IT_WORKS.titleLine1}
            <br className="hidden md:block" /> {HOW_IT_WORKS.titleLine2}
          </motion.h2>

          <div className="grid md:grid-cols-3 gap-8 md:gap-12">
            {HOW_IT_WORKS.steps.map((item, i) => (
              <motion.div
                key={item.num}
                className="relative"
                initial={{
                  opacity: 0,
                  x: i === 0 ? -40 : i === 2 ? 40 : 0,
                  y: i === 1 ? 40 : 0,
                }}
                whileInView={{ opacity: 1, x: 0, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.7, delay: i * 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
              >
                <motion.span
                  className="text-8xl md:text-9xl font-black text-[#e8ece4] absolute -top-6 -left-2 select-none"
                  initial={{ opacity: 0, scale: 0.5 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{
                    duration: 0.5,
                    delay: i * 0.2 + 0.3,
                    type: 'spring',
                    stiffness: 200,
                  }}
                >
                  {item.num}
                </motion.span>
                <div className="relative pt-10 md:pt-14">
                  <motion.div
                    className="h-1 w-12 bg-[#8bc34a] mb-6 rounded-full"
                    initial={{ width: 0 }}
                    whileInView={{ width: 48 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: i * 0.2 + 0.5 }}
                  />
                  <h3 className="font-black text-xl text-[#1a332a] mb-3">{item.title}</h3>
                  <p className="text-[#5a6b5f] leading-relaxed text-lg">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA FINAL ── */}
      <section className="bg-[#2d4a3e] py-20 relative overflow-hidden">
        <motion.div
          className="absolute inset-0 opacity-5"
          animate={{ scale: [1, 1.1, 1], rotate: [0, 2, -2, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
          style={{
            backgroundImage: `radial-gradient(circle at 50% 50%, #8bc34a 1px, transparent 1px)`,
            backgroundSize: '40px 40px',
          }}
        />

        <div className="max-w-4xl mx-auto px-6 text-center relative">
          <motion.h2
            className="text-3xl md:text-5xl font-black text-white mb-6"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            {CTA_SECTION.title}
          </motion.h2>
          <motion.p
            className="text-[#a8c5b5] text-lg md:text-xl mb-10 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {CTA_SECTION.description}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 400, damping: 17 }}
              className="inline-block"
            >
              <Link
                to="/register"
                className="bg-[#8bc34a] text-[#1a332a] px-10 py-4 rounded-lg font-black text-lg hover:bg-[#9ccc65] transition-colors shadow-xl shadow-black/20"
              >
                {CTA_SECTION.btnLabel}
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="bg-[#1a332a] text-[#5a7a6b] py-10">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <motion.div
            className="flex items-center gap-2"
            whileHover={{ scale: 1.05 }}
            transition={{ type: 'spring', stiffness: 400 }}
          >
            <Mountain className="h-5 w-5 text-[#8bc34a]" />
            <span className="font-black text-white tracking-tight">BUCAPARK</span>
          </motion.div>
          <p className="text-sm">Hecho para Bucaramanga — {new Date().getFullYear()}</p>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
