export type SkillGapStatus =
  | "ahead"
  | "meets"
  | "slight_gap"
  | "critical_gap"
  | "gap";

export interface SkillGapItem {
  skillSetId: number;
  skillSetName: string;
  shortName: string;
  candidateLevel: number; // 1-10
  companyRequiredLevel: number; // 1-10
  gap: number; // candidateLevel - companyRequiredLevel (positive = ahead, negative = deficit)
  status: SkillGapStatus;
  criticality: "Critical" | "Important" | "Baseline";
  requiredProficiency: string;
  bloomLevel: string;
  bloomLabel: string;
  matchedTechnologies: string[];
  topicsToBridge: Array<{
    levelNumber: number;
    topic: string;
  }>;
  summary: string;
}

export interface CompanyReadinessResult {
  companyId: number;
  companyName: string;
  companyShortName: string;
  companyLogoUrl?: string;
  companyType?: string;
  candidateName: string;
  readinessScore: number; // 0 to 100
  readinessTier:
    | "Drive Ready"
    | "Competitive"
    | "Moderate Gap"
    | "Significant Gap";
  verdictSummary: string;
  totalSkillsEvaluated: number;
  skillsMeetingBarCount: number;
  skillsWithGapCount: number;
  criticalGapsCount: number;
  skillGaps: SkillGapItem[];
  priorityActionPlan: string[];
  evaluatedAt: string;
}

