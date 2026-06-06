import React from "react";
import { cn } from "@/lib/utils";

export default function StatCard({ icon: Icon, label, value, trend, className }) {
  return (
    <div className={cn(
      "relative overflow-hidden rounded-xl border border-border bg-card p-5 transition-all hover:border-primary/30",
      className
    )}>
      <div className="absolute -top-6 -right-6 w-20 h-20 rounded-full bg-primary/5" />
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{label}</p>
          <p className="text-2xl font-bold mt-1">{value}</p>
          {trend && (
            <p className={cn(
              "text-xs mt-1 font-medium",
              trend > 0 ? "text-emerald-400" : "text-destructive"
            )}>
              {trend > 0 ? "+" : ""}{trend}% vs ontem
            </p>
          )}
        </div>
        <div className="p-2.5 rounded-lg bg-primary/10">
          <Icon className="w-5 h-5 text-primary" />
        </div>
      </div>
    </div>
  );
}