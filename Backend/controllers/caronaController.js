const db = require("../database/db.js");
const { caronaSchema } = require("../validators/caronaValidator.js");

const POR_PAGINA = 12;

/* GET /api/caronas — feed público, com paginação, filtro por ?destino=, ?data=, ?pagina= */
function listarCaronas(req, res, next) {
  try {
    const { destino, motorista_id, data, pagina } = req.query;
    const paginaNum = Math.max(1, parseInt(pagina) || 1);
    const offset = (paginaNum - 1) * POR_PAGINA;

    const conditions = [
      "(c.data_saida IS NULL OR c.data_saida >= date('now', 'localtime'))",
      "(c.status IS NULL OR c.status = 'ativa')",
    ];
    const params = [];
    if (destino) { conditions.push("c.destino = ?"); params.push(destino); }
    if (motorista_id) { conditions.push("c.motorista_id = ?"); params.push(Number(motorista_id)); }
    if (data) { conditions.push("c.data_saida = ?"); params.push(data); }

    const where = `WHERE ${conditions.join(" AND ")}`;
    const { total } = db.prepare(`SELECT COUNT(*) AS total FROM caronas c ${where}`).get(...params);

    const sql = `
      SELECT c.*, u.nome AS motorista_nome, u.telefone AS motorista_telefone, u.placa AS motorista_placa, u.foto_perfil AS motorista_foto
      FROM caronas c
      JOIN usuarios u ON u.id = c.motorista_id
      ${where}
      ORDER BY c.data_saida ASC, c.horario_saida ASC
      LIMIT ? OFFSET ?
    `;

    const caronas = db.prepare(sql).all(...params, POR_PAGINA, offset);
    res.json({ caronas, total, paginas: Math.ceil(total / POR_PAGINA), pagina: paginaNum });
  } catch (err) {
    next(err);
  }
}

/* GET /api/caronas/minhas — caronas do motorista autenticado */
function minhasCaronas(req, res, next) {
  try {
    const caronas = db
      .prepare("SELECT * FROM caronas WHERE motorista_id = ? ORDER BY criada_em DESC")
      .all(req.usuario.id);
    res.json(caronas);
  } catch (err) {
    next(err);
  }
}

/* POST /api/caronas — motorista publica nova carona */
function criarCarona(req, res, next) {
  try {
    const dados = caronaSchema.parse(req.body);

    const { lastInsertRowid } = db
      .prepare(`
        INSERT INTO caronas (motorista_id, origem, destino, data_saida, horario_saida, valor, vagas, vagas_disponiveis, lat, lng)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `)
      .run(
        req.usuario.id,
        dados.origem,
        dados.destino,
        dados.data_saida ?? null,
        dados.horario_saida,
        dados.valor,
        dados.vagas,
        dados.vagas,
        dados.lat ?? null,
        dados.lng ?? null,
      );

    const carona = db
      .prepare("SELECT * FROM caronas WHERE id = ?")
      .get(Number(lastInsertRowid));

    res.status(201).json(carona);
  } catch (err) {
    if (err.name === "ZodError") {
      return res.status(400).json({ mensagem: err.errors[0].message });
    }
    next(err);
  }
}

/* DELETE /api/caronas/:id — motorista exclui a própria carona */
function excluirCarona(req, res, next) {
  try {
    const carona = db
      .prepare("SELECT * FROM caronas WHERE id = ?")
      .get(Number(req.params.id));

    if (!carona) {
      return res.status(404).json({ mensagem: "Carona não encontrada." });
    }
    if (carona.motorista_id !== req.usuario.id) {
      return res.status(403).json({ mensagem: "Você não tem permissão para excluir esta carona." });
    }

    db.prepare("DELETE FROM caronas WHERE id = ?").run(Number(req.params.id));
    res.json({ mensagem: "Carona excluída com sucesso." });
  } catch (err) {
    next(err);
  }
}

/* POST /api/caronas/:id/reservar — passageiro reserva vaga com controle de concorrência */
function reservarVaga(req, res, next) {
  try {
    const passageiroId = req.usuario.id;
    const caronaId = Number(req.params.id);

    // Transação manual para garantir atomicidade
    db.exec("BEGIN EXCLUSIVE");
    try {
      const carona = db
        .prepare("SELECT * FROM caronas WHERE id = ?")
        .get(caronaId);

      if (!carona) {
        db.exec("ROLLBACK");
        return res.status(404).json({ mensagem: "Carona não encontrada." });
      }
      if (carona.motorista_id === passageiroId) {
        db.exec("ROLLBACK");
        return res.status(400).json({ mensagem: "Você não pode reservar sua própria carona." });
      }
      if (carona.vagas_disponiveis <= 0) {
        db.exec("ROLLBACK");
        return res.status(409).json({ mensagem: "Não há vagas disponíveis nesta carona." });
      }

      const jaReservou = db
        .prepare("SELECT id FROM reservas WHERE carona_id = ? AND passageiro_id = ?")
        .get(caronaId, passageiroId);

      if (jaReservou) {
        db.exec("ROLLBACK");
        return res.status(409).json({ mensagem: "Você já reservou uma vaga nesta carona." });
      }

      db.prepare(
        "UPDATE caronas SET vagas_disponiveis = vagas_disponiveis - 1 WHERE id = ?"
      ).run(caronaId);

      const { lastInsertRowid } = db
        .prepare("INSERT INTO reservas (carona_id, passageiro_id) VALUES (?, ?)")
        .run(caronaId, passageiroId);

      db.exec("COMMIT");

      // Notifica o motorista
      try {
        const passageiro = db.prepare("SELECT nome FROM usuarios WHERE id = ?").get(passageiroId);
        const primeiroNome = passageiro?.nome?.split(" ")[0] ?? "Um passageiro";
        db.prepare("INSERT INTO notificacoes (usuario_id, tipo, mensagem) VALUES (?, ?, ?)")
          .run(
            carona.motorista_id,
            "nova_reserva",
            `${primeiroNome} reservou uma vaga: ${carona.origem} → ${carona.destino}`
          );
      } catch {}

      res.status(201).json({ mensagem: "Vaga reservada com sucesso!", id: Number(lastInsertRowid) });
    } catch (innerErr) {
      db.exec("ROLLBACK");
      throw innerErr;
    }
  } catch (err) {
    if (err.code === "SQLITE_CONSTRAINT_UNIQUE") {
      return res.status(409).json({ mensagem: "Você já reservou uma vaga nesta carona." });
    }
    next(err);
  }
}

/* PATCH /api/caronas/:id/status — motorista atualiza status da própria carona */
function atualizarStatus(req, res, next) {
  try {
    const { status } = req.body;
    const VALIDOS = ["ativa", "em_andamento", "concluida"];
    if (!VALIDOS.includes(status)) {
      return res.status(400).json({ mensagem: "Status inválido." });
    }

    const carona = db.prepare("SELECT * FROM caronas WHERE id = ?").get(Number(req.params.id));
    if (!carona) return res.status(404).json({ mensagem: "Carona não encontrada." });
    if (carona.motorista_id !== req.usuario.id) {
      return res.status(403).json({ mensagem: "Sem permissão para alterar esta carona." });
    }

    db.prepare("UPDATE caronas SET status = ? WHERE id = ?").run(status, Number(req.params.id));

    // Notifica os passageiros sobre a mudança de status
    try {
      const mensagens = {
        em_andamento: `Sua carona ${carona.origem} → ${carona.destino} está a caminho!`,
        concluida: `Sua carona ${carona.origem} → ${carona.destino} foi concluída.`,
        ativa: `Sua carona ${carona.origem} → ${carona.destino} foi reativada.`,
      };
      const mensagem = mensagens[status];
      if (mensagem) {
        const passageiros = db
          .prepare("SELECT passageiro_id FROM reservas WHERE carona_id = ?")
          .all(Number(req.params.id));
        const insertNotif = db.prepare(
          "INSERT INTO notificacoes (usuario_id, tipo, mensagem) VALUES (?, ?, ?)"
        );
        for (const { passageiro_id } of passageiros) {
          insertNotif.run(passageiro_id, "status_carona", mensagem);
        }
      }
    } catch {}

    res.json({ mensagem: "Status atualizado.", status });
  } catch (err) {
    next(err);
  }
}

/* GET /api/caronas/:id/passageiros — motorista vê quem reservou sua carona */
function passageirosDaCarona(req, res, next) {
  try {
    const caronaId = Number(req.params.id);
    const carona = db.prepare("SELECT motorista_id FROM caronas WHERE id = ?").get(caronaId);
    if (!carona) return res.status(404).json({ mensagem: "Carona não encontrada." });
    if (carona.motorista_id !== req.usuario.id) {
      return res.status(403).json({ mensagem: "Sem permissão." });
    }
    const passageiros = db.prepare(`
      SELECT r.id AS reserva_id, u.id, u.nome, u.telefone, u.foto_perfil
      FROM reservas r
      JOIN usuarios u ON u.id = r.passageiro_id
      WHERE r.carona_id = ?
      ORDER BY r.criada_em ASC
    `).all(caronaId);
    res.json(passageiros);
  } catch (err) {
    next(err);
  }
}

module.exports = { listarCaronas, minhasCaronas, criarCarona, excluirCarona, reservarVaga, atualizarStatus, passageirosDaCarona };
