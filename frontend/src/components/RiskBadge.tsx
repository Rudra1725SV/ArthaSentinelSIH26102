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
      ? (score > 1 ? score >= 80 : score >= 0.8)
        ? "Critical"
        : (score > 1 ? score >= 60 : score >= 0.6)
        ? "Elevated"
        : (score > 1 ? score >= 30 : score >= 0.3)
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
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs sm:text-sm font-semibold border ${current.bg} ${current.border} ${current.text} ${className}`}
    >
      <span className={`w-2 h-2 rounded-full ${current.dot}`}></span>
      <span>{current.label}</span>
      {showScore && score !== undefined && (
        <span className="font-mono text-xs sm:text-sm opacity-85">({score.toFixed(2)})</span>
      )}
    </span>
  );
}
