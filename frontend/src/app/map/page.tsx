"use client";

import React from "react";
import dynamic from "next/dynamic";
import { DashboardLayout } from "@/components/AppSidebar";

// Dynamically import map component with SSR disabled
const GeospatialMap = dynamic(() => import("@/components/GeospatialMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[640px] rounded-2xl border border-slate-200 bg-slate-50 flex items-center justify-center">
      <div className="flex items-center gap-2.5 font-data text-xs text-slate-500">
        <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-pulse"></span>
        Loading Geographic Canvas &amp; GeoJSON layers...
      </div>
    </div>
  ),
});

export default function MapPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <div className="font-emphasis text-xs font-bold tracking-wider text-sky-800 uppercase">
            GEOGRAPHIC INFORMATION SYSTEM · GIS CLUSTERS
          </div>
          <h1 className="font-heading text-3xl font-bold tracking-tight text-slate-950 mt-1">Geospatial Analysis</h1>
          <p className="font-sans text-sm sm:text-base text-slate-600 mt-1">
            Spatial distribution, multi-work clusters, and infrastructure co-location across parliamentary constituencies.
          </p>
        </div>

        <GeospatialMap />

        {/* Bottom context strip */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          <div className="p-5 rounded-2xl border border-slate-200 bg-white shadow-2xs space-y-1.5">
            <span className="text-[10px] font-emphasis font-bold uppercase tracking-wider text-slate-500">SPATIAL INDEXING</span>
            <div className="font-heading text-base font-bold text-slate-900">Haversine Distance Graph</div>
            <p className="font-sans text-xs text-slate-600">Computes geographic distance between all works to detect abnormal proximity.</p>
          </div>
          <div className="p-5 rounded-2xl border border-slate-200 bg-white shadow-2xs space-y-1.5">
            <span className="text-[10px] font-emphasis font-bold uppercase tracking-wider text-slate-500">CLUSTER DETECTION</span>
            <div className="font-heading text-base font-bold text-slate-900">DBSCAN Density Corridors</div>
            <p className="font-sans text-xs text-slate-600">Groups works within 10km radii sanctioned within 60 days to expose tender splitting.</p>
          </div>
          <div className="p-5 rounded-2xl border border-slate-200 bg-white shadow-2xs space-y-1.5">
            <span className="text-[10px] font-emphasis font-bold uppercase tracking-wider text-slate-500">CROSS-SCHEME GIS</span>
            <div className="font-heading text-base font-bold text-slate-900">National Asset Registry</div>
            <p className="font-sans text-xs text-slate-600">Flags overlapping assets within 50 meters of Jal Jeevan Mission and PMGSY sites.</p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
