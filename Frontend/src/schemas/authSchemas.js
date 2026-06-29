import { z } from "zod";

// Validação do e-mail institucional (ex: @aluno.ulbra.br, @uft.edu.br)
const emailInstitucional = z
  .string()
  .email("E-mail inválido")
  .refine(
    (email) => email.endsWith(".br") && email.includes("."),
    "Use um e-mail institucional válido"
  );

export const loginSchema = z.object({
  email: emailInstitucional,
  senha: z.string().min(8, "A senha deve ter no mínimo 8 caracteres"),
});

export const cadastroSchema = z
  .object({
    nome: z.string().min(1, "Informe seu nome"),
    email: emailInstitucional,
    telefone: z
      .string()
      .min(10, "Informe o DDD + número")
      .refine(
        (v) => { const d = v.replace(/\D/g, ""); return d.length >= 10 && d.length <= 11; },
        "Número inválido — use DDD + 9 dígitos (ex: 63 9 9999-9999)"
      ),
    senha: z.string().min(8, "A senha deve ter no mínimo 8 caracteres"),
    confirmarSenha: z.string(),
    tipo: z.enum(["motorista", "passageiro"], {
      errorMap: () => ({ message: "Selecione o tipo de usuário" }),
    }),
    placa: z.string().optional(),
    cnh:   z.string().optional(),
  })
  .refine((dados) => dados.senha === dados.confirmarSenha, {
    message: "As senhas não coincidem",
    path: ["confirmarSenha"],
  })
  .refine(
    (dados) => {
      if (dados.tipo === "motorista") {
        return dados.placa && dados.placa.replace(/\s/g, "").length >= 7;
      }
      return true;
    },
    { message: "Informe a placa do veículo (ex: ABC-1234 ou BRA2E19)", path: ["placa"] }
  )
  .refine(
    (dados) => {
      if (dados.tipo === "motorista") {
        const digitos = (dados.cnh || "").replace(/\D/g, "");
        return digitos.length === 11;
      }
      return true;
    },
    { message: "Informe o número da CNH (11 dígitos)", path: ["cnh"] }
  );