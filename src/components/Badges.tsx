import React from "react";
import { BloomLevel, CriticalityLevel, DifficultyTier } from "@/lib/companyData";

export const CATEGORY_COLORS: Record<string, { bg: string; text: string; border: string; hex: string }> = {
  "Super Dream": { bg: "bg-purple-50", text: "text-[#7c3aed]", border: "border-purple-200", hex: "#7c3aed" },
  Dream: { bg: "bg-blue-50", text: "text-[#2563eb]", border: "border-blue-200", hex: "#2563eb" },
  Standard: { bg: "bg-emerald-50", text: "text-[#16a34a]", border: "border-emerald-200", hex: "#16a34a" },
  Regular: { bg: "bg-amber-50", text: "text-[#d97706]", border: "border-amber-200", hex: "#d97706" },
};

export const BLOOM_COLORS: Record<BloomLevel, { bg: string; text: string; border: string; bar: string; hex: string }> = {
  CU: { bg: "bg-blue-50", text: "text-[#3b82f6]", border: "border-blue-200", bar: "bg-[#3b82f6]", hex: "#3b82f6" },
  AP: { bg: "bg-emerald-50", text: "text-[#22c55e]", border: "border-emerald-200", bar: "bg-[#22c55e]", hex: "#22c55e" },
  AS: { bg: "bg-yellow-50", text: "text-[#ca8a04]", border: "border-yellow-200", bar: "bg-[#eab308]", hex: "#eab308" },
  EV: { bg: "bg-red-50", text: "text-[#ef4444]", border: "border-red-200", bar: "bg-[#ef4444]", hex: "#ef4444" },
  CR: { bg: "bg-purple-50", text: "text-[#a855f7]", border: "border-purple-200", bar: "bg-[#a855f7]", hex: "#a855f7" },
};

export const CategoryBadge: React.FC<{ category: string; className?: string }> = ({
  category,
  className = "",
}) => {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[12px] font-medium bg-[#eef8f1] text-[#248a3d] border border-[#d0edd8] tracking-normal select-none ${className}`}
    >
      <span
        className="w-1.5 h-1.5 rounded-full mr-1.5 shrink-0 bg-[#248a3d]"
        aria-hidden="true"
      />
      {category}
    </span>
  );
};

export const BloomBadge: React.FC<{
  level: BloomLevel;
  label?: string;
  className?: string;
}> = ({ level, label, className = "" }) => {
  const meta = BLOOM_COLORS[level] || BLOOM_COLORS.CU;

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-semibold border ${meta.bg} ${meta.text} ${meta.border} ${className}`}
    >
      <span className="font-bold">{level}</span>
      {label && <span className="opacity-90 font-medium">· {label}</span>}
    </span>
  );
};

export const CriticalityBadge: React.FC<{
  criticality: CriticalityLevel;
  className?: string;
}> = ({ criticality, className = "" }) => {
  const styles = {
    Critical: "bg-rose-50 text-rose-700 border-rose-200",
    Important: "bg-amber-50 text-amber-700 border-amber-200",
    Baseline: "bg-slate-50 text-slate-700 border-slate-200",
  }[criticality] || "bg-slate-50 text-slate-700 border-slate-200";

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border ${styles} ${className}`}
    >
      {criticality}
    </span>
  );
};

export const DifficultyBadge: React.FC<{
  difficulty: DifficultyTier;
  className?: string;
}> = ({ difficulty, className = "" }) => {
  const styles = {
    EXPERT: "bg-red-50 text-red-700 border-red-200",
    ADVANCED: "bg-orange-50 text-orange-700 border-orange-200",
    PRO: "bg-blue-50 text-blue-700 border-blue-200",
    BEGINNER: "bg-emerald-50 text-emerald-700 border-emerald-200",
  }[difficulty];

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold tracking-wide border uppercase ${styles} ${className}`}
    >
      {difficulty}
    </span>
  );
};
