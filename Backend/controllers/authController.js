const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../database/db.js");
const { cadastroSchema, loginSchema } = require("../validators/authValidator.js");
const { JWT_SECRET } = require("../middlewares/auth.js");

async function cadastro(req, res, next) {
  try {
    const dados = cadastroSchema.parse(req.body);

    const emailEmUso = db
      .prepare("SELECT id FROM usuarios WHERE email = ?")
      .get(dados.email);

    if (emailEmUso) {
      return res.status(409).json({ mensagem: "Este e-mail já está cadastrado." });
    }

    const senhaHash = await bcrypt.hash(dados.senha, 10);

    if (dados.tipo === "motorista" && !dados.placa?.trim()) {
      return res.status(400).json({ mensagem: "Motoristas devem informar a placa do veículo." });
    }
    if (dados.tipo === "motorista" && !dados.cnh?.replace(/\D/g, "")) {
      return res.status(400).json({ mensagem: "Motoristas devem informar o número da CNH." });
    }

    const { lastInsertRowid } = db
      .prepare("INSERT INTO usuarios (nome, email, senha, tipo, telefone, placa, cnh) VALUES (?, ?, ?, ?, ?, ?, ?)")
      .run(dados.nome, dados.email, senhaHash, dados.tipo, dados.telefone ?? null, dados.placa ?? null, dados.cnh ?? null);

    res.status(201).json({
      mensagem: "Usuário cadastrado com sucesso.",
      id: lastInsertRowid,
    });
  } catch (err) {
    if (err.name === "ZodError") {
      return res.status(400).json({ mensagem: err.errors[0].message });
    }
    next(err);
  }
}

async function login(req, res, next) {
  try {
    const dados = loginSchema.parse(req.body);

    const usuario = db
      .prepare("SELECT * FROM usuarios WHERE email = ?")
      .get(dados.email);

    if (!usuario) {
      return res.status(401).json({ mensagem: "E-mail ou senha inválidos." });
    }

    const senhaCorreta = await bcrypt.compare(dados.senha, usuario.senha);
    if (!senhaCorreta) {
      return res.status(401).json({ mensagem: "E-mail ou senha inválidos." });
    }

    const payload = {
      id: usuario.id,
      nome: usuario.nome,
      email: usuario.email,
      tipo: usuario.tipo,
    };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });

    // O frontend armazena o objeto inteiro; o token viaja junto
    res.json({ usuario: { ...payload, token } });
  } catch (err) {
    if (err.name === "ZodError") {
      return res.status(400).json({ mensagem: err.errors[0].message });
    }
    next(err);
  }
}

async function alterarSenha(req, res, next) {
  try {
    const { senhaAtual, novaSenha } = req.body;
    if (!senhaAtual || !novaSenha) {
      return res.status(400).json({ mensagem: "Informe a senha atual e a nova senha." });
    }
    if (novaSenha.length < 8) {
      return res.status(400).json({ mensagem: "A nova senha deve ter no mínimo 8 caracteres." });
    }
    const usuario = db.prepare("SELECT * FROM usuarios WHERE id = ?").get(req.usuario.id);
    if (!usuario) return res.status(404).json({ mensagem: "Usuário não encontrado." });
    const senhaCorreta = await bcrypt.compare(senhaAtual, usuario.senha);
    if (!senhaCorreta) return res.status(401).json({ mensagem: "Senha atual incorreta." });
    const novoHash = await bcrypt.hash(novaSenha, 10);
    db.prepare("UPDATE usuarios SET senha = ? WHERE id = ?").run(novoHash, req.usuario.id);
    res.json({ mensagem: "Senha alterada com sucesso." });
  } catch (err) {
    next(err);
  }
}

async function deletarConta(req, res, next) {
  try {
    const { senha } = req.body;
    if (!senha) return res.status(400).json({ mensagem: "Informe sua senha para confirmar." });
    const usuario = db.prepare("SELECT * FROM usuarios WHERE id = ?").get(req.usuario.id);
    if (!usuario) return res.status(404).json({ mensagem: "Usuário não encontrado." });
    const senhaCorreta = await bcrypt.compare(senha, usuario.senha);
    if (!senhaCorreta) return res.status(401).json({ mensagem: "Senha incorreta." });
    db.prepare("DELETE FROM usuarios WHERE id = ?").run(req.usuario.id);
    res.json({ mensagem: "Conta excluída com sucesso." });
  } catch (err) {
    next(err);
  }
}

function meuPerfil(req, res, next) {
  try {
    const usuario = db
      .prepare("SELECT id, nome, email, tipo, telefone, placa, cnh, foto_perfil FROM usuarios WHERE id = ?")
      .get(req.usuario.id);
    if (!usuario) return res.status(404).json({ mensagem: "Usuário não encontrado." });
    res.json(usuario);
  } catch (err) {
    next(err);
  }
}

function atualizarFoto(req, res, next) {
  try {
    const { foto } = req.body;
    if (!foto || !foto.startsWith("data:image/")) {
      return res.status(400).json({ mensagem: "Foto inválida." });
    }
    if (foto.length > 2_800_000) {
      return res.status(400).json({ mensagem: "Foto muito grande. Tente uma imagem menor." });
    }
    db.prepare("UPDATE usuarios SET foto_perfil = ? WHERE id = ?").run(foto, req.usuario.id);
    res.json({ mensagem: "Foto atualizada.", foto });
  } catch (err) {
    next(err);
  }
}

function atualizarPerfil(req, res, next) {
  try {
    const { telefone, bio, placa, cnh } = req.body;

    const numeros = telefone ? String(telefone).replace(/\D/g, "") : "";
    if (telefone && (numeros.length < 10 || numeros.length > 11)) {
      return res.status(400).json({ mensagem: "Número inválido — use DDD + 9 dígitos." });
    }
    if (bio !== undefined && bio !== null && String(bio).length > 160) {
      return res.status(400).json({ mensagem: "Bio deve ter no máximo 160 caracteres." });
    }

    const usuario = db.prepare("SELECT tipo FROM usuarios WHERE id = ?").get(req.usuario.id);

    if ((placa !== undefined || cnh !== undefined) && usuario?.tipo !== "motorista") {
      return res.status(403).json({ mensagem: "Apenas motoristas podem definir placa e CNH." });
    }
    if (placa !== undefined && placa !== null && placa.replace(/\s/g, "").length < 7) {
      return res.status(400).json({ mensagem: "Placa inválida — ex: ABC-1234 ou BRA2E19." });
    }
    if (cnh !== undefined && cnh !== null && cnh.replace(/\D/g, "").length !== 11) {
      return res.status(400).json({ mensagem: "CNH inválida — informe os 11 dígitos." });
    }

    // Monta o UPDATE com os campos presentes no body
    const campos = [];
    const valores = [];

    if (telefone !== undefined) { campos.push("telefone = ?"); valores.push(telefone || null); }
    if (bio      !== undefined) { campos.push("bio = ?");      valores.push(bio || null); }
    if (placa    !== undefined) { campos.push("placa = ?");    valores.push(placa || null); }
    if (cnh      !== undefined) { campos.push("cnh = ?");      valores.push(cnh || null); }

    if (campos.length === 0) return res.json({ mensagem: "Nada a atualizar." });

    valores.push(req.usuario.id);
    db.prepare(`UPDATE usuarios SET ${campos.join(", ")} WHERE id = ?`).run(...valores);

    res.json({ mensagem: "Perfil atualizado.", telefone: telefone ?? undefined, bio: bio ?? undefined, placa: placa ?? undefined, cnh: cnh ?? undefined });
  } catch (err) {
    next(err);
  }
}

function perfilPublico(req, res, next) {
  try {
    const usuario = db
      .prepare("SELECT id, nome, tipo, foto_perfil, bio, criado_em FROM usuarios WHERE id = ?")
      .get(Number(req.params.id));

    if (!usuario || usuario.tipo !== "motorista") {
      return res.status(404).json({ mensagem: "Motorista não encontrado." });
    }

    const { media, total } = db
      .prepare("SELECT AVG(nota) AS media, COUNT(*) AS total FROM avaliacoes WHERE avaliado_id = ?")
      .get(Number(req.params.id));

    const totalCaronas = db
      .prepare("SELECT COUNT(*) AS total FROM caronas WHERE motorista_id = ?")
      .get(Number(req.params.id)).total;

    res.json({
      ...usuario,
      media: media ? Number(Number(media).toFixed(1)) : null,
      total_avaliacoes: total,
      total_caronas: totalCaronas,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { cadastro, login, meuPerfil, atualizarPerfil, atualizarFoto, alterarSenha, deletarConta, perfilPublico };
