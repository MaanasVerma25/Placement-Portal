import React, { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  Target,
  Building,
  CheckCircle2,
  AlertCircle,
  XCircle,
  ArrowRight,
  TrendingUp,
  Award,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Lock,
  Layers,
  RefreshCw,
  Search,
  Check,
  Printer,
  ShieldCheck,
  BookOpen,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import {
  fetchCompanies,
  fetchCompanySkills,
  CompanyListItem,
  SkillWithRoadmap,
} from "@/lib/companyApi";
import { CompanyLogo } from "@/components/CompanyLogo";
import { CriticalityBadge, BloomBadge } from "@/components/Badges";
import {
  compareProfileAgainstCompanyBar,
  loadCompanyComparisonFromStorage,
  clearCompanyComparisonFromStorage,
} from "@/lib/companyRadixComparisonService";
import {
  CompanyReadinessResult,
  SkillGapItem,
} from "@/types/companyRadixComparison";
import { toast } from "sonner";

interface CompanyRadixComparatorProps {
  initialCompanyId?: number;
  initialCompanySkills?: SkillWithRoadmap[];
  initialCompanyMeta?: {
    company_id: number;
    name: string;
    short_name?: string;
    logo_url?: string;
    company_type?: string;
  };
  onClose?: () => void;
  className?: string;
}

export const CompanyRadixComparator: React.FC<CompanyRadixComparatorProps> = ({
  initialCompanyId,
  initialCompanySkills,
  initialCompanyMeta,
  className = "",
}) => {
  const { candidateProfile, user, student } = useAuth();

  const [companies, setCompanies] = useState<CompanyListItem[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState<number | null>(
    initialCompanyId || null
  );
  const [selectedCompanyMeta, setSelectedCompanyMeta] = useState<any>(
    initialCompanyMeta || null
  );
  const [companySkills, setCompanySkills] = useState<SkillWithRoadmap[]>(
    initialCompanySkills || []
  );
  const [comparison, setComparison] = useState<CompanyReadinessResult | null>(
    null
  );

  const [isLoadingCompanies, setIsLoadingCompanies] = useState(false);
  const [isLoadingSkills, setIsLoadingSkills] = useState(false);
  const [isComparing, setIsComparing] = useState(false);
  const [companySearch, setCompanySearch] = useState("");
  const [filterMode, setFilterMode] = useState<"all" | "gaps" | "critical" | "met">("all");
  const [expandedSkillId, setExpandedSkillId] = useState<number | null>(null);

  // Load companies list from portal
  useEffect(() => {
    let isMounted = true;
    setIsLoadingCompanies(true);
    fetchCompanies()
      .then((data) => {
        if (!isMounted) return;
        setCompanies(data);
        if (!selectedCompanyId && data.length > 0) {
          setSelectedCompanyId(data[0].company_id);
          setSelectedCompanyMeta(data[0]);
        } else if (selectedCompanyId) {
          const match = data.find((c) => c.company_id === selectedCompanyId);
          if (match) setSelectedCompanyMeta(match);
        }
      })
      .catch((err) => {
        console.error("Failed to fetch companies:", err);
      })
      .finally(() => {
        if (isMounted) setIsLoadingCompanies(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Fetch company skill requirements if not provided
  useEffect(() => {
    if (!selectedCompanyId) return;

    if (
      initialCompanySkills &&
      initialCompanySkills.length > 0 &&
      selectedCompanyId === initialCompanyId
    ) {
      setCompanySkills(initialCompanySkills);
      return;
    }

    let isMounted = true;
    setIsLoadingSkills(true);
    fetchCompanySkills(selectedCompanyId)
      .then((skills) => {
        if (!isMounted) return;
        setCompanySkills(skills);
      })
      .catch((err) => {
        console.error("Error fetching skills for comparison:", err);
      })
      .finally(() => {
        if (isMounted) setIsLoadingSkills(false);
      });

    return () => {
      isMounted = false;
    };
  }, [selectedCompanyId, initialCompanyId, initialCompanySkills]);

  // Load previous comparison from cache on mount
  useEffect(() => {
    const cached = loadCompanyComparisonFromStorage();
    if (cached) {
      setComparison(cached);
      if (!selectedCompanyId) {
        setSelectedCompanyId(cached.companyId);
      }
    }
  }, []);

  // Filtered companies dropdown
  const filteredCompanies = useMemo(() => {
    if (!companySearch.trim()) return companies;
    const term = companySearch.toLowerCase();
    return companies.filter(
      (c) =>
        c.name.toLowerCase().includes(term) ||
        (c.short_name && c.short_name.toLowerCase().includes(term)) ||
        (c.category && c.category.toLowerCase().includes(term))
    );
  }, [companies, companySearch]);

  const handleSelectCompany = (comp: CompanyListItem) => {
    setSelectedCompanyId(comp.company_id);
    setSelectedCompanyMeta(comp);
  };

  /**
   * THE ONE BUTTON ACTION
   * Compares the candidate's saved profile against the company's expected bar across all 12 RADIX skillsets.
   */
  const handleOneButtonCompare = () => {
    if (!selectedCompanyMeta) {
      toast.error("Please select a company to compare against.");
      return;
    }

    if (!companySkills || companySkills.length === 0) {
      toast.error("Loading company skill requirements...", {
        description: "Please wait a moment for skill benchmarks to finish loading.",
      });
      return;
    }

    setIsComparing(true);
    const toastId = toast.loading(
      `Analyzing 12 RADIX skillsets against ${
        selectedCompanyMeta.short_name || selectedCompanyMeta.name
      }'s required bar...`
    );

    try {
      const result = compareProfileAgainstCompanyBar({
        company: {
          company_id: selectedCompanyMeta.company_id,
          name: selectedCompanyMeta.name,
          short_name: selectedCompanyMeta.short_name,
          logo_url: selectedCompanyMeta.logo_url,
          company_type: selectedCompanyMeta.company_type,
        },
        companySkills,
        candidateProfile,
        candidateNameHint: student?.username || user?.email,
      });

      setComparison(result);
      toast.success(
        `Readiness Score: ${result.readinessScore}% (${result.readinessTier})`,
        {
          id: toastId,
          description: `Evaluated ${result.totalSkillsEvaluated} RADIX skillsets. ${result.skillsMeetingBarCount} meet or exceed the bar.`,
        }
      );
    } catch (err: any) {
      console.error("Comparison error:", err);
      toast.error("Comparison Failed", { id: toastId, description: err.message });
    } finally {
      setIsComparing(false);
    }
  };

  // Filter skill gap items
  const filteredSkillGaps = useMemo(() => {
    if (!comparison) return [];
    return comparison.skillGaps.filter((item) => {
      if (filterMode === "gaps") return item.gap < 0;
      if (filterMode === "critical") return item.criticality === "Critical";
      if (filterMode === "met") return item.gap >= 0;
      return true;
    });
  }, [comparison, filterMode]);

  return (
    <div className={`space-y-6 ${className}`}>
      {/* CARD 1: INPUT CONTROLS & THE ONE BUTTON */}
      <section className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600">
                <Target className="w-5 h-5" />
              </span>
              <h2 className="text-base sm:text-lg font-bold font-heading text-slate-900">
                12 RADIX Placement Readiness & Gap Comparator
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-1 max-w-2xl">
              Compare your saved placement profile against any recruiter's expected bar across all 12 RADIX skillsets. Shows your placement qualification readiness score and exact gap milestones.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start md:self-center">
            <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              <ShieldCheck className="w-3.5 h-3.5" />
              Verified Profile Bar
            </span>
          </div>
        </div>

        {/* INPUT 1: Saved Profile Status Hint */}
        <div className="mt-5 grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
          <div className="md:col-span-5 p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-blue-600" />
              <span>Input 1: Saved Profile</span>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-slate-900">
                  {candidateProfile?.fullName || student?.username || user?.email || "Student Dossier"}
                </div>
                <div className="text-[10px] text-slate-500">
                  {candidateProfile?.skills?.radixSkills?.length || 12} RADIX categories loaded
                </div>
              </div>
              <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded bg-blue-100 text-blue-700">
                {candidateProfile ? "Ready" : "Default"}
              </span>
            </div>
          </div>

          {/* INPUT 2: Company Selector */}
          <div className="md:col-span-7 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Building className="w-3.5 h-3.5 text-indigo-600" />
                <span>Input 2: Select Recruiter Company</span>
              </label>
              <span className="text-[11px] text-slate-400">
                {companies.length} campus recruiters listed
              </span>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <select
                  value={selectedCompanyId || ""}
                  onChange={(e) => {
                    const id = Number(e.target.value);
                    const match = companies.find((c) => c.company_id === id);
                    if (match) handleSelectCompany(match);
                  }}
                  disabled={isLoadingCompanies}
                  className="w-full pl-3 pr-8 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 bg-white hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 cursor-pointer shadow-2xs truncate"
                  id="company-readiness-select"
                >
                  {companies.map((c) => (
                    <option key={c.company_id} value={c.company_id}>
                      {c.name} ({c.company_type || c.category || "Recruiter"})
                    </option>
                  ))}
                </select>
              </div>

              {selectedCompanyMeta && (
                <div className="hidden sm:flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-slate-50 border border-slate-200 shrink-0">
                  <CompanyLogo
                    name={selectedCompanyMeta.name}
                    logoUrl={selectedCompanyMeta.logo_url}
                    size="sm"
                  />
                  <span className="text-xs font-bold text-slate-700 truncate max-w-[100px]">
                    {selectedCompanyMeta.short_name || selectedCompanyMeta.name}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* THE ONE BUTTON */}
        <div className="mt-5 pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-slate-500 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-indigo-500" />
            <span>
              Evaluates mandatory thresholds & Bloom's taxonomy milestones from Skill Intelligence.
            </span>
          </div>

          <button
            type="button"
            onClick={handleOneButtonCompare}
            disabled={isComparing || isLoadingSkills || !selectedCompanyMeta}
            id="compare-profile-company-button"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white font-bold text-xs shadow-md hover:shadow-lg transition-all active:scale-[0.98] cursor-pointer disabled:opacity-50"
          >
            {isComparing ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Target className="w-4 h-4" />
            )}
            <span>
              {isComparing
                ? "Comparing 12 Skillsets..."
                : `Compare Profile Against ${
                    selectedCompanyMeta?.short_name ||
                    selectedCompanyMeta?.name ||
                    "Company"
                  } Bar`}
            </span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </section>

      {/* CARD 2: OUTPUT - READINESS SCORE & HERO VERDICT */}
      {comparison && (
        <section className="bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden animate-in fade-in duration-300">
          <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            {/* Left: Summary & Verdict */}
            <div className="space-y-3 max-w-2xl">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-indigo-200 text-xs font-semibold border border-white/10">
                  <Building className="w-3.5 h-3.5" />
                  {comparison.companyName}
                </span>
                {comparison.companyType && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-500/30 text-indigo-300 border border-indigo-400/30 uppercase tracking-wider">
                    {comparison.companyType}
                  </span>
                )}
                <span className="text-xs text-slate-300 font-mono">
                  Target Candidate: {comparison.candidateName}
                </span>
              </div>

              <h3 className="text-xl sm:text-2xl font-bold font-heading text-white">
                Placement Qualification Readiness
              </h3>

              <p className="text-xs text-slate-200 leading-relaxed font-normal">
                {comparison.verdictSummary}
              </p>

              {/* Priority Action Items */}
              {comparison.priorityActionPlan.length > 0 && (
                <div className="mt-3 p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-1.5">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-indigo-300 flex items-center gap-1">
                    <TrendingUp className="w-3.5 h-3.5" />
                    <span>Top Priority To Clear Drive Cutoff:</span>
                  </div>
                  <ul className="text-xs text-slate-200 space-y-1">
                    {comparison.priorityActionPlan.map((act, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1.5 shrink-0" />
                        <span>{act}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Right: Circular Readiness Dial & Metrics */}
            <div className="flex flex-col items-center justify-center p-5 rounded-2xl bg-white/10 border border-white/15 backdrop-blur-xs shrink-0 min-w-[220px] text-center">
              <div className="relative w-28 h-28 rounded-full flex items-center justify-center border-4 border-indigo-400/40 shadow-inner bg-slate-900/50 mb-2">
                <div className="text-center">
                  <span className="text-3xl font-extrabold font-mono text-white">
                    {comparison.readinessScore}%
                  </span>
                  <div className="text-[9px] uppercase tracking-wider text-indigo-200 font-bold">
                    Readiness Score
                  </div>
                </div>
              </div>

              <span
                className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${
                  comparison.readinessTier === "Drive Ready"
                    ? "bg-emerald-500/20 text-emerald-300 border border-emerald-400/30"
                    : comparison.readinessTier === "Competitive"
                    ? "bg-indigo-500/20 text-indigo-300 border border-indigo-400/30"
                    : comparison.readinessTier === "Moderate Gap"
                    ? "bg-amber-500/20 text-amber-300 border border-amber-400/30"
                    : "bg-rose-500/20 text-rose-300 border border-rose-400/30"
                }`}
              >
                <Award className="w-3.5 h-3.5" />
                {comparison.readinessTier}
              </span>

              {/* Counters */}
              <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-white/10 w-full text-center">
                <div>
                  <div className="text-emerald-400 font-bold font-mono text-xs">
                    {comparison.skillsMeetingBarCount}
                  </div>
                  <div className="text-[10px] text-slate-300">Meets Bar</div>
                </div>
                <div>
                  <div className="text-amber-400 font-bold font-mono text-xs">
                    {comparison.skillsWithGapCount}
                  </div>
                  <div className="text-[10px] text-slate-300">Deficits</div>
                </div>
                <div>
                  <div className="text-rose-400 font-bold font-mono text-xs">
                    {comparison.criticalGapsCount}
                  </div>
                  <div className="text-[10px] text-slate-300">Critical</div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* CARD 3: OUTPUT - PER-SKILLSET GAP BREAKDOWN ACROSS ALL 12 RADIX SKILLSETS */}
      {comparison && (
        <section className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm sm:text-base font-bold font-heading text-slate-900 flex items-center gap-2">
                <Layers className="w-4 h-4 text-indigo-600" />
                <span>12 RADIX Skillset Gap Breakdown</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Exact comparison between candidate proficiency level and {comparison.companyShortName}'s required threshold.
              </p>
            </div>

            {/* Filter Pills */}
            <div className="flex flex-wrap items-center gap-1.5 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setFilterMode("all")}
                className={`px-2.5 py-1 rounded-lg transition-colors ${
                  filterMode === "all"
                    ? "bg-indigo-600 text-white shadow-2xs"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                All 12 ({comparison.skillGaps.length})
              </button>
              <button
                type="button"
                onClick={() => setFilterMode("gaps")}
                className={`px-2.5 py-1 rounded-lg transition-colors ${
                  filterMode === "gaps"
                    ? "bg-amber-600 text-white shadow-2xs"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                Deficits Only ({comparison.skillsWithGapCount})
              </button>
              <button
                type="button"
                onClick={() => setFilterMode("critical")}
                className={`px-2.5 py-1 rounded-lg transition-colors ${
                  filterMode === "critical"
                    ? "bg-rose-600 text-white shadow-2xs"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                Critical Cutoffs
              </button>
              <button
                type="button"
                onClick={() => setFilterMode("met")}
                className={`px-2.5 py-1 rounded-lg transition-colors ${
                  filterMode === "met"
                    ? "bg-emerald-600 text-white shadow-2xs"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                Qualified ({comparison.skillsMeetingBarCount})
              </button>
            </div>
          </div>

          {/* Granular 12-Skill List */}
          <div className="grid grid-cols-1 gap-3">
            {filteredSkillGaps.map((item) => {
              const isAhead = item.status === "ahead";
              const isMeets = item.status === "meets";
              const isSlight = item.status === "slight_gap";
              const isCritical = item.status === "critical_gap";
              const hasGap = item.gap < 0;
              const isExpanded = expandedSkillId === item.skillSetId;

              return (
                <div
                  key={item.skillSetId}
                  className={`p-4 rounded-xl border transition-all ${
                    isCritical
                      ? "bg-rose-50/30 border-rose-200 hover:border-rose-300"
                      : isSlight
                      ? "bg-amber-50/30 border-amber-200 hover:border-amber-300"
                      : hasGap
                      ? "bg-slate-50/70 border-slate-200 hover:border-slate-300"
                      : "bg-white border-emerald-200/80 hover:border-emerald-300 shadow-2xs"
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    {/* Left: Skill Identity */}
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-xl bg-slate-100 border border-slate-200 text-slate-800 font-mono font-bold text-xs flex items-center justify-center shrink-0">
                        {item.shortName}
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                            {item.skillSetName}
                          </h4>
                          <CriticalityBadge criticality={item.criticality} />
                          <BloomBadge level={item.bloomLevel as any} label={item.bloomLabel} />
                        </div>
                        <p className="text-[11px] text-slate-500 font-medium">
                          {item.summary}
                        </p>
                      </div>
                    </div>

                    {/* Right: Scores & Gap Pill */}
                    <div className="flex items-center gap-4 self-end sm:self-auto">
                      {/* Candidate Level */}
                      <div className="text-right">
                        <div className="text-[10px] text-slate-400 font-semibold uppercase">
                          Your Rating
                        </div>
                        <div className="font-mono text-sm sm:text-base font-bold text-indigo-700">
                          {item.candidateLevel}
                          <span className="text-[10px] text-slate-400 font-normal">/10</span>
                        </div>
                      </div>

                      {/* Required Bar */}
                      <div className="text-right">
                        <div className="text-[10px] text-slate-400 font-semibold uppercase">
                          Company Bar
                        </div>
                        <div className="font-mono text-sm sm:text-base font-bold text-slate-800">
                          {item.companyRequiredLevel}
                          <span className="text-[10px] text-slate-400 font-normal">/10</span>
                        </div>
                      </div>

                      {/* Gap Status Pill */}
                      <div className="min-w-[95px] text-center">
                        <span
                          className={`inline-flex items-center justify-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold w-full ${
                            isAhead
                              ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                              : isMeets
                              ? "bg-blue-100 text-blue-800 border border-blue-200"
                              : isSlight
                              ? "bg-amber-100 text-amber-800 border border-amber-200"
                              : isCritical
                              ? "bg-rose-100 text-rose-800 border border-rose-200"
                              : "bg-slate-100 text-slate-700 border border-slate-200"
                          }`}
                        >
                          {isAhead && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
                          {isMeets && <Check className="w-3 h-3 text-blue-600" />}
                          {isSlight && <AlertCircle className="w-3 h-3 text-amber-600" />}
                          {isCritical && <XCircle className="w-3 h-3 text-rose-600" />}
                          <span>
                            {isAhead
                              ? `Ahead (+${item.gap})`
                              : isMeets
                              ? "Meets Bar"
                              : `Gap (${item.gap})`}
                          </span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Comparative Progress Bar */}
                  <div className="mt-3 pt-3 border-t border-slate-200/60 space-y-1.5">
                    <div className="relative w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                      {/* Target Bar Marker */}
                      <div
                        className="absolute top-0 bottom-0 bg-slate-300 w-1 z-10"
                        style={{ left: `${(item.companyRequiredLevel / 10) * 100}%` }}
                        title={`Target: Level ${item.companyRequiredLevel}`}
                      />
                      {/* Candidate progress */}
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          hasGap ? "bg-amber-500" : "bg-emerald-500"
                        }`}
                        style={{ width: `${(item.candidateLevel / 10) * 100}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-slate-500">
                      <span>Candidate: Level {item.candidateLevel}</span>
                      <span className="font-semibold text-slate-700">
                        Threshold: Level {item.companyRequiredLevel} ({item.requiredProficiency})
                      </span>
                    </div>
                  </div>

                  {/* Topics to Bridge (Expandable) */}
                  {hasGap && item.topicsToBridge.length > 0 && (
                    <div className="mt-2.5 pt-2 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={() =>
                          setExpandedSkillId(isExpanded ? null : item.skillSetId)
                        }
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 transition-colors"
                      >
                        <BookOpen className="w-3 h-3" />
                        <span>
                          {isExpanded
                            ? "Hide Roadmap Milestones to Bridge Gap"
                            : `View ${item.topicsToBridge.length} Milestone${
                                item.topicsToBridge.length > 1 ? "s" : ""
                              } Needed to Clear Bar`}
                        </span>
                        {isExpanded ? (
                          <ChevronUp className="w-3 h-3" />
                        ) : (
                          <ChevronDown className="w-3 h-3" />
                        )}
                      </button>

                      {isExpanded && (
                        <div className="mt-2 p-3 bg-white rounded-lg border border-indigo-100 space-y-1.5 text-xs text-slate-700 animate-in fade-in duration-150">
                          <div className="text-[10px] font-bold uppercase tracking-wider text-indigo-700">
                            Milestones to study from 10-Level Roadmap:
                          </div>
                          <ul className="space-y-1">
                            {item.topicsToBridge.map((t) => (
                              <li key={t.levelNumber} className="flex items-start gap-2">
                                <span className="font-mono font-bold text-[10px] px-1.5 py-0.2 rounded bg-indigo-50 text-indigo-700 shrink-0">
                                  Level {t.levelNumber}
                                </span>
                                <span className="text-[11px] leading-relaxed">{t.topic}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
};

