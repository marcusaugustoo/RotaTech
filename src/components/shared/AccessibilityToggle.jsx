import React from "react";
import { useAccessibility } from "@/context/AccessibilityContext";
import { Accessibility } from "lucide-react";
import { cn } from "@/lib/utils";

export default function AccessibilityToggle({ collapsed }) {
  const { accessible, setAccessible } = useAccessibility();

  return (
    <button
      onClick={() => setAccessible(!accessible)}
      className={cn(
        "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors w-full",
        accessible
          ? "bg-accent/20 text-accent font-semibold"
          : "text-muted-foreground hover:text-foreground hover:bg-secondary"
      )}
      title="Modo Acessível para Idosos"
    >
      <Accessibility className="w-5 h-5 shrink-0" />
      {!collapsed && (
        <span>{accessible ? "Acessível ✓" : "Modo Idoso"}</span>
      )}
    </button>
  );
}