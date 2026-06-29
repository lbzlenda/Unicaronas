const { Router } = require("express");
const { autenticar } = require("../middlewares/auth.js");
const { enviar, listar } = require("../controllers/mensagensController.js");

const router = Router();

router.post("/",                  autenticar, enviar);
router.get("/:reserva_id",        autenticar, listar);

module.exports = router;
