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

const CARD = {
  background: "#FFFFFF",
  border: "1px solid #E9EEF4",
  boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
};

const INPUT_STYLE = {
  background: "#F8FAFC",
  border: "1px solid #E2E8F0",
  color: "#0F172A",
};

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
        background: "#FFFFFF",
        border: "1px solid rgba(239,68,68,0.2)",
        boxShadow: "0 2px 8px rgba(239,68,68,0.06)",
      } : CARD}
    >
      <div
        className="px-6 py-4 flex items-center gap-2"
        style={{ borderBottom: `1px solid ${danger ? "rgba(239,68,68,0.15)" : "#E9EEF4"}` }}
      >
        <span style={{ color: danger ? "#dc2626" : "#6366f1" }}>{icon}</span>
        <h2
          className="text-xs font-bold uppercase tracking-widest"
          style={{ color: danger ? "#dc2626" : "#64748B" }}
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
        style={{ color: "#64748B" }}
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
          className="w-full rounded-xl px-3 py-2.5 text-sm pr-10 focus:outline-none transition disabled:opacity-50"
          style={INPUT_STYLE}
          onFocus={e => { e.target.style.borderColor = "rgba(99,102,241,0.7)"; e.target.style.background = "#FFFFFF"; }}
          onBlur={e => { e.target.style.borderColor = "#E2E8F0"; e.target.style.background = "#F8FAFC"; }}
        />
        <button
          type="button"
          onClick={onToggle}
          className="absolute right-3 top-1/2 -translate-y-1/2 transition"
          style={{ color: "#94A3B8" }}
          onMouseEnter={e => e.currentTarget.style.color = "#64748B"}
          onMouseLeave={e => e.currentTarget.style.color = "#94A3B8"}
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
      style={{ background: "#F4F7FB" }}
    >
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
            style={{ color: "#94A3B8" }}
            onMouseEnter={e => e.currentTarget.style.color = "#0F172A"}
            onMouseLeave={e => e.currentTarget.style.color = "#94A3B8"}
          >
            <FiArrowLeft />Voltar
          </button>

          <div className="flex items-center gap-3">
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center"
              style={{ background: "#EEF2FF" }}
            >
              <FiSettings className="text-indigo-500 text-lg" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold" style={{ color: "#0F172A" }}>Configurações</h1>
              <p className="text-sm" style={{ color: "#64748B" }}>
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
                style={{ background: "linear-gradient(135deg,#6366f1,#3b82f6)", boxShadow: "0 4px 16px rgba(99,102,241,0.3)" }}
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
                style={{ color: "#64748B" }}
              >
                Faculdade padrão
              </label>
              <p className="text-xs mb-3" style={{ color: "#94A3B8" }}>
                O filtro da Home já começa selecionado nesta instituição.
              </p>
              <select
                value={facPadrao}
                onChange={e => handleFacPadrao(e.target.value)}
                className="w-full rounded-xl px-3 py-2.5 text-sm focus:outline-none transition"
                style={INPUT_STYLE}
                onFocus={e => { e.target.style.borderColor = "rgba(99,102,241,0.7)"; e.target.style.background = "#FFFFFF"; }}
                onBlur={e => { e.target.style.borderColor = "#E2E8F0"; e.target.style.background = "#F8FAFC"; }}
              >
                <option value="">Nenhuma (mostrar todas)</option>
                {DESTINOS.map(d => (
                  <option key={d} value={d}>{d}</option>
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
                  <span style={{ color: "#64748B" }}>{label}</span>
                  <span className="font-semibold" style={{ color: "#0F172A" }}>{valor}</span>
                </div>
              ))}
            </div>
          </SectionCard>

          {/* ── Zona de perigo ── */}
          <SectionCard title="Zona de perigo" icon={<FiTrash2 size={14} />} delay={0.2} danger>
            {etapaDeletar === 0 ? (
              <div>
                <p className="text-sm mb-4 leading-relaxed" style={{ color: "#64748B" }}>
                  Excluir a conta é <strong style={{ color: "#0F172A" }}>permanente e irreversível</strong>. Todas as suas caronas, reservas e dados serão apagados imediatamente.
                </p>
                <button
                  onClick={() => setEtapaDeletar(1)}
                  className="flex items-center gap-2 text-sm font-semibold px-4 py-2.5 rounded-xl transition-all active:scale-95"
                  style={{ color: "#dc2626", background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)" }}
                  onMouseEnter={e => e.currentTarget.style.background = "rgba(239,68,68,0.14)"}
                  onMouseLeave={e => e.currentTarget.style.background = "rgba(239,68,68,0.08)"}
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
                  style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.15)", color: "#dc2626" }}
                >
                  ⚠️ Você tem certeza? Esta ação <strong>não pode ser desfeita</strong>.
                </div>

                <div>
                  <label
                    className="block text-xs font-semibold uppercase tracking-widest mb-1.5"
                    style={{ color: "#dc2626" }}
                  >
                    Confirme com sua senha
                  </label>
                  <div className="relative">
                    <input
                      type={mostrarSenhaDeletar ? "text" : "password"}
                      value={senhaDeletar}
                      onChange={e => setSenhaDeletar(e.target.value)}
                      placeholder="••••••••"
                      className="w-full rounded-xl px-3 py-2.5 text-sm pr-10 focus:outline-none transition"
                      style={{ ...INPUT_STYLE, borderColor: "rgba(239,68,68,0.3)" }}
                      onFocus={e => { e.target.style.borderColor = "rgba(239,68,68,0.6)"; e.target.style.background = "#FFFFFF"; }}
                      onBlur={e => { e.target.style.borderColor = "rgba(239,68,68,0.3)"; e.target.style.background = "#F8FAFC"; }}
                    />
                    <button
                      type="button"
                      onClick={() => setMostrarSenhaDeletar(v => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 transition"
                      style={{ color: "#94A3B8" }}
                    >
                      {mostrarSenhaDeletar ? <FiEyeOff size={15} /> : <FiEye size={15} />}
                    </button>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => { setEtapaDeletar(0); setSenhaDeletar(""); }}
                    className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all active:scale-95"
                    style={{ background: "#F1F5F9", color: "#64748B", border: "1px solid #E2E8F0" }}
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleDeletarConta}
                    disabled={deletando || !senhaDeletar}
                    className="flex-1 py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ background: "rgba(239,68,68,0.12)", color: "#dc2626", border: "1px solid rgba(239,68,68,0.3)" }}
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
