import { useEffect, useRef, useState, useCallback } from "react";
import api from "../api/axiosConfig.js";

const INTERVALO = 30_000;

export function useNotificacoes(ativo) {
  const [notificacoes, setNotificacoes] = useState([]);
  const [carregando, setCarregando] = useState(false);
  const timerRef = useRef(null);

  const buscar = useCallback(async () => {
    try {
      const { data } = await api.get("/notificacoes");
      setNotificacoes(data);
    } catch {}
  }, []);

  async function marcarLidas() {
    try {
      await api.patch("/notificacoes/ler");
      setNotificacoes((prev) => prev.map((n) => ({ ...n, lida: 1 })));
    } catch {}
  }

  useEffect(() => {
    if (!ativo) return;
    setCarregando(true);
    buscar().finally(() => setCarregando(false));
    timerRef.current = setInterval(buscar, INTERVALO);
    return () => clearInterval(timerRef.current);
  }, [ativo, buscar]);

  const naoLidas = notificacoes.filter((n) => !n.lida).length;

  return { notificacoes, naoLidas, carregando, marcarLidas, recarregar: buscar };
}
