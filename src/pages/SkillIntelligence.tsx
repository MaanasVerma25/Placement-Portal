import React, { useState, useMemo } from "react";
import {
  ChevronDown,
  ChevronUp,
  Lock,
  CheckCircle2,
  AlertCircle,
  Layers,
  Target,
  RefreshCw,
} from "lucide-react";
import { useCompany } from "@/context/CompanyContext";
import { useCompanySkills, SkillWithRoadmap } from "@/lib/companyApi";
import { CompanyLogo } from "@/components/CompanyLogo";
import { BloomBadge, CriticalityBadge, BLOOM_COLORS } from "@/components/Badges";
import { BloomLevel, DashboardSkill } from "@/lib/companyData";
import { CompanyRadixComparator } from "@/components/profile/CompanyRadixComparator";

const BLOOM_LEGEND = [
  {
    code: "CU" as BloomLevel,
    name: "Conceptual",
    full: "Conceptual Understanding (Levels 1-2)",
    color: "#3b82f6",
    bg: "bg-blue-50 border-blue-200 text-blue-800",
  },
  {
    code: "AP" as BloomLevel,
    name: "Applied",
    full: "Applied Problem Solving (Levels 3-4)",
    color: "#22c55e",
    bg: "bg-emerald-50 border-emerald-200 text-emerald-800",
  },
  {
    code: "AS" as BloomLevel,
    name: "Analytical",
    full: "Analytical Synthesis (Levels 5-6)",
    color: "#eab308",
    bg: "bg-yellow-50 border-yellow-200 text-yellow-800",
  },
  {
    code: "EV" as BloomLevel,
    name: "Evaluative",
    full: "Evaluative Architecture (Levels 7-8)",
    color: "#ef4444",
    bg: "bg-red-50 border-red-200 text-red-800",
  },
  {
    code: "CR" as BloomLevel,
    name: "Creative",
    full: "Creative Innovation (Levels 9-10)",
    color: "#a855f7",
    bg: "bg-purple-50 border-purple-200 text-purple-800",
  },
];

const CRITICALITY_LEGEND = [
  {
    level: "Critical",
    score: "Score ≥ 7/10",
    desc: "Mandatory qualification threshold in recruitment rounds",
    color: "bg-rose-50 text-rose-800 border-rose-200",
    dot: "bg-rose-500",
  },
  {
    level: "Important",
    score: "Score 5-6/10",
    desc: "Expected technical proficiency for project assignments",
    color: "bg-amber-50 text-amber-800 border-amber-200",
    dot: "bg-amber-500",
  },
  {
    level: "Baseline",
    score: "Score 1-4/10",
    desc: "Fundamental working knowledge evaluated during training",
    color: "bg-slate-50 text-slate-700 border-slate-200",
    dot: "bg-slate-400",
  },
];

const SkillCard: React.FC<{
  skill: SkillWithRoadmap | DashboardSkill;
  defaultExpanded?: boolean;
}> = ({ skill, defaultExpanded = false }) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const topics = useMemo(() => (skill as any).topics || [], [skill]);

  const bloomMeta = BLOOM_COLORS[skill.bloom_level] || BLOOM_COLORS.CU;
  const percentage = Math.min(100, Math.max(0, (skill.required_level / 10) * 100));

  return (
    <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs overflow-hidden transition-all duration-200 hover:border-slate-300">
      {/* Skill Summary Row */}
      <div className="p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-3">
          <div className="flex items-start sm:items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-700 font-bold text-sm shrink-0">
              #{skill.skill_set_id}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-heading font-bold text-base sm:text-lg text-slate-900">
                  {skill.skill_set_name}
                </h3>
                <CriticalityBadge criticality={skill.criticality} />
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Benchmark: <span className="font-semibold text-slate-700">{skill.required_proficiency}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 self-end sm:self-auto">
            <BloomBadge level={skill.bloom_level} label={skill.bloom_label} />
            <div className="text-right">
              <span className="font-heading text-xl sm:text-2xl font-extrabold text-slate-900">
                {skill.required_level}
              </span>
              <span className="text-xs text-slate-400 font-medium">/10</span>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-3">
          <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
            <div
              className={`h-2.5 rounded-full transition-all duration-500 ${bloomMeta.bar}`}
              style={{ width: `${percentage}%` }}
            />
          </div>
          <div className="flex justify-between text-[11px] text-slate-400 font-medium mt-1.5">
            <span>Level 1: Foundation</span>
            <span>Target Level {skill.required_level}: {skill.required_proficiency}</span>
            <span>Level 10: Mastery</span>
          </div>
        </div>

        {/* Toggle Roadmap CTA */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors"
          >
            <span>{isExpanded ? "Collapse 10-Level Ladder" : "View 10-Level Roadmap Ladder"}</span>
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          <span className="text-[11px] text-slate-400">
            {skill.required_level} of 10 levels required
          </span>
        </div>
      </div>

      {/* Expandable 10-Level Roadmap Ladder */}
      {isExpanded && (
        <div className="bg-slate-50/70 border-t border-slate-100 p-4 sm:p-6 space-y-2.5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Competency Milestones (1 – 10)
            </span>
            <span className="text-xs text-slate-500">
              Target requirement: Level {skill.required_level}
            </span>
          </div>

          <div className="space-y-2">
            {topics.map((t: any) => {
              const isRequired = t.level_number <= skill.required_level;
              const isExactTarget = t.level_number === skill.required_level;

              return (
                <div
                  key={t.level_number}
                  className={`flex items-start gap-3 p-3 rounded-lg border text-xs transition-colors ${
                    isExactTarget
                      ? "bg-blue-50/80 border-blue-200 text-blue-950 font-medium"
                      : isRequired
                      ? "bg-white border-slate-200/90 text-slate-800"
                      : "bg-slate-100/60 border-dashed border-slate-200 text-slate-400"
                  }`}
                >
                  {/* Level indicator / Lock */}
                  <div className="flex items-center gap-1.5 shrink-0 pt-0.5">
                    {isRequired ? (
                      <CheckCircle2
                        className={`w-4 h-4 ${
                          isExactTarget ? "text-blue-600" : "text-emerald-600"
                        }`}
                      />
                    ) : (
                      <Lock className="w-3.5 h-3.5 text-slate-400" />
                    )}
                    <span
                      className={`font-mono font-bold text-xs ${
                        isExactTarget
                          ? "text-blue-700"
                          : isRequired
                          ? "text-slate-700"
                          : "text-slate-400"
                      }`}
                    >
                      L{t.level_number}
                    </span>
                  </div>

                  {/* Topic Description */}
                  <div className="flex-1 min-w-0">
                    <p className="leading-relaxed">{t.topic}</p>
                  </div>

                  {/* Beyond scope / Target badge */}
                  <div className="shrink-0">
                    {isExactTarget && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-blue-600 text-white uppercase tracking-wider">
                        Required Target
                      </span>
                    )}
                    {!isRequired && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-slate-200 text-slate-500">
                        Beyond scope
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export const SkillIntelligence: React.FC = () => {
  const { selectedCompany, summary: contextSummary } = useCompany();
  const [showComparator, setShowComparator] = useState(false);
  const companyId = selectedCompany?.company_id;
  const {
    data: skills = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useCompanySkills(companyId);

  const summary = contextSummary;

  // Sort skills descending by required_level
  const sortedSkills = useMemo(() => {
    return [...skills].sort((a, b) => b.required_level - a.required_level);
  }, [skills]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white">
        {/* Header Skeleton */}
        <div className="border-b border-[#E5E7EB] bg-white animate-pulse">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex items-center justify-between">
            <div className="flex items-center gap-3.5">
              <div className="w-14 h-14 rounded-xl bg-slate-100" />
              <div className="space-y-2">
                <div className="h-6 bg-slate-100 rounded w-60" />
                <div className="h-3.5 bg-slate-100 rounded w-80" />
              </div>
            </div>
            <div className="h-8 w-28 bg-slate-100 rounded-lg" />
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-pulse">
          {/* Taxonomy Skeleton */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-24 bg-slate-100 rounded-xl" />
            ))}
          </div>

          {/* Cards Skeleton */}
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="p-6 bg-white rounded-xl border border-slate-200/90 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-100" />
                    <div className="space-y-2">
                      <div className="h-5 bg-slate-100 rounded w-48" />
                      <div className="h-3 bg-slate-100 rounded w-28" />
                    </div>
                  </div>
                  <div className="h-8 w-16 bg-slate-100 rounded" />
                </div>
                <div className="h-2.5 bg-slate-100 rounded-full w-full" />
              </div>
            ))}
          </div>
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
            Failed to load skill intelligence
          </h3>
          <p className="text-xs text-rose-600 mt-1 max-w-xs mx-auto">
            {error instanceof Error ? error.message : "Database error loading required competencies."}
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
      {/* Top Header: Company logo + "{Company} Skill Intelligence" */}
      <div className="border-b border-[#E5E7EB] bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <CompanyLogo
                name={summary.name}
                logoUrl={summary.logo_url}
                websiteUrl={summary.website_url}
                size="lg"
              />
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-heading font-bold text-slate-900">
                    {summary.short_name || summary.name} Skill Intelligence
                  </h1>
                </div>
                <p className="text-xs sm:text-sm text-slate-500 font-normal mt-0.5">
                  12 Key Technical &amp; Aptitude Competency Thresholds · Placement Evaluation Matrix
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowComparator(!showComparator)}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 shadow-xs transition-all active:scale-95 cursor-pointer"
                id="skill-intelligence-compare-button"
              >
                <Target className="w-4 h-4" />
                <span>
                  {showComparator ? "Hide Profile Bar Comparison" : "Compare My Profile with Bar"}
                </span>
              </button>
              <span className="hidden sm:inline-flex px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-200">
                {skills.length} Evaluated Skills
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Profile vs Company Bar Comparator Section */}
        {showComparator && (
          <div className="animate-in fade-in slide-in-from-top-2 duration-200 pb-2">
            <CompanyRadixComparator
              initialCompanyId={companyId}
              initialCompanySkills={skills}
              initialCompanyMeta={
                companyId && summary
                  ? { ...summary, company_id: companyId }
                  : undefined
              }
            />
          </div>
        )}
        {/* Bloom 5-Column Taxonomy Legend */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <Target className="w-4 h-4 text-blue-600" />
            <h2 className="text-sm font-heading font-bold uppercase tracking-wider text-slate-700">
              Bloom's Revised Taxonomy Scale (1 - 10)
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {BLOOM_LEGEND.map((item) => (
              <div
                key={item.code}
                className={`p-3.5 rounded-xl border ${item.bg} flex flex-col justify-between`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-extrabold text-sm">{item.code}</span>
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                  </div>
                  <p className="font-heading font-bold text-xs">{item.name}</p>
                </div>
                <p className="text-[11px] opacity-80 mt-2 font-medium">{item.full}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Criticality 3-Card Legend */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <AlertCircle className="w-4 h-4 text-slate-600" />
            <h2 className="text-sm font-heading font-bold uppercase tracking-wider text-slate-700">
              Placement Criticality Framework
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {CRITICALITY_LEGEND.map((item) => (
              <div
                key={item.level}
                className={`p-4 rounded-xl border ${item.color} flex items-start gap-3`}
              >
                <span className={`w-2.5 h-2.5 rounded-full mt-1 shrink-0 ${item.dot}`} />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-heading font-bold text-sm">{item.level}</span>
                    <span className="text-[11px] font-semibold opacity-75">
                      ({item.score})
                    </span>
                  </div>
                  <p className="text-xs opacity-85 mt-1 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 12 Skill Cards (sorted desc by required_level) */}
        <section className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-blue-600" />
              <h2 className="text-base font-heading font-bold text-slate-900">
                Required Technical &amp; Analytical Competencies
              </h2>
            </div>
            <span className="text-xs text-slate-500">Sorted by threshold requirement</span>
          </div>

          <div className="space-y-4">
            {sortedSkills.map((skill, idx) => (
              <SkillCard
                key={skill.skill_set_id}
                skill={skill}
                defaultExpanded={idx === 0}
              />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};
