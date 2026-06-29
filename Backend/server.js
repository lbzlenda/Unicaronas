const express = require("express");
const cors = require("cors");

const authRoutes          = require("./routes/auth.js");
const caronasRoutes       = require("./routes/caronas.js");
const reservasRoutes      = require("./routes/reservas.js");
const avaliacoesRoutes    = require("./routes/avaliacoes.js");
const notificacoesRoutes  = require("./routes/notificacoes.js");
const errorHandler        = require("./middlewares/errorHandler.js");

const app  = express();
const PORT = process.env.PORT || 3001;

// ── Middlewares globais ──────────────────────────────────────
app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json());

// ── Rotas ────────────────────────────────────────────────────
app.use("/api/auth",       authRoutes);
app.use("/api/caronas",   caronasRoutes);
app.use("/api/reservas",  reservasRoutes);
app.use("/api/avaliacoes",    avaliacoesRoutes);
app.use("/api/notificacoes", notificacoesRoutes);

// Rota raiz — health check
app.get("/", (_, res) => res.json({ ok: true, projeto: "UniCaronas API" }));

// ── Tratamento centralizado de erros ─────────────────────────
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`✓  UniCaronas API rodando em http://localhost:${PORT}`);
});
