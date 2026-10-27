import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  validateResumeFile,
  formatFileSize,
  saveResumeToDatabase,
  loadResumeFromDatabase,
  deleteResumeFromDatabase,
} from "@/lib/resumeService";

describe("Resume Service & Database Persistence", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  describe("validateResumeFile", () => {
    it("accepts valid PDF files", () => {
      const file = new File(["dummy pdf content"], "Maanas_Resume.pdf", {
        type: "application/pdf",
      });
      const result = validateResumeFile(file);
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it("accepts valid DOCX files", () => {
      const file = new File(
        ["dummy docx content"],
        "Student_CV_2026.docx",
        {
          type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        }
      );
      const result = validateResumeFile(file);
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it("accepts uppercase file extensions (.PDF, .DOCX)", () => {
      const filePdf = new File(["content"], "RESUME.PDF", { type: "application/pdf" });
      expect(validateResumeFile(filePdf).valid).toBe(true);

      const fileDocx = new File(["content"], "RESUME.DOCX", {
        type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      });
      expect(validateResumeFile(fileDocx).valid).toBe(true);
    });

    it("rejects unsupported file formats (.txt, .png, .exe, .jpg)", () => {
      const txtFile = new File(["test"], "notes.txt", { type: "text/plain" });
      const txtResult = validateResumeFile(txtFile);
      expect(txtResult.valid).toBe(false);
      expect(txtResult.error).toContain("Unsupported file format");

      const pngFile = new File(["test"], "photo.png", { type: "image/png" });
      const pngResult = validateResumeFile(pngFile);
      expect(pngResult.valid).toBe(false);

      const exeFile = new File(["test"], "malware.exe", { type: "application/x-msdownload" });
      expect(validateResumeFile(exeFile).valid).toBe(false);
    });

    it("rejects files exceeding 5 MB limit", () => {
      const oversizedBlob = new Uint8Array(6 * 1024 * 1024); // 6MB
      const largeFile = new File([oversizedBlob], "large_resume.pdf", {
        type: "application/pdf",
      });
      const result = validateResumeFile(largeFile);
      expect(result.valid).toBe(false);
      expect(result.error).toContain("Maximum allowed size is 5 MB");
    });
  });

  describe("formatFileSize", () => {
    it("formats bytes accurately", () => {
      expect(formatFileSize(0)).toBe("0 Bytes");
      expect(formatFileSize(500)).toBe("500 Bytes");
      expect(formatFileSize(1024)).toBe("1 KB");
      expect(formatFileSize(204800)).toBe("200 KB");
      expect(formatFileSize(1048576)).toBe("1 MB");
      expect(formatFileSize(2621440)).toBe("2.5 MB");
    });
  });

  describe("saveResumeToDatabase & loadResumeFromDatabase", () => {
    it("saves resume to database/local cache and retrieves it successfully", async () => {
      const userId = "test-student-user-123";
      const userEmail = "j25cse108@jssuninoida.edu.in";
      const file = new File(["%PDF-1.4 test resume content"], "placement_resume.pdf", {
        type: "application/pdf",
      });

      const saveResult = await saveResumeToDatabase(userId, userEmail, file);
      expect(saveResult.success).toBe(true);
      expect(saveResult.resume).toBeDefined();
      expect(saveResult.resume?.fileName).toBe("placement_resume.pdf");
      expect(saveResult.resume?.userEmail).toBe(userEmail);
      expect(saveResult.resume?.fileType).toBe("application/pdf");

      const loaded = await loadResumeFromDatabase(userId);
      expect(loaded).toBeDefined();
      expect(loaded?.fileName).toBe("placement_resume.pdf");
      expect(loaded?.userId).toBe(userId);
    });

    it("deletes resume from database and cache", async () => {
      const userId = "test-student-delete-123";
      const userEmail = "j25cse108@jssuninoida.edu.in";
      const file = new File(["dummy"], "cv.docx", {
        type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      });

      await saveResumeToDatabase(userId, userEmail, file);
      expect(await loadResumeFromDatabase(userId)).not.toBeNull();

      const deleteResult = await deleteResumeFromDatabase(userId);
      expect(deleteResult.success).toBe(true);
      expect(await loadResumeFromDatabase(userId)).toBeNull();
    });
  });
});
