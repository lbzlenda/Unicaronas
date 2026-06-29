const { Router } = require("express");
const { cadastro, login, meuPerfil, atualizarPerfil, atualizarFoto, alterarSenha, deletarConta, perfilPublico } = require("../controllers/authController.js");
const { autenticar } = require("../middlewares/auth.js");

const router = Router();

router.post("/cadastro", cadastro);
router.post("/login", login);
router.get("/perfil", autenticar, meuPerfil);
router.patch("/perfil", autenticar, atualizarPerfil);
router.patch("/senha", autenticar, alterarSenha);
router.patch("/foto", autenticar, atualizarFoto);
router.get("/motorista/:id", perfilPublico);
router.delete("/conta", autenticar, deletarConta);

module.exports = router;
