const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "unicaronas_dev_secret_2024";

function autenticar(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ mensagem: "Token de autenticação não fornecido." });
  }

  const token = authHeader.slice(7);
  try {
    req.usuario = jwt.verify(token, JWT_SECRET); // { id, nome, email, tipo }
    next();
  } catch {
    return res.status(401).json({ mensagem: "Token inválido ou expirado." });
  }
}

function somenteMotorista(req, res, next) {
  if (req.usuario?.tipo !== "motorista") {
    return res.status(403).json({ mensagem: "Acesso permitido apenas para motoristas." });
  }
  next();
}

function somentePassageiro(req, res, next) {
  if (req.usuario?.tipo !== "passageiro") {
    return res.status(403).json({ mensagem: "Apenas passageiros podem reservar vagas." });
  }
  next();
}

module.exports = { autenticar, somenteMotorista, somentePassageiro, JWT_SECRET };
