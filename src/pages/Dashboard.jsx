import React from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { 
  Truck, Package, Clock, Fuel, AlertTriangle, 
  TrendingUp, MapPin, Building2, Bus
} from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import StatCard from "../components/shared/StatCard";
import GlowOrb from "../components/shared/GlowOrb";
import PageHeader from "../components/shared/PageHeader";
import RecentDeliveries from "../components/dashboard/RecentDeliveries";
import AlertsFeed from "../components/dashboard/AlertFeed";
import PullToRefresh from "../components/shared/PullToRefresh";

const performanceData = [
  { day: "Seg", entregas: 42, economia: 12 },
  { day: "Ter", entregas: 38, economia: 15 },
  { day: "Qua", entregas: 45, economia: 18 },
  { day: "Qui", entregas: 50, economia: 14 },
  { day: "Sex", entregas: 47, economia: 20 },
  { day: "Sab", entregas: 30, economia: 10 },
  { day: "Dom", entregas: 15, economia: 5 },
];

export default function Dashboard() {
  const queryClient = useQueryClient();

  const handleRefresh = async () => {
    await queryClient.invalidateQueries();
  };

  const { data: deliveries = [] } = useQuery({
    queryKey: ["deliveries"],
    queryFn: () => base44.entities.Delivery.list("-created_date", 50),
  });

  const { data: alerts = [] } = useQuery({
    queryKey: ["alerts"],
    queryFn: () => base44.entities.RouteAlert.filter({ active: true }, "-created_date", 10),
  });

  const { data: busStops = [] } = useQuery({
    queryKey: ["bus-stops"],
    queryFn: () => base44.entities.BusStop.list("-created_date", 50),
  });

  const { data: companies = [] } = useQuery({
    queryKey: ["companies"],
    queryFn: () => base44.entities.Company.list("-created_date", 50),
  });

  const todayDeliveries = deliveries.filter(d => d.date === new Date().toISOString().split("T")[0]);
  const delivered = todayDeliveries.filter(d => d.status === "delivered").length;
  const pending = todayDeliveries.filter(d => d.status === "pending").length;

  return (
    <PullToRefresh onRefresh={handleRefresh}>
    <div className="relative p-6 lg:p-8 min-h-screen">
      <GlowOrb className="w-96 h-96 bg-primary -top-48 -left-48" />
      <GlowOrb className="w-64 h-64 bg-accent top-1/2 -right-32" />

      <PageHeader 
        title="Dashboard — Três Lagoas/MS" 
        subtitle="Visão geral da operação em tempo real"
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard icon={Package} label="Entregas Hoje" value={todayDeliveries.length} trend={12} />
        <StatCard icon={Truck} label="Concluídas" value={delivered} trend={8} />
        <StatCard icon={AlertTriangle} label="Alertas Ativos" value={alerts.length} />
        <StatCard icon={Fuel} label="Economia" value="23L" trend={15} />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard icon={Clock} label="Pendentes" value={pending} />
        <StatCard icon={Building2} label="Empresas" value={companies.length} />
        <StatCard icon={Bus} label="Pontos de Ônibus" value={busStops.length} />
        <StatCard icon={MapPin} label="Alertas no Mapa" value={alerts.length} />
      </div>

      {/* Chart */}
      <div className="rounded-xl border border-border bg-card p-5 mb-8">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-semibold">Performance Semanal</h3>
        </div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={performanceData}>
              <defs>
                <linearGradient id="colorEntregas" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(250, 80%, 60%)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(250, 80%, 60%)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorEconomia" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(200, 90%, 50%)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(200, 90%, 50%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(225, 15%, 18%)" />
              <XAxis dataKey="day" stroke="hsl(220, 10%, 55%)" fontSize={12} />
              <YAxis stroke="hsl(220, 10%, 55%)" fontSize={12} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: "hsl(225, 20%, 10%)", 
                  border: "1px solid hsl(225, 15%, 18%)",
                  borderRadius: "8px",
                  color: "hsl(220, 20%, 95%)"
                }} 
              />
              <Area type="monotone" dataKey="entregas" stroke="hsl(250, 80%, 60%)" fill="url(#colorEntregas)" strokeWidth={2} />
              <Area type="monotone" dataKey="economia" stroke="hsl(200, 90%, 50%)" fill="url(#colorEconomia)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom Grid */}
      <div className="grid lg:grid-cols-2 gap-6">
        <RecentDeliveries deliveries={deliveries.slice(0, 5)} />
        <AlertsFeed alerts={alerts} />
      </div>
    </div>
    </PullToRefresh>
  );
}