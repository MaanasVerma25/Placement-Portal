import {
  extractResumeText,
  RADIX_SKILL_CATEGORIES,
} from "./resumeParserService";
import { CandidateProfile } from "@/types/candidateProfile";
import {
  JdComparisonResult,
  JdRequirementMatch,
  JdRadixComparison,
  RequirementCategory,
  MatchStatus,
  RequirementImportance,
} from "@/types/jdComparison";

const OPENROUTER_API_KEY =
  import.meta.env.VITE_OPENROUTER_API_KEY || "";
const OPENROUTER_MODELS = [
  "google/gemini-2.5-flash",
  "openai/gpt-4o-mini",
  "meta-llama/llama-3.3-70b-instruct",
];

const LOCAL_STORAGE_KEY = "jss_last_jd_comparison_result";

/**
 * Extracts raw digital text directly from a JD file (PDF or DOCX),
 * utilizing the same battle-tested extraction pipeline as resume parsing (with OCR fallback).
 */
export async function extractJdText(
  file: File,
  onProgress?: (message: string) => void
): Promise<{ text: string; source: "direct_text" | "ocr" }> {
  return extractResumeText(file, onProgress);
}

export interface CompareJdOptions {
  jdText: string;
  candidateProfile: CandidateProfile | null;
  studentMeta?: {
    username?: string;
    email?: string;
    branchName?: string;
    branchCode?: string;
    rollNumber?: string;
    admissionYear?: number;
  };
  fileName?: string;
  sourceType?: "pdf" | "docx" | "text";
  onProgress?: (message: string) => void;
}

/**
 * Normalizes candidate profile data into a clean, LLM-ready text briefing
 */
function serializeCandidateProfileForPrompt(
  profile: CandidateProfile | null,
  studentMeta?: CompareJdOptions["studentMeta"]
): string {
  if (!profile) {
    return `Student Details:
- Name: ${studentMeta?.username || "Student"}
- Email: ${studentMeta?.email || "student@jss.edu"}
- Branch: ${studentMeta?.branchName || studentMeta?.branchCode || "Engineering"}
- Note: Detailed resume not yet uploaded. Compare against foundational engineering background.`;
  }

  const radixList = (profile.skills?.radixSkills || []).map(
    (r) =>
      `- [${r.shortName}] ${r.skillSetName}: Level ${r.levelAssessment || 5}/10. Known Tech: ${(r.matchedTechnologies || []).join(", ") || "Foundational"}. Summary: ${r.proficiencySummary || ""}`
  ).join("\n");

  const rawSkills = (profile.skills?.rawTechnicalSkills || []).join(", ");
  const tools = (profile.skills?.toolsAndFrameworks || []).join(", ");
  const soft = (profile.skills?.softSkills || []).join(", ");

  const projects = (profile.projects || [])
    .map(
      (p, i) =>
        `Project ${i + 1}: ${p.title}
Role: ${p.role || "Developer"}
Tech: ${(p.technologies || []).join(", ")}
Description: ${p.description || ""}
Highlights: ${(p.highlights || []).join("; ")}`
    )
    .join("\n\n");

  const experience = (profile.experience || [])
    .map(
      (e, i) =>
        `Experience ${i + 1}: ${e.role} at ${e.company} (${e.startDate || ""} - ${e.endDate || "Present"})
Description: ${e.description || ""}
Highlights: ${(e.highlights || []).join("; ")}`
    )
    .join("\n\n");

  const education = (profile.education || [])
    .map(
      (ed) =>
        `- ${ed.degree} in ${ed.fieldOfStudy || "Engineering"} from ${ed.institution} (${ed.startDate || ""} - ${ed.endDate || ""}) Score/CGPA: ${ed.gradeOrCgpa || "N/A"}`
    )
    .join("\n");

  return `Candidate Name: ${profile.fullName}
Headline: ${profile.headline || ""}
Target Role: ${profile.preferredRole || "Software Engineer"}
Summary: ${profile.summary || ""}

Education:
${education || "- JSS University Noida Engineering"}

12 RADIX Competency Framework Scores:
${radixList}

Technical Skills:
${rawSkills || "General engineering skills"}

Developer Tools & Frameworks:
${tools || "Git, VS Code"}

Soft Skills:
${soft || "Problem solving, Teamwork"}

Projects:
${projects || "Academic and course capstone projects"}

Work/Internship Experience:
${experience || "None listed"}

Certifications:
${(profile.certifications || []).map((c) => `- ${c.name} (${c.issuer})`).join("\n") || "None listed"}

Hackathons:
${(profile.hackathons || []).map((h) => `- ${h.name}: ${h.awardOrPosition || "Participant"} with ${h.projectName || "project"}`).join("\n") || "None listed"}`;
}

/**
 * Feeds JD text + Candidate Profile into the LLM via OpenRouter
 * to produce a granular, side-by-side evaluation across all requirements and 12 RADIX categories.
 */
export async function compareJdWithProfile(
  options: CompareJdOptions
): Promise<JdComparisonResult> {
  const {
    jdText,
    candidateProfile,
    studentMeta,
    fileName,
    sourceType = "pdf",
    onProgress,
  } = options;

  if (!jdText || jdText.trim().length < 25) {
    throw new Error(
      "Job description text is too short or empty. Please enter or upload a valid JD document."
    );
  }

  onProgress?.("Mapping candidate profile to Job Description requirements...");

  const candidateBrief = serializeCandidateProfileForPrompt(
    candidateProfile,
    studentMeta
  );

  const radixPrompt = RADIX_SKILL_CATEGORIES.map(
    (c) => `${c.id}. [${c.shortName}] ${c.name}: ${c.description}`
  ).join("\n");

  const systemPrompt = `You are a Principal Technical Recruiter and Career Intelligence Engine for JSS University Placement Portal.
Your task is to analyze a Job Description (JD) and compare it SIDE BY SIDE with the student's candidate profile.

The 12 RADIX Competency categories from public.skill_set_master are:
${radixPrompt}

You must perform a deep, objective, and realistic side-by-side comparison.
Evaluate exact technical requirements, frameworks, experience level, CS fundamentals, and projects against what the candidate has actually demonstrated.

Output a pure JSON object conforming to this exact schema:
{
  "jobTitle": "string (e.g. Associate Backend Engineer)",
  "companyName": "string (detected company or 'Target Employer')",
  "experienceLevel": "string (e.g. 0-1 Years / Fresh Graduate / Entry Level)",
  "location": "string (e.g. Bangalore / Hybrid / Noida)",
  "roleOverview": "string (2-3 concise sentences summarizing the role and primary charter)",
  "overallMatchScore": number (integer 0 to 100 representing realistic candidate fit)",
  "verdict": "Strong Match" | "Moderate Match" | "Skill Gap / Challenging",
  "fitSummary": "string (thorough executive summary paragraph of why the candidate is or is not ready, highlighting both potential and gaps)",
  "requirementsComparison": [
    {
      "id": "string (e.g. req_1)",
      "category": "Languages" | "Frameworks & Tools" | "Databases & Cloud" | "CS Fundamentals" | "Projects & Work" | "Education & Eligibility" | "Soft Skills",
      "requirement": "string (the exact JD requirement or expectation)",
      "importance": "must_have" | "good_to_have" | "preferred",
      "matchStatus": "match" | "partial" | "gap",
      "candidateEvidence": "string (clear evidence from candidate's profile, projects, or RADIX skills that satisfies this, OR 'No direct evidence found in profile')",
      "analysis": "string (1-2 sentences explaining the degree of fit or actionable gap)"
    }
  ],
  "radixComparison": [
    {
      "skillSetId": number (1 to 12),
      "shortName": "string (COD, DSA, APTI, COMM, OOD, AI, SQL, SYSD, CLOUD, SWE, NETW, OS)",
      "skillSetName": "string",
      "jdDemandLevel": number (1 to 10 scale of how critical this RADIX skill is for this specific job),
      "candidateLevel": number (1 to 10 scale based on the candidate's existing score in their profile),
      "status": "ahead" | "meets" | "gap" | "not_required",
      "matchedTech": ["array of technologies requested by JD that candidate knows"],
      "missingTech": ["array of technologies requested by JD that candidate lacks"],
      "summary": "string (brief comparison insight for this RADIX category)"
    }
  ],
  "keyStrengths": [
    "string (top competitive advantages the candidate has for this specific job)"
  ],
  "skillGaps": [
    "string (critical technologies or concepts the candidate should learn before applying/interviewing)"
  ],
  "relevantProjects": [
    {
      "projectTitle": "string",
      "alignmentReason": "string (how this project directly answers JD responsibilities)",
      "relevantSkills": ["technologies from project relevant to JD"]
    }
  ],
  "interviewPrep": {
    "suggestedQuestions": [
      "string (4-6 realistic technical and behavioral interview questions tailored to this JD and candidate's specific background)"
    ],
    "actionItems": [
      "string (3-5 concrete action items before the interview, e.g. brush up on indexing, practice system design for caching)"
    ]
  }
}

Important Instructions:
- Provide at least 8 to 14 granular requirement comparison items covering all major facets of the JD.
- Guarantee that all 12 RADIX categories (IDs 1 through 12) are included in the radixComparison array.
- For matchStatus, use 'match' if the student has strong evidence, 'partial' if they have adjacent or entry experience, and 'gap' if absent.
- Return ONLY the raw JSON object, without markdown quotes or explanation.`;

  const userPrompt = `=== CANDIDATE PROFILE ===
${candidateBrief}

=== JOB DESCRIPTION (JD) ===
${jdText.slice(0, 16000)}

Generate the complete side-by-side comparison in JSON format:`;

  onProgress?.("Invoking AI model for side-by-side requirement evaluation...");

  for (const model of OPENROUTER_MODELS) {
    try {
      const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://jss-placement-portal.edu",
          "X-Title": "JSS Placement Hub - JD Match",
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
          max_tokens: 4000,
          temperature: 0.15,
          response_format: { type: "json_object" },
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(
          `OpenRouter (${model}) status ${res.status}: ${
            errorData.error?.message || res.statusText
          }`
        );
      }

      const responseData = await res.json();
      const content = responseData.choices?.[0]?.message?.content;

      if (!content) {
        throw new Error(`Empty response content from model ${model}`);
      }

      const cleanJson = content
        .replace(/^```json\s*/i, "")
        .replace(/^```\s*/i, "")
        .replace(/```$/i, "")
        .trim();

      const parsed = JSON.parse(cleanJson);

      const normalizedResult: JdComparisonResult = {
        id: `jd_comp_${Date.now()}`,
        jobTitle: parsed.jobTitle || "Software Engineer",
        companyName: parsed.companyName || "Target Employer",
        experienceLevel: parsed.experienceLevel || "Fresher / Entry Level",
        location: parsed.location || "Noida / Hybrid",
        roleOverview:
          parsed.roleOverview ||
          "Technical software engineering role requiring problem solving and development skills.",
        overallMatchScore:
          typeof parsed.overallMatchScore === "number"
            ? Math.min(100, Math.max(0, Math.round(parsed.overallMatchScore)))
            : 70,
        verdict:
          parsed.verdict === "Strong Match" ||
          parsed.verdict === "Moderate Match" ||
          parsed.verdict === "Skill Gap / Challenging"
            ? parsed.verdict
            : "Moderate Match",
        fitSummary:
          parsed.fitSummary ||
          "Candidate matches core foundation requirements with areas for interview preparation.",
        requirementsComparison: Array.isArray(parsed.requirementsComparison)
          ? parsed.requirementsComparison.map((r: any, idx: number) => ({
              id: r.id || `req_${idx + 1}`,
              category: validateCategory(r.category),
              requirement: r.requirement || `Requirement ${idx + 1}`,
              importance: validateImportance(r.importance),
              matchStatus: validateMatchStatus(r.matchStatus),
              candidateEvidence:
                r.candidateEvidence || "No direct evidence found in profile",
              analysis: r.analysis || "Candidate should review this concept.",
            }))
          : [],
        radixComparison: normalizeRadixComparison(
          parsed.radixComparison,
          candidateProfile
        ),
        keyStrengths: Array.isArray(parsed.keyStrengths)
          ? parsed.keyStrengths
          : ["Strong computer science fundamentals", "Academic projects"],
        skillGaps: Array.isArray(parsed.skillGaps)
          ? parsed.skillGaps
          : ["Review job-specific production tooling"],
        relevantProjects: Array.isArray(parsed.relevantProjects)
          ? parsed.relevantProjects.map((p: any) => ({
              projectTitle: p.projectTitle || "Academic Project",
              alignmentReason:
                p.alignmentReason || "Demonstrates practical coding competency.",
              relevantSkills: Array.isArray(p.relevantSkills)
                ? p.relevantSkills
                : [],
            }))
          : [],
        interviewPrep: {
          suggestedQuestions: Array.isArray(
            parsed.interviewPrep?.suggestedQuestions
          )
            ? parsed.interviewPrep.suggestedQuestions
            : [
                "Walk through the architecture of your most complex project.",
                "How do you approach database schema design and indexing?",
                "Describe how you handle concurrency and error recovery.",
              ],
          actionItems: Array.isArray(parsed.interviewPrep?.actionItems)
            ? parsed.interviewPrep.actionItems
            : [
                "Brush up on core Data Structures and Algorithms.",
                "Review the primary technologies listed in the JD.",
              ],
        },
        sourceFileName: fileName || "Job_Description",
        sourceType,
        extractedAt: new Date().toISOString(),
      };

      // Cache result locally
      saveComparisonResultToStorage(normalizedResult);
      return normalizedResult;
    } catch (err: any) {
      console.warn(`LLM model ${model} comparison error:`, err.message);
    }
  }

  // Fallback heuristic comparison engine if OpenRouter API is unavailable
  console.info("Falling back to local heuristic JD comparison engine...");
  onProgress?.("Generating heuristic side-by-side analysis...");
  const fallbackResult = compareJdHeuristically(
    jdText,
    candidateProfile,
    studentMeta,
    fileName,
    sourceType
  );
  saveComparisonResultToStorage(fallbackResult);
  return fallbackResult;
}

/**
 * Validates Requirement Category
 */
function validateCategory(cat: string): RequirementCategory {
  const valid: RequirementCategory[] = [
    "Languages",
    "Frameworks & Tools",
    "Databases & Cloud",
    "CS Fundamentals",
    "Projects & Work",
    "Education & Eligibility",
    "Soft Skills",
  ];
  if (valid.includes(cat as RequirementCategory)) {
    return cat as RequirementCategory;
  }
  return "Languages";
}

/**
 * Validates Requirement Importance
 */
function validateImportance(imp: string): RequirementImportance {
  if (imp === "must_have" || imp === "good_to_have" || imp === "preferred") {
    return imp;
  }
  return "must_have";
}

/**
 * Validates Match Status
 */
function validateMatchStatus(status: string): MatchStatus {
  if (status === "match" || status === "partial" || status === "gap") {
    return status;
  }
  return "partial";
}

/**
 * Guarantees all 12 RADIX categories exist in the comparison
 */
function normalizeRadixComparison(
  rawList: any[],
  profile: CandidateProfile | null
): JdRadixComparison[] {
  const map = new Map<number, any>();
  if (Array.isArray(rawList)) {
    for (const item of rawList) {
      if (item.skillSetId) {
        map.set(Number(item.skillSetId), item);
      } else if (item.shortName) {
        const cat = RADIX_SKILL_CATEGORIES.find(
          (c) => c.shortName.toLowerCase() === String(item.shortName).toLowerCase()
        );
        if (cat) map.set(cat.id, item);
      }
    }
  }

  return RADIX_SKILL_CATEGORIES.map((cat) => {
    const existing = map.get(cat.id);
    const candidateSkill = profile?.skills?.radixSkills?.find(
      (r) => r.skillSetId === cat.id
    );
    const candidateLevel = candidateSkill?.levelAssessment || 5;
    const jdDemandLevel = existing?.jdDemandLevel
      ? Number(existing.jdDemandLevel)
      : 6;

    let status: "ahead" | "meets" | "gap" | "not_required" = "meets";
    if (jdDemandLevel <= 2) {
      status = "not_required";
    } else if (candidateLevel >= jdDemandLevel + 1) {
      status = "ahead";
    } else if (candidateLevel >= jdDemandLevel) {
      status = "meets";
    } else {
      status = "gap";
    }

    return {
      skillSetId: cat.id,
      shortName: cat.shortName,
      skillSetName: cat.name,
      jdDemandLevel,
      candidateLevel,
      status,
      matchedTech: Array.isArray(existing?.matchedTech)
        ? existing.matchedTech
        : candidateSkill?.matchedTechnologies || [],
      missingTech: Array.isArray(existing?.missingTech)
        ? existing.missingTech
        : [],
      summary:
        existing?.summary ||
        `Candidate is rated ${candidateLevel}/10 vs JD expected ${jdDemandLevel}/10 for ${cat.name}.`,
    };
  });
}

/**
 * Heuristic fallback comparison algorithm in case of API failure
 */
export function compareJdHeuristically(
  jdText: string,
  candidateProfile: CandidateProfile | null,
  studentMeta?: CompareJdOptions["studentMeta"],
  fileName?: string,
  sourceType: "pdf" | "docx" | "text" = "pdf"
): JdComparisonResult {
  const lowerJd = jdText.toLowerCase();

  // Extract job title hint
  let jobTitle = "Software Development Engineer";
  const titleMatch = jdText.match(
    /(?:title|role|position|job\s*title)[:\s-]*([^\r\n]+)/i
  );
  if (titleMatch && titleMatch[1]?.trim().length > 0 && titleMatch[1]?.trim().length < 50) {
    jobTitle = titleMatch[1].trim();
  } else if (lowerJd.includes("backend")) {
    jobTitle = "Backend Software Engineer";
  } else if (lowerJd.includes("frontend") || lowerJd.includes("react")) {
    jobTitle = "Frontend Software Engineer";
  } else if (lowerJd.includes("full stack") || lowerJd.includes("fullstack")) {
    jobTitle = "Full Stack Engineer";
  } else if (lowerJd.includes("data engineer") || lowerJd.includes("data analyst")) {
    jobTitle = "Data Engineer";
  } else if (lowerJd.includes("machine learning") || lowerJd.includes("ai engineer")) {
    jobTitle = "AI / ML Engineer";
  }

  // Extract company hint
  let companyName = "Target Employer";
  const compMatch = jdText.match(/(?:at|company|organization)[:\s-]*([^\r\n]+)/i);
  if (compMatch && compMatch[1]?.trim().length > 0 && compMatch[1]?.trim().length < 40) {
    companyName = compMatch[1].trim();
  }

  // Known tech catalog
  const TECH_CATALOG = [
    { name: "Python", cat: "Languages", radixId: 1 },
    { name: "Java", cat: "Languages", radixId: 1 },
    { name: "C++", cat: "Languages", radixId: 1 },
    { name: "JavaScript", cat: "Languages", radixId: 1 },
    { name: "TypeScript", cat: "Languages", radixId: 1 },
    { name: "React", cat: "Frameworks & Tools", radixId: 10 },
    { name: "Node.js", cat: "Frameworks & Tools", radixId: 10 },
    { name: "Express", cat: "Frameworks & Tools", radixId: 10 },
    { name: "Django", cat: "Frameworks & Tools", radixId: 10 },
    { name: "FastAPI", cat: "Frameworks & Tools", radixId: 10 },
    { name: "Spring Boot", cat: "Frameworks & Tools", radixId: 10 },
    { name: "PostgreSQL", cat: "Databases & Cloud", radixId: 7 },
    { name: "MySQL", cat: "Databases & Cloud", radixId: 7 },
    { name: "MongoDB", cat: "Databases & Cloud", radixId: 7 },
    { name: "Redis", cat: "Databases & Cloud", radixId: 8 },
    { name: "Docker", cat: "Databases & Cloud", radixId: 9 },
    { name: "Kubernetes", cat: "Databases & Cloud", radixId: 9 },
    { name: "AWS", cat: "Databases & Cloud", radixId: 9 },
    { name: "Git", cat: "Frameworks & Tools", radixId: 10 },
    { name: "Data Structures", cat: "CS Fundamentals", radixId: 2 },
    { name: "Algorithms", cat: "CS Fundamentals", radixId: 2 },
    { name: "System Design", cat: "CS Fundamentals", radixId: 8 },
    { name: "REST APIs", cat: "CS Fundamentals", radixId: 11 },
    { name: "OOP", cat: "CS Fundamentals", radixId: 5 },
  ];

  // Candidate existing skills list
  const candidateTechSet = new Set<string>();
  if (candidateProfile?.skills?.rawTechnicalSkills) {
    candidateProfile.skills.rawTechnicalSkills.forEach((s) =>
      candidateTechSet.add(s.toLowerCase())
    );
  }
  if (candidateProfile?.skills?.radixSkills) {
    candidateProfile.skills.radixSkills.forEach((r) => {
      r.matchedTechnologies.forEach((t) => candidateTechSet.add(t.toLowerCase()));
    });
  }

  const requirementsComparison: JdRequirementMatch[] = [];
  const matchedTechList: string[] = [];
  const missingTechList: string[] = [];

  TECH_CATALOG.forEach((item, idx) => {
    const reg = new RegExp(`\\b${item.name.replace("+", "\\+")}\\b`, "i");
    if (reg.test(jdText)) {
      const hasSkill = Array.from(candidateTechSet).some(
        (c) => c.includes(item.name.toLowerCase()) || item.name.toLowerCase().includes(c)
      );

      if (hasSkill) {
        matchedTechList.push(item.name);
        requirementsComparison.push({
          id: `req_${idx + 1}`,
          category: item.cat as RequirementCategory,
          requirement: `Proficiency with ${item.name}`,
          importance: "must_have",
          matchStatus: "match",
          candidateEvidence: `Demonstrated ${item.name} in candidate RADIX profile and project records.`,
          analysis: `Strong alignment with the core tech stack requirement.`,
        });
      } else {
        missingTechList.push(item.name);
        requirementsComparison.push({
          id: `req_${idx + 1}`,
          category: item.cat as RequirementCategory,
          requirement: `Experience with ${item.name}`,
          importance: idx % 2 === 0 ? "must_have" : "good_to_have",
          matchStatus: "gap",
          candidateEvidence: `No direct reference to ${item.name} in current resume.`,
          analysis: `Candidate should build a hands-on mini project with ${item.name} or study core concepts.`,
        });
      }
    }
  });

  // Add standard degree & CS fundamentals requirement
  requirementsComparison.unshift({
    id: "req_edu",
    category: "Education & Eligibility",
    requirement: "B.Tech / B.E. in Computer Science, IT, or related Engineering discipline",
    importance: "must_have",
    matchStatus: "match",
    candidateEvidence: `${candidateProfile?.education?.[0]?.degree || "B.Tech"} in ${
      candidateProfile?.education?.[0]?.fieldOfStudy || studentMeta?.branchName || "Computer Science"
    } from JSS University Noida.`,
    analysis: "Meets institutional eligibility and technical degree prerequisite.",
  });

  // Calculate score
  const matchesCount = requirementsComparison.filter((r) => r.matchStatus === "match").length;
  const totalCount = requirementsComparison.length || 1;
  const matchPct = Math.min(95, Math.max(45, Math.round((matchesCount / totalCount) * 100)));

  const verdict =
    matchPct >= 75
      ? "Strong Match"
      : matchPct >= 60
      ? "Moderate Match"
      : "Skill Gap / Challenging";

  // Build 12 RADIX comparisons
  const radixComparison: JdRadixComparison[] = RADIX_SKILL_CATEGORIES.map((cat) => {
    const candidateSkill = candidateProfile?.skills?.radixSkills?.find(
      (r) => r.skillSetId === cat.id
    );
    const candidateLevel = candidateSkill?.levelAssessment || 5;

    // Detect if JD highlights this RADIX skill
    const reg = new RegExp(
      `\\b(${cat.shortName}|${cat.name.split(" ")[0]}|${cat.shortName.toLowerCase()})\\b`,
      "i"
    );
    const isDemanded = reg.test(jdText);
    const jdDemandLevel = isDemanded ? 7 : 5;

    let status: "ahead" | "meets" | "gap" | "not_required" = "meets";
    if (candidateLevel >= jdDemandLevel + 1) {
      status = "ahead";
    } else if (candidateLevel >= jdDemandLevel) {
      status = "meets";
    } else {
      status = "gap";
    }

    return {
      skillSetId: cat.id,
      shortName: cat.shortName,
      skillSetName: cat.name,
      jdDemandLevel,
      candidateLevel,
      status,
      matchedTech: (candidateSkill?.matchedTechnologies || []).filter((t) =>
        lowerJd.includes(t.toLowerCase())
      ),
      missingTech: missingTechList.slice(0, 2),
      summary: `${cat.name}: Candidate profile level ${candidateLevel}/10 vs JD expected ${jdDemandLevel}/10.`,
    };
  });

  // Relevant Projects
  const relevantProjects = (candidateProfile?.projects || []).map((p) => ({
    projectTitle: p.title,
    alignmentReason: `Applies technologies (${(p.technologies || []).join(", ")}) aligning with JD requirements.`,
    relevantSkills: (p.technologies || []).slice(0, 3),
  }));

  return {
    id: `jd_comp_${Date.now()}`,
    jobTitle,
    companyName,
    experienceLevel: "Fresher / 0-2 Years",
    location: "Noida / Delhi NCR / Hybrid",
    roleOverview: `Full-time role focused on developing, deploying, and maintaining high-quality software solutions at ${companyName}.`,
    overallMatchScore: matchPct,
    verdict,
    fitSummary: `The candidate demonstrates a ${matchPct}% alignment with the core requirements. Key technical competencies match, while specific production tools (${missingTechList.slice(0, 3).join(", ") || "cloud deployment"}) represent actionable areas for interview preparation.`,
    requirementsComparison,
    radixComparison,
    keyStrengths: [
      `Solid foundation in ${matchedTechList.slice(0, 3).join(", ") || "core coding and algorithms"}`,
      "Standard engineering curriculum from JSS University Noida",
      "Demonstrated practical project development experience",
    ],
    skillGaps: missingTechList.length > 0
      ? missingTechList.slice(0, 4).map((m) => `Deepen hands-on exposure to ${m}`)
      : ["Practice explaining distributed systems architectures"],
    relevantProjects:
      relevantProjects.length > 0
        ? relevantProjects
        : [
            {
              projectTitle: "Engineering Capstone Project",
              alignmentReason:
                "Demonstrates end-to-end SDLC and software problem solving.",
              relevantSkills: ["Full Stack", "Database", "REST APIs"],
            },
          ],
    interviewPrep: {
      suggestedQuestions: [
        `How have you utilized ${matchedTechList[0] || "your primary programming language"} to build scalable services?`,
        "Explain how you would design an efficient database schema and manage high-traffic queries.",
        `If asked to adopt ${missingTechList[0] || "a new framework"} rapidly on this team, what would be your strategy?`,
        "Describe a challenging bug you diagnosed and your methodology for resolving it.",
      ],
      actionItems: [
        "Review common Data Structures & Algorithms coding patterns.",
        `Practice writing clean syntax and testing with ${matchedTechList[0] || "Python/Java"}.`,
        "Prepare 2-minute elevator pitches for each project in your portfolio.",
      ],
    },
    sourceFileName: fileName || "Job_Description",
    sourceType,
    extractedAt: new Date().toISOString(),
  };
}

/**
 * Stores the latest JD comparison result in localStorage
 */
export function saveComparisonResultToStorage(result: JdComparisonResult): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(result));
  } catch (err) {
    console.warn("Notice saving JD comparison to localStorage:", err);
  }
}

/**
 * Loads the latest JD comparison result from localStorage
 */
export function loadComparisonResultFromStorage(): JdComparisonResult | null {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (err) {
    console.warn("Notice loading JD comparison from localStorage:", err);
    return null;
  }
}

/**
 * Clears comparison cache
 */
export function clearComparisonResultFromStorage(): void {
  try {
    localStorage.removeItem(LOCAL_STORAGE_KEY);
  } catch (err) {
    console.warn("Notice clearing JD comparison from localStorage:", err);
  }
}
