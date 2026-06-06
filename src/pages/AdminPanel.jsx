import React from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Package, AlertTriangle, Bus, MapPin, TrendingUp, Building2
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PageHeader from "../components/shared/PageHeader";
import StatCard from "../components/shared/StatCard";
import GlowOrb from "../components/shared/GlowOrb";
import AdminDeliveries from "../components/admin/AdminDeliveries";
import AdminAlerts from "../components/admin/AdminAlert";
import AdminBusStops from "../components/admin/AdminBusStops";
import AdminBusSchedules from "../components/admin/AdminBusSchedules";
import AdminCompanies from "../components/admin/AdminCompanies";

export default function AdminPanel() {
  const { data: deliveries = [] } = useQuery({
    queryKey: ["admin-deliveries"],
    queryFn: () => base44.entities.Delivery.list("-created_date", 100),
  });

  const { data: alerts = [] } = useQuery({
    queryKey: ["admin-alerts"],
    queryFn: () => base44.entities.RouteAlert.list("-created_date", 50),
  });

  const { data: busStops = [] } = useQuery({
    queryKey: ["admin-bus-stops"],
    queryFn: () => base44.entities.BusStop.list("-created_date", 100),
  });

  const delivered = deliveries.filter(d => d.status === "delivered").length;
  const activeAlerts = alerts.filter(a => a.active).length;

  return (
    <div className="relative p-6 lg:p-8 min-h-screen">
      <GlowOrb className="w-80 h-80 bg-primary/50 -top-40 left-1/3" />

      <PageHeader
        title="Painel Administrativo"
        subtitle="Gerencie entregas, alertas e transporte público"
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard icon={Package} label="Total Entregas" value={deliveries.length} />
        <StatCard icon={TrendingUp} label="Entregues" value={delivered} trend={8} />
        <StatCard icon={AlertTriangle} label="Alertas Ativos" value={activeAlerts} />
        <StatCard icon={MapPin} label="Pontos de Ônibus" value={busStops.length} />
      </div>

      <Tabs defaultValue="deliveries" className="space-y-6">
        <TabsList className="bg-secondary">
          <TabsTrigger value="deliveries">
            <Package className="w-4 h-4 mr-1.5" /> Entregas
          </TabsTrigger>
          <TabsTrigger value="alerts">
            <AlertTriangle className="w-4 h-4 mr-1.5" /> Alertas
          </TabsTrigger>
          <TabsTrigger value="busstops">
            <MapPin className="w-4 h-4 mr-1.5" /> Pontos
          </TabsTrigger>
          <TabsTrigger value="schedules">
            <Bus className="w-4 h-4 mr-1.5" /> Linhas
          </TabsTrigger>
          <TabsTrigger value="companies">
            <Building2 className="w-4 h-4 mr-1.5" /> Empresas
          </TabsTrigger>
        </TabsList>

        <TabsContent value="deliveries">
          <AdminDeliveries />
        </TabsContent>
        <TabsContent value="alerts">
          <AdminAlerts />
        </TabsContent>
        <TabsContent value="busstops">
          <AdminBusStops />
        </TabsContent>
        <TabsContent value="schedules">
          <AdminBusSchedules />
        </TabsContent>
        <TabsContent value="companies">
          <AdminCompanies />
        </TabsContent>
      </Tabs>
    </div>
  );
}