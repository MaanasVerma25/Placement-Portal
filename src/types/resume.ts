export interface StudentResume {
  id: string;
  userId: string;
  userEmail: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  fileData?: string; // Base64 data URI
  storagePath?: string | null;
  uploadedAt: string;
  updatedAt: string;
}

export type AllowedResumeExtension = "pdf" | "docx";
