import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { FiArrowLeft, FiHome } from "react-icons/fi";
import usePageTitle from "../hooks/usePageTitle.js";

const GLASS = {
  background: "rgba(255,255,255,0.06)",
  backdropFilter: "blur(20px)",
  WebkitBackdropFilter: "blur(20px)",
  border: "1px solid rgba(255,255,255,0.12)",
  boxShadow: "0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.08)",
};

function Blob({ className, style, animate }) {
  return (
    <motion.div
      className={`absolute rounded-full pointer-events-none ${className}`}
      style={style}
      animate={animate}
      transition={{ duration: 10, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
    />
  );
}

export default function NotFound() {
  usePageTitle("404 — Página não encontrada");
  const navigate = useNavigate();

  return (
    <div
      className="min-h-screen relative overflow-x-hidden flex items-center justify-center"
      style={{ background: "linear-gradient(135deg, #020817 0%, #0f172a 40%, #1e1b4b 100%)" }}
    >
      <Blob
        className="w-[600px] h-[600px] -top-48 -left-32 opacity-20"
        style={{ background: "radial-gradient(circle, #6366f1, transparent 70%)" }}
        animate={{ x: [0, 50, 0], y: [0, 40, 0], scale: [1, 1.1, 1] }}
      />
      <Blob
        className="w-96 h-96 -bottom-32 -right-16 opacity-15"
        style={{ background: "radial-gradient(circle, #3b82f6, transparent 70%)" }}
        animate={{ x: [0, -40, 0], y: [0, -30, 0] }}
      />
      <Blob
        className="w-72 h-72 opacity-10"
        style={{ background: "radial-gradient(circle, #06b6d4, transparent 70%)", top: "40%", right: "8%" }}
        animate={{ x: [0, -20, 0], y: [0, 30, 0] }}
      />

      <div className="relative z-10 text-center px-4 w-full max-w-sm mx-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 24 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="rounded-3xl p-10"
          style={GLASS}
        >
          <motion.p
            className="text-9xl font-extrabold mb-2 select-none leading-none"
            style={{
              background: "linear-gradient(135deg, #60a5fa, #818cf8, #a78bfa)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
            animate={{ scale: [1, 1.04, 1] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          >
            404
          </motion.p>

          <h1 className="text-xl font-bold text-white mb-2">Página não encontrada</h1>
          <p className="text-sm leading-relaxed mb-8" style={{ color: "rgba(255,255,255,0.4)" }}>
            O caminho que você tentou acessar não existe ou foi removido.
          </p>

          <div className="flex flex-col gap-3">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate("/")}
              className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-sm font-semibold text-white"
              style={{ background: "linear-gradient(135deg,#6366f1,#3b82f6)", boxShadow: "0 4px 16px rgba(99,102,241,0.4)" }}
            >
              <FiHome />
              Ir para o início
            </motion.button>
            <button
              onClick={() => navigate(-1)}
              className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-sm font-medium transition-all"
              style={{ color: "rgba(255,255,255,0.55)", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}
              onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.1)"}
              onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.06)"}
            >
              <FiArrowLeft />
              Voltar
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
