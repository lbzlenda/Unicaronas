import { createContext, useState, useEffect } from "react";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [fotoUrl, setFotoUrl] = useState(() => localStorage.getItem("unicaronas_foto") || null);

  useEffect(() => {
    const usuarioSalvo = localStorage.getItem("unicaronas_usuario");
    if (usuarioSalvo) {
      setUsuario(JSON.parse(usuarioSalvo));
    }
    setCarregando(false);
  }, []);

  function login(dadosUsuario) {
    setUsuario(dadosUsuario);
    localStorage.setItem("unicaronas_usuario", JSON.stringify(dadosUsuario));
  }

  function logout() {
    setUsuario(null);
    setFotoUrl(null);
    localStorage.removeItem("unicaronas_usuario");
    localStorage.removeItem("unicaronas_foto");
  }

  function atualizarFoto(foto) {
    setFotoUrl(foto || null);
    if (foto) localStorage.setItem("unicaronas_foto", foto);
    else localStorage.removeItem("unicaronas_foto");
  }

  return (
    <AuthContext.Provider value={{ usuario, carregando, login, logout, fotoUrl, atualizarFoto }}>
      {children}
    </AuthContext.Provider>
  );
}
