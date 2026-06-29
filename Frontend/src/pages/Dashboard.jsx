import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "sonner";
import api from "../api/axiosConfig.js";
import { AuthContext } from "../contexts/AuthContext.jsx";
import { formatarMoeda } from "../utils/formatar.js";
import usePageTitle from "../hooks/usePageTitle.js";
import {
  FiArrowLeft,
  FiTrendingUp,
  FiUsers,
  FiDollarSign,
  FiCalendar,
  FiBarChart2,
} from "react-icons/fi";
import { MdOutlineDirectionsCar } from "react-icons/md";

const GLASS = {
  background: "rgba(255,255,255,0.06)",
  backdropFilter: "blur(20px)",
  WebkitBackdropFilter: "blur(20px)",
  border: "1px solid rgba(255,255,255,0.12)",
  boxShadow: "0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.08)",
};

function formatarMes(mesStr) {
  if (!mesStr) return "—";
  const [ano, mes] = mesStr.split("-");
  const nomes = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
  return `${nomes[parseInt(mes) - 1]} ${ano}`;
}

function StatCard({ icone, valor, label, cor, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className="rounded-2xl p-6 flex flex-col gap-3"
      style={GLASS}
    >
      <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
        style={{ background: `${cor}22`, border: `1px solid ${cor}44` }}>
        <span style={{ color: cor }}>{icone}</span>
      </div>
      <div>
        <p className="text-2xl font-extrabold text-white">{valor}</p>
        <p className="text-xs font-medium uppercase tracking-wide mt-0.5" style={{ color: "rgba(255,255,255,0.4)" }}>
          {label}
        </p>
      </div>
    </motion.div>
  );
}

function SkeletonStat() {
  return (
    <div className="rounded-2xl p-6 animate-pulse" style={GLASS}>
      <div className="w-11 h-11 rounded-xl mb-3" style={{ background: "rgba(255,255,255,0.08)" }} />
      <div className="h-7 rounded w-24 mb-2" style={{ background: "rgba(255,255,255,0.08)" }} />
      <div className="h-3 rounded w-32" style={{ background: "rgba(255,255,255,0.06)" }} />
    </div>
  );
}

export default function Dashboard() {
  usePageTitle("Dashboard de Ganhos");
  const { usuario } = useContext(AuthContext);
  const navigate = useNavigate();

  const [dados, setDados] = useState(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    if (usuario?.tipo !== "motorista") { navigate("/"); return; }
    api.get("/caronas/dashboard")
      .then(({ data }) => setDados(data))
      .catch(() => toast.error("Não foi possível carregar o dashboard."))
      .finally(() => setCarregando(false));
  }, [usuario, navigate]);

  const maxGanho = dados?.por_mes?.length
    ? Math.max(...dados.por_mes.map(m => m.ganho), 1)
    : 1;

  return (
    <div className="min-h-screen relative overflow-x-hidden"
      style={{ background: "linear-gradient(135deg, #020817 0%, #0f172a 40%, #1e1b4b 100%)" }}>

      {/* Blobs */}
      <motion.div
        className="absolute rounded-full pointer-events-none w-[500px] h-[500px] -top-32 -left-32 opacity-20"
        style={{ background: "radial-gradient(circle, #6366f1, transparent 70%)" }}
        animate={{ x: [0, 40, 0], y: [0, 30, 0], scale: [1, 1.1, 1] }}
        transition={{ duration: 10, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
      />

      <div className="relative z-10 max-w-3xl mx-auto px-4 pt-8 pb-12">

        {/* Back button + title */}
        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-sm font-medium mb-6 transition-colors"
            style={{ color: "rgba(255,255,255,0.35)" }}
            onMouseEnter={e => { e.currentTarget.style.color = "rgba(255,255,255,0.7)"; }}
            onMouseLeave={e => { e.currentTarget.style.color = "rgba(255,255,255,0.35)"; }}
          >
            <FiArrowLeft size={15} />
            Voltar
          </button>

          <div className="flex items-center gap-4 mb-8">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0"
              style={{ background: "rgba(99,102,241,0.2)", border: "1px solid rgba(99,102,241,0.35)" }}>
              <FiBarChart2 className="text-indigo-400 text-2xl" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-white">Dashboard de Ganhos</h1>
              <p className="text-sm mt-0.5" style={{ color: "rgba(255,255,255,0.4)" }}>
                Resumo das suas corridas concluídas
              </p>
            </div>
          </div>
        </motion.div>

        {/* Stat cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {carregando ? (
            [0, 1, 2].map(i => <SkeletonStat key={i} />)
          ) : (
            <>
              <StatCard
                icone={<FiDollarSign size={20} />}
                valor={formatarMoeda(dados?.total_ganho ?? 0)}
                label="Total ganho"
                cor="#10b981"
                delay={0}
              />
              <StatCard
                icone={<MdOutlineDirectionsCar size={20} />}
                valor={dados?.total_concluidas ?? 0}
                label="Caronas concluídas"
                cor="#6366f1"
                delay={0.1}
              />
              <StatCard
                icone={<FiUsers size={20} />}
                valor={dados?.total_passageiros ?? 0}
                label="Passageiros transportados"
                cor="#3b82f6"
                delay={0.2}
              />
            </>
          )}
        </div>

        {/* Monthly chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
          className="rounded-2xl p-6"
          style={GLASS}
        >
          <div className="flex items-center gap-2 mb-5">
            <FiTrendingUp className="text-indigo-400" />
            <h2 className="font-bold text-white text-base">Ganhos por mês</h2>
            <span className="text-xs ml-auto" style={{ color: "rgba(255,255,255,0.3)" }}>últimos 6 meses</span>
          </div>

          {carregando ? (
            <div className="space-y-3">
              {[0, 1, 2].map(i => (
                <div key={i} className="animate-pulse flex items-center gap-3">
                  <div className="h-3 rounded w-14 shrink-0" style={{ background: "rgba(255,255,255,0.08)" }} />
                  <div className="h-6 rounded flex-1" style={{ background: "rgba(255,255,255,0.06)", width: `${30 + i * 20}%`, maxWidth: "100%" }} />
                  <div className="h-3 rounded w-16 shrink-0" style={{ background: "rgba(255,255,255,0.08)" }} />
                </div>
              ))}
            </div>
          ) : !dados?.por_mes?.length ? (
            <div className="flex flex-col items-center py-10 text-center">
              <FiCalendar className="text-white/20 text-4xl mb-3" />
              <p className="text-sm font-medium text-white/40">Nenhuma carona concluída ainda</p>
              <p className="text-xs text-white/25 mt-1">Conclua caronas para ver seus ganhos aqui</p>
            </div>
          ) : (
            <div className="space-y-3">
              {dados.por_mes.map((m, i) => {
                const pct = Math.round((m.ganho / maxGanho) * 100);
                return (
                  <motion.div
                    key={m.mes}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.05 * i }}
                    className="flex items-center gap-3"
                  >
                    <span className="text-xs font-medium w-14 shrink-0 text-right" style={{ color: "rgba(255,255,255,0.5)" }}>
                      {formatarMes(m.mes)}
                    </span>
                    <div className="flex-1 h-7 rounded-lg overflow-hidden relative" style={{ background: "rgba(255,255,255,0.05)" }}>
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ delay: 0.1 + 0.05 * i, duration: 0.5, ease: "easeOut" }}
                        className="absolute inset-y-0 left-0 rounded-lg"
                        style={{ background: "linear-gradient(90deg,#6366f1,#3b82f6)", minWidth: pct > 0 ? 8 : 0 }}
                      />
                      <span className="absolute inset-y-0 left-3 flex items-center text-xs font-semibold text-white/60">
                        {m.caronas} {m.caronas === 1 ? "carona" : "caronas"}
                      </span>
                    </div>
                    <span className="text-xs font-bold w-20 shrink-0" style={{ color: "#6ee7b7" }}>
                      {formatarMoeda(m.ganho)}
                    </span>
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.div>

        {/* Tip */}
        {!carregando && dados && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-center text-xs mt-6"
            style={{ color: "rgba(255,255,255,0.2)" }}
          >
            Ganhos estimados com base nas vagas ocupadas nas caronas concluídas.
          </motion.p>
        )}
      </div>
    </div>
  );
}
