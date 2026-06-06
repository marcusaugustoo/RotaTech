import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

export default function FeedbackDialog({ open, onOpenChange }) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (data) => base44.entities.RouteFeedback.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-feedbacks"] });
      onOpenChange(false);
      setRating(0);
      setComment("");
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border">
        <DialogHeader>
          <DialogTitle>Avaliar Rota de Hoje</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="flex justify-center gap-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <button key={i} onClick={() => setRating(i)}>
                <Star className={cn(
                  "w-8 h-8 transition-colors",
                  i <= rating ? "text-yellow-400 fill-yellow-400" : "text-muted-foreground"
                )} />
              </button>
            ))}
          </div>
          <Textarea
            placeholder="Como foi a rota de hoje? Algum problema?"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="bg-secondary border-border"
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button
            disabled={rating === 0 || mutation.isPending}
            onClick={() => mutation.mutate({
              route_date: new Date().toISOString().split("T")[0],
              rating,
              comment,
            })}
          >
            Enviar Avaliação
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}