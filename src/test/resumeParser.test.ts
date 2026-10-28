import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  RADIX_SKILL_CATEGORIES,
  extractResumeText,
  saveCandidateProfileToDatabase,
  loadCandidateProfileFromDatabase,
  deleteCandidateProfileFromDatabase,
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
    it("persists and retrieves all candidate profile fields including preferredRole and hackathons", async () => {
      const mockProfile: CandidateProfile = {
        userId: "test-user-456",
        fullName: "Aman Verma",
        email: "j25cse108@jssuninoida.edu.in",
        phone: "+91 9876543210",
        headline: "Frontend & Full Stack Engineer | React & Node.js",
        preferredRole: "Full Stack Software Engineer",
        summary: "Passionate developer with expertise in algorithms and React web development.",
        location: "Noida, UP",
        linkedinUrl: "https://linkedin.com/in/amanverma",
        githubUrl: "https://github.com/amanverma",
        portfolioUrl: "https://amanverma.dev",
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
        experience: [
          {
            id: "exp_1",
            company: "Tech Solutions",
            role: "Software Engineering Intern",
            startDate: "June 2024",
            endDate: "August 2024",
            description: "Built performant backend microservices.",
          },
        ],
        certifications: [
          {
            id: "cert_1",
            name: "AWS Certified Developer",
            issuer: "Amazon Web Services",
            issueDate: "2024",
          },
        ],
        hackathons: [
          {
            id: "hack_1",
            name: "Smart India Hackathon",
            projectName: "AI Health Monitor",
            awardOrPosition: "Winner",
            date: "2024",
          },
        ],
        resumeFileName: "Aman_Verma_Resume.pdf",
        extractionSource: "direct_text",
        updatedAt: new Date().toISOString(),
      };

      const saveRes = await saveCandidateProfileToDatabase(mockProfile);
      expect(saveRes.success).toBe(true);

      const loaded = await loadCandidateProfileFromDatabase("test-user-456");
      expect(loaded).toBeDefined();
      expect(loaded?.fullName).toBe("Aman Verma");
      expect(loaded?.preferredRole).toBe("Full Stack Software Engineer");
      expect(loaded?.phone).toBe("+91 9876543210");
      expect(loaded?.location).toBe("Noida, UP");
      expect(loaded?.linkedinUrl).toBe("https://linkedin.com/in/amanverma");
      expect(loaded?.githubUrl).toBe("https://github.com/amanverma");
      expect(loaded?.portfolioUrl).toBe("https://amanverma.dev");
      expect(loaded?.skills.radixSkills.length).toBe(2);
      expect(loaded?.projects[0].title).toBe("Campus Placement Intelligence Hub");
      expect(loaded?.experience[0].company).toBe("Tech Solutions");
      expect(loaded?.certifications[0].name).toBe("AWS Certified Developer");
      expect(loaded?.hackathons?.[0].name).toBe("Smart India Hackathon");
      expect(loaded?.hackathons?.[0].awardOrPosition).toBe("Winner");
      expect(loaded?.resumeFileName).toBe("Aman_Verma_Resume.pdf");

      // Verify deletion cleans up local storage
      const delRes = await deleteCandidateProfileFromDatabase("test-user-456");
      expect(delRes.success).toBe(true);
      const afterDelete = await loadCandidateProfileFromDatabase("test-user-456");
      expect(afterDelete).toBeNull();
    });
  });

  describe("generateHeuristicProfileFromText", () => {
    it("extracts skills, hackathons, and certifications from text", async () => {
      const { generateHeuristicProfileFromText } = await import(
        "@/lib/resumeParserService"
      );

      const sampleResume = `
        Aman Sharma
        Email: j25cse108@jssuninoida.edu.in
        Phone: +91 9876543210
        Education: B.Tech Computer Science & Engineering 8.8 CGPA JSS University
        Skills: Python, TypeScript, React, PostgreSQL, Docker, AWS, Git
        Certifications:
        - AWS Certified Solutions Architect by Amazon Web Services
        - Coursera Machine Learning Specialization
        Hackathons:
        - Smart India Hackathon (SIH) 2024 Winner 1st Place
        - HackCBS 6.0 Finalist
      `;

      const profile = generateHeuristicProfileFromText(
        sampleResume,
        {
          userId: "user-789",
          userEmail: "j25cse108@jssuninoida.edu.in",
          studentName: "Aman Sharma",
          branchName: "Computer Science",
        },
        "Aman_Resume.pdf"
      );

      expect(profile.userId).toBe("user-789");
      expect(profile.skills.rawTechnicalSkills).toContain("Python");
      expect(profile.skills.rawTechnicalSkills).toContain("React");
      expect(profile.certifications.length).toBeGreaterThan(0);
      expect(profile.hackathons && profile.hackathons.length > 0).toBe(true);
    });
  });
});
