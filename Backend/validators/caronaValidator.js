const { z } = require("zod");

const DESTINOS = ["CEULP/ULBRA", "UFT", "UniCatólica", "Afya", "IFTO", "ITOP"];

const caronaSchema = z.object({
  origem: z.string().min(3, "Informe a origem com pelo menos 3 caracteres"),
  destino: z.enum(DESTINOS, {
    errorMap: () => ({ message: "Destino inválido" }),
  }),
  data_saida: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Data inválida — use o formato YYYY-MM-DD")
    .optional(),
  horario_saida: z
    .string()
    .regex(/^\d{2}:\d{2}$/, "Horário deve estar no formato HH:MM"),
  valor: z
    .number({ invalid_type_error: "Informe um valor numérico" })
    .min(4, "O valor mínimo é R$ 4,00")
    .max(10, "O valor máximo é R$ 10,00"),
  vagas: z
    .number({ invalid_type_error: "Informe o número de vagas" })
    .int("Deve ser número inteiro")
    .min(1, "Mínimo de 1 vaga")
    .max(4, "Máximo de 4 vagas"),
  lat: z.number().optional().nullable(),
  lng: z.number().optional().nullable(),
});

module.exports = { caronaSchema, DESTINOS };
