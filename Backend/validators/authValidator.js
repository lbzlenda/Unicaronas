const { z } = require("zod");

const cadastroSchema = z.object({
  nome: z.string().min(1, "Informe seu nome"),
  email: z.string().email("E-mail inválido"),
  senha: z.string().min(8, "A senha deve ter no mínimo 8 caracteres"),
  tipo: z.enum(["motorista", "passageiro"], {
    errorMap: () => ({ message: "Tipo deve ser 'motorista' ou 'passageiro'" }),
  }),
  telefone: z.string().optional().nullable(),
  placa: z.string().optional().nullable(),
  cnh:   z.string().optional().nullable(),
});

const loginSchema = z.object({
  email: z.string().email("E-mail inválido"),
  senha: z.string().min(1, "Informe a senha"),
});

module.exports = { cadastroSchema, loginSchema };
