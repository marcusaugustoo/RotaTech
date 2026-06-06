import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { 
  Bus, MapPin, Heart, Search, Map
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PageHeader from "../components/shared/PageHeader";
import GlowOrb from "../components/shared/GlowOrb";
import BusStopCard from "../components/passenger/BusStopCard";
import BusLineCard from "../components/passenger/BusLineCard";
import StopsMap from "../components/passenger/StopMap";

export default function PassengerArea() {
  const [search, setSearch] = useState("");
  const [favorites, setFavorites] = useState(() => {
    try { return JSON.parse(localStorage.getItem("rotatech_favorites") || "[]"); } 
    catch { return []; }
  });

  const { data: busStops = [], isLoading: loadingStops } = useQuery({
    queryKey: ["bus-stops"],
    queryFn: () => base44.entities.BusStop.list("-created_date", 100),
  });

  const { data: schedules = [], isLoading: loadingSchedules } = useQuery({
    queryKey: ["bus-schedules"],
    queryFn: () => base44.entities.BusSchedule.filter({ active: true }, "-created_date", 50),
  });

  const toggleFavorite = (id) => {
    const updated = favorites.includes(id)
      ? favorites.filter(f => f !== id)
      : [...favorites, id];
    setFavorites(updated);
    localStorage.setItem("rotatech_favorites", JSON.stringify(updated));
  };

  const filteredStops = busStops.filter(s => 
    s.name?.toLowerCase().includes(search.toLowerCase()) ||
    s.address?.toLowerCase().includes(search.toLowerCase())
  );

  const filteredSchedules = schedules.filter(s =>
    s.line_name?.toLowerCase().includes(search.toLowerCase()) ||
    s.line_number?.toLowerCase().includes(search.toLowerCase())
  );

  const favoriteStops = busStops.filter(s => favorites.includes(s.id));

  return (
    <div className="relative p-6 lg:p-8 min-h-screen">
      <GlowOrb className="w-72 h-72 bg-accent -top-36 -right-20" />

      <PageHeader
        title="Transporte Público — Três Lagoas/MS"
        subtitle="Encontre pontos, linhas, horários e tarifas"
      />

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Buscar ponto, linha ou endereço..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 bg-card border-border"
        />
      </div>

      <Tabs defaultValue="map" className="space-y-6">
        <TabsList className="bg-secondary">
          <TabsTrigger value="map">
            <Map className="w-4 h-4 mr-1.5" /> Mapa
          </TabsTrigger>
          <TabsTrigger value="stops">
            <MapPin className="w-4 h-4 mr-1.5" /> Pontos
          </TabsTrigger>
          <TabsTrigger value="lines">
            <Bus className="w-4 h-4 mr-1.5" /> Linhas
          </TabsTrigger>
          <TabsTrigger value="favorites">
            <Heart className="w-4 h-4 mr-1.5" /> Favoritos
          </TabsTrigger>
        </TabsList>

        <TabsContent value="map">
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">Clique em um ponto 🚌 no mapa para ver linhas, horários e tarifas.</p>
            <StopsMap busStops={busStops} schedules={schedules} />
          </div>
        </TabsContent>

        <TabsContent value="stops">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {loadingStops && (
              <div className="col-span-full flex justify-center py-16">
                <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            )}
            {!loadingStops && filteredStops.length === 0 && (
              <div className="col-span-full text-center py-16 text-muted-foreground">
                <MapPin className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p className="text-sm">Nenhum ponto encontrado</p>
              </div>
            )}
            {filteredStops.map((stop) => (
              <BusStopCard
                key={stop.id}
                stop={stop}
                isFavorite={favorites.includes(stop.id)}
                onToggleFavorite={() => toggleFavorite(stop.id)}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="lines">
          <div className="space-y-4">
            {loadingSchedules && (
              <div className="flex justify-center py-16">
                <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            )}
            {!loadingSchedules && filteredSchedules.length === 0 && (
              <div className="text-center py-16 text-muted-foreground">
                <Bus className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p className="text-sm">Nenhuma linha encontrada</p>
              </div>
            )}
            {filteredSchedules.map((schedule) => (
              <BusLineCard key={schedule.id} schedule={schedule} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="favorites">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {favoriteStops.length === 0 && (
              <div className="col-span-full text-center py-16 text-muted-foreground">
                <Heart className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p className="text-sm">Nenhum favorito salvo</p>
              </div>
            )}
            {favoriteStops.map((stop) => (
              <BusStopCard
                key={stop.id}
                stop={stop}
                isFavorite={true}
                onToggleFavorite={() => toggleFavorite(stop.id)}
              />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}