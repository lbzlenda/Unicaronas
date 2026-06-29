const db = require("../database/db.js");

/* POST /api/avaliacoes — passageiro avalia o motorista após a carona */
function avaliar(req, res, next) {
  try {
    const { reserva_id, nota } = req.body;

    if (!reserva_id || !nota || nota < 1 || nota > 5) {
      return res.status(400).json({ mensagem: "Nota deve ser entre 1 e 5." });
    }

    const reserva = db
      .prepare(`
        SELECT r.*, c.motorista_id, c.data_saida
        FROM reservas r
        JOIN caronas c ON c.id = r.carona_id
        WHERE r.id = ? AND r.passageiro_id = ?
      `)
      .get(reserva_id, req.usuario.id);

    if (!reserva) {
      return res.status(404).json({ mensagem: "Reserva não encontrada." });
    }

    const hoje = new Date().toISOString().split("T")[0];
    if (reserva.data_saida && reserva.data_saida >= hoje) {
      return res.status(400).json({ mensagem: "Só é possível avaliar caronas já realizadas." });
    }

    db.prepare(`
      INSERT INTO avaliacoes (reserva_id, avaliador_id, avaliado_id, nota)
      VALUES (?, ?, ?, ?)
      ON CONFLICT(reserva_id) DO UPDATE SET nota = excluded.nota, criada_em = datetime('now')
    `).run(reserva_id, req.usuario.id, reserva.motorista_id, nota);

    res.json({ mensagem: "Avaliação registrada com sucesso." });
  } catch (err) {
    next(err);
  }
}

/* GET /api/avaliacoes/media/:motorista_id — média pública de um motorista */
function mediaAvaliacao(req, res, next) {
  try {
    const { motorista_id } = req.params;
    const row = db
      .prepare(`
        SELECT COUNT(*) AS total, ROUND(AVG(nota), 1) AS media
        FROM avaliacoes
        WHERE avaliado_id = ?
      `)
      .get(motorista_id);

    res.json({ media: row.media ?? null, total: row.total ?? 0 });
  } catch (err) {
    next(err);
  }
}

/* GET /api/avaliacoes/minhas — mapa {reserva_id: nota} das avaliações do passageiro */
function minhasAvaliacoes(req, res, next) {
  try {
    const rows = db
      .prepare("SELECT reserva_id, nota FROM avaliacoes WHERE avaliador_id = ?")
      .all(req.usuario.id);

    const mapa = {};
    rows.forEach(({ reserva_id, nota }) => { mapa[reserva_id] = nota; });
    res.json(mapa);
  } catch (err) {
    next(err);
  }
}

module.exports = { avaliar, mediaAvaliacao, minhasAvaliacoes };
