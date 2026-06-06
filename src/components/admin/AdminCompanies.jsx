import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Building2, Plus, Trash2, Users, Mail, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger
} from "@/components/ui/dialog";

export default function AdminCompanies() {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    name: "", cnpj: "", contact_email: "", phone: "", address: "", driver_emails: ""
  });

  const { data: companies = [] } = useQuery({
    queryKey: ["admin-companies"],
    queryFn: () => base44.entities.Company.list("-created_date", 100),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Company.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-companies"] });
      setOpen(false);
      setForm({ name: "", cnpj: "", contact_email: "", phone: "", address: "", driver_emails: "" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Company.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-companies"] }),
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, active }) => base44.entities.Company.update(id, { active }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-companies"] }),
  });

  const handleCreate = () => {
    createMutation.mutate({
      ...form,
      driver_emails: form.driver_emails
        ? form.driver_emails.split(",").map((e) => e.trim()).filter(Boolean)
        : [],
    });
  };

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <Building2 className="w-5 h-5 text-primary" />
          <h2 className="font-semibold">Empresas Cadastradas</h2>
          <Badge variant="secondary">{companies.length}</Badge>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="w-4 h-4 mr-1" /> Nova Empresa
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Cadastrar Empresa</DialogTitle>
            </DialogHeader>
            <div className="space-y-3 mt-2">
              <Input
                placeholder="Nome da empresa *"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
              <Input
                placeholder="CNPJ"
                value={form.cnpj}
                onChange={(e) => setForm({ ...form, cnpj: e.target.value })}
              />
              <Input
                placeholder="E-mail de contato"
                value={form.contact_email}
                onChange={(e) => setForm({ ...form, contact_email: e.target.value })}
              />
              <Input
                placeholder="Telefone"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
              <Input
                placeholder="Endereço da sede"
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
              />
              <Input
                placeholder="E-mails dos motoristas (separados por vírgula)"
                value={form.driver_emails}
                onChange={(e) => setForm({ ...form, driver_emails: e.target.value })}
              />
              <Button
                className="w-full"
                onClick={handleCreate}
                disabled={!form.name || createMutation.isPending}
              >
                {createMutation.isPending ? "Salvando..." : "Cadastrar Empresa"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-3">
        {companies.length === 0 && (
          <p className="text-center text-muted-foreground text-sm py-8">
            Nenhuma empresa cadastrada ainda.
          </p>
        )}
        {companies.map((company) => (
          <div
            key={company.id}
            className="flex items-center justify-between p-4 rounded-lg bg-secondary/40 border border-border"
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <Building2 className="w-4 h-4 text-primary shrink-0" />
                <span className="font-medium text-sm">{company.name}</span>
                <Badge variant={company.active ? "default" : "secondary"} className="text-xs">
                  {company.active ? "Ativa" : "Inativa"}
                </Badge>
              </div>
              {company.cnpj && (
                <p className="text-xs text-muted-foreground mt-1">CNPJ: {company.cnpj}</p>
              )}
              <div className="flex items-center gap-4 mt-1 flex-wrap">
                {company.contact_email && (
                  <div className="flex items-center gap-1">
                    <Mail className="w-3 h-3 text-muted-foreground" />
                    <p className="text-xs text-muted-foreground">{company.contact_email}</p>
                  </div>
                )}
                {company.phone && (
                  <div className="flex items-center gap-1">
                    <Phone className="w-3 h-3 text-muted-foreground" />
                    <p className="text-xs text-muted-foreground">{company.phone}</p>
                  </div>
                )}
                {company.driver_emails?.length > 0 && (
                  <div className="flex items-center gap-1">
                    <Users className="w-3 h-3 text-muted-foreground" />
                    <p className="text-xs text-muted-foreground">
                      {company.driver_emails.length} motorista(s)
                    </p>
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2 ml-3">
              <Switch
                checked={!!company.active}
                onCheckedChange={(val) => toggleMutation.mutate({ id: company.id, active: val })}
              />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => deleteMutation.mutate(company.id)}
                className="text-destructive hover:bg-destructive/10 h-8 w-8"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}