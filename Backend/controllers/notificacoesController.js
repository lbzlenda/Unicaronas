const db = require("../database/db.js");

function listar(req, res, next) {
  try {
    const notificacoes = db
      .prepare("SELECT * FROM notificacoes WHERE usuario_id = ? ORDER BY criada_em DESC LIMIT 30")
      .all(req.usuario.id);
    res.json(notificacoes);
  } catch (err) {
    next(err);
  }
}

function marcarLidas(req, res, next) {
  try {
    db.prepare("UPDATE notificacoes SET lida = 1 WHERE usuario_id = ?").run(req.usuario.id);
    res.json({ mensagem: "Marcadas como lidas." });
  } catch (err) {
    next(err);
  }
}

module.exports = { listar, marcarLidas };
