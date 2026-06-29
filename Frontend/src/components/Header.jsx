import { useContext, useRef, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { AuthContext } from "../contexts/AuthContext.jsx";
import { useNotificacoes } from "../hooks/useNotificacoes.js";
import logo from "../assets/logo-unicaronas-removebg-preview.png";
import { FiBell, FiLogOut, FiMenu, FiX, FiSettings } from "react-icons/fi";

const ISLAND = {
  background: "#FFFFFF",
  borderBottom: "1px solid #E2E8F0",
  boxShadow: "0 1px 8px rgba(0,0,0,0.06)",
};

function NavLink({ to, active, children, onClick }) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className="relative px-4 py-2 text-base font-medium rounded-lg transition-all duration-200"
      style={{ color: active ? "#6366f1" : "#64748B" }}
      onMouseEnter={e => {
        if (!active) {
          e.currentTarget.style.color = "#0F172A";
          e.currentTarget.style.background = "#F1F5F9";
        }
      }}
      onMouseLeave={e => {
        if (!active) {
          e.currentTarget.style.color = "#64748B";
          e.currentTarget.style.background = "transparent";
        }
      }}
    >
      {active && (
        <motion.span
          layoutId="nav-active"
          className="absolute inset-0 rounded-lg"
          style={{ background: "#EEF2FF", border: "1px solid rgba(99,102,241,0.25)" }}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
        />
      )}
      <span className="relative z-10">{children}</span>
    </Link>
  );
}

export default function Header() {
  const { usuario, logout, fotoUrl } = useContext(AuthContext);
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [menuAberto, setMenuAberto] = useState(false);
  const [sinoAberto, setSinoAberto] = useState(false);
  const sinoRef = useRef(null);

  const isMotorista = usuario?.tipo === "motorista";
  const { notificacoes, naoLidas, marcarLidas } = useNotificacoes(!!usuario && isMotorista);

  function abrirSino() {
    setSinoAberto((v) => {
      if (!v && naoLidas > 0) marcarLidas();
      return !v;
    });
  }

  function handleLogout() {
    logout();
    navigate("/login");
    setMenuAberto(false);
  }

  const navLinks = usuario
    ? isMotorista
      ? [
          { to: "/", label: "Home" },
          { to: "/sobre", label: "Sobre" },
          { to: "/oferecer", label: "Oferecer carona" },
          { to: "/minhas-caronas", label: "Minhas caronas" },
        ]
      : [
          { to: "/", label: "Home" },
          { to: "/sobre", label: "Sobre" },
          { to: "/minhas-caronas", label: "Minhas reservas" },
        ]
    : [
        { to: "/", label: "Home" },
        { to: "/sobre", label: "Sobre" },
      ];

  return (
    /* Wrapper sticky transparente — não ocupa espaço visual fora da ilha */
    <motion.header
      className="sticky top-0 z-30 pointer-events-none"
      initial={{ y: -24, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* A ilha em si */}
      <div className="w-full pointer-events-auto">
        <div className="relative px-6 flex items-center justify-between gap-4 h-20" style={ISLAND}>

          {/* Brand */}
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <motion.img
              src={logo}
              alt="UniCaronas"
              style={{ width: 68, height: 68, objectFit: "contain", filter: "drop-shadow(0 0 12px rgba(99,102,241,0.5))" }}
              whileHover={{ scale: 1.08, filter: "drop-shadow(0 0 22px rgba(99,102,241,0.8))" }}
              transition={{ type: "spring", stiffness: 300, damping: 18 }}
            />
            <span
              className="font-extrabold text-lg hidden sm:inline"
              style={{
                background: "linear-gradient(135deg, #6366f1, #3b82f6)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              UniCaronas
            </span>
          </Link>

          {/* Nav desktop */}
          <nav className="hidden sm:flex items-center gap-0.5 flex-1 ml-2">
            {navLinks.map((link) => (
              <NavLink key={link.to} to={link.to} active={pathname === link.to}>
                {link.label}
              </NavLink>
            ))}
          </nav>

          {/* Auth desktop */}
          <div className="hidden sm:flex items-center gap-2 shrink-0">
            {usuario ? (
              <>
                <Link
                  to="/perfil"
                  className="flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-200"
                  style={{ background: "#F8FAFC", border: "1px solid #E2E8F0" }}
                  onMouseEnter={e => e.currentTarget.style.background = "#F1F5F9"}
                  onMouseLeave={e => e.currentTarget.style.background = "#F8FAFC"}
                >
                  {fotoUrl ? (
                    <img
                      src={fotoUrl}
                      alt="Foto de perfil"
                      className="w-8 h-8 rounded-full object-cover shrink-0"
                      style={{ border: "2px solid rgba(99,102,241,0.5)" }}
                    />
                  ) : (
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0"
                      style={{ background: "linear-gradient(135deg,#3b82f6,#6366f1)" }}
                    >
                      {usuario.nome[0].toUpperCase()}
                    </div>
                  )}
                  <span className="text-base font-medium" style={{ color: "#0F172A" }}>
                    {usuario.nome.split(" ")[0]}
                  </span>
                </Link>

                {/* Sino de notificações — só motoristas */}
                {isMotorista && (
                  <div className="relative" ref={sinoRef}>
                    <button
                      onClick={abrirSino}
                      className="relative p-2 rounded-lg transition-all duration-200"
                      style={{ color: naoLidas > 0 ? "#fcd34d" : "#94A3B8" }}
                      onMouseEnter={e => { e.currentTarget.style.background = "#EEF2FF"; }}
                      onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
                      title="Notificações"
                    >
                      <FiBell className="text-lg" />
                      {naoLidas > 0 && (
                        <span
                          className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold text-white"
                          style={{ background: "linear-gradient(135deg,#f43f5e,#ec4899)" }}
                        >
                          {naoLidas > 9 ? "9+" : naoLidas}
                        </span>
                      )}
                    </button>

                    <AnimatePresence>
                      {sinoAberto && (
                        <>
                          {/* Overlay para fechar */}
                          <div className="fixed inset-0 z-40" onClick={() => setSinoAberto(false)} />
                          <motion.div
                            initial={{ opacity: 0, y: -8, scale: 0.97 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -8, scale: 0.97 }}
                            transition={{ duration: 0.18 }}
                            className="absolute right-0 top-full mt-2 w-80 rounded-2xl overflow-hidden z-50"
                            style={{
                              background: "#FFFFFF",
                              border: "1px solid #E2E8F0",
                              boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
                            }}
                          >
                            <div className="px-4 py-3 flex items-center justify-between"
                              style={{ borderBottom: "1px solid #E2E8F0" }}>
                              <span className="text-sm font-bold" style={{ color: "#0F172A" }}>Notificações</span>
                              <button onClick={() => setSinoAberto(false)}
                                className="transition"
                                style={{ color: "#94A3B8" }}
                                onMouseEnter={e => e.currentTarget.style.color = "#0F172A"}
                                onMouseLeave={e => e.currentTarget.style.color = "#94A3B8"}
                              >
                                <FiX size={14} />
                              </button>
                            </div>
                            <div className="max-h-72 overflow-y-auto">
                              {notificacoes.length === 0 ? (
                                <div className="py-10 text-center">
                                  <FiBell className="text-3xl mx-auto mb-2" style={{ color: "#E2E8F0" }} />
                                  <p className="text-sm" style={{ color: "#94A3B8" }}>Nenhuma notificação ainda</p>
                                </div>
                              ) : notificacoes.map((n) => (
                                <div key={n.id}
                                  className="px-4 py-3 flex items-start gap-3 transition-colors"
                                  style={{
                                    borderBottom: "1px solid #F1F5F9",
                                    background: n.lida ? "transparent" : "#F5F7FF",
                                  }}
                                >
                                  <div className="w-2 h-2 rounded-full mt-1.5 shrink-0"
                                    style={{ background: n.lida ? "#E2E8F0" : "#6366f1" }} />
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm leading-snug" style={{ color: "#0F172A" }}>{n.mensagem}</p>
                                    <p className="text-xs mt-0.5"
                                      style={{ color: "#94A3B8" }}>
                                      {new Date(n.criada_em).toLocaleString("pt-BR", {
                                        day: "2-digit", month: "2-digit",
                                        hour: "2-digit", minute: "2-digit",
                                      })}
                                    </p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </motion.div>
                        </>
                      )}
                    </AnimatePresence>
                  </div>
                )}

                <Link
                  to="/configuracoes"
                  className="p-2 rounded-lg transition-all duration-200"
                  style={{ color: "#94A3B8" }}
                  onMouseEnter={e => { e.currentTarget.style.color = "#6366f1"; e.currentTarget.style.background = "#EEF2FF"; }}
                  onMouseLeave={e => { e.currentTarget.style.color = "#94A3B8"; e.currentTarget.style.background = "transparent"; }}
                  title="Configurações"
                >
                  <FiSettings className="text-lg" />
                </Link>

                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 text-base px-3 py-2 rounded-lg transition-all duration-200"
                  style={{ color: "#94A3B8" }}
                  onMouseEnter={e => { e.currentTarget.style.color = "#EF4444"; e.currentTarget.style.background = "#FEF2F2"; }}
                  onMouseLeave={e => { e.currentTarget.style.color = "#94A3B8"; e.currentTarget.style.background = "transparent"; }}
                >
                  <FiLogOut />
                  Sair
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-base font-medium px-4 py-2 rounded-lg transition-all duration-200"
                  style={{ color: "#6366f1" }}
                  onMouseEnter={e => { e.currentTarget.style.background = "#EEF2FF"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
                >
                  Login
                </Link>

                <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
                  <Link
                    to="/cadastro"
                    className="text-base font-semibold text-white px-5 py-2 rounded-xl block transition-all"
                    style={{ background: "linear-gradient(135deg,#6366f1,#3b82f6)", boxShadow: "0 3px 14px rgba(99,102,241,0.5)" }}
                    onMouseEnter={e => e.currentTarget.style.boxShadow = "0 4px 22px rgba(99,102,241,0.75)"}
                    onMouseLeave={e => e.currentTarget.style.boxShadow = "0 3px 14px rgba(99,102,241,0.5)"}
                  >
                    Cadastre-se
                  </Link>
                </motion.div>
              </>
            )}
          </div>

          {/* Hambúrguer mobile */}
          <button
            onClick={() => setMenuAberto((v) => !v)}
            className="sm:hidden p-2 rounded-lg transition-all"
            style={{ color: "#64748B", background: "#F1F5F9" }}
          >
            {menuAberto ? <FiX className="text-lg" /> : <FiMenu className="text-lg" />}
          </button>
        </div>

        {/* Drawer mobile — aparece abaixo da ilha */}
        <AnimatePresence>
          {menuAberto && (
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.98 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="mt-2 rounded-2xl overflow-hidden"
              style={{
                background: "#FFFFFF",
                border: "1px solid #E2E8F0",
                boxShadow: "0 8px 32px rgba(0,0,0,0.10)",
              }}
            >
              <div className="px-3 py-3 space-y-0.5">
                {navLinks.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    onClick={() => setMenuAberto(false)}
                    className="block px-3 py-2.5 rounded-xl text-sm font-medium transition-all"
                    style={{
                      color: pathname === link.to ? "#6366f1" : "#374151",
                      background: pathname === link.to ? "#EEF2FF" : "transparent",
                    }}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>

              <div className="px-3 pb-3 pt-1" style={{ borderTop: "1px solid #E2E8F0" }}>
                {usuario ? (
                  <>
                    <Link
                      to="/perfil"
                      onClick={() => setMenuAberto(false)}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all mb-0.5"
                      style={{ color: "#0F172A" }}
                    >
                      {fotoUrl ? (
                        <img
                          src={fotoUrl}
                          alt="Foto de perfil"
                          className="w-8 h-8 rounded-full object-cover shrink-0"
                          style={{ border: "2px solid rgba(99,102,241,0.5)" }}
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold"
                          style={{ background: "linear-gradient(135deg,#3b82f6,#6366f1)" }}>
                          {usuario.nome[0].toUpperCase()}
                        </div>
                      )}
                      <div>
                        <p className="text-sm font-semibold" style={{ color: "#0F172A" }}>{usuario.nome.split(" ")[0]}</p>
                        <p className="text-xs" style={{ color: "#94A3B8" }}>Ver perfil</p>
                      </div>
                    </Link>
                    <Link
                      to="/configuracoes"
                      onClick={() => setMenuAberto(false)}
                      className="flex items-center gap-2 w-full px-3 py-2.5 rounded-xl text-sm font-medium transition-all"
                      style={{ color: "#64748B" }}
                    >
                      <FiSettings /> Configurações
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2 w-full px-3 py-2.5 rounded-xl text-sm font-medium transition-all"
                      style={{ color: "#94A3B8" }}
                      onMouseEnter={e => e.currentTarget.style.color = "#EF4444"}
                      onMouseLeave={e => e.currentTarget.style.color = "#94A3B8"}
                    >
                      <FiLogOut /> Sair
                    </button>
                  </>
                ) : (
                  <div className="flex flex-col gap-2 pt-1">
                    <Link
                      to="/login"
                      onClick={() => setMenuAberto(false)}
                      className="text-center text-sm font-medium py-2.5 rounded-xl transition-all"
                      style={{ color: "#6366f1", background: "#EEF2FF" }}
                    >
                      Login
                    </Link>
                    <Link
                      to="/cadastro"
                      onClick={() => setMenuAberto(false)}
                      className="text-center text-sm font-semibold text-white py-2.5 rounded-xl"
                      style={{ background: "linear-gradient(135deg,#6366f1,#3b82f6)", boxShadow: "0 4px 16px rgba(99,102,241,0.4)" }}
                    >
                      Cadastre-se
                    </Link>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.header>
  );
}
