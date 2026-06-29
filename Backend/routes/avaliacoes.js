const { Router } = require("express");
const { autenticar, somentePassageiro } = require("../middlewares/auth.js");
const { avaliar, mediaAvaliacao, minhasAvaliacoes } = require("../controllers/avaliacoesController.js");

const router = Router();

router.post("/",                   autenticar, somentePassageiro, avaliar);
router.get("/minhas",              autenticar, somentePassageiro, minhasAvaliacoes);
router.get("/media/:motorista_id", mediaAvaliacao); // público

module.exports = router;
