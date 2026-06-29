import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { cadastroSchema } from "../schemas/authSchemas.js";
import api from "../api/axiosConfig.js";
import usePageTitle from "../hooks/usePageTitle.js";
import logo from "../assets/logo-unicaronas-removebg-preview.png";
import {
  FiAlertCircle, FiCheckCircle, FiChevronDown,
  FiArrowRight, FiTruck, FiCreditCard,
} from "react-icons/fi";

const PAGE_BG = `radial-gradient(ellipse 80% 50% at 50% -5%, rgba(99,102,241,0.08) 0%, transparent 100%), #F4F7FB`;

const INPUT_CLASS = "w-full px-4 py-3 rounded-xl text-sm focus:outline-none transition-all disabled:opacity-50";
const INPUT_STYLE = { background: "#F8FAFC", border: "1px solid #E2E8F0", color: "#0F172A" };
const onFocus = (e) => { e.target.style.borderColor = "rgba(99,102,241,0.7)"; e.target.style.background = "#FFFFFF"; };
const onBlur  = (e) => { e.target.style.borderColor = "#E2E8F0";              e.target.style.background = "#F8FAFC"; };

function FieldError({ msg }) {
  if (!msg) return null;
  return <p className="text-xs mt-1.5 flex items-center gap-1" style={{ color: "#EF4444" }}><FiAlertCircle size={11} />{msg}</p>;
}

function Label({ children }) {
  return <label className="text-xs font-semibold uppercase tracking-widest block mb-2" style={{ color: "#64748B" }}>{children}</label>;
}

function Spinner() {
  return (
    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}

function Sucesso() {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: PAGE_BG }}>
      <motion.div initial={{ scale: 0.85, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center p-10">
        <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-5"
          style={{ background: "rgba(16,185,129,0.10)", border: "2px solid rgba(16,185,129,0.3)" }}>
          <FiCheckCircle className="text-emerald-500" size={36} />
        </div>
        <h2 className="text-2xl font-extrabold mb-2" style={{ color: "#0F172A" }}>Conta criada!</h2>
        <p className="text-sm" style={{ color: "#64748B" }}>Redirecionando para o login…</p>
      </motion.div>
    </div>
  );
}

export default function Cadastro() {
  usePageTitle("Criar conta");
  const navigate = useNavigate();
  const [sucesso, setSucesso] = useState(false);

  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(cadastroSchema),
  });

  const tipo = watch("tipo");

  const onSubmit = async (dados) => {
    try {
      const { confirmarSenha, ...payload } = dados;
      await api.post("/auth/cadastro", payload);
      setSucesso(true);
      setTimeout(() => navigate("/login"), 1800);
    } catch (erro) {
      toast.error(erro.response?.data?.mensagem || "Não foi possível cadastrar. Tente novamente.");
    }
  };

  if (sucesso) return <Sucesso />;

  return (
    <div className="min-h-screen flex items-start justify-center px-4 pt-8 pb-8" style={{ background: PAGE_BG }}>
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-[440px]"
      >
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <img src={logo} alt="UniCaronas" className="w-62 h-62 object-contain" />
        </div>

        {/* Card */}
        <div style={{
          background: "#FFFFFF",
          border: "1px solid #E2E8F0",
          borderRadius: "20px",
          boxShadow: "0 4px 24px rgba(0,0,0,0.08), 0 0 0 1px rgba(0,0,0,0.04)",
        }} className="p-8">
          <h1 className="text-2xl font-extrabold mb-1" style={{ color: "#0F172A" }}>Criar conta</h1>
          <p className="text-sm mb-7" style={{ color: "#64748B" }}>Junte-se à comunidade UniCaronas</p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Label>Nome</Label>
              <input type="text" placeholder="Seu nome completo"
                disabled={isSubmitting} {...register("nome")}
                className={INPUT_CLASS} style={INPUT_STYLE} onFocus={onFocus} onBlur={onBlur} />
              <FieldError msg={errors.nome?.message} />
            </div>

            <div>
              <Label>E-mail</Label>
              <input type="email" placeholder="seu@email.com"
                disabled={isSubmitting} {...register("email")}
                className={INPUT_CLASS} style={INPUT_STYLE} onFocus={onFocus} onBlur={onBlur} />
              <FieldError msg={errors.email?.message} />
            </div>

            <div>
              <Label>Telefone (WhatsApp)</Label>
              <input type="tel" placeholder="63 9 9999-9999"
                disabled={isSubmitting} {...register("telefone")}
                className={INPUT_CLASS} style={INPUT_STYLE} onFocus={onFocus} onBlur={onBlur} />
              <FieldError msg={errors.telefone?.message} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Senha</Label>
                <input type="password" placeholder="••••••••"
                  disabled={isSubmitting} {...register("senha")}
                  className={INPUT_CLASS} style={INPUT_STYLE} onFocus={onFocus} onBlur={onBlur} />
                <FieldError msg={errors.senha?.message} />
              </div>
              <div>
                <Label>Confirmar</Label>
                <input type="password" placeholder="••••••••"
                  disabled={isSubmitting} {...register("confirmarSenha")}
                  className={INPUT_CLASS} style={INPUT_STYLE} onFocus={onFocus} onBlur={onBlur} />
                <FieldError msg={errors.confirmarSenha?.message} />
              </div>
            </div>

            <div>
              <Label>Tipo de conta</Label>
              <select {...register("tipo")} defaultValue="" disabled={isSubmitting}
                className={INPUT_CLASS + " cursor-pointer"}
                style={{ ...INPUT_STYLE, color: tipo ? "#0F172A" : "#94A3B8" }}
                onFocus={onFocus} onBlur={onBlur}>
                <option value="" disabled style={{ background: "#FFFFFF", color: "#94A3B8" }}>Selecione…</option>
                <option value="motorista" style={{ background: "#FFFFFF", color: "#0F172A" }}>Motorista</option>
                <option value="passageiro" style={{ background: "#FFFFFF", color: "#0F172A" }}>Passageiro</option>
              </select>
              <FieldError msg={errors.tipo?.message} />
            </div>

            {tipo === "motorista" && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                transition={{ duration: 0.25 }}
                className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Placa *</Label>
                    <input type="text" placeholder="ABC-1234"
                      disabled={isSubmitting} {...register("placa")}
                      className={INPUT_CLASS} style={INPUT_STYLE} onFocus={onFocus} onBlur={onBlur} />
                    <FieldError msg={errors.placa?.message} />
                  </div>
                  <div>
                    <Label>CNH *</Label>
                    <input type="text" placeholder="00000000000"
                      disabled={isSubmitting} {...register("cnh")}
                      className={INPUT_CLASS} style={INPUT_STYLE} onFocus={onFocus} onBlur={onBlur} />
                    <FieldError msg={errors.cnh?.message} />
                  </div>
                </div>
                <p className="text-xs" style={{ color: "#94A3B8" }}>Placa e CNH obrigatórias para motoristas.</p>
              </motion.div>
            )}

            <motion.button type="submit" disabled={isSubmitting}
              whileHover={{ scale: 1.015 }} whileTap={{ scale: 0.975 }}
              className="w-full py-3.5 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all mt-1"
              style={{
                background: "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)",
                boxShadow: "0 4px 20px rgba(99,102,241,0.5), inset 0 1px 0 rgba(255,255,255,0.15)",
              }}>
              {isSubmitting ? <><Spinner />Cadastrando…</> : <>Criar conta grátis <FiArrowRight size={14} /></>}
            </motion.button>
          </form>
        </div>

        <p className="text-center text-sm mt-6" style={{ color: "#64748B" }}>
          Já tem conta?{" "}
          <Link to="/login" className="font-semibold transition" style={{ color: "#6366f1" }}
            onMouseEnter={e => { e.target.style.color = "#4f46e5"; }}
            onMouseLeave={e => { e.target.style.color = "#6366f1"; }}>
            Fazer login
          </Link>
        </p>
        <p className="text-center text-xs mt-4" style={{ color: "#94A3B8" }}>
          CEULP · UFT · UniCatólica · Afya · IFTO · ITOP
        </p>
      </motion.div>
    </div>
  );
}
