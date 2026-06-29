import { useContext, useRef, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { AuthContext } from "../contexts/AuthContext.jsx";
import { useNotificacoes } from "../hooks/useNotificacoes.js";
import logo from "../assets/logo-unicaronas-removebg-preview.png";
import { FiBell, FiLogOut, FiMenu, FiX, FiSettings } from "react-icons/fi";

const ISLAND = {
  background: "rgba(5, 10, 30, 0.85)",
  backdropFilter: "blur(28px)",
  WebkitBackdropFilter: "blur(28px)",
  border: "1px solid rgba(255,255,255,0.07)",
  borderTop: "1px solid rgba(99,102,241,0.15)",
  boxShadow: "0 8px 40px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.03) inset, 0 20px 60px rgba(99,102,241,0.08)",
};

function NavLink({ to, active, children, onClick }) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className="relative px-4 py-2 text-base font-medium rounded-lg transition-all duration-200"
      style={{ color: active ? "#fff" : "rgba(255,255,255,0.45)" }}
      onMouseEnter={e => {
        if (!active) {
          e.currentTarget.style.color = "rgba(255,255,255,0.9)";
          e.currentTarget.style.background = "rgba(255,255,255,0.07)";
        }
      }}
      onMouseLeave={e => {
        if (!active) {
          e.currentTarget.style.color = "rgba(255,255,255,0.45)";
          e.currentTarget.style.background = "transparent";
        }
      }}
    >
      {active && (
        <motion.span
          layoutId="nav-active"
          className="absolute inset-0 rounded-lg"
          style={{ background: "rgba(255,255,255,0.09)", border: "1px solid rgba(255,255,255,0.1)" }}
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
        <div className="relative px-6 flex items-center justify-between gap-4 h-20 rounded-b-2xl" style={ISLAND}>

          {/* Linha aurora superior */}
          <motion.div
            className="absolute top-0 left-6 right-6 h-px rounded-full pointer-events-none"
            style={{
              background: "linear-gradient(90deg, transparent, #6366f1 20%, #3b82f6 50%, #06b6d4 80%, transparent)",
            }}
            animate={{
              opacity: [0.7, 1, 0.7],
              boxShadow: [
                "0 0 6px 1px rgba(99,102,241,0.45), 0 0 14px 2px rgba(59,130,246,0.2)",
                "0 0 12px 2px rgba(99,102,241,0.75), 0 0 28px 4px rgba(6,182,212,0.35)",
                "0 0 6px 1px rgba(99,102,241,0.45), 0 0 14px 2px rgba(59,130,246,0.2)",
              ],
            }}
            transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
          />

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
                background: "linear-gradient(135deg, #60a5fa 0%, #818cf8 50%, #a78bfa 100%)",
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
                  style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.09)" }}
                  onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.11)"}
                  onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.06)"}
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
                  <span className="text-base font-medium" style={{ color: "rgba(255,255,255,0.75)" }}>
                    {usuario.nome.split(" ")[0]}
                  </span>
                </Link>

                {/* Sino de notificações — só motoristas */}
                {isMotorista && (
                  <div className="relative" ref={sinoRef}>
                    <button
                      onClick={abrirSino}
                      className="relative p-2 rounded-lg transition-all duration-200"
                      style={{ color: naoLidas > 0 ? "#fcd34d" : "rgba(255,255,255,0.35)" }}
                      onMouseEnter={e => { e.currentTarget.style.background = "rgba(99,102,241,0.1)"; }}
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
                              background: "rgba(5,10,30,0.95)",
                              backdropFilter: "blur(28px)",
                              WebkitBackdropFilter: "blur(28px)",
                              border: "1px solid rgba(255,255,255,0.1)",
                              boxShadow: "0 16px 48px rgba(0,0,0,0.7)",
                            }}
                          >
                            <div className="px-4 py-3 flex items-center justify-between"
                              style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
                              <span className="text-sm font-bold text-white">Notificações</span>
                              <button onClick={() => setSinoAberto(false)}
                                className="text-white/40 hover:text-white transition">
                                <FiX size={14} />
                              </button>
                            </div>
                            <div className="max-h-72 overflow-y-auto">
                              {notificacoes.length === 0 ? (
                                <div className="py-10 text-center">
                                  <FiBell className="text-white/15 text-3xl mx-auto mb-2" />
                                  <p className="text-sm text-white/30">Nenhuma notificação ainda</p>
                                </div>
                              ) : notificacoes.map((n) => (
                                <div key={n.id}
                                  className="px-4 py-3 flex items-start gap-3 transition-colors"
                                  style={{
                                    borderBottom: "1px solid rgba(255,255,255,0.05)",
                                    background: n.lida ? "transparent" : "rgba(99,102,241,0.06)",
                                  }}
                                >
                                  <div className="w-2 h-2 rounded-full mt-1.5 shrink-0"
                                    style={{ background: n.lida ? "rgba(255,255,255,0.15)" : "#818cf8" }} />
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm text-white/80 leading-snug">{n.mensagem}</p>
                                    <p className="text-xs mt-0.5"
                                      style={{ color: "rgba(255,255,255,0.3)" }}>
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
                  style={{ color: "rgba(255,255,255,0.35)" }}
                  onMouseEnter={e => { e.currentTarget.style.color = "#a5b4fc"; e.currentTarget.style.background = "rgba(99,102,241,0.1)"; }}
                  onMouseLeave={e => { e.currentTarget.style.color = "rgba(255,255,255,0.35)"; e.currentTarget.style.background = "transparent"; }}
                  title="Configurações"
                >
                  <FiSettings className="text-lg" />
                </Link>

                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 text-base px-3 py-2 rounded-lg transition-all duration-200"
                  style={{ color: "rgba(255,255,255,0.35)" }}
                  onMouseEnter={e => { e.currentTarget.style.color = "#fca5a5"; e.currentTarget.style.background = "rgba(239,68,68,0.1)"; }}
                  onMouseLeave={e => { e.currentTarget.style.color = "rgba(255,255,255,0.35)"; e.currentTarget.style.background = "transparent"; }}
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
                  style={{ color: "rgba(255,255,255,0.45)" }}
                  onMouseEnter={e => { e.currentTarget.style.color = "#fff"; e.currentTarget.style.background = "rgba(255,255,255,0.07)"; }}
                  onMouseLeave={e => { e.currentTarget.style.color = "rgba(255,255,255,0.45)"; e.currentTarget.style.background = "transparent"; }}
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
            style={{ color: "rgba(255,255,255,0.55)", background: "rgba(255,255,255,0.07)" }}
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
                background: "rgba(5,10,30,0.92)",
                backdropFilter: "blur(28px)",
                WebkitBackdropFilter: "blur(28px)",
                border: "1px solid rgba(255,255,255,0.1)",
                boxShadow: "0 16px 40px rgba(0,0,0,0.6)",
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
                      color: pathname === link.to ? "#fff" : "rgba(255,255,255,0.5)",
                      background: pathname === link.to ? "rgba(255,255,255,0.09)" : "transparent",
                    }}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>

              <div className="px-3 pb-3 pt-1" style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}>
                {usuario ? (
                  <>
                    <Link
                      to="/perfil"
                      onClick={() => setMenuAberto(false)}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all mb-0.5"
                      style={{ color: "rgba(255,255,255,0.75)" }}
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
                        <p className="text-sm font-semibold text-white">{usuario.nome.split(" ")[0]}</p>
                        <p className="text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>Ver perfil</p>
                      </div>
                    </Link>
                    <Link
                      to="/configuracoes"
                      onClick={() => setMenuAberto(false)}
                      className="flex items-center gap-2 w-full px-3 py-2.5 rounded-xl text-sm font-medium transition-all"
                      style={{ color: "rgba(255,255,255,0.55)" }}
                    >
                      <FiSettings /> Configurações
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2 w-full px-3 py-2.5 rounded-xl text-sm font-medium transition-all"
                      style={{ color: "#fca5a5" }}
                    >
                      <FiLogOut /> Sair
                    </button>
                  </>
                ) : (
                  <div className="flex flex-col gap-2 pt-1">
                    <Link
                      to="/login"
                      onClick={() => setMenuAberto(false)}
                      className="text-center text-sm font-medium py-2.5 rounded-xl"
                      style={{ color: "rgba(255,255,255,0.55)", background: "rgba(255,255,255,0.06)" }}
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
