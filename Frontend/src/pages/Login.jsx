import { useContext } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { loginSchema } from "../schemas/authSchemas.js";
import { AuthContext } from "../contexts/AuthContext.jsx";
import api from "../api/axiosConfig.js";
import usePageTitle from "../hooks/usePageTitle.js";
import logo from "../assets/logo-unicaronas-removebg-preview.png";
import { FiArrowRight, FiAlertCircle } from "react-icons/fi";

function Spinner() {
  return (
    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}

export default function Login() {
  usePageTitle("Login");
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (dados) => {
    try {
      const { data } = await api.post("/auth/login", dados);
      login(data.usuario);
      navigate("/");
    } catch (erro) {
      toast.error(erro.response?.data?.mensagem || "E-mail ou senha inválidos.");
    }
  };

  return (
    <div className="min-h-screen flex items-start justify-center px-4 pt-8" style={{
      background: `
        radial-gradient(ellipse 80% 50% at 50% -5%, rgba(99,102,241,0.35) 0%, transparent 100%),
        radial-gradient(ellipse 50% 40% at 100% 100%, rgba(59,130,246,0.15) 0%, transparent 100%),
        #030712
      `
    }}>
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-[400px]"
      >
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="relative">
            <div className="absolute inset-0 rounded-full blur-2xl opacity-60"
              style={{ background: "radial-gradient(circle, #6366f1, transparent 70%)", transform: "scale(1.8)" }} />
            <img src={logo} alt="UniCaronas" className="relative w-62 h-62 object-contain" />
          </div>
        </div>

        {/* Card */}
        <div style={{
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: "20px",
          boxShadow: "0 0 0 1px rgba(255,255,255,0.03), 0 24px 64px rgba(0,0,0,0.6)",
        }} className="p-8">
          <h1 className="text-2xl font-extrabold text-white mb-1">Bem-vindo de volta</h1>
          <p className="text-white/35 text-sm mb-7">Entre na sua conta para continuar</p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="text-xs font-semibold text-white/40 uppercase tracking-widest block mb-2">E-mail</label>
              <input type="email" placeholder="seu@email.com"
                disabled={isSubmitting} {...register("email")}
                className="w-full px-4 py-3.5 rounded-xl text-sm text-white placeholder-white/20 focus:outline-none transition-all disabled:opacity-50"
                style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}
                onFocus={e => { e.target.style.borderColor = "rgba(99,102,241,0.8)"; e.target.style.background = "rgba(255,255,255,0.09)"; }}
                onBlur={e => { e.target.style.borderColor = "rgba(255,255,255,0.1)"; e.target.style.background = "rgba(255,255,255,0.06)"; }}
              />
              {errors.email && (
                <p className="text-red-400 text-xs mt-1.5 flex items-center gap-1">
                  <FiAlertCircle size={11} />{errors.email.message}
                </p>
              )}
            </div>

            <div>
              <label className="text-xs font-semibold text-white/40 uppercase tracking-widest block mb-2">Senha</label>
              <input type="password" placeholder="••••••••"
                disabled={isSubmitting} {...register("senha")}
                className="w-full px-4 py-3.5 rounded-xl text-sm text-white placeholder-white/20 focus:outline-none transition-all disabled:opacity-50"
                style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}
                onFocus={e => { e.target.style.borderColor = "rgba(99,102,241,0.8)"; e.target.style.background = "rgba(255,255,255,0.09)"; }}
                onBlur={e => { e.target.style.borderColor = "rgba(255,255,255,0.1)"; e.target.style.background = "rgba(255,255,255,0.06)"; }}
              />
              {errors.senha && (
                <p className="text-red-400 text-xs mt-1.5 flex items-center gap-1">
                  <FiAlertCircle size={11} />{errors.senha.message}
                </p>
              )}
            </div>

            <motion.button type="submit" disabled={isSubmitting}
              whileHover={{ scale: 1.015 }} whileTap={{ scale: 0.975 }}
              className="w-full py-3.5 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              style={{
                background: "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)",
                boxShadow: "0 4px 20px rgba(99,102,241,0.5), inset 0 1px 0 rgba(255,255,255,0.15)",
              }}>
              {isSubmitting ? <><Spinner />Entrando…</> : <>Entrar <FiArrowRight size={14} /></>}
            </motion.button>
          </form>
        </div>

        <p className="text-center text-white/30 text-sm mt-6">
          Não tem conta?{" "}
          <Link to="/cadastro" className="text-indigo-400 font-semibold hover:text-indigo-300 transition">
            Cadastre-se grátis
          </Link>
        </p>
        <p className="text-center text-white/20 text-sm mt-3">
          <Link to="/esqueci-senha" className="hover:text-white/40 transition">
            Esqueceu sua senha?
          </Link>
        </p>
        <p className="text-center text-white/20 text-xs mt-4">
          CEULP · UFT · UniCatólica · Afya · IFTO · ITOP
        </p>
      </motion.div>
    </div>
  );
}
