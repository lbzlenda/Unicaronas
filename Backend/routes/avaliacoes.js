const { Router } = require("express");
const { autenticar, somentePassageiro, somenteMotorista } = require("../middlewares/auth.js");
const { avaliar, mediaAvaliacao, minhasAvaliacoes, avaliarPassageiro, minhasAvaliacoesComoMotorista } = require("../controllers/avaliacoesController.js");

const router = Router();

router.post("/",                          autenticar, somentePassageiro, avaliar);
router.get("/minhas",                     autenticar, somentePassageiro, minhasAvaliacoes);
router.get("/media/:motorista_id",        mediaAvaliacao);
router.post("/passageiro",                autenticar, somenteMotorista, avaliarPassageiro);
router.get("/minhas-como-motorista",      autenticar, somenteMotorista, minhasAvaliacoesComoMotorista);

module.exports = router;
