import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Mountain,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  Loader2,
  Check,
  X,
} from 'lucide-react';

// ─── Textos editables ─────────────────────────────────────────────────────────
// Para cambiar cualquier texto visible, editá solo este objeto.
const TEXTS = {
  // Header de la card
  title: 'Crear cuenta',
  subtitle: 'Unite a los que usan los parques en serio',
  // Indicador de pasos
  step1Label: 'Tus datos',
  step2Label: 'Seguridad',
  // Paso 1 — nombre y email
  nombreLabel: 'Nombre completo',
  nombrePlaceholder: 'Juan Pérez',
  emailLabel: 'Email',
  emailPlaceholder: 'juan@email.com',
  nextBtn: 'Siguiente',
  // Paso 2 — contraseñas
  passwordLabel: 'Contraseña',
  passwordPlaceholder: 'Mínimo 6 caracteres',
  confirmLabel: 'Repetir contraseña',
  confirmPlaceholder: 'Igual que arriba',
  passwordMismatch: 'Las contraseñas no coinciden',
  backBtn: 'Atrás',
  btnLoading: 'Creando...',
  btnDefault: 'Crear cuenta',
  // Links y pie
  backLink: 'Ya tengo cuenta',
  hasAccountText: '¿Ya tenés cuenta?',
  loginLink: 'Ingresá',
  footer: 'Al registrarte aceptás los términos de uso de BUCAPARK',
};

// ─── Mapeo de errores del backend ─────────────────────────────────────────────
// Clave = mensaje exacto del backend → Valor = mensaje amigable para el usuario
const BACKEND_ERRORS = {
  'El email ya está registrado': 'Este email ya tiene una cuenta. ¿Querés iniciar sesión?',
  'Nombre, email y contraseña son requeridos': 'Completá todos los campos.',
};

const friendlyError = (err) => {
  if (!err) return 'Ocurrió un error. Intentá de nuevo.';
  if (err.code === 'ECONNABORTED' || err.message === 'Network Error')
    return 'No se pudo conectar al servidor. Verificá tu conexión.';
  const msg = err.response?.data?.error || err.response?.data?.message || err.message || '';
  return BACKEND_ERRORS[msg] || msg || 'Error al crear la cuenta. Probá con otro email.';
};

// ─── Componente ───────────────────────────────────────────────────────────────
const RegisterPage = () => {
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const [step, setStep] = useState(1);

  const { register } = useAuth();
  const navigate = useNavigate();
  const nombreRef = useRef(null);
  const passwordRef = useRef(null);

  // Autofocus según el paso activo
  useEffect(() => {
    if (step === 1) nombreRef.current?.focus();
    else passwordRef.current?.focus();
  }, [step]);

  // Validaciones en tiempo real
  const validations = {
    nombre: formData.nombre.trim().length >= 2,
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email),
    password: formData.password.length >= 6,
    match: formData.password === formData.confirmPassword && formData.password !== '',
  };

  const allValid =
    validations.nombre && validations.email && validations.password && validations.match;

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (error) setError('');
  };

  const handleNext = () => {
    if (validations.nombre && validations.email) setStep(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return; // evita doble submit

    if (!allValid) {
      setError('Completá todos los campos correctamente.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      await register({
        nombre: formData.nombre.trim(),
        email: formData.email,
        password: formData.password,
      });
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(friendlyError(err));
      // Si el error es de email duplicado, vuelve al paso 1
      if (err.response?.data?.error?.includes('email')) setStep(1);
    } finally {
      setLoading(false);
    }
  };

  // Calcula la fortaleza de la contraseña para la barra visual
  const getPasswordStrength = () => {
    const p = formData.password;
    if (p.length === 0) return { level: 0, text: '', color: '' };
    if (p.length < 6) return { level: 1, text: 'Débil', color: 'bg-[#ff9800]' };
    if (p.length < 10 || !/[A-Z]/.test(p) || !/[0-9]/.test(p))
      return { level: 2, text: 'Regular', color: 'bg-[#ffc107]' };
    return { level: 3, text: 'Fuerte', color: 'bg-[#8bc34a]' };
  };

  const strength = getPasswordStrength();

  // ─── Variantes de animación ────────────────────────────────────────────────
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 25 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] } },
  };

  const slideVariants = {
    enter: (direction) => ({ x: direction > 0 ? 300 : -300, opacity: 0 }),
    center: { x: 0, opacity: 1, transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] } },
    exit: (direction) => ({
      x: direction < 0 ? 300 : -300,
      opacity: 0,
      transition: { duration: 0.3 },
    }),
  };

  return (
    <div className="min-h-screen bg-[#f4f7f0] flex items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Patrón de fondo */}
      <div
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%232d4a3e' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          backgroundSize: '60px 60px',
        }}
      />

      {/* Círculos decorativos de fondo */}
      <motion.div
        className="absolute -top-32 -left-20 w-72 h-72 rounded-full bg-[#8bc34a]/10 pointer-events-none"
        animate={{ scale: [1, 1.15, 1], y: [0, 30, 0] }}
        transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute -bottom-20 -right-32 w-80 h-80 rounded-full bg-[#2d4a3e]/5 pointer-events-none"
        animate={{ scale: [1, 1.1, 1], y: [0, -20, 0] }}
        transition={{ duration: 11, repeat: Infinity, ease: 'easeInOut' }}
      />

      <motion.div
        className="w-full max-w-md relative"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        {/* Link para volver al login */}
        <motion.div variants={itemVariants} className="mb-6">
          <Link
            to="/login"
            className="inline-flex items-center gap-2 text-[#5a6b5f] hover:text-[#2d4a3e] font-bold text-sm transition-colors group"
          >
            <motion.span
              className="inline-block"
              whileHover={{ x: -4 }}
              transition={{ type: 'spring', stiffness: 400 }}
            >
              <ArrowLeft className="h-4 w-4" />
            </motion.span>
            {TEXTS.backLink}
          </Link>
        </motion.div>

        {/* ── Card principal ── */}
        <motion.div
          className="bg-white rounded-2xl shadow-xl border border-[#e0e8db] overflow-hidden"
          variants={itemVariants}
        >
          {/* Header verde */}
          <div className="bg-[#2d4a3e] px-8 py-10 text-center relative overflow-hidden">
            <motion.div
              className="absolute inset-0 opacity-10"
              animate={{ backgroundPosition: ['0% 0%', '100% 100%'] }}
              transition={{ duration: 20, repeat: Infinity, repeatType: 'reverse', ease: 'linear' }}
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                backgroundSize: '60px 60px',
              }}
            />
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ duration: 0.6, delay: 0.3, type: 'spring', stiffness: 200 }}
              className="relative"
            >
              <Mountain className="h-12 w-12 text-[#8bc34a] mx-auto mb-4" />
            </motion.div>
            <motion.h1 className="text-2xl font-black text-white relative" variants={itemVariants}>
              {TEXTS.title}
            </motion.h1>
            <motion.p className="text-[#a8c5b5] mt-2 text-sm relative" variants={itemVariants}>
              {TEXTS.subtitle}
            </motion.p>
          </div>

          <div className="px-8 py-8">
            {/* Banner de error */}
            <AnimatePresence mode="wait">
              {error && (
                <motion.div
                  key="error-banner"
                  className="mb-6 p-4 bg-[#fff3e0] border-l-4 border-[#ff9800] rounded-r-lg flex items-start gap-3"
                  initial={{ opacity: 0, x: -20, height: 0 }}
                  animate={{ opacity: 1, x: 0, height: 'auto' }}
                  exit={{ opacity: 0, x: 20, height: 0 }}
                  transition={{ duration: 0.3 }}
                  role="alert"
                  aria-live="assertive"
                >
                  <AlertCircle className="h-5 w-5 text-[#ff9800] mt-0.5 flex-shrink-0" aria-hidden="true" />
                  <p className="text-sm text-[#e65100] font-medium">{error}</p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* ── Indicador de pasos (1 → 2) ── */}
            <div className="flex items-center gap-3 mb-8">
              {[1, 2].map((s) => (
                <div key={s} className="flex items-center gap-3">
                  <motion.div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-black ${
                      step >= s ? 'bg-[#8bc34a] text-[#1a332a]' : 'bg-[#e0e8db] text-[#a8b5a0]'
                    }`}
                    animate={{ scale: step === s ? 1.1 : 1, backgroundColor: step >= s ? '#8bc34a' : '#e0e8db' }}
                    transition={{ type: 'spring', stiffness: 400 }}
                  >
                    {step > s ? <Check className="h-4 w-4" /> : s}
                  </motion.div>
                  <span className={`text-xs font-bold ${step >= s ? 'text-[#1a332a]' : 'text-[#a8b5a0]'}`}>
                    {s === 1 ? TEXTS.step1Label : TEXTS.step2Label}
                  </span>
                  {s === 1 && <div className="w-8 h-px bg-[#e0e8db]" />}
                </div>
              ))}
            </div>

            <form onSubmit={handleSubmit}>
              <AnimatePresence mode="wait" custom={step}>
                <motion.div
                  key={step}
                  custom={step}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                >
                  {step === 1 ? (
                    /* ── PASO 1: nombre + email ── */
                    <div className="space-y-5">
                      {/* Nombre */}
                      <motion.div variants={itemVariants} custom={0}>
                        <label htmlFor="nombre" className="block text-sm font-bold text-[#1a332a] mb-2">
                          {TEXTS.nombreLabel}
                        </label>
                        <motion.div
                          className="relative"
                          animate={{ scale: focusedField === 'nombre' ? 1.01 : 1 }}
                          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                        >
                          <User
                            className={`absolute left-4 top-3.5 h-5 w-5 transition-colors duration-200 ${
                              focusedField === 'nombre' ? 'text-[#8bc34a]' : 'text-[#a8b5a0]'
                            }`}
                            aria-hidden="true"
                          />
                          <input
                            ref={nombreRef}
                            id="nombre"
                            type="text"
                            name="nombre"
                            value={formData.nombre}
                            onChange={handleChange}
                            onFocus={() => setFocusedField('nombre')}
                            onBlur={() => setFocusedField(null)}
                            className="w-full pl-12 pr-12 py-3 bg-[#f8faf6] border-2 border-[#e0e8db] rounded-xl text-[#1a332a] font-medium placeholder:text-[#a8b5a0] outline-none transition-all duration-200 focus:border-[#8bc34a] focus:bg-white focus:shadow-lg focus:shadow-[#8bc34a]/10"
                            placeholder={TEXTS.nombrePlaceholder}
                            autoComplete="name"
                            aria-required="true"
                            disabled={loading}
                          />
                          <AnimatePresence>
                            {validations.nombre && (
                              <motion.div
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0, opacity: 0 }}
                                className="absolute right-4 top-3.5"
                              >
                                <Check className="h-5 w-5 text-[#8bc34a]" />
                              </motion.div>
                            )}
                          </AnimatePresence>
                          <motion.div
                            className="absolute bottom-0 left-0 h-0.5 bg-[#8bc34a] rounded-full"
                            initial={{ width: '0%' }}
                            animate={{ width: focusedField === 'nombre' ? '100%' : '0%' }}
                            transition={{ duration: 0.3 }}
                          />
                        </motion.div>
                      </motion.div>

                      {/* Email */}
                      <motion.div variants={itemVariants} custom={1}>
                        <label htmlFor="email" className="block text-sm font-bold text-[#1a332a] mb-2">
                          {TEXTS.emailLabel}
                        </label>
                        <motion.div
                          className="relative"
                          animate={{ scale: focusedField === 'email' ? 1.01 : 1 }}
                          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                        >
                          <Mail
                            className={`absolute left-4 top-3.5 h-5 w-5 transition-colors duration-200 ${
                              focusedField === 'email' ? 'text-[#8bc34a]' : 'text-[#a8b5a0]'
                            }`}
                            aria-hidden="true"
                          />
                          <input
                            id="email"
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            onFocus={() => setFocusedField('email')}
                            onBlur={() => setFocusedField(null)}
                            className="w-full pl-12 pr-12 py-3 bg-[#f8faf6] border-2 border-[#e0e8db] rounded-xl text-[#1a332a] font-medium placeholder:text-[#a8b5a0] outline-none transition-all duration-200 focus:border-[#8bc34a] focus:bg-white focus:shadow-lg focus:shadow-[#8bc34a]/10"
                            placeholder={TEXTS.emailPlaceholder}
                            autoComplete="email"
                            inputMode="email"
                            aria-required="true"
                            disabled={loading}
                          />
                          <AnimatePresence>
                            {validations.email && (
                              <motion.div
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0, opacity: 0 }}
                                className="absolute right-4 top-3.5"
                              >
                                <Check className="h-5 w-5 text-[#8bc34a]" />
                              </motion.div>
                            )}
                          </AnimatePresence>
                          <motion.div
                            className="absolute bottom-0 left-0 h-0.5 bg-[#8bc34a] rounded-full"
                            initial={{ width: '0%' }}
                            animate={{ width: focusedField === 'email' ? '100%' : '0%' }}
                            transition={{ duration: 0.3 }}
                          />
                        </motion.div>
                      </motion.div>

                      {/* Botón siguiente */}
                      <motion.button
                        type="button"
                        onClick={handleNext}
                        disabled={!validations.nombre || !validations.email}
                        className="w-full bg-[#2d4a3e] text-white py-3.5 rounded-xl font-black text-lg hover:bg-[#1a332a] transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-6"
                        whileHover={validations.nombre && validations.email ? { scale: 1.02 } : {}}
                        whileTap={validations.nombre && validations.email ? { scale: 0.98 } : {}}
                      >
                        {TEXTS.nextBtn}
                        <motion.span
                          animate={{ x: [0, 4, 0] }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                        >
                          <ArrowRight className="h-5 w-5" />
                        </motion.span>
                      </motion.button>
                    </div>
                  ) : (
                    /* ── PASO 2: contraseñas ── */
                    <div className="space-y-5">
                      {/* Contraseña */}
                      <motion.div variants={itemVariants} custom={0}>
                        <label htmlFor="password" className="block text-sm font-bold text-[#1a332a] mb-2">
                          {TEXTS.passwordLabel}
                        </label>
                        <motion.div
                          className="relative"
                          animate={{ scale: focusedField === 'password' ? 1.01 : 1 }}
                          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                        >
                          <Lock
                            className={`absolute left-4 top-3.5 h-5 w-5 transition-colors duration-200 ${
                              focusedField === 'password' ? 'text-[#8bc34a]' : 'text-[#a8b5a0]'
                            }`}
                            aria-hidden="true"
                          />
                          <input
                            ref={passwordRef}
                            id="password"
                            type={showPassword ? 'text' : 'password'}
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            onFocus={() => setFocusedField('password')}
                            onBlur={() => setFocusedField(null)}
                            className="w-full pl-12 pr-12 py-3 bg-[#f8faf6] border-2 border-[#e0e8db] rounded-xl text-[#1a332a] font-medium placeholder:text-[#a8b5a0] outline-none transition-all duration-200 focus:border-[#8bc34a] focus:bg-white focus:shadow-lg focus:shadow-[#8bc34a]/10"
                            placeholder={TEXTS.passwordPlaceholder}
                            autoComplete="new-password"
                            aria-required="true"
                            disabled={loading}
                          />
                          <motion.button
                            type="button"
                            onClick={() => setShowPassword((v) => !v)}
                            className="absolute right-4 top-3.5 text-[#a8b5a0] hover:text-[#5a6b5f] transition-colors"
                            whileTap={{ scale: 0.8 }}
                            aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                          >
                            <AnimatePresence mode="wait">
                              {showPassword ? (
                                <motion.div
                                  key="eyeoff"
                                  initial={{ opacity: 0, rotate: -90 }}
                                  animate={{ opacity: 1, rotate: 0 }}
                                  exit={{ opacity: 0, rotate: 90 }}
                                  transition={{ duration: 0.2 }}
                                >
                                  <EyeOff className="h-5 w-5" />
                                </motion.div>
                              ) : (
                                <motion.div
                                  key="eye"
                                  initial={{ opacity: 0, rotate: 90 }}
                                  animate={{ opacity: 1, rotate: 0 }}
                                  exit={{ opacity: 0, rotate: -90 }}
                                  transition={{ duration: 0.2 }}
                                >
                                  <Eye className="h-5 w-5" />
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </motion.button>
                          <motion.div
                            className="absolute bottom-0 left-0 h-0.5 bg-[#8bc34a] rounded-full"
                            initial={{ width: '0%' }}
                            animate={{ width: focusedField === 'password' ? '100%' : '0%' }}
                            transition={{ duration: 0.3 }}
                          />
                        </motion.div>

                        {/* Barra de fortaleza */}
                        <div className="mt-2 flex items-center gap-2">
                          <div className="flex-1 h-1.5 bg-[#e0e8db] rounded-full overflow-hidden">
                            <motion.div
                              className={`h-full rounded-full ${strength.color}`}
                              initial={{ width: 0 }}
                              animate={{ width: `${(strength.level / 3) * 100}%` }}
                              transition={{ duration: 0.3 }}
                            />
                          </div>
                          <span className="text-xs font-bold text-[#5a6b5f] w-16">{strength.text}</span>
                        </div>
                      </motion.div>

                      {/* Confirmar contraseña */}
                      <motion.div variants={itemVariants} custom={1}>
                        <label htmlFor="confirmPassword" className="block text-sm font-bold text-[#1a332a] mb-2">
                          {TEXTS.confirmLabel}
                        </label>
                        <motion.div
                          className="relative"
                          animate={{ scale: focusedField === 'confirm' ? 1.01 : 1 }}
                          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                        >
                          <Lock
                            className={`absolute left-4 top-3.5 h-5 w-5 transition-colors duration-200 ${
                              focusedField === 'confirm' ? 'text-[#8bc34a]' : 'text-[#a8b5a0]'
                            }`}
                            aria-hidden="true"
                          />
                          <input
                            id="confirmPassword"
                            type={showPassword ? 'text' : 'password'}
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            onFocus={() => setFocusedField('confirm')}
                            onBlur={() => setFocusedField(null)}
                            className={`w-full pl-12 pr-12 py-3 bg-[#f8faf6] border-2 rounded-xl text-[#1a332a] font-medium placeholder:text-[#a8b5a0] outline-none transition-all duration-200 focus:bg-white focus:shadow-lg ${
                              formData.confirmPassword && !validations.match
                                ? 'border-[#ff9800] focus:border-[#ff9800] focus:shadow-[#ff9800]/10'
                                : 'border-[#e0e8db] focus:border-[#8bc34a] focus:shadow-[#8bc34a]/10'
                            }`}
                            placeholder={TEXTS.confirmPlaceholder}
                            autoComplete="new-password"
                            aria-required="true"
                            disabled={loading}
                          />
                          <AnimatePresence>
                            {formData.confirmPassword && (
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                exit={{ scale: 0 }}
                                className="absolute right-4 top-3.5"
                              >
                                {validations.match ? (
                                  <Check className="h-5 w-5 text-[#8bc34a]" />
                                ) : (
                                  <X className="h-5 w-5 text-[#ff9800]" />
                                )}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </motion.div>
                        <AnimatePresence>
                          {formData.confirmPassword && !validations.match && (
                            <motion.p
                              className="text-xs text-[#ff9800] mt-1 font-medium"
                              initial={{ opacity: 0, y: -5 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -5 }}
                            >
                              {TEXTS.passwordMismatch}
                            </motion.p>
                          )}
                        </AnimatePresence>
                      </motion.div>

                      {/* Botones: atrás + crear cuenta */}
                      <div className="flex gap-3 mt-6">
                        <motion.button
                          type="button"
                          onClick={() => setStep(1)}
                          disabled={loading}
                          className="flex-1 bg-[#e0e8db] text-[#5a6b5f] py-3.5 rounded-xl font-bold text-lg hover:bg-[#d0ddd0] transition-colors disabled:opacity-40 flex items-center justify-center gap-2"
                          whileHover={!loading ? { scale: 1.02 } : {}}
                          whileTap={!loading ? { scale: 0.98 } : {}}
                        >
                          <ArrowLeft className="h-5 w-5" />
                          {TEXTS.backBtn}
                        </motion.button>

                        <motion.button
                          type="submit"
                          disabled={loading || !allValid}
                          className="flex-[2] bg-[#8bc34a] text-[#1a332a] py-3.5 rounded-xl font-black text-lg hover:bg-[#9ccc65] transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 relative overflow-hidden"
                          whileHover={!loading && allValid ? { scale: 1.02 } : {}}
                          whileTap={!loading && allValid ? { scale: 0.98 } : {}}
                          aria-busy={loading}
                        >
                          <motion.div
                            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                            initial={{ x: '-100%' }}
                            whileHover={{ x: '100%' }}
                            transition={{ duration: 0.6 }}
                          />
                          {loading ? (
                            <>
                              <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
                              <span>{TEXTS.btnLoading}</span>
                            </>
                          ) : (
                            <>
                              <span>{TEXTS.btnDefault}</span>
                              <Check className="h-5 w-5" aria-hidden="true" />
                            </>
                          )}
                        </motion.button>
                      </div>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </form>

            {/* Divisor */}
            <motion.div className="my-6 flex items-center gap-4" variants={itemVariants}>
              <div className="flex-1 h-px bg-[#e0e8db]" />
              <span className="text-xs font-bold text-[#a8b5a0] uppercase tracking-wider">o</span>
              <div className="flex-1 h-px bg-[#e0e8db]" />
            </motion.div>

            {/* Link a login */}
            <motion.p className="text-center text-[#5a6b5f]" variants={itemVariants}>
              {TEXTS.hasAccountText}{' '}
              <Link
                to="/login"
                className="text-[#2d4a3e] font-bold hover:text-[#8bc34a] transition-colors inline-flex items-center gap-1 group"
              >
                {TEXTS.loginLink}
                <motion.span
                  className="inline-block"
                  whileHover={{ x: 4 }}
                  transition={{ type: 'spring', stiffness: 400 }}
                >
                  <ArrowRight className="h-4 w-4" />
                </motion.span>
              </Link>
            </motion.p>
          </div>
        </motion.div>

        {/* Pie de página */}
        <motion.div className="mt-8 text-center" variants={itemVariants}>
          <p className="text-xs text-[#a8b5a0]">{TEXTS.footer}</p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default RegisterPage;
