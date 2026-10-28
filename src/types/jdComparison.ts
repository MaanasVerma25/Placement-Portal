export type RequirementCategory =
  | "Languages"
  | "Frameworks & Tools"
  | "Databases & Cloud"
  | "CS Fundamentals"
  | "Projects & Work"
  | "Education & Eligibility"
  | "Soft Skills";

export type RequirementImportance = "must_have" | "good_to_have" | "preferred";

export type MatchStatus = "match" | "partial" | "gap";

export interface JdRequirementMatch {
  id: string;
  category: RequirementCategory;
  requirement: string;
  importance: RequirementImportance;
  matchStatus: MatchStatus;
  candidateEvidence: string;
  analysis: string;
}

export interface JdRadixComparison {
  skillSetId: number;
  shortName: string;
  skillSetName: string;
  jdDemandLevel: number; // 1-10
  candidateLevel: number; // 1-10
  status: "ahead" | "meets" | "gap" | "not_required";
  matchedTech: string[];
  missingTech: string[];
  summary: string;
}

export interface ProjectAlignment {
  projectTitle: string;
  alignmentReason: string;
  relevantSkills: string[];
}

export interface InterviewPrepPlan {
  suggestedQuestions: string[];
  actionItems: string[];
}

export interface JdComparisonResult {
  id: string;
  jobTitle: string;
  companyName: string;
  experienceLevel: string;
  location: string;
  roleOverview: string;
  overallMatchScore: number; // 0 to 100
  verdict: "Strong Match" | "Moderate Match" | "Skill Gap / Challenging";
  fitSummary: string;
  requirementsComparison: JdRequirementMatch[];
  radixComparison: JdRadixComparison[];
  keyStrengths: string[];
  skillGaps: string[];
  relevantProjects: ProjectAlignment[];
  interviewPrep: InterviewPrepPlan;
  sourceFileName?: string;
  sourceType: "pdf" | "docx" | "text";
  extractedAt: string;
}

