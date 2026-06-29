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

const CARD = {
  background: "#FFFFFF",
  border: "1px solid #E9EEF4",
  boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
};

function formatarMes(mesStr) {
  if (!mesStr) return "—";
  const [ano, mes] = mesStr.split("-");
  const nomes = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
  return `${nomes[parseInt(mes) - 1]} ${ano}`;
}

const STAT_ACCENTS = [
  { bg: "#ECFDF5", color: "#059669" },
  { bg: "#EEF2FF", color: "#6366f1" },
  { bg: "#EFF6FF", color: "#3b82f6" },
];

function StatCard({ icone, valor, label, cor, accentBg, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className="rounded-2xl p-6 flex flex-col gap-3"
      style={CARD}
    >
      <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
        style={{ background: accentBg }}>
        <span style={{ color: cor }}>{icone}</span>
      </div>
      <div>
        <p className="text-2xl font-extrabold" style={{ color: "#0F172A" }}>{valor}</p>
        <p className="text-xs font-medium uppercase tracking-wide mt-0.5" style={{ color: "#94A3B8" }}>
          {label}
        </p>
      </div>
    </motion.div>
  );
}

function SkeletonStat() {
  return (
    <div className="rounded-2xl p-6 animate-pulse" style={CARD}>
      <div className="w-11 h-11 rounded-xl mb-3" style={{ background: "#F1F5F9" }} />
      <div className="h-7 rounded w-24 mb-2" style={{ background: "#F1F5F9" }} />
      <div className="h-3 rounded w-32" style={{ background: "#F1F5F9" }} />
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
      style={{ background: "#F4F7FB" }}>

      <div className="relative z-10 max-w-3xl mx-auto px-4 pt-8 pb-12">

        {/* Back button + title */}
        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-sm font-medium mb-6 transition-colors"
            style={{ color: "#94A3B8" }}
            onMouseEnter={e => { e.currentTarget.style.color = "#0F172A"; }}
            onMouseLeave={e => { e.currentTarget.style.color = "#94A3B8"; }}
          >
            <FiArrowLeft size={15} />
            Voltar
          </button>

          <div className="flex items-center gap-4 mb-8">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0"
              style={{ background: "#EEF2FF" }}>
              <FiBarChart2 className="text-indigo-500 text-2xl" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold" style={{ color: "#0F172A" }}>Dashboard de Ganhos</h1>
              <p className="text-sm mt-0.5" style={{ color: "#64748B" }}>
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
                cor="#059669"
                accentBg="#ECFDF5"
                delay={0}
              />
              <StatCard
                icone={<MdOutlineDirectionsCar size={20} />}
                valor={dados?.total_concluidas ?? 0}
                label="Caronas concluídas"
                cor="#6366f1"
                accentBg="#EEF2FF"
                delay={0.1}
              />
              <StatCard
                icone={<FiUsers size={20} />}
                valor={dados?.total_passageiros ?? 0}
                label="Passageiros transportados"
                cor="#3b82f6"
                accentBg="#EFF6FF"
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
          style={CARD}
        >
          <div className="flex items-center gap-2 mb-5">
            <FiTrendingUp className="text-indigo-500" />
            <h2 className="font-bold text-base" style={{ color: "#0F172A" }}>Ganhos por mês</h2>
            <span className="text-xs ml-auto" style={{ color: "#94A3B8" }}>últimos 6 meses</span>
          </div>

          {carregando ? (
            <div className="space-y-3">
              {[0, 1, 2].map(i => (
                <div key={i} className="animate-pulse flex items-center gap-3">
                  <div className="h-3 rounded w-14 shrink-0" style={{ background: "#F1F5F9" }} />
                  <div className="h-6 rounded flex-1" style={{ background: "#F1F5F9", width: `${30 + i * 20}%`, maxWidth: "100%" }} />
                  <div className="h-3 rounded w-16 shrink-0" style={{ background: "#F1F5F9" }} />
                </div>
              ))}
            </div>
          ) : !dados?.por_mes?.length ? (
            <div className="flex flex-col items-center py-10 text-center">
              <FiCalendar className="text-4xl mb-3" style={{ color: "#94A3B8" }} />
              <p className="text-sm font-medium" style={{ color: "#64748B" }}>Nenhuma carona concluída ainda</p>
              <p className="text-xs mt-1" style={{ color: "#94A3B8" }}>Conclua caronas para ver seus ganhos aqui</p>
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
                    <span className="text-xs font-medium w-14 shrink-0 text-right" style={{ color: "#64748B" }}>
                      {formatarMes(m.mes)}
                    </span>
                    <div className="flex-1 h-7 rounded-lg overflow-hidden relative" style={{ background: "#F1F5F9" }}>
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ delay: 0.1 + 0.05 * i, duration: 0.5, ease: "easeOut" }}
                        className="absolute inset-y-0 left-0 rounded-lg"
                        style={{ background: "linear-gradient(90deg,#6366f1,#3b82f6)", minWidth: pct > 0 ? 8 : 0 }}
                      />
                      <span className="absolute inset-y-0 left-3 flex items-center text-xs font-semibold" style={{ color: "#64748B" }}>
                        {m.caronas} {m.caronas === 1 ? "carona" : "caronas"}
                      </span>
                    </div>
                    <span className="text-xs font-bold w-20 shrink-0" style={{ color: "#059669" }}>
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
            style={{ color: "#94A3B8" }}
          >
            Ganhos estimados com base nas vagas ocupadas nas caronas concluídas.
          </motion.p>
        )}
      </div>
    </div>
  );
}
