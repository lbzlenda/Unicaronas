import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3001/api",
});

// Injeta o token JWT em toda requisição autenticada
api.interceptors.request.use((config) => {
  const salvo = localStorage.getItem("unicaronas_usuario");
  if (salvo) {
    const { token } = JSON.parse(salvo);
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
