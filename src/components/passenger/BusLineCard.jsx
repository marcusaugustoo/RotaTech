import React, { useState } from "react";
import { Clock, DollarSign, ChevronDown, ChevronUp, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function BusLineCard({ schedule }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden hover:border-primary/30 transition-all">
      <button 
        onClick={() => setExpanded(!expanded)} 
        className="w-full p-4 flex items-center gap-4 text-left"
      >
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shrink-0">
          <span className="text-sm font-bold text-white">{schedule.line_number}</span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold">{schedule.line_name}</p>
          <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
            {schedule.fare && (
              <span className="flex items-center gap-1">
                <DollarSign className="w-3 h-3" />
                R$ {schedule.fare?.toFixed(2)}
              </span>
            )}
            {schedule.estimated_duration && (
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {schedule.estimated_duration}
              </span>
            )}
          </div>
        </div>
        {expanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
      </button>

      {expanded && (
        <div className="px-4 pb-4 space-y-3 border-t border-border pt-3">
          {/* Departure Times */}
          {schedule.departure_times && schedule.departure_times.length > 0 && (
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1">
                <Clock className="w-3 h-3" /> Horários de saída
              </p>
              <div className="flex items-center gap-2 flex-wrap">
                {schedule.departure_times.map((time, i) => (
                  <Badge key={i} variant="secondary" className="text-xs">{time}</Badge>
                ))}
              </div>
            </div>
          )}

          {/* Route Stops */}
          {schedule.route_stops && schedule.route_stops.length > 0 && (
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1">
                <MapPin className="w-3 h-3" /> Paradas da rota
              </p>
              <div className="space-y-1">
                {schedule.route_stops.map((stop, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                    <span>{stop}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}