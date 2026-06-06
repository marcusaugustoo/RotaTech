import React from "react";
import { Package, CheckCircle, Clock, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const statusConfig = {
  pending: { label: "Pendente", icon: Clock, color: "text-yellow-400 bg-yellow-400/10" },
  in_transit: { label: "Em trânsito", icon: Package, color: "text-accent bg-accent/10" },
  delivered: { label: "Entregue", icon: CheckCircle, color: "text-emerald-400 bg-emerald-400/10" },
  failed: { label: "Falhou", icon: AlertCircle, color: "text-destructive bg-destructive/10" },
};

export default function RecentDeliveries({ deliveries }) {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
        <Package className="w-4 h-4 text-primary" />
        Entregas Recentes
      </h3>
      <div className="space-y-3">
        {deliveries.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-8">Nenhuma entrega encontrada</p>
        )}
        {deliveries.map((d) => {
          const status = statusConfig[d.status] || statusConfig.pending;
          const StatusIcon = status.icon;
          return (
            <div key={d.id} className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors">
              <div className={cn("p-2 rounded-lg", status.color)}>
                <StatusIcon className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{d.recipient_name}</p>
                <p className="text-xs text-muted-foreground truncate">{d.address}</p>
              </div>
              <span className="text-xs text-muted-foreground">{d.estimated_time || "--"}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}