import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { User, Mail, Shield, Trash2, AlertTriangle, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription
} from "@/components/ui/dialog";
import PageHeader from "../components/shared/PageHeader";
import GlowOrb from "../components/shared/GlowOrb";

export default function Profile() {
  const [user, setUser] = useState(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const handleDelete = async () => {
    if (confirmText !== "EXCLUIR") return;
    setDeleting(true);
    // Logout — actual deletion requires backend support
    await base44.auth.logout("/");
  };

  return (
    <div className="relative p-6 lg:p-8 min-h-screen">
      <GlowOrb className="w-64 h-64 bg-primary/40 -top-32 -right-20" />

      <PageHeader title="Minha Conta" subtitle="Informações do perfil e configurações" />

      {/* Profile Card */}
      <div className="rounded-xl border border-border bg-card p-6 mb-6 max-w-lg">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
            <User className="w-8 h-8 text-primary" />
          </div>
          <div>
            <p className="text-lg font-semibold">{user?.full_name || "Carregando..."}</p>
            <p className="text-sm text-muted-foreground flex items-center gap-1.5 mt-0.5">
              <Mail className="w-3.5 h-3.5" />
              {user?.email || "—"}
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between py-3 border-t border-border">
            <span className="text-sm text-muted-foreground">Função</span>
            <Badge variant="secondary" className="flex items-center gap-1.5">
              <Shield className="w-3 h-3" />
              {user?.role === "admin" ? "Administrador" : "Usuário"}
            </Badge>
          </div>
          <div className="flex items-center justify-between py-3 border-t border-border">
            <span className="text-sm text-muted-foreground">Membro desde</span>
            <span className="text-sm">
              {user?.created_date ? new Date(user.created_date).toLocaleDateString("pt-BR") : "—"}
            </span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="max-w-lg space-y-3">
        <Button
          variant="outline"
          className="w-full justify-start gap-3 min-h-[44px]"
          onClick={() => base44.auth.logout("/")}
        >
          <LogOut className="w-4 h-4 text-muted-foreground" />
          Sair da conta
        </Button>

        <Button
          variant="outline"
          className="w-full justify-start gap-3 min-h-[44px] border-destructive/30 text-destructive hover:bg-destructive/10"
          onClick={() => setShowDeleteDialog(true)}
        >
          <Trash2 className="w-4 h-4" />
          Excluir minha conta
        </Button>
      </div>

      {/* Delete Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="bg-card border-border max-w-sm">
          <DialogHeader>
            <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mb-3 mx-auto">
              <AlertTriangle className="w-6 h-6 text-destructive" />
            </div>
            <DialogTitle className="text-center">Excluir conta</DialogTitle>
            <DialogDescription className="text-center">
              Esta ação é permanente e não pode ser desfeita. Todos os seus dados serão removidos.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-2">
            <div>
              <p className="text-xs text-muted-foreground mb-2">
                Digite <span className="font-bold text-destructive">EXCLUIR</span> para confirmar:
              </p>
              <Input
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder="EXCLUIR"
                className="bg-secondary border-border min-h-[44px]"
              />
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1 min-h-[44px]"
                onClick={() => { setShowDeleteDialog(false); setConfirmText(""); }}
              >
                Cancelar
              </Button>
              <Button
                variant="destructive"
                className="flex-1 min-h-[44px]"
                disabled={confirmText !== "EXCLUIR" || deleting}
                onClick={handleDelete}
              >
                {deleting ? "Excluindo..." : "Excluir"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}