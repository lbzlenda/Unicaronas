const { Router } = require("express");
const { autenticar, somenteMotorista, somentePassageiro } = require("../middlewares/auth.js");
const {
  listarCaronas,
  minhasCaronas,
  criarCarona,
  excluirCarona,
  reservarVaga,
  atualizarStatus,
  passageirosDaCarona,
  dashboard,
} = require("../controllers/caronaController.js");

const router = Router();

router.get("/",              listarCaronas);
router.get("/minhas",        autenticar, somenteMotorista, minhasCaronas);
router.get("/dashboard",     autenticar, somenteMotorista, dashboard);
router.post("/",             autenticar, somenteMotorista, criarCarona);
router.delete("/:id",        autenticar, somenteMotorista, excluirCarona);
router.post("/:id/reservar", autenticar, somentePassageiro, reservarVaga);
router.patch("/:id/status",       autenticar, somenteMotorista, atualizarStatus);
router.get("/:id/passageiros",    autenticar, somenteMotorista, passageirosDaCarona);

module.exports = router;
