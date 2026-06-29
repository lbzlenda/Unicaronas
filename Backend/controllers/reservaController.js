const db = require("../database/db.js");

/* GET /api/reservas/minhas — reservas do passageiro autenticado */
function minhasReservas(req, res, next) {
  try {
    const rows = db
      .prepare(`
        SELECT
          r.id,
          r.criada_em,
          c.id              AS carona_id,
          c.origem,
          c.destino,
          c.data_saida,
          c.horario_saida,
          c.valor,
          c.vagas,
          c.vagas_disponiveis,
          u.nome            AS motorista_nome,
          u.telefone        AS motorista_telefone
        FROM reservas r
        JOIN caronas c ON c.id = r.carona_id
        JOIN usuarios u ON u.id = c.motorista_id
        WHERE r.passageiro_id = ?
        ORDER BY r.criada_em DESC
      `)
      .all(req.usuario.id);

    const reservas = rows.map(({
      carona_id, origem, destino, data_saida, horario_saida, valor, vagas, vagas_disponiveis,
      motorista_nome, motorista_telefone, ...r
    }) => ({
      ...r,
      carona: { id: carona_id, origem, destino, data_saida, horario_saida, valor, vagas, vagas_disponiveis, motorista_nome, motorista_telefone },
    }));

    res.json(reservas);
  } catch (err) {
    next(err);
  }
}

/* DELETE /api/reservas/:id — passageiro cancela sua reserva */
function cancelarReserva(req, res, next) {
  try {
    const { id } = req.params;

    const reserva = db
      .prepare("SELECT * FROM reservas WHERE id = ? AND passageiro_id = ?")
      .get(id, req.usuario.id);

    if (!reserva) {
      return res.status(404).json({ mensagem: "Reserva não encontrada." });
    }

    db.prepare("DELETE FROM reservas WHERE id = ?").run(id);
    db.prepare("UPDATE caronas SET vagas_disponiveis = vagas_disponiveis + 1 WHERE id = ?")
      .run(reserva.carona_id);

    res.json({ mensagem: "Reserva cancelada com sucesso." });
  } catch (err) {
    next(err);
  }
}

module.exports = { minhasReservas, cancelarReserva };
