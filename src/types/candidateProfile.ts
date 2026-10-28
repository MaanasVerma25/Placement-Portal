export interface EducationEntry {
  id: string;
  institution: string;
  degree: string;
  fieldOfStudy?: string;
  startDate?: string;
  endDate?: string;
  gradeOrCgpa?: string;
  location?: string;
}

export interface ProjectEntry {
  id: string;
  title: string;
  description: string;
  technologies: string[];
  link?: string;
  role?: string;
  highlights?: string[];
}

export interface ExperienceEntry {
  id: string;
  company: string;
  role: string;
  location?: string;
  startDate?: string;
  endDate?: string;
  description?: string;
  highlights?: string[];
}

export interface CertificationEntry {
  id: string;
  name: string;
  issuer: string;
  issueDate?: string;
  credentialUrl?: string;
}

export interface HackathonEntry {
  id: string;
  name: string;
  projectName?: string;
  roleOrTeam?: string;
  awardOrPosition?: string; // e.g. "Winner", "1st Runner Up", "Finalist", "Top 10", "Participant"
  date?: string;
  description?: string;
  projectUrl?: string;
}

export interface RadixSkillMapping {
  skillSetId: number;
  shortName: string;
  skillSetName: string;
  matchedTechnologies: string[];
  proficiencySummary?: string;
  levelAssessment?: number; // 1-10 level based on Bloom's / RADIX framework
}

export interface CandidateSkills {
  radixSkills: RadixSkillMapping[];
  rawTechnicalSkills: string[];
  toolsAndFrameworks: string[];
  softSkills: string[];
}

export interface CandidateProfile {
  id?: string;
  userId: string;
  fullName: string;
  email: string;
  phone?: string;
  location?: string;
  headline?: string;
  preferredRole?: string;
  summary?: string;
  portfolioUrl?: string;
  linkedinUrl?: string;
  githubUrl?: string;
  education: EducationEntry[];
  skills: CandidateSkills;
  projects: ProjectEntry[];
  experience: ExperienceEntry[];
  certifications: CertificationEntry[];
  hackathons?: HackathonEntry[];
  extractedAt?: string;
  extractionSource?: "direct_text" | "ocr" | "manual";
  resumeFileName?: string;
  updatedAt: string;
}

export interface ParsingProgressStep {
  step: "extracting" | "ocr" | "llm" | "saving" | "completed" | "error";
  message: string;
}
