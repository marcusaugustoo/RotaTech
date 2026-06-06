import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Package, CheckCircle, MapPin, 
  Navigation, Fuel, Trophy, Star, Map
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PageHeader from "../components/shared/PageHeader";
import StatCard from "../components/shared/StatCard";
import GlowOrb from "../components/shared/GlowOrb";
import DeliveryCard from "../components/driver/DeliveryCard";
import DriverPerformance from "../components/driver/DriverPerformance";
import FeedbackDialog from "../components/driver/FeedbackDialog";
import RouteMap from "../components/driver/RouteMap";
import PullToRefresh from "../components/shared/PullToRefresh";

export default function DriverArea() {
  const [showFeedback, setShowFeedback] = useState(false);
  const queryClient = useQueryClient();
  const today = new Date().toISOString().split("T")[0];

  const handleRefresh = async () => {
    await queryClient.invalidateQueries({ queryKey: ["my-deliveries"] });
  };

  const { data: deliveries = [], isLoading } = useQuery({
    queryKey: ["my-deliveries"],
    queryFn: () => base44.entities.Delivery.list("-created_date", 50),
  });

  const { data: feedbacks = [] } = useQuery({
    queryKey: ["my-feedbacks"],
    queryFn: () => base44.entities.RouteFeedback.list("-created_date", 30),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Delivery.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["my-deliveries"] }),
  });

  const todayDeliveries = deliveries
    .filter(d => d.date === today)
    .sort((a, b) => (a.order_in_route || 0) - (b.order_in_route || 0));

  const completed = todayDeliveries.filter(d => d.status === "delivered").length;
  const total = todayDeliveries.length;
  const progress = total > 0 ? Math.round((completed / total) * 100) : 0;

  const totalScore = feedbacks.reduce((acc, f) => acc + (f.rating || 0), 0);
  const avgRating = feedbacks.length > 0 ? (totalScore / feedbacks.length).toFixed(1) : "–";

  const handleMarkDelivered = (delivery) => {
    updateMutation.mutate({
      id: delivery.id,
      data: { status: "delivered", delivered_at: new Date().toISOString() },
    });
  };

  const handleStartRoute = (delivery) => {
    updateMutation.mutate({
      id: delivery.id,
      data: { status: "in_transit" },
    });
  };

  return (
    <div className="relative p-6 lg:p-8 min-h-screen">
      <GlowOrb className="w-80 h-80 bg-primary -top-40 right-0" />

      <PageHeader 
        title="Área do Motorista — Três Lagoas/MS" 
        subtitle="Rota inteligente e otimizada do dia"
        actions={
          <Button onClick={() => setShowFeedback(true)} variant="outline" size="sm">
            <Star className="w-4 h-4 mr-2" />
            Avaliar Rota
          </Button>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard icon={Package} label="Total do dia" value={total} />
        <StatCard icon={CheckCircle} label="Concluídas" value={completed} trend={progress > 50 ? 5 : -3} />
        <StatCard icon={Trophy} label="Avaliação" value={avgRating} />
        <StatCard icon={Fuel} label="Economia Est." value="8L" trend={12} />
      </div>

      {/* Progress Bar */}
      <div className="rounded-xl border border-border bg-card p-5 mb-8">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium">Progresso da Rota</span>
          <span className="text-sm text-muted-foreground">{completed}/{total} entregas</span>
        </div>
        <div className="h-2 bg-secondary rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-primary to-accent rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <Tabs defaultValue="route" className="space-y-6">
        <TabsList className="bg-secondary">
          <TabsTrigger value="route">
            <Navigation className="w-4 h-4 mr-1.5" /> Lista de Entregas
          </TabsTrigger>
          <TabsTrigger value="map">
            <Map className="w-4 h-4 mr-1.5" /> Mapa da Rota
          </TabsTrigger>
        </TabsList>

        <TabsContent value="route">
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-3">
              <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
                <Navigation className="w-4 h-4 text-primary" />
                Rota Otimizada ({todayDeliveries.length} paradas)
              </h3>
              {isLoading && (
                <div className="flex items-center justify-center py-16">
                  <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
              )}
              {!isLoading && todayDeliveries.length === 0 && (
                <div className="text-center py-16 text-muted-foreground">
                  <MapPin className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p className="text-sm">Nenhuma entrega para hoje</p>
                </div>
              )}
              <PullToRefresh onRefresh={handleRefresh}>
              {todayDeliveries.map((delivery, index) => (
                <DeliveryCard
                  key={delivery.id}
                  delivery={delivery}
                  index={index}
                  onMarkDelivered={handleMarkDelivered}
                  onStartRoute={handleStartRoute}
                />
              ))}
              </PullToRefresh>
            </div>
            <DriverPerformance feedbacks={feedbacks} />
          </div>
        </TabsContent>

        <TabsContent value="map">
          <div className="space-y-4">
            <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-emerald-400 inline-block" /> Entregue</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-accent inline-block" /> Em trânsito</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-primary inline-block" /> Pendente</span>
              <span className="flex items-center gap-1.5 ml-auto text-muted-foreground">— Rota tracejada</span>
            </div>
            {todayDeliveries.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground rounded-xl border border-border bg-card">
                <Map className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p className="text-sm">Nenhuma entrega com coordenadas para hoje</p>
              </div>
            ) : (
              <RouteMap deliveries={todayDeliveries} />
            )}
          </div>
        </TabsContent>
      </Tabs>

      <FeedbackDialog open={showFeedback} onOpenChange={setShowFeedback} />
    </div>
  );
}