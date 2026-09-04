import React from "react";

interface RiskBadgeProps {
  score?: number;
  tier?: "Low" | "Moderate" | "Elevated" | "Critical";
  showScore?: boolean;
  className?: string;
}

export function RiskBadge({ score, tier, showScore = true, className = "" }: RiskBadgeProps) {
  // If tier is not provided, derive from score
  const resolvedTier =
    tier ||
    (score !== undefined
      ? score >= 0.8
        ? "Critical"
        : score >= 0.6
        ? "Elevated"
        : score >= 0.3
        ? "Moderate"
        : "Low"
      : "Moderate");

  const styleMap = {
    Low: {
      bg: "bg-slate-100",
      border: "border-slate-300",
      text: "text-slate-700",
      dot: "bg-slate-400",
      label: "Low Variance",
    },
    Moderate: {
      bg: "bg-blue-50",
      border: "border-blue-200",
      text: "text-blue-700",
      dot: "bg-blue-500",
      label: "Moderate Flag",
    },
    Elevated: {
      bg: "bg-orange-50",
      border: "border-orange-200",
      text: "text-orange-800",
      dot: "bg-orange-500",
      label: "Elevated Risk",
    },
    Critical: {
      bg: "bg-red-50",
      border: "border-red-200",
      text: "text-red-800",
      dot: "bg-red-500",
      label: "Critical Flag",
    },
  };

  const current = styleMap[resolvedTier];

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-medium border ${current.bg} ${current.border} ${current.text} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${current.dot}`}></span>
      <span>{current.label}</span>
      {showScore && score !== undefined && (
        <span className="font-mono text-[11px] opacity-80">({score.toFixed(2)})</span>
      )}
    </span>
  );
}
