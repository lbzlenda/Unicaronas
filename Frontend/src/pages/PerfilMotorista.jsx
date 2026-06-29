import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "sonner";
import api from "../api/axiosConfig.js";
import usePageTitle from "../hooks/usePageTitle.js";
import { FiArrowLeft, FiStar, FiUsers, FiCalendar, FiClock, FiDollarSign, FiArrowRight } from "react-icons/fi";
import { MdOutlineDirectionsCar } from "react-icons/md";
import { formatarMoeda } from "../utils/formatar.js";

const GLASS = {
  background: "rgba(255,255,255,0.06)",
  backdropFilter: "blur(20px)",
  WebkitBackdropFilter: "blur(20px)",
  border: "1px solid rgba(255,255,255,0.12)",
  boxShadow: "0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.08)",
};

const GRADIENTES = [
  ["#3b82f6", "#6366f1"],
  ["#a855f7", "#7c3aed"],
  ["#10b981", "#14b8a6"],
  ["#f97316", "#eab308"],
  ["#f43f5e", "#ec4899"],
  ["#06b6d4", "#3b82f6"],
];

function getGradiente(nome) {
  const idx = nome ? nome.charCodeAt(0) % GRADIENTES.length : 0;
  return GRADIENTES[idx];
}

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

function StarDisplay({ media, total }) {
  if (!media) return (
    <span className="text-sm" style={{ color: "rgba(255,255,255,0.3)" }}>Sem avaliações ainda</span>
  );
  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((i) => (
          <FiStar
            key={i}
            size={16}
            style={{
              fill: i <= Math.round(media) ? "#fbbf24" : "transparent",
              color: i <= Math.round(media) ? "#fbbf24" : "rgba(255,255,255,0.15)",
            }}
          />
        ))}
      </div>
      <span className="text-sm font-bold text-white">{media}</span>
      <span className="text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>
        ({total} avaliação{total !== 1 ? "ões" : ""})
      </span>
    </div>
  );
}

function formatarData(data) {
  if (!data) return null;
  const hoje = new Date().toISOString().split("T")[0];
  const amanha = new Date(Date.now() + 86400000).toISOString().split("T")[0];
  if (data === hoje) return "Hoje";
  if (data === amanha) return "Amanhã";
  const [, mes, dia] = data.split("-");
  return `${dia}/${mes}`;
}

function CardCaronaMini({ carona }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl p-4"
      style={GLASS}
    >
      <p className="text-sm font-bold text-white flex items-center gap-1.5 flex-wrap mb-3">
        <span className="text-white/60">{carona.origem}</span>
        <FiArrowRight size={12} className="text-white/25 shrink-0" />
        <span className="px-2 py-0.5 rounded-lg text-xs font-semibold"
          style={{ background: "rgba(99,102,241,0.18)", color: "#a5b4fc", border: "1px solid rgba(99,102,241,0.3)" }}>
          {carona.destino}
        </span>
      </p>
      <div className="grid grid-cols-3 gap-2 text-center">
        {[
          {
            icon: carona.data_saida ? <FiCalendar size={12} /> : <FiClock size={12} />,
            val: carona.data_saida ? formatarData(carona.data_saida) : carona.horario_saida,
            sub: carona.data_saida ? carona.horario_saida : "saída",
          },
          { icon: <FiDollarSign size={12} />, val: formatarMoeda(carona.valor), sub: "por vaga" },
          { icon: <FiUsers size={12} />, val: `${carona.vagas_disponiveis}/${carona.vagas}`, sub: "vagas" },
        ].map(({ icon, val, sub }, i) => (
          <div key={i} className="rounded-xl py-2.5"
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
            <span className="text-white/30 flex justify-center mb-0.5">{icon}</span>
            <p className="text-xs font-bold text-white">{val}</p>
            <p className="text-[10px] text-white/25">{sub}</p>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

export default function PerfilMotorista() {
  usePageTitle("Perfil do motorista");

  const { id } = useParams();
  const navigate = useNavigate();

  const [motorista, setMotorista] = useState(null);
  const [caronas, setCaronas] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(false);

  useEffect(() => {
    async function carregar() {
      try {
        const [{ data: perfil }, { data: rides }] = await Promise.all([
          api.get(`/auth/motorista/${id}`),
          api.get(`/caronas?motorista_id=${id}`),
        ]);
        setMotorista(perfil);
        setCaronas(rides);
      } catch {
        setErro(true);
        toast.error("Motorista não encontrado.");
      } finally {
        setCarregando(false);
      }
    }
    carregar();
  }, [id]);

  if (carregando) {
    return (
      <div className="min-h-screen flex items-center justify-center"
        style={{ background: "linear-gradient(135deg, #020817 0%, #0f172a 40%, #1e1b4b 100%)" }}>
        <svg className="animate-spin h-8 w-8 text-indigo-400" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      </div>
    );
  }

  if (erro || !motorista) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4"
        style={{ background: "linear-gradient(135deg, #020817 0%, #0f172a 40%, #1e1b4b 100%)" }}>
        <p className="text-white/50">Motorista não encontrado.</p>
        <button onClick={() => navigate(-1)} className="text-indigo-400 text-sm hover:text-indigo-300 transition">
          Voltar
        </button>
      </div>
    );
  }

  const [c1, c2] = getGradiente(motorista.nome);

  return (
    <div className="min-h-screen relative overflow-x-hidden"
      style={{ background: "linear-gradient(135deg, #020817 0%, #0f172a 40%, #1e1b4b 100%)" }}>

      <Blob className="w-[500px] h-[500px] -top-32 -right-24 opacity-15"
        style={{ background: `radial-gradient(circle, ${c1}, transparent 70%)` }}
        animate={{ x: [0, -40, 0], y: [0, 30, 0] }} />
      <Blob className="w-80 h-80 -bottom-20 -left-16 opacity-10"
        style={{ background: "radial-gradient(circle, #6366f1, transparent 70%)" }}
        animate={{ x: [0, 30, 0], y: [0, -20, 0] }} />

      {/* Hero card */}
      <div className="relative z-10 max-w-2xl mx-auto px-4 pt-8 pb-4">
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl p-6"
          style={{
            background: `linear-gradient(135deg, ${c1}22, ${c2}22)`,
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            border: `1px solid ${c1}44`,
            boxShadow: `0 8px 32px ${c1}22`,
          }}
        >
          <button onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 text-sm font-medium mb-6 transition"
            style={{ color: "rgba(255,255,255,0.5)" }}
            onMouseEnter={e => e.currentTarget.style.color = "#fff"}
            onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,0.5)"}>
            <FiArrowLeft /> Voltar
          </button>

          <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6">
            {/* Avatar */}
            {motorista.foto_perfil ? (
              <img src={motorista.foto_perfil} alt={motorista.nome}
                className="w-24 h-24 rounded-3xl object-cover shrink-0 shadow-xl"
                style={{ border: `2px solid ${c1}88` }} />
            ) : (
              <div className="w-24 h-24 rounded-3xl flex items-center justify-center shrink-0 shadow-xl font-extrabold text-white select-none"
                style={{
                  background: `linear-gradient(135deg, ${c1}, ${c2})`,
                  fontSize: 32,
                  boxShadow: `0 8px 32px ${c1}55`,
                }}>
                {motorista.nome[0].toUpperCase()}
              </div>
            )}

            <div className="text-center sm:text-left flex-1">
              <h1 className="text-3xl font-extrabold text-white mb-1">{motorista.nome}</h1>
              <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full mb-3"
                style={{ background: "rgba(255,255,255,0.12)", color: "#fff" }}>
                <MdOutlineDirectionsCar /> Motorista
              </span>
              <div>
                <StarDisplay media={motorista.media} total={motorista.total_avaliacoes} />
              </div>
            </div>
          </div>

          {/* Bio */}
          {motorista.bio && (
            <p className="mt-5 text-sm leading-relaxed rounded-xl px-4 py-3"
              style={{ color: "rgba(255,255,255,0.6)", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
              "{motorista.bio}"
            </p>
          )}
        </motion.div>
      </div>

      {/* Stats */}
      <div className="relative z-10 max-w-2xl mx-auto px-4 pb-4">
        <div className="grid grid-cols-2 gap-3">
          {[
            { val: motorista.total_caronas, label: "Caronas publicadas" },
            {
              val: motorista.media
                ? <span className="flex items-center justify-center gap-1">
                    <FiStar className="text-amber-400" />{motorista.media}
                  </span>
                : "—",
              label: motorista.total_avaliacoes > 0
                ? `${motorista.total_avaliacoes} avaliação${motorista.total_avaliacoes !== 1 ? "ões" : ""}`
                : "Sem avaliações",
            },
          ].map(({ val, label }, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="rounded-2xl p-5 text-center" style={GLASS}>
              <p className="text-3xl font-extrabold text-white">{val}</p>
              <p className="text-xs mt-1 uppercase tracking-wide font-medium"
                style={{ color: "rgba(255,255,255,0.4)" }}>{label}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Caronas ativas */}
      <div className="relative z-10 max-w-2xl mx-auto px-4 pb-10">
        <h2 className="text-base font-bold text-white mb-3 flex items-center gap-2">
          <MdOutlineDirectionsCar className="text-indigo-400" />
          Caronas disponíveis
          {caronas.length > 0 && (
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
              style={{ background: "rgba(99,102,241,0.18)", color: "#a5b4fc", border: "1px solid rgba(99,102,241,0.3)" }}>
              {caronas.length}
            </span>
          )}
        </h2>
        {caronas.length === 0 ? (
          <div className="rounded-2xl py-12 text-center" style={GLASS}>
            <MdOutlineDirectionsCar className="text-white/15 text-4xl mx-auto mb-2" />
            <p className="text-sm text-white/30">Nenhuma carona ativa no momento</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {caronas.map((c) => <CardCaronaMini key={c.id} carona={c} />)}
          </div>
        )}
      </div>
    </div>
  );
}
