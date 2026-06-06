import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger
} from "@/components/ui/dialog";

const THREE_LAGOAS_CENTER = { lat: -20.7849, lng: -51.7011 };

export default function ReportIssueDialog() {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    title: "", description: "", type: "traffic", severity: "medium",
    latitude: "", longitude: ""
  });

  const mutation = useMutation({
    mutationFn: (data) => base44.entities.RouteAlert.create({ ...data, active: true }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["map-alerts"] });
      setOpen(false);
      setForm({ title: "", description: "", type: "traffic", severity: "medium", latitude: "", longitude: "" });
    },
  });

  const handleSubmit = () => {
    mutation.mutate({
      ...form,
      latitude: form.latitude ? parseFloat(form.latitude) : THREE_LAGOAS_CENTER.lat,
      longitude: form.longitude ? parseFloat(form.longitude) : THREE_LAGOAS_CENTER.lng,
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="shrink-0 border-destructive/40 text-destructive hover:bg-destructive/10"
        >
          <AlertTriangle className="w-3.5 h-3.5 mr-1.5" />
          Reportar Problema
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reportar Problema na Via</DialogTitle>
        </DialogHeader>
        <p className="text-xs text-muted-foreground">
          Ajude a comunidade informando ocorrências em Três Lagoas.
        </p>
        <div className="space-y-3 mt-2">
          <Input
            placeholder="Título do problema *"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />
          <Input
            placeholder="Descrição (opcional)"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
          <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
            <SelectTrigger><SelectValue placeholder="Tipo" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="traffic">Trânsito intenso</SelectItem>
              <SelectItem value="flood">Alagamento</SelectItem>
              <SelectItem value="accident">Acidente</SelectItem>
              <SelectItem value="roadblock">Bloqueio / Interdição</SelectItem>
              <SelectItem value="weather">Condições climáticas</SelectItem>
              <SelectItem value="construction">Obra</SelectItem>
            </SelectContent>
          </Select>
          <Select value={form.severity} onValueChange={(v) => setForm({ ...form, severity: v })}>
            <SelectTrigger><SelectValue placeholder="Gravidade" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Baixa</SelectItem>
              <SelectItem value="medium">Média</SelectItem>
              <SelectItem value="high">Alta</SelectItem>
              <SelectItem value="critical">Crítico</SelectItem>
            </SelectContent>
          </Select>
          <div className="grid grid-cols-2 gap-2">
            <Input
              placeholder="Latitude (opcional)"
              value={form.latitude}
              onChange={(e) => setForm({ ...form, latitude: e.target.value })}
            />
            <Input
              placeholder="Longitude (opcional)"
              value={form.longitude}
              onChange={(e) => setForm({ ...form, longitude: e.target.value })}
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Se não informar coordenadas, o centro de Três Lagoas será usado.
          </p>
          <Button
            className="w-full"
            onClick={handleSubmit}
            disabled={!form.title || mutation.isPending}
          >
            {mutation.isPending ? "Enviando..." : "Enviar Relatório"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}