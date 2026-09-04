"use client";

import React from "react";
import dynamic from "next/dynamic";
import { DashboardLayout } from "@/components/AppSidebar";

// Dynamically import map component with SSR disabled
const GeospatialMap = dynamic(() => import("@/components/GeospatialMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[620px] rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-center">
      <div className="flex items-center gap-2 font-mono text-xs text-slate-500">
        <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-pulse"></span>
        Loading Geographic Canvas &amp; GeoJSON layers...
      </div>
    </div>
  ),
});

export default function MapPage() {
  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8 space-y-6">
        <div>
          <h1 className="font-heading text-2xl font-bold tracking-tight text-slate-950">Geospatial Analysis</h1>
          <p className="text-sm text-slate-600 mt-0.5">
            Spatial distribution, multi-work clusters, and infrastructure co-location across parliamentary constituencies.
          </p>
        </div>

        <GeospatialMap />

        {/* Bottom context strip */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs space-y-1">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">SPATIAL INDEXING</span>
            <div className="text-sm font-semibold text-slate-900">Haversine Distance Graph</div>
            <p className="text-xs text-slate-500">Computes geographic distance between all works to detect abnormal proximity.</p>
          </div>
          <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs space-y-1">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">CLUSTER DETECTION</span>
            <div className="text-sm font-semibold text-slate-900">DBSCAN Density Corridors</div>
            <p className="text-xs text-slate-500">Groups works within 10km radii sanctioned within 60 days to expose tender splitting.</p>
          </div>
          <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs space-y-1">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">CROSS-SCHEME GIS</span>
            <div className="text-sm font-semibold text-slate-900">National Asset Registry</div>
            <p className="text-xs text-slate-500">Flags overlapping assets within 50 meters of Jal Jeevan Mission and PMGSY sites.</p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
