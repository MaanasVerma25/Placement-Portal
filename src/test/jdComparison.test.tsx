import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import React from "react";
import { MemoryRouter } from "react-router-dom";
import { StudentUserMenu } from "@/components/auth/StudentUserMenu";
import { JdComparisonPage } from "@/pages/JdComparisonPage";
import {
  compareJdHeuristically,
  saveComparisonResultToStorage,
  loadComparisonResultFromStorage,
  clearComparisonResultFromStorage,
} from "@/lib/jdComparisonService";
import { CandidateProfile } from "@/types/candidateProfile";
import { RADIX_SKILL_CATEGORIES } from "@/lib/resumeParserService";

// Mock AuthContext
const mockUseAuth = vi.fn();
vi.mock("@/context/AuthContext", () => ({
  useAuth: () => mockUseAuth(),
}));

describe("JD Comparison & Profile Menu Integration", () => {
  const mockProfile: CandidateProfile = {
    userId: "test-user-id",
    fullName: "Aayush Verma",
    email: "aayush.verma@jssaten.ac.in",
    headline: "Full Stack Engineer | React, Python, PostgreSQL",
    preferredRole: "Software Engineer",
    summary: "Passionate developer with hands-on full stack project experience.",
    education: [
      {
        id: "edu_1",
        institution: "JSS Academy of Technical Education",
        degree: "B.Tech",
        fieldOfStudy: "Computer Science & Engineering",
        gradeOrCgpa: "8.4 CGPA",
      },
    ],
    skills: {
      radixSkills: RADIX_SKILL_CATEGORIES.map((cat) => ({
        skillSetId: cat.id,
        shortName: cat.shortName,
        skillSetName: cat.name,
        matchedTechnologies:
          cat.shortName === "COD"
            ? ["Python", "JavaScript"]
            : cat.shortName === "SQL"
            ? ["PostgreSQL"]
            : cat.shortName === "SWE"
            ? ["Git", "React"]
            : [],
        levelAssessment: cat.shortName === "COD" ? 8 : cat.shortName === "SQL" ? 7 : 5,
      })),
      rawTechnicalSkills: ["Python", "JavaScript", "React", "PostgreSQL", "Git"],
      toolsAndFrameworks: ["VS Code", "Git", "Postman"],
      softSkills: ["Teamwork", "Problem Solving"],
    },
    projects: [
      {
        id: "proj_1",
        title: "E-Commerce Microservices",
        description: "Built scalable backend services using Python, FastAPI, and PostgreSQL.",
        technologies: ["Python", "FastAPI", "PostgreSQL"],
      },
    ],
    experience: [],
    certifications: [],
    hackathons: [],
    updatedAt: new Date().toISOString(),
  };

  beforeEach(() => {
    clearComparisonResultFromStorage();
    vi.clearAllMocks();
    // Default fetch to fail fast so heuristic fallback runs immediately in tests
    vi.stubGlobal(
      "fetch",
      vi.fn().mockRejectedValue(new Error("Network mocked in unit test"))
    );
  });

  describe("StudentUserMenu Component", () => {
    it("renders 'enter a JD' option directly above 'Full Profile & RADIX Skills Page'", () => {
      mockUseAuth.mockReturnValue({
        user: { id: "test-user-id", email: "aayush.verma@jssaten.ac.in" },
        student: {
          username: "Aayush Verma",
          branchCode: "CS",
          rollNumber: "210091010001",
        },
        resume: { fileName: "Resume.pdf", fileSize: 1024 * 50 },
        candidateProfile: mockProfile,
        isLoading: false,
        isResumeLoading: false,
        signOut: vi.fn(),
      });

      render(
        <MemoryRouter>
          <StudentUserMenu />
        </MemoryRouter>
      );

      // Open profile dropdown
      const menuButton = screen.getByRole("button", {
        name: /AAYUSH VERMA/i,
      });
      fireEvent.click(menuButton);

      // Verify "enter a JD" option exists
      const enterJdLink = screen.getByRole("link", { name: /enter a JD/i });
      expect(enterJdLink).toBeInTheDocument();
      expect(enterJdLink).toHaveAttribute("href", "/jd-compare");

      // Verify "Full Profile & RADIX Skills Page" exists
      const fullProfileLink = screen.getByRole("link", {
        name: /Full Profile & RADIX Skills Page/i,
      });
      expect(fullProfileLink).toBeInTheDocument();
      expect(fullProfileLink).toHaveAttribute("href", "/profile");

      // Verify DOM ordering: "enter a JD" must precede "Full Profile & RADIX Skills Page"
      const links = screen.getAllByRole("link");
      const enterJdIndex = links.indexOf(enterJdLink);
      const fullProfileIndex = links.indexOf(fullProfileLink);

      expect(enterJdIndex).toBeGreaterThanOrEqual(0);
      expect(fullProfileIndex).toBeGreaterThan(enterJdIndex);
    });
  });

  describe("JD Comparison Service & Heuristics", () => {
    const sampleJdText = `Role: Backend Engineer
Company: CloudTech
Requirements:
- Strong proficiency in Python and PostgreSQL.
- Experience with Docker and Kubernetes for container deployment.
- Good knowledge of Data Structures and Algorithms.
- Degree: B.Tech in Computer Science or IT.`;

    it("compares JD text against candidate profile side by side", () => {
      const result = compareJdHeuristically(
        sampleJdText,
        mockProfile,
        { username: "Aayush", branchName: "Computer Science" },
        "test_jd.pdf",
        "pdf"
      );

      expect(result.jobTitle).toBe("Backend Engineer");
      expect(result.companyName).toBe("CloudTech");
      expect(result.overallMatchScore).toBeGreaterThan(0);
      expect(result.overallMatchScore).toBeLessThanOrEqual(100);

      // Verify 12 RADIX categories are all present
      expect(result.radixComparison.length).toBe(12);
      const shortNames = result.radixComparison.map((r) => r.shortName);
      expect(shortNames).toContain("COD");
      expect(shortNames).toContain("DSA");
      expect(shortNames).toContain("SQL");
      expect(shortNames).toContain("CLOUD");

      // Verify requirement matching
      const pythonMatch = result.requirementsComparison.find((r) =>
        r.requirement.toLowerCase().includes("python")
      );
      expect(pythonMatch).toBeDefined();
      expect(pythonMatch?.matchStatus).toBe("match");

      const dockerMatch = result.requirementsComparison.find((r) =>
        r.requirement.toLowerCase().includes("docker")
      );
      expect(dockerMatch).toBeDefined();
      expect(dockerMatch?.matchStatus).toBe("gap");

      // Verify tailored questions and project alignment
      expect(result.interviewPrep.suggestedQuestions.length).toBeGreaterThan(0);
      expect(result.relevantProjects.length).toBeGreaterThan(0);
    });

    it("persists and retrieves comparison results in localStorage", () => {
      const result = compareJdHeuristically(
        sampleJdText,
        mockProfile,
        {},
        "sample.pdf",
        "pdf"
      );

      saveComparisonResultToStorage(result);
      const loaded = loadComparisonResultFromStorage();

      expect(loaded).not.toBeNull();
      expect(loaded?.jobTitle).toBe(result.jobTitle);
      expect(loaded?.overallMatchScore).toBe(result.overallMatchScore);
      expect(loaded?.radixComparison.length).toBe(12);

      clearComparisonResultFromStorage();
      expect(loadComparisonResultFromStorage()).toBeNull();
    });
  });

  describe("JdComparisonPage Component", () => {
    it("renders JD input options including upload, paste text, and samples", () => {
      mockUseAuth.mockReturnValue({
        user: { id: "test-user-id", email: "aayush.verma@jssaten.ac.in" },
        student: { username: "Aayush Verma", branchCode: "CS" },
        candidateProfile: mockProfile,
      });

      render(
        <MemoryRouter>
          <JdComparisonPage />
        </MemoryRouter>
      );

      expect(
        screen.getByText("Job Description (JD) Intelligence & Side-by-Side Match")
      ).toBeInTheDocument();
      expect(
        screen.getByText(/Upload Job Description File/i)
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /Paste JD Text/i })
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /⚡ Sample Backend Engineer JD/i })
      ).toBeInTheDocument();
    });

    it("loads sample JD and displays side-by-side comparison tabs", async () => {
      mockUseAuth.mockReturnValue({
        user: { id: "test-user-id", email: "aayush.verma@jssaten.ac.in" },
        student: { username: "Aayush Verma", branchCode: "CS" },
        candidateProfile: mockProfile,
      });

      render(
        <MemoryRouter>
          <JdComparisonPage />
        </MemoryRouter>
      );

      const sampleBackendBtn = screen.getByRole("button", {
        name: /⚡ Sample Backend Engineer JD/i,
      });
      fireEvent.click(sampleBackendBtn);

      await waitFor(() => {
        expect(
          screen.getByText(/Side-by-Side Requirements/i)
        ).toBeInTheDocument();
      });

      expect(
        screen.getByText(/12 RADIX Skill Ladder/i)
      ).toBeInTheDocument();
      expect(
        screen.getAllByText(/Your Profile Evidence:/i).length
      ).toBeGreaterThan(0);
    });
  });
});
