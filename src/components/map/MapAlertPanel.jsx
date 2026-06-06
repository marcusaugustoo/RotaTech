import React from "react";
import { AlertTriangle, CloudRain, Construction, Car, ShieldAlert } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";

const alertTypeConfig = {
  traffic: { icon: Car, label: "Trânsito", color: "text-yellow-400 bg-yellow-400/10" },
  flood: { icon: CloudRain, label: "Alagamento", color: "text-blue-400 bg-blue-400/10" },
  accident: { icon: AlertTriangle, label: "Acidente", color: "text-destructive bg-destructive/10" },
  roadblock: { icon: ShieldAlert, label: "Bloqueio", color: "text-orange-400 bg-orange-400/10" },
  weather: { icon: CloudRain, label: "Clima", color: "text-purple-400 bg-purple-400/10" },
  construction: { icon: Construction, label: "Obra", color: "text-amber-400 bg-amber-400/10" },
};

const severityBadge = {
  low: "bg-emerald-400/10 text-emerald-400",
  medium: "bg-yellow-400/10 text-yellow-400",
  high: "bg-orange-400/10 text-orange-400",
  critical: "bg-destructive/10 text-destructive",
};

export default function MapAlertPanel({ alerts }) {
  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="p-4 border-b border-border">
        <h3 className="text-sm font-semibold flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-accent" />
          Alertas na Cidade
          <Badge variant="secondary" className="ml-auto">{alerts.length}</Badge>
        </h3>
      </div>
      <ScrollArea className="h-[440px] lg:h-[540px]">
        <div className="p-3 space-y-2">
          {alerts.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-12">Nenhum alerta ativo</p>
          )}
          {alerts.map((alert) => {
            const config = alertTypeConfig[alert.type] || alertTypeConfig.traffic;
            const Icon = config.icon;
            return (
              <div key={alert.id} className="p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors">
                <div className="flex items-start gap-3">
                  <div className={cn("p-2 rounded-lg shrink-0", config.color)}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium truncate">{alert.title}</p>
                      <Badge className={cn("text-[10px] px-1.5 py-0", severityBadge[alert.severity])}>
                        {alert.severity}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{alert.description}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}