import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Plus, Trash2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";

export default function AdminAlerts() {
  const [showDialog, setShowDialog] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", type: "traffic", severity: "medium", latitude: "", longitude: "" });
  const queryClient = useQueryClient();

  const { data: alerts = [] } = useQuery({
    queryKey: ["admin-alerts"],
    queryFn: () => base44.entities.RouteAlert.list("-created_date", 50),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.RouteAlert.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-alerts"] });
      setShowDialog(false);
      setForm({ title: "", description: "", type: "traffic", severity: "medium", latitude: "", longitude: "" });
    },
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, active }) => base44.entities.RouteAlert.update(id, { active }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-alerts"] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.RouteAlert.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-alerts"] }),
  });

  const severityColors = {
    low: "bg-emerald-400/10 text-emerald-400",
    medium: "bg-yellow-400/10 text-yellow-400",
    high: "bg-orange-400/10 text-orange-400",
    critical: "bg-destructive/10 text-destructive",
  };

  return (
    <div>
      <div className="flex justify-end mb-4">
        <Button onClick={() => setShowDialog(true)} size="sm">
          <Plus className="w-4 h-4 mr-1.5" /> Novo Alerta
        </Button>
      </div>

      <div className="space-y-3">
        {alerts.length === 0 && (
          <div className="text-center py-12 text-muted-foreground rounded-xl border border-border bg-card">
            <AlertTriangle className="w-10 h-10 mx-auto mb-2 opacity-30" />
            <p className="text-sm">Nenhum alerta cadastrado</p>
          </div>
        )}
        {alerts.map((alert) => (
          <div key={alert.id} className="flex items-center gap-4 p-4 rounded-xl border border-border bg-card">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold">{alert.title}</p>
                <Badge className={severityColors[alert.severity]}>{alert.severity}</Badge>
                <Badge variant="secondary">{alert.type}</Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-1">{alert.description}</p>
            </div>
            <Switch 
              checked={alert.active} 
              onCheckedChange={(checked) => toggleMutation.mutate({ id: alert.id, active: checked })}
            />
            <Button variant="ghost" size="icon" onClick={() => deleteMutation.mutate(alert.id)}>
              <Trash2 className="w-4 h-4 text-destructive" />
            </Button>
          </div>
        ))}
      </div>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle>Novo Alerta</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Título</Label>
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="bg-secondary border-border" />
            </div>
            <div>
              <Label>Descrição</Label>
              <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="bg-secondary border-border" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Tipo</Label>
                <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
                  <SelectTrigger className="bg-secondary border-border"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="traffic">Trânsito</SelectItem>
                    <SelectItem value="flood">Alagamento</SelectItem>
                    <SelectItem value="accident">Acidente</SelectItem>
                    <SelectItem value="roadblock">Bloqueio</SelectItem>
                    <SelectItem value="weather">Clima</SelectItem>
                    <SelectItem value="construction">Obra</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Severidade</Label>
                <Select value={form.severity} onValueChange={(v) => setForm({ ...form, severity: v })}>
                  <SelectTrigger className="bg-secondary border-border"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Baixa</SelectItem>
                    <SelectItem value="medium">Média</SelectItem>
                    <SelectItem value="high">Alta</SelectItem>
                    <SelectItem value="critical">Crítica</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Latitude</Label>
                <Input type="number" step="any" value={form.latitude} onChange={(e) => setForm({ ...form, latitude: e.target.value })} className="bg-secondary border-border" />
              </div>
              <div>
                <Label>Longitude</Label>
                <Input type="number" step="any" value={form.longitude} onChange={(e) => setForm({ ...form, longitude: e.target.value })} className="bg-secondary border-border" />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>Cancelar</Button>
            <Button 
              disabled={!form.title || createMutation.isPending}
              onClick={() => createMutation.mutate({
                ...form,
                latitude: form.latitude ? Number(form.latitude) : undefined,
                longitude: form.longitude ? Number(form.longitude) : undefined,
              })}
            >
              Criar Alerta
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}