import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { motion } from "framer-motion";
import api from "../api/axiosConfig.js";
import usePageTitle from "../hooks/usePageTitle.js";
import logo from "../assets/logo-unicaronas-removebg-preview.png";
import { FiArrowRight, FiCopy, FiCheck } from "react-icons/fi";

function Spinner() {
  return (
    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}

const INPUT_BASE = {
  background: "rgba(255,255,255,0.06)",
  border: "1px solid rgba(255,255,255,0.1)",
};

export default function EsqueciSenha() {
  usePageTitle("Recuperar senha");
  const navigate = useNavigate();

  const [etapa, setEtapa] = useState("email");
  const [email, setEmail] = useState("");
  const [codigo, setCodigo] = useState("");
  const [codigoGerado, setCodigoGerado] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [copiado, setCopiado] = useState(false);

  async function handleSolicitarCodigo(e) {
    e.preventDefault();
    if (!email.trim()) return;
    try {
      setEnviando(true);
      const { data } = await api.post("/auth/esqueci-senha", { email: email.trim() });
      setCodigoGerado(data.codigo || "");
      setEtapa("codigo");
    } catch (err) {
      toast.error(err.response?.data?.mensagem || "Erro ao solicitar código.");
    } finally {
      setEnviando(false);
    }
  }

  async function handleRedefinir(e) {
    e.preventDefault();
    if (novaSenha !== confirmarSenha) {
      toast.error("As senhas não coincidem.");
      return;
    }
    if (novaSenha.length < 6) {
      toast.error("A senha deve ter pelo menos 6 caracteres.");
      return;
    }
    try {
      setEnviando(true);
      await api.post("/auth/redefinir-senha", { email, codigo, nova_senha: novaSenha });
      toast.success("Senha redefinida com sucesso!");
      navigate("/login");
    } catch (err) {
      toast.error(err.response?.data?.mensagem || "Código inválido ou expirado.");
    } finally {
      setEnviando(false);
    }
  }

  function copiarCodigo() {
    navigator.clipboard.writeText(codigoGerado).catch(() => {});
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  }

  function onFocus(e) {
    e.target.style.borderColor = "rgba(99,102,241,0.8)";
    e.target.style.background = "rgba(255,255,255,0.09)";
  }
  function onBlur(e) {
    e.target.style.borderColor = "rgba(255,255,255,0.1)";
    e.target.style.background = "rgba(255,255,255,0.06)";
  }

  return (
    <div
      className="min-h-screen flex items-start justify-center px-4 pt-8"
      style={{
        background: `
          radial-gradient(ellipse 80% 50% at 50% -5%, rgba(99,102,241,0.35) 0%, transparent 100%),
          radial-gradient(ellipse 50% 40% at 100% 100%, rgba(59,130,246,0.15) 0%, transparent 100%),
          #030712
        `,
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-[400px]"
      >
        <div className="flex flex-col items-center mb-8">
          <div className="relative">
            <div
              className="absolute inset-0 rounded-full blur-2xl opacity-60"
              style={{ background: "radial-gradient(circle, #6366f1, transparent 70%)", transform: "scale(1.8)" }}
            />
            <img src={logo} alt="UniCaronas" className="relative w-62 h-62 object-contain" />
          </div>
        </div>

        <div
          style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: "20px",
            boxShadow: "0 0 0 1px rgba(255,255,255,0.03), 0 24px 64px rgba(0,0,0,0.6)",
          }}
          className="p-8"
        >
          {etapa === "email" ? (
            <>
              <h1 className="text-2xl font-extrabold text-white mb-1">Recuperar senha</h1>
              <p className="text-white/35 text-sm mb-7">
                Informe seu e-mail para receber o código de recuperação.
              </p>
              <form onSubmit={handleSolicitarCodigo} className="space-y-5">
                <div>
                  <label className="text-xs font-semibold text-white/40 uppercase tracking-widest block mb-2">
                    E-mail
                  </label>
                  <input
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    disabled={enviando}
                    required
                    className="w-full px-4 py-3.5 rounded-xl text-sm text-white placeholder-white/20 focus:outline-none transition-all disabled:opacity-50"
                    style={INPUT_BASE}
                    onFocus={onFocus}
                    onBlur={onBlur}
                  />
                </div>
                <motion.button
                  type="submit"
                  disabled={enviando || !email.trim()}
                  whileHover={{ scale: 1.015 }}
                  whileTap={{ scale: 0.975 }}
                  className="w-full py-3.5 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  style={{
                    background: "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)",
                    boxShadow: "0 4px 20px rgba(99,102,241,0.5), inset 0 1px 0 rgba(255,255,255,0.15)",
                  }}
                >
                  {enviando ? <><Spinner />Gerando código…</> : <>Gerar código <FiArrowRight size={14} /></>}
                </motion.button>
              </form>
            </>
          ) : (
            <>
              <h1 className="text-2xl font-extrabold text-white mb-1">Redefinir senha</h1>
              <p className="text-white/35 text-sm mb-5">
                Use o código abaixo para criar sua nova senha.
              </p>

              {codigoGerado && (
                <div
                  className="flex items-center justify-between gap-3 p-3 rounded-xl mb-5"
                  style={{ background: "rgba(99,102,241,0.12)", border: "1px solid rgba(99,102,241,0.3)" }}
                >
                  <div>
                    <p className="text-xs font-medium mb-0.5" style={{ color: "rgba(165,180,252,0.7)" }}>
                      Código de recuperação
                    </p>
                    <p className="text-2xl font-black tracking-[0.25em] text-white">{codigoGerado}</p>
                  </div>
                  <button
                    type="button"
                    onClick={copiarCodigo}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all shrink-0"
                    style={{ background: "rgba(99,102,241,0.2)", color: "#a5b4fc" }}
                  >
                    {copiado ? <><FiCheck size={12} />Copiado</> : <><FiCopy size={12} />Copiar</>}
                  </button>
                </div>
              )}

              <form onSubmit={handleRedefinir} className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-white/40 uppercase tracking-widest block mb-2">
                    Código
                  </label>
                  <input
                    type="text"
                    placeholder="123456"
                    value={codigo}
                    onChange={e => setCodigo(e.target.value)}
                    disabled={enviando}
                    required
                    className="w-full px-4 py-3.5 rounded-xl text-sm text-white placeholder-white/20 focus:outline-none transition-all disabled:opacity-50 font-mono tracking-widest"
                    style={INPUT_BASE}
                    onFocus={onFocus}
                    onBlur={onBlur}
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-white/40 uppercase tracking-widest block mb-2">
                    Nova senha
                  </label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={novaSenha}
                    onChange={e => setNovaSenha(e.target.value)}
                    disabled={enviando}
                    required
                    className="w-full px-4 py-3.5 rounded-xl text-sm text-white placeholder-white/20 focus:outline-none transition-all disabled:opacity-50"
                    style={INPUT_BASE}
                    onFocus={onFocus}
                    onBlur={onBlur}
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-white/40 uppercase tracking-widest block mb-2">
                    Confirmar nova senha
                  </label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={confirmarSenha}
                    onChange={e => setConfirmarSenha(e.target.value)}
                    disabled={enviando}
                    required
                    className="w-full px-4 py-3.5 rounded-xl text-sm text-white placeholder-white/20 focus:outline-none transition-all disabled:opacity-50"
                    style={INPUT_BASE}
                    onFocus={onFocus}
                    onBlur={onBlur}
                  />
                </div>
                <motion.button
                  type="submit"
                  disabled={enviando}
                  whileHover={{ scale: 1.015 }}
                  whileTap={{ scale: 0.975 }}
                  className="w-full py-3.5 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  style={{
                    background: "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)",
                    boxShadow: "0 4px 20px rgba(99,102,241,0.5), inset 0 1px 0 rgba(255,255,255,0.15)",
                  }}
                >
                  {enviando ? <><Spinner />Salvando…</> : <>Redefinir senha <FiArrowRight size={14} /></>}
                </motion.button>
                <button
                  type="button"
                  onClick={() => setEtapa("email")}
                  className="w-full text-center text-sm transition mt-1"
                  style={{ color: "rgba(255,255,255,0.25)" }}
                  onMouseEnter={e => { e.target.style.color = "rgba(255,255,255,0.5)"; }}
                  onMouseLeave={e => { e.target.style.color = "rgba(255,255,255,0.25)"; }}
                >
                  ← Solicitar novo código
                </button>
              </form>
            </>
          )}
        </div>

        <p className="text-center text-white/30 text-sm mt-6">
          Lembrou a senha?{" "}
          <Link to="/login" className="text-indigo-400 font-semibold hover:text-indigo-300 transition">
            Fazer login
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
