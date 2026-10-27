import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  RADIX_SKILL_CATEGORIES,
  extractResumeText,
  saveCandidateProfileToDatabase,
  loadCandidateProfileFromDatabase,
} from "@/lib/resumeParserService";
import { CandidateProfile } from "@/types/candidateProfile";

describe("Resume Parser & Candidate Profile Service", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  describe("RADIX_SKILL_CATEGORIES", () => {
    it("defines all 12 RADIX skill categories matching public.skill_set_master", () => {
      expect(RADIX_SKILL_CATEGORIES.length).toBe(12);

      const shortNames = RADIX_SKILL_CATEGORIES.map((c) => c.shortName);
      expect(shortNames).toContain("COD");
      expect(shortNames).toContain("DSA");
      expect(shortNames).toContain("APTI");
      expect(shortNames).toContain("COMM");
      expect(shortNames).toContain("OOD");
      expect(shortNames).toContain("AI");
      expect(shortNames).toContain("SQL");
      expect(shortNames).toContain("SYSD");
      expect(shortNames).toContain("CLOUD");
      expect(shortNames).toContain("SWE");
      expect(shortNames).toContain("NETW");
      expect(shortNames).toContain("OS");
    });

    it("verifies IDs align from 1 to 12 sequentially", () => {
      for (let i = 1; i <= 12; i++) {
        const item = RADIX_SKILL_CATEGORIES.find((c) => c.id === i);
        expect(item).toBeDefined();
      }
    });
  });

  describe("saveCandidateProfileToDatabase & loadCandidateProfileFromDatabase", () => {
    it("persists and retrieves candidate profile from local storage and database cache", async () => {
      const mockProfile: CandidateProfile = {
        userId: "test-user-456",
        fullName: "Aman Verma",
        email: "j25cse108@jssuninoida.edu.in",
        headline: "Frontend & Full Stack Engineer | React & Node.js",
        summary: "Passionate developer with expertise in algorithms and React web development.",
        education: [
          {
            id: "edu_1",
            institution: "JSS University Noida",
            degree: "Bachelor of Technology",
            fieldOfStudy: "Computer Science & Engineering",
            startDate: "2021",
            endDate: "2025",
            gradeOrCgpa: "8.8 CGPA",
          },
        ],
        skills: {
          radixSkills: [
            {
              skillSetId: 1,
              shortName: "COD",
              skillSetName: "Coding",
              matchedTechnologies: ["TypeScript", "Python"],
              proficiencySummary: "Daily active developer",
              levelAssessment: 8,
            },
            {
              skillSetId: 2,
              shortName: "DSA",
              skillSetName: "Data Structures and Algorithms",
              matchedTechnologies: ["Binary Trees", "Graphs"],
              proficiencySummary: "Solved 300+ LeetCode problems",
              levelAssessment: 7,
            },
          ],
          rawTechnicalSkills: ["React", "TypeScript", "Node.js", "PostgreSQL"],
          toolsAndFrameworks: ["Git", "Docker", "VS Code"],
          softSkills: ["Team Leadership", "Problem Solving"],
        },
        projects: [
          {
            id: "proj_1",
            title: "Campus Placement Intelligence Hub",
            description: "Analytics and intelligence portal for campus drives.",
            technologies: ["React", "TypeScript", "Tailwind CSS"],
          },
        ],
        experience: [],
        certifications: [],
        updatedAt: new Date().toISOString(),
      };

      const saveRes = await saveCandidateProfileToDatabase(mockProfile);
      expect(saveRes.success).toBe(true);

      const loaded = await loadCandidateProfileFromDatabase("test-user-456");
      expect(loaded).toBeDefined();
      expect(loaded?.fullName).toBe("Aman Verma");
      expect(loaded?.skills.radixSkills.length).toBe(2);
      expect(loaded?.projects[0].title).toBe("Campus Placement Intelligence Hub");
    });
  });
});
