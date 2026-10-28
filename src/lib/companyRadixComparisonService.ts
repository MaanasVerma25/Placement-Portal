import { CandidateProfile, RadixSkillMapping } from "@/types/candidateProfile";
import { DashboardSkill } from "@/lib/companyData";
import { SkillWithRoadmap } from "@/lib/companyApi";
import { getSkillTopics } from "@/data/skillTopics";
import {
  CompanyReadinessResult,
  SkillGapItem,
  SkillGapStatus,
} from "@/types/companyRadixComparison";

const STORAGE_KEY = "jss_last_company_radix_comparison";

interface CanonicalSkillDef {
  id: number;
  shortName: string;
  name: string;
  aliases: string[];
}

export const CANONICAL_SKILL_DEFINITIONS: CanonicalSkillDef[] = [
  {
    id: 1,
    shortName: "DSA",
    name: "Data Structures & Algorithms",
    aliases: ["data structures", "algorithms", "dsa", "data structures and algorithms"],
  },
  {
    id: 2,
    shortName: "OOD",
    name: "Object-Oriented Programming",
    aliases: ["object-oriented", "object oriented", "oop", "ood", "design patterns"],
  },
  {
    id: 3,
    shortName: "SQL",
    name: "SQL & Databases",
    aliases: ["sql", "databases", "database", "relational", "mysql", "postgresql"],
  },
  {
    id: 4,
    shortName: "CLOUD",
    name: "Cloud Fundamentals (AWS/Azure)",
    aliases: ["cloud", "devops", "aws", "azure", "gcp", "docker", "kubernetes"],
  },
  {
    id: 5,
    shortName: "OS",
    name: "Operating Systems",
    aliases: ["operating system", "operating systems", "os", "linux", "unix"],
  },
  {
    id: 6,
    shortName: "NETW",
    name: "Computer Networks",
    aliases: ["computer network", "computer networks", "networking", "tcp/ip", "netw"],
  },
  {
    id: 7,
    shortName: "APTI",
    name: "Aptitude & Logical Reasoning",
    aliases: ["aptitude", "logical reasoning", "problem solving", "apti", "quantitative"],
  },
  {
    id: 8,
    shortName: "COMM",
    name: "Communication & Behavioral",
    aliases: ["communication", "behavioral", "soft skills", "comm", "verbal"],
  },
  {
    id: 9,
    shortName: "COD",
    name: "Coding / Web Development Basics",
    aliases: ["coding", "web development", "web development basics", "cod", "programming", "frontend", "javascript", "python"],
  },
  {
    id: 10,
    shortName: "SYSD",
    name: "System Design (Intro)",
    aliases: ["system design", "architecture", "sysd", "scalability", "microservices"],
  },
  {
    id: 11,
    shortName: "SWE",
    name: "Software Engineering / Git & Version Control",
    aliases: ["git", "version control", "software engineering", "swe", "sdlc", "testing"],
  },
  {
    id: 12,
    shortName: "AI",
    name: "Generative AI Basics / AI Native",
    aliases: ["generative ai", "generative ai basics", "ai", "machine learning", "ai native", "llm", "deep learning"],
  },
];

export const COMPANY_SKILL_TO_SHORTNAME: Record<number, string> = {
  1: "DSA",
  2: "OOD",
  3: "SQL",
  4: "CLOUD",
  5: "OS",
  6: "NETW",
  7: "APTI",
  8: "COMM",
  9: "COD",
  10: "SYSD",
  11: "SWE",
  12: "AI",
};

/**
 * Resolves candidate's verified skill rating matching the company requirement
 */
function findCandidateSkillForCompany(
  companySkill: SkillWithRoadmap | DashboardSkill,
  candidateRadixSkills: RadixSkillMapping[]
): { candidateLevel: number; matchedTechnologies: string[]; shortName: string } {
  const companyNameLower = (companySkill.skill_set_name || "").toLowerCase();

  // 1. Resolve canonical shortName for this company skill
  let targetShortName =
    COMPANY_SKILL_TO_SHORTNAME[companySkill.skill_set_id] || "";

  if (!targetShortName) {
    const canonical = CANONICAL_SKILL_DEFINITIONS.find((def) =>
      def.aliases.some((alias) => companyNameLower.includes(alias))
    );
    targetShortName = canonical?.shortName || `SKILL${companySkill.skill_set_id}`;
  }

  // 2. Find matching candidate skill by targetShortName
  const matchedCandidateSkill = candidateRadixSkills.find((cand) => {
    if (cand.shortName && cand.shortName.toUpperCase() === targetShortName.toUpperCase()) {
      return true;
    }

    // Name text alias match
    const candNameLower = (cand.skillSetName || "").toLowerCase();
    const canonical = CANONICAL_SKILL_DEFINITIONS.find(
      (def) => def.shortName.toUpperCase() === targetShortName.toUpperCase()
    );
    if (canonical?.aliases.some((alias) => candNameLower.includes(alias))) {
      return true;
    }

    return false;
  });

  if (matchedCandidateSkill) {
    return {
      candidateLevel: Number(matchedCandidateSkill.levelAssessment) || 5,
      matchedTechnologies: matchedCandidateSkill.matchedTechnologies || [],
      shortName: targetShortName,
    };
  }

  // Fallback default rating if skill was not mapped in resume
  return {
    candidateLevel: 3,
    matchedTechnologies: [],
    shortName: targetShortName,
  };
}

export interface CompareCompanyOptions {
  company: {
    company_id: number;
    name: string;
    short_name?: string;
    logo_url?: string;
    company_type?: string;
  };
  companySkills: (SkillWithRoadmap | DashboardSkill)[];
  candidateProfile: CandidateProfile | null;
  candidateNameHint?: string;
}

/**
 * Compares candidate's saved profile against a company's expected bar across all 12 RADIX skillsets.
 * Generates an overall readiness score and a granular per-skillset gap breakdown with roadmap bridge milestones.
 */
export function compareProfileAgainstCompanyBar(
  options: CompareCompanyOptions
): CompanyReadinessResult {
  const { company, companySkills, candidateProfile, candidateNameHint } = options;

  const candidateRadixSkills = candidateProfile?.skills?.radixSkills || [];
  const candidateName =
    candidateProfile?.fullName ||
    candidateNameHint ||
    "Candidate";

  const skillGaps: SkillGapItem[] = [];
  let weightedScoreSum = 0;
  let totalWeight = 0;
  let meetingBarCount = 0;
  let gapCount = 0;
  let criticalGapCount = 0;

  // Process all company skills (usually 12 from Skill Intelligence)
  companySkills.forEach((compSkill) => {
    const { candidateLevel, matchedTechnologies, shortName } =
      findCandidateSkillForCompany(compSkill, candidateRadixSkills);

    const requiredLevel = Number(compSkill.required_level) || 5;
    const gap = candidateLevel - requiredLevel;
    const criticality = compSkill.criticality || "Important";

    // Weight based on placement criticality
    const weight = criticality === "Critical" ? 3 : criticality === "Important" ? 2 : 1;
    totalWeight += weight;

    // Skill score calculation
    let skillScoreRatio = 1.0;
    let status: SkillGapStatus = "meets";

    if (gap > 0) {
      status = "ahead";
      skillScoreRatio = 1.05; // slight reward for exceeding bar
      meetingBarCount++;
    } else if (gap === 0) {
      status = "meets";
      skillScoreRatio = 1.0;
      meetingBarCount++;
    } else {
      gapCount++;
      skillScoreRatio = Math.max(0.1, candidateLevel / requiredLevel);

      if (gap === -1) {
        status = "slight_gap";
      } else if (criticality === "Critical") {
        status = "critical_gap";
        criticalGapCount++;
      } else {
        status = "gap";
      }
    }

    weightedScoreSum += skillScoreRatio * weight;

    // Get roadmap topics required to bridge the gap
    const allTopics =
      (compSkill as SkillWithRoadmap).topics ||
      getSkillTopics(compSkill.skill_set_id);

    const topicsToBridge =
      gap < 0
        ? allTopics
            .filter(
              (t) =>
                t.level_number > candidateLevel &&
                t.level_number <= requiredLevel
            )
            .map((t) => ({ levelNumber: t.level_number, topic: t.topic }))
        : [];

    let summaryText = "";
    if (status === "ahead") {
      summaryText = `Exceeds ${company.short_name || company.name}'s bar by +${gap} level${gap > 1 ? "s" : ""}.`;
    } else if (status === "meets") {
      summaryText = `Meets target threshold of Level ${requiredLevel}/10 (${compSkill.required_proficiency}).`;
    } else if (status === "slight_gap") {
      summaryText = `Minor 1-level deficit. 1 milestone required to clear qualification cutoff.`;
    } else if (status === "critical_gap") {
      summaryText = `High-priority deficit: ${Math.abs(gap)} levels below mandatory recruitment threshold.`;
    } else {
      summaryText = `${Math.abs(gap)} levels below target expected for ${compSkill.required_proficiency} tier.`;
    }

    skillGaps.push({
      skillSetId: compSkill.skill_set_id,
      skillSetName: compSkill.skill_set_name,
      shortName,
      candidateLevel,
      companyRequiredLevel: requiredLevel,
      gap,
      status,
      criticality,
      requiredProficiency: compSkill.required_proficiency,
      bloomLevel: compSkill.bloom_level,
      bloomLabel: compSkill.bloom_label,
      matchedTechnologies,
      topicsToBridge,
      summary: summaryText,
    });
  });

  // Calculate final readiness score (0 - 100)
  const rawScore = totalWeight > 0 ? (weightedScoreSum / totalWeight) * 100 : 70;
  const readinessScore = Math.min(100, Math.max(10, Math.round(rawScore)));

  // Determine readiness tier
  let readinessTier: CompanyReadinessResult["readinessTier"] = "Competitive";
  if (readinessScore >= 85 && criticalGapCount === 0) {
    readinessTier = "Drive Ready";
  } else if (readinessScore >= 70 && criticalGapCount <= 1) {
    readinessTier = "Competitive";
  } else if (readinessScore >= 50) {
    readinessTier = "Moderate Gap";
  } else {
    readinessTier = "Significant Gap";
  }

  // Generate priority action items to bridge gaps
  const priorityActionPlan: string[] = [];
  const criticalGapSkills = skillGaps.filter(
    (s) => s.status === "critical_gap" || (s.gap < 0 && s.criticality === "Critical")
  );

  criticalGapSkills.forEach((cg) => {
    const nextTopic = cg.topicsToBridge[0]?.topic;
    if (nextTopic) {
      priorityActionPlan.push(
        `Critical: Master ${cg.shortName} milestone: "${nextTopic}" (Target Level ${cg.companyRequiredLevel}).`
      );
    } else {
      priorityActionPlan.push(
        `Critical: Upgrade ${cg.skillSetName} to Level ${cg.companyRequiredLevel}/10 before recruitment cutoff.`
      );
    }
  });

  const otherGapSkills = skillGaps.filter(
    (s) => s.gap < 0 && s.criticality !== "Critical"
  );

  otherGapSkills.slice(0, 3).forEach((og) => {
    priorityActionPlan.push(
      `Recommended: Review ${og.skillSetName} concepts to close the ${Math.abs(og.gap)}-level gap.`
    );
  });

  if (priorityActionPlan.length === 0) {
    priorityActionPlan.push(
      "Profile clears all required thresholds. Focus on company mock interviews and project articulation."
    );
  }

  // Verdict Summary
  const companyTitle = company.short_name || company.name;
  let verdictSummary = "";
  if (readinessTier === "Drive Ready") {
    verdictSummary = `${candidateName} exhibits strong readiness (${readinessScore}%) for ${companyTitle}. You meet or exceed the expected competency bar in ${meetingBarCount} of ${companySkills.length} RADIX skillsets with zero critical deficits.`;
  } else if (readinessTier === "Competitive") {
    verdictSummary = `${candidateName} is competitively positioned (${readinessScore}%) for ${companyTitle}. You satisfy ${meetingBarCount} out of ${companySkills.length} skillset bars, with ${gapCount} targeted areas to reinforce prior to drive rounds.`;
  } else if (readinessTier === "Moderate Gap") {
    verdictSummary = `${candidateName} has achieved foundational competence (${readinessScore}%), but has ${gapCount} skill gaps below ${companyTitle}'s benchmark, including ${criticalGapCount} critical cutoff areas.`;
  } else {
    verdictSummary = `Significant preparation is required (${readinessScore}% readiness) to qualify for ${companyTitle}'s technical rounds. Follow the prioritized milestone plan to elevate your RADIX ratings.`;
  }

  const result: CompanyReadinessResult = {
    companyId: company.company_id,
    companyName: company.name,
    companyShortName: company.short_name || company.name,
    companyLogoUrl: company.logo_url,
    companyType: company.company_type,
    candidateName,
    readinessScore,
    readinessTier,
    verdictSummary,
    totalSkillsEvaluated: companySkills.length,
    skillsMeetingBarCount: meetingBarCount,
    skillsWithGapCount: gapCount,
    criticalGapsCount: criticalGapCount,
    skillGaps,
    priorityActionPlan,
    evaluatedAt: new Date().toISOString(),
  };

  saveCompanyComparisonToStorage(result);
  return result;
}

/**
 * Cache result in localStorage
 */
export function saveCompanyComparisonToStorage(
  result: CompanyReadinessResult
): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(result));
  } catch (e) {
    console.warn("Notice saving company readiness to localStorage:", e);
  }
}

/**
 * Load cached comparison from localStorage
 */
export function loadCompanyComparisonFromStorage(): CompanyReadinessResult | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (e) {
    console.warn("Notice loading company readiness from localStorage:", e);
    return null;
  }
}

/**
 * Clear cached comparison from localStorage
 */
export function clearCompanyComparisonFromStorage(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.warn("Notice clearing company readiness from localStorage:", e);
  }
}
