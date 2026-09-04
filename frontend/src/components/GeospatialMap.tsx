"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { WORKS, MAP_CLUSTERS, formatCurrency, getRiskTier, Work, MapCluster } from "@/lib/mock-data";
import { RiskBadge } from "@/components/RiskBadge";

// Leaflet CSS needs to be loaded client-side
export default function GeospatialMap() {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<any>(null);
  const [selectedWork, setSelectedWork] = useState<Work | null>(null);
  const [selectedCluster, setSelectedCluster] = useState<MapCluster | null>(null);
  const [layerFilter, setLayerFilter] = useState<"all" | "anomalies" | "critical" | "clusters">("all");

  useEffect(() => {
    // Only run on browser
    if (typeof window === "undefined" || !mapContainerRef.current) return;

    let isMounted = true;

    // Load Leaflet dynamically
    import("leaflet").then((L) => {
      if (!isMounted || !mapContainerRef.current) return;

      // Inject Leaflet CSS if not already present
      if (!document.getElementById("leaflet-css")) {
        const link = document.createElement("link");
        link.id = "leaflet-css";
        link.rel = "stylesheet";
        link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
        document.head.appendChild(link);
      }

      // If map already initialized, clear it
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
      }

      // Initialize map centered on Central India
      const map = L.map(mapContainerRef.current, {
        center: [22.9734, 78.6569], // Central India
        zoom: 5,
        zoomControl: true,
        scrollWheelZoom: true,
      });
      mapInstanceRef.current = map;

      // Add CartoDB Positron tiles for a clean, editorial, institutional aesthetic
      L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
        attribution: '&copy; <a href="https://carto.com/">CARTO</a>, OpenStreetMap contributors',
        subdomains: "abcd",
        maxZoom: 19,
      }).addTo(map);

      // Layer group for easy clearing on filter change
      const markersLayer = L.layerGroup().addTo(map);

      const renderMarkers = () => {
        markersLayer.clearLayers();

        // 1. Render Clusters
        if (layerFilter === "all" || layerFilter === "clusters") {
          MAP_CLUSTERS.forEach((cluster) => {
            const clusterIcon = L.divIcon({
              className: "custom-cluster-marker",
              html: `
                <div style="
                  background: rgba(234, 88, 12, 0.2);
                  border: 2px solid #EA580C;
                  width: 44px;
                  height: 44px;
                  border-radius: 50%;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  cursor: pointer;
                  box-shadow: 0 0 12px rgba(234,88,12,0.4);
                ">
                  <div style="
                    background: #EA580C;
                    color: white;
                    width: 28px;
                    height: 28px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 11px;
                    font-weight: bold;
                    font-family: monospace;
                  ">
                    ${cluster.totalWorks}
                  </div>
                </div>
              `,
              iconSize: [44, 44],
              iconAnchor: [22, 22],
            });

            const marker = L.marker([cluster.centerLat, cluster.centerLng], { icon: clusterIcon }).addTo(markersLayer);
            marker.on("click", () => {
              setSelectedCluster(cluster);
              setSelectedWork(null);
            });
          });
        }

        // 2. Render Individual Works
        if (layerFilter !== "clusters") {
          WORKS.forEach((w) => {
            if (layerFilter === "critical" && w.riskScore < 80) return;
            if (layerFilter === "anomalies" && w.anomalyTypes.length === 0) return;

            const isCritical = w.riskScore >= 80;
            const isElevated = w.riskScore >= 60;
            const hasAnomalies = w.anomalyTypes.length > 0;

            const color = isCritical ? "#DC2626" : isElevated ? "#EA580C" : hasAnomalies ? "#D97706" : "#2563EB";
            const radius = isCritical ? 9 : isElevated ? 7.5 : 6;

            const circleMarker = L.circleMarker([w.latitude, w.longitude], {
              radius,
              fillColor: color,
              color: "#FFFFFF",
              weight: 2,
              opacity: 0.9,
              fillOpacity: 0.85,
            }).addTo(markersLayer);

            circleMarker.on("click", () => {
              setSelectedWork(w);
              setSelectedCluster(null);
            });
          });
        }
      };

      renderMarkers();
    });

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [layerFilter]);

  return (
    <div className="relative w-full h-[620px] rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
      {/* Map Element */}
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* Layer Filter Controls Overlay */}
      <div className="absolute top-4 left-4 z-10 bg-white/95 backdrop-blur-xs border border-slate-200 rounded-lg p-1.5 shadow-sm flex items-center gap-1 text-xs">
        {[
          { id: "all", label: "All Works" },
          { id: "anomalies", label: "Flagged Only" },
          { id: "critical", label: "Critical (>80)" },
          { id: "clusters", label: "Clusters" },
        ].map((f) => (
          <button
            key={f.id}
            onClick={() => setLayerFilter(f.id as any)}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors cursor-pointer ${
              layerFilter === f.id ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Legend Overlay */}
      <div className="absolute bottom-4 left-4 z-10 bg-white/95 backdrop-blur-xs border border-slate-200 rounded-lg px-3 py-2 shadow-sm text-[11px] font-mono text-slate-600 space-y-1">
        <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-red-600 inline-block"></span> Critical Risk (&gt;80)</div>
        <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-orange-500 inline-block"></span> Elevated Risk (60–80)</div>
        <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-blue-600 inline-block"></span> Normal Baseline</div>
        <div className="flex items-center gap-2"><span className="w-3.5 h-3.5 rounded-full border-2 border-orange-500 bg-orange-500/20 inline-block"></span> Spatial Cluster</div>
      </div>

      {/* Selected Work Detail Card Overlay */}
      {selectedWork && (
        <div className="absolute top-4 right-4 z-10 w-80 bg-white/98 backdrop-blur-sm border border-slate-200 rounded-xl p-4 shadow-lg space-y-3">
          <div className="flex items-start justify-between">
            <div>
              <span className="font-mono text-xs font-semibold text-blue-800 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                {selectedWork.workId}
              </span>
              <span className="ml-2 text-[11px] text-slate-500">{selectedWork.financialYear}</span>
            </div>
            <button
              onClick={() => setSelectedWork(null)}
              className="text-slate-400 hover:text-slate-700 text-sm font-mono cursor-pointer"
            >
              ✕
            </button>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-slate-900 line-clamp-2">{selectedWork.description}</h4>
            <p className="text-[11px] text-slate-500 mt-0.5">
              {selectedWork.constituency} · {selectedWork.district}, {selectedWork.state}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-xs">
            <div>
              <span className="text-[10px] text-slate-400 font-mono block">COST</span>
              <span className="font-semibold text-slate-900">{formatCurrency(selectedWork.sanctionedAmount)}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-mono block">DEVIATION</span>
              <span className="font-semibold text-orange-700">+{selectedWork.deviationPercentage}%</span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <RiskBadge score={selectedWork.riskScore} tier={getRiskTier(selectedWork.riskScore)} />
            <Link
              href={`/investigations/${selectedWork.workId}`}
              className="text-xs font-semibold text-blue-700 hover:underline"
            >
              Investigate →
            </Link>
          </div>
        </div>
      )}

      {/* Selected Cluster Card Overlay */}
      {selectedCluster && (
        <div className="absolute top-4 right-4 z-10 w-80 bg-white/98 backdrop-blur-sm border border-orange-200 rounded-xl p-4 shadow-lg space-y-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-orange-600"></span>
              <span className="font-heading text-xs font-bold text-slate-900">{selectedCluster.label}</span>
            </div>
            <button
              onClick={() => setSelectedCluster(null)}
              className="text-slate-400 hover:text-slate-700 text-sm font-mono cursor-pointer"
            >
              ✕
            </button>
          </div>

          <p className="text-xs text-slate-600">
            DBSCAN spatial concentration detected {selectedCluster.totalWorks} works in close proximity.
          </p>

          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-xs font-mono">
            <div className="bg-orange-50 p-2 rounded border border-orange-200">
              <span className="text-[10px] text-orange-700 block">FLAGGED WORKS</span>
              <span className="text-sm font-bold text-orange-900">{selectedCluster.flaggedCost}</span>
            </div>
            <div className="bg-slate-50 p-2 rounded border border-slate-200">
              <span className="text-[10px] text-slate-500 block">UNDER REVIEW</span>
              <span className="text-sm font-bold text-slate-800">{selectedCluster.underInvestigation}</span>
            </div>
          </div>

          <div className="space-y-1 pt-1">
            <span className="text-[10px] text-slate-400 font-mono block">LINKED WORKS:</span>
            {selectedCluster.workIds.map((id) => (
              <Link
                key={id}
                href={`/investigations/${id}`}
                className="block text-xs font-mono text-blue-700 hover:underline"
              >
                → {id}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
