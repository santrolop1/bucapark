import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { TreePine, ArrowLeft } from 'lucide-react';

// ─── Textos editables ─────────────────────────────────────────────────────────
// Para cambiar cualquier texto de esta página, editá solo este objeto.
const TEXTS = {
  heading: 'Página no encontrada',
  description: 'Te perdiste en el parque.',
  backBtn: 'Volver al inicio',
};

// ─── Componente ───────────────────────────────────────────────────────────────
const NotFoundPage = () => {
  return (
    <div className="min-h-screen bg-[#f4f7f0] flex flex-col items-center justify-center px-4">
      <motion.div
        className="text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Ícono animado */}
        <motion.div
          animate={{ rotate: [0, 5, -5, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          className="inline-block mb-6"
        >
          <TreePine className="h-16 w-16 text-[#8bc34a] mx-auto" />
        </motion.div>

        {/* Número 404 — el 0 central es verde */}
        <h1 className="text-8xl font-black text-[#2d4a3e] leading-none mb-2">
          4<span className="text-[#8bc34a]">0</span>4
        </h1>

        <p className="text-xl font-semibold text-[#5a6b5f] mt-3 mb-2">
          {TEXTS.heading}
        </p>
        <p className="text-sm text-[#a8b5a0] mb-10">
          {TEXTS.description}
        </p>

        {/* Botón volver */}
        <Link to="/">
          <motion.span
            className="inline-flex items-center gap-2 bg-[#2d4a3e] text-white px-6 py-3 rounded-xl font-bold hover:bg-[#1a332a] transition-colors"
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
          >
            <ArrowLeft className="h-4 w-4" />
            {TEXTS.backBtn}
          </motion.span>
        </Link>
      </motion.div>
    </div>
  );
};

export default NotFoundPage;
