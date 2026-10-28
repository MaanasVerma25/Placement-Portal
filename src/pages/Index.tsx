import React, { useState, useMemo, useEffect } from "react";
import { Search, X, Building2, Sparkles, RefreshCw, AlertCircle } from "lucide-react";
import { useCompanies } from "@/lib/companyApi";
import { CompanyCard } from "@/components/CompanyCard";
import { CATEGORY_COLORS } from "@/components/Badges";
import { StudentUserMenu } from "@/components/auth/StudentUserMenu";

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

  // Compute counts for filter pills
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
    <div className="min-h-screen bg-white text-slate-900 font-body flex flex-col">
      {/* Top Navbar */}
      <header className="border-b border-[#E5E7EB] bg-white sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex flex-col">
              <span className="font-heading font-extrabold text-base sm:text-lg tracking-wider text-slate-900">
                {COLLEGE_NAME}
              </span>
              <span className="text-[10px] font-bold text-blue-600 tracking-wider">
                {COLLEGE_SHORT} · INTELLIGENCE PLATFORM
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span>Phase 1 Verified</span>
            </span>
            <StudentUserMenu />
          </div>
        </div>
      </header>

      {/* Hero Section: Clean white background, bottom border, large heading, small subtitle, search directly below */}
      <section className="bg-white border-b border-[#E5E7EB] py-10 sm:py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            {/* Pill */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200 mb-4">
              <Building2 className="w-3.5 h-3.5 text-blue-600" />
              <span>{COLLEGE_SHORT} · INTELLIGENCE PLATFORM</span>
            </div>

            {/* H1 Heading */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-bold text-slate-900 tracking-tight leading-tight">
              {COLLEGE_NAME} Companies Research &amp; Placement Analytics Portal
            </h1>

            {/* Subtitle */}
            <p className="mt-3 text-base sm:text-lg text-slate-600 font-normal">
              Your strategic edge for campus placements
            </p>

            {/* Search Input directly below */}
            <div className="mt-8 relative max-w-2xl">
              <div className="relative flex items-center">
                <Search className="w-5 h-5 text-slate-400 absolute left-4 pointer-events-none" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by company name, technology, headquarters, or role..."
                  className="w-full pl-11 pr-10 py-3.5 text-sm sm:text-base rounded-xl border border-slate-300 bg-white shadow-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm("")}
                    className="absolute right-3.5 p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                    aria-label="Clear search"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content: Filters + Company Grid */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filter Pills with exact category colors & live counts */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 no-scrollbar">
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat;
            const count = counts[cat] || 0;
            const color =
              cat === "All"
                ? null
                : CATEGORY_COLORS[cat] || null;

            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all shrink-0 ${
                  isSelected
                    ? "bg-slate-900 text-white border-slate-900 shadow-xs"
                    : "bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                }`}
              >
                {color && (
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: color.hex }}
                  />
                )}
                <span>{cat}</span>
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                    isSelected
                      ? "bg-white/20 text-white"
                      : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Results Count Summary */}
        <div className="mt-2 mb-6 flex items-center justify-between text-xs text-slate-500">
          <span>
            Showing <strong className="text-slate-900 font-semibold">{filteredCompanies.length}</strong>{" "}
            recruiting {filteredCompanies.length === 1 ? "organization" : "organizations"}
          </span>
          {(searchTerm || selectedCategory !== "All") && (
            <button
              onClick={() => {
                setSearchTerm("");
                setSelectedCategory("All");
              }}
              className="inline-flex items-center gap-1 text-blue-600 hover:underline font-medium"
            >
              <RefreshCw className="w-3 h-3" />
              Reset filters
            </button>
          )}
        </div>

        {/* Company Grid / Loading / Error / Empty states */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, idx) => (
              <div
                key={idx}
                className="p-5 bg-white rounded-xl border border-slate-200/90 animate-pulse space-y-4"
              >
                <div className="flex items-start justify-between">
                  <div className="w-12 h-12 bg-slate-100 rounded-lg" />
                  <div className="w-16 h-5 bg-slate-100 rounded-full" />
                </div>
                <div className="space-y-2">
                  <div className="h-5 bg-slate-100 rounded w-3/4" />
                  <div className="h-3 bg-slate-100 rounded w-1/2" />
                </div>
                <div className="space-y-2 pt-2">
                  <div className="h-3 bg-slate-100 rounded w-full" />
                  <div className="h-3 bg-slate-100 rounded w-4/5" />
                  <div className="h-3 bg-slate-100 rounded w-2/3" />
                </div>
              </div>
            ))}
          </div>
        ) : isError ? (
          <div className="py-14 text-center bg-rose-50/50 rounded-2xl border border-rose-200 max-w-md mx-auto p-6">
            <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-3">
              <AlertCircle className="w-5 h-5" />
            </div>
            <h3 className="text-base font-heading font-semibold text-rose-900">
              Unable to load companies
            </h3>
            <p className="text-xs text-rose-600 mt-1 max-w-xs mx-auto">
              {error instanceof Error ? error.message : "Failed to load recruiting companies. Check database connection."}
            </p>
            <button
              onClick={() => refetch()}
              className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-rose-600 text-white text-xs font-semibold hover:bg-rose-700 shadow-xs transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Retry</span>
            </button>
          </div>
        ) : filteredCompanies.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {filteredCompanies.map((company) => (
              <CompanyCard key={company.company_id} company={company} />
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="py-16 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 max-w-lg mx-auto">
            <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-heading font-semibold text-slate-800">
              No matching companies found
            </h3>
            <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
              We couldn't find any organizations matching "{debouncedSearch}". Try searching for another name or reset filters.
            </p>
            <button
              onClick={() => {
                setSearchTerm("");
                setSelectedCategory("All");
              }}
              className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 shadow-xs transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reset Search &amp; Filters</span>
            </button>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-[#E5E7EB] bg-[#F8FAFC] py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4">
          <p className="font-medium text-slate-600">
            {COLLEGE_NAME} Placement Intelligence Hub
          </p>
          <p className="mt-1 text-slate-400">
            Enterprise campus placement analytics and research platform · Phase 1 (UI-only)
          </p>
        </div>
      </footer>
    </div>
  );
};
