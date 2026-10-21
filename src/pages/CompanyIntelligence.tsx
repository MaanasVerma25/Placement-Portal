import React, { useState, useEffect, useRef, useMemo, memo } from "react";
import { ExternalLink, Globe, RefreshCw, AlertCircle } from "lucide-react";
import { useCompany } from "@/context/CompanyContext";
import { useCompanyProfile } from "@/lib/companyApi";
import { CompanyLogo } from "@/components/CompanyLogo";
import { CategoryBadge } from "@/components/Badges";
import { buildIntelligenceSections, IntelligenceSection } from "@/data/intelligenceData";
import { FieldRow } from "@/components/FieldRow";

const LinkedInIcon: React.FC<{ className?: string }> = ({ className = "w-3.5 h-3.5" }) => (
  <svg
    className={className}
    fill="currentColor"
    viewBox="0 0 24 24"
    aria-hidden="true"
  >
    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
  </svg>
);

// Memoized Section Card
interface SectionCardProps {
  section: IntelligenceSection;
  index: number;
}

const SectionCard: React.FC<SectionCardProps> = memo(({ section, index }) => {
  const Icon = section.icon;

  return (
    <section
      id={`section-${index}`}
      data-section-index={index}
      className="scroll-mt-36 p-5 sm:p-6 bg-white rounded-xl border border-slate-200/90 shadow-xs mb-6 transition-all"
    >
      {/* Section Header */}
      <div className="flex items-center justify-between pb-4 mb-3 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
            <Icon className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wider">
                Section {section.number.toString().padStart(2, "0")}
              </span>
            </div>
            <h2 className="text-lg font-heading font-bold text-slate-900">
              {section.title}
            </h2>
          </div>
        </div>

        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200">
          {section.fields.length} data points
        </span>
      </div>

      {/* Field Rows */}
      <div className="divide-y divide-slate-100">
        {section.fields.map((field) => (
          <FieldRow key={field.key} field={field} />
        ))}
      </div>
    </section>
  );
});

SectionCard.displayName = "SectionCard";

export const CompanyIntelligence: React.FC = () => {
  const { selectedCompany, summary: contextSummary } = useCompany();
  const companyId = selectedCompany?.company_id;
  const {
    data: profileData,
    isLoading,
    isError,
    error,
    refetch,
  } = useCompanyProfile(companyId);

  const [activeTab, setActiveTab] = useState(0);
  const isScrollingRef = useRef(false);
  const tabListRef = useRef<HTMLDivElement>(null);

  const profile = profileData || undefined;
  const summary = profileData?.summary || contextSummary;

  const sections = useMemo(() => {
    return buildIntelligenceSections(profile);
  }, [profile]);

  // Scroll spy with IntersectionObserver
  useEffect(() => {
    const handleScroll = () => {
      if (isScrollingRef.current) return;

      const headerOffset = 180;
      let currentIdx = 0;

      for (let i = 0; i < sections.length; i++) {
        const el = document.getElementById(`section-${i}`);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= headerOffset) {
            currentIdx = i;
          }
        }
      }

      setActiveTab((prev) => (prev !== currentIdx ? currentIdx : prev));
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [sections]);

  // Auto-center active tab button in the tab bar
  useEffect(() => {
    if (tabListRef.current) {
      const activeBtn = tabListRef.current.querySelector(
        `[data-tab-idx="${activeTab}"]`
      ) as HTMLElement | null;

      if (activeBtn) {
        const container = tabListRef.current;
        const scrollLeft =
          activeBtn.offsetLeft -
          container.offsetWidth / 2 +
          activeBtn.offsetWidth / 2;
        container.scrollTo({ left: scrollLeft, behavior: "smooth" });
      }
    }
  }, [activeTab]);

  const scrollToSection = (idx: number) => {
    isScrollingRef.current = true;
    setActiveTab(idx);

    const el = document.getElementById(`section-${idx}`);
    if (el) {
      const topOffset = 150;
      const elementPosition = el.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - topOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    }

    setTimeout(() => {
      isScrollingRef.current = false;
    }, 600);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white">
        {/* Skeleton Top Bar */}
        <div className="sticky top-16 z-20 bg-white border-b border-[#E5E7EB] shadow-xs animate-pulse">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-lg bg-slate-100" />
              <div className="space-y-2">
                <div className="h-5 bg-slate-100 rounded w-48" />
                <div className="h-3 bg-slate-100 rounded w-32" />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-24 h-8 bg-slate-100 rounded-lg" />
              <div className="w-24 h-8 bg-slate-100 rounded-lg" />
            </div>
          </div>
          <div className="flex items-center gap-2 px-4 sm:px-6 lg:px-8 py-2.5 bg-slate-50/70 border-t border-slate-100 overflow-hidden">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-7 w-28 bg-slate-200/60 rounded-md shrink-0" />
            ))}
          </div>
        </div>

        {/* Skeleton Section Cards */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="p-6 bg-white rounded-xl border border-slate-200/90 shadow-xs animate-pulse space-y-4"
            >
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-slate-100" />
                  <div className="space-y-1.5">
                    <div className="h-3 bg-slate-100 rounded w-20" />
                    <div className="h-5 bg-slate-100 rounded w-40" />
                  </div>
                </div>
                <div className="h-5 w-20 bg-slate-100 rounded-full" />
              </div>
              <div className="space-y-3 pt-2">
                {Array.from({ length: 4 }).map((_, j) => (
                  <div key={j} className="flex justify-between py-2 border-b border-slate-50">
                    <div className="h-4 bg-slate-100 rounded w-1/4" />
                    <div className="h-4 bg-slate-100 rounded w-1/2" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-white px-4">
        <div className="py-12 px-6 text-center bg-rose-50/50 rounded-2xl border border-rose-200 max-w-md w-full">
          <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-3">
            <AlertCircle className="w-5 h-5" />
          </div>
          <h3 className="text-base font-heading font-semibold text-rose-900">
            Failed to load company intelligence
          </h3>
          <p className="text-xs text-rose-600 mt-1 max-w-xs mx-auto">
            {error instanceof Error ? error.message : "Database error loading company detail. Check your connection."}
          </p>
          <button
            onClick={() => refetch()}
            className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-rose-600 text-white text-xs font-semibold hover:bg-rose-700 shadow-xs transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Retry Loading</span>
          </button>
        </div>
      </div>
    );
  }

  if (!summary) return null;

  return (
    <div className="min-h-screen bg-white">
      {/* Sticky Top Information Bar (No hero, no gradients) */}
      <div className="sticky top-16 z-20 bg-white border-b border-[#E5E7EB] shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4">
          {/* Left: Company logo, Company name, Industry badge */}
          <div className="flex items-center gap-3.5 min-w-0">
            <CompanyLogo
              name={summary.name}
              logoUrl={summary.logo_url}
              websiteUrl={summary.website_url}
              size="md"
            />
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-heading font-bold text-slate-900 truncate">
                  {summary.name}
                </h1>
                <CategoryBadge
                  category={summary.company_type || "Standard"}
                  className="hidden sm:inline-flex"
                />
              </div>
              <p className="text-xs text-slate-500 font-medium truncate">
                {summary.category || "Enterprise"} · {summary.headquarters_address || "Global"}
              </p>
            </div>
          </div>

          {/* Right: Website button, LinkedIn button */}
          <div className="flex items-center gap-2">
            {profile?.website_url && (
              <a
                href={profile.website_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors shadow-2xs"
              >
                <Globe className="w-3.5 h-3.5 text-slate-500" />
                <span>Website</span>
                <ExternalLink className="w-3 h-3 text-slate-400" />
              </a>
            )}

            {profile?.linkedin_url && (
              <a
                href={profile.linkedin_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#0A66C2] text-white hover:bg-[#004182] transition-colors shadow-2xs"
              >
                <LinkedInIcon className="w-3.5 h-3.5 fill-current" />
                <span>LinkedIn</span>
              </a>
            )}
          </div>
        </div>

        {/* Sticky Tab Bar (22 tabs) */}
        <div
          ref={tabListRef}
          className="flex items-center gap-1.5 px-4 sm:px-6 lg:px-8 overflow-x-auto no-scrollbar border-t border-slate-100 py-2 bg-slate-50/70"
        >
          {sections.map((sec, idx) => {
            const isActive = activeTab === idx;
            return (
              <button
                key={sec.id}
                data-tab-idx={idx}
                onClick={() => scrollToSection(idx)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-all shrink-0 ${
                  isActive
                    ? "bg-blue-600 text-white font-semibold shadow-2xs"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
                }`}
              >
                <span
                  className={`text-[10px] font-bold ${
                    isActive ? "text-blue-100" : "text-slate-400"
                  }`}
                >
                  {sec.number}
                </span>
                <span>{sec.title}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main 22 Sections List */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {sections.map((section, idx) => (
            <SectionCard key={section.id} section={section} index={idx} />
          ))}
        </div>
      </div>
    </div>
  );
};
