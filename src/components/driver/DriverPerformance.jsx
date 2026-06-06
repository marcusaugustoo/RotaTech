import React from "react";
import { Trophy, Flame, Fuel, Clock, Star } from "lucide-react";

export default function DriverPerformance({ feedbacks }) {
  const totalFuel = feedbacks.reduce((acc, f) => acc + (f.fuel_saved || 0), 0);
  const totalTime = feedbacks.reduce((acc, f) => acc + (f.time_saved || 0), 0);
  const totalKm = feedbacks.reduce((acc, f) => acc + (f.distance_km || 0), 0);
  const streak = feedbacks.length;

  const badges = [
    { name: "Econômico", icon: Fuel, desc: `${totalFuel.toFixed(1)}L economizados`, unlocked: totalFuel > 5 },
    { name: "Veloz", icon: Clock, desc: `${totalTime}min economizados`, unlocked: totalTime > 30 },
    { name: "Maratonista", icon: Flame, desc: `${totalKm.toFixed(0)}km percorridos`, unlocked: totalKm > 100 },
    { name: "Top Avaliado", icon: Star, desc: "Nota média 4.5+", unlocked: feedbacks.length > 0 },
  ];

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
        <Trophy className="w-4 h-4 text-yellow-400" />
        Gamificação
      </h3>

      {/* Level */}
      <div className="text-center mb-6 p-4 rounded-lg bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/20">
        <p className="text-xs text-muted-foreground uppercase tracking-wider">Nível</p>
        <p className="text-3xl font-bold mt-1">{Math.min(Math.floor(streak / 3) + 1, 10)}</p>
        <p className="text-xs text-muted-foreground mt-1">{streak} rotas completadas</p>
      </div>

      {/* Badges */}
      <div className="space-y-3">
        {badges.map((badge) => (
          <div key={badge.name} className={`flex items-center gap-3 p-3 rounded-lg ${badge.unlocked ? 'bg-secondary' : 'bg-secondary/30 opacity-50'}`}>
            <div className={`p-2 rounded-lg ${badge.unlocked ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
              <badge.icon className="w-4 h-4" />
            </div>
            <div>
              <p className="text-sm font-medium">{badge.name}</p>
              <p className="text-xs text-muted-foreground">{badge.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}