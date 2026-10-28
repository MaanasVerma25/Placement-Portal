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

  const sj = company.short_json || company;

  const handleClick = () => {
    // 1. Save selected-company to localStorage (handled in selectCompany)
    // 2. Update CompanyContext
    selectCompany(company);
    // 3. Navigate to /company/intelligence (redirects unauthenticated users to /login?redirect=...)
    navigate("/company/intelligence");
  };

  const renderTextOrFallback = (val: any) => {
    if (isNullish(val)) {
      return <span className="text-[#6e6e73]">Not publicly available</span>;
    }
    return <span className="text-[#1d1d1f] font-normal">{val}</span>;
  };

  const hasGrowth = !isNullish(sj.yoy_growth_rate);
  const isGrowthNegative = hasGrowth && String(sj.yoy_growth_rate).trim().startsWith("-");
  const compType = company.company_type || sj.company_type || "Standard";

  const brandSubtitle =
    sj.short_name && sj.short_name !== sj.name
      ? sj.short_name
      : sj.category || "Enterprise";

  return (
    <div
      onClick={handleClick}
      role="button"
      tabIndex={0}
      aria-label={`Explore placement intelligence for ${sj.name || "recruiting company"}`}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleClick();
        }
      }}
      className="group relative flex flex-col justify-between p-6 bg-white rounded-[18px] border border-[#d2d2d7] hover:border-[#b0b0b5] hover:shadow-[0_4px_20px_rgba(0,0,0,0.06)] hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 motion-reduce:transition-none motion-reduce:transform-none cursor-pointer text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3] focus-visible:ring-offset-2"
    >
      <div>
        {/* Top row: 44px Company Logo on left, placement-tier badge on right */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <CompanyLogo
            name={sj.name}
            logoUrl={sj.logo_url}
            websiteUrl={sj.website_url}
            size="md"
          />
          <CategoryBadge category={compType} />
        </div>

        {/* Company Name & Brand Subtitle */}
        <div className="mb-4">
          <h3
            className="text-[18px] font-semibold text-[#1d1d1f] group-hover:text-[#0071e3] transition-colors line-clamp-2 leading-snug"
            title={sj.name}
          >
            {sj.name}
          </h3>
          <p
            className="text-[13px] text-[#6e6e73] font-normal mt-1 line-clamp-1"
            title={brandSubtitle}
          >
            {brandSubtitle}
          </p>
        </div>

        {/* Metadata info: Headquarters, Employee count, YoY Growth */}
        <div className="space-y-2 text-[13px] text-[#6e6e73] mb-4">
          <div className="flex items-center gap-2">
            <MapPin className="w-3.5 h-3.5 text-[#6e6e73] shrink-0" aria-hidden="true" />
            <span className="truncate">{renderTextOrFallback(sj.headquarters_address)}</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="w-3.5 h-3.5 text-[#6e6e73] shrink-0" aria-hidden="true" />
            <span className="truncate">{renderTextOrFallback(sj.employee_size)}</span>
          </div>
          <div className="flex items-center gap-2">
            {hasGrowth ? (
              <>
                {isGrowthNegative ? (
                  <TrendingDown className="w-3.5 h-3.5 text-rose-600 shrink-0" aria-hidden="true" />
                ) : (
                  <TrendingUp className="w-3.5 h-3.5 text-[#248a3d] shrink-0" aria-hidden="true" />
                )}
                <span
                  className={`font-medium ${
                    isGrowthNegative ? "text-rose-600" : "text-[#248a3d]"
                  }`}
                >
                  {sj.yoy_growth_rate} YoY
                </span>
              </>
            ) : (
              <>
                <TrendingUp className="w-3.5 h-3.5 text-[#6e6e73] shrink-0" aria-hidden="true" />
                <span className="text-[#6e6e73]">Growth: Not publicly available</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Footer CTA: Subtle divider and blue Explore Intelligence action */}
      <div className="pt-4 border-t border-[#f0f0f2] flex items-center justify-between text-[14px] font-medium text-[#0071e3] group-hover:text-[#0077ed] transition-colors">
        <span>Explore Intelligence</span>
        <ArrowRight className="w-4 h-4 text-[#0071e3] group-hover:text-[#0077ed] group-hover:translate-x-1 transition-transform motion-reduce:transform-none" aria-hidden="true" />
      </div>
    </div>
  );
});

CompanyCard.displayName = "CompanyCard";
