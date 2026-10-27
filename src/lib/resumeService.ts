import { supabase } from "./supabaseClient";
import { StudentResume } from "@/types/resume";

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB
const ALLOWED_MIME_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/msword",
];

const LOCAL_STORAGE_KEY_PREFIX = "jss_student_resume_";

/**
 * Validates a resume file for supported format (PDF or DOCX) and size limit.
 */
export function validateResumeFile(file: File): { valid: boolean; error?: string } {
  if (!file) {
    return { valid: false, error: "No file selected." };
  }

  const fileName = file.name.toLowerCase();
  const isPdf = fileName.endsWith(".pdf");
  const isDocx = fileName.endsWith(".docx");

  if (!isPdf && !isDocx) {
    return {
      valid: false,
      error: "Unsupported file format. Please upload your resume in PDF (.pdf) or Word (.docx) format only.",
    };
  }

  if (file.type && !ALLOWED_MIME_TYPES.includes(file.type) && !isPdf && !isDocx) {
    return {
      valid: false,
      error: "Invalid file type detected. Only PDF and DOCX documents are permitted.",
    };
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    return {
      valid: false,
      error: `File is too large (${formatFileSize(file.size)}). Maximum allowed size is 5 MB.`,
    };
  }

  return { valid: true };
}

/**
 * Converts a browser File object to a Base64 data URL string.
 */
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
      } else {
        reject(new Error("Failed to encode file to base64."));
      }
    };
    reader.onerror = (err) => reject(err);
  });
}

/**
 * Formats byte count to clean human-readable string (e.g. 240 KB, 1.2 MB).
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

/**
 * Saves a student's resume to the database:
 * 1. Upserts to Supabase 'student_resumes' table (if created/accessible).
 * 2. Saves to Supabase Auth user_metadata (auth.users in Postgres database).
 * 3. Caches to localStorage for fast and offline rendering.
 */
export async function saveResumeToDatabase(
  userId: string,
  userEmail: string,
  file: File
): Promise<{ success: boolean; resume?: StudentResume; error?: string }> {
  try {
    const validation = validateResumeFile(file);
    if (!validation.valid) {
      return { success: false, error: validation.error };
    }

    const base64Data = await fileToBase64(file);
    const now = new Date().toISOString();
    const resumeId = `resume_${userId.replace(/[^a-zA-Z0-9]/g, "")}_${Date.now()}`;

    const resumeRecord: StudentResume = {
      id: resumeId,
      userId,
      userEmail,
      fileName: file.name,
      fileType:
        file.type ||
        (file.name.toLowerCase().endsWith(".pdf")
          ? "application/pdf"
          : "application/vnd.openxmlformats-officedocument.wordprocessingml.document"),
      fileSize: file.size,
      fileData: base64Data,
      storagePath: null,
      uploadedAt: now,
      updatedAt: now,
    };

    // 1. Attempt to upsert into dedicated public.student_resumes table
    try {
      const { error: dbError } = await supabase
        .from("student_resumes")
        .upsert(
          {
            user_id: userId,
            user_email: userEmail,
            file_name: resumeRecord.fileName,
            file_type: resumeRecord.fileType,
            file_size: resumeRecord.fileSize,
            file_data: resumeRecord.fileData,
            uploaded_at: resumeRecord.uploadedAt,
            updated_at: resumeRecord.updatedAt,
          },
          { onConflict: "user_id" }
        );

      if (dbError) {
        // Table might not exist yet; will fall back to auth metadata
        console.info("Info: student_resumes table notice:", dbError.message);
      }
    } catch (dbErr) {
      console.info("Info: Database table upsert fallback:", dbErr);
    }

    // 2. Save directly to Supabase Auth database (auth.users raw_user_meta_data)
    try {
      const { error: authError } = await supabase.auth.updateUser({
        data: {
          student_resume: {
            id: resumeRecord.id,
            fileName: resumeRecord.fileName,
            fileType: resumeRecord.fileType,
            fileSize: resumeRecord.fileSize,
            uploadedAt: resumeRecord.uploadedAt,
            updatedAt: resumeRecord.updatedAt,
            fileData: resumeRecord.fileData,
          },
        },
      });

      if (authError) {
        console.warn("Notice updating Supabase user metadata:", authError.message);
      }
    } catch (authErr) {
      console.warn("Notice: Auth metadata update caught error:", authErr);
    }

    // 3. Save to localStorage cache
    try {
      localStorage.setItem(
        `${LOCAL_STORAGE_KEY_PREFIX}${userId}`,
        JSON.stringify(resumeRecord)
      );
    } catch (storageErr) {
      console.warn("Notice: LocalStorage caching error:", storageErr);
    }

    return { success: true, resume: resumeRecord };
  } catch (err: any) {
    return {
      success: false,
      error: err?.message || "Failed to process and save resume. Please try again.",
    };
  }
}

/**
 * Loads student resume from Supabase database table, Supabase Auth metadata, or local cache.
 */
export async function loadResumeFromDatabase(
  userId: string,
  userMetadata?: any
): Promise<StudentResume | null> {
  if (!userId) return null;

  // 1. Try public.student_resumes table first
  try {
    const { data, error } = await supabase
      .from("student_resumes")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    if (data && !error) {
      const resume: StudentResume = {
        id: data.id || `res_${userId}`,
        userId: data.user_id,
        userEmail: data.user_email || "",
        fileName: data.file_name,
        fileType: data.file_type,
        fileSize: Number(data.file_size) || 0,
        fileData: data.file_data,
        storagePath: data.storage_path,
        uploadedAt: data.uploaded_at || new Date().toISOString(),
        updatedAt: data.updated_at || new Date().toISOString(),
      };
      // Synchronize cache
      try {
        localStorage.setItem(
          `${LOCAL_STORAGE_KEY_PREFIX}${userId}`,
          JSON.stringify(resume)
        );
      } catch {}
      return resume;
    }
  } catch {}

  // 2. Try Supabase Auth user metadata
  if (userMetadata?.student_resume) {
    const meta = userMetadata.student_resume;
    if (meta.fileName) {
      const resume: StudentResume = {
        id: meta.id || `meta_${userId}`,
        userId,
        userEmail: userMetadata.email || "",
        fileName: meta.fileName,
        fileType: meta.fileType || "application/pdf",
        fileSize: Number(meta.fileSize) || 0,
        fileData: meta.fileData,
        uploadedAt: meta.uploadedAt || new Date().toISOString(),
        updatedAt: meta.updatedAt || new Date().toISOString(),
      };
      // Synchronize cache
      try {
        localStorage.setItem(
          `${LOCAL_STORAGE_KEY_PREFIX}${userId}`,
          JSON.stringify(resume)
        );
      } catch {}
      return resume;
    }
  }

  // 3. Fallback to LocalStorage cache
  try {
    const cached = localStorage.getItem(`${LOCAL_STORAGE_KEY_PREFIX}${userId}`);
    if (cached) {
      return JSON.parse(cached) as StudentResume;
    }
  } catch {}

  return null;
}

/**
 * Deletes student resume from Supabase database table, user metadata, and local cache.
 */
export async function deleteResumeFromDatabase(
  userId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // 1. Delete from database table
    try {
      await supabase.from("student_resumes").delete().eq("user_id", userId);
    } catch {}

    // 2. Remove from user metadata
    try {
      await supabase.auth.updateUser({
        data: {
          student_resume: null,
        },
      });
    } catch {}

    // 3. Remove from cache
    try {
      localStorage.removeItem(`${LOCAL_STORAGE_KEY_PREFIX}${userId}`);
    } catch {}

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || "Failed to remove resume." };
  }
}

/**
 * Triggers a direct download of the resume file.
 */
export function downloadResumeFile(resume: StudentResume): void {
  if (!resume.fileData) return;

  const link = document.createElement("a");
  link.href = resume.fileData;
  link.download = resume.fileName || "Student_Resume.pdf";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Opens a resume for preview in a new browser tab.
 */
export function previewResumeInNewTab(resume: StudentResume): void {
  if (!resume.fileData) return;

  // Convert base64 data URL to blob for reliable display in new tab
  try {
    const parts = resume.fileData.split(";base64,");
    if (parts.length === 2) {
      const contentType = parts[0].split(":")[1] || resume.fileType;
      const raw = window.atob(parts[1]);
      const rawLength = raw.length;
      const uInt8Array = new Uint8Array(rawLength);
      for (let i = 0; i < rawLength; ++i) {
        uInt8Array[i] = raw.charCodeAt(i);
      }
      const blob = new Blob([uInt8Array], { type: contentType });
      const blobUrl = URL.createObjectURL(blob);
      window.open(blobUrl, "_blank", "noopener,noreferrer");
      return;
    }
  } catch (e) {
    console.warn("Blob preview fallback:", e);
  }

  // Fallback to direct window open or download
  const win = window.open();
  if (win) {
    win.document.write(
      `<iframe src="${resume.fileData}" frameborder="0" style="border:0; top:0px; left:0px; bottom:0px; right:0px; width:100%; height:100%;" allowfullscreen></iframe>`
    );
  } else {
    downloadResumeFile(resume);
  }
}
