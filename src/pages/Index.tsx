import React, { useState, useMemo, useEffect } from "react";
import { Search, X, RefreshCw, AlertCircle } from "lucide-react";
import { useCompanies } from "@/lib/companyApi";
import { CompanyCard } from "@/components/CompanyCard";
import { StudentUserMenu } from "@/components/auth/StudentUserMenu";
import { HeroSlideshow } from "@/components/HeroSlideshow";

const COLLEGE_NAME = "JSS UNIVERSITY";
const COLLEGE_SHORT = "JSS";

const CATEGORIES = ["All", "Super Dream", "Dream", "Standard", "Regular"] as const;
type CategoryFilter = (typeof CATEGORIES)[number];

export const Index: React.FC = () => {
  const { data: companies = [], isLoading, isError, error, refetch } = useCompanies();
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>("All");

  // 200ms debounce for search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 200);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Compute counts for filter segmented control
  const counts = useMemo(() => {
    const c: Record<string, number> = {
      All: companies.length,
      "Super Dream": 0,
      Dream: 0,
      Standard: 0,
      Regular: 0,
    };
    companies.forEach((item) => {
      const type = item.company_type || item.short_json?.company_type || "Standard";
      if (c[type] !== undefined) {
        c[type] += 1;
      }
    });
    return c;
  }, [companies]);

  // Filter companies based on debounced search & category
  const filteredCompanies = useMemo(() => {
    return companies.filter((company) => {
      const sj = company.short_json || company;
      const compType = company.company_type || sj.company_type || "Standard";
      const matchesCategory =
        selectedCategory === "All" || compType === selectedCategory;

      const q = debouncedSearch.toLowerCase().trim();
      if (!q) return matchesCategory;

      const matchesQuery =
        (sj.name && sj.name.toLowerCase().includes(q)) ||
        (sj.short_name && sj.short_name.toLowerCase().includes(q)) ||
        (sj.category && sj.category.toLowerCase().includes(q)) ||
        (sj.headquarters_address && sj.headquarters_address.toLowerCase().includes(q)) ||
        (sj.office_locations && sj.office_locations.toLowerCase().includes(q)) ||
        (sj.operating_countries && sj.operating_countries.toLowerCase().includes(q));

      return matchesCategory && matchesQuery;
    });
  }, [companies, debouncedSearch, selectedCategory]);

  return (
    <div className="min-h-screen bg-white text-[#1d1d1f] font-body flex flex-col selection:bg-[#0071e3] selection:text-white">
      {/* 1. Slim, sticky top navigation bar */}
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-[#d2d2d7]">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src="/jss-logo.png"
              alt="JSS University Logo"
              className="w-8 h-8 rounded-[8px] object-contain shadow-xs select-none"
            />
            <div className="flex flex-col">
              <span className="font-heading font-semibold text-[15px] tracking-tight text-[#1d1d1f] leading-none">
                {COLLEGE_NAME}
              </span>
              <span className="text-[11px] text-[#6e6e73] font-normal tracking-normal mt-0.5">
                Placement Intelligence Hub
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <StudentUserMenu />
          </div>
        </div>
      </header>

      {/* 2. Hero section with right-side media slideshow & 3. Wide search field */}
      <section className="bg-white border-b border-[#d2d2d7] py-10 sm:py-16">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 text-left">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left side: Eyebrow, Heading, Subtitle, Search Field */}
            <div className="lg:col-span-7">
              {/* Muted eyebrow label */}
              <p className="text-[14px] sm:text-[15px] font-medium text-[#6e6e73] mb-3 tracking-normal">
                Campus Recruitment · 2025–2026
              </p>

              {/* Large two-line heading (52px / 48px / 36px mobile, tight line height, tracking tight) */}
              <h1 className="text-[36px] sm:text-[48px] lg:text-[52px] font-[650] sm:font-[700] text-[#1d1d1f] leading-[1.06] tracking-[-0.02em]">
                {COLLEGE_NAME} Companies Research &amp; Placement Analytics Portal
              </h1>

              {/* One short supporting sentence */}
              <p className="mt-4 text-[17px] sm:text-[18px] text-[#6e6e73] font-normal max-w-[640px] leading-relaxed">
                Your strategic edge for campus placements
              </p>

              {/* 3. Wide search field immediately below hero */}
              <div className="mt-7 max-w-[640px] relative">
                <div className="relative flex items-center">
                  <Search
                    className="w-4.5 h-4.5 text-[#6e6e73] absolute left-3.5 pointer-events-none"
                    aria-hidden="true"
                  />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search by company name, technology, headquarters, or role..."
                    className="w-full pl-11 pr-11 py-3.5 text-[15px] sm:text-[16px] rounded-[12px] bg-[#f5f5f7] border border-[#d2d2d7] text-[#1d1d1f] placeholder:text-[#6e6e73] focus:outline-none focus:bg-white focus:border-[#0071e3] focus:ring-2 focus:ring-[#0071e3]/20 transition-all duration-150"
                    aria-label="Search recruiting companies"
                  />
                  {searchTerm && (
                    <button
                      type="button"
                      onClick={() => setSearchTerm("")}
                      className="absolute right-3.5 p-1 rounded-full text-[#6e6e73] hover:text-[#1d1d1f] hover:bg-[#e8e8ed] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3]"
                      aria-label="Clear search"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Right side: Slideshow of images & video */}
            <div className="lg:col-span-5 w-full">
              <HeroSlideshow />
            </div>
          </div>
        </div>
      </section>

      {/* 4. Segmented Control & 5. Company Grid */}
      <main className="flex-1 max-w-[1200px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 text-left">
        {/* Rounded Segmented Control for filters */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
          <div
            role="tablist"
            aria-label="Filter companies by placement category"
            className="p-1 rounded-[12px] bg-[#f5f5f7] border border-[#d2d2d7] inline-flex items-center gap-1 max-w-full overflow-x-auto no-scrollbar"
          >
            {CATEGORIES.map((cat) => {
              const isSelected = selectedCategory === cat;
              const count = counts[cat] || 0;
              const isDisabled = count === 0 && cat !== "All";

              return (
                <button
                  key={cat}
                  role="tab"
                  aria-selected={isSelected}
                  disabled={isDisabled}
                  onClick={() => setSelectedCategory(cat)}
                  className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-[8px] text-[13px] transition-all shrink-0 select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3] ${
                    isDisabled
                      ? "opacity-40 cursor-not-allowed text-[#6e6e73]"
                      : isSelected
                      ? "bg-white text-[#1d1d1f] font-medium shadow-[0_1px_3px_rgba(0,0,0,0.08)]"
                      : "text-[#6e6e73] hover:text-[#1d1d1f] font-normal"
                  }`}
                >
                  <span>{cat}</span>
                  <span
                    className={`text-[12px] ${
                      isSelected
                        ? "text-[#1d1d1f] font-medium"
                        : count > 0
                        ? "text-[#6e6e73]"
                        : "text-[#b0b0b5]"
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Reset Filters action if query or filter is active */}
          {(searchTerm || selectedCategory !== "All") && (
            <button
              type="button"
              onClick={() => {
                setSearchTerm("");
                setSelectedCategory("All");
              }}
              className="inline-flex items-center gap-1.5 text-[13px] font-medium text-[#0071e3] hover:text-[#0077ed] hover:underline transition-colors shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3]"
            >
              <RefreshCw className="w-3 h-3" aria-hidden="true" />
              <span>Reset filters</span>
            </button>
          )}
        </div>

        {/* 5. Result count beneath filters in secondary text */}
        <div className="mt-3 mb-6 text-[13px] text-[#6e6e73]">
          Showing <span className="text-[#1d1d1f] font-medium">{filteredCompanies.length}</span>{" "}
          recruiting {filteredCompanies.length === 1 ? "organization" : "organizations"}
        </div>

        {/* 5 & 9. Responsive Company Grid (3 cols on wide screens, 2 on tablet, 1 on mobile) / Skeletons / States */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, idx) => (
              <div
                key={idx}
                className="p-6 bg-white rounded-[18px] border border-[#d2d2d7] animate-pulse space-y-4"
              >
                <div className="flex items-start justify-between">
                  <div className="w-[44px] h-[44px] bg-[#f5f5f7] rounded-[10px]" />
                  <div className="w-20 h-5 bg-[#f5f5f7] rounded-full" />
                </div>
                <div className="space-y-2 pt-1">
                  <div className="h-5 bg-[#f5f5f7] rounded w-3/4" />
                  <div className="h-3.5 bg-[#f5f5f7] rounded w-1/2" />
                </div>
                <div className="space-y-2.5 pt-2">
                  <div className="h-3.5 bg-[#f5f5f7] rounded w-full" />
                  <div className="h-3.5 bg-[#f5f5f7] rounded w-4/5" />
                  <div className="h-3.5 bg-[#f5f5f7] rounded w-2/3" />
                </div>
                <div className="pt-4 border-t border-[#f0f0f2] flex items-center justify-between">
                  <div className="h-3.5 bg-[#f5f5f7] rounded w-28" />
                  <div className="w-4 h-4 bg-[#f5f5f7] rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : isError ? (
          <div className="py-16 text-center bg-[#f5f5f7] rounded-[18px] border border-[#d2d2d7] max-w-[500px] mx-auto p-8">
            <div className="w-10 h-10 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-3 border border-rose-200">
              <AlertCircle className="w-5 h-5" aria-hidden="true" />
            </div>
            <h3 className="text-[18px] font-semibold text-[#1d1d1f]">
              Unable to load recruiting companies
            </h3>
            <p className="text-[13px] text-[#6e6e73] mt-1.5 max-w-sm mx-auto leading-relaxed">
              {error instanceof Error
                ? error.message
                : "A temporary network or database issue occurred. Please retry your request."}
            </p>
            <button
              type="button"
              onClick={() => refetch()}
              className="mt-5 inline-flex items-center gap-1.5 px-4 py-2 rounded-[12px] bg-[#0071e3] text-white text-[13px] font-medium hover:bg-[#0077ed] active:bg-[#006edb] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3]"
            >
              <RefreshCw className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Retry</span>
            </button>
          </div>
        ) : filteredCompanies.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCompanies.map((company) => (
              <CompanyCard key={company.company_id} company={company} />
            ))}
          </div>
        ) : (
          /* Helpful No-Results State */
          <div className="py-16 text-center bg-[#f5f5f7] rounded-[18px] border border-[#d2d2d7] max-w-[500px] mx-auto p-8">
            <h3 className="text-[18px] font-semibold text-[#1d1d1f]">
              No companies found
            </h3>
            <p className="text-[13px] text-[#6e6e73] mt-1.5 max-w-xs mx-auto leading-relaxed">
              {debouncedSearch
                ? `No organizations match "${debouncedSearch}". Try checking your spelling or clearing filters.`
                : "No organizations found in the selected placement category."}
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchTerm("");
                setSelectedCategory("All");
              }}
              className="mt-5 inline-flex items-center gap-1.5 px-4 py-2 rounded-[12px] bg-[#0071e3] text-white text-[13px] font-medium hover:bg-[#0077ed] active:bg-[#006edb] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3]"
            >
              <RefreshCw className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Clear Search &amp; Filters</span>
            </button>
          </div>
        )}
      </main>

      {/* University Footer */}
      <footer className="border-t border-[#d2d2d7] bg-white py-8 text-center text-[12px] text-[#6e6e73] mt-auto">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-[#1d1d1f]">{COLLEGE_NAME}</span>
            <span className="text-[#d2d2d7]">·</span>
            <span>Placement Intelligence Hub</span>
          </div>
          <p className="text-[#6e6e73]">
            Institutional recruitment analytics platform · Strict privacy compliance enforced
          </p>
        </div>
      </footer>
    </div>
  );
};
