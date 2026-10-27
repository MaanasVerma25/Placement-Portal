import { describe, it, expect } from "vitest";
import {
  isCollegeEmail,
  parseStudentEmail,
  getEmailValidationError,
  COLLEGE_DOMAIN,
} from "@/lib/authUtils";

describe("Student Authentication & Email Validation", () => {
  describe("isCollegeEmail", () => {
    it("accepts valid student email format j25cse108@jssuninoida.edu.in", () => {
      expect(isCollegeEmail("j25cse108@jssuninoida.edu.in")).toBe(true);
    });

    it("accepts college emails case-insensitively", () => {
      expect(isCollegeEmail("J25CSE108@JSSUNINOIDA.EDU.IN")).toBe(true);
      expect(isCollegeEmail("J25Cse108@jssuninoida.edu.in")).toBe(true);
    });

    it("rejects non-college domains like gmail, yahoo, outlook", () => {
      expect(isCollegeEmail("j25cse108@gmail.com")).toBe(false);
      expect(isCollegeEmail("student@yahoo.co.in")).toBe(false);
      expect(isCollegeEmail("student@outlook.com")).toBe(false);
      expect(isCollegeEmail("fake@jssuninoida.com")).toBe(false);
      expect(isCollegeEmail("fake@jss.edu.in")).toBe(false);
    });

    it("rejects empty or malformed inputs", () => {
      expect(isCollegeEmail("")).toBe(false);
      expect(isCollegeEmail("j25cse108")).toBe(false);
      expect(isCollegeEmail("j25cse108@")).toBe(false);
      expect(isCollegeEmail("@jssuninoida.edu.in")).toBe(false);
    });
  });

  describe("parseStudentEmail", () => {
    it("correctly parses j25cse108@jssuninoida.edu.in", () => {
      const result = parseStudentEmail("j25cse108@jssuninoida.edu.in");
      expect(result.isCollegeEmail).toBe(true);
      expect(result.isValidStudentFormat).toBe(true);
      expect(result.admissionYear).toBe(2025);
      expect(result.branchCode).toBe("CSE");
      expect(result.branchName).toBe("Computer Science & Engineering");
      expect(result.rollNumber).toBe("108");
      expect(result.batchYears).toBe("2025 - 2029");
    });

    it("parses other branches like AIML, IT, ECE", () => {
      const aiml = parseStudentEmail("j24aiml045@jssuninoida.edu.in");
      expect(aiml.branchCode).toBe("AIML");
      expect(aiml.branchName).toBe("Artificial Intelligence & Machine Learning");
      expect(aiml.admissionYear).toBe(2024);
      expect(aiml.rollNumber).toBe("045");
      expect(aiml.batchYears).toBe("2024 - 2028");

      const it = parseStudentEmail("j23it012@jssuninoida.edu.in");
      expect(it.branchCode).toBe("IT");
      expect(it.branchName).toBe("Information Technology");
      expect(it.admissionYear).toBe(2023);
      expect(it.rollNumber).toBe("012");
    });

    it("parses 2-year programs like MCA with 2-year graduation batch", () => {
      const mca = parseStudentEmail("j25mca005@jssuninoida.edu.in");
      expect(mca.branchCode).toBe("MCA");
      expect(mca.batchYears).toBe("2025 - 2027");
    });

    it("marks invalid student format if email has college domain but non-standard username", () => {
      const faculty = parseStudentEmail("placement.officer@jssuninoida.edu.in");
      expect(faculty.isCollegeEmail).toBe(true);
      expect(faculty.isValidStudentFormat).toBe(false);
    });

    it("returns isCollegeEmail=false for non-college emails", () => {
      const nonCollege = parseStudentEmail("j25cse108@gmail.com");
      expect(nonCollege.isCollegeEmail).toBe(false);
      expect(nonCollege.isValidStudentFormat).toBe(false);
    });
  });

  describe("getEmailValidationError", () => {
    it("returns null for valid college email", () => {
      expect(getEmailValidationError("j25cse108@jssuninoida.edu.in")).toBeNull();
    });

    it("returns explanatory error for non-college domain", () => {
      const err = getEmailValidationError("student@gmail.com");
      expect(err).toContain(`@${COLLEGE_DOMAIN}`);
      expect(err).toContain("j25cse108");
    });

    it("returns error for empty or invalid format", () => {
      expect(getEmailValidationError("")).toBe("College email address is required.");
      expect(getEmailValidationError("justastring")).toBe("Please enter a valid email address.");
    });
  });
});
