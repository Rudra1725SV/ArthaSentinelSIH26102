"use client";

import React, { useEffect, useRef, useState } from "react";

interface Node3D {
  x: number;
  y: number;
  z: number;
  baseRadius: number;
  isAnomaly: boolean;
  pulsePhase: number;
  anomalyLabel?: string;
}

export function NetworkGlobe({ className = "" }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [hoveredNode, setHoveredNode] = useState<{ x: number; y: number; label: string } | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = 0;
    let height = 0;

    // Generate ~220 points on a sphere using Fibonacci distribution
    const numPoints = 300;
    const sphereRadius = 260;
    const nodes: Node3D[] = [];

    const anomalyIndices = new Set([12, 34, 58, 89, 114, 142, 178, 195, 210]);
    const anomalyLabels: Record<number, string> = {
      12: "WRK-0419: Cost Anomaly (+86%)",
      34: "WRK-0102: Rate Discrepancy (+72%)",
      58: "WRK-0771: Asset Overlap (18m)",
      89: "WRK-0820: DPR Text Reuse (91%)",
      114: "WRK-0552: Tender Splitting Pattern",
      142: "WRK-0922: Spatial Cluster Flag",
      178: "WRK-0631: Rapid Sanction Spike",
      195: "WRK-0284: Peer Variance Flag",
      210: "WRK-0318: Unit Rate Outlier",
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
        x: x * sphereRadius,
        y: y * sphereRadius,
        z: z * sphereRadius,
        baseRadius: isAnomaly ? (i % 2 === 0 ? 5.5 : 4.2) : 1.8 + Math.random() * 0.8,
        isAnomaly,
        pulsePhase: Math.random() * Math.PI * 2,
        anomalyLabel: anomalyLabels[i],
      });
    }

    // Precalculate edges between nearby nodes (distance < threshold)
    const edges: [number, number][] = [];
    const maxDistance = sphereRadius * 0.42;
    for (let i = 0; i < numPoints; i++) {
      for (let j = i + 1; j < numPoints; j++) {
        const dx = nodes[i].x - nodes[j].x;
        const dy = nodes[i].y - nodes[j].y;
        const dz = nodes[i].z - nodes[j].z;
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
        if (dist < maxDistance) {
          edges.push([i, j]);
        }
      }
    }

    // Rotation angles
    let angleY = 0;
    let angleX = 0.25; // slight downward tilt
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
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const nx = (e.clientX - rect.left) / rect.width - 0.5;
      const ny = (e.clientY - rect.top) / rect.height - 0.5;
      mouseTiltX = ny * 0.3;
      mouseTiltY = nx * 0.4;
    };

    const containerEl = containerRef.current;
    if (containerEl) {
      containerEl.addEventListener("mousemove", handleMouseMove);
    }

    // Main render loop
    const render = () => {
      angleY += rotationSpeedY;
      const currentAngleX = angleX + mouseTiltX;
      const currentAngleY = angleY + mouseTiltY;

      ctx.clearRect(0, 0, width, height);

      const centerX = width / 2;
      const centerY = height / 2;
      const fov = 520;

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
        // Rotate around Y
        const x1 = node.x * cosY + node.z * sinY;
        const z1 = -node.x * sinY + node.z * cosY;
        // Rotate around X
        const y2 = node.y * cosX - z1 * sinX;
        const z2 = node.y * sinX + z1 * cosX;

        // Perspective scale - magnified projection
        const scale = fov / (fov + z2 + sphereRadius * 0.82);
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
      ctx.lineWidth = 0.75;
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

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
      if (containerEl) {
        containerEl.removeEventListener("mousemove", handleMouseMove);
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
        <div className="absolute top-2.5 left-3 font-mono text-[10px] tracking-widest text-slate-500 font-medium uppercase">
          FIG. 01 — NATIONAL MPLADS WORK NETWORK
        </div>

        {/* Top-right label */}
        <div className="absolute top-2.5 right-3 font-mono text-[10px] tracking-widest text-slate-500 font-medium uppercase flex items-center gap-1.5">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
          MODEL V2.4 · LIVE
        </div>

        {/* Bottom-right label */}
        <div className="absolute bottom-2.5 right-3 font-mono text-[10px] tracking-widest text-slate-400 font-medium uppercase">
          SYNTHETIC DATA
        </div>

        {/* Subtle crosshair guides */}
        <div className="absolute top-1/2 left-2 -translate-y-1/2 w-2 h-[1px] bg-slate-400/40"></div>
        <div className="absolute top-1/2 right-2 -translate-y-1/2 w-2 h-[1px] bg-slate-400/40"></div>
        <div className="absolute top-2 left-1/2 -translate-x-1/2 w-[1px] h-2 bg-slate-400/40"></div>
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-[1px] h-2 bg-slate-400/40"></div>
      </div>

      {/* 3D Canvas */}
      <canvas ref={canvasRef} className="w-full h-full block cursor-grab active:cursor-grabbing" />

      {/* Anomaly Indicator Legend */}
      <div className="absolute bottom-3 left-3 bg-[#FAF9F5]/90 backdrop-blur-xs border border-slate-200/80 px-2.5 py-1 rounded text-[10px] font-mono text-slate-600 flex items-center gap-3 pointer-events-none">
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-orange-600 inline-block"></span>
          Potential Anomaly Node
        </span>
        <span className="flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-slate-500 inline-block"></span>
          Peer Baseline Node
        </span>
      </div>
    </div>
  );
}
