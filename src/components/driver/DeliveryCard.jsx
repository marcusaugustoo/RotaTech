import React from "react";
import { MapPin, CheckCircle, Clock, Navigation, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const statusStyles = {
  pending: { bg: "bg-yellow-400/10 border-yellow-400/20", dot: "bg-yellow-400" },
  in_transit: { bg: "bg-accent/10 border-accent/20", dot: "bg-accent" },
  delivered: { bg: "bg-emerald-400/10 border-emerald-400/20", dot: "bg-emerald-400" },
  failed: { bg: "bg-destructive/10 border-destructive/20", dot: "bg-destructive" },
};

export default function DeliveryCard({ delivery, index, onMarkDelivered, onStartRoute }) {
  const style = statusStyles[delivery.status] || statusStyles.pending;
  const isDelivered = delivery.status === "delivered";
  const isInTransit = delivery.status === "in_transit";

  return (
    <div className={cn(
      "relative rounded-xl border p-4 transition-all",
      style.bg,
      isDelivered && "opacity-60"
    )}>
      {/* Timeline dot */}
      <div className="absolute -left-0.5 top-6 flex flex-col items-center">
        <div className={cn("w-2.5 h-2.5 rounded-full", style.dot)} />
      </div>

      <div className="flex items-start gap-4 pl-4">
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-secondary text-sm font-bold text-muted-foreground shrink-0">
          {index + 1}
        </div>
        <div className="flex-1 min-w-0">
          <p className={cn("text-sm font-semibold", isDelivered && "line-through")}>{delivery.recipient_name}</p>
          <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
            <MapPin className="w-3 h-3" />
            {delivery.address}
          </p>
          <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
            {delivery.estimated_time && (
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {delivery.estimated_time}
              </span>
            )}
            {delivery.package_weight && (
              <span className="flex items-center gap-1">
                <Package className="w-3 h-3" />
                {delivery.package_weight}kg
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {delivery.status === "pending" && (
            <Button size="sm" variant="outline" onClick={() => onStartRoute(delivery)}>
              <Navigation className="w-3.5 h-3.5 mr-1" /> Iniciar
            </Button>
          )}
          {isInTransit && (
            <Button size="sm" onClick={() => onMarkDelivered(delivery)} className="bg-emerald-500 hover:bg-emerald-600 text-white">
              <CheckCircle className="w-3.5 h-3.5 mr-1" /> Entregar
            </Button>
          )}
          {isDelivered && (
            <CheckCircle className="w-5 h-5 text-emerald-400" />
          )}
        </div>
      </div>
    </div>
  );
}