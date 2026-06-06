import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import MobileNav from "./MobileNav";

export default function AppLayout() {
  return (
    <div className="min-h-screen bg-background" style={{ paddingTop: "env(safe-area-inset-top)" }}>
      <div className="hidden md:block">
        <Sidebar />
      </div>
      <main className="md:ml-60 pb-20 md:pb-0" style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 5rem)" }}>
        <Outlet />
      </main>
      <MobileNav />
    </div>
  );
}