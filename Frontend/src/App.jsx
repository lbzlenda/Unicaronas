import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import Header from "./components/Header.jsx";
import ScrollToTop from "./components/ScrollToTop.jsx";
import PageTransition from "./components/PageTransition.jsx";
import Home from "./pages/Home.jsx";
import Login from "./pages/Login.jsx";
import Cadastro from "./pages/Cadastro.jsx";
import OferecerCarona from "./pages/OferecerCarona.jsx";
import MinhasCaronas from "./pages/MinhasCaronas.jsx";
import Perfil from "./pages/Perfil.jsx";
import Configuracoes from "./pages/Configuracoes.jsx";
import Sobre from "./pages/Sobre.jsx";
import NotFound from "./pages/NotFound.jsx";
import PerfilMotorista from "./pages/PerfilMotorista.jsx";
import EsqueciSenha from "./pages/EsqueciSenha.jsx";
import RotaProtegida from "./routes/RotaProtegida.jsx";

function RotasAnimadas() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PageTransition><Home /></PageTransition>} />
        <Route path="/sobre" element={<PageTransition><Sobre /></PageTransition>} />
        <Route path="/motorista/:id" element={<PageTransition><PerfilMotorista /></PageTransition>} />
        <Route path="/login" element={<PageTransition><Login /></PageTransition>} />
        <Route path="/cadastro" element={<PageTransition><Cadastro /></PageTransition>} />
        <Route path="/esqueci-senha" element={<PageTransition><EsqueciSenha /></PageTransition>} />

        <Route element={<RotaProtegida />}>
          <Route path="/oferecer" element={<PageTransition><OferecerCarona /></PageTransition>} />
          <Route path="/minhas-caronas" element={<PageTransition><MinhasCaronas /></PageTransition>} />
          <Route path="/perfil" element={<PageTransition><Perfil /></PageTransition>} />
          <Route path="/configuracoes" element={<PageTransition><Configuracoes /></PageTransition>} />
        </Route>

        <Route path="*" element={<PageTransition><NotFound /></PageTransition>} />
      </Routes>
    </AnimatePresence>
  );
}

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Header />
      <RotasAnimadas />
    </BrowserRouter>
  );
}

export default App;
