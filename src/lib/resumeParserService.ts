import * as pdfjsLib from "pdfjs-dist";
import mammoth from "mammoth";
import { supabase } from "./supabaseClient";
import {
  CandidateProfile,
  RadixSkillMapping,
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

Extract the complete profile and RADIX skill mappings in pure JSON format:`;

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

  throw lastError || new Error("Failed to parse resume with available AI models.");
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
 * Saves candidate profile to Supabase database (auth.users metadata & local storage)
 */
export async function saveCandidateProfileToDatabase(
  profile: CandidateProfile
): Promise<{ success: boolean; error?: string }> {
  try {
    // 1. Save to Supabase auth user metadata (Postgres auth.users table)
    try {
      const { error: authErr } = await supabase.auth.updateUser({
        data: {
          candidate_profile: profile,
        },
      });
      if (authErr) {
        console.warn("Notice updating profile metadata:", authErr.message);
      }
    } catch (e) {
      console.warn("Catch updating profile metadata:", e);
    }

    // 2. Save to local storage for fast refresh resilience
    try {
      localStorage.setItem(
        `jss_candidate_profile_${profile.userId}`,
        JSON.stringify(profile)
      );
    } catch {}

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/**
 * Loads candidate profile from Supabase user metadata or local storage
 */
export async function loadCandidateProfileFromDatabase(
  userId: string,
  userMetadata?: any
): Promise<CandidateProfile | null> {
  if (!userId) return null;

  if (userMetadata?.candidate_profile) {
    return userMetadata.candidate_profile as CandidateProfile;
  }

  try {
    const cached = localStorage.getItem(`jss_candidate_profile_${userId}`);
    if (cached) {
      return JSON.parse(cached) as CandidateProfile;
    }
  } catch {}

  return null;
}
