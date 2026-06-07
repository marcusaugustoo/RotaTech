import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Package, CheckCircle, MapPin, 
  Navigation, Fuel, Trophy, Star, Map, Plus, ShieldAlert, AlertTriangle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
  const [showNewDeliveryModal, setShowNewDeliveryModal] = useState(false);
  const [selectedDeliveryAction, setSelectedDeliveryAction] = useState(null);
  const [newDeliveryForm, setNewDeliveryForm] = useState({ cep: "", address: "", number: "", recipient: "" });
  const [qualitativeRouting, setQualitativeRouting] = useState(false);
  const [isAddingAlertMode, setIsAddingAlertMode] = useState(false);
  const [showNewAlertModal, setShowNewAlertModal] = useState(false);
  const [newAlertForm, setNewAlertForm] = useState({ latitude: null, longitude: null, title: "", description: "", type: "traffic" });

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

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Delivery.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["my-deliveries"] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Delivery.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["my-deliveries"] }),
  });

  const createAlertMutation = useMutation({
    mutationFn: (data) => base44.entities.RouteAlert.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["map-alerts"] }),
  });

  const deleteAlertMutation = useMutation({
    mutationFn: (id) => base44.entities.RouteAlert.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["map-alerts"] }),
  });

  const handleMapClickForAlert = (lat, lng) => {
    setNewAlertForm({ ...newAlertForm, latitude: lat, longitude: lng });
    setIsAddingAlertMode(false);
    setShowNewAlertModal(true);
  };

  const handleAddAlertSubmit = () => {
    createAlertMutation.mutate({
      title: newAlertForm.title || "Novo Alerta",
      description: newAlertForm.description || "",
      type: newAlertForm.type || "traffic",
      latitude: newAlertForm.latitude,
      longitude: newAlertForm.longitude,
      severity: "medium"
    });
    setShowNewAlertModal(false);
    setNewAlertForm({ latitude: null, longitude: null, title: "", description: "", type: "traffic" });
  };

  const [isGeocoding, setIsGeocoding] = useState(false);

  const handleAddDestinationSubmit = async () => {
    setIsGeocoding(true);
    let lat = -20.785 + (Math.random() - 0.5) * 0.02;
    let lng = -51.701 + (Math.random() - 0.5) * 0.02;

    if (newDeliveryForm.address) {
      try {
        let addressForSearch = newDeliveryForm.address;
        
        if (newDeliveryForm.number) {
          const parts = newDeliveryForm.address.split(',');
          if (parts.length > 1) {
             // Insere o número logo após o nome da rua (padrão Brasil: Rua, Número, Bairro)
             addressForSearch = `${parts[0].trim()}, ${newDeliveryForm.number}, ${parts.slice(1).join(',').trim()}`;
          } else {
             addressForSearch = `${newDeliveryForm.address}, ${newDeliveryForm.number}`;
          }
        }
        
        const addressToSearch = addressForSearch.toLowerCase().includes("três lagoas") 
          ? addressForSearch 
          : `${addressForSearch}, Três Lagoas, MS`;
          
        const query = encodeURIComponent(addressToSearch);
        let res = await fetch(`https://nominatim.openstreetmap.org/search?q=${query}&format=json&limit=1`);
        let data = await res.json();
        
        // Fallback: se o mapa não tiver o número exato mapeado, busca apenas pela rua
        if (!data || data.length === 0) {
           const fallbackAddress = newDeliveryForm.address.toLowerCase().includes("três lagoas") 
             ? newDeliveryForm.address 
             : `${newDeliveryForm.address}, Três Lagoas, MS`;
           const fallbackQuery = encodeURIComponent(fallbackAddress);
           res = await fetch(`https://nominatim.openstreetmap.org/search?q=${fallbackQuery}&format=json&limit=1`);
           data = await res.json();
        }

        if (data && data.length > 0) {
          lat = parseFloat(data[0].lat);
          lng = parseFloat(data[0].lon);
        } else {
          // Último recurso se não encontrar a rua
          lat = -20.7849 + (Math.random() - 0.5) * 0.02;
          lng = -51.7011 + (Math.random() - 0.5) * 0.02;
        }
      } catch (err) {
        console.error("Geocoding failed", err);
      }
    }

    createMutation.mutate({
      recipient_name: newDeliveryForm.recipient || "Novo Cliente",
      address: newDeliveryForm.number ? `${newDeliveryForm.address}, ${newDeliveryForm.number}` : (newDeliveryForm.address || "Endereço não informado"),
      latitude: lat,
      longitude: lng,
      order_in_route: todayDeliveries.length + 1
    });
    
    setIsGeocoding(false);
    setShowNewDeliveryModal(false);
    setNewDeliveryForm({ cep: "", address: "", number: "", recipient: "" });
  };

  const handleCepChange = async (e) => {
    const cep = e.target.value.replace(/\D/g, '');
    setNewDeliveryForm({ ...newDeliveryForm, cep: e.target.value });
    if (cep.length === 8) {
      try {
        const res = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
        const data = await res.json();
        if (!data.erro) {
          setNewDeliveryForm(prev => ({ ...prev, address: `${data.logradouro}, ${data.bairro}, ${data.localidade}` }));
        }
      } catch (err) {}
    }
  };

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
    <div className="relative p-4 sm:p-6 lg:p-8 min-h-screen overflow-x-hidden">
      <GlowOrb className="w-64 h-64 sm:w-80 sm:h-80 bg-primary -top-40 right-0" />

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
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 mb-8">
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
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" /> Entregue</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-orange-500 inline-block" /> Em trânsito</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-slate-400 inline-block" /> Pendente</span>
              <span className="flex items-center gap-1.5 ml-auto text-muted-foreground">— Caminho a seguir</span>
            </div>

            <div className="flex gap-3 my-2 flex-wrap">
              <Button 
                variant="outline"
                size="sm" 
                onClick={() => { setIsAddingAlertMode(false); setShowNewDeliveryModal(true); }}
              >
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Destino
              </Button>
              <Button 
                variant={isAddingAlertMode ? "default" : "outline"}
                size="sm" 
                onClick={() => setIsAddingAlertMode(!isAddingAlertMode)}
              >
                <AlertTriangle className="w-4 h-4 mr-2" />
                {isAddingAlertMode ? "Clique no mapa para marcar" : "Reportar Problema"}
              </Button>
              <Button 
                variant={qualitativeRouting ? "default" : "outline"} 
                size="sm" 
                onClick={() => setQualitativeRouting(!qualitativeRouting)}
              >
                <ShieldAlert className="w-4 h-4 mr-2" />
                Simular Rota Qualitativa
              </Button>
            </div>

            {todayDeliveries.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground rounded-xl border border-border bg-card">
                <Map className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p className="text-sm">Nenhuma entrega com coordenadas para hoje</p>
              </div>
            ) : (
              <RouteMap 
                deliveries={todayDeliveries} 
                qualitativeRouting={qualitativeRouting}
                onMarkerClick={(d) => setSelectedDeliveryAction(d)}
                isAddingAlertMode={isAddingAlertMode}
                onAddAlert={handleMapClickForAlert}
                onDeleteAlert={(id) => deleteAlertMutation.mutate(id)}
              />
            )}
          </div>
        </TabsContent>
      </Tabs>

      <FeedbackDialog open={showFeedback} onOpenChange={setShowFeedback} />

      {/* Modal Adicionar Destino */}
      <Dialog open={showNewDeliveryModal} onOpenChange={setShowNewDeliveryModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar Novo Destino</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Nome do Cliente / Destinatário</Label>
              <Input 
                placeholder="Ex: João da Silva" 
                value={newDeliveryForm.recipient}
                onChange={e => setNewDeliveryForm({...newDeliveryForm, recipient: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label>CEP</Label>
              <Input 
                placeholder="Digite o CEP" 
                value={newDeliveryForm.cep}
                onChange={handleCepChange}
                maxLength={9}
              />
            </div>
            <div className="grid grid-cols-4 gap-4">
              <div className="col-span-4 sm:col-span-3 space-y-2">
                <Label>Endereço Completo</Label>
                <Input 
                  placeholder="Ex: Rua X, Bairro Y" 
                  value={newDeliveryForm.address}
                  onChange={e => setNewDeliveryForm({...newDeliveryForm, address: e.target.value})}
                />
              </div>
              <div className="col-span-4 sm:col-span-1 space-y-2">
                <Label>Número</Label>
                <Input 
                  placeholder="123" 
                  value={newDeliveryForm.number}
                  onChange={e => setNewDeliveryForm({...newDeliveryForm, number: e.target.value})}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewDeliveryModal(false)}>Cancelar</Button>
            <Button onClick={handleAddDestinationSubmit} disabled={isGeocoding}>
              {isGeocoding ? "Buscando Local..." : "Adicionar à Rota"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Ações do Destino no Mapa */}
      <Dialog open={!!selectedDeliveryAction} onOpenChange={(open) => !open && setSelectedDeliveryAction(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ações do Destino</DialogTitle>
          </DialogHeader>
          {selectedDeliveryAction && (
            <div className="space-y-4 py-4">
              <div>
                <p className="font-bold">{selectedDeliveryAction.recipient_name}</p>
                <p className="text-sm text-muted-foreground">{selectedDeliveryAction.address}</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Button 
                  variant="outline" 
                  className={selectedDeliveryAction.status === 'delivered' ? 'bg-emerald-500/10 border-emerald-500' : ''}
                  onClick={() => {
                    handleMarkDelivered(selectedDeliveryAction);
                    setSelectedDeliveryAction(null);
                  }}
                >
                  Marcar Entregue
                </Button>
                <Button 
                  variant="outline"
                  className={selectedDeliveryAction.status === 'in_transit' ? 'bg-orange-500/10 border-orange-500' : ''}
                  onClick={() => {
                    handleStartRoute(selectedDeliveryAction);
                    setSelectedDeliveryAction(null);
                  }}
                >
                  Em Trânsito
                </Button>
              </div>
              <Button 
                variant="destructive" 
                className="w-full"
                onClick={() => {
                  deleteMutation.mutate(selectedDeliveryAction.id);
                  setSelectedDeliveryAction(null);
                }}
              >
                Excluir da Rota
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal Adicionar Alerta */}
      <Dialog open={showNewAlertModal} onOpenChange={setShowNewAlertModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reportar Problema no Mapa</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Tipo de Problema</Label>
              <Select 
                value={newAlertForm.type} 
                onValueChange={val => setNewAlertForm({ ...newAlertForm, type: val })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="traffic">Trânsito Intenso</SelectItem>
                  <SelectItem value="accident">Acidente</SelectItem>
                  <SelectItem value="flood">Alagamento</SelectItem>
                  <SelectItem value="roadblock">Via Interditada</SelectItem>
                  <SelectItem value="construction">Obras</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Título Breve</Label>
              <Input 
                placeholder="Ex: Árvore caída" 
                value={newAlertForm.title}
                onChange={e => setNewAlertForm({...newAlertForm, title: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label>Descrição</Label>
              <Input 
                placeholder="Detalhes adicionais..." 
                value={newAlertForm.description}
                onChange={e => setNewAlertForm({...newAlertForm, description: e.target.value})}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewAlertModal(false)}>Cancelar</Button>
            <Button onClick={handleAddAlertSubmit}>Adicionar Alerta</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}