import { z } from "zod";

export const DESTINOS = [
  "CEULP/ULBRA",
  "UFT",
  "UniCatólica",
  "Afya",
  "IFTO",
  "ITOP",
];

export const caronaSchema = z.object({
  origem: z.string().min(3, "Informe a origem com pelo menos 3 caracteres"),
  destino: z.enum(DESTINOS, {
    errorMap: () => ({ message: "Selecione um destino válido" }),
  }),
  data_saida: z
    .string()
    .min(1, "Informe a data de saída")
    .refine(v => {
      const hoje = new Date(); hoje.setHours(0, 0, 0, 0);
      return new Date(v + "T00:00:00") >= hoje;
    }, "A data não pode ser no passado"),
  horario_saida: z.string().min(1, "Informe o horário de saída"),
  valor: z
    .number({ invalid_type_error: "Informe um valor numérico" })
    .min(4, "O valor mínimo é R$ 4,00")
    .max(10, "O valor máximo permitido é R$ 10,00"),
  vagas: z
    .number({ invalid_type_error: "Informe o número de vagas" })
    .int("Deve ser um número inteiro")
    .min(1, "Mínimo de 1 vaga")
    .max(4, "Máximo de 4 vagas"),
});
