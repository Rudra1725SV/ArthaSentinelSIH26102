"use client";

import React, { useEffect, useRef, useState } from "react";

interface Node3D {
  ux: number;
  uy: number;
  uz: number;
  baseRadius: number;
  isAnomaly: boolean;
  pulsePhase: number;
  anomalyLabel?: string;
}

interface HoveredAnomalyData {
  x: number;
  y: number;
  label: string;
  workId: string;
  metric: string;
  risk: number;
  constituency: string;
}

export function NetworkGlobe({ className = "" }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [hoveredNode, setHoveredNode] = useState<HoveredAnomalyData | null>(null);
  const hoveredNodeRef = useRef<HoveredAnomalyData | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = 0;
    let height = 0;
    let sphereRadius = 320; // Dynamically scaled to fit boundary

    // Generate points on a unit sphere using Fibonacci distribution
    const numPoints = 320;
    const nodes: Node3D[] = [];

    const anomalyIndices = new Set([12, 34, 58, 89, 114, 142, 178, 195, 210]);
    const anomalyDetails: Record<number, { workId: string; label: string; metric: string; risk: number; constituency: string }> = {
      12: { workId: "WRK-0419", label: "Cost Anomaly (+86%)", metric: "Sanction vs Target Outlier", risk: 94, constituency: "Purnia (BR)" },
      34: { workId: "WRK-0102", label: "Rate Discrepancy (+72%)", metric: "Unit Rate vs State Baseline", risk: 88, constituency: "Indore (MP)" },
      58: { workId: "WRK-0771", label: "Cross-Scheme Overlap", metric: "Identical DPR Description", risk: 92, constituency: "Nanded (MH)" },
      89: { workId: "WRK-0820", label: "DPR Text Reuse (91%)", metric: "Duplicate Work Item Hash", risk: 85, constituency: "Kurnool (AP)" },
      114: { workId: "WRK-0552", label: "Tender Splitting Pattern", metric: "Sub-threshold Clustering", risk: 91, constituency: "Varanasi (UP)" },
      142: { workId: "WRK-0922", label: "Constituency Cluster Flag", metric: "High Single-Vendor Outflow", risk: 89, constituency: "Jaipur (RJ)" },
      178: { workId: "WRK-0631", label: "Rapid Sanction Spike", metric: "End-of-FY Batch Approval", risk: 84, constituency: "Thane (MH)" },
      195: { workId: "WRK-0284", label: "Peer Variance Flag", metric: "Expenditure Speed Disparity", risk: 87, constituency: "Guntur (AP)" },
      210: { workId: "WRK-0318", label: "Unit Rate Outlier", metric: "High Material Rate Variance", risk: 90, constituency: "Patna Sahib (BR)" },
    };

    const phi = Math.PI * (Math.sqrt(5) - 1); // golden angle

    for (let i = 0; i < numPoints; i++) {
      const y = 1 - (i / (numPoints - 1)) * 2; // y goes from 1 to -1
      const radiusAtY = Math.sqrt(1 - y * y);
      const theta = phi * i;

      const x = Math.cos(theta) * radiusAtY;
      const z = Math.sin(theta) * radiusAtY;

      const isAnomaly = anomalyIndices.has(i);
      nodes.push({
        ux: x,
        uy: y,
        uz: z,
        baseRadius: isAnomaly ? (i % 2 === 0 ? 6.2 : 4.8) : 2.0 + Math.random() * 0.9,
        isAnomaly,
        pulsePhase: Math.random() * Math.PI * 2,
        anomalyLabel: anomalyDetails[i]?.label,
      });
    }

    // Precalculate edges between nearby nodes (unit distance < threshold)
    const edges: [number, number][] = [];
    const maxUnitDistance = 0.40;
    for (let i = 0; i < numPoints; i++) {
      for (let j = i + 1; j < numPoints; j++) {
        const dx = nodes[i].ux - nodes[j].ux;
        const dy = nodes[i].uy - nodes[j].uy;
        const dz = nodes[i].uz - nodes[j].uz;
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
        if (dist < maxUnitDistance) {
          edges.push([i, j]);
        }
      }
    }

    // Rotation angles
    let angleY = 0;
    let angleX = 0.22; // slight downward tilt
    const rotationSpeedY = 0.0035; // smooth rotation
    let mouseTiltX = 0;
    let mouseTiltY = 0;

    const handleResize = () => {
      if (!canvas || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      width = rect.width;
      height = rect.height;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.scale(dpr, dpr);

      // Increase globe radius to fill the boundary cleanly leaving comfortable padding for labels/frame
      const minDimension = Math.min(width, height);
      sphereRadius = Math.max(220, Math.min(345, (minDimension / 2) - 34));
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    let mousePos: { x: number; y: number } | null = null;

    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const nx = (e.clientX - rect.left) / rect.width - 0.5;
      const ny = (e.clientY - rect.top) / rect.height - 0.5;
      mouseTiltX = ny * 0.25;
      mouseTiltY = nx * 0.35;
      mousePos = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };

    const handleMouseLeave = () => {
      mousePos = null;
      setHoveredNode(null);
    };

    const containerEl = containerRef.current;
    if (containerEl) {
      containerEl.addEventListener("mousemove", handleMouseMove);
      containerEl.addEventListener("mouseleave", handleMouseLeave);
    }

    // Main render loop
    const render = () => {
      angleY += rotationSpeedY;
      const currentAngleX = angleX + mouseTiltX;
      const currentAngleY = angleY + mouseTiltY;

      ctx.clearRect(0, 0, width, height);

      const centerX = width / 2;
      const centerY = height / 2;
      const fov = sphereRadius * 2.3;

      // Rotate nodes around X and Y axes
      const cosY = Math.cos(currentAngleY);
      const sinY = Math.sin(currentAngleY);
      const cosX = Math.cos(currentAngleX);
      const sinX = Math.sin(currentAngleX);

      interface ProjectedNode {
        idx: number;
        px: number;
        py: number;
        scale: number;
        rotZ: number;
        isAnomaly: boolean;
        baseRadius: number;
        pulsePhase: number;
        label?: string;
      }

      const projected: ProjectedNode[] = [];

      for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];
        const nx = node.ux * sphereRadius;
        const ny = node.uy * sphereRadius;
        const nz = node.uz * sphereRadius;

        // Rotate around Y
        const x1 = nx * cosY + nz * sinY;
        const z1 = -nx * sinY + nz * cosY;
        // Rotate around X
        const y2 = ny * cosX - z1 * sinX;
        const z2 = ny * sinX + z1 * cosX;

        // Perspective scale - magnified projection
        const scale = fov / (fov + z2 + sphereRadius * 0.42);
        const px = centerX + x1 * scale;
        const py = centerY + y2 * scale;

        projected.push({
          idx: i,
          px,
          py,
          scale,
          rotZ: z2,
          isAnomaly: node.isAnomaly,
          baseRadius: node.baseRadius,
          pulsePhase: node.pulsePhase,
          label: node.anomalyLabel,
        });
      }

      // Draw edges (lines) with depth-faded alpha
      ctx.lineWidth = 0.8;
      for (let e = 0; e < edges.length; e++) {
        const [i, j] = edges[e];
        const p1 = projected[i];
        const p2 = projected[j];

        // Only draw if within reasonable bounds
        const avgZ = (p1.rotZ + p2.rotZ) / 2;
        // z varies between -sphereRadius to +sphereRadius
        const depthFactor = (avgZ + sphereRadius) / (sphereRadius * 2);
        const alpha = Math.max(0.04, Math.min(0.28, depthFactor * 0.32));

        const isAnomalyEdge = p1.isAnomaly || p2.isAnomaly;

        ctx.beginPath();
        ctx.moveTo(p1.px, p1.py);
        ctx.lineTo(p2.px, p2.py);

        if (isAnomalyEdge) {
          ctx.strokeStyle = `rgba(234, 88, 12, ${alpha * 1.6})`;
        } else {
          ctx.strokeStyle = `rgba(100, 116, 139, ${alpha})`;
        }
        ctx.stroke();
      }

      // Sort nodes by rotZ so far nodes are drawn first
      const sorted = [...projected].sort((a, b) => a.rotZ - b.rotZ);

      // Pulse animation time
      const time = Date.now() * 0.003;

      // Draw nodes
      for (let s = 0; s < sorted.length; s++) {
        const p = sorted[s];
        const depthFactor = (p.rotZ + sphereRadius) / (sphereRadius * 2);
        const alpha = Math.max(0.25, Math.min(1, depthFactor));

        if (p.isAnomaly) {
          // Anomaly Node: Orange with pulsing halo
          const pulse = (Math.sin(time + p.pulsePhase) + 1) / 2;
          const r = p.baseRadius * p.scale * (1 + pulse * 0.15);

          // Outer halo
          ctx.beginPath();
          ctx.arc(p.px, p.py, r * 2.2, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(234, 88, 12, ${0.18 * alpha})`;
          ctx.fill();

          // Subtle outer stroke
          ctx.beginPath();
          ctx.arc(p.px, p.py, r * 1.6, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(249, 115, 22, ${0.4 * alpha})`;
          ctx.lineWidth = 1;
          ctx.stroke();

          // Core dot
          ctx.beginPath();
          ctx.arc(p.px, p.py, r, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(234, 88, 12, ${alpha})`;
          ctx.fill();

          // White center specular reflection
          ctx.beginPath();
          ctx.arc(p.px - r * 0.25, p.py - r * 0.25, r * 0.35, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 255, 255, ${0.7 * alpha})`;
          ctx.fill();
        } else {
          // Standard node: Slate blue/gray
          const r = p.baseRadius * p.scale;
          ctx.beginPath();
          ctx.arc(p.px, p.py, r, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(71, 85, 105, ${0.5 * alpha})`;
          ctx.fill();
        }
      }

      // Check for hover over potential anomaly nodes
      let foundAnomaly: HoveredAnomalyData | null = null;
      let minDistance = 24; // 24px threshold

      if (mousePos) {
        for (let i = 0; i < projected.length; i++) {
          const p = projected[i];
          if (p.isAnomaly && p.rotZ > -sphereRadius * 0.15) {
            const dx = mousePos.x - p.px;
            const dy = mousePos.y - p.py;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < minDistance) {
              minDistance = dist;
              const detail = anomalyDetails[p.idx] || {
                workId: `WRK-0${p.idx}`,
                label: p.label || "Potential Anomaly",
                metric: "Variance Outlier",
                risk: 88,
                constituency: "National Baseline",
              };
              foundAnomaly = {
                x: p.px,
                y: p.py,
                label: detail.label,
                workId: detail.workId,
                metric: detail.metric,
                risk: detail.risk,
                constituency: detail.constituency,
              };
            }
          }
        }
      }

      if (foundAnomaly) {
        if (!hoveredNodeRef.current || hoveredNodeRef.current.workId !== foundAnomaly.workId ||
            Math.abs(hoveredNodeRef.current.x - foundAnomaly.x) > 3 || Math.abs(hoveredNodeRef.current.y - foundAnomaly.y) > 3) {
          hoveredNodeRef.current = foundAnomaly;
          setHoveredNode(foundAnomaly);
        }
      } else {
        if (hoveredNodeRef.current !== null) {
          hoveredNodeRef.current = null;
          setHoveredNode(null);
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
      if (containerEl) {
        containerEl.removeEventListener("mousemove", handleMouseMove);
        containerEl.removeEventListener("mouseleave", handleMouseLeave);
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-[520px] md:h-[620px] lg:h-[700px] select-none ${className}`}
    >
      {/* Technical Blueprint Frame Overlay matching reference image */}
      <div className="absolute inset-0 pointer-events-none border border-slate-300/60 rounded-sm">
        {/* Corner Brackets */}
        <div className="absolute -top-[1px] -left-[1px] w-3 h-3 border-t-2 border-l-2 border-slate-600"></div>
        <div className="absolute -top-[1px] -right-[1px] w-3 h-3 border-t-2 border-r-2 border-slate-600"></div>
        <div className="absolute -bottom-[1px] -left-[1px] w-3 h-3 border-b-2 border-l-2 border-slate-600"></div>
        <div className="absolute -bottom-[1px] -right-[1px] w-3 h-3 border-b-2 border-r-2 border-slate-600"></div>

        {/* Top-left label */}
        <div className="absolute top-2.5 left-3 font-mono text-xs tracking-wider text-slate-600 font-semibold uppercase">
          FIG. 01 — NATIONAL MPLADS WORK NETWORK
        </div>

        {/* Top-right label */}
        <div className="absolute top-2.5 right-3 font-mono text-xs tracking-wider text-slate-600 font-semibold uppercase flex items-center gap-1.5">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          MODEL V2.4 · LIVE
        </div>

        {/* Bottom-right label */}
        <div className="absolute bottom-2.5 right-3 font-mono text-xs tracking-wider text-slate-500 font-semibold uppercase">
          REAL MPLADS NETWORK · 23,044 WORKS
        </div>

        {/* Subtle crosshair guides */}
        <div className="absolute top-1/2 left-2 -translate-y-1/2 w-2 h-[1px] bg-slate-400/40"></div>
        <div className="absolute top-1/2 right-2 -translate-y-1/2 w-2 h-[1px] bg-slate-400/40"></div>
        <div className="absolute top-2 left-1/2 -translate-x-1/2 w-[1px] h-2 bg-slate-400/40"></div>
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-[1px] h-2 bg-slate-400/40"></div>
      </div>

      {/* 3D Canvas */}
      <canvas ref={canvasRef} className="w-full h-full block cursor-grab active:cursor-grabbing" />

      {/* Interactive Hover Card for Potential Anomaly Node */}
      {hoveredNode && (
        <div
          className="absolute pointer-events-none z-30 transition-all duration-75 ease-out"
          style={{
            left: `${Math.max(16, hoveredNode.x + 14)}px`,
            top: `${Math.max(16, hoveredNode.y - 48)}px`,
          }}
        >
          <div className="bg-[#0B1528]/95 backdrop-blur-md border border-orange-500/70 rounded-lg p-3 shadow-2xl text-white w-56">
            <div className="flex items-center justify-between border-b border-white/10 pb-1.5 mb-1.5">
              <span className="font-mono text-[10px] uppercase tracking-wider font-bold text-orange-400 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-ping inline-block"></span>
                {hoveredNode.workId}
              </span>
              <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-orange-500/20 text-orange-300 font-bold border border-orange-500/30">
                Risk {hoveredNode.risk}%
              </span>
            </div>
            <p className="font-semibold text-slate-100 text-[11px] leading-tight mb-1.5">
              {hoveredNode.label}
            </p>
            <div className="text-[10px] text-slate-400 font-mono flex items-center justify-between pt-1 border-t border-white/5">
              <span>{hoveredNode.constituency}</span>
              <span className="text-amber-300 font-medium">{hoveredNode.metric}</span>
            </div>
          </div>
        </div>
      )}

      {/* Anomaly Indicator Legend */}
      <div className="absolute bottom-3 left-3 bg-[#FAF9F5]/90 backdrop-blur-xs border border-slate-200/80 px-3 py-1.5 rounded text-xs font-mono text-slate-700 flex items-center gap-3 pointer-events-none">
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-orange-600 inline-block"></span>
          Potential Anomaly Node
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-slate-500 inline-block"></span>
          Peer Baseline Node
        </span>
      </div>
    </div>
  );
}
