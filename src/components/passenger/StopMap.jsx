import React from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

function busIcon() {
  return L.divIcon({
    className: "",
    html: `<div style="
      width:34px;height:34px;border-radius:8px;
      background:#7c3aed;border:2px solid white;
      display:flex;align-items:center;justify-content:center;
      color:white;font-size:16px;
      box-shadow:0 2px 8px rgba(0,0,0,0.4);">🚌</div>`,
    iconSize: [34, 34],
    iconAnchor: [17, 17],
  });
}

export default function StopsMap({ busStops, schedules }) {
  const withCoords = busStops.filter(s => s.latitude && s.longitude);

  // Center on Três Lagoas - MS
  const TL_CENTER = [-20.7849, -51.7011];

  // Build a map of line -> schedule for quick lookup
  const scheduleByLine = {};
  schedules.forEach(s => {
    scheduleByLine[s.line_number] = s;
  });

  return (
    <div className="rounded-xl overflow-hidden border border-border" style={{ height: 520 }}>
      <MapContainer center={TL_CENTER} zoom={14} style={{ height: "100%", width: "100%" }}>
        <TileLayer
          attribution='&copy; <a href="https://carto.com/">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />
        {withCoords.map((stop) => (
          <Marker key={stop.id} position={[stop.latitude, stop.longitude]} icon={busIcon()}>
            <Popup minWidth={240}>
              <div>
                <p style={{ fontWeight: "bold", fontSize: 14, marginBottom: 6 }}>{stop.name}</p>
                <p style={{ fontSize: 12, color: "#aaa", marginBottom: 8 }}>{stop.address}</p>
                {stop.has_shelter && <span style={{ fontSize: 11, background: "rgba(124, 58, 237, 0.15)", color: "#a78bfa", borderRadius: 4, padding: "2px 6px", marginRight: 4 }}>☂ Cobertura</span>}
                {stop.accessibility && <span style={{ fontSize: 11, background: "rgba(52, 211, 153, 0.15)", color: "#34d399", borderRadius: 4, padding: "2px 6px" }}>♿ Acessível</span>}
                
                {stop.lines && stop.lines.length > 0 && (
                  <div style={{ marginTop: 10 }}>
                    <p style={{ fontSize: 12, fontWeight: "bold", marginBottom: 6 }}>Linhas neste ponto:</p>
                    {stop.lines.map(line => {
                      const sched = scheduleByLine[line];
                      return (
                        <div key={line} style={{ marginBottom: 8, padding: "6px 8px", background: "rgba(124, 58, 237, 0.08)", borderRadius: 6 }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <span style={{ fontWeight: "bold", color: "#a78bfa", fontSize: 13 }}>Linha {line}</span>
                            {sched?.fare && (
                              <span style={{ fontSize: 12, color: "#34d399" }}>R$ {sched.fare.toFixed(2)}</span>
                            )}
                          </div>
                          {sched?.line_name && (
                            <p style={{ fontSize: 11, color: "#aaa", marginTop: 2 }}>{sched.line_name}</p>
                          )}
                          {sched?.estimated_duration && (
                            <p style={{ fontSize: 11, color: "#aaa" }}>⏱ {sched.estimated_duration}</p>
                          )}
                          {sched?.departure_times && sched.departure_times.length > 0 && (
                            <div style={{ marginTop: 4 }}>
                              <p style={{ fontSize: 11, color: "#888", marginBottom: 2 }}>Próximos horários:</p>
                              <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                                {sched.departure_times.slice(0, 6).map((t, i) => (
                                  <span key={i} style={{ fontSize: 10, background: "rgba(124, 58, 237, 0.2)", color: "#c4b5fd", borderRadius: 4, padding: "1px 5px" }}>{t}</span>
                                ))}
                                {sched.departure_times.length > 6 && (
                                  <span style={{ fontSize: 10, color: "#888" }}>+{sched.departure_times.length - 6}</span>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}