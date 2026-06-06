import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export default function AdminBusStops() {
  const [showDialog, setShowDialog] = useState(false);
  const [form, setForm] = useState({ name: "", address: "", latitude: "", longitude: "", lines: "", has_shelter: false, accessibility: false });
  const queryClient = useQueryClient();

  const { data: stops = [] } = useQuery({
    queryKey: ["admin-bus-stops"],
    queryFn: () => base44.entities.BusStop.list("-created_date", 100),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.BusStop.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-bus-stops"] });
      setShowDialog(false);
      setForm({ name: "", address: "", latitude: "", longitude: "", lines: "", has_shelter: false, accessibility: false });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.BusStop.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-bus-stops"] }),
  });

  return (
    <div>
      <div className="flex justify-end mb-4">
        <Button onClick={() => setShowDialog(true)} size="sm">
          <Plus className="w-4 h-4 mr-1.5" /> Novo Ponto
        </Button>
      </div>

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-secondary/50">
              <TableHead>Nome</TableHead>
              <TableHead>Endereço</TableHead>
              <TableHead>Linhas</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {stops.map((s) => (
              <TableRow key={s.id}>
                <TableCell className="font-medium">{s.name}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{s.address}</TableCell>
                <TableCell>
                  <div className="flex gap-1 flex-wrap">
                    {(s.lines || []).map((l) => (
                      <Badge key={l} variant="secondary" className="text-[10px]">{l}</Badge>
                    ))}
                  </div>
                </TableCell>
                <TableCell>
                  <Button variant="ghost" size="icon" onClick={() => deleteMutation.mutate(s.id)}>
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {stops.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                  Nenhum ponto cadastrado
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle>Novo Ponto de Ônibus</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Nome</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="bg-secondary border-border" />
            </div>
            <div>
              <Label>Endereço</Label>
              <Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className="bg-secondary border-border" />
            </div>
            <div>
              <Label>Linhas (separar por vírgula)</Label>
              <Input placeholder="101, 202, 303" value={form.lines} onChange={(e) => setForm({ ...form, lines: e.target.value })} className="bg-secondary border-border" />
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
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Switch checked={form.has_shelter} onCheckedChange={(v) => setForm({ ...form, has_shelter: v })} />
                <Label>Cobertura</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={form.accessibility} onCheckedChange={(v) => setForm({ ...form, accessibility: v })} />
                <Label>Acessível</Label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>Cancelar</Button>
            <Button
              disabled={!form.name || createMutation.isPending}
              onClick={() => createMutation.mutate({
                ...form,
                lines: form.lines ? form.lines.split(",").map(l => l.trim()).filter(Boolean) : [],
                latitude: form.latitude ? Number(form.latitude) : undefined,
                longitude: form.longitude ? Number(form.longitude) : undefined,
              })}
            >
              Criar Ponto
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}