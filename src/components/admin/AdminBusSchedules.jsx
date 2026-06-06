import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Plus, Trash2, Bus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

export default function AdminBusSchedules() {
  const [showDialog, setShowDialog] = useState(false);
  const [form, setForm] = useState({ 
    line_number: "", line_name: "", fare: "", estimated_duration: "",
    departure_times: "", route_stops: ""
  });
  const queryClient = useQueryClient();

  const { data: schedules = [] } = useQuery({
    queryKey: ["admin-schedules"],
    queryFn: () => base44.entities.BusSchedule.list("-created_date", 50),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.BusSchedule.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-schedules"] });
      setShowDialog(false);
      setForm({ line_number: "", line_name: "", fare: "", estimated_duration: "", departure_times: "", route_stops: "" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.BusSchedule.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-schedules"] }),
  });

  return (
    <div>
      <div className="flex justify-end mb-4">
        <Button onClick={() => setShowDialog(true)} size="sm">
          <Plus className="w-4 h-4 mr-1.5" /> Nova Linha
        </Button>
      </div>

      <div className="space-y-3">
        {schedules.length === 0 && (
          <div className="text-center py-12 text-muted-foreground rounded-xl border border-border bg-card">
            <Bus className="w-10 h-10 mx-auto mb-2 opacity-30" />
            <p className="text-sm">Nenhuma linha cadastrada</p>
          </div>
        )}
        {schedules.map((s) => (
          <div key={s.id} className="flex items-center gap-4 p-4 rounded-xl border border-border bg-card">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shrink-0">
              <span className="text-sm font-bold text-white">{s.line_number}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold">{s.line_name}</p>
              <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                {s.fare && <span>R$ {s.fare.toFixed(2)}</span>}
                {s.estimated_duration && <span>• {s.estimated_duration}</span>}
              </div>
            </div>
            <Badge variant={s.active !== false ? "default" : "secondary"}>
              {s.active !== false ? "Ativa" : "Inativa"}
            </Badge>
            <Button variant="ghost" size="icon" onClick={() => deleteMutation.mutate(s.id)}>
              <Trash2 className="w-4 h-4 text-destructive" />
            </Button>
          </div>
        ))}
      </div>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle>Nova Linha de Ônibus</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Número da Linha</Label>
                <Input value={form.line_number} onChange={(e) => setForm({ ...form, line_number: e.target.value })} className="bg-secondary border-border" />
              </div>
              <div>
                <Label>Nome da Linha</Label>
                <Input value={form.line_name} onChange={(e) => setForm({ ...form, line_name: e.target.value })} className="bg-secondary border-border" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Valor (R$)</Label>
                <Input type="number" step="0.01" value={form.fare} onChange={(e) => setForm({ ...form, fare: e.target.value })} className="bg-secondary border-border" />
              </div>
              <div>
                <Label>Duração Estimada</Label>
                <Input placeholder="Ex: 45min" value={form.estimated_duration} onChange={(e) => setForm({ ...form, estimated_duration: e.target.value })} className="bg-secondary border-border" />
              </div>
            </div>
            <div>
              <Label>Horários de saída (separar por vírgula)</Label>
              <Input placeholder="06:00, 06:30, 07:00" value={form.departure_times} onChange={(e) => setForm({ ...form, departure_times: e.target.value })} className="bg-secondary border-border" />
            </div>
            <div>
              <Label>Paradas (separar por vírgula)</Label>
              <Input placeholder="Terminal Central, Praça XV, ..." value={form.route_stops} onChange={(e) => setForm({ ...form, route_stops: e.target.value })} className="bg-secondary border-border" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>Cancelar</Button>
            <Button
              disabled={!form.line_number || !form.line_name || createMutation.isPending}
              onClick={() => createMutation.mutate({
                line_number: form.line_number,
                line_name: form.line_name,
                fare: form.fare ? Number(form.fare) : undefined,
                estimated_duration: form.estimated_duration,
                departure_times: form.departure_times ? form.departure_times.split(",").map(t => t.trim()).filter(Boolean) : [],
                route_stops: form.route_stops ? form.route_stops.split(",").map(s => s.trim()).filter(Boolean) : [],
              })}
            >
              Criar Linha
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}