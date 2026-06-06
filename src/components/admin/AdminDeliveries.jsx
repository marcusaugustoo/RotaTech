import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";

const statusColors = {
  pending: "bg-yellow-400/10 text-yellow-400",
  in_transit: "bg-accent/10 text-accent",
  delivered: "bg-emerald-400/10 text-emerald-400",
  failed: "bg-destructive/10 text-destructive",
};

export default function AdminDeliveries() {
  const [showDialog, setShowDialog] = useState(false);
  const [form, setForm] = useState({
    recipient_name: "", address: "", driver_email: "",
    date: new Date().toISOString().split("T")[0],
    estimated_time: "", package_weight: "", order_in_route: ""
  });
  const queryClient = useQueryClient();

  const { data: deliveries = [], isLoading } = useQuery({
    queryKey: ["admin-deliveries"],
    queryFn: () => base44.entities.Delivery.list("-created_date", 100),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Delivery.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-deliveries"] });
      setShowDialog(false);
      setForm({ recipient_name: "", address: "", driver_email: "", date: new Date().toISOString().split("T")[0], estimated_time: "", package_weight: "", order_in_route: "" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Delivery.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-deliveries"] }),
  });

  return (
    <div>
      <div className="flex justify-end mb-4">
        <Button onClick={() => setShowDialog(true)} size="sm">
          <Plus className="w-4 h-4 mr-1.5" /> Nova Entrega
        </Button>
      </div>

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-secondary/50">
              <TableHead>Destinatário</TableHead>
              <TableHead>Endereço</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Data</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {deliveries.map((d) => (
              <TableRow key={d.id}>
                <TableCell className="font-medium">{d.recipient_name}</TableCell>
                <TableCell className="text-muted-foreground text-sm">{d.address}</TableCell>
                <TableCell>
                  <Badge className={statusColors[d.status]}>{d.status}</Badge>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">{d.date}</TableCell>
                <TableCell>
                  <Button variant="ghost" size="icon" onClick={() => deleteMutation.mutate(d.id)}>
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {deliveries.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  Nenhuma entrega cadastrada
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle>Nova Entrega</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Destinatário</Label>
              <Input value={form.recipient_name} onChange={(e) => setForm({ ...form, recipient_name: e.target.value })} className="bg-secondary border-border" />
            </div>
            <div>
              <Label>Endereço</Label>
              <Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className="bg-secondary border-border" />
            </div>
            <div>
              <Label>Email do Motorista</Label>
              <Input value={form.driver_email} onChange={(e) => setForm({ ...form, driver_email: e.target.value })} className="bg-secondary border-border" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Data</Label>
                <Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className="bg-secondary border-border" />
              </div>
              <div>
                <Label>Tempo Estimado</Label>
                <Input placeholder="Ex: 15min" value={form.estimated_time} onChange={(e) => setForm({ ...form, estimated_time: e.target.value })} className="bg-secondary border-border" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Peso (kg)</Label>
                <Input type="number" value={form.package_weight} onChange={(e) => setForm({ ...form, package_weight: e.target.value })} className="bg-secondary border-border" />
              </div>
              <div>
                <Label>Ordem na Rota</Label>
                <Input type="number" value={form.order_in_route} onChange={(e) => setForm({ ...form, order_in_route: e.target.value })} className="bg-secondary border-border" />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>Cancelar</Button>
            <Button 
              disabled={!form.recipient_name || !form.address || createMutation.isPending}
              onClick={() => createMutation.mutate({
                ...form,
                package_weight: form.package_weight ? Number(form.package_weight) : undefined,
                order_in_route: form.order_in_route ? Number(form.order_in_route) : undefined,
              })}
            >
              Criar Entrega
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}