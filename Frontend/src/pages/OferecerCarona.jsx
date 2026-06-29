import { useContext, useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";
import { caronaSchema, DESTINOS } from "../schemas/caronaSchemas.js";
import { AuthContext } from "../contexts/AuthContext.jsx";
import api from "../api/axiosConfig.js";
import usePageTitle from "../hooks/usePageTitle.js";
import {
  FiMapPin,
  FiClock,
  FiDollarSign,
  FiUsers,
  FiCheckCircle,
  FiAlertCircle,
  FiArrowRight,
  FiCalendar,
  FiNavigation,
} from "react-icons/fi";
import { MdOutlineDirectionsCar } from "react-icons/md";

// Ícone do pin do mapa no estilo do app
const pinIcon = L.divIcon({
  className: "",
  html: `<div style="width:22px;height:22px;background:linear-gradient(135deg,#6366f1,#3b82f6);border-radius:50%;border:3px solid white;box-shadow:0 2px 12px rgba(99,102,241,0.7)"></div>`,
  iconSize: [22, 22],
  iconAnchor: [11, 11],
});

const GLASS = {
  background: "rgba(255,255,255,0.06)",
  backdropFilter: "blur(20px)",
  WebkitBackdropFilter: "blur(20px)",
  border: "1px solid rgba(255,255,255,0.12)",
  boxShadow: "0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.08)",
};

const INPUT_STYLE = {
  background: "rgba(255,255,255,0.07)",
  border: "1px solid rgba(255,255,255,0.12)",
  color: "#fff",
};

// Centro de Palmas, TO
const PALMAS = [-10.2491, -48.3243];

function Spinner() {
  return (
    <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}

function Blob({ className, style, animate }) {
  return (
    <motion.div
      className={`absolute rounded-full pointer-events-none ${className}`}
      style={style}
      animate={animate}
      transition={{ duration: 10, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
    />
  );
}

function Campo({ label, icone, erro, children, hint }) {
  return (
    <div>
      <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest mb-1.5"
        style={{ color: "rgba(255,255,255,0.5)" }}>
        {icone}{label}
      </label>
      {children}
      {hint && !erro && (
        <p className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.3)" }}>{hint}</p>
      )}
      {erro && (
        <p className="text-red-300 text-xs mt-1 flex items-center gap-1">
          <FiAlertCircle className="shrink-0" />{erro}
        </p>
      )}
    </div>
  );
}

function GlassInput({ type = "text", placeholder, disabled, step, min, max, registration }) {
  return (
    <input
      type={type}
      placeholder={placeholder}
      disabled={disabled}
      step={step}
      min={min}
      max={max}
      {...registration}
      className="w-full rounded-xl px-3 py-2.5 text-sm placeholder-white/25 focus:outline-none transition disabled:opacity-50"
      style={INPUT_STYLE}
      onFocus={e => e.target.style.borderColor = "rgba(99,102,241,0.7)"}
      onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.12)"}
    />
  );
}

// Componente interno que captura cliques no mapa
function MapClickHandler({ onClique }) {
  useMapEvents({
    click(e) {
      onClique(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

function MapaPicker({ lat, lng, onChange }) {
  const center = lat && lng ? [lat, lng] : PALMAS;
  return (
    <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid rgba(99,102,241,0.3)", boxShadow: "0 4px 20px rgba(0,0,0,0.3)" }}>
      <MapContainer
        center={center}
        zoom={13}
        style={{ height: 220, width: "100%", background: "#1e1b4b" }}
        zoomControl={true}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://openstreetmap.org">OpenStreetMap</a>'
        />
        <MapClickHandler onClique={onChange} />
        {lat && lng && <Marker position={[lat, lng]} icon={pinIcon} />}
      </MapContainer>
    </div>
  );
}

function OferecerCarona() {
  usePageTitle("Oferecer carona");

  const { usuario } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const republicar = location.state?.carona;

  const [sucesso, setSucesso] = useState(false);
  const [lat, setLat] = useState(republicar?.lat ?? null);
  const [lng, setLng] = useState(republicar?.lng ?? null);
  const [buscandoGps, setBuscandoGps] = useState(false);

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(caronaSchema),
    defaultValues: { vagas: 1, valor: 4 },
    mode: "onChange",
  });

  // Pré-preenche o formulário quando vem de "Republicar"
  useEffect(() => {
    if (republicar) {
      reset({
        origem: republicar.origem,
        destino: republicar.destino,
        horario_saida: republicar.horario_saida,
        valor: republicar.valor,
        vagas: republicar.vagas,
        data_saida: "",
      });
    }
  }, []);

  function usarMinhaLocalizacao() {
    if (!navigator.geolocation) {
      toast.error("Seu navegador não suporta geolocalização.");
      return;
    }
    setBuscandoGps(true);
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setLat(coords.latitude);
        setLng(coords.longitude);
        setBuscandoGps(false);
        toast.success("Localização obtida! Ajuste no mapa se necessário.");
      },
      () => {
        setBuscandoGps(false);
        toast.error("Não foi possível obter sua localização.");
      },
      { timeout: 8000 }
    );
  }

  if (usuario?.tipo !== "motorista") {
    return (
      <div className="min-h-screen flex items-center justify-center p-4"
        style={{ background: "linear-gradient(135deg, #020817 0%, #0f172a 40%, #1e1b4b 100%)" }}>
        <div className="rounded-2xl p-8 max-w-sm text-center w-full" style={GLASS}>
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
            style={{ background: "rgba(245,158,11,0.15)", border: "1px solid rgba(245,158,11,0.3)" }}>
            <FiAlertCircle className="text-amber-400 text-3xl" />
          </div>
          <h2 className="text-lg font-bold text-white mb-2">Acesso restrito</h2>
          <p className="text-white/40 text-sm mb-4">
            Apenas motoristas podem oferecer caronas.
          </p>
          <button onClick={() => navigate("/")}
            className="text-indigo-400 text-sm font-medium hover:text-indigo-300 transition">
            Voltar para a Home
          </button>
        </div>
      </div>
    );
  }

  async function onSubmit(dados) {
    try {
      await api.post("/caronas", { ...dados, lat: lat ?? null, lng: lng ?? null });
      setSucesso(true);
      reset();
      setLat(null);
      setLng(null);
    } catch (err) {
      toast.error(err.response?.data?.mensagem || "Não foi possível cadastrar a carona. Tente novamente.");
    }
  }

  if (sucesso) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4"
        style={{ background: "linear-gradient(135deg, #020817 0%, #0f172a 40%, #1e1b4b 100%)" }}>
        <motion.div
          initial={{ scale: 0.85, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="rounded-2xl p-8 max-w-sm text-center w-full"
          style={GLASS}
        >
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
            style={{ background: "rgba(16,185,129,0.15)", border: "1px solid rgba(16,185,129,0.3)" }}>
            <FiCheckCircle className="text-emerald-400 text-3xl" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Carona cadastrada!</h2>
          <p className="text-white/40 text-sm mb-6">
            Sua carona já está visível para os passageiros na página inicial.
          </p>
          <div className="flex flex-col gap-2">
            <button
              onClick={() => setSucesso(false)}
              className="text-white py-2.5 rounded-xl text-sm font-semibold transition-all active:scale-[0.98]"
              style={{ background: "linear-gradient(135deg,#6366f1,#3b82f6)", boxShadow: "0 4px 16px rgba(99,102,241,0.4)" }}
            >
              Oferecer outra carona
            </button>
            <button onClick={() => navigate("/minhas-caronas")}
              className="text-indigo-400 text-sm font-medium hover:text-indigo-300 transition">
              Ver minhas caronas
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-x-hidden"
      style={{ background: "linear-gradient(135deg, #020817 0%, #0f172a 40%, #1e1b4b 100%)" }}>

      <Blob
        className="w-[500px] h-[500px] -top-32 -left-32 opacity-20"
        style={{ background: "radial-gradient(circle, #6366f1, transparent 70%)" }}
        animate={{ x: [0, 40, 0], y: [0, 30, 0], scale: [1, 1.1, 1] }}
      />
      <Blob
        className="w-80 h-80 -bottom-20 -right-16 opacity-15"
        style={{ background: "radial-gradient(circle, #3b82f6, transparent 70%)" }}
        animate={{ x: [0, -30, 0], y: [0, -20, 0] }}
      />

      {/* Hero */}
      <div className="relative z-10 max-w-2xl mx-auto px-4 pt-10 pb-4 text-center">
        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ background: "rgba(99,102,241,0.2)", border: "1px solid rgba(99,102,241,0.3)" }}>
            <MdOutlineDirectionsCar className="text-indigo-400 text-3xl" />
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white mb-2">
            {republicar ? "Republicar Carona" : "Oferecer Carona"}
          </h1>
          <p className="text-sm max-w-xs mx-auto" style={{ color: "rgba(255,255,255,0.4)" }}>
            {republicar
              ? "Dados pré-preenchidos. Ajuste o que precisar e publique."
              : "Preencha os dados da sua carona. Passageiros poderão reservar vagas em instantes."}
          </p>
        </motion.div>
      </div>

      {/* Formulário */}
      <div className="relative z-10 max-w-2xl mx-auto px-4 py-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="rounded-2xl p-6 md:p-8"
          style={GLASS}
        >
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Campo label="Data de saída" icone={<FiCalendar className="text-indigo-400" />} erro={errors.data_saida?.message}>
                <GlassInput
                  type="date"
                  min={new Date().toISOString().split("T")[0]}
                  disabled={isSubmitting}
                  registration={register("data_saida")}
                />
              </Campo>
              <Campo label="Horário de saída" icone={<FiClock className="text-indigo-400" />} erro={errors.horario_saida?.message}>
                <GlassInput
                  type="time"
                  disabled={isSubmitting}
                  registration={register("horario_saida")}
                />
              </Campo>
            </div>

            <Campo label="Origem (endereço/bairro)" icone={<FiMapPin className="text-indigo-400" />} erro={errors.origem?.message}>
              <GlassInput
                placeholder="Ex: Setor Buritís, Quadra 103"
                disabled={isSubmitting}
                registration={register("origem")}
              />
            </Campo>

            <Campo label="Destino" icone={<FiArrowRight className="text-indigo-400" />} erro={errors.destino?.message}>
              <select
                {...register("destino")}
                disabled={isSubmitting}
                className="w-full rounded-xl px-3 py-2.5 text-sm focus:outline-none transition disabled:opacity-50"
                style={INPUT_STYLE}
                onFocus={e => e.target.style.borderColor = "rgba(99,102,241,0.7)"}
                onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.12)"}
              >
                <option value="" style={{ background: "#0f172a" }}>Selecione a instituição</option>
                {DESTINOS.map((d) => (
                  <option key={d} value={d} style={{ background: "#0f172a" }}>{d}</option>
                ))}
              </select>
            </Campo>

            {/* Mapa de ponto de saída */}
            <Campo
              label="Ponto de saída no mapa"
              icone={<FiNavigation className="text-indigo-400" />}
              hint={lat && lng ? `📍 ${lat.toFixed(5)}, ${lng.toFixed(5)} — clique no mapa para ajustar` : "Clique no mapa para marcar onde você sai"}
            >
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={usarMinhaLocalizacao}
                  disabled={buscandoGps}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all disabled:opacity-50"
                  style={{ background: "rgba(99,102,241,0.15)", color: "#a5b4fc", border: "1px solid rgba(99,102,241,0.3)" }}
                >
                  {buscandoGps ? <Spinner /> : <FiNavigation size={12} />}
                  {buscandoGps ? "Obtendo localização..." : "Usar minha localização atual"}
                </button>
                <MapaPicker lat={lat} lng={lng} onChange={(la, ln) => { setLat(la); setLng(ln); }} />
              </div>
            </Campo>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Campo label="Valor (R$)" icone={<FiDollarSign className="text-indigo-400" />} erro={errors.valor?.message}>
                <GlassInput
                  type="number"
                  step="0.50"
                  placeholder="4,00 – 10,00"
                  disabled={isSubmitting}
                  registration={register("valor", { valueAsNumber: true })}
                />
              </Campo>

              <Campo label="Vagas (máx. 4)" icone={<FiUsers className="text-indigo-400" />} erro={errors.vagas?.message}>
                <GlassInput
                  type="number"
                  min="1"
                  max="4"
                  disabled={isSubmitting}
                  registration={register("vagas", { valueAsNumber: true })}
                />
              </Campo>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 rounded-xl text-sm font-semibold text-white transition-all active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              style={{ background: "linear-gradient(135deg,#6366f1,#3b82f6)", boxShadow: "0 4px 20px rgba(99,102,241,0.5)" }}
            >
              {isSubmitting && <Spinner />}
              {isSubmitting ? "Publicando..." : republicar ? "Republicar carona" : "Publicar carona"}
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}

export default OferecerCarona;
