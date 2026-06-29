import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../contexts/AuthContext.jsx";
import usePageTitle from "../hooks/usePageTitle.js";
import logo from "../assets/logo-unicaronas-removebg-preview.png";
import {
  FiMapPin, FiSearch, FiCheckCircle, FiDollarSign,
  FiUsers, FiShield, FiGlobe, FiArrowRight,
} from "react-icons/fi";
import { MdOutlineDirectionsCar } from "react-icons/md";

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

const PASSOS_PASSAGEIRO = [
  { icone: <FiSearch />, titulo: "Procure uma carona", desc: "Veja todas as caronas disponíveis para a sua faculdade em tempo real." },
  { icone: <FiCheckCircle />, titulo: "Reserve sua vaga", desc: "Com um clique, sua vaga fica reservada. Sem burocracia." },
  { icone: <MdOutlineDirectionsCar />, titulo: "Vá à faculdade", desc: "Combine os detalhes com o motorista pelo WhatsApp e aproveite a carona." },
];

const PASSOS_MOTORISTA = [
  { icone: <FiMapPin />, titulo: "Cadastre sua carona", desc: "Informe origem, destino, horário e quantas vagas você tem disponíveis." },
  { icone: <FiUsers />, titulo: "Receba passageiros", desc: "Passageiros reservam vagas diretamente no app. Você vê em Minhas Caronas." },
  { icone: <FiDollarSign />, titulo: "Economize e ajude", desc: "Divida os custos do combustível e ajude colegas a chegarem à faculdade." },
];

const BENEFICIOS = [
  {
    icone: <FiDollarSign className="text-2xl" />,
    cor: ["#10b981", "#14b8a6"],
    bg: "rgba(16,185,129,0.15)",
    border: "rgba(16,185,129,0.3)",
    titulo: "Opção econômica e rápida",
    desc: "Caronas entre R$ 4 e R$ 10. Uma alternativa acessível para o dia a dia de quem vai à faculdade.",
  },
  {
    icone: <FiShield className="text-2xl" />,
    cor: ["#6366f1", "#3b82f6"],
    bg: "rgba(99,102,241,0.15)",
    border: "rgba(99,102,241,0.3)",
    titulo: "Comunidade universitária",
    desc: "Motoristas e passageiros são estudantes das mesmas instituições. Mais confiança, mais segurança.",
  },
  {
    icone: <FiGlobe className="text-2xl" />,
    cor: ["#10b981", "#06b6d4"],
    bg: "rgba(16,185,129,0.15)",
    border: "rgba(16,185,129,0.3)",
    titulo: "Bem para a cidade",
    desc: "Compartilhar caronas reduz o número de carros no trânsito e contribui para uma Palmas mais sustentável.",
  },
];

const INSTITUICOES = [
  { nome: "CEULP/ULBRA", cor: "#3b82f6" },
  { nome: "UFT",          cor: "#10b981" },
  { nome: "UniCatólica",  cor: "#a855f7" },
  { nome: "Afya",         cor: "#14b8a6" },
  { nome: "IFTO",         cor: "#f97316" },
  { nome: "ITOP",         cor: "#f43f5e" },
];

function fadeUp(delay = 0) {
  return { initial: { opacity: 0, y: 20 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true }, transition: { duration: 0.5, delay } };
}

export default function Sobre() {
  usePageTitle("Sobre");
  const { usuario } = useContext(AuthContext);
  const navigate = useNavigate();

  return (
    <div
      className="min-h-screen relative overflow-x-hidden"
      style={{ background: "linear-gradient(135deg, #020817 0%, #0f172a 40%, #1e1b4b 100%)" }}
    >
      <Blob className="w-[700px] h-[700px] -top-64 -left-48 opacity-20"
        style={{ background: "radial-gradient(circle, #6366f1, transparent 70%)" }}
        animate={{ x: [0, 60, 0], y: [0, 50, 0], scale: [1, 1.1, 1] }} />
      <Blob className="w-[500px] h-[500px] -bottom-48 -right-32 opacity-15"
        style={{ background: "radial-gradient(circle, #3b82f6, transparent 70%)" }}
        animate={{ x: [0, -50, 0], y: [0, -40, 0] }} />
      <Blob className="w-96 h-96 opacity-10"
        style={{ background: "radial-gradient(circle, #06b6d4, transparent 70%)", top: "45%", right: "5%" }}
        animate={{ x: [0, -30, 10, 0], y: [0, 40, -20, 0] }} />

      <div className="relative z-10 max-w-4xl mx-auto px-4 pb-20">

        {/* ── Hero ── */}
        <motion.section {...fadeUp()} className="text-center pt-14 pb-16">
          <motion.img
            src={logo}
            alt="UniCaronas"
            className="mx-auto mb-6 drop-shadow-2xl"
            style={{ width: 140, height: 140, objectFit: "contain" }}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          />
          <div className="inline-flex items-center gap-2 text-indigo-300 text-xs font-semibold px-4 py-1.5 rounded-full mb-5"
            style={{ background: "rgba(99,102,241,0.15)", border: "1px solid rgba(99,102,241,0.3)" }}>
            <MdOutlineDirectionsCar />
            Caronas universitárias em Palmas – TO
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-5 leading-tight">
            Chegar à faculdade<br />
            <span style={{
              background: "linear-gradient(135deg, #60a5fa, #818cf8, #a78bfa)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
            }}>
              nunca foi tão fácil
            </span>
          </h1>
          <p className="text-white/50 text-lg max-w-xl mx-auto leading-relaxed mb-8">
            O UniCaronas conecta motoristas e passageiros universitários de Palmas.
            Mais barato que o Uber, mais confortável que o ônibus.
          </p>
          {!usuario && (
            <div className="flex items-center justify-center gap-3 flex-wrap">
              <motion.button
                whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
                onClick={() => navigate("/cadastro")}
                className="text-white font-semibold px-6 py-3 rounded-xl text-sm flex items-center gap-2"
                style={{ background: "linear-gradient(135deg,#6366f1,#3b82f6)", boxShadow: "0 4px 20px rgba(99,102,241,0.5)" }}
              >
                Criar conta grátis <FiArrowRight />
              </motion.button>
              <button
                onClick={() => navigate("/login")}
                className="text-sm font-medium px-6 py-3 rounded-xl transition-all"
                style={{ color: "rgba(255,255,255,0.55)", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}
              >
                Já tenho conta
              </button>
            </div>
          )}
        </motion.section>

        {/* ── Como funciona: passageiro ── */}
        <motion.section {...fadeUp(0.05)} className="mb-16">
          <div className="text-center mb-8">
            <span className="text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full"
              style={{ background: "rgba(59,130,246,0.15)", color: "#93c5fd", border: "1px solid rgba(59,130,246,0.3)" }}>
              Para passageiros
            </span>
            <h2 className="text-2xl font-extrabold text-white mt-3">Como pegar uma carona</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            {PASSOS_PASSAGEIRO.map(({ icone, titulo, desc }, i) => (
              <motion.div key={i} {...fadeUp(i * 0.08)} className="rounded-2xl p-6 flex flex-col gap-3" style={GLASS}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
                  style={{ background: "rgba(59,130,246,0.2)", border: "1px solid rgba(59,130,246,0.3)", color: "#93c5fd" }}>
                  {icone}
                </div>
                <div className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold"
                  style={{ background: "rgba(59,130,246,0.25)", color: "#93c5fd" }}>
                  {i + 1}
                </div>
                <h3 className="font-bold text-white text-sm">{titulo}</h3>
                <p className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.45)" }}>{desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* ── Como funciona: motorista ── */}
        <motion.section {...fadeUp(0.05)} className="mb-16">
          <div className="text-center mb-8">
            <span className="text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full"
              style={{ background: "rgba(99,102,241,0.15)", color: "#a5b4fc", border: "1px solid rgba(99,102,241,0.3)" }}>
              Para motoristas
            </span>
            <h2 className="text-2xl font-extrabold text-white mt-3">Como oferecer uma carona</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            {PASSOS_MOTORISTA.map(({ icone, titulo, desc }, i) => (
              <motion.div key={i} {...fadeUp(i * 0.08)} className="rounded-2xl p-6 flex flex-col gap-3" style={GLASS}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
                  style={{ background: "rgba(99,102,241,0.2)", border: "1px solid rgba(99,102,241,0.3)", color: "#a5b4fc" }}>
                  {icone}
                </div>
                <div className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold"
                  style={{ background: "rgba(99,102,241,0.25)", color: "#a5b4fc" }}>
                  {i + 1}
                </div>
                <h3 className="font-bold text-white text-sm">{titulo}</h3>
                <p className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.45)" }}>{desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* ── Benefícios ── */}
        <motion.section {...fadeUp(0.05)} className="mb-16">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-extrabold text-white">Por que usar o UniCaronas?</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            {BENEFICIOS.map(({ icone, cor, bg, border, titulo, desc }, i) => (
              <motion.div key={i} {...fadeUp(i * 0.08)}
                className="rounded-2xl p-6 flex flex-col gap-4"
                style={{ ...GLASS, background: bg.replace("0.15", "0.07") }}
              >
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
                  style={{ background: bg, border: `1px solid ${border}`, color: cor[0] }}>
                  {icone}
                </div>
                <div>
                  <h3 className="font-bold text-white mb-1">{titulo}</h3>
                  <p className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.45)" }}>{desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* ── Instituições ── */}
        <motion.section {...fadeUp(0.05)} className="mb-16">
          <div className="rounded-2xl p-8 text-center" style={GLASS}>
            <h2 className="text-xl font-extrabold text-white mb-2">Instituições atendidas</h2>
            <p className="text-sm mb-8" style={{ color: "rgba(255,255,255,0.4)" }}>
              Caronas disponíveis para as principais universidades de Palmas – TO
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              {INSTITUICOES.map(({ nome, cor }) => (
                <span key={nome}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold"
                  style={{
                    background: `${cor}18`,
                    border: `1px solid ${cor}44`,
                    color: cor,
                  }}
                >
                  <span className="w-2 h-2 rounded-full" style={{ background: cor }} />
                  {nome}
                </span>
              ))}
            </div>
          </div>
        </motion.section>

        {/* ── CTA final ── */}
        {!usuario && (
          <motion.section {...fadeUp(0.05)}>
            <div className="rounded-2xl p-10 text-center"
              style={{
                background: "linear-gradient(135deg, rgba(99,102,241,0.15), rgba(59,130,246,0.1))",
                border: "1px solid rgba(99,102,241,0.25)",
                backdropFilter: "blur(20px)",
              }}>
              <h2 className="text-2xl font-extrabold text-white mb-3">Pronto para começar?</h2>
              <p className="text-white/50 text-sm mb-6 max-w-sm mx-auto">
                Crie sua conta em menos de 1 minuto e comece a usar o UniCaronas hoje.
              </p>
              <motion.button
                whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
                onClick={() => navigate("/cadastro")}
                className="text-white font-bold px-8 py-3 rounded-xl text-sm flex items-center gap-2 mx-auto"
                style={{ background: "linear-gradient(135deg,#6366f1,#3b82f6)", boxShadow: "0 4px 24px rgba(99,102,241,0.5)" }}
              >
                Criar conta grátis <FiArrowRight />
              </motion.button>
            </div>
          </motion.section>
        )}

      </div>
    </div>
  );
}
