import React from "react";
import { MapPin, Heart, Accessibility, Umbrella } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export default function BusStopCard({ stop, isFavorite, onToggleFavorite }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4 hover:border-primary/30 transition-all">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-primary/10">
            <MapPin className="w-4 h-4 text-primary" />
          </div>
          <div>
            <p className="text-sm font-semibold">{stop.name}</p>
            <p className="text-xs text-muted-foreground">{stop.address}</p>
          </div>
        </div>
        <button onClick={onToggleFavorite} className="p-1.5 rounded-lg hover:bg-secondary transition-colors">
          <Heart className={cn(
            "w-4 h-4 transition-colors",
            isFavorite ? "text-pink-400 fill-pink-400" : "text-muted-foreground"
          )} />
        </button>
      </div>
      
      <div className="flex items-center gap-2 flex-wrap">
        {stop.has_shelter && (
          <Badge variant="secondary" className="text-[10px]">
            <Umbrella className="w-3 h-3 mr-1" /> Cobertura
          </Badge>
        )}
        {stop.accessibility && (
          <Badge variant="secondary" className="text-[10px]">
            <Accessibility className="w-3 h-3 mr-1" /> Acessível
          </Badge>
        )}
      </div>

      {stop.lines && stop.lines.length > 0 && (
        <div className="flex items-center gap-1.5 mt-3 flex-wrap">
          {stop.lines.map((line) => (
            <Badge key={line} className="bg-accent/10 text-accent text-[10px] border border-accent/20">
              {line}
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}