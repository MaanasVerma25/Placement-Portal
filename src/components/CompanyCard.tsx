import React, { memo } from "react";
import { useNavigate } from "react-router-dom";
import { MapPin, Users, TrendingUp, TrendingDown, ArrowRight } from "lucide-react";
import { useCompany } from "@/context/CompanyContext";
import { CompanyLogo } from "@/components/CompanyLogo";
import { CategoryBadge } from "@/components/Badges";
import { isNullish } from "@/lib/companyData";

interface CompanyCardProps {
  company: any;
}

export const CompanyCard: React.FC<CompanyCardProps> = memo(({ company }) => {
  const navigate = useNavigate();
  const { selectCompany } = useCompany();

  const sj = company.short_json;

  const handleClick = () => {
    // 1. Save selected-company to localStorage (handled in selectCompany)
    // 2. Update CompanyContext
    selectCompany(company);
    // 3. Navigate to /company/intelligence
    navigate("/company/intelligence");
  };

  const renderTextOrFallback = (val: any) => {
    if (isNullish(val)) {
      return <span className="italic text-slate-400">not publicly available</span>;
    }
    return <span>{val}</span>;
  };

  const isGrowthNegative = sj.yoy_growth_rate && sj.yoy_growth_rate.trim().startsWith("-");

  return (
    <div
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleClick();
        }
      }}
      className="group relative flex flex-col justify-between p-5 bg-white rounded-xl border border-slate-200/90 hover:border-blue-400/80 hover:shadow-md transition-all duration-200 cursor-pointer text-left focus:outline-none focus:ring-2 focus:ring-blue-500/20"
    >
      <div>
        {/* Header row: Logo & Category badge */}
        <div className="flex items-start justify-between gap-3 mb-3.5">
          <CompanyLogo
            name={sj.name}
            logoUrl={sj.logo_url}
            websiteUrl={sj.website_url}
            size="md"
          />
          <CategoryBadge category={sj.company_type || "Standard"} />
        </div>

        {/* Name and Short Name */}
        <div className="mb-4">
          <h3 className="font-heading font-semibold text-lg text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1">
            {sj.name}
          </h3>
          <p className="text-xs text-slate-500 font-medium">
            {sj.short_name && sj.short_name !== sj.name ? sj.short_name : sj.category || "Enterprise"}
          </p>
        </div>

        {/* Metadata info: HQ, Size, Growth */}
        <div className="space-y-2 text-xs text-slate-600 mb-4">
          <div className="flex items-center gap-2">
            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="truncate">{renderTextOrFallback(sj.headquarters_address)}</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="truncate">{renderTextOrFallback(sj.employee_size)}</span>
          </div>
          <div className="flex items-center gap-2">
            {isGrowthNegative ? (
              <TrendingDown className="w-3.5 h-3.5 text-rose-500 shrink-0" />
            ) : (
              <TrendingUp className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            )}
            <span
              className={`font-medium ${
                isGrowthNegative ? "text-rose-600" : "text-emerald-700"
              }`}
            >
              {renderTextOrFallback(sj.yoy_growth_rate)} YoY
            </span>
          </div>
        </div>
      </div>

      {/* Footer CTA */}
      <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-500 group-hover:text-blue-600 transition-colors">
        <span>Explore Intelligence</span>
        <div className="w-6 h-6 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-600 transition-all">
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </div>
      </div>
    </div>
  );
});

CompanyCard.displayName = "CompanyCard";
