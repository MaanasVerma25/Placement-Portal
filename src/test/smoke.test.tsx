import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import React from "react";
import App from "@/App";
import { SEED_COMPANIES } from "@/data/seedCompanies";
import { buildIntelligenceSections } from "@/data/intelligenceData";
import { getSkillTopics } from "@/data/skillTopics";

describe("JSS Placement Intelligence Hub Smoke Tests", () => {
  it("loads the seed company data with Accenture", () => {
    expect(SEED_COMPANIES.length).toBeGreaterThan(0);
    expect(SEED_COMPANIES[0].short_json.name).toBe("Accenture plc");
    expect(SEED_COMPANIES[0].short_json.company_type).toBe("Dream");
  });

  it("builds all 22 intelligence sections", () => {
    const sections = buildIntelligenceSections();
    expect(sections.length).toBe(22);
    expect(sections[0].title).toBe("Company Identity");
    expect(sections[21].title).toBe("Contact Information");
  });

  it("verifies 10-level ladders for all 12 skills", () => {
    for (let id = 1; id <= 12; id++) {
      const topics = getSkillTopics(id);
      expect(topics.length).toBe(10);
      expect(topics[0].level_number).toBe(1);
      expect(topics[9].level_number).toBe(10);
    }
  });

  it("renders the portal homepage with college heading and without auth UI", () => {
    render(<App />);
    expect(
      screen.getByText("JSS UNIVERSITY Companies Research & Placement Analytics Portal")
    ).toBeInTheDocument();
    expect(
      screen.getByText("Your strategic edge for campus placements")
    ).toBeInTheDocument();
    expect(screen.queryByText(/logout/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/sign in/i)).not.toBeInTheDocument();
  });
});
