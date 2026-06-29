import { useContext } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext.jsx";

function RotaProtegida() {
  const { usuario, carregando } = useContext(AuthContext);

  if (carregando) {
    return <p className="p-4 text-center">Verificando autenticação...</p>;
  }

  if (!usuario) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}

export default RotaProtegida;