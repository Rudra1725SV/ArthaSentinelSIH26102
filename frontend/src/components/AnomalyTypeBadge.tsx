import React from "react";

interface AnomalyTypeBadgeProps {
  type: "cost" | "duplicate" | "geographic" | "pattern";
  className?: string;
}

export function AnomalyTypeBadge({ type, className = "" }: AnomalyTypeBadgeProps) {
  const meta = {
    cost: {
      label: "Cost Variance",
      bg: "bg-amber-50 text-amber-900 border-amber-200/80",
    },
    duplicate: {
      label: "Potential Duplicate",
      bg: "bg-indigo-50 text-indigo-900 border-indigo-200/80",
    },
    geographic: {
      label: "Spatial Cluster",
      bg: "bg-sky-50 text-sky-900 border-sky-200/80",
    },
    pattern: {
      label: "Pattern Outlier",
      bg: "bg-stone-100 text-stone-800 border-stone-300/80",
    },
  }[type];

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium border ${meta.bg} ${className}`}
    >
      {meta.label}
    </span>
  );
}
