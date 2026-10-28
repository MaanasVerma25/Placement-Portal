import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import React from "react";
import { MemoryRouter } from "react-router-dom";
import { CompanyRadixComparator } from "@/components/profile/CompanyRadixComparator";
import {
  compareProfileAgainstCompanyBar,
  saveCompanyComparisonToStorage,
  loadCompanyComparisonFromStorage,
  clearCompanyComparisonFromStorage,
} from "@/lib/companyRadixComparisonService";
import { CandidateProfile } from "@/types/candidateProfile";
import { RADIX_SKILL_CATEGORIES } from "@/lib/resumeParserService";
import { SEED_COMPANIES } from "@/data/seedCompanies";
import { normalizeDashboardSkills } from "@/lib/companyData";
import { getSkillTopics } from "@/data/skillTopics";

// Mock AuthContext
const mockUseAuth = vi.fn();
vi.mock("@/context/AuthContext", () => ({
  useAuth: () => mockUseAuth(),
}));

describe("12 RADIX Company Bar Comparator & Readiness Service", () => {
  const mockProfile: CandidateProfile = {
    userId: "test-user-id",
    fullName: "Aayush Verma",
    email: "aayush.verma@jssaten.ac.in",
    headline: "Full Stack Software Engineer",
    preferredRole: "Backend Engineer",
    education: [
      {
        id: "edu_1",
        institution: "JSS Academy of Technical Education Noida",
        degree: "B.Tech",
        fieldOfStudy: "Computer Science",
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
            : [],
        levelAssessment:
          cat.shortName === "COD" || cat.shortName === "DSA"
            ? 8
            : cat.shortName === "SQL"
            ? 7
            : cat.shortName === "CLOUD"
            ? 4
            : 6,
      })),
      rawTechnicalSkills: ["Python", "SQL", "Git"],
      toolsAndFrameworks: ["VS Code", "Git"],
      softSkills: ["Teamwork"],
    },
    projects: [],
    experience: [],
    certifications: [],
    hackathons: [],
    updatedAt: new Date().toISOString(),
  };

  const accenture = SEED_COMPANIES[0];
  const accentureSkills = normalizeDashboardSkills(accenture.skill_levels).map(
    (s) => ({
      ...s,
      topics: getSkillTopics(s.skill_set_id),
    })
  );

  beforeEach(() => {
    clearCompanyComparisonFromStorage();
    vi.clearAllMocks();
  });

  describe("compareProfileAgainstCompanyBar Service Logic", () => {
    it("evaluates all 12 RADIX skillsets against the company required bar", () => {
      const result = compareProfileAgainstCompanyBar({
        company: {
          company_id: accenture.company_id,
          name: accenture.short_json.name,
          short_name: accenture.short_json.short_name,
        },
        companySkills: accentureSkills,
        candidateProfile: mockProfile,
      });

      expect(result.companyName).toBe(accenture.short_json.name);
      expect(result.totalSkillsEvaluated).toBe(12);
      expect(result.readinessScore).toBeGreaterThanOrEqual(0);
      expect(result.readinessScore).toBeLessThanOrEqual(100);
      expect(result.skillGaps.length).toBe(12);

      // Verify skills meeting bar count + gap count equals 12
      expect(
        result.skillsMeetingBarCount + result.skillsWithGapCount
      ).toBe(12);

      // Verify DSA comparison (Candidate has level 8, Accenture requires 8)
      const dsaItem = result.skillGaps.find((s) => s.shortName === "DSA");
      expect(dsaItem).toBeDefined();
      expect(dsaItem?.companyRequiredLevel).toBe(8);
      expect(dsaItem?.candidateLevel).toBe(8);
      expect(dsaItem?.gap).toBe(0);
      expect(dsaItem?.status).toBe("meets");

      // Verify Cloud comparison (Candidate has level 4, Accenture requires 6)
      const cloudItem = result.skillGaps.find((s) => s.shortName === "CLOUD");
      expect(cloudItem).toBeDefined();
      expect(cloudItem?.companyRequiredLevel).toBe(6);
      expect(cloudItem?.candidateLevel).toBe(4);
      expect(cloudItem?.gap).toBe(-2);
      expect(cloudItem?.topicsToBridge.length).toBe(2);
      expect(cloudItem?.topicsToBridge[0].levelNumber).toBe(5);
      expect(cloudItem?.topicsToBridge[1].levelNumber).toBe(6);

      // Verify priority action plan is generated
      expect(result.priorityActionPlan.length).toBeGreaterThan(0);
      expect(result.verdictSummary.length).toBeGreaterThan(20);
    });

    it("saves and reloads company comparison results in localStorage", () => {
      const result = compareProfileAgainstCompanyBar({
        company: {
          company_id: accenture.company_id,
          name: accenture.short_json.name,
        },
        companySkills: accentureSkills,
        candidateProfile: mockProfile,
      });

      saveCompanyComparisonToStorage(result);
      const loaded = loadCompanyComparisonFromStorage();

      expect(loaded).not.toBeNull();
      expect(loaded?.companyName).toBe(result.companyName);
      expect(loaded?.readinessScore).toBe(result.readinessScore);
      expect(loaded?.skillGaps.length).toBe(12);

      clearCompanyComparisonFromStorage();
      expect(loadCompanyComparisonFromStorage()).toBeNull();
    });
  });

  describe("CompanyRadixComparator UI Component", () => {
    it("renders with saved profile info, company selector, and the One Button", () => {
      mockUseAuth.mockReturnValue({
        user: { id: "test-user-id", email: "aayush.verma@jssaten.ac.in" },
        student: { username: "Aayush Verma" },
        candidateProfile: mockProfile,
      });

      render(
        <MemoryRouter>
          <CompanyRadixComparator
            initialCompanyId={accenture.company_id}
            initialCompanySkills={accentureSkills}
            initialCompanyMeta={accenture.short_json as any}
          />
        </MemoryRouter>
      );

      // Verify input 1: Saved Profile
      expect(screen.getByText("Aayush Verma")).toBeInTheDocument();

      // Verify input 2: Company Selector & initial company
      expect(screen.getByRole("combobox")).toBeInTheDocument();

      // Verify the One Button exists
      const oneButton = screen.getByRole("button", {
        name: /Compare Profile Against Accenture Bar/i,
      });
      expect(oneButton).toBeInTheDocument();
    });

    it("clicking the One Button performs comparison and shows readiness score & 12-skill gap breakdown", async () => {
      mockUseAuth.mockReturnValue({
        user: { id: "test-user-id", email: "aayush.verma@jssaten.ac.in" },
        student: { username: "Aayush Verma" },
        candidateProfile: mockProfile,
      });

      render(
        <MemoryRouter>
          <CompanyRadixComparator
            initialCompanyId={accenture.company_id}
            initialCompanySkills={accentureSkills}
            initialCompanyMeta={accenture.short_json as any}
          />
        </MemoryRouter>
      );

      const oneButton = screen.getByRole("button", {
        name: /Compare Profile Against Accenture Bar/i,
      });
      fireEvent.click(oneButton);

      // Verify output: Readiness Score Card
      await waitFor(() => {
        expect(
          screen.getByText("Placement Qualification Readiness")
        ).toBeInTheDocument();
      });

      expect(screen.getByText("Readiness Score")).toBeInTheDocument();
      expect(
        screen.getByText("12 RADIX Skillset Gap Breakdown")
      ).toBeInTheDocument();

      // Verify filter pills
      expect(
        screen.getByRole("button", { name: /All 12/i })
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /Deficits Only/i })
      ).toBeInTheDocument();

      // Verify skills are listed
      expect(
        screen.getByText("Data Structures & Algorithms")
      ).toBeInTheDocument();
      expect(
        screen.getByText("Cloud Fundamentals (AWS/Azure)")
      ).toBeInTheDocument();
    });
  });
});
