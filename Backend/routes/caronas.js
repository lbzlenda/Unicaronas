const { Router } = require("express");
const { autenticar, somenteMotorista, somentePassageiro } = require("../middlewares/auth.js");
const {
  listarCaronas,
  minhasCaronas,
  criarCarona,
  excluirCarona,
  reservarVaga,
  atualizarStatus,
} = require("../controllers/caronaController.js");

const router = Router();

router.get("/",              listarCaronas);
router.get("/minhas",        autenticar, somenteMotorista, minhasCaronas);
router.post("/",             autenticar, somenteMotorista, criarCarona);
router.delete("/:id",        autenticar, somenteMotorista, excluirCarona);
router.post("/:id/reservar", autenticar, somentePassageiro, reservarVaga);
router.patch("/:id/status",  autenticar, somenteMotorista, atualizarStatus);

module.exports = router;
