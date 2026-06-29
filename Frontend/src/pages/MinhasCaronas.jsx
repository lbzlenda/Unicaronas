import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import api from "../api/axiosConfig.js";
import { AuthContext } from "../contexts/AuthContext.jsx";
import { formatarMoeda } from "../utils/formatar.js";
import usePageTitle from "../hooks/usePageTitle.js";
import {
  FiClock,
  FiDollarSign,
  FiUsers,
  FiTrash2,
  FiArrowRight,
  FiPlus,
  FiCalendar,
  FiAlertTriangle,
  FiX,
  FiCheck,
  FiXCircle,
  FiRefreshCw,
  FiNavigation,
  FiCheckSquare,
} from "react-icons/fi";
import { MdOutlineDirectionsCar } from "react-icons/md";
import { FaWhatsapp, FaStar } from "react-icons/fa";

function formatarData(data) {
  if (!data) return null;
  const hoje = new Date().toISOString().split("T")[0];
  const amanha = new Date(Date.now() + 86400000).toISOString().split("T")[0];
  if (data === hoje) return "Hoje";
  if (data === amanha) return "Amanhã";
  const [, mes, dia] = data.split("-");
  return `${dia}/${mes}`;
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

function SkeletonCard() {
  return (
    <div className="rounded-2xl p-5 animate-pulse" style={GLASS}>
      <div className="h-4 rounded w-3/4 mb-3" style={{ background: "rgba(255,255,255,0.08)" }} />
      <div className="h-3 rounded w-1/2 mb-2" style={{ background: "rgba(255,255,255,0.08)" }} />
      <div className="h-3 rounded w-2/5 mb-2" style={{ background: "rgba(255,255,255,0.08)" }} />
      <div className="h-3 rounded w-1/3 mb-4" style={{ background: "rgba(255,255,255,0.08)" }} />
      <div className="h-9 rounded-xl w-28" style={{ background: "rgba(255,255,255,0.08)" }} />
    </div>
  );
}

function EmptyState({ tipo, onAction }) {
  return (
    <div className="col-span-2 flex flex-col items-center justify-center py-20 text-center">
      <div className="w-20 h-20 rounded-full flex items-center justify-center mb-4"
        style={{ background: "rgba(99,102,241,0.15)", border: "1px solid rgba(99,102,241,0.3)" }}>
        <MdOutlineDirectionsCar className="text-indigo-400 text-4xl" />
      </div>
      <h3 className="text-lg font-semibold text-white mb-1">
        {tipo === "motorista" ? "Nenhuma carona oferecida" : "Nenhuma reserva encontrada"}
      </h3>
      <p className="text-white/40 text-sm max-w-xs mb-4">
        {tipo === "motorista"
          ? "Você ainda não ofereceu nenhuma carona. Que tal começar agora?"
          : "Você ainda não reservou nenhuma carona. Explore as disponíveis na Home."}
      </p>
      <button
        onClick={onAction}
        className="flex items-center gap-2 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-all active:scale-[0.98]"
        style={{ background: "linear-gradient(135deg,#6366f1,#3b82f6)", boxShadow: "0 4px 16px rgba(99,102,241,0.4)" }}
      >
        <FiPlus />
        {tipo === "motorista" ? "Oferecer carona" : "Ver caronas disponíveis"}
      </button>
    </div>
  );
}

/* Estrelas de avaliação */
function StarRating({ value, onChange, readonly = false }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          disabled={readonly}
          onClick={() => !readonly && onChange && onChange(n)}
          onMouseEnter={() => !readonly && setHover(n)}
          onMouseLeave={() => !readonly && setHover(0)}
          className="transition-transform disabled:cursor-default"
          style={{ transform: !readonly && (hover >= n || value >= n) ? "scale(1.15)" : "scale(1)" }}
        >
          <FaStar
            className="text-lg"
            style={{
              color: (hover || value) >= n ? "#f59e0b" : "rgba(255,255,255,0.2)",
              filter: (hover || value) >= n ? "drop-shadow(0 0 4px #f59e0b88)" : "none",
              transition: "color 0.15s, filter 0.15s",
            }}
          />
        </button>
      ))}
    </div>
  );
}

const STATUS_META = {
  ativa:        { label: "Ativa",        cor: "#6ee7b7", bg: "rgba(16,185,129,0.15)",  border: "rgba(16,185,129,0.3)"  },
  em_andamento: { label: "Em andamento", cor: "#fcd34d", bg: "rgba(245,158,11,0.15)", border: "rgba(245,158,11,0.3)" },
  concluida:    { label: "Concluída",    cor: "#a5b4fc", bg: "rgba(99,102,241,0.15)",  border: "rgba(99,102,241,0.3)"  },
};

function CardCaronaMotorista({ carona, onExcluir, excluindo, onRepublicar, onStatus, atualizandoStatus }) {
  const [confirmando, setConfirmando] = useState(false);
  const lotado = carona.vagas_disponiveis === 0;
  const status = carona.status || "ativa";
  const statusMeta = STATUS_META[status] ?? STATUS_META.ativa;
  const ocupacaoPct = carona.vagas > 0
    ? Math.round(((carona.vagas - carona.vagas_disponiveis) / carona.vagas) * 100)
    : 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.01 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      className="rounded-2xl overflow-hidden flex flex-col"
      style={GLASS}
    >
      <div className="h-1.5 w-full" style={{
        background: lotado ? "rgba(255,255,255,0.1)" : "linear-gradient(90deg,#3b82f6,#6366f1)"
      }} />
      <div className="p-5 flex flex-col flex-1">
        <div className="flex items-start justify-between gap-2 mb-3">
          <p className="font-bold text-white text-base leading-snug flex items-center gap-1.5 flex-wrap">
            <span>{carona.origem}</span>
            <FiArrowRight className="text-indigo-400 shrink-0" />
            <span>{carona.destino}</span>
          </p>
          <div className="flex flex-col items-end gap-1 shrink-0">
            <span
              className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full"
              style={{ background: statusMeta.bg, color: statusMeta.cor, border: `1px solid ${statusMeta.border}` }}
            >
              <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ background: statusMeta.cor }} />
              {statusMeta.label}
            </span>
            <span
              className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full"
              style={
                lotado
                  ? { background: "rgba(239,68,68,0.18)", color: "#fca5a5", border: "1px solid rgba(239,68,68,0.3)" }
                  : { background: "rgba(16,185,129,0.18)", color: "#6ee7b7", border: "1px solid rgba(16,185,129,0.3)" }
              }
            >
              <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ background: lotado ? "#f87171" : "#34d399" }} />
              {lotado ? "Lotado" : "Com vagas"}
            </span>
          </div>
        </div>

        <div className="space-y-1.5 text-sm mb-3 flex-1" style={{ color: "rgba(255,255,255,0.5)" }}>
          {carona.data_saida && (
            <div className="flex items-center gap-2">
              <FiCalendar className="text-indigo-400 shrink-0" />
              <span><strong className="text-white">{formatarData(carona.data_saida)}</strong></span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <FiClock className="text-indigo-400 shrink-0" />
            <span>Saída às <strong className="text-white">{carona.horario_saida}</strong></span>
          </div>
          <div className="flex items-center gap-2">
            <FiDollarSign className="text-indigo-400 shrink-0" />
            <span><strong className="text-white">{formatarMoeda(carona.valor)}</strong> por vaga</span>
          </div>
          <div className="flex items-center gap-2">
            <FiUsers className="text-indigo-400 shrink-0" />
            <span>
              <strong className="text-white">{carona.vagas_disponiveis}</strong> de{" "}
              <strong className="text-white">{carona.vagas}</strong> vagas livres
            </span>
          </div>
        </div>

        <div className="mb-4">
          <div className="flex items-center justify-between text-xs mb-1" style={{ color: "rgba(255,255,255,0.3)" }}>
            <span>Ocupação</span>
            <span>{ocupacaoPct}%</span>
          </div>
          <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.08)" }}>
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${ocupacaoPct}%`,
                background: ocupacaoPct >= 100 ? "#ef4444" : ocupacaoPct >= 50 ? "#f59e0b" : "linear-gradient(90deg,#3b82f6,#6366f1)",
              }}
            />
          </div>
        </div>

        {/* Botões de status — só para caronas ativas/em andamento */}
        {aba !== "historico" && (
          <div className="flex gap-2 mb-2">
            {status === "ativa" && (
              <button
                onClick={() => onStatus(carona.id, "em_andamento")}
                disabled={atualizandoStatus === carona.id}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold transition-all disabled:opacity-50"
                style={{ background: "rgba(245,158,11,0.12)", color: "#fcd34d", border: "1px solid rgba(245,158,11,0.3)" }}
              >
                <FiNavigation size={12} />
                Confirmar saída
              </button>
            )}
            {status === "em_andamento" && (
              <button
                onClick={() => onStatus(carona.id, "concluida")}
                disabled={atualizandoStatus === carona.id}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold transition-all disabled:opacity-50"
                style={{ background: "rgba(99,102,241,0.12)", color: "#a5b4fc", border: "1px solid rgba(99,102,241,0.3)" }}
              >
                <FiCheckSquare size={12} />
                Concluir carona
              </button>
            )}
          </div>
        )}

        {/* Republicar */}
        <button
          onClick={() => onRepublicar(carona)}
          className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 active:scale-95 mb-2"
          style={{ color: "#a5b4fc", background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.25)" }}
          onMouseEnter={e => { e.currentTarget.style.background = "rgba(99,102,241,0.18)"; }}
          onMouseLeave={e => { e.currentTarget.style.background = "rgba(99,102,241,0.1)"; }}
        >
          <FiRefreshCw size={13} />
          Republicar carona
        </button>

        {/* Confirmação de exclusão inline */}
        <AnimatePresence mode="wait">
          {confirmando ? (
            <motion.div
              key="confirm"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 6 }}
              transition={{ duration: 0.15 }}
              className="rounded-xl p-3 flex flex-col gap-2"
              style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)" }}
            >
              <div className="flex items-center gap-1.5 text-xs font-semibold" style={{ color: "#fca5a5" }}>
                <FiAlertTriangle />
                Confirmar exclusão?
              </div>
              <p className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>
                Esta ação não pode ser desfeita. Os passageiros perderão suas vagas.
              </p>
              <div className="flex gap-2 mt-1">
                <button
                  onClick={() => { setConfirmando(false); onExcluir(carona.id); }}
                  disabled={excluindo === carona.id}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-all disabled:opacity-50"
                  style={{ background: "rgba(239,68,68,0.25)", color: "#fca5a5" }}
                >
                  {excluindo === carona.id ? (
                    <svg className="animate-spin h-3 w-3" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                  ) : <FiTrash2 size={12} />}
                  Excluir
                </button>
                <button
                  onClick={() => setConfirmando(false)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-all"
                  style={{ background: "rgba(255,255,255,0.07)", color: "rgba(255,255,255,0.55)" }}
                >
                  <FiX size={12} /> Cancelar
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.button
              key="delete-btn"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setConfirmando(true)}
              disabled={excluindo === carona.id}
              className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ color: "#fca5a5", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)" }}
              onMouseEnter={e => { e.currentTarget.style.background = "rgba(239,68,68,0.18)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "rgba(239,68,68,0.1)"; }}
            >
              <FiTrash2 />
              Excluir carona
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

function CardReserva({ reserva, historico, avaliacaoAtual, onAvaliar, cancelando, onCancelar }) {
  const [confirmandoCancelar, setConfirmandoCancelar] = useState(false);
  const [notaSelecionada, setNotaSelecionada] = useState(avaliacaoAtual || 0);
  const [enviandoAvaliacao, setEnviandoAvaliacao] = useState(false);

  async function handleAvaliar(nota) {
    setNotaSelecionada(nota);
    setEnviandoAvaliacao(true);
    try {
      await onAvaliar(reserva.id, nota);
    } finally {
      setEnviandoAvaliacao(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.01 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      className="rounded-2xl overflow-hidden flex flex-col"
      style={GLASS}
    >
      <div className="h-1.5 w-full" style={{
        background: historico
          ? "rgba(255,255,255,0.08)"
          : "linear-gradient(90deg,#3b82f6,#6366f1)"
      }} />
      <div className="p-5 flex flex-col flex-1">
        <div className="flex items-start gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: "rgba(99,102,241,0.2)", border: "1px solid rgba(99,102,241,0.3)" }}>
            <MdOutlineDirectionsCar className="text-indigo-400 text-xl" />
          </div>
          <p className="font-bold text-white text-base leading-snug flex items-center gap-1.5 flex-wrap pt-1">
            <span>{reserva.carona?.origem ?? "—"}</span>
            <FiArrowRight className="text-indigo-400 shrink-0" />
            <span>{reserva.carona?.destino ?? "—"}</span>
          </p>
        </div>

        <div className="space-y-1.5 text-sm flex-1" style={{ color: "rgba(255,255,255,0.5)" }}>
          {reserva.carona?.data_saida && (
            <div className="flex items-center gap-2">
              <FiCalendar className="text-indigo-400 shrink-0" />
              <span><strong className="text-white">{formatarData(reserva.carona.data_saida)}</strong></span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <FiClock className="text-indigo-400 shrink-0" />
            <span>Saída às <strong className="text-white">{reserva.carona?.horario_saida ?? "—"}</strong></span>
          </div>
          <div className="flex items-center gap-2">
            <FiDollarSign className="text-indigo-400 shrink-0" />
            <span>
              <strong className="text-white">
                {reserva.carona ? formatarMoeda(reserva.carona.valor) : "—"}
              </strong>{" "}por vaga
            </span>
          </div>
          <div className="flex items-center gap-2">
            <FiUsers className="text-indigo-400 shrink-0" />
            <span><strong className="text-white">{reserva.carona?.vagas_disponiveis ?? "—"}</strong> vagas restantes</span>
          </div>
        </div>

        <div className="mt-4 pt-3 flex flex-col gap-2" style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
          {historico ? (
            /* Avaliação para caronas no histórico */
            <div>
              <p className="text-xs font-medium mb-2" style={{ color: "rgba(255,255,255,0.4)" }}>
                {avaliacaoAtual ? "Sua avaliação:" : "Avalie esta carona:"}
              </p>
              <div className="flex items-center gap-3">
                <StarRating
                  value={notaSelecionada}
                  onChange={handleAvaliar}
                  readonly={enviandoAvaliacao}
                />
                {enviandoAvaliacao && (
                  <svg className="animate-spin h-3.5 w-3.5 text-amber-400" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                )}
                {notaSelecionada > 0 && !enviandoAvaliacao && (
                  <span className="text-xs font-semibold" style={{ color: "#f59e0b" }}>
                    {["", "Ruim", "Regular", "Bom", "Ótimo", "Excelente"][notaSelecionada]}
                  </span>
                )}
              </div>
            </div>
          ) : (
            /* Status e ações para reservas ativas */
            <>
              <span
                className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full self-start"
                style={{ background: "rgba(16,185,129,0.15)", color: "#6ee7b7", border: "1px solid rgba(16,185,129,0.3)" }}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                Vaga confirmada
              </span>

              {reserva.carona?.motorista_telefone && (
                <motion.a
                  href={buildWhatsAppUrl(reserva.carona.motorista_telefone, reserva.carona)}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-semibold transition-all"
                  style={{ background: "rgba(37,211,102,0.12)", color: "#4ade80", border: "1px solid rgba(37,211,102,0.3)" }}
                >
                  <FaWhatsapp className="text-base" />
                  Entrar em contato com motorista
                </motion.a>
              )}

              {/* Cancelar reserva */}
              <AnimatePresence mode="wait">
                {confirmandoCancelar ? (
                  <motion.div
                    key="confirm-cancelar"
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 4 }}
                    className="rounded-xl p-3 flex flex-col gap-2"
                    style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)" }}
                  >
                    <p className="text-xs font-semibold" style={{ color: "#fca5a5" }}>Cancelar esta reserva?</p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => { setConfirmandoCancelar(false); onCancelar(reserva.id); }}
                        disabled={cancelando === reserva.id}
                        className="flex-1 flex items-center justify-center gap-1 py-2 rounded-lg text-xs font-semibold disabled:opacity-50"
                        style={{ background: "rgba(239,68,68,0.2)", color: "#fca5a5" }}
                      >
                        {cancelando === reserva.id
                          ? <svg className="animate-spin h-3 w-3" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                          : <FiXCircle size={12} />}
                        Cancelar reserva
                      </button>
                      <button
                        onClick={() => setConfirmandoCancelar(false)}
                        className="flex-1 flex items-center justify-center gap-1 py-2 rounded-lg text-xs font-semibold"
                        style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.5)" }}
                      >
                        <FiCheck size={12} /> Manter
                      </button>
                    </div>
                  </motion.div>
                ) : (
                  <motion.button
                    key="cancelar-btn"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setConfirmandoCancelar(true)}
                    className="flex items-center justify-center gap-1.5 w-full py-2 rounded-xl text-xs font-medium transition-all"
                    style={{ color: "rgba(255,255,255,0.3)", background: "transparent", border: "1px solid rgba(255,255,255,0.08)" }}
                    onMouseEnter={e => { e.currentTarget.style.color = "#fca5a5"; e.currentTarget.style.borderColor = "rgba(239,68,68,0.3)"; }}
                    onMouseLeave={e => { e.currentTarget.style.color = "rgba(255,255,255,0.3)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"; }}
                  >
                    <FiXCircle size={12} />
                    Cancelar reserva
                  </motion.button>
                )}
              </AnimatePresence>
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function MinhasCaronas() {
  const { usuario } = useContext(AuthContext);
  const navigate = useNavigate();
  const isMotorista = usuario?.tipo === "motorista";

  usePageTitle(isMotorista ? "Minhas caronas" : "Minhas reservas");

  const [itens, setItens] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [excluindo, setExcluindo] = useState(null);
  const [cancelando, setCancelando] = useState(null);
  const [atualizandoStatus, setAtualizandoStatus] = useState(null);
  const [aba, setAba] = useState("ativas");
  const [avaliacoes, setAvaliacoes] = useState({});

  const hoje = new Date().toISOString().split("T")[0];
  const getDataItem = (item) => isMotorista ? item.data_saida : item.carona?.data_saida;
  const ativas   = itens.filter(i => !getDataItem(i) || getDataItem(i) >= hoje);
  const historico = itens.filter(i => getDataItem(i) && getDataItem(i) < hoje);
  const itensFiltrados = aba === "ativas" ? ativas : historico;

  const endpoint = isMotorista ? "/caronas/minhas" : "/reservas/minhas";

  useEffect(() => {
    async function buscar() {
      try {
        setCarregando(true);
        const resposta = await api.get(endpoint);
        setItens(resposta.data);
        // Para passageiros, busca avaliações já dadas
        if (!isMotorista) {
          const { data } = await api.get("/avaliacoes/minhas");
          setAvaliacoes(data);
        }
      } catch {
        toast.error("Não foi possível carregar os dados. Tente novamente.");
      } finally {
        setCarregando(false);
      }
    }
    buscar();
  }, [endpoint, isMotorista]);

  async function handleStatus(id, novoStatus) {
    try {
      setAtualizandoStatus(id);
      await api.patch(`/caronas/${id}/status`, { status: novoStatus });
      setItens(prev => prev.map(c => c.id === id ? { ...c, status: novoStatus } : c));
      const labels = { em_andamento: "Saída confirmada! Boa viagem!", concluida: "Carona concluída!" };
      toast.success(labels[novoStatus] || "Status atualizado.");
    } catch (err) {
      toast.error(err.response?.data?.mensagem || "Não foi possível atualizar o status.");
    } finally {
      setAtualizandoStatus(null);
    }
  }

  function handleRepublicar(carona) {
    navigate("/oferecer", { state: { carona } });
  }

  async function handleExcluir(id) {
    try {
      setExcluindo(id);
      await api.delete(`/caronas/${id}`);
      setItens((prev) => prev.filter((c) => c.id !== id));
      toast.success("Carona excluída com sucesso.");
    } catch (err) {
      toast.error(err.response?.data?.mensagem || "Não foi possível excluir a carona.");
    } finally {
      setExcluindo(null);
    }
  }

  async function handleCancelar(id) {
    try {
      setCancelando(id);
      await api.delete(`/reservas/${id}`);
      setItens((prev) => prev.filter((r) => r.id !== id));
      toast.success("Reserva cancelada.");
    } catch (err) {
      toast.error(err.response?.data?.mensagem || "Não foi possível cancelar a reserva.");
    } finally {
      setCancelando(null);
    }
  }

  async function handleAvaliar(reservaId, nota) {
    try {
      await api.post("/avaliacoes", { reserva_id: reservaId, nota });
      setAvaliacoes(prev => ({ ...prev, [reservaId]: nota }));
      toast.success("Avaliação registrada!");
    } catch (err) {
      toast.error(err.response?.data?.mensagem || "Não foi possível registrar a avaliação.");
    }
  }

  return (
    <div className="min-h-screen relative overflow-x-hidden"
      style={{ background: "linear-gradient(135deg, #020817 0%, #0f172a 40%, #1e1b4b 100%)" }}>

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

      {/* Hero */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 pt-8 pb-4">
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="rounded-2xl p-6"
          style={GLASS}
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-white mb-1">
                {isMotorista ? "Minhas Caronas" : "Minhas Reservas"}
              </h1>
              <p className="text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>
                {isMotorista
                  ? "Gerencie as caronas que você oferece."
                  : "Veja as caronas que você reservou."}
              </p>
            </div>

            {isMotorista && (
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => navigate("/oferecer")}
                className="flex items-center gap-2 self-start sm:self-auto text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-all"
                style={{ background: "linear-gradient(135deg,#6366f1,#3b82f6)", boxShadow: "0 4px 16px rgba(99,102,241,0.4)" }}
              >
                <FiPlus />
                Nova carona
              </motion.button>
            )}
          </div>

          {!carregando && (
            <div className="mt-5 grid grid-cols-2 gap-3 max-w-xs">
              <div className="rounded-xl px-4 py-3" style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)" }}>
                <div className="flex items-center gap-1.5 mb-1">
                  <MdOutlineDirectionsCar style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.85rem" }} />
                  <p className="text-xs uppercase tracking-wide font-medium" style={{ color: "rgba(255,255,255,0.4)" }}>
                    {isMotorista ? "Caronas" : "Reservas"}
                  </p>
                </div>
                <p className="text-white text-2xl font-bold">{itens.length}</p>
              </div>
              {isMotorista && (
                <div className="rounded-xl px-4 py-3" style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)" }}>
                  <div className="flex items-center gap-1.5 mb-1">
                    <FiUsers style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.85rem" }} />
                    <p className="text-xs uppercase tracking-wide font-medium" style={{ color: "rgba(255,255,255,0.4)" }}>Vagas livres</p>
                  </div>
                  <p className="text-white text-2xl font-bold">
                    {itens.reduce((acc, c) => acc + (c.vagas_disponiveis ?? 0), 0)}
                  </p>
                </div>
              )}
            </div>
          )}
        </motion.div>
      </div>

      {/* Conteúdo */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 py-6">

        {/* Abas */}
        {!carregando && itens.length > 0 && (
          <div className="flex gap-2 mb-6">
            {[
              { key: "ativas", label: isMotorista ? "Ativas" : "Próximas", count: ativas.length },
              { key: "historico", label: "Histórico", count: historico.length },
            ].map(({ key, label, count }) => (
              <button
                key={key}
                onClick={() => setAba(key)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all"
                style={aba === key
                  ? { background: "linear-gradient(135deg,#6366f1,#3b82f6)", color: "#fff", boxShadow: "0 4px 14px rgba(99,102,241,0.4)" }
                  : { background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.45)", border: "1px solid rgba(255,255,255,0.08)" }
                }
              >
                {key === "ativas" ? <FiClock size={13} /> : <FiCalendar size={13} />}
                {label}
                <span
                  className="text-xs px-1.5 py-0.5 rounded-full font-bold"
                  style={{ background: aba === key ? "rgba(255,255,255,0.25)" : "rgba(255,255,255,0.1)", color: aba === key ? "#fff" : "rgba(255,255,255,0.5)" }}
                >
                  {count}
                </span>
              </button>
            ))}
          </div>
        )}

        {/* Grid com animação ao trocar abas */}
        <AnimatePresence mode="wait">
          <motion.div
            key={aba}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="grid gap-4 md:grid-cols-2"
          >
            {carregando ? (
              Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
            ) : itensFiltrados.length === 0 ? (
              aba === "historico" ? (
                <div className="col-span-2 flex flex-col items-center justify-center py-16 text-center">
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
                    style={{ background: "rgba(99,102,241,0.15)", border: "1px solid rgba(99,102,241,0.3)" }}>
                    <FiCalendar className="text-indigo-400 text-2xl" />
                  </div>
                  <p className="text-white font-semibold mb-1">Nenhum histórico ainda</p>
                  <p className="text-white/40 text-sm">As caronas concluídas aparecerão aqui.</p>
                </div>
              ) : (
                <EmptyState
                  tipo={isMotorista ? "motorista" : "passageiro"}
                  onAction={() => navigate(isMotorista ? "/oferecer" : "/")}
                />
              )
            ) : isMotorista ? (
              itensFiltrados.map((carona) => (
                <motion.div key={carona.id} style={{ opacity: aba === "historico" ? 0.65 : 1 }}>
                  <CardCaronaMotorista
                    carona={carona}
                    onExcluir={handleExcluir}
                    excluindo={excluindo}
                    onRepublicar={handleRepublicar}
                    onStatus={handleStatus}
                    atualizandoStatus={atualizandoStatus}
                    aba={aba}
                  />
                </motion.div>
              ))
            ) : (
              itensFiltrados.map((reserva) => (
                <CardReserva
                  key={reserva.id}
                  reserva={reserva}
                  historico={aba === "historico"}
                  avaliacaoAtual={avaliacoes[reserva.id] || 0}
                  onAvaliar={handleAvaliar}
                  cancelando={cancelando}
                  onCancelar={handleCancelar}
                />
              ))
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

export default MinhasCaronas;
