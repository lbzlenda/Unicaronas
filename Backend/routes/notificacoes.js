const { Router } = require("express");
const { autenticar } = require("../middlewares/auth.js");
const { listar, marcarLidas } = require("../controllers/notificacoesController.js");

const router = Router();

router.get("/",     autenticar, listar);
router.patch("/ler", autenticar, marcarLidas);

module.exports = router;
