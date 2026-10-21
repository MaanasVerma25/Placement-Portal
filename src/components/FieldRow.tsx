import React from "react";
import { ExternalLink, Star } from "lucide-react";
import { isNullish } from "@/lib/companyData";
import { IntelligenceField } from "@/data/intelligenceData";

interface FieldRowProps {
  field: IntelligenceField;
}

export const FieldRow: React.FC<FieldRowProps> = ({ field }) => {
  const { label, value, type } = field;

  if (isNullish(value)) {
    return (
      <div className="py-2.5 px-3 flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 last:border-b-0 hover:bg-slate-50/50 transition-colors text-sm">
        <span className="text-slate-500 font-medium sm:w-1/3 text-xs uppercase tracking-wider mb-1 sm:mb-0">
          {label}
        </span>
        <div className="sm:w-2/3">
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-slate-100 text-slate-400 font-normal">
            Not Available
          </span>
        </div>
      </div>
    );
  }

  const renderValue = () => {
    // 1. URL type
    if (type === "url" || (typeof value === "string" && (value.startsWith("http://") || value.startsWith("https://")) && type !== "video")) {
      return (
        <a
          href={value}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-blue-600 hover:text-blue-800 hover:underline font-medium break-all"
        >
          <span>{value}</span>
          <ExternalLink className="w-3.5 h-3.5 shrink-0" />
        </a>
      );
    }

    // 2. Video type
    if (type === "video") {
      return (
        <a
          href={value}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-rose-50 text-rose-700 hover:bg-rose-100 text-xs font-semibold border border-rose-200 transition-colors"
        >
          <span>Watch Official Spotlight</span>
          <ExternalLink className="w-3 h-3" />
        </a>
      );
    }

    // 3. Rating type
    if (type === "rating") {
      return (
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-amber-50 text-amber-900 border border-amber-200 text-xs font-bold">
          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
          <span>{value}</span>
        </div>
      );
    }

    // 4. Paragraph
    if (type === "paragraph") {
      return (
        <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-line font-normal">
          {value}
        </p>
      );
    }

    // 5. Auto-pill or List (split by ; or , or newlines if it has multiple items)
    const hasDelimiters = typeof value === "string" && (value.includes(";") || (value.includes(",") && !value.match(/^\$?\d+,\d+/)));
    if (type === "auto-pill" || type === "list" || hasDelimiters) {
      const parts = value
        .split(/[;\n]/)
        .flatMap((s) => (s.includes(",") && !s.match(/^\$?\d+,\d+/) && !s.match(/\d{4},\s*\w+/) ? s.split(",") : [s]))
        .map((p) => p.trim())
        .filter((p) => p.length > 0 && !isNullish(p));

      if (parts.length > 1) {
        return (
          <div className="flex flex-wrap gap-1.5">
            {parts.map((item, idx) => (
              <span
                key={idx}
                className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-slate-100/90 text-slate-700 border border-slate-200/80"
              >
                {item}
              </span>
            ))}
          </div>
        );
      }
    }

    // Default text
    return <span className="text-slate-800 text-sm font-medium">{value}</span>;
  };

  return (
    <div className="py-2.5 px-3 flex flex-col sm:flex-row sm:items-start justify-between border-b border-slate-100 last:border-b-0 hover:bg-slate-50/50 transition-colors text-sm">
      <span className="text-slate-500 font-medium sm:w-1/3 text-xs uppercase tracking-wider mb-1 sm:mb-0 sm:pt-0.5">
        {label}
      </span>
      <div className="sm:w-2/3">{renderValue()}</div>
    </div>
  );
};
