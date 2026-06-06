import React, { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet";
import L from "leaflet";

// Fix leaflet default icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

const statusColors = {
  delivered: "#10b981",
  in_transit: "#a78bfa",
  pending: "#6366f1",
  failed: "#ef4444",
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

function FitBounds({ positions }) {
  const map = useMap();
  useEffect(() => {
    if (positions.length > 0) {
      map.fitBounds(positions, { padding: [40, 40] });
    }
  }, [positions.length]);
  return null;
}

export default function RouteMap({ deliveries }) {
  const withCoords = deliveries.filter(d => d.latitude && d.longitude);
  const positions = withCoords.map(d => [d.latitude, d.longitude]);
  
  const center = positions.length > 0 
    ? [positions[0][0], positions[0][1]] 
    : [-20.7849, -51.7011];

  return (
    <div className="rounded-xl overflow-hidden border border-border" style={{ height: 420 }}>
      <MapContainer center={center} zoom={13} style={{ height: "100%", width: "100%" }}>
        <TileLayer
          attribution='&copy; <a href="https://carto.com/">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />
        {positions.length > 1 && (
          <Polyline
            positions={positions}
            pathOptions={{ color: "#6366f1", weight: 3, dashArray: "8 6", opacity: 0.8 }}
          />
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
        {positions.length > 0 && <FitBounds positions={positions} />}
      </MapContainer>
    </div>
  );
}