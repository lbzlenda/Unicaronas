import { useContext, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { AuthContext } from "../contexts/AuthContext.jsx";
import api from "../api/axiosConfig.js";
import usePageTitle from "../hooks/usePageTitle.js";
import { FiMail, FiLogOut, FiArrowLeft, FiPhone, FiEdit2, FiCheck, FiX, FiSettings, FiStar, FiTruck, FiCreditCard, FiCamera } from "react-icons/fi";
import { MdOutlineDirectionsCar } from "react-icons/md";

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

function Initials({ nome, size = 80 }) {
  const iniciais = nome
    ? nome.split(" ").slice(0, 2).map((p) => p[0]).join("").toUpperCase()
    : "?";
  const [c1, c2] = getGradiente(nome);

  return (
    <div
      className="rounded-3xl flex items-center justify-center shadow-lg font-extrabold text-white select-none"
      style={{
        width: size,
        height: size,
        background: `linear-gradient(135deg, ${c1}, ${c2})`,
        fontSize: size * 0.35,
        boxShadow: `0 8px 32px ${c1}55`,
      }}
    >
      {iniciais}
    </div>
  );
}

function StatCard({ valor, label, carregando }) {
  return (
    <div className="rounded-2xl p-5 text-center" style={GLASS}>
      {carregando ? (
        <>
          <div className="h-8 w-12 rounded mx-auto mb-2 animate-pulse" style={{ background: "rgba(255,255,255,0.1)" }} />
          <div className="h-3 w-24 rounded mx-auto animate-pulse" style={{ background: "rgba(255,255,255,0.06)" }} />
        </>
      ) : (
        <>
          <p className="text-3xl font-extrabold text-white">{valor}</p>
          <p className="text-xs mt-1 uppercase tracking-wide font-medium" style={{ color: "rgba(255,255,255,0.4)" }}>{label}</p>
        </>
      )}
    </div>
  );
}

export default function Perfil() {
  usePageTitle("Perfil");

  const { usuario, logout, fotoUrl, atualizarFoto } = useContext(AuthContext);
  const navigate = useNavigate();
  const isMotorista = usuario?.tipo === "motorista";

  const [stats, setStats] = useState({ total: 0, media: null, totalAvaliacoes: 0, carregando: true });
  const [telefone, setTelefone] = useState(null);
  const [placa, setPlaca] = useState(null);
  const [cnh, setCnh] = useState(null);
  const [bio, setBio] = useState(null);
  const [editando, setEditando] = useState(false);
  const [editandoBio, setEditandoBio] = useState(false);
  const [editandoPlaca, setEditandoPlaca] = useState(false);
  const [editandoCnh, setEditandoCnh] = useState(false);
  const [inputTel, setInputTel] = useState("");
  const [inputBio, setInputBio] = useState("");
  const [inputPlaca, setInputPlaca] = useState("");
  const [inputCnh, setInputCnh] = useState("");
  const [salvando, setSalvando] = useState(false);
  const [salvandoBio, setSalvandoBio] = useState(false);
  const [salvandoPlaca, setSalvandoPlaca] = useState(false);
  const [salvandoCnh, setSalvandoCnh] = useState(false);
  const [enviandoFoto, setEnviandoFoto] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (!usuario) return;
    const endpoint = isMotorista ? "/caronas/minhas" : "/reservas/minhas";
    Promise.all([
      api.get(endpoint),
      isMotorista ? api.get(`/avaliacoes/media/${usuario.id}`) : Promise.resolve(null),
      api.get("/auth/perfil"),
    ])
      .then(([{ data: itens }, avalRes, perfilRes]) => {
        setStats({
          total: itens.length,
          media: avalRes?.data?.media ?? null,
          totalAvaliacoes: avalRes?.data?.total ?? 0,
          carregando: false,
        });
        setTelefone(perfilRes.data.telefone);
        setPlaca(perfilRes.data.placa);
        setCnh(perfilRes.data.cnh);
        setBio(perfilRes.data.bio || null);
        atualizarFoto(perfilRes.data.foto_perfil || null);
      })
      .catch(() => setStats(s => ({ ...s, carregando: false })));
  }, [isMotorista, usuario]);

  async function salvarTelefone() {
    const numeros = inputTel.replace(/\D/g, "");
    if (inputTel && (numeros.length < 10 || numeros.length > 11)) {
      toast.error("Número inválido — use DDD + 9 dígitos (ex: 63 9 9999-9999)");
      return;
    }
    try {
      setSalvando(true);
      const { data } = await api.patch("/auth/perfil", { telefone: inputTel || null });
      setTelefone(data.telefone);
      setEditando(false);
      toast.success("Telefone atualizado!");
    } catch {
      toast.error("Não foi possível atualizar. Tente novamente.");
    } finally {
      setSalvando(false);
    }
  }

  async function salvarPlaca() {
    const limpa = inputPlaca.replace(/\s/g, "");
    if (inputPlaca && limpa.length < 7) {
      toast.error("Placa inválida — ex: ABC-1234 ou BRA2E19");
      return;
    }
    try {
      setSalvandoPlaca(true);
      await api.patch("/auth/perfil", { placa: inputPlaca || null });
      setPlaca(inputPlaca || null);
      setEditandoPlaca(false);
      toast.success("Placa atualizada!");
    } catch (err) {
      toast.error(err.response?.data?.mensagem || "Não foi possível atualizar.");
    } finally {
      setSalvandoPlaca(false);
    }
  }

  async function salvarCnh() {
    const digitos = inputCnh.replace(/\D/g, "");
    if (inputCnh && digitos.length !== 11) {
      toast.error("CNH inválida — informe os 11 dígitos");
      return;
    }
    try {
      setSalvandoCnh(true);
      await api.patch("/auth/perfil", { cnh: digitos || null });
      setInputCnh(digitos);
      setCnh(digitos || null);
      setEditandoCnh(false);
      toast.success("CNH atualizada!");
    } catch (err) {
      toast.error(err.response?.data?.mensagem || "Não foi possível atualizar.");
    } finally {
      setSalvandoCnh(false);
    }
  }

  async function salvarBio() {
    if (inputBio.length > 160) {
      toast.error("Bio deve ter no máximo 160 caracteres.");
      return;
    }
    try {
      setSalvandoBio(true);
      const { data } = await api.patch("/auth/perfil", { telefone, bio: inputBio || null });
      setBio(data.bio);
      setEditandoBio(false);
      toast.success("Bio atualizada!");
    } catch {
      toast.error("Não foi possível atualizar. Tente novamente.");
    } finally {
      setSalvandoBio(false);
    }
  }

  async function handleFotoChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Selecione uma imagem válida.");
      return;
    }
    try {
      setEnviandoFoto(true);
      const base64 = await new Promise((resolve, reject) => {
        const img = new Image();
        const url = URL.createObjectURL(file);
        img.onload = () => {
          URL.revokeObjectURL(url);
          const canvas = document.createElement("canvas");
          const SIZE = 256;
          canvas.width = SIZE;
          canvas.height = SIZE;
          const ctx = canvas.getContext("2d");
          const minSide = Math.min(img.width, img.height);
          const sx = (img.width - minSide) / 2;
          const sy = (img.height - minSide) / 2;
          ctx.drawImage(img, sx, sy, minSide, minSide, 0, 0, SIZE, SIZE);
          resolve(canvas.toDataURL("image/jpeg", 0.82));
        };
        img.onerror = reject;
        img.src = url;
      });
      const { data } = await api.patch("/auth/foto", { foto: base64 });
      atualizarFoto(data.foto);
      toast.success("Foto de perfil atualizada!");
    } catch {
      toast.error("Não foi possível atualizar a foto.");
    } finally {
      setEnviandoFoto(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  function handleLogout() {
    logout();
    navigate("/login");
  }

  if (!usuario) return null;

  const [c1, c2] = getGradiente(usuario.nome);

  return (
    <div className="min-h-screen relative overflow-x-hidden"
      style={{ background: "linear-gradient(135deg, #020817 0%, #0f172a 40%, #1e1b4b 100%)" }}>

      <Blob
        className="w-[500px] h-[500px] -top-32 -right-24 opacity-15"
        style={{ background: `radial-gradient(circle, ${c1}, transparent 70%)` }}
        animate={{ x: [0, -40, 0], y: [0, 30, 0] }}
      />
      <Blob
        className="w-96 h-96 -bottom-20 -left-16 opacity-10"
        style={{ background: "radial-gradient(circle, #6366f1, transparent 70%)" }}
        animate={{ x: [0, 30, 0], y: [0, -20, 0] }}
      />

      {/* Hero */}
      <div className="relative z-10 max-w-2xl mx-auto px-4 pt-8 pb-4">
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="rounded-2xl p-6"
          style={{
            background: `linear-gradient(135deg, ${c1}22, ${c2}22)`,
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            border: `1px solid ${c1}44`,
            boxShadow: `0 8px 32px ${c1}22`,
          }}
        >
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 text-sm font-medium mb-6 transition"
            style={{ color: "rgba(255,255,255,0.5)" }}
            onMouseEnter={e => e.currentTarget.style.color = "#fff"}
            onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,0.5)"}
          >
            <FiArrowLeft />
            Voltar
          </button>

          <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6">
            {/* Avatar clicável */}
            <div className="relative shrink-0">
              <button
                onClick={() => !enviandoFoto && fileInputRef.current?.click()}
                className="relative group block rounded-3xl overflow-hidden"
                style={{ width: 96, height: 96 }}
                title="Trocar foto de perfil"
                disabled={enviandoFoto}
              >
                {fotoUrl ? (
                  <img src={fotoUrl} alt="Foto de perfil" className="w-full h-full object-cover" />
                ) : (
                  <Initials nome={usuario.nome} size={96} />
                )}
                <div className="absolute inset-0 flex items-center justify-center transition-opacity duration-200 rounded-3xl"
                  style={{ background: "rgba(0,0,0,0.45)", opacity: enviandoFoto ? 1 : 0 }}
                  onMouseEnter={e => !enviandoFoto && (e.currentTarget.style.opacity = "1")}
                  onMouseLeave={e => !enviandoFoto && (e.currentTarget.style.opacity = "0")}
                >
                  {enviandoFoto
                    ? <svg className="animate-spin h-6 w-6 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                    : <FiCamera className="text-white text-xl" />
                  }
                </div>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFotoChange}
              />
              {/* Badge câmera */}
              <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full flex items-center justify-center pointer-events-none"
                style={{ background: "linear-gradient(135deg,#6366f1,#3b82f6)", border: "2px solid rgba(2,8,23,0.8)" }}>
                <FiCamera size={12} className="text-white" />
              </div>
            </div>

            <div className="text-center sm:text-left">
              <h1 className="text-3xl font-extrabold text-white mb-1">{usuario.nome}</h1>
              <div className="flex items-center justify-center sm:justify-start gap-2 text-sm mb-3"
                style={{ color: "rgba(255,255,255,0.5)" }}>
                <FiMail className="shrink-0" />
                {usuario.email}
              </div>
              <span
                className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full"
                style={{ background: "rgba(255,255,255,0.12)", color: "#fff", backdropFilter: "blur(4px)" }}
              >
                <MdOutlineDirectionsCar className="text-sm" />
                {isMotorista ? "Motorista" : "Passageiro"}
              </span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Conteúdo */}
      <div className="relative z-10 max-w-2xl mx-auto px-4 py-6">

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
          <StatCard
            valor={stats.total}
            label={isMotorista ? "Caronas publicadas" : "Reservas feitas"}
            carregando={stats.carregando}
          />
          <StatCard
            valor={
              isMotorista && stats.media
                ? <span className="flex items-center justify-center gap-1">
                    <FiStar className="text-amber-400 text-2xl" />
                    {stats.media}
                  </span>
                : "—"
            }
            label={
              isMotorista
                ? stats.totalAvaliacoes > 0
                  ? `${stats.totalAvaliacoes} avaliação${stats.totalAvaliacoes !== 1 ? "ões" : ""}`
                  : "Sem avaliações ainda"
                : "Avaliações (em breve)"
            }
            carregando={stats.carregando}
          />
        </div>

        {/* Informações */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="rounded-2xl overflow-hidden mb-6"
          style={GLASS}
        >
          <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide mb-0.5" style={{ color: "rgba(255,255,255,0.35)" }}>Nome</p>
              <p className="text-sm font-semibold text-white">{usuario.nome}</p>
            </div>
            <div className="w-8 h-8 rounded-full flex items-center justify-center"
              style={{ background: "rgba(255,255,255,0.08)" }}>
              <span className="text-sm font-bold" style={{ color: c1 }}>{usuario.nome[0].toUpperCase()}</span>
            </div>
          </div>

          <div className="px-5 py-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
            <p className="text-xs font-medium uppercase tracking-wide mb-0.5" style={{ color: "rgba(255,255,255,0.35)" }}>E-mail</p>
            <p className="text-sm font-semibold text-white">{usuario.email}</p>
          </div>

          <div className="px-5 py-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs font-medium uppercase tracking-wide mb-0.5" style={{ color: "rgba(255,255,255,0.35)" }}>
                Telefone (WhatsApp)
              </p>
              {!editando && (
                <button
                  onClick={() => { setInputTel(telefone || ""); setEditando(true); }}
                  className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition"
                  style={{ background: "rgba(255,255,255,0.08)" }}
                  title="Editar telefone"
                  onMouseEnter={e => e.currentTarget.style.background = "rgba(99,102,241,0.2)"}
                  onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.08)"}
                >
                  <FiEdit2 size={12} style={{ color: "rgba(255,255,255,0.5)" }} />
                </button>
              )}
            </div>

            <AnimatePresence mode="wait">
              {editando ? (
                <motion.div
                  key="edit"
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.15 }}
                  className="flex items-center gap-2 mt-1.5"
                >
                  <input
                    type="tel"
                    value={inputTel}
                    onChange={e => setInputTel(e.target.value)}
                    onKeyDown={e => { if (e.key === "Enter") salvarTelefone(); if (e.key === "Escape") setEditando(false); }}
                    placeholder="63 9 9999-9999"
                    autoFocus
                    className="flex-1 rounded-xl px-3 py-2 text-sm text-white placeholder-white/25 focus:outline-none"
                    style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(99,102,241,0.5)" }}
                  />
                  <button
                    onClick={salvarTelefone}
                    disabled={salvando}
                    className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition disabled:opacity-50"
                    style={{ background: "rgba(16,185,129,0.2)", border: "1px solid rgba(16,185,129,0.35)", color: "#6ee7b7" }}
                  >
                    {salvando
                      ? <svg className="animate-spin h-3.5 w-3.5" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                      : <FiCheck size={14} />}
                  </button>
                  <button
                    onClick={() => setEditando(false)}
                    className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition"
                    style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)", color: "#fca5a5" }}
                  >
                    <FiX size={14} />
                  </button>
                </motion.div>
              ) : (
                <motion.p
                  key="display"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-sm font-semibold mt-0.5 flex items-center gap-1.5"
                  style={{ color: telefone ? "#fff" : "rgba(255,255,255,0.3)" }}
                >
                  {telefone ? <><FiPhone size={12} className="text-indigo-400" />{telefone}</> : "Não cadastrado — clique no lápis para adicionar"}
                </motion.p>
              )}
            </AnimatePresence>
          </div>

          {isMotorista && (
            <>
              {/* Placa — editável */}
              <div className="px-5 py-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
                <div className="flex items-center justify-between gap-3 mb-0.5">
                  <div className="flex items-center gap-2">
                    <FiTruck size={14} className="text-indigo-400 shrink-0" />
                    <p className="text-xs font-medium uppercase tracking-wide" style={{ color: "rgba(255,255,255,0.35)" }}>Placa do veículo</p>
                  </div>
                  {!editandoPlaca && (
                    <button onClick={() => { setInputPlaca(placa || ""); setEditandoPlaca(true); }}
                      className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition"
                      style={{ background: "rgba(255,255,255,0.08)" }}
                      onMouseEnter={e => e.currentTarget.style.background = "rgba(99,102,241,0.2)"}
                      onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.08)"}>
                      <FiEdit2 size={12} style={{ color: "rgba(255,255,255,0.5)" }} />
                    </button>
                  )}
                </div>
                <AnimatePresence mode="wait">
                  {editandoPlaca ? (
                    <motion.div key="edit-placa" initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.15 }}
                      className="flex items-center gap-2 mt-1.5">
                      <input type="text" value={inputPlaca}
                        onChange={e => setInputPlaca(e.target.value.toUpperCase())}
                        onKeyDown={e => { if (e.key === "Enter") salvarPlaca(); if (e.key === "Escape") setEditandoPlaca(false); }}
                        placeholder="ABC-1234 ou BRA2E19" autoFocus maxLength={8}
                        className="flex-1 rounded-xl px-3 py-2 text-sm text-white placeholder-white/25 focus:outline-none font-mono tracking-widest"
                        style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(99,102,241,0.5)" }} />
                      <button onClick={salvarPlaca} disabled={salvandoPlaca}
                        className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition disabled:opacity-50"
                        style={{ background: "rgba(16,185,129,0.2)", border: "1px solid rgba(16,185,129,0.35)", color: "#6ee7b7" }}>
                        {salvandoPlaca ? <svg className="animate-spin h-3.5 w-3.5" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg> : <FiCheck size={14} />}
                      </button>
                      <button onClick={() => setEditandoPlaca(false)}
                        className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition"
                        style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)", color: "#fca5a5" }}>
                        <FiX size={14} />
                      </button>
                    </motion.div>
                  ) : (
                    <motion.p key="display-placa" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                      className="text-sm font-semibold mt-0.5 font-mono tracking-widest"
                      style={{ color: placa ? "#fff" : "rgba(255,255,255,0.3)" }}>
                      {placa ? placa.toUpperCase() : "Não cadastrada — clique no lápis"}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>

              {/* CNH — editável */}
              <div className="px-5 py-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
                <div className="flex items-center justify-between gap-3 mb-0.5">
                  <div className="flex items-center gap-2">
                    <FiCreditCard size={14} className="text-indigo-400 shrink-0" />
                    <p className="text-xs font-medium uppercase tracking-wide" style={{ color: "rgba(255,255,255,0.35)" }}>CNH</p>
                  </div>
                  {!editandoCnh && (
                    <button onClick={() => { setInputCnh(cnh || ""); setEditandoCnh(true); }}
                      className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition"
                      style={{ background: "rgba(255,255,255,0.08)" }}
                      onMouseEnter={e => e.currentTarget.style.background = "rgba(99,102,241,0.2)"}
                      onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.08)"}>
                      <FiEdit2 size={12} style={{ color: "rgba(255,255,255,0.5)" }} />
                    </button>
                  )}
                </div>
                <AnimatePresence mode="wait">
                  {editandoCnh ? (
                    <motion.div key="edit-cnh" initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.15 }}
                      className="flex items-center gap-2 mt-1.5">
                      <input type="text" value={inputCnh}
                        onChange={e => setInputCnh(e.target.value.replace(/\D/g, ""))}
                        onKeyDown={e => { if (e.key === "Enter") salvarCnh(); if (e.key === "Escape") setEditandoCnh(false); }}
                        placeholder="00000000000 (11 dígitos)" autoFocus maxLength={11}
                        className="flex-1 rounded-xl px-3 py-2 text-sm text-white placeholder-white/25 focus:outline-none font-mono tracking-widest"
                        style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(99,102,241,0.5)" }} />
                      <button onClick={salvarCnh} disabled={salvandoCnh}
                        className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition disabled:opacity-50"
                        style={{ background: "rgba(16,185,129,0.2)", border: "1px solid rgba(16,185,129,0.35)", color: "#6ee7b7" }}>
                        {salvandoCnh ? <svg className="animate-spin h-3.5 w-3.5" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg> : <FiCheck size={14} />}
                      </button>
                      <button onClick={() => setEditandoCnh(false)}
                        className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition"
                        style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)", color: "#fca5a5" }}>
                        <FiX size={14} />
                      </button>
                    </motion.div>
                  ) : (
                    <motion.p key="display-cnh" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                      className="text-sm font-semibold mt-0.5 font-mono"
                      style={{ color: cnh ? "#fff" : "rgba(255,255,255,0.3)" }}>
                      {cnh ? `***${cnh.slice(-4)}` : "Não cadastrada — clique no lápis"}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>

              {/* Bio */}
              <div className="px-5 py-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
                <div className="flex items-center justify-between gap-3 mb-1">
                  <p className="text-xs font-medium uppercase tracking-wide" style={{ color: "rgba(255,255,255,0.35)" }}>
                    Bio (visível no perfil público)
                  </p>
                  {!editandoBio && (
                    <button
                      onClick={() => { setInputBio(bio || ""); setEditandoBio(true); }}
                      className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition"
                      style={{ background: "rgba(255,255,255,0.08)" }}
                      onMouseEnter={e => e.currentTarget.style.background = "rgba(99,102,241,0.2)"}
                      onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.08)"}
                    >
                      <FiEdit2 size={12} style={{ color: "rgba(255,255,255,0.5)" }} />
                    </button>
                  )}
                </div>
                <AnimatePresence mode="wait">
                  {editandoBio ? (
                    <motion.div key="edit-bio"
                      initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.15 }}>
                      <textarea
                        value={inputBio}
                        onChange={e => setInputBio(e.target.value)}
                        onKeyDown={e => { if (e.key === "Escape") setEditandoBio(false); }}
                        placeholder="Conte um pouco sobre você e seu estilo de direção..."
                        maxLength={160}
                        rows={3}
                        autoFocus
                        className="w-full rounded-xl px-3 py-2 text-sm text-white placeholder-white/25 focus:outline-none resize-none mb-2"
                        style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(99,102,241,0.5)" }}
                      />
                      <div className="flex items-center gap-2">
                        <span className="text-xs flex-1" style={{ color: "rgba(255,255,255,0.25)" }}>
                          {inputBio.length}/160
                        </span>
                        <button onClick={salvarBio} disabled={salvandoBio}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition disabled:opacity-50"
                          style={{ background: "rgba(16,185,129,0.2)", border: "1px solid rgba(16,185,129,0.35)", color: "#6ee7b7" }}>
                          {salvandoBio
                            ? <svg className="animate-spin h-3 w-3" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                            : <FiCheck size={12} />}
                          Salvar
                        </button>
                        <button onClick={() => setEditandoBio(false)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition"
                          style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)", color: "#fca5a5" }}>
                          <FiX size={12} /> Cancelar
                        </button>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.p key="display-bio" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                      className="text-sm leading-relaxed"
                      style={{ color: bio ? "rgba(255,255,255,0.7)" : "rgba(255,255,255,0.3)" }}>
                      {bio || "Nenhuma bio — clique no lápis para adicionar"}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>
            </>
          )}

          <div className="px-5 py-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide mb-0.5" style={{ color: "rgba(255,255,255,0.35)" }}>Tipo de conta</p>
              <p className="text-sm font-semibold text-white capitalize">{usuario.tipo}</p>
            </div>
            <span
              className="text-xs font-semibold px-2.5 py-1 rounded-full"
              style={{
                background: isMotorista ? "rgba(59,130,246,0.18)" : "rgba(16,185,129,0.18)",
                color: isMotorista ? "#93c5fd" : "#6ee7b7",
                border: `1px solid ${isMotorista ? "rgba(59,130,246,0.3)" : "rgba(16,185,129,0.3)"}`,
              }}
            >
              {isMotorista ? "Motorista" : "Passageiro"}
            </span>
          </div>
        </motion.div>

        {/* Ações */}
        <div className="flex flex-col gap-3">
          {isMotorista && (
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate("/oferecer")}
              className="w-full py-3 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2 transition-all"
              style={{ background: "linear-gradient(135deg,#6366f1,#3b82f6)", boxShadow: "0 4px 16px rgba(99,102,241,0.4)" }}
            >
              <MdOutlineDirectionsCar className="text-base" />
              Oferecer nova carona
            </motion.button>
          )}

          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate("/configuracoes")}
            className="w-full py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all"
            style={GLASS}
          >
            <FiSettings className="text-indigo-400" />
            <span className="text-white">Configurações</span>
          </motion.button>

          <button
            onClick={handleLogout}
            className="w-full py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
            style={{ color: "#fca5a5", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)" }}
            onMouseEnter={e => e.currentTarget.style.background = "rgba(239,68,68,0.18)"}
            onMouseLeave={e => e.currentTarget.style.background = "rgba(239,68,68,0.1)"}
          >
            <FiLogOut />
            Sair da conta
          </button>
        </div>
      </div>
    </div>
  );
}
