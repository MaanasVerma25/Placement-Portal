/**
 * Authentication and College Email Utilities for JSS University Placement Portal.
 * Enforces email validation for student college IDs (e.g. j25cse108@jssuninoida.edu.in).
 */

export const COLLEGE_DOMAIN = "jssuninoida.edu.in";
export const COLLEGE_DOMAIN_DISPLAY = "@jssuninoida.edu.in";

export interface ParsedStudentInfo {
  isCollegeEmail: boolean;
  isValidStudentFormat: boolean;
  email: string;
  username: string;
  admissionYear?: number;
  batchYears?: string;
  branchCode?: string;
  branchName?: string;
  rollNumber?: string;
  displayName?: string;
}

const BRANCH_MAP: Record<string, string> = {
  CSE: "Computer Science & Engineering",
  CS: "Computer Science & Engineering",
  IT: "Information Technology",
  ECE: "Electronics & Communication Engineering",
  EE: "Electrical Engineering",
  EEE: "Electrical & Electronics Engineering",
  ME: "Mechanical Engineering",
  CE: "Civil Engineering",
  AIML: "Artificial Intelligence & Machine Learning",
  AI: "Artificial Intelligence",
  DS: "Data Science",
  AIDS: "AI & Data Science",
  CSBS: "Computer Science & Business Systems",
  CSDS: "Computer Science & Data Science",
  MCA: "Master of Computer Applications",
  MBA: "Master of Business Administration",
  BCA: "Bachelor of Computer Applications",
  BBA: "Bachelor of Business Administration",
};

/**
 * Validates if an email belongs to the college domain @jssuninoida.edu.in.
 */
export function isCollegeEmail(email: string): boolean {
  if (!email || typeof email !== "string") return false;
  const trimmed = email.trim().toLowerCase();
  const domainPattern = new RegExp(`^[a-zA-Z0-9._%+-]+@${COLLEGE_DOMAIN.replace(".", "\\.")}$`, "i");
  return domainPattern.test(trimmed);
}

/**
 * Validates and extracts student details from email (e.g., j25cse108@jssuninoida.edu.in).
 * Format breakdown:
 * - 'j': JSS identifier (optional prefix)
 * - '25': Admission year (2025)
 * - 'cse': Branch code
 * - '108': Student roll/sequence number
 */
export function parseStudentEmail(email: string): ParsedStudentInfo {
  const trimmed = (email || "").trim().toLowerCase();
  const validDomain = isCollegeEmail(trimmed);

  if (!validDomain) {
    const parts = trimmed.split("@");
    return {
      isCollegeEmail: false,
      isValidStudentFormat: false,
      email: trimmed,
      username: parts[0] || "",
    };
  }

  const username = trimmed.split("@")[0];

  // Regex matches formats like: j25cse108, 25cse108, j24aiml045, etc.
  const match = username.match(/^([a-z]?)(\d{2})([a-z]{2,5})(\d{1,5})$/i);

  if (!match) {
    return {
      isCollegeEmail: true,
      isValidStudentFormat: false,
      email: trimmed,
      username,
      displayName: username.toUpperCase(),
    };
  }

  const [, , yearStr, branchStr, rollStr] = match;
  const yearSuffix = parseInt(yearStr, 10);
  const admissionYear = 2000 + yearSuffix;
  const branchCode = branchStr.toUpperCase();
  const branchName = BRANCH_MAP[branchCode] || `${branchCode} Department`;
  const gradYear = branchCode === "MCA" || branchCode === "MBA" ? admissionYear + 2 : admissionYear + 4;
  const batchYears = `${admissionYear} - ${gradYear}`;
  const rollNumber = rollStr;

  return {
    isCollegeEmail: true,
    isValidStudentFormat: true,
    email: trimmed,
    username,
    admissionYear,
    batchYears,
    branchCode,
    branchName,
    rollNumber,
    displayName: `${branchCode} - #${rollNumber} (${batchYears})`,
  };
}

/**
 * Validates email with human-friendly error messages.
 */
export function getEmailValidationError(email: string): string | null {
  if (!email || !email.trim()) {
    return "College email address is required.";
  }

  const trimmed = email.trim();
  if (!trimmed.includes("@")) {
    return "Please enter a valid email address.";
  }

  const parts = trimmed.split("@");
  if (parts.length !== 2 || !parts[1]) {
    return "Please enter a valid email address.";
  }

  const domain = parts[1].toLowerCase();
  if (domain !== COLLEGE_DOMAIN) {
    return `Access restricted: Only official college email IDs ending with @${COLLEGE_DOMAIN} are authorized (e.g. j25cse108@${COLLEGE_DOMAIN}).`;
  }

  return null;
}

/**
 * Returns the proper callback redirect URL for Supabase Auth.
 * Supports VITE_SITE_URL environment override, deployed Vercel domain, or window.location.origin.
 */
export function getAuthRedirectUrl(path: string = "/auth/callback"): string {
  const customSiteUrl = import.meta.env.VITE_SITE_URL || import.meta.env.VITE_PUBLIC_SITE_URL;
  const cleanPath = path.startsWith("/") ? path : `/${path}`;

  // If explicitly configured in .env or Vercel environment variables
  if (customSiteUrl) {
    return `${customSiteUrl.replace(/\/+$/, "")}${cleanPath}`;
  }

  // If running in browser and on a non-localhost domain (like Vercel)
  if (typeof window !== "undefined" && window.location.origin) {
    const origin = window.location.origin;
    if (!origin.includes("localhost") && !origin.includes("127.0.0.1")) {
      return `${origin}${cleanPath}`;
    }
  }

  // Production fallback for Vercel
  return `https://placement-portal-lime-iota.vercel.app${cleanPath}`;
}
