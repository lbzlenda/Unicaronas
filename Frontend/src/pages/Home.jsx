import { useContext, useEffect, useRef, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "sonner";
import { motion } from "framer-motion";
import api from "../api/axiosConfig.js";
import { AuthContext } from "../contexts/AuthContext.jsx";
import { DESTINOS } from "../schemas/caronaSchemas.js";
import { formatarMoeda } from "../utils/formatar.js";
import usePageTitle from "../hooks/usePageTitle.js";
import { usePullToRefresh } from "../hooks/usePullToRefresh.js";
import {
  FiClock,
  FiDollarSign,
  FiUsers,
  FiAlertCircle,
  FiArrowRight,
  FiCheckCircle,
  FiRefreshCw,
  FiPlus,
  FiList,
  FiCalendar,
  FiNavigation,
  FiMapPin,
  FiSearch,
  FiSmile,
  FiZap,
} from "react-icons/fi";
import { MdOutlineDirectionsCar } from "react-icons/md";
import { FaWhatsapp } from "react-icons/fa";

// Cores adaptadas para fundo escuro (glassmorphism)
const UNI_META = {
  "CEULP/ULBRA": { bar: "linear-gradient(135deg,#3b82f6,#6366f1)", dot: "#3b82f6", bg: "rgba(59,130,246,0.15)", color: "#93c5fd", border: "rgba(59,130,246,0.3)" },
  "UFT":          { bar: "linear-gradient(135deg,#10b981,#14b8a6)", dot: "#10b981", bg: "rgba(16,185,129,0.15)", color: "#6ee7b7", border: "rgba(16,185,129,0.3)" },
  "UniCatólica":  { bar: "linear-gradient(135deg,#a855f7,#7c3aed)", dot: "#a855f7", bg: "rgba(168,85,247,0.15)", color: "#d8b4fe", border: "rgba(168,85,247,0.3)" },
  "Afya":         { bar: "linear-gradient(135deg,#14b8a6,#06b6d4)", dot: "#14b8a6", bg: "rgba(20,184,166,0.15)", color: "#5eead4", border: "rgba(20,184,166,0.3)" },
  "IFTO":         { bar: "linear-gradient(135deg,#f97316,#eab308)", dot: "#f97316", bg: "rgba(249,115,22,0.15)", color: "#fdba74", border: "rgba(249,115,22,0.3)" },
  "ITOP":         { bar: "linear-gradient(135deg,#f43f5e,#ec4899)", dot: "#f43f5e", bg: "rgba(244,63,94,0.15)", color: "#fda4af", border: "rgba(244,63,94,0.3)" },
};
const DEFAULT_META = { bar: "linear-gradient(135deg,#94a3b8,#64748b)", dot: "#94a3b8", bg: "rgba(148,163,184,0.1)", color: "#cbd5e1", border: "rgba(148,163,184,0.2)" };
const getMeta = (d) => UNI_META[d] ?? DEFAULT_META;

function formatarData(data) {
  if (!data) return null;
  const hoje = new Date().toISOString().split("T")[0];
  const amanha = new Date(Date.now() + 86400000).toISOString().split("T")[0];
  if (data === hoje) return "Hoje";
  if (data === amanha) return "Amanhã";
  const [, mes, dia] = data.split("-");
  return `${dia}/${mes}`;
}

function distanciaKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function formatarDistancia(km) {
  if (km < 1) return `${Math.round(km * 1000)} m`;
  return `${km.toFixed(1)} km`;
}

function buildWhatsAppUrl(telefone, carona) {
  const num = telefone.replace(/\D/g, "");
  const internacional = num.startsWith("55") ? num : `55${num}`;
  const msg = encodeURIComponent(
    `Olá! Vi sua carona no UniCaronas: ${carona.origem} → ${carona.destino} às ${carona.horario_saida}. Gostaria de combinar os detalhes!`
  );
  return `https://wa.me/${internacional}?text=${msg}`;
}

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

/* ── Sub-componentes ── */

function SkeletonCard() {
  return (
    <div className="rounded-2xl p-5 animate-pulse" style={GLASS}>
      <div className="h-1.5 rounded-full mb-4" style={{ background: "rgba(255,255,255,0.08)" }} />
      <div className="flex justify-between mb-4">
        <div className="h-4 rounded w-2/3" style={{ background: "rgba(255,255,255,0.08)" }} />
        <div className="h-5 rounded-full w-20" style={{ background: "rgba(255,255,255,0.08)" }} />
      </div>
      <div className="grid grid-cols-3 gap-2 mb-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-16 rounded-xl" style={{ background: "rgba(255,255,255,0.05)" }} />
        ))}
      </div>
      <div className="h-1.5 rounded-full mb-4" style={{ background: "rgba(255,255,255,0.08)" }} />
      <div className="h-10 rounded-xl" style={{ background: "rgba(255,255,255,0.08)" }} />
    </div>
  );
}

function BadgeVagas({ vagas }) {
  if (vagas === 0)
    return (
      <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full shrink-0"
        style={{ background: "rgba(239,68,68,0.18)", color: "#fca5a5", border: "1px solid rgba(239,68,68,0.3)" }}>
        <span className="w-1.5 h-1.5 rounded-full bg-red-400" />Esgotado
      </span>
    );
  if (vagas <= 2)
    return (
      <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full shrink-0"
        style={{ background: "rgba(245,158,11,0.18)", color: "#fcd34d", border: "1px solid rgba(245,158,11,0.3)" }}>
        <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />Últimas vagas
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full shrink-0"
      style={{ background: "rgba(16,185,129,0.18)", color: "#6ee7b7", border: "1px solid rgba(16,185,129,0.3)" }}>
      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />Disponível
    </span>
  );
}

function CardCarona({ carona, onReservar, reservando, reservado, distancia }) {
  const disponivel = carona.vagas_disponiveis > 0;
  const esteReservando = reservando === carona.id;
  const meta = getMeta(carona.destino);

  const ocupacaoPct = carona.vagas > 0
    ? Math.round(((carona.vagas - carona.vagas_disponiveis) / carona.vagas) * 100)
    : 100;

  const btnStyle = disponivel
    ? { background: meta.bar }
    : { background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.25)", cursor: "not-allowed" };

  const btnClass = `w-full py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${
    disponivel && !esteReservando ? "text-white hover:opacity-90 hover:shadow-lg active:scale-[0.98]" : ""
  } ${esteReservando ? "text-white cursor-wait opacity-75" : ""}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.01, boxShadow: "0 12px 40px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.1)" }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      className="card-enter rounded-2xl overflow-hidden flex flex-col"
      style={GLASS}
    >
      <div className="h-1.5 w-full" style={{ background: disponivel ? meta.bar : "rgba(255,255,255,0.08)" }} />

      <div className="p-5 flex flex-col flex-1">
        {/* Título + badge */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex-1 min-w-0">
            <p className="font-bold text-white text-sm leading-snug flex items-center gap-1.5 flex-wrap mb-1">
              <span>{carona.origem}</span>
              <FiArrowRight className="text-white/25 shrink-0" />
              <span
                className="font-semibold px-2 py-0.5 rounded-lg text-xs"
                style={{ background: meta.bg, color: meta.color, border: `1px solid ${meta.border}` }}
              >
                {carona.destino}
              </span>
            </p>
            {distancia != null && (
              <span className="inline-flex items-center gap-1 text-xs font-medium"
                style={{ color: "rgba(255,255,255,0.4)" }}>
                <FiMapPin size={10} className="text-indigo-400" />
                {formatarDistancia(distancia)} de você
              </span>
            )}
          </div>
          <BadgeVagas vagas={carona.vagas_disponiveis} />
        </div>

        {/* Info grid */}
        <div className="grid grid-cols-3 gap-2 mb-3">
          {[
            {
              icon: carona.data_saida ? <FiCalendar /> : <FiClock />,
              val: carona.data_saida ? formatarData(carona.data_saida) : carona.horario_saida,
              label: carona.data_saida ? carona.horario_saida : "saída",
            },
            { icon: <FiDollarSign />, val: formatarMoeda(carona.valor), label: "por vaga" },
            { icon: <FiUsers />, val: `${carona.vagas_disponiveis}/${carona.vagas}`, label: "vagas" },
          ].map(({ icon, val, label }, i) => (
            <div key={i} className="flex flex-col items-center gap-1 rounded-xl py-3"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.06)" }}>
              <span className="text-white/35">{icon}</span>
              <span className="text-xs font-bold text-white">{val}</span>
              <span className="text-xs text-white/30">{label}</span>
            </div>
          ))}
        </div>

        {/* Placa do motorista — clicável */}
        {carona.motorista_placa && (
          <Link
            to={`/motorista/${carona.motorista_id}`}
            className="flex items-center gap-1.5 mb-3 text-xs group"
            style={{ color: "rgba(255,255,255,0.35)" }}
            onClick={e => e.stopPropagation()}
          >
            <span className="px-2 py-0.5 rounded font-mono font-bold tracking-widest transition-colors"
              style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.55)" }}
              onMouseEnter={e => { e.currentTarget.style.color = "#a5b4fc"; e.currentTarget.style.borderColor = "rgba(99,102,241,0.4)"; }}
              onMouseLeave={e => { e.currentTarget.style.color = "rgba(255,255,255,0.55)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; }}>
              {carona.motorista_placa.toUpperCase()}
            </span>
            <span className="group-hover:text-white/60 transition-colors">
              por {carona.motorista_nome?.split(" ")[0]}
            </span>
          </Link>
        )}

        {/* Barra de ocupação */}
        <div className="mb-4">
          <div className="flex items-center justify-between text-xs text-white/30 mb-1">
            <span>Ocupação</span>
            <span>{ocupacaoPct}% preenchido</span>
          </div>
          <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.08)" }}>
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${ocupacaoPct}%`,
                background: ocupacaoPct >= 100 ? "#ef4444" : ocupacaoPct >= 50 ? "#f59e0b" : meta.bar,
              }}
            />
          </div>
        </div>

        {/* Ação */}
        {reservado ? (
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-semibold"
              style={{ background: "rgba(16,185,129,0.15)", color: "#6ee7b7", border: "1px solid rgba(16,185,129,0.3)" }}>
              <FiCheckCircle />Reservado!
            </div>
            {carona.motorista_telefone && (
              <motion.a
                href={buildWhatsAppUrl(carona.motorista_telefone, carona)}
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-semibold transition-all"
                style={{ background: "rgba(37,211,102,0.12)", color: "#4ade80", border: "1px solid rgba(37,211,102,0.3)" }}
              >
                <FaWhatsapp className="text-base" />
                Entrar em contato
              </motion.a>
            )}
          </div>
        ) : (
          <button
            disabled={!disponivel || esteReservando}
            onClick={() => disponivel && onReservar(carona.id)}
            className={btnClass}
            style={btnStyle}
          >
            {esteReservando && (
              <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            )}
            {esteReservando ? "Reservando..." : disponivel ? "Reservar vaga" : "Sem vagas"}
          </button>
        )}
      </div>
    </motion.div>
  );
}

function EmptyState({ filtroIES, onClearFilter }) {
  const meta = filtroIES ? getMeta(filtroIES) : DEFAULT_META;
  return (
    <div className="col-span-2 flex flex-col items-center justify-center py-20 text-center">
      <div className="w-24 h-24 rounded-3xl flex items-center justify-center mb-5"
        style={{ background: meta.bg, border: `1px solid ${meta.border}` }}>
        <MdOutlineDirectionsCar className="text-5xl" style={{ color: meta.color }} />
      </div>
      <h3 className="text-lg font-bold text-white mb-2">
        {filtroIES ? `Nenhuma carona para ${filtroIES}` : "Nenhuma carona disponível"}
      </h3>
      <p className="text-white/40 text-sm max-w-xs mb-5">
        {filtroIES
          ? "Nenhuma carona disponível para este destino no momento."
          : "As caronas aparecerão aqui assim que forem cadastradas."}
      </p>
      {filtroIES && (
        <button
          onClick={onClearFilter}
          className="text-sm font-semibold px-4 py-2 rounded-xl transition"
          style={{ background: meta.bg, color: meta.color, border: `1px solid ${meta.border}` }}
        >
          Ver todas as instituições
        </button>
      )}
    </div>
  );
}

/* ── Ilustração do carro com badges ── */
function CarIllustration() {
  const BADGES = [
    { nome: "UFT",      grad: "linear-gradient(135deg,#059669,#10b981)", glow: "#10b981", pos: { top: "-18px",   right: "60px"  }, delay: 0   },
    { nome: "CEULP",    grad: "linear-gradient(135deg,#4f46e5,#818cf8)", glow: "#818cf8", pos: { top: "20px",    left: "-10px"  }, delay: 0.4 },
    { nome: "IFTO",     grad: "linear-gradient(135deg,#ea580c,#f97316)", glow: "#f97316", pos: { bottom: "30px", left: "10px"   }, delay: 0.8 },
    { nome: "Afya",     grad: "linear-gradient(135deg,#0891b2,#06b6d4)", glow: "#06b6d4", pos: { bottom: "16px", right: "0px"   }, delay: 0.2 },
  ];

  return (
    <div className="relative flex items-center justify-center py-6">
      {BADGES.map((b) => (
        <motion.div key={b.nome} className="absolute z-10"
          style={b.pos}
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut", delay: b.delay }}>
          <span className="px-3 py-1.5 rounded-full text-xs font-bold text-white shadow-lg block"
            style={{ background: b.grad, boxShadow: `0 4px 18px ${b.glow}55` }}>
            {b.nome}
          </span>
        </motion.div>
      ))}

      <motion.div animate={{ y: [0, -10, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}>
        <svg viewBox="0 0 520 210" className="w-full max-w-[480px] drop-shadow-2xl" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="cb" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#4f46e5"/>
              <stop offset="60%" stopColor="#3b82f6"/>
              <stop offset="100%" stopColor="#2563eb"/>
            </linearGradient>
            <linearGradient id="cg" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#bfdbfe" stopOpacity="0.75"/>
              <stop offset="100%" stopColor="#93c5fd" stopOpacity="0.4"/>
            </linearGradient>
            <linearGradient id="hlg" x1="0%" y1="100%" x2="0%" y2="0%">
              <stop offset="0%" stopColor="rgba(255,255,255,0)" />
              <stop offset="100%" stopColor="rgba(255,255,255,0.12)" />
            </linearGradient>
          </defs>

          {/* Ground glow */}
          <ellipse cx="260" cy="200" rx="210" ry="12" fill="rgba(99,102,241,0.18)"/>

          {/* Main body */}
          <path d="M 52,152 C 42,152 35,146 35,137 L 35,118 L 78,110 L 126,66 C 129,62 134,60 139,60 L 347,60 C 352,60 357,62 360,66 L 408,110 L 464,110 C 471,110 476,115 476,122 L 476,137 C 476,146 469,152 459,152 Z"
            fill="url(#cb)"/>

          {/* Body top-shine */}
          <path d="M 52,152 C 42,152 35,146 35,137 L 35,118 L 78,110 L 126,66 C 129,62 134,60 139,60 L 347,60 C 352,60 357,62 360,66 L 408,110 L 464,110 C 471,110 476,115 476,122 L 476,137 C 476,146 469,152 459,152 Z"
            fill="url(#hlg)"/>

          {/* Roof shadow fill */}
          <path d="M 126,110 L 151,72 C 153,68 157,66 161,66 L 347,66 C 351,66 355,68 357,72 L 384,110 Z"
            fill="rgba(0,0,0,0.2)"/>

          {/* Rear window */}
          <path d="M 130,108 L 154,74 C 156,71 159,70 162,70 L 244,70 L 244,108 Z"
            fill="url(#cg)"/>

          {/* B-pillar */}
          <rect x="247" y="62" width="5" height="46" fill="rgba(255,255,255,0.22)" rx="2.5"/>

          {/* Front window */}
          <path d="M 252,70 L 252,108 L 380,108 L 356,73 C 354,70 351,70 348,70 Z"
            fill="url(#cg)"/>

          {/* Headlight */}
          <path d="M 457,113 L 476,113 L 476,130 L 454,130 Z" fill="#fef9c3" opacity="0.97"/>
          <ellipse cx="488" cy="121" rx="20" ry="10" fill="#fef9c3" opacity="0.22"/>

          {/* Taillight */}
          <rect x="35" y="113" width="10" height="17" rx="3" fill="#fca5a5" opacity="0.95"/>

          {/* Wheel arches */}
          <path d="M 352,110 Q 392,110 432,110 Q 432,154 392,154 Q 352,154 352,110 Z" fill="#0c1220"/>
          <path d="M 82,110 Q 122,110 162,110 Q 162,154 122,154 Q 82,154 82,110 Z" fill="#0c1220"/>

          {/* Hood / body lines */}
          <path d="M 408,110 L 462,110" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5"/>
          <path d="M 90,134 L 458,134" stroke="rgba(255,255,255,0.06)" strokeWidth="1"/>
          <line x1="210" y1="110" x2="210" y2="152" stroke="rgba(255,255,255,0.08)" strokeWidth="1.5"/>
          <line x1="344" y1="110" x2="344" y2="152" stroke="rgba(255,255,255,0.08)" strokeWidth="1.5"/>

          {/* Door handles */}
          <rect x="232" y="124" width="28" height="5" rx="2.5" fill="rgba(255,255,255,0.25)"/>
          <rect x="354" y="124" width="28" height="5" rx="2.5" fill="rgba(255,255,255,0.25)"/>

          {/* Roof highlight */}
          <path d="M 153,68 Q 250,63 347,68" stroke="rgba(255,255,255,0.18)" strokeWidth="1.5" fill="none"/>

          {/* FRONT WHEEL */}
          <circle cx="392" cy="164" r="36" fill="#07101e"/>
          <circle cx="392" cy="164" r="23" fill="#111827" stroke="#4338ca" strokeWidth="4"/>
          <g stroke="#6366f1" strokeWidth="2.5" opacity="0.75">
            <line x1="392" y1="143" x2="392" y2="153"/>
            <line x1="392" y1="175" x2="392" y2="185"/>
            <line x1="371" y1="164" x2="381" y2="164"/>
            <line x1="403" y1="164" x2="413" y2="164"/>
            <line x1="377" y1="149" x2="384" y2="156"/>
            <line x1="400" y1="172" x2="407" y2="179"/>
            <line x1="377" y1="179" x2="384" y2="172"/>
            <line x1="400" y1="156" x2="407" y2="149"/>
          </g>
          <circle cx="392" cy="164" r="8" fill="#4338ca"/>
          <circle cx="392" cy="164" r="3.5" fill="#818cf8"/>

          {/* REAR WHEEL */}
          <circle cx="122" cy="164" r="36" fill="#07101e"/>
          <circle cx="122" cy="164" r="23" fill="#111827" stroke="#4338ca" strokeWidth="4"/>
          <g stroke="#6366f1" strokeWidth="2.5" opacity="0.75">
            <line x1="122" y1="143" x2="122" y2="153"/>
            <line x1="122" y1="175" x2="122" y2="185"/>
            <line x1="101" y1="164" x2="111" y2="164"/>
            <line x1="133" y1="164" x2="143" y2="164"/>
            <line x1="107" y1="149" x2="114" y2="156"/>
            <line x1="130" y1="172" x2="137" y2="179"/>
            <line x1="107" y1="179" x2="114" y2="172"/>
            <line x1="130" y1="156" x2="137" y2="149"/>
          </g>
          <circle cx="122" cy="164" r="8" fill="#4338ca"/>
          <circle cx="122" cy="164" r="3.5" fill="#818cf8"/>

          {/* Wheel glows */}
          <ellipse cx="392" cy="196" rx="32" ry="7" fill="rgba(99,102,241,0.22)"/>
          <ellipse cx="122" cy="196" rx="32" ry="7" fill="rgba(99,102,241,0.22)"/>

          {/* Driver silhouette */}
          <circle cx="316" cy="77" r="11" fill="rgba(255,255,255,0.32)"/>
          <path d="M 303,87 Q 316,95 329,87 L 326,108 L 306,108 Z" fill="rgba(255,255,255,0.18)"/>

          {/* Passenger silhouette */}
          <circle cx="194" cy="78" r="10" fill="rgba(255,255,255,0.24)"/>
          <path d="M 182,87 Q 194,94 206,87 L 203,108 L 185,108 Z" fill="rgba(255,255,255,0.13)"/>
        </svg>
      </motion.div>

      {/* Wheel glow divs */}
      <div className="absolute" style={{ bottom: "22%", right: "17%", width: 70, height: 14, background: "rgba(99,102,241,0.35)", borderRadius: "50%", filter: "blur(10px)", pointerEvents: "none" }}/>
      <div className="absolute" style={{ bottom: "22%", left: "19%", width: 70, height: 14, background: "rgba(99,102,241,0.35)", borderRadius: "50%", filter: "blur(10px)", pointerEvents: "none" }}/>
    </div>
  );
}

/* ── Como funciona ── */
function ComoFunciona() {
  const passos = [
    {
      num: "01", icon: <FiSearch size={22} />, cor: "#6366f1",
      titulo: "Escolha o destino",
      desc: "Filtre por universidade e veja as caronas disponíveis em tempo real.",
    },
    {
      num: "02", icon: <MdOutlineDirectionsCar size={22} />, cor: "#3b82f6",
      titulo: "Reserve sua vaga",
      desc: "Um clique e sua vaga está garantida. Entre em contato direto pelo WhatsApp.",
    },
    {
      num: "03", icon: <FiSmile size={22} />, cor: "#10b981",
      titulo: "Chegue na faculdade",
      desc: "Economize, faça amizades e chegue na aula no horário. 100% gratuito.",
    },
  ];

  return (
    <div className="relative z-10 max-w-5xl mx-auto px-4 pt-8 pb-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="text-center mb-10"
      >
        <p className="text-xs font-bold tracking-[0.2em] uppercase mb-2"
          style={{ color: "rgba(165,180,252,0.7)" }}>Como funciona</p>
        <h2 className="text-3xl font-extrabold text-white">Simples assim</h2>
      </motion.div>

      <div className="grid md:grid-cols-3 gap-5">
        {passos.map((p, i) => (
          <motion.div key={i}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45, delay: i * 0.12 }}
            className="relative rounded-2xl p-6"
            style={GLASS}>
            <span className="absolute -top-3 left-5 text-[10px] font-black px-2.5 py-1 rounded-full text-white"
              style={{ background: p.cor }}>{p.num}</span>
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4"
              style={{ background: `${p.cor}22`, color: p.cor, border: `1px solid ${p.cor}44` }}>
              {p.icon}
            </div>
            <h3 className="font-bold text-white mb-1.5">{p.titulo}</h3>
            <p className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.42)" }}>{p.desc}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

/* ── Dashboard do motorista ── */
function MotoristaView({ navigate }) {
  const [stats, setStats] = useState({ total: 0, vagasLivres: 0, carregando: true });

  useEffect(() => {
    api.get("/caronas/minhas")
      .then(({ data }) => {
        setStats({
          total: data.length,
          vagasLivres: data.reduce((acc, c) => acc + (c.vagas_disponiveis ?? 0), 0),
          carregando: false,
        });
      })
      .catch(() => setStats((s) => ({ ...s, carregando: false })));
  }, []);

  return (
    <div className="max-w-2xl mx-auto px-4 py-10 relative z-10">

      {/* Stats */}
      {stats.carregando && (
        <div className="grid grid-cols-2 gap-3 mb-8">
          {[0, 1].map((i) => (
            <div key={i} className="rounded-2xl p-6 animate-pulse" style={GLASS}>
              <div className="h-8 rounded w-16 mx-auto mb-2" style={{ background: "rgba(255,255,255,0.1)" }} />
              <div className="h-3 rounded w-28 mx-auto" style={{ background: "rgba(255,255,255,0.06)" }} />
            </div>
          ))}
        </div>
      )}
      {!stats.carregando && (
        <div className="grid grid-cols-2 gap-3 mb-8">
          {[
            { val: stats.total, label: "Caronas publicadas" },
            { val: stats.vagasLivres, label: "Vagas disponíveis" },
          ].map(({ val, label }, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="rounded-2xl p-5 text-center"
              style={GLASS}
            >
              <p className="text-3xl font-extrabold text-white">{val}</p>
              <p className="text-xs text-white/40 mt-1 uppercase tracking-wide font-medium">{label}</p>
            </motion.div>
          ))}
        </div>
      )}

      {/* CTA */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4"
          style={{ background: "rgba(99,102,241,0.2)", border: "1px solid rgba(99,102,241,0.3)" }}>
          <MdOutlineDirectionsCar className="text-indigo-400 text-3xl" />
        </div>
        <h2 className="text-2xl font-extrabold text-white mb-2">O que você quer fazer hoje?</h2>
        <p className="text-white/40 text-sm max-w-xs mx-auto">
          Publique novas caronas ou gerencie as que você já criou.
        </p>
      </div>

      {/* Action cards */}
      <div className="grid gap-4 sm:grid-cols-2">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate("/oferecer")}
          className="group flex flex-col items-start gap-4 rounded-2xl p-6 text-left transition-colors duration-200"
          style={GLASS}
        >
          <div className="w-12 h-12 rounded-xl flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, #3b82f6, #6366f1)", boxShadow: "0 4px 16px rgba(99,102,241,0.4)" }}>
            <FiPlus className="text-white text-xl" />
          </div>
          <div>
            <p className="font-bold text-white text-base mb-1 group-hover:text-indigo-300 transition-colors">
              Oferecer carona
            </p>
            <p className="text-sm text-white/40 leading-relaxed">
              Publique uma nova carona e permita que passageiros reservem vagas.
            </p>
          </div>
          <span className="mt-auto text-xs font-semibold text-indigo-400 group-hover:text-indigo-300 transition-colors">
            Publicar agora →
          </span>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate("/minhas-caronas")}
          className="group flex flex-col items-start gap-4 rounded-2xl p-6 text-left transition-colors duration-200"
          style={GLASS}
        >
          <div className="w-12 h-12 rounded-xl flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, #06b6d4, #3b82f6)", boxShadow: "0 4px 16px rgba(6,182,212,0.4)" }}>
            <FiList className="text-white text-xl" />
          </div>
          <div>
            <p className="font-bold text-white text-base mb-1 group-hover:text-cyan-300 transition-colors">
              Minhas caronas
            </p>
            <p className="text-sm text-white/40 leading-relaxed">
              Veja e gerencie todas as caronas que você já publicou.
            </p>
          </div>
          <span className="mt-auto text-xs font-semibold text-cyan-400 group-hover:text-cyan-300 transition-colors">
            Ver caronas →
          </span>
        </motion.button>
      </div>
    </div>
  );
}

/* ── Ilustração de identidade visual ── */
function HeroIllustration() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="relative w-full max-w-xs mx-auto h-16 mt-6 mb-1"
      aria-hidden="true"
    >
      {/* Linha de rota */}
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 280 64" fill="none">
        <defs>
          <linearGradient id="routeGrad" x1="0" y1="0" x2="280" y2="0">
            <stop offset="0%" stopColor="transparent" />
            <stop offset="20%" stopColor="#6366f1" />
            <stop offset="80%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="transparent" />
          </linearGradient>
        </defs>
        <path d="M24 32 L256 32" stroke="url(#routeGrad)" strokeWidth="1.5" strokeDasharray="5 5" opacity="0.35" />
        <circle cx="24" cy="32" r="5" fill="#6366f1" opacity="0.7" />
        <circle cx="256" cy="32" r="5" fill="#10b981" opacity="0.7" />
        <circle cx="256" cy="32" r="9" fill="#10b981" opacity="0.15" />
        <circle cx="24" cy="32" r="9" fill="#6366f1" opacity="0.15" />
      </svg>

      {/* Carro animado */}
      <motion.div
        className="absolute top-1/2 -translate-y-1/2"
        animate={{ left: ["8%", "80%", "8%"] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", repeatDelay: 0.5 }}
        style={{ left: "8%" }}
      >
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center"
          style={{
            background: "linear-gradient(135deg,#6366f1,#3b82f6)",
            boxShadow: "0 4px 16px rgba(99,102,241,0.55)",
          }}
        >
          <MdOutlineDirectionsCar className="text-white text-lg" />
        </div>
      </motion.div>

      {/* Labels */}
      <span className="absolute left-0 -bottom-1 text-[10px] font-semibold tracking-wide" style={{ color: "rgba(99,102,241,0.6)" }}>
        Origem
      </span>
      <span className="absolute right-0 -bottom-1 text-[10px] font-semibold tracking-wide" style={{ color: "rgba(16,185,129,0.6)" }}>
        Destino
      </span>
    </motion.div>
  );
}

/* ── Página principal ── */

export default function Home() {
  usePageTitle("Home");

  const { usuario } = useContext(AuthContext);
  const navigate = useNavigate();
  const isMotorista = usuario?.tipo === "motorista";

  const [caronas, setCaronas] = useState([]);
  const [filtroIES, setFiltroIES] = useState(
    () => localStorage.getItem("unicaronas_filtro_padrao") || ""
  );
  const [erro, setErro] = useState(false);
  const [carregando, setCarregando] = useState(!isMotorista);
  const [reservando, setReservando] = useState(null);
  const [reservados, setReservados] = useState(new Set());
  const [userPos, setUserPos] = useState(null);
  const [buscandoGps, setBuscandoGps] = useState(false);
  const [ordenarDistancia, setOrdenarDistancia] = useState(false);
  const ridesRef = useRef(null);

  const { pulling, progress } = usePullToRefresh(buscarCaronas);

  async function buscarCaronas() {
    try {
      setCarregando(true);
      setErro(false);
      const { data } = await api.get("/caronas");
      setCaronas(data);
    } catch {
      setErro(true);
      toast.error("Não foi possível carregar as caronas. Tente novamente.");
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    if (!isMotorista) buscarCaronas();
  }, [isMotorista]);

  async function handleReservar(id) {
    if (!usuario) { navigate("/login"); return; }
    try {
      setReservando(id);
      await api.post(`/caronas/${id}/reservar`);
      setReservados((prev) => new Set(prev).add(id));
      setCaronas((prev) =>
        prev.map((c) => c.id === id ? { ...c, vagas_disponiveis: c.vagas_disponiveis - 1 } : c)
      );
      toast.success("Vaga reservada com sucesso!");
    } catch (err) {
      toast.error(err.response?.data?.mensagem || "Não foi possível reservar. Tente novamente.");
    } finally {
      setReservando(null);
    }
  }

  function buscarGeolocalizacao() {
    if (!navigator.geolocation) {
      toast.error("Seu navegador não suporta geolocalização.");
      return;
    }
    setBuscandoGps(true);
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setUserPos({ lat: coords.latitude, lng: coords.longitude });
        setOrdenarDistancia(true);
        setBuscandoGps(false);
        toast.success("Mostrando caronas mais próximas de você!");
      },
      () => {
        setBuscandoGps(false);
        toast.error("Não foi possível obter sua localização.");
      },
      { timeout: 8000 }
    );
  }

  function limparGeolocalizacao() {
    setUserPos(null);
    setOrdenarDistancia(false);
  }

  function getDistancia(carona) {
    if (!userPos || carona.lat == null || carona.lng == null) return null;
    return distanciaKm(userPos.lat, userPos.lng, carona.lat, carona.lng);
  }

  let caronasFiltradas = filtroIES ? caronas.filter((c) => c.destino === filtroIES) : caronas;
  if (ordenarDistancia && userPos) {
    caronasFiltradas = [...caronasFiltradas].sort((a, b) => {
      const dA = getDistancia(a) ?? Infinity;
      const dB = getDistancia(b) ?? Infinity;
      return dA - dB;
    });
  }
  const totalVagas = caronas.reduce((acc, c) => acc + c.vagas_disponiveis, 0);

  return (
    <div className="min-h-screen relative overflow-x-hidden"
      style={{ background: "linear-gradient(135deg, #020817 0%, #0f172a 40%, #1e1b4b 100%)" }}>

      {/* Pull-to-refresh indicator */}
      {pulling && (
        <div className="fixed top-20 left-1/2 z-50 flex items-center justify-center -translate-x-1/2 pointer-events-none">
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-10 h-10 rounded-full flex items-center justify-center shadow-xl"
            style={{ background: "rgba(99,102,241,0.92)", backdropFilter: "blur(12px)" }}
          >
            <FiRefreshCw
              className="text-white"
              style={{ transform: `rotate(${Math.round(progress * 360)}deg)`, transition: "transform 0.05s linear" }}
            />
          </motion.div>
        </div>
      )}

      {/* Blobs animados de fundo */}
      <Blob
        className="w-[700px] h-[700px] -top-64 -left-48 opacity-20"
        style={{ background: "radial-gradient(circle, #6366f1, transparent 70%)" }}
        animate={{ x: [0, 60, 0], y: [0, 50, 0], scale: [1, 1.1, 1] }}
      />
      <Blob
        className="w-[500px] h-[500px] -bottom-48 -right-32 opacity-15"
        style={{ background: "radial-gradient(circle, #3b82f6, transparent 70%)" }}
        animate={{ x: [0, -50, 0], y: [0, -40, 0], scale: [1, 1.15, 1] }}
      />
      <Blob
        className="w-96 h-96 opacity-10"
        style={{ background: "radial-gradient(circle, #06b6d4, transparent 70%)", top: "40%", right: "5%" }}
        animate={{ x: [0, -30, 10, 0], y: [0, 40, -20, 0] }}
      />
      <Blob
        className="w-72 h-72 opacity-10"
        style={{ background: "radial-gradient(circle, #818cf8, transparent 70%)", top: "60%", left: "20%" }}
        animate={{ x: [0, 30, -10, 0], y: [0, -30, 15, 0] }}
      />

      {/* ── Hero ── */}
      <div className="relative z-10 max-w-6xl mx-auto px-4 pt-10 pb-4">
        {isMotorista ? (
          /* Hero compacto para motorista */
          <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}
            className="text-center pt-6 pb-2">
            <h1 className="text-4xl font-extrabold text-white mb-2">
              Olá, {usuario.nome.split(" ")[0]}!
            </h1>
            <p className="text-white/40">Gerencie suas caronas e conecte-se com passageiros.</p>
          </motion.div>
        ) : (
          /* Hero split: texto + carro */
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center min-h-[420px] lg:min-h-[500px]">

            {/* Lado esquerdo — texto */}
            <motion.div
              initial={{ opacity: 0, x: -24 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="flex flex-col items-start"
            >
              <div className="inline-flex items-center gap-2 text-indigo-300 text-xs font-semibold px-4 py-1.5 rounded-full mb-6"
                style={{ background: "rgba(99,102,241,0.15)", border: "1px solid rgba(99,102,241,0.3)" }}>
                <MdOutlineDirectionsCar />
                Caronas universitárias · Palmas, TO
              </div>

              {usuario ? (
                <h1 className="text-5xl md:text-6xl font-extrabold text-white mb-4 leading-[1.05] tracking-tight">
                  Olá,<br/>{usuario.nome.split(" ")[0]}!
                </h1>
              ) : (
                <h1 className="text-5xl md:text-6xl font-extrabold text-white mb-4 leading-[1.05] tracking-tight">
                  Sua carona<br/>para a{" "}
                  <span style={{
                    background: "linear-gradient(135deg, #818cf8 0%, #60a5fa 50%, #34d399 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}>
                    faculdade
                  </span>
                </h1>
              )}

              <p className="text-white/50 text-lg max-w-md mb-8 leading-relaxed">
                {usuario
                  ? "Veja as caronas disponíveis agora ou use os filtros abaixo para encontrar a sua."
                  : "Conecte-se com estudantes da sua universidade. Rápido, seguro e completamente gratuito."}
              </p>

              {/* CTAs */}
              <div className="flex flex-wrap gap-3 mb-10">
                <motion.button
                  whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                  onClick={() => ridesRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })}
                  className="flex items-center gap-2 px-6 py-3.5 rounded-2xl text-sm font-bold text-white"
                  style={{ background: "linear-gradient(135deg,#6366f1,#3b82f6)", boxShadow: "0 4px 24px rgba(99,102,241,0.55)" }}>
                  <FiSearch size={15} />
                  Buscar carona
                </motion.button>
                {!usuario && (
                  <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                    <Link to="/cadastro"
                      className="flex items-center gap-2 px-6 py-3.5 rounded-2xl text-sm font-bold"
                      style={{ color: "rgba(255,255,255,0.75)", background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)" }}>
                      Criar conta grátis <FiArrowRight size={14} />
                    </Link>
                  </motion.div>
                )}
              </div>

              {/* Stats inline */}
              {!carregando && !erro && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }}
                  className="flex items-center gap-6">
                  {[
                    { val: caronas.length,    label: "caronas ativas" },
                    { val: totalVagas,        label: "vagas livres"   },
                    { val: new Set(caronas.map(c => c.destino)).size, label: "destinos" },
                  ].map(({ val, label }, i) => (
                    <div key={i} className="text-center">
                      <p className="text-3xl font-extrabold text-white leading-none">{val}</p>
                      <p className="text-xs mt-1 font-medium" style={{ color: "rgba(255,255,255,0.35)" }}>{label}</p>
                    </div>
                  ))}
                </motion.div>
              )}
            </motion.div>

            {/* Lado direito — carro */}
            <motion.div
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="hidden lg:block"
            >
              <CarIllustration />
            </motion.div>
          </div>
        )}
      </div>

      {/* ── Vista do motorista ── */}
      {isMotorista && <MotoristaView navigate={navigate} />}

      {/* ── Vista do passageiro (filtro + feed) ── */}
      {!isMotorista && (
        <div className="relative z-10" ref={ridesRef}>

          {/* Barra de filtro por faculdade */}
          <div>
            <div className="max-w-5xl mx-auto px-4 py-3">
              <div className="flex gap-2 overflow-x-auto no-scrollbar">
                <button
                  onClick={() => setFiltroIES("")}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap shrink-0 transition-all"
                  style={
                    filtroIES === ""
                      ? { background: "rgba(255,255,255,0.15)", color: "#fff", border: "1px solid rgba(255,255,255,0.2)" }
                      : { background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.45)", border: "1px solid rgba(255,255,255,0.08)" }
                  }
                >
                  Todas
                </button>

                {/* Botão de geolocalização */}
                <button
                  onClick={ordenarDistancia ? limparGeolocalizacao : buscarGeolocalizacao}
                  disabled={buscandoGps}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap shrink-0 transition-all disabled:opacity-60"
                  style={
                    ordenarDistancia
                      ? { background: "linear-gradient(135deg,#6366f1,#3b82f6)", color: "#fff", border: "1px solid transparent" }
                      : { background: "rgba(99,102,241,0.1)", color: "#a5b4fc", border: "1px solid rgba(99,102,241,0.25)" }
                  }
                >
                  {buscandoGps
                    ? <svg className="animate-spin h-3 w-3" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                    : <FiNavigation size={12} />}
                  {buscandoGps ? "Localizando..." : ordenarDistancia ? "Próximas a mim ✓" : "Perto de mim"}
                </button>

                {DESTINOS.map((uni) => {
                  const meta = getMeta(uni);
                  const ativo = filtroIES === uni;
                  return (
                    <button
                      key={uni}
                      onClick={() => setFiltroIES(uni)}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap shrink-0 transition-all"
                      style={
                        ativo
                          ? { background: meta.bar, color: "#fff", border: "1px solid transparent" }
                          : { background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.45)", border: "1px solid rgba(255,255,255,0.08)" }
                      }
                    >
                      <span
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{ background: ativo ? "rgba(255,255,255,0.8)" : meta.dot }}
                      />
                      {uni}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Conteúdo */}
          <div className="max-w-5xl mx-auto px-4 py-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <h2 className="text-lg font-bold text-white">Caronas disponíveis</h2>
                {!carregando && (
                  <motion.button
                    onClick={buscarCaronas}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9, rotate: 180 }}
                    title="Atualizar caronas"
                    className="w-7 h-7 rounded-full flex items-center justify-center transition-colors duration-200"
                    style={{
                      background: "rgba(255,255,255,0.06)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      color: "rgba(255,255,255,0.35)",
                    }}
                    onMouseEnter={e => { e.currentTarget.style.color = "#818cf8"; e.currentTarget.style.background = "rgba(99,102,241,0.15)"; e.currentTarget.style.borderColor = "rgba(99,102,241,0.3)"; }}
                    onMouseLeave={e => { e.currentTarget.style.color = "rgba(255,255,255,0.35)"; e.currentTarget.style.background = "rgba(255,255,255,0.06)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; }}
                  >
                    <FiRefreshCw size={13} />
                  </motion.button>
                )}
              </div>
              {!carregando && (
                <p className="text-sm text-white/40">
                  {filtroIES ? `Destino: ${filtroIES}` : "Todas as instituições"}
                  {" · "}
                  <span className="font-medium text-white/60">
                    {caronasFiltradas.length} resultado{caronasFiltradas.length !== 1 ? "s" : ""}
                  </span>
                </p>
              )}
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {carregando
                ? Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
                : erro
                ? (
                  <div className="col-span-2 flex flex-col items-center justify-center py-16 text-center">
                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
                      style={{ background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.3)" }}>
                      <FiAlertCircle className="text-red-400 text-3xl" />
                    </div>
                    <p className="text-white font-semibold mb-1">Falha ao carregar</p>
                    <p className="text-white/40 text-sm mb-4">Verifique sua conexão e tente novamente.</p>
                    <button
                      onClick={buscarCaronas}
                      className="flex items-center gap-2 text-sm font-semibold text-indigo-400 hover:text-indigo-300 transition"
                    >
                      <FiRefreshCw /> Tentar novamente
                    </button>
                  </div>
                )
                : caronasFiltradas.length === 0
                ? <EmptyState filtroIES={filtroIES} onClearFilter={() => setFiltroIES("")} />
                : caronasFiltradas.map((carona) => (
                    <CardCarona
                      key={carona.id}
                      carona={carona}
                      onReservar={handleReservar}
                      reservando={reservando}
                      reservado={reservados.has(carona.id)}
                      distancia={getDistancia(carona)}
                    />
                  ))}
            </div>
          </div>

          {/* Seção "Como funciona" */}
          <ComoFunciona />
        </div>
      )}
    </div>
  );
}
