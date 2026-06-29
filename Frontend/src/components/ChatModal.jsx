import { useContext, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FiSend, FiX } from "react-icons/fi";
import { toast } from "sonner";
import api from "../api/axiosConfig.js";
import { AuthContext } from "../contexts/AuthContext.jsx";

export default function ChatModal({ reservaId, nomeContato, fotoContato, onClose }) {
  const { usuario } = useContext(AuthContext);
  const [mensagens, setMensagens] = useState([]);
  const [texto, setTexto] = useState("");
  const [enviando, setEnviando] = useState(false);
  const bottomRef = useRef(null);
  const intervalRef = useRef(null);

  async function buscarMensagens() {
    try {
      const { data } = await api.get(`/mensagens/${reservaId}`);
      setMensagens(data);
    } catch {}
  }

  useEffect(() => {
    buscarMensagens();
    intervalRef.current = setInterval(buscarMensagens, 4000);
    return () => clearInterval(intervalRef.current);
  }, [reservaId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [mensagens]);

  async function handleEnviar(e) {
    e.preventDefault();
    if (!texto.trim()) return;
    try {
      setEnviando(true);
      await api.post("/mensagens", { reserva_id: reservaId, conteudo: texto.trim() });
      setTexto("");
      await buscarMensagens();
    } catch {
      toast.error("Não foi possível enviar a mensagem.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
        style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(4px)" }}
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 60 }}
          transition={{ type: "spring", stiffness: 380, damping: 30 }}
          className="w-full sm:max-w-sm rounded-t-2xl sm:rounded-2xl overflow-hidden flex flex-col"
          style={{
            maxHeight: "85vh",
            background: "#0a0f1e",
            border: "1px solid rgba(255,255,255,0.1)",
            boxShadow: "0 -8px 40px rgba(0,0,0,0.6)",
          }}
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div
            className="flex items-center gap-3 px-4 py-3 shrink-0"
            style={{ borderBottom: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.04)" }}
          >
            {fotoContato ? (
              <img src={fotoContato} alt="" className="w-9 h-9 rounded-full object-cover shrink-0"
                style={{ border: "1px solid rgba(255,255,255,0.15)" }} />
            ) : (
              <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 font-bold text-white text-sm"
                style={{ background: "linear-gradient(135deg,#6366f1,#3b82f6)" }}>
                {nomeContato?.charAt(0)?.toUpperCase() ?? "?"}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-white text-sm truncate">{nomeContato}</p>
              <p className="text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>Chat da carona</p>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg transition"
              style={{ color: "rgba(255,255,255,0.35)" }}
              onMouseEnter={e => { e.currentTarget.style.color = "rgba(255,255,255,0.8)"; }}
              onMouseLeave={e => { e.currentTarget.style.color = "rgba(255,255,255,0.35)"; }}
            >
              <FiX size={17} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2.5" style={{ minHeight: 0 }}>
            {mensagens.length === 0 && (
              <div className="flex items-center justify-center h-full min-h-[120px]">
                <p className="text-sm text-center px-4" style={{ color: "rgba(255,255,255,0.25)" }}>
                  Nenhuma mensagem ainda.
                  <br />Diga olá! 👋
                </p>
              </div>
            )}
            {mensagens.map(m => {
              const minha = m.remetente_id === usuario?.id;
              return (
                <div key={m.id} className={`flex ${minha ? "justify-end" : "justify-start"}`}>
                  <div
                    className="max-w-[82%] px-3 py-2 text-sm"
                    style={minha
                      ? {
                          background: "linear-gradient(135deg,#6366f1,#4f46e5)",
                          color: "#fff",
                          borderRadius: "18px 18px 4px 18px",
                          boxShadow: "0 2px 12px rgba(99,102,241,0.35)",
                        }
                      : {
                          background: "rgba(255,255,255,0.09)",
                          color: "rgba(255,255,255,0.85)",
                          border: "1px solid rgba(255,255,255,0.08)",
                          borderRadius: "18px 18px 18px 4px",
                        }
                    }
                  >
                    <p style={{ wordBreak: "break-word" }}>{m.conteudo}</p>
                    <p className="text-[10px] mt-0.5 opacity-50 text-right">
                      {new Date(m.criada_em).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                </div>
              );
            })}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <form
            onSubmit={handleEnviar}
            className="flex items-center gap-2 px-3 py-3 shrink-0"
            style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}
          >
            <input
              value={texto}
              onChange={e => setTexto(e.target.value)}
              placeholder="Escreva uma mensagem..."
              disabled={enviando}
              autoFocus
              className="flex-1 px-4 py-2.5 rounded-xl text-sm text-white placeholder-white/25 focus:outline-none disabled:opacity-50 transition-all"
              style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)" }}
              onFocus={e => e.target.style.borderColor = "rgba(99,102,241,0.7)"}
              onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.12)"}
            />
            <button
              type="submit"
              disabled={enviando || !texto.trim()}
              className="w-10 h-10 rounded-xl flex items-center justify-center transition-all shrink-0 disabled:opacity-40"
              style={{ background: "linear-gradient(135deg,#6366f1,#4f46e5)", boxShadow: "0 2px 12px rgba(99,102,241,0.4)" }}
            >
              {enviando ? (
                <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              ) : (
                <FiSend size={14} className="text-white" />
              )}
            </button>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
