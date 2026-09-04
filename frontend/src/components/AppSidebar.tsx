"use client";

import React from "react";
import { Navbar } from "@/components/Navbar";

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#FAF9F5] text-slate-900 bg-grid-warm flex flex-col">
      <Navbar />
      <main className="flex-1 mx-auto w-full max-w-[1500px] px-4 sm:px-8 py-6 sm:py-8">
        {children}
      </main>
    </div>
  );
}

export function AppSidebar() {
  return null;
}
