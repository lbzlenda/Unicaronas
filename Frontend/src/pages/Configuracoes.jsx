import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { AuthContext } from "../contexts/AuthContext.jsx";
import api from "../api/axiosConfig.js";
import usePageTitle from "../hooks/usePageTitle.js";
import { DESTINOS } from "../schemas/caronaSchemas.js";
import {
  FiArrowLeft, FiLock, FiEye, FiEyeOff, FiTrash2,
  FiBookmark, FiInfo, FiSettings,
} from "react-icons/fi";

const GLASS = {
  background: "rgba(255,255,255,0.06)",
  backdropFilter: "blur(20px)",
  WebkitBackdropFilter: "blur(20px)",
  border: "1px solid rgba(255,255,255,0.12)",
  boxShadow: "0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.08)",
};

const INPUT_STYLE = {
  background: "rgba(255,255,255,0.07)",
  border: "1px solid rgba(255,255,255,0.12)",
  color: "#fff",
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

function Spinner() {
  return (
    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}

function SectionCard({ title, icon, children, delay = 0, danger = false }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className="rounded-2xl overflow-hidden"
      style={danger ? {
        ...GLASS,
        background: "rgba(239,68,68,0.06)",
        border: "1px solid rgba(239,68,68,0.2)",
        boxShadow: "0 8px 32px rgba(239,68,68,0.1)",
      } : GLASS}
    >
      <div
        className="px-6 py-4 flex items-center gap-2"
        style={{ borderBottom: `1px solid ${danger ? "rgba(239,68,68,0.15)" : "rgba(255,255,255,0.07)"}` }}
      >
        <span style={{ color: danger ? "#fca5a5" : "rgba(99,102,241,0.9)" }}>{icon}</span>
        <h2
          className="text-xs font-bold uppercase tracking-widest"
          style={{ color: danger ? "#fca5a5" : "rgba(255,255,255,0.55)" }}
        >
          {title}
        </h2>
      </div>
      <div className="p-6">{children}</div>
    </motion.div>
  );
}

function PasswordInput({ label, value, onChange, show, onToggle, placeholder = "••••••••", disabled }) {
  return (
    <div>
      <label
        className="block text-xs font-semibold uppercase tracking-widest mb-1.5"
        style={{ color: "rgba(255,255,255,0.4)" }}
      >
        {label}
      </label>
      <div className="relative">
        <input
          type={show ? "text" : "password"}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          className="w-full rounded-xl px-3 py-2.5 text-sm pr-10 placeholder-white/25 focus:outline-none transition disabled:opacity-50"
          style={INPUT_STYLE}
          onFocus={e => e.target.style.borderColor = "rgba(99,102,241,0.7)"}
          onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.12)"}
        />
        <button
          type="button"
          onClick={onToggle}
          className="absolute right-3 top-1/2 -translate-y-1/2 transition"
          style={{ color: "rgba(255,255,255,0.3)" }}
          onMouseEnter={e => e.currentTarget.style.color = "rgba(255,255,255,0.7)"}
          onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,0.3)"}
        >
          {show ? <FiEyeOff size={15} /> : <FiEye size={15} />}
        </button>
      </div>
    </div>
  );
}

export default function Configuracoes() {
  usePageTitle("Configurações");
  const { usuario, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  // Alterar senha
  const [senhaForm, setSenhaForm] = useState({ atual: "", nova: "", confirmar: "" });
  const [mostrarSenhas, setMostrarSenhas] = useState([false, false, false]);
  const [salvandoSenha, setSalvandoSenha] = useState(false);

  // Faculdade padrão
  const [facPadrao, setFacPadrao] = useState(
    () => localStorage.getItem("unicaronas_filtro_padrao") || ""
  );

  // Deletar conta
  const [etapaDeletar, setEtapaDeletar] = useState(0);
  const [senhaDeletar, setSenhaDeletar] = useState("");
  const [mostrarSenhaDeletar, setMostrarSenhaDeletar] = useState(false);
  const [deletando, setDeletando] = useState(false);

  function toggleSenha(idx) {
    setMostrarSenhas(m => m.map((v, i) => i === idx ? !v : v));
  }

  async function handleAlterarSenha(e) {
    e.preventDefault();
    if (senhaForm.nova.length < 8) {
      toast.error("A nova senha deve ter no mínimo 8 caracteres.");
      return;
    }
    if (senhaForm.nova !== senhaForm.confirmar) {
      toast.error("As novas senhas não coincidem.");
      return;
    }
    try {
      setSalvandoSenha(true);
      await api.patch("/auth/senha", { senhaAtual: senhaForm.atual, novaSenha: senhaForm.nova });
      toast.success("Senha alterada com sucesso!");
      setSenhaForm({ atual: "", nova: "", confirmar: "" });
    } catch (err) {
      toast.error(err.response?.data?.mensagem || "Não foi possível alterar a senha.");
    } finally {
      setSalvandoSenha(false);
    }
  }

  function handleFacPadrao(val) {
    setFacPadrao(val);
    if (val) {
      localStorage.setItem("unicaronas_filtro_padrao", val);
      toast.success(`Filtro padrão definido: ${val}`);
    } else {
      localStorage.removeItem("unicaronas_filtro_padrao");
      toast.success("Filtro padrão removido.");
    }
  }

  async function handleDeletarConta() {
    if (!senhaDeletar) {
      toast.error("Informe sua senha para confirmar.");
      return;
    }
    try {
      setDeletando(true);
      await api.delete("/auth/conta", { data: { senha: senhaDeletar } });
      toast.success("Conta excluída.");
      logout();
      navigate("/cadastro");
    } catch (err) {
      toast.error(err.response?.data?.mensagem || "Não foi possível excluir a conta.");
    } finally {
      setDeletando(false);
    }
  }

  if (!usuario) return null;

  return (
    <div
      className="min-h-screen relative overflow-x-hidden"
      style={{ background: "linear-gradient(135deg, #020817 0%, #0f172a 40%, #1e1b4b 100%)" }}
    >
      <Blob
        className="w-[500px] h-[500px] -top-32 -left-32 opacity-20"
        style={{ background: "radial-gradient(circle, #6366f1, transparent 70%)" }}
        animate={{ x: [0, 40, 0], y: [0, 30, 0], scale: [1, 1.1, 1] }}
      />
      <Blob
        className="w-80 h-80 -bottom-20 -right-16 opacity-15"
        style={{ background: "radial-gradient(circle, #3b82f6, transparent 70%)" }}
        animate={{ x: [0, -30, 0], y: [0, -20, 0] }}
      />

      <div className="relative z-10 max-w-2xl mx-auto px-4 pt-8 pb-16">

        {/* Cabeçalho */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-8"
        >
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 text-sm font-medium mb-6 transition"
            style={{ color: "rgba(255,255,255,0.5)" }}
            onMouseEnter={e => e.currentTarget.style.color = "#fff"}
            onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,0.5)"}
          >
            <FiArrowLeft />Voltar
          </button>

          <div className="flex items-center gap-3">
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center"
              style={{ background: "rgba(99,102,241,0.2)", border: "1px solid rgba(99,102,241,0.3)" }}
            >
              <FiSettings className="text-indigo-400 text-lg" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-white">Configurações</h1>
              <p className="text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>
                Gerencie sua conta e preferências
              </p>
            </div>
          </div>
        </motion.div>

        <div className="flex flex-col gap-4">

          {/* ── Segurança ── */}
          <SectionCard title="Segurança — Alterar senha" icon={<FiLock size={14} />} delay={0.05}>
            <form onSubmit={handleAlterarSenha} className="space-y-4">
              <PasswordInput
                label="Senha atual"
                value={senhaForm.atual}
                onChange={e => setSenhaForm(s => ({ ...s, atual: e.target.value }))}
                show={mostrarSenhas[0]}
                onToggle={() => toggleSenha(0)}
                disabled={salvandoSenha}
              />
              <PasswordInput
                label="Nova senha"
                value={senhaForm.nova}
                onChange={e => setSenhaForm(s => ({ ...s, nova: e.target.value }))}
                show={mostrarSenhas[1]}
                onToggle={() => toggleSenha(1)}
                placeholder="Mínimo 8 caracteres"
                disabled={salvandoSenha}
              />
              <PasswordInput
                label="Confirmar nova senha"
                value={senhaForm.confirmar}
                onChange={e => setSenhaForm(s => ({ ...s, confirmar: e.target.value }))}
                show={mostrarSenhas[2]}
                onToggle={() => toggleSenha(2)}
                disabled={salvandoSenha}
              />
              <button
                type="submit"
                disabled={salvandoSenha || !senhaForm.atual || !senhaForm.nova || !senhaForm.confirmar}
                className="w-full py-2.5 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ background: "linear-gradient(135deg,#6366f1,#3b82f6)", boxShadow: "0 4px 16px rgba(99,102,241,0.4)" }}
              >
                {salvandoSenha ? <><Spinner />Salvando…</> : "Alterar senha"}
              </button>
            </form>
          </SectionCard>

          {/* ── Preferências ── */}
          <SectionCard title="Preferências" icon={<FiBookmark size={14} />} delay={0.1}>
            <div>
              <label
                className="block text-xs font-semibold uppercase tracking-widest mb-1"
                style={{ color: "rgba(255,255,255,0.4)" }}
              >
                Faculdade padrão
              </label>
              <p className="text-xs mb-3" style={{ color: "rgba(255,255,255,0.3)" }}>
                O filtro da Home já começa selecionado nesta instituição.
              </p>
              <select
                value={facPadrao}
                onChange={e => handleFacPadrao(e.target.value)}
                className="w-full rounded-xl px-3 py-2.5 text-sm focus:outline-none transition"
                style={INPUT_STYLE}
                onFocus={e => e.target.style.borderColor = "rgba(99,102,241,0.7)"}
                onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.12)"}
              >
                <option value="" style={{ background: "#0f172a" }}>Nenhuma (mostrar todas)</option>
                {DESTINOS.map(d => (
                  <option key={d} value={d} style={{ background: "#0f172a" }}>{d}</option>
                ))}
              </select>
            </div>
          </SectionCard>

          {/* ── Sobre ── */}
          <SectionCard title="Sobre" icon={<FiInfo size={14} />} delay={0.15}>
            <div className="space-y-3.5">
              {[
                { label: "Versão", valor: "1.0.0" },
                { label: "Plataforma", valor: "PWA · Web" },
                { label: "Cidade", valor: "Palmas – TO" },
                { label: "Conta", valor: usuario.email },
                { label: "Tipo", valor: usuario.tipo === "motorista" ? "Motorista" : "Passageiro" },
              ].map(({ label, valor }) => (
                <div key={label} className="flex items-center justify-between text-sm">
                  <span style={{ color: "rgba(255,255,255,0.4)" }}>{label}</span>
                  <span className="font-semibold" style={{ color: "rgba(255,255,255,0.75)" }}>{valor}</span>
                </div>
              ))}
            </div>
          </SectionCard>

          {/* ── Zona de perigo ── */}
          <SectionCard title="Zona de perigo" icon={<FiTrash2 size={14} />} delay={0.2} danger>
            {etapaDeletar === 0 ? (
              <div>
                <p className="text-sm mb-4 leading-relaxed" style={{ color: "rgba(255,255,255,0.5)" }}>
                  Excluir a conta é <strong className="text-white">permanente e irreversível</strong>. Todas as suas caronas, reservas e dados serão apagados imediatamente.
                </p>
                <button
                  onClick={() => setEtapaDeletar(1)}
                  className="flex items-center gap-2 text-sm font-semibold px-4 py-2.5 rounded-xl transition-all active:scale-95"
                  style={{ color: "#fca5a5", background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.3)" }}
                  onMouseEnter={e => e.currentTarget.style.background = "rgba(239,68,68,0.22)"}
                  onMouseLeave={e => e.currentTarget.style.background = "rgba(239,68,68,0.12)"}
                >
                  <FiTrash2 />
                  Quero excluir minha conta
                </button>
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <div
                  className="rounded-xl p-3 text-sm leading-relaxed"
                  style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", color: "#fca5a5" }}
                >
                  ⚠️ Você tem certeza? Esta ação <strong>não pode ser desfeita</strong>.
                </div>

                <div>
                  <label
                    className="block text-xs font-semibold uppercase tracking-widest mb-1.5"
                    style={{ color: "rgba(255,100,100,0.7)" }}
                  >
                    Confirme com sua senha
                  </label>
                  <div className="relative">
                    <input
                      type={mostrarSenhaDeletar ? "text" : "password"}
                      value={senhaDeletar}
                      onChange={e => setSenhaDeletar(e.target.value)}
                      placeholder="••••••••"
                      className="w-full rounded-xl px-3 py-2.5 text-sm pr-10 placeholder-white/25 focus:outline-none transition"
                      style={{ ...INPUT_STYLE, borderColor: "rgba(239,68,68,0.35)" }}
                      onFocus={e => e.target.style.borderColor = "rgba(239,68,68,0.7)"}
                      onBlur={e => e.target.style.borderColor = "rgba(239,68,68,0.35)"}
                    />
                    <button
                      type="button"
                      onClick={() => setMostrarSenhaDeletar(v => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 transition"
                      style={{ color: "rgba(255,255,255,0.3)" }}
                    >
                      {mostrarSenhaDeletar ? <FiEyeOff size={15} /> : <FiEye size={15} />}
                    </button>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => { setEtapaDeletar(0); setSenhaDeletar(""); }}
                    className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all active:scale-95"
                    style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.5)", border: "1px solid rgba(255,255,255,0.1)" }}
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleDeletarConta}
                    disabled={deletando || !senhaDeletar}
                    className="flex-1 py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ background: "rgba(239,68,68,0.22)", color: "#fca5a5", border: "1px solid rgba(239,68,68,0.4)" }}
                  >
                    {deletando ? <><Spinner />Excluindo…</> : <><FiTrash2 size={14} />Excluir conta</>}
                  </button>
                </div>
              </motion.div>
            )}
          </SectionCard>

        </div>
      </div>
    </div>
  );
}
