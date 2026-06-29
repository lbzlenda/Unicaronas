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

const CARD = {
  background: "#FFFFFF",
  border: "1px solid #E9EEF4",
  boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
};

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
    cor: "#059669",
    bg: "rgba(16,185,129,0.1)",
    border: "rgba(16,185,129,0.2)",
    titulo: "Opção econômica e rápida",
    desc: "Caronas entre R$ 4 e R$ 10. Uma alternativa acessível para o dia a dia de quem vai à faculdade.",
  },
  {
    icone: <FiShield className="text-2xl" />,
    cor: "#6366f1",
    bg: "rgba(99,102,241,0.1)",
    border: "rgba(99,102,241,0.2)",
    titulo: "Comunidade universitária",
    desc: "Motoristas e passageiros são estudantes das mesmas instituições. Mais confiança, mais segurança.",
  },
  {
    icone: <FiGlobe className="text-2xl" />,
    cor: "#0891b2",
    bg: "rgba(8,145,178,0.1)",
    border: "rgba(8,145,178,0.2)",
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
      style={{ background: "#F4F7FB" }}
    >
      <div className="relative z-10 max-w-4xl mx-auto px-4 pb-20">

        {/* ── Hero ── */}
        <motion.section {...fadeUp()} className="text-center pt-14 pb-16">
          <motion.img
            src={logo}
            alt="UniCaronas"
            className="mx-auto mb-6 drop-shadow-lg"
            style={{ width: 140, height: 140, objectFit: "contain" }}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          />
          <div className="inline-flex items-center gap-2 text-indigo-600 text-xs font-semibold px-4 py-1.5 rounded-full mb-5"
            style={{ background: "#EEF2FF", border: "1px solid rgba(99,102,241,0.2)" }}>
            <MdOutlineDirectionsCar />
            Caronas universitárias em Palmas – TO
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold mb-5 leading-tight" style={{ color: "#0F172A" }}>
            Chegar à faculdade<br />
            <span style={{
              background: "linear-gradient(135deg, #6366f1, #3b82f6, #10b981)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
            }}>
              nunca foi tão fácil
            </span>
          </h1>
          <p className="text-lg max-w-xl mx-auto leading-relaxed mb-8" style={{ color: "#64748B" }}>
            O UniCaronas conecta motoristas e passageiros universitários de Palmas.
            Mais barato que o Uber, mais confortável que o ônibus.
          </p>
          {!usuario && (
            <div className="flex items-center justify-center gap-3 flex-wrap">
              <motion.button
                whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
                onClick={() => navigate("/cadastro")}
                className="text-white font-semibold px-6 py-3 rounded-xl text-sm flex items-center gap-2"
                style={{ background: "linear-gradient(135deg,#6366f1,#3b82f6)", boxShadow: "0 4px 20px rgba(99,102,241,0.4)" }}
              >
                Criar conta grátis <FiArrowRight />
              </motion.button>
              <button
                onClick={() => navigate("/login")}
                className="text-sm font-medium px-6 py-3 rounded-xl transition-all"
                style={{ color: "#64748B", background: "#FFFFFF", border: "1px solid #E2E8F0" }}
                onMouseEnter={e => e.currentTarget.style.background = "#F8FAFC"}
                onMouseLeave={e => e.currentTarget.style.background = "#FFFFFF"}
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
              style={{ background: "rgba(59,130,246,0.1)", color: "#3b82f6", border: "1px solid rgba(59,130,246,0.2)" }}>
              Para passageiros
            </span>
            <h2 className="text-2xl font-extrabold mt-3" style={{ color: "#0F172A" }}>Como pegar uma carona</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            {PASSOS_PASSAGEIRO.map(({ icone, titulo, desc }, i) => (
              <motion.div key={i} {...fadeUp(i * 0.08)} className="rounded-2xl p-6 flex flex-col gap-3" style={CARD}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
                  style={{ background: "rgba(59,130,246,0.1)", border: "1px solid rgba(59,130,246,0.2)", color: "#3b82f6" }}>
                  {icone}
                </div>
                <div className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold"
                  style={{ background: "#EFF6FF", color: "#3b82f6" }}>
                  {i + 1}
                </div>
                <h3 className="font-bold text-sm" style={{ color: "#0F172A" }}>{titulo}</h3>
                <p className="text-sm leading-relaxed" style={{ color: "#64748B" }}>{desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* ── Como funciona: motorista ── */}
        <motion.section {...fadeUp(0.05)} className="mb-16">
          <div className="text-center mb-8">
            <span className="text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full"
              style={{ background: "#EEF2FF", color: "#6366f1", border: "1px solid rgba(99,102,241,0.2)" }}>
              Para motoristas
            </span>
            <h2 className="text-2xl font-extrabold mt-3" style={{ color: "#0F172A" }}>Como oferecer uma carona</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            {PASSOS_MOTORISTA.map(({ icone, titulo, desc }, i) => (
              <motion.div key={i} {...fadeUp(i * 0.08)} className="rounded-2xl p-6 flex flex-col gap-3" style={CARD}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
                  style={{ background: "#EEF2FF", border: "1px solid rgba(99,102,241,0.2)", color: "#6366f1" }}>
                  {icone}
                </div>
                <div className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold"
                  style={{ background: "#EEF2FF", color: "#6366f1" }}>
                  {i + 1}
                </div>
                <h3 className="font-bold text-sm" style={{ color: "#0F172A" }}>{titulo}</h3>
                <p className="text-sm leading-relaxed" style={{ color: "#64748B" }}>{desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* ── Benefícios ── */}
        <motion.section {...fadeUp(0.05)} className="mb-16">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-extrabold" style={{ color: "#0F172A" }}>Por que usar o UniCaronas?</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            {BENEFICIOS.map(({ icone, cor, bg, border, titulo, desc }, i) => (
              <motion.div key={i} {...fadeUp(i * 0.08)}
                className="rounded-2xl p-6 flex flex-col gap-4"
                style={CARD}
              >
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
                  style={{ background: bg, border: `1px solid ${border}`, color: cor }}>
                  {icone}
                </div>
                <div>
                  <h3 className="font-bold mb-1" style={{ color: "#0F172A" }}>{titulo}</h3>
                  <p className="text-sm leading-relaxed" style={{ color: "#64748B" }}>{desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* ── Instituições ── */}
        <motion.section {...fadeUp(0.05)} className="mb-16">
          <div className="rounded-2xl p-8 text-center" style={CARD}>
            <h2 className="text-xl font-extrabold mb-2" style={{ color: "#0F172A" }}>Instituições atendidas</h2>
            <p className="text-sm mb-8" style={{ color: "#64748B" }}>
              Caronas disponíveis para as principais universidades de Palmas – TO
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              {INSTITUICOES.map(({ nome, cor }) => (
                <span key={nome}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold"
                  style={{
                    background: `${cor}12`,
                    border: `1px solid ${cor}30`,
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
                background: "linear-gradient(135deg, #EEF2FF, #EFF6FF)",
                border: "1px solid rgba(99,102,241,0.15)",
              }}>
              <h2 className="text-2xl font-extrabold mb-3" style={{ color: "#0F172A" }}>Pronto para começar?</h2>
              <p className="text-sm mb-6 max-w-sm mx-auto" style={{ color: "#64748B" }}>
                Crie sua conta em menos de 1 minuto e comece a usar o UniCaronas hoje.
              </p>
              <motion.button
                whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
                onClick={() => navigate("/cadastro")}
                className="text-white font-bold px-8 py-3 rounded-xl text-sm flex items-center gap-2 mx-auto"
                style={{ background: "linear-gradient(135deg,#6366f1,#3b82f6)", boxShadow: "0 4px 24px rgba(99,102,241,0.4)" }}
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
