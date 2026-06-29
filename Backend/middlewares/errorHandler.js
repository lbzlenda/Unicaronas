function errorHandler(err, req, res, next) {
  console.error(`[ERRO] ${req.method} ${req.path} →`, err.message);

  // Violação de UNIQUE (e-mail duplicado, reserva duplicada, etc.)
  if (err.code === "SQLITE_CONSTRAINT_UNIQUE") {
    return res.status(409).json({ mensagem: "Registro duplicado." });
  }

  const status = err.status ?? 500;
  const mensagem = err.mensagem ?? err.message ?? "Erro interno do servidor.";
  res.status(status).json({ mensagem });
}

module.exports = errorHandler;
