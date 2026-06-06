import React from "react";
import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, Truck, Map, Bus, Shield, UserCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { path: "/", icon: LayoutDashboard, label: "Home" },
  { path: "/driver", icon: Truck, label: "Motorista" },
  { path: "/map", icon: Map, label: "Mapa" },
  { path: "/passenger", icon: Bus, label: "Ônibus" },
  { path: "/admin", icon: Shield, label: "Admin" },
  { path: "/profile", icon: UserCircle, label: "Perfil" },
];

export default function MobileNav() {
  const location = useLocation();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-[9999] md:hidden bg-card border-t border-border select-none"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="flex items-center justify-around py-1 px-1">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-lg text-xs transition-colors min-h-[44px] min-w-[44px] justify-center",
                isActive ? "text-primary" : "text-muted-foreground"
              )}
            >
              <item.icon className="w-5 h-5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}