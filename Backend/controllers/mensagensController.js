const db = require("../database/db.js");

function _autorizado(reservaId, usuarioId) {
  const reserva = db.prepare(`
    SELECT r.passageiro_id, c.motorista_id FROM reservas r
    JOIN caronas c ON c.id = r.carona_id
    WHERE r.id = ?
  `).get(reservaId);
  if (!reserva) return null;
  if (reserva.passageiro_id !== usuarioId && reserva.motorista_id !== usuarioId) return null;
  return reserva;
}

function enviar(req, res, next) {
  try {
    const { reserva_id, conteudo } = req.body;
    if (!reserva_id || !conteudo?.trim()) {
      return res.status(400).json({ mensagem: "reserva_id e conteudo são obrigatórios." });
    }
    if (!_autorizado(Number(reserva_id), req.usuario.id)) {
      return res.status(403).json({ mensagem: "Sem permissão para esta conversa." });
    }
    db.prepare("INSERT INTO mensagens (reserva_id, remetente_id, conteudo) VALUES (?, ?, ?)")
      .run(Number(reserva_id), req.usuario.id, conteudo.trim());
    res.status(201).json({ mensagem: "Mensagem enviada." });
  } catch (err) {
    next(err);
  }
}

function listar(req, res, next) {
  try {
    const reservaId = Number(req.params.reserva_id);
    if (!_autorizado(reservaId, req.usuario.id)) {
      return res.status(403).json({ mensagem: "Sem permissão para esta conversa." });
    }
    const msgs = db.prepare(`
      SELECT m.id, m.reserva_id, m.remetente_id, m.conteudo, m.criada_em,
             u.nome AS remetente_nome, u.foto_perfil AS remetente_foto
      FROM mensagens m
      JOIN usuarios u ON u.id = m.remetente_id
      WHERE m.reserva_id = ?
      ORDER BY m.criada_em ASC
    `).all(reservaId);
    res.json(msgs);
  } catch (err) {
    next(err);
  }
}

module.exports = { enviar, listar };
