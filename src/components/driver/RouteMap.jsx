import React, { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap, Circle } from "react-leaflet";
import L from "leaflet";

// Fix leaflet default icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

const statusColors = {
  delivered: "#10b981", // Green
  in_transit: "#f97316", // Vibrant Orange
  pending: "#94a3b8", // Slate/Gray
  failed: "#ef4444",
};

const alertColors = {
  traffic: "#eab308",
  flood: "#3b82f6",
  accident: "#ef4444",
  roadblock: "#f97316",
  weather: "#a78bfa",
  construction: "#f59e0b",
};

function createNumberedIcon(number, color) {
  return L.divIcon({
    className: "",
    html: `<div style="
      width:32px;height:32px;border-radius:50%;
      background:${color};border:2px solid white;
      display:flex;align-items:center;justify-content:center;
      color:white;font-weight:bold;font-size:13px;
      box-shadow:0 2px 8px rgba(0,0,0,0.4);">
      ${number}
    </div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });
}

function createDriverIcon() {
  return L.divIcon({
    className: "",
    html: `<div style="
      width:36px;height:36px;border-radius:50%;
      background:#ffffff;border:3px solid #3b82f6;
      display:flex;align-items:center;justify-content:center;
      box-shadow:0 4px 12px rgba(59, 130, 246, 0.5);
      transform: rotate(45deg);
      z-index: 1000;">
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="#3b82f6" stroke="#3b82f6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="3 11 22 2 13 21 11 13 3 11"/></svg>
    </div>`,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
  });
}

// API OSRM gratuita para roteamento de ruas
function useRealRoute(positions) {
  const [routePath, setRoutePath] = React.useState([]);

  React.useEffect(() => {
    if (positions.length < 2) return;

    // A API do OSRM usa a ordem [longitude, latitude]
    const coordinates = positions.map(p => `${p[1]},${p[0]}`).join(";");
    const url = `https://router.project-osrm.org/route/v1/driving/${coordinates}?overview=full&geometries=geojson`;

    fetch(url)
      .then(res => res.json())
      .then(data => {
        if (data.routes && data.routes[0]) {
          // O OSRM retorna [longitude, latitude], o Leaflet precisa de [latitude, longitude]
          const coords = data.routes[0].geometry.coordinates.map(c => [c[1], c[0]]);
          setRoutePath(coords);
        } else {
          setRoutePath(positions); // fallback
        }
      })
      .catch(err => {
        console.error("Erro ao buscar rota:", err);
        setRoutePath(positions); // fallback em caso de erro na API
      });
  }, [JSON.stringify(positions)]);

  return routePath;
}

function FitBounds({ positions }) {
  const map = useMap();
  useEffect(() => {
    if (positions.length > 0) {
      map.fitBounds(positions, { padding: [60, 60] });
    }
  }, [positions.length]);
  return null;
}

function RecenterButton({ center, positions }) {
  const map = useMap();
  return (
    <div className="leaflet-bottom leaflet-right z-[1000] absolute bottom-4 right-4">
      <button 
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          if (positions.length > 0) {
            map.fitBounds(positions, { padding: [60, 60] });
          } else {
            map.setView(center, 14);
          }
        }}
        onDoubleClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
        className="bg-card hover:bg-accent text-foreground flex items-center justify-center rounded-lg shadow-xl border border-border transition-colors"
        style={{ width: "40px", height: "40px", cursor: "pointer", pointerEvents: "auto" }}
        title="Centralizar Mapa"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m4.93 19.07 1.41-1.41"/><path d="m17.66 6.34 1.41-1.41"/>
        </svg>
      </button>
    </div>
  );
}

export default function RouteMap({ deliveries }) {
  const { data: alerts = [] } = useQuery({
    queryKey: ["map-alerts"],
    queryFn: () => base44.entities.RouteAlert.filter({ active: true }, "-created_date", 50),
  });

  const withCoords = deliveries.filter(d => d.latitude && d.longitude);
  const positions = withCoords.map(d => [d.latitude, d.longitude]);
  
  // Apenas as entregas que ainda faltam ser concluídas
  const activeDeliveries = withCoords.filter(d => d.status !== "delivered");
  const activePositions = activeDeliveries.map(d => [d.latitude, d.longitude]);
  
  // Rota calculada apenas para os pontos restantes
  const streetPath = useRealRoute(activePositions);
  
  const center = positions.length > 0 
    ? [positions[0][0], positions[0][1]] 
    : [-20.7849, -51.7011];

  return (
    <div className="rounded-xl overflow-hidden border border-border relative" style={{ height: 420 }}>
      <div className="absolute top-4 left-4 z-[400] bg-card/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-border shadow-lg flex items-center gap-2">
        <div className="w-3 h-3 rounded-full bg-[#a78bfa] animate-pulse"></div>
        <span className="text-xs font-medium text-foreground">GPS Otimizado Ativo</span>
      </div>
      <MapContainer center={center} zoom={14} style={{ height: "100%", width: "100%" }}>
        <TileLayer
          attribution='&copy; <a href="https://carto.com/">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />
        
        {/* Renderização dos problemas na cidade (Alertas) */}
        {alerts.map(alert => (
          <Circle
            key={`alert-${alert.id}`}
            center={[alert.latitude, alert.longitude]}
            radius={200}
            pathOptions={{ 
              color: alertColors[alert.type] || alertColors.traffic, 
              fillColor: alertColors[alert.type] || alertColors.traffic,
              fillOpacity: 0.4
            }}
          >
            <Popup>
              <div>
                <p style={{ fontWeight: "bold", marginBottom: 4 }}>{alert.title}</p>
                <p style={{ fontSize: 12 }}>{alert.description}</p>
              </div>
            </Popup>
          </Circle>
        ))}

        {streetPath.length > 1 && (
          <>
            {/* Outline route path (Sombra/borda azul escuro) */}
            <Polyline
              positions={streetPath}
              pathOptions={{ color: "#1e3a8a", weight: 8, opacity: 0.8, lineCap: "round", lineJoin: "round" }}
            />
            {/* Inner route path (Linha principal azul GPS) */}
            <Polyline
              positions={streetPath}
              pathOptions={{ color: "#3b82f6", weight: 4, opacity: 1, lineCap: "round", lineJoin: "round" }}
            />
          </>
        )}
        {withCoords.map((d, i) => (
          <Marker
            key={d.id}
            position={[d.latitude, d.longitude]}
            icon={createNumberedIcon(i + 1, statusColors[d.status] || "#6366f1")}
          >
            <Popup>
              <div style={{ minWidth: 160 }}>
                <p style={{ fontWeight: "bold", marginBottom: 4 }}>{d.recipient_name}</p>
                <p style={{ fontSize: 12, color: "#666" }}>{d.address}</p>
                {d.estimated_time && (
                  <p style={{ fontSize: 12, marginTop: 4 }}>⏱ {d.estimated_time}</p>
                )}
                <p style={{ fontSize: 11, marginTop: 4, color: statusColors[d.status] }}>
                  ● {d.status === "delivered" ? "Entregue" : d.status === "in_transit" ? "Em trânsito" : "Pendente"}
                </p>
              </div>
            </Popup>
          </Marker>
        ))}
        {/* Marcador do Motorista (Simulando posição atual) */}
        {activePositions.length > 0 && (
          <Marker
            position={streetPath.length > 0 ? streetPath[0] : activePositions[0]}
            icon={createDriverIcon()}
            zIndexOffset={1000}
          >
            <Popup>
              <div style={{ textAlign: "center", fontWeight: "bold" }}>Sua Posição</div>
            </Popup>
          </Marker>
        )}
        <RecenterButton center={center} positions={positions} />
        {positions.length > 0 && <FitBounds positions={positions} />}
      </MapContainer>
    </div>
  );
}