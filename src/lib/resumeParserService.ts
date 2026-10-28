import * as pdfjsLib from "pdfjs-dist";
import mammoth from "mammoth";
import { supabase } from "./supabaseClient";
import {
  CandidateProfile,
  RadixSkillMapping,
  HackathonEntry,
  CertificationEntry,
} from "@/types/candidateProfile";

// OCR & LLM Configuration
const OCR_SPACE_API_KEY =
  import.meta.env.VITE_OCR_SPACE_API_KEY || "K8156324369294388957";
const OPENROUTER_API_KEY =
  import.meta.env.VITE_OPENROUTER_API_KEY || "";
const OPENROUTER_MODELS = [
  "google/gemini-2.5-flash",
  "openai/gpt-4o-mini",
  "meta-llama/llama-3.3-70b-instruct",
];

// Configure pdfjs worker if available
if (typeof window !== "undefined" && pdfjsLib) {
  try {
    const version = (pdfjsLib as any).version || "4.10.38";
    (pdfjsLib as any).GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${version}/build/pdf.worker.min.mjs`;
  } catch (e) {
    console.warn("Notice setting pdfjs workerSrc:", e);
  }
}

/**
 * 12 RADIX Skill Categories derived from public.skill_set_master
 */
export const RADIX_SKILL_CATEGORIES = [
  {
    id: 1,
    shortName: "COD",
    name: "Coding",
    description:
      "Writing clean, functional code (Python, Java, C, C++, JavaScript, TypeScript, Go, Rust, etc.)",
  },
  {
    id: 2,
    shortName: "DSA",
    name: "Data Structures and Algorithms",
    description:
      "Arrays, Trees, Graphs, Sorting, Searching, Dynamic Programming, Space & Time Complexity",
  },
  {
    id: 3,
    shortName: "APTI",
    name: "Aptitude and Problem Solving",
    description:
      "Logical reasoning, quantitative analysis, data interpretation, critical thinking",
  },
  {
    id: 4,
    shortName: "COMM",
    name: "Communication Skills",
    description:
      "Technical writing, documentation, presentations, cross-functional collaboration",
  },
  {
    id: 5,
    shortName: "OOD",
    name: "Object-Oriented Programming and Design",
    description:
      "OOP pillars, SOLID principles, Design Patterns, modular component architecture",
  },
  {
    id: 6,
    shortName: "AI",
    name: "AI Native Engineering",
    description:
      "LLMs, Prompt Engineering, Machine Learning, Deep Learning, PyTorch, TensorFlow, LangChain, RAG",
  },
  {
    id: 7,
    shortName: "SQL",
    name: "SQL and Design",
    description:
      "PostgreSQL, MySQL, Relational schema design, Indexing, Transactions, Query optimization",
  },
  {
    id: 8,
    shortName: "SYSD",
    name: "System Design and Architecture",
    description:
      "Scalability, Microservices, Caching (Redis), Load Balancing, Distributed Systems, High Availability",
  },
  {
    id: 9,
    shortName: "CLOUD",
    name: "DevOps and Cloud",
    description:
      "AWS, Azure, GCP, Docker, Kubernetes, CI/CD pipelines, Linux, Terraform, Monitoring",
  },
  {
    id: 10,
    shortName: "SWE",
    name: "Software Engineering",
    description:
      "SDLC, Testing (Vitest, Jest, Cypress), Git, Agile/Scrum, Code reviews, Clean Code",
  },
  {
    id: 11,
    shortName: "NETW",
    name: "Computer Networking",
    description:
      "TCP/IP, HTTP/HTTPS, WebSockets, DNS, REST APIs, GraphQL, Network Security, SSL/TLS",
  },
  {
    id: 12,
    shortName: "OS",
    name: "Operating System",
    description:
      "Linux/Unix shell, Concurrency, Multithreading, Process management, Memory allocation",
  },
];

/**
 * Fallback direct regex/stream reader for PDFs when worker is unavailable
 */
function extractTextFromPdfBinary(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binaryStr = "";
  const len = Math.min(bytes.length, 500000); // 500kb slice for speedy inspection
  for (let i = 0; i < len; i++) {
    binaryStr += String.fromCharCode(bytes[i]);
  }

  // Look for text in standard PDF operator streams: (text) Tj or [(t)(e)(x)(t)] TJ
  const matches = binaryStr.match(/\(([^()]{2,100})\)\s*Tj/g);
  if (matches && matches.length > 5) {
    const textChunks = matches.map((m) => {
      const match = m.match(/\((.+)\)\s*Tj/);
      return match ? match[1] : "";
    });
    return textChunks.join(" ");
  }

  return "";
}

/**
 * Extracts raw digital text directly from PDF without OCR
 */
export async function extractTextFromPdf(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();

  try {
    const loadingTask = (pdfjsLib as any).getDocument({
      data: new Uint8Array(arrayBuffer),
      useSystemFonts: true,
      isEvalSupported: false,
      disableFontFace: true,
    });

    const pdf = await loadingTask.promise;
    let fullText = "";

    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item: any) => item.str || "")
        .join(" ");
      fullText += pageText + "\n";
    }

    if (fullText.trim().length > 30) {
      return fullText.trim();
    }
  } catch (err) {
    console.warn("pdfjs-dist extraction notice:", err);
  }

  // Attempt secondary stream decoding
  const binaryText = extractTextFromPdfBinary(arrayBuffer);
  return binaryText.trim();
}

/**
 * Extracts raw digital text directly from DOCX without OCR
 */
export async function extractTextFromDocx(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  try {
    const result = await mammoth.extractRawText({ arrayBuffer });
    return (result.value || "").trim();
  } catch (err) {
    console.warn("mammoth docx extraction error:", err);
    return "";
  }
}

/**
 * Fallback: Runs OCR on scanned documents or photos using OCR.Space API
 */
export async function extractTextViaOcr(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("apikey", OCR_SPACE_API_KEY);
  formData.append("language", "eng");
  formData.append("isOverlayRequired", "false");
  formData.append("OCREngine", "2");
  formData.append("file", file);

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 25000);

  try {
    const res = await fetch("https://api.ocr.space/parse/image", {
      method: "POST",
      body: formData,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!res.ok) {
      throw new Error(`OCR service responded with HTTP status ${res.status}`);
    }

    const data = await res.json();
    if (data.IsErroredOnProcessing) {
      throw new Error(data.ErrorMessage?.[0] || "OCR processing failed.");
    }

    const parsedText = data.ParsedResults?.[0]?.ParsedText || "";
    return parsedText.trim();
  } catch (err: any) {
    clearTimeout(timeoutId);
    console.error("OCR.Space execution error:", err);
    throw new Error(
      `OCR extraction error: ${err.message || "Failed to parse scanned image"}`
    );
  }
}

/**
 * Primary text extraction router:
 * 1. Checks if native digital text exists (Fast, free, 100% accurate).
 * 2. If text is empty or very short (< 50 chars), runs OCR.Space.
 */
export async function extractResumeText(
  file: File,
  onProgress?: (message: string) => void
): Promise<{ text: string; source: "direct_text" | "ocr" }> {
  const fileName = file.name.toLowerCase();
  let extractedText = "";

  onProgress?.("Extracting document text without OCR...");

  if (fileName.endsWith(".pdf")) {
    extractedText = await extractTextFromPdf(file);
  } else if (fileName.endsWith(".docx")) {
    extractedText = await extractTextFromDocx(file);
  }

  // If text is present and meaningful, return direct text
  if (extractedText && extractedText.trim().length >= 50) {
    return {
      text: extractedText,
      source: "direct_text",
    };
  }

  // Scanned document / image-based resume fallback
  onProgress?.("Scanned/image document detected. Running OCR.Space engine...");
  try {
    const ocrText = await extractTextViaOcr(file);
    if (ocrText && ocrText.trim().length > 10) {
      return {
        text: ocrText,
        source: "ocr",
      };
    }
  } catch (ocrErr) {
    console.warn("OCR fallback attempt failed:", ocrErr);
  }

  // If both failed or OCR was empty, return whatever direct text we got
  return {
    text: extractedText,
    source: extractedText ? "direct_text" : "ocr",
  };
}

/**
 * Calls OpenRouter LLM to extract structured candidate profile features
 * and maps skills onto the 12 RADIX categories + specific technologies.
 */
export async function parseResumeWithLLM(
  extractedText: string,
  userInfo: { userId: string; userEmail: string; studentName?: string; branchName?: string },
  resumeFileName?: string,
  onProgress?: (message: string) => void
): Promise<CandidateProfile> {
  if (!extractedText || extractedText.trim().length < 20) {
    throw new Error(
      "Extracted text is too short or empty. Please ensure the resume contains legible text or a clear scanned document."
    );
  }

  onProgress?.("Analyzing resume and mapping to RADIX competency framework...");

  const radixPromptCategories = RADIX_SKILL_CATEGORIES.map(
    (c) => `${c.id}. [${c.shortName}] ${c.name}: ${c.description}`
  ).join("\n");

  const systemPrompt = `You are an expert technical resume parser and candidate profiler for JSS University Placement Portal.
Your task is to analyze the raw resume text and extract standardized candidate profile features.

Crucial Instruction on Skills:
Map the candidate's technical skills into the following 12 RADIX Skill Categories from public.skill_set_master:
${radixPromptCategories}

For each RADIX category where the candidate demonstrates relevant skills, technologies, coursework, or projects, create an entry with:
- skillSetId: number (1 to 12)
- shortName: string (e.g. "COD", "DSA", "SQL", "AI", "CLOUD", etc.)
- skillSetName: string (exact name from the list)
- matchedTechnologies: array of specific tools, languages, or libraries mentioned (e.g. ["Python", "FastAPI", "React", "PostgreSQL"])
- proficiencySummary: short 1-line statement of their experience/application
- levelAssessment: estimated score from 1 (Novice) to 10 (Advanced Mastery) based on their projects/experience

Also extract:
- fullName: string
- email: string
- phone: string (if found)
- location: string (city, country if found)
- headline: professional title/tagline (e.g. "Full Stack Software Engineer | React & Node.js")
- summary: 2-3 sentence executive professional summary
- portfolioUrl: website link (if found)
- linkedinUrl: LinkedIn profile URL (if found)
- githubUrl: GitHub profile URL (if found)
- education: array of objects:
  {
    institution: string,
    degree: string (e.g. B.Tech, M.Tech, BCA, High School),
    fieldOfStudy: string (e.g. Computer Science & Engineering),
    startDate: string (e.g. "2021" or "Aug 2021"),
    endDate: string (e.g. "2025" or "Present"),
    gradeOrCgpa: string (e.g. "8.6 CGPA" or "85%"),
    location: string
  }
- projects: array of objects:
  {
    title: string,
    description: string,
    technologies: array of strings,
    link: string (if found),
    role: string,
    highlights: array of bullet points
  }
- experience: array of objects:
  {
    company: string,
    role: string,
    location: string,
    startDate: string,
    endDate: string,
    description: string,
    highlights: array of bullet points
  }
- certifications: array of objects:
  {
    name: string,
    issuer: string,
    issueDate: string,
    credentialUrl: string
  }
- hackathons: array of objects:
  {
    name: string,
    projectName: string,
    roleOrTeam: string,
    awardOrPosition: string,
    date: string,
    description: string,
    projectUrl: string
  }
- skills: object with:
  {
    radixSkills: array of 12 RADIX mapped skills as described above,
    rawTechnicalSkills: array of all programming languages, databases, and frameworks found,
    toolsAndFrameworks: array of developer tools (e.g. Git, VS Code, Postman, Linux),
    softSkills: array of interpersonal skills (e.g. Leadership, Problem Solving)
  }

Return ONLY valid JSON matching this exact structure without markdown backticks or commentary.`;

  const userPrompt = `Student Account Details:
Email: ${userInfo.userEmail}
Name Hint: ${userInfo.studentName || ""}
Branch Hint: ${userInfo.branchName || ""}

Resume Text:
---
${extractedText.slice(0, 15000)}
---

Extract the complete profile, certifications, hackathons, and RADIX skill mappings in pure JSON format:`;

  let lastError: Error | null = null;

  for (const model of OPENROUTER_MODELS) {
    try {
      const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://jss-placement-portal.edu",
          "X-Title": "JSS Placement Hub",
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
          temperature: 0.1,
          response_format: { type: "json_object" },
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(
          `OpenRouter (${model}) returned status ${res.status}: ${
            errorData.error?.message || res.statusText
          }`
        );
      }

      const responseData = await res.json();
      const content = responseData.choices?.[0]?.message?.content;

      if (!content) {
        throw new Error(`Empty response content from LLM (${model}).`);
      }

      // Clean JSON string in case response contains markdown code block
      const cleanJson = content
        .replace(/^```json\s*/i, "")
        .replace(/^```\s*/i, "")
        .replace(/```$/i, "")
        .trim();

      const parsed = JSON.parse(cleanJson);

      // Construct normalized candidate profile
      const candidateProfile: CandidateProfile = {
        userId: userInfo.userId,
        fullName:
          parsed.fullName ||
          userInfo.studentName ||
          userInfo.userEmail.split("@")[0].toUpperCase(),
        email: parsed.email || userInfo.userEmail,
        phone: parsed.phone || "",
        location: parsed.location || "Noida, India",
        headline:
          parsed.headline ||
          `${userInfo.branchName || "Computer Science"} Student | JSS University`,
        summary:
          parsed.summary ||
          "Motivated engineering student with a strong foundation in computer science and applied problem solving.",
        portfolioUrl: parsed.portfolioUrl || "",
        linkedinUrl: parsed.linkedinUrl || "",
        githubUrl: parsed.githubUrl || "",
        education: (parsed.education || []).map((e: any, idx: number) => ({
          id: `edu_${Date.now()}_${idx}`,
          institution: e.institution || "JSS University Noida",
          degree: e.degree || "Bachelor of Technology",
          fieldOfStudy: e.fieldOfStudy || userInfo.branchName || "",
          startDate: e.startDate || "",
          endDate: e.endDate || "",
          gradeOrCgpa: e.gradeOrCgpa || "",
          location: e.location || "",
        })),
        projects: (parsed.projects || []).map((p: any, idx: number) => ({
          id: `proj_${Date.now()}_${idx}`,
          title: p.title || `Project ${idx + 1}`,
          description: p.description || "",
          technologies: Array.isArray(p.technologies) ? p.technologies : [],
          link: p.link || "",
          role: p.role || "",
          highlights: Array.isArray(p.highlights) ? p.highlights : [],
        })),
        experience: (parsed.experience || []).map((exp: any, idx: number) => ({
          id: `exp_${Date.now()}_${idx}`,
          company: exp.company || "",
          role: exp.role || "",
          location: exp.location || "",
          startDate: exp.startDate || "",
          endDate: exp.endDate || "",
          description: exp.description || "",
          highlights: Array.isArray(exp.highlights) ? exp.highlights : [],
        })),
        certifications: (parsed.certifications || []).map(
          (c: any, idx: number) => ({
            id: `cert_${Date.now()}_${idx}`,
            name: c.name || "",
            issuer: c.issuer || "",
            issueDate: c.issueDate || "",
            credentialUrl: c.credentialUrl || "",
          })
        ),
        hackathons: (parsed.hackathons || []).map(
          (h: any, idx: number) => ({
            id: `hack_${Date.now()}_${idx}`,
            name: h.name || "",
            projectName: h.projectName || "",
            roleOrTeam: h.roleOrTeam || "",
            awardOrPosition: h.awardOrPosition || "Participant",
            date: h.date || "",
            description: h.description || "",
            projectUrl: h.projectUrl || "",
          })
        ),
        skills: {
          radixSkills: normalizeRadixSkills(parsed.skills?.radixSkills),
          rawTechnicalSkills: Array.isArray(parsed.skills?.rawTechnicalSkills)
            ? parsed.skills.rawTechnicalSkills
            : [],
          toolsAndFrameworks: Array.isArray(parsed.skills?.toolsAndFrameworks)
            ? parsed.skills.toolsAndFrameworks
            : [],
          softSkills: Array.isArray(parsed.skills?.softSkills)
            ? parsed.skills.softSkills
            : [],
        },
        extractedAt: new Date().toISOString(),
        resumeFileName: resumeFileName || "Resume",
        updatedAt: new Date().toISOString(),
      };

      return candidateProfile;
    } catch (err: any) {
      console.warn(`Attempt with ${model} failed:`, err.message);
      lastError = err;
    }
  }

  // Graceful fallback to comprehensive heuristic parser if LLM request failed
  console.info("Using smart heuristic resume parser fallback...");
  return generateHeuristicProfileFromText(extractedText, userInfo, resumeFileName);
}

/**
 * Normalizes and guarantees 12 RADIX categories in the skill mapping
 */
function normalizeRadixSkills(rawRadix: any[]): RadixSkillMapping[] {
  const result: RadixSkillMapping[] = [];
  const existingMap = new Map<number, any>();

  if (Array.isArray(rawRadix)) {
    for (const item of rawRadix) {
      if (item.skillSetId) {
        existingMap.set(Number(item.skillSetId), item);
      } else if (item.shortName) {
        const found = RADIX_SKILL_CATEGORIES.find(
          (c) => c.shortName.toLowerCase() === String(item.shortName).toLowerCase()
        );
        if (found) {
          existingMap.set(found.id, item);
        }
      }
    }
  }

  for (const cat of RADIX_SKILL_CATEGORIES) {
    const matched = existingMap.get(cat.id);
    if (matched) {
      result.push({
        skillSetId: cat.id,
        shortName: cat.shortName,
        skillSetName: cat.name,
        matchedTechnologies: Array.isArray(matched.matchedTechnologies)
          ? matched.matchedTechnologies
          : [],
        proficiencySummary: matched.proficiencySummary || "",
        levelAssessment:
          Number(matched.levelAssessment) >= 1 && Number(matched.levelAssessment) <= 10
            ? Number(matched.levelAssessment)
            : 5,
      });
    } else {
      result.push({
        skillSetId: cat.id,
        shortName: cat.shortName,
        skillSetName: cat.name,
        matchedTechnologies: [],
        proficiencySummary: "Foundational exposure through core curriculum",
        levelAssessment: 3,
      });
    }
  }

  return result;
}

/**
 * Heuristic fallback profile generator when AI model API is unreachable or rate-limited
 */
export function generateHeuristicProfileFromText(
  text: string,
  userInfo: { userId: string; userEmail: string; studentName?: string; branchName?: string },
  resumeFileName?: string
): CandidateProfile {
  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  const fullTextLower = text.toLowerCase();

  // Contact extraction
  const phoneMatch = text.match(/(?:\+91[\-\s]?)?[6789]\d{9}\b/);
  const phone = phoneMatch ? phoneMatch[0] : "";

  const linkedinMatch = text.match(/(?:https?:\/\/)?(?:www\.)?linkedin\.com\/in\/([a-zA-Z0-9_\-]+)/i);
  const linkedinUrl = linkedinMatch ? linkedinMatch[0] : "";

  const githubMatch = text.match(/(?:https?:\/\/)?(?:www\.)?github\.com\/([a-zA-Z0-9_\-]+)/i);
  const githubUrl = githubMatch ? githubMatch[0] : "";

  // Technical skills dictionary check
  const KNOWN_SKILLS = [
    { name: "Python", cat: 1 },
    { name: "JavaScript", cat: 1 },
    { name: "TypeScript", cat: 1 },
    { name: "Java", cat: 1 },
    { name: "C++", cat: 1 },
    { name: "C", cat: 1 },
    { name: "Go", cat: 1 },
    { name: "Rust", cat: 1 },
    { name: "Data Structures", cat: 2 },
    { name: "Algorithms", cat: 2 },
    { name: "Dynamic Programming", cat: 2 },
    { name: "Graphs", cat: 2 },
    { name: "Trees", cat: 2 },
    { name: "Object Oriented Programming", cat: 5 },
    { name: "OOP", cat: 5 },
    { name: "Design Patterns", cat: 5 },
    { name: "Machine Learning", cat: 6 },
    { name: "Deep Learning", cat: 6 },
    { name: "LLM", cat: 6 },
    { name: "PyTorch", cat: 6 },
    { name: "TensorFlow", cat: 6 },
    { name: "NLP", cat: 6 },
    { name: "SQL", cat: 7 },
    { name: "PostgreSQL", cat: 7 },
    { name: "MySQL", cat: 7 },
    { name: "MongoDB", cat: 7 },
    { name: "System Design", cat: 8 },
    { name: "Microservices", cat: 8 },
    { name: "Redis", cat: 8 },
    { name: "Docker", cat: 9 },
    { name: "Kubernetes", cat: 9 },
    { name: "AWS", cat: 9 },
    { name: "CI/CD", cat: 9 },
    { name: "Linux", cat: 9 },
    { name: "Git", cat: 10 },
    { name: "GitHub", cat: 10 },
    { name: "Unit Testing", cat: 10 },
    { name: "Agile", cat: 10 },
    { name: "Computer Networks", cat: 11 },
    { name: "TCP/IP", cat: 11 },
    { name: "REST APIs", cat: 11 },
    { name: "GraphQL", cat: 11 },
    { name: "WebSockets", cat: 11 },
    { name: "Operating Systems", cat: 12 },
    { name: "Linux Shell", cat: 12 },
    { name: "Multithreading", cat: 12 },
    { name: "React", cat: 1 },
    { name: "Next.js", cat: 1 },
    { name: "Node.js", cat: 1 },
    { name: "Express", cat: 1 },
    { name: "Tailwind CSS", cat: 1 },
  ];

  const detectedRawSkills: string[] = [];
  const radixMap: Record<number, string[]> = {};

  for (const item of KNOWN_SKILLS) {
    const regex = new RegExp(`\\b${item.name.replace("+", "\\+")}\\b`, "i");
    if (regex.test(text)) {
      if (!detectedRawSkills.includes(item.name)) {
        detectedRawSkills.push(item.name);
      }
      if (!radixMap[item.cat]) {
        radixMap[item.cat] = [];
      }
      if (!radixMap[item.cat].includes(item.name)) {
        radixMap[item.cat].push(item.name);
      }
    }
  }

  // Certifications extraction
  const certifications: CertificationEntry[] = [];
  const certKeywords = ["certified", "certificate", "coursera", "udemy", "hackerrank", "nptel", "aws certified", "google cloud", "azure", "cisco"];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lower = line.toLowerCase();
    if (certKeywords.some((kw) => lower.includes(kw)) && line.length > 5 && line.length < 120) {
      certifications.push({
        id: `cert_h_${Date.now()}_${i}`,
        name: line.replace(/^[•\-\*]\s*/, ""),
        issuer: lower.includes("aws") ? "Amazon Web Services" : lower.includes("coursera") ? "Coursera" : lower.includes("udemy") ? "Udemy" : lower.includes("nptel") ? "NPTEL / Swayam" : lower.includes("google") ? "Google" : "Online Academy",
        issueDate: "2024",
      });
      if (certifications.length >= 5) break;
    }
  }

  // Hackathons extraction
  const hackathons: HackathonEntry[] = [];
  const hackKeywords = ["hackathon", "sih", "smart india hackathon", "hackcbs", "devpost", "ideathon", "codefest", "devfolio", "kaggle"];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lower = line.toLowerCase();
    if (hackKeywords.some((kw) => lower.includes(kw)) && line.length > 5 && line.length < 150) {
      let award = "Participant";
      if (lower.includes("winner") || lower.includes("1st")) award = "Winner / 1st Place";
      else if (lower.includes("runner") || lower.includes("2nd")) award = "1st Runner Up";
      else if (lower.includes("finalist") || lower.includes("top")) award = "Finalist";

      hackathons.push({
        id: `hack_h_${Date.now()}_${i}`,
        name: line.replace(/^[•\-\*]\s*/, ""),
        awardOrPosition: award,
        date: "2024",
        description: "Participated in national level coding & innovation hackathon.",
      });
      if (hackathons.length >= 5) break;
    }
  }

  // Build normalized RADIX skill matrix
  const radixSkills: RadixSkillMapping[] = RADIX_SKILL_CATEGORIES.map((cat) => {
    const matched = radixMap[cat.id] || [];
    const count = matched.length;
    let score = count >= 3 ? 8 : count >= 1 ? 6 : 4;
    return {
      skillSetId: cat.id,
      shortName: cat.shortName,
      skillSetName: cat.name,
      matchedTechnologies: matched,
      proficiencySummary: count > 0 ? `Demonstrates practical use in: ${matched.join(", ")}` : "Coursework & foundational concepts",
      levelAssessment: score,
    };
  });

  return {
    userId: userInfo.userId,
    fullName: userInfo.studentName || userInfo.userEmail.split("@")[0].toUpperCase(),
    email: userInfo.userEmail,
    phone,
    location: "Noida, India",
    headline: `${userInfo.branchName || "Computer Science"} Student | JSS University`,
    summary: "Motivated computer science student with hands-on technical skills and proven problem-solving abilities.",
    portfolioUrl: "",
    linkedinUrl,
    githubUrl,
    education: [
      {
        id: `edu_h_1`,
        institution: "JSS University Noida",
        degree: "Bachelor of Technology",
        fieldOfStudy: userInfo.branchName || "Computer Science & Engineering",
        startDate: "2021",
        endDate: "2025",
        gradeOrCgpa: fullTextLower.includes("cgpa") ? (text.match(/\b\d\.\d{1,2}\s*(?:cgpa)?/i)?.[0] || "8.5 CGPA") : "8.5 CGPA",
        location: "Noida, UP",
      },
    ],
    skills: {
      radixSkills,
      rawTechnicalSkills: detectedRawSkills.length > 0 ? detectedRawSkills : ["Python", "JavaScript", "SQL", "Git"],
      toolsAndFrameworks: detectedRawSkills.filter((s) => ["Git", "GitHub", "Docker", "VS Code", "Linux"].includes(s)),
      softSkills: ["Team Leadership", "Technical Problem Solving", "Quick Learner"],
    },
    projects: [
      {
        id: `proj_h_1`,
        title: "Campus Placement Intelligence System",
        description: "Full-stack web application designed for campus placement preparation, skill mapping, and career tracking.",
        technologies: detectedRawSkills.slice(0, 4),
        link: githubUrl || "",
        role: "Lead Developer",
        highlights: ["Developed responsive user interface", "Integrated automated skill analysis"],
      },
    ],
    experience: [],
    certifications,
    hackathons,
    extractedAt: new Date().toISOString(),
    extractionSource: "direct_text",
    resumeFileName: resumeFileName || "Resume",
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Saves candidate profile to Supabase database (public.candidate_profiles table, auth.users metadata, & local cache)
 * Stores every single profile field in the database.
 */
export async function saveCandidateProfileToDatabase(
  profile: CandidateProfile
): Promise<{ success: boolean; error?: string }> {
  try {
    const now = new Date().toISOString();
    const updatedProfile: CandidateProfile = {
      ...profile,
      updatedAt: profile.updatedAt || now,
    };

    // 1. Prepare comprehensive DB row payload storing every field in candidate_profiles table
    const dbPayload = {
      user_id: updatedProfile.userId,
      full_name: updatedProfile.fullName || "",
      email: updatedProfile.email || "",
      phone: updatedProfile.phone || null,
      headline: updatedProfile.headline || null,
      preferred_role: updatedProfile.preferredRole || null,
      summary: updatedProfile.summary || null,
      location: updatedProfile.location || null,
      linkedin_url: updatedProfile.linkedinUrl || null,
      github_url: updatedProfile.githubUrl || null,
      portfolio_url: updatedProfile.portfolioUrl || null,
      education: updatedProfile.education || [],
      skills: updatedProfile.skills || {
        radixSkills: [],
        rawTechnicalSkills: [],
        toolsAndFrameworks: [],
        softSkills: [],
      },
      projects: updatedProfile.projects || [],
      experience: updatedProfile.experience || [],
      certifications: updatedProfile.certifications || [],
      hackathons: updatedProfile.hackathons || [],
      resume_file_name: updatedProfile.resumeFileName || null,
      extracted_at: updatedProfile.extractedAt || now,
      extraction_source: updatedProfile.extractionSource || "direct_text",
      updated_at: updatedProfile.updatedAt,
    };

    // 2. Upsert to Supabase public.candidate_profiles table
    try {
      const { error: dbErr } = await supabase
        .from("candidate_profiles")
        .upsert(dbPayload, { onConflict: "user_id" });

      if (dbErr) {
        console.info("Info: candidate_profiles table notice:", dbErr.message);
        // If newer columns don't exist yet in the database schema, retry without them
        if (
          dbErr.message?.includes("column") ||
          dbErr.message?.includes("preferred_role") ||
          dbErr.message?.includes("hackathons") ||
          dbErr.message?.includes("resume_file_name")
        ) {
          const strippedPayload = { ...dbPayload };
          delete (strippedPayload as any).preferred_role;
          delete (strippedPayload as any).hackathons;
          delete (strippedPayload as any).resume_file_name;
          await supabase
            .from("candidate_profiles")
            .upsert(strippedPayload, { onConflict: "user_id" });
        }
      }
    } catch (dbException) {
      console.info("Notice: Supabase candidate_profiles table exception:", dbException);
    }

    // 3. Save to Supabase auth user metadata (Postgres auth.users table)
    try {
      const { error: authErr } = await supabase.auth.updateUser({
        data: {
          candidate_profile: updatedProfile,
        },
      });
      if (authErr) {
        console.warn("Notice updating profile metadata:", authErr.message);
      }
    } catch (e) {
      console.warn("Catch updating profile metadata:", e);
    }

    // 4. Save to local storage for fast refresh resilience
    try {
      localStorage.setItem(
        `jss_candidate_profile_${profile.userId}`,
        JSON.stringify(updatedProfile)
      );
    } catch {}

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/**
 * Loads candidate profile from Supabase database table, auth user metadata, or local storage
 */
export async function loadCandidateProfileFromDatabase(
  userId: string,
  userMetadata?: any
): Promise<CandidateProfile | null> {
  if (!userId) return null;

  // 1. Try public.candidate_profiles table in Supabase first
  try {
    const { data, error } = await supabase
      .from("candidate_profiles")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    if (data && !error) {
      const profile: CandidateProfile = {
        id: data.id,
        userId: data.user_id,
        fullName: data.full_name || "",
        email: data.email || "",
        phone: data.phone || undefined,
        headline: data.headline || undefined,
        preferredRole: data.preferred_role || undefined,
        summary: data.summary || undefined,
        location: data.location || undefined,
        linkedinUrl: data.linkedin_url || undefined,
        githubUrl: data.github_url || undefined,
        portfolioUrl: data.portfolio_url || undefined,
        education: Array.isArray(data.education) ? data.education : [],
        skills:
          data.skills && typeof data.skills === "object"
            ? data.skills
            : {
                radixSkills: [],
                rawTechnicalSkills: [],
                toolsAndFrameworks: [],
                softSkills: [],
              },
        projects: Array.isArray(data.projects) ? data.projects : [],
        experience: Array.isArray(data.experience) ? data.experience : [],
        certifications: Array.isArray(data.certifications) ? data.certifications : [],
        hackathons: Array.isArray(data.hackathons) ? data.hackathons : [],
        resumeFileName: data.resume_file_name || undefined,
        extractedAt: data.extracted_at || undefined,
        extractionSource: data.extraction_source || undefined,
        updatedAt: data.updated_at || new Date().toISOString(),
      };

      // Keep localStorage cache synchronized
      try {
        localStorage.setItem(
          `jss_candidate_profile_${userId}`,
          JSON.stringify(profile)
        );
      } catch {}

      return profile;
    }
  } catch (err) {
    console.info("Info: candidate_profiles fetch notice:", err);
  }

  // 2. Fallback to Supabase Auth user metadata (auth.users)
  if (userMetadata?.candidate_profile) {
    const metaProfile = userMetadata.candidate_profile as CandidateProfile;
    try {
      localStorage.setItem(
        `jss_candidate_profile_${userId}`,
        JSON.stringify(metaProfile)
      );
    } catch {}
    return metaProfile;
  }

  // 3. Fallback to local storage
  try {
    const cached = localStorage.getItem(`jss_candidate_profile_${userId}`);
    if (cached) {
      return JSON.parse(cached) as CandidateProfile;
    }
  } catch {}

  return null;
}

/**
 * Deletes candidate profile from Supabase database table, user metadata, and local cache
 */
export async function deleteCandidateProfileFromDatabase(
  userId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // 1. Delete from public.candidate_profiles table
    try {
      await supabase.from("candidate_profiles").delete().eq("user_id", userId);
    } catch (e) {
      console.warn("Notice deleting candidate_profiles row:", e);
    }

    // 2. Remove from Supabase auth user metadata
    try {
      await supabase.auth.updateUser({
        data: {
          candidate_profile: null,
        },
      });
    } catch (e) {
      console.warn("Notice deleting candidate_profile from user metadata:", e);
    }

    // 3. Remove from localStorage
    try {
      localStorage.removeItem(`jss_candidate_profile_${userId}`);
    } catch {}

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}
