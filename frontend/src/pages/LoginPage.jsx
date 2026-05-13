import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  Mountain,
  ArrowRight,
  AlertCircle,
  Loader2,
} from 'lucide-react';

// ─── Textos editables ─────────────────────────────────────────────────────────
// Para cambiar cualquier texto visible, editá solo este objeto.
const TEXTS = {
  // Header de la card
  title: 'Bienvenido de vuelta',
  subtitle: 'Ingresá a tu cuenta de BUCAPARK',
  // Campos
  emailLabel: 'Email',
  emailPlaceholder: 'tu@email.com',
  passwordLabel: 'Contraseña',
  passwordPlaceholder: '••••••••',
  // Botón de envío
  btnLoading: 'Ingresando...',
  btnDefault: 'Iniciar Sesión',
  // Pie de la card
  noAccountText: '¿No tenés cuenta?',
  registerLink: 'Registrate',
};

// ─── Mapeo de errores del backend ─────────────────────────────────────────────
// Clave = mensaje exacto del backend → Valor = mensaje amigable para el usuario
const BACKEND_ERRORS = {
  'Credenciales inválidas': 'Email o contraseña incorrectos.',
  'Email y contraseña son requeridos': 'Completá los dos campos.',
};

// Convierte cualquier error de red o del backend en un mensaje legible
const friendlyError = (err) => {
  if (!err) return 'Ocurrió un error. Intentá de nuevo.';
  if (err.code === 'ECONNABORTED' || err.message === 'Network Error')
    return 'No se pudo conectar al servidor. Verificá tu conexión.';
  const msg = err.response?.data?.error || err.response?.data?.message || err.message || '';
  return BACKEND_ERRORS[msg] || msg || 'Email o contraseña incorrectos.';
};

// ─── Componente ───────────────────────────────────────────────────────────────
const LoginPage = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState(null);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const emailRef = useRef(null);

  // Autofocus en email al montar
  useEffect(() => {
    emailRef.current?.focus();
  }, []);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return; // evita doble submit

    if (!formData.email.trim() || !formData.password) {
      setError('Completá el email y la contraseña.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      await login(formData);
      // Redirige a la página que intentaba visitar, incluyendo query/hash.
      const fromState = location.state?.from;
      const from = fromState
        ? `${fromState.pathname || '/dashboard'}${fromState.search || ''}${fromState.hash || ''}`
        : '/dashboard';
      navigate(from, { replace: true });
    } catch (err) {
      setError(friendlyError(err));
    } finally {
      setLoading(false);
    }
  };

  // ─── Variantes de animación ────────────────────────────────────────────────
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08, delayChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 25 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] },
    },
  };

  return (
    <div className="min-h-screen bg-[#f4f7f0] flex items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Patrón de fondo sutil */}
      <div
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%232d4a3e' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          backgroundSize: '60px 60px',
        }}
      />

      {/* Círculos decorativos de fondo */}
      <motion.div
        className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-[#8bc34a]/10 pointer-events-none"
        animate={{ scale: [1, 1.2, 1], x: [0, 20, 0], y: [0, -20, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-[#2d4a3e]/5 pointer-events-none"
        animate={{ scale: [1, 1.1, 1], x: [0, -30, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
      />

      <motion.div
        className="w-full max-w-md relative"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
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

          {/* ── Formulario ── */}
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

            <form onSubmit={handleSubmit} className="space-y-5" noValidate>
              {/* Campo email */}
              <motion.div variants={itemVariants}>
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
                    ref={emailRef}
                    id="email"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    onFocus={() => setFocusedField('email')}
                    onBlur={() => setFocusedField(null)}
                    className="w-full pl-12 pr-4 py-3 bg-[#f8faf6] border-2 border-[#e0e8db] rounded-xl text-[#1a332a] font-medium placeholder:text-[#a8b5a0] outline-none transition-all duration-200 focus:border-[#8bc34a] focus:bg-white focus:shadow-lg focus:shadow-[#8bc34a]/10"
                    placeholder={TEXTS.emailPlaceholder}
                    autoComplete="email"
                    inputMode="email"
                    aria-required="true"
                    aria-invalid={!!error}
                    disabled={loading}
                  />
                  <motion.div
                    className="absolute bottom-0 left-0 h-0.5 bg-[#8bc34a] rounded-full"
                    initial={{ width: '0%' }}
                    animate={{ width: focusedField === 'email' ? '100%' : '0%' }}
                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                  />
                </motion.div>
              </motion.div>

              {/* Campo contraseña */}
              <motion.div variants={itemVariants}>
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
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    onFocus={() => setFocusedField('password')}
                    onBlur={() => setFocusedField(null)}
                    className="w-full pl-12 pr-12 py-3 bg-[#f8faf6] border-2 border-[#e0e8db] rounded-xl text-[#1a332a] font-medium placeholder:text-[#a8b5a0] outline-none transition-all duration-200 focus:border-[#8bc34a] focus:bg-white focus:shadow-lg focus:shadow-[#8bc34a]/10"
                    placeholder={TEXTS.passwordPlaceholder}
                    autoComplete="current-password"
                    aria-required="true"
                    aria-invalid={!!error}
                    disabled={loading}
                  />
                  <motion.button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-4 top-3.5 text-[#a8b5a0] hover:text-[#5a6b5f] transition-colors"
                    whileTap={{ scale: 0.8 }}
                    aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                    tabIndex={0}
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
                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                  />
                </motion.div>
              </motion.div>

              {/* Botón de envío */}
              <motion.div variants={itemVariants} className="pt-2">
                <motion.button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#2d4a3e] text-white py-3.5 rounded-xl font-black text-lg hover:bg-[#1a332a] transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 relative overflow-hidden"
                  whileHover={!loading ? { scale: 1.02 } : {}}
                  whileTap={!loading ? { scale: 0.98 } : {}}
                  transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                  aria-busy={loading}
                >
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
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
                      <motion.span
                        animate={{ x: [0, 4, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                      >
                        <ArrowRight className="h-5 w-5" aria-hidden="true" />
                      </motion.span>
                    </>
                  )}
                </motion.button>
              </motion.div>
            </form>

            {/* Divisor */}
            <motion.div className="my-6 flex items-center gap-4" variants={itemVariants}>
              <div className="flex-1 h-px bg-[#e0e8db]" />
              <span className="text-xs font-bold text-[#a8b5a0] uppercase tracking-wider">o</span>
              <div className="flex-1 h-px bg-[#e0e8db]" />
            </motion.div>

            {/* Link a registro */}
            <motion.p className="text-center text-[#5a6b5f]" variants={itemVariants}>
              {TEXTS.noAccountText}{' '}
              <Link
                to="/register"
                className="text-[#2d4a3e] font-bold hover:text-[#8bc34a] transition-colors inline-flex items-center gap-1 group"
              >
                {TEXTS.registerLink}
                <motion.span
                  className="inline-block"
                  initial={{ x: 0 }}
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
          <p className="text-xs text-[#a8b5a0]">
            Hecho para Bucaramanga — {new Date().getFullYear()}
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default LoginPage;
