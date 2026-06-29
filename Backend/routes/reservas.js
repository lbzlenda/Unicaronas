const { Router } = require("express");
const { autenticar, somentePassageiro } = require("../middlewares/auth.js");
const { minhasReservas, cancelarReserva } = require("../controllers/reservaController.js");

const router = Router();

router.get("/minhas",  autenticar, somentePassageiro, minhasReservas);
router.delete("/:id",  autenticar, somentePassageiro, cancelarReserva);

module.exports = router;
