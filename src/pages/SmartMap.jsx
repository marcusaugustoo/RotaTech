import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { MapContainer, TileLayer, Marker, Popup, Circle } from "react-leaflet";
import { AlertTriangle, CloudRain, Construction, Car, 
  ShieldAlert, Layers
} from "lucide-react";
import { Button } from "@/components/ui/button";
import PageHeader from "../components/shared/PageHeader";
import GlowOrb from "../components/shared/GlowOrb";
import MapAlertPanel from "../components/map/MapAlertPanel";
import ReportIssueDialog from "../components/map/ReportIssueDialog";

const alertColors = {
  traffic: "#eab308",
  flood: "#3b82f6",
  accident: "#ef4444",
  roadblock: "#f97316",
  weather: "#a78bfa",
  construction: "#f59e0b",
};

export default function SmartMap() {
  const [activeFilter, setActiveFilter] = useState("all");

  const { data: alerts = [] } = useQuery({
    queryKey: ["map-alerts"],
    queryFn: () => base44.entities.RouteAlert.filter({ active: true }, "-created_date", 50),
  });

  const { data: busStops = [] } = useQuery({
    queryKey: ["bus-stops-map"],
    queryFn: () => base44.entities.BusStop.list("-created_date", 100),
  });

  // Center map on Três Lagoas - MS
  const TL_CENTER = [-20.7849, -51.7011];

  const filteredAlerts = activeFilter === "all" 
    ? alerts 
    : alerts.filter(a => a.type === activeFilter);

  const filters = [
    { key: "all", label: "Todos", icon: Layers },
    { key: "traffic", label: "Trânsito", icon: Car },
    { key: "flood", label: "Alagamento", icon: CloudRain },
    { key: "accident", label: "Acidentes", icon: AlertTriangle },
    { key: "roadblock", label: "Bloqueio", icon: ShieldAlert },
    { key: "construction", label: "Obra", icon: Construction },
  ];

  return (
    <div className="relative p-6 lg:p-8 min-h-screen">
      <GlowOrb className="w-64 h-64 bg-accent -top-32 left-1/2" />
      
      <PageHeader 
        title="Mapa Inteligente — Três Lagoas/MS" 
        subtitle="Visualize alertas, trânsito e pontos em tempo real"
        actions={<ReportIssueDialog />}
      />

      {/* Filters */}
      <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-2">
        {filters.map((f) => {
          const FilterIcon = f.icon;
          return (
            <Button
              key={f.key}
              variant={activeFilter === f.key ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveFilter(f.key)}
              className="shrink-0"
            >
              <FilterIcon className="w-3.5 h-3.5 mr-1.5" />
              {f.label}
            </Button>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Map */}
        <div className="lg:col-span-2 rounded-xl overflow-hidden border border-border h-[500px] lg:h-[600px]">
          <MapContainer 
            center={TL_CENTER} 
            zoom={14} 
            style={{ height: "100%", width: "100%" }}
            className="z-0"
          >
            <TileLayer
              attribution='&copy; <a href="https://carto.com/">CARTO</a>'
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            />
            
            {/* Alerts */}
            {filteredAlerts.map((alert) => 
              alert.latitude && alert.longitude ? (
                <Circle
                  key={alert.id}
                  center={[alert.latitude, alert.longitude]}
                  radius={300}
                  pathOptions={{
                    color: alertColors[alert.type] || "#eab308",
                    fillColor: alertColors[alert.type] || "#eab308",
                    fillOpacity: 0.2,
                  }}
                >
                  <Popup>
                    <div className="text-xs">
                      <p className="font-bold">{alert.title}</p>
                      <p>{alert.description}</p>
                    </div>
                  </Popup>
                </Circle>
              ) : null
            )}

            {/* Bus Stops */}
            {busStops.map((stop) =>
              stop.latitude && stop.longitude ? (
                <Marker key={stop.id} position={[stop.latitude, stop.longitude]}>
                  <Popup>
                    <div className="text-xs">
                      <p className="font-bold">{stop.name}</p>
                      <p>{stop.address}</p>
                      {stop.lines && <p className="mt-1">Linhas: {stop.lines.join(", ")}</p>}
                    </div>
                  </Popup>
                </Marker>
              ) : null
            )}
          </MapContainer>
        </div>

        {/* Alert Panel */}
        <MapAlertPanel alerts={filteredAlerts} />
      </div>
    </div>
  );
}