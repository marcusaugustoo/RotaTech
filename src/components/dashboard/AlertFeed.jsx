import React from "react";
import { AlertTriangle, CloudRain, Construction, Car, ShieldAlert, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

const alertTypeConfig = {
  traffic: { icon: Car, color: "text-yellow-400 bg-yellow-400/10" },
  flood: { icon: CloudRain, color: "text-blue-400 bg-blue-400/10" },
  accident: { icon: AlertTriangle, color: "text-destructive bg-destructive/10" },
  roadblock: { icon: ShieldAlert, color: "text-orange-400 bg-orange-400/10" },
  weather: { icon: CloudRain, color: "text-purple-400 bg-purple-400/10" },
  construction: { icon: Construction, color: "text-amber-400 bg-amber-400/10" },
};

const severityColors = {
  low: "border-l-emerald-400",
  medium: "border-l-yellow-400",
  high: "border-l-orange-400",
  critical: "border-l-destructive",
};

export default function AlertsFeed({ alerts }) {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
        <Zap className="w-4 h-4 text-accent" />
        Alertas Ativos
      </h3>
      <div className="space-y-3">
        {alerts.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-8">Nenhum alerta ativo</p>
        )}
        {alerts.map((a) => {
          const config = alertTypeConfig[a.type] || alertTypeConfig.traffic;
          const AlertIcon = config.icon;
          return (
            <div key={a.id} className={cn(
              "flex items-start gap-3 p-3 rounded-lg bg-secondary/50 border-l-2",
              severityColors[a.severity] || severityColors.medium
            )}>
              <div className={cn("p-2 rounded-lg shrink-0", config.color)}>
                <AlertIcon className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium">{a.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{a.description}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}