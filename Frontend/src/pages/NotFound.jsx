import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { FiArrowLeft, FiHome } from "react-icons/fi";
import usePageTitle from "../hooks/usePageTitle.js";

const CARD = {
  background: "#FFFFFF",
  border: "1px solid #E9EEF4",
  boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
};

export default function NotFound() {
  usePageTitle("404 — Página não encontrada");
  const navigate = useNavigate();

  return (
    <div
      className="min-h-screen relative overflow-x-hidden flex items-center justify-center"
      style={{ background: "#F4F7FB" }}
    >
      <div className="relative z-10 text-center px-4 w-full max-w-sm mx-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 24 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="rounded-3xl p-10"
          style={CARD}
        >
          <motion.p
            className="text-9xl font-extrabold mb-2 select-none leading-none"
            style={{
              background: "linear-gradient(135deg, #6366f1, #3b82f6, #10b981)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
            animate={{ scale: [1, 1.04, 1] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          >
            404
          </motion.p>

          <h1 className="text-xl font-bold mb-2" style={{ color: "#0F172A" }}>Página não encontrada</h1>
          <p className="text-sm leading-relaxed mb-8" style={{ color: "#64748B" }}>
            O caminho que você tentou acessar não existe ou foi removido.
          </p>

          <div className="flex flex-col gap-3">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate("/")}
              className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-sm font-semibold text-white"
              style={{ background: "linear-gradient(135deg,#6366f1,#3b82f6)", boxShadow: "0 4px 16px rgba(99,102,241,0.3)" }}
            >
              <FiHome />
              Ir para o início
            </motion.button>
            <button
              onClick={() => navigate(-1)}
              className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-sm font-medium transition-all"
              style={{ color: "#64748B", background: "#F1F5F9", border: "1px solid #E2E8F0" }}
              onMouseEnter={e => { e.currentTarget.style.background = "#EEF2FF"; e.currentTarget.style.color = "#6366f1"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "#F1F5F9"; e.currentTarget.style.color = "#64748B"; }}
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
