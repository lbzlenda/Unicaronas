// node:sqlite — disponível nativamente no Node.js 22.5+ (sem instalação)
const { DatabaseSync } = require("node:sqlite");
const path = require("path");

const db = new DatabaseSync(path.join(__dirname, "unicaronas.db"));

// Performance e integridade referencial
db.exec("PRAGMA journal_mode = WAL");
db.exec("PRAGMA foreign_keys = ON");

db.exec(`
  CREATE TABLE IF NOT EXISTS usuarios (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    nome        TEXT    NOT NULL,
    email       TEXT    UNIQUE NOT NULL,
    senha       TEXT    NOT NULL,
    tipo        TEXT    NOT NULL CHECK(tipo IN ('motorista', 'passageiro')),
    criado_em   TEXT    DEFAULT (datetime('now'))
  )
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS caronas (
    id                  INTEGER PRIMARY KEY AUTOINCREMENT,
    motorista_id        INTEGER NOT NULL,
    origem              TEXT    NOT NULL,
    destino             TEXT    NOT NULL,
    horario_saida       TEXT    NOT NULL,
    valor               REAL    NOT NULL DEFAULT 0,
    vagas               INTEGER NOT NULL,
    vagas_disponiveis   INTEGER NOT NULL,
    criada_em           TEXT    DEFAULT (datetime('now')),
    FOREIGN KEY (motorista_id) REFERENCES usuarios(id) ON DELETE CASCADE
  )
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS reservas (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    carona_id       INTEGER NOT NULL,
    passageiro_id   INTEGER NOT NULL,
    criada_em       TEXT    DEFAULT (datetime('now')),
    FOREIGN KEY (carona_id)     REFERENCES caronas(id)  ON DELETE CASCADE,
    FOREIGN KEY (passageiro_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    UNIQUE(carona_id, passageiro_id)
  )
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS notificacoes (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    usuario_id  INTEGER NOT NULL,
    tipo        TEXT    NOT NULL,
    mensagem    TEXT    NOT NULL,
    lida        INTEGER DEFAULT 0,
    criada_em   TEXT    DEFAULT (datetime('now')),
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
  )
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS avaliacoes (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    reserva_id      INTEGER NOT NULL UNIQUE,
    avaliador_id    INTEGER NOT NULL,
    avaliado_id     INTEGER NOT NULL,
    nota            INTEGER NOT NULL CHECK(nota BETWEEN 1 AND 5),
    criada_em       TEXT    DEFAULT (datetime('now')),
    FOREIGN KEY (reserva_id)   REFERENCES reservas(id)  ON DELETE CASCADE,
    FOREIGN KEY (avaliador_id) REFERENCES usuarios(id)  ON DELETE CASCADE,
    FOREIGN KEY (avaliado_id)  REFERENCES usuarios(id)  ON DELETE CASCADE
  )
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS avaliacoes_motorista (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    reserva_id      INTEGER NOT NULL UNIQUE,
    motorista_id    INTEGER NOT NULL,
    passageiro_id   INTEGER NOT NULL,
    nota            INTEGER NOT NULL CHECK(nota BETWEEN 1 AND 5),
    criada_em       TEXT    DEFAULT (datetime('now')),
    FOREIGN KEY (reserva_id)    REFERENCES reservas(id)  ON DELETE CASCADE,
    FOREIGN KEY (motorista_id)  REFERENCES usuarios(id)  ON DELETE CASCADE,
    FOREIGN KEY (passageiro_id) REFERENCES usuarios(id)  ON DELETE CASCADE
  )
`);

// Migrações: adicionam colunas sem quebrar bancos existentes
try { db.exec("ALTER TABLE usuarios ADD COLUMN telefone TEXT"); } catch {}
try { db.exec("ALTER TABLE usuarios ADD COLUMN placa TEXT"); } catch {}
try { db.exec("ALTER TABLE usuarios ADD COLUMN cnh TEXT"); } catch {}
try { db.exec("ALTER TABLE caronas ADD COLUMN data_saida TEXT"); } catch {}
try { db.exec("ALTER TABLE caronas ADD COLUMN lat REAL"); } catch {}
try { db.exec("ALTER TABLE caronas ADD COLUMN lng REAL"); } catch {}
try { db.exec("ALTER TABLE caronas ADD COLUMN status TEXT DEFAULT 'ativa'"); } catch {}
try { db.exec("ALTER TABLE usuarios ADD COLUMN foto_perfil TEXT"); } catch {}
try { db.exec("ALTER TABLE usuarios ADD COLUMN bio TEXT"); } catch {}
try { db.exec("ALTER TABLE usuarios ADD COLUMN reset_token TEXT"); } catch {}
try { db.exec("ALTER TABLE usuarios ADD COLUMN reset_expiry TEXT"); } catch {}

db.exec(`
  CREATE TABLE IF NOT EXISTS mensagens (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    reserva_id    INTEGER NOT NULL,
    remetente_id  INTEGER NOT NULL,
    conteudo      TEXT    NOT NULL,
    criada_em     TEXT    DEFAULT (datetime('now')),
    FOREIGN KEY (reserva_id)   REFERENCES reservas(id)  ON DELETE CASCADE,
    FOREIGN KEY (remetente_id) REFERENCES usuarios(id)  ON DELETE CASCADE
  )
`);

module.exports = db;
