import React, { useState, useRef, useEffect } from "react";
import {
  X,
  UploadCloud,
  FileText,
  Download,
  Trash2,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  Building,
  GraduationCap,
  Calendar,
  Hash,
  CheckCircle2,
  Database,
  FileCheck,
  Eye,
  EyeOff,
  Sparkles,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import {
  formatFileSize,
  downloadResumeFile,
  previewResumeInNewTab,
  validateResumeFile,
} from "@/lib/resumeService";
import { CandidateProfileView } from "./CandidateProfileView";
import { toast } from "sonner";

interface StudentProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: "resume" | "profile";
}

export const StudentProfileModal: React.FC<StudentProfileModalProps> = ({
  isOpen,
  onClose,
  defaultTab = "resume",
}) => {
  const {
    user,
    student,
    resume,
    candidateProfile,
    isResumeLoading,
    isParsingResume,
    parsingStatus,
    uploadResume,
    deleteResume,
    parseAndAutofillResume,
    updateProfile,
  } = useAuth();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [modalTab, setModalTab] = useState<"resume" | "profile">(defaultTab);
  const [isDragging, setIsDragging] = useState(false);
  const [showLivePreview, setShowLivePreview] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // When parsing starts, switch to profile tab or keep updated
  useEffect(() => {
    if (isParsingResume) {
      setModalTab("profile");
    }
  }, [isParsingResume]);

  if (!isOpen) return null;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const file = files[0];
    await processAndUploadFile(file);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (!files || files.length === 0) return;
    await processAndUploadFile(files[0]);
  };

  const processAndUploadFile = async (file: File) => {
    const validation = validateResumeFile(file);
    if (!validation.valid) {
      toast.error("Invalid Resume File", {
        description: validation.error,
      });
      return;
    }

    const toastId = toast.loading("Saving resume and extracting text with AI...");
    const result = await uploadResume(file);

    if (result.success) {
      toast.success("Resume uploaded & saved to database!", {
        id: toastId,
        description: `${file.name} is saved. Extracting profile features...`,
      });
      setShowLivePreview(false);
      setModalTab("profile");
    } else {
      toast.error("Failed to upload resume", {
        id: toastId,
        description: result.error || "Please try again.",
      });
    }
  };

  const handleManualReextract = async () => {
    if (!resume?.fileData) {
      toast.error("No resume file available to re-analyze.");
      return;
    }

    try {
      // Re-create a File from base64 data
      const arr = resume.fileData.split(",");
      const mime = arr[0].match(/:(.*?);/)?.[1] || resume.fileType;
      const bstr = atob(arr[1]);
      let n = bstr.length;
      const u8arr = new Uint8Array(n);
      while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
      }
      const file = new File([u8arr], resume.fileName, { type: mime });

      const toastId = toast.loading("Re-analyzing resume with AI...");
      const result = await parseAndAutofillResume(file);
      if (result.success) {
        toast.success("Profile features updated!", { id: toastId });
        setModalTab("profile");
      } else {
        toast.error("Extraction failed", { id: toastId, description: result.error });
      }
    } catch (err: any) {
      toast.error("Re-analysis error", { description: err.message });
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    const toastId = toast.loading("Removing resume from database...");
    const result = await deleteResume();
    setIsDeleting(false);
    setConfirmDelete(false);

    if (result.success) {
      toast.success("Resume removed", {
        id: toastId,
        description: "Your resume has been deleted from the database.",
      });
      setShowLivePreview(false);
    } else {
      toast.error("Failed to remove resume", {
        id: toastId,
        description: result.error || "Please try again.",
      });
    }
  };

  const isPdf =
    resume?.fileName?.toLowerCase().endsWith(".pdf") ||
    resume?.fileType === "application/pdf";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
    >
      <div
        className="relative w-full max-w-3xl max-h-[94vh] flex flex-col bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-inner shrink-0">
              {student?.branchCode ? student.branchCode.slice(0, 2) : "JS"}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold font-heading text-white tracking-tight">
                  Student Profile & Placement Dossier
                </h2>
                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                  <ShieldCheck className="w-3 h-3" /> JSS Verified
                </span>
              </div>
              <p className="text-xs text-slate-300 font-mono">
                {user?.email || "Student Placement Account"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs Header */}
        <div className="px-6 py-2.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setModalTab("resume")}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                modalTab === "resume"
                  ? "bg-white text-blue-700 shadow-xs border border-slate-200"
                  : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Resume & Upload</span>
              {resume && (
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
              )}
            </button>

            <button
              type="button"
              onClick={() => setModalTab("profile")}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                modalTab === "profile"
                  ? "bg-white text-blue-700 shadow-xs border border-slate-200"
                  : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span>Autofilled Profile & 12 RADIX Skills</span>
              {candidateProfile && (
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-blue-100 text-blue-700 font-bold">
                  Ready
                </span>
              )}
            </button>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
            <Database className="w-3 h-3" />
            <span>Supabase PostgreSQL</span>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {modalTab === "resume" ? (
            <>
              {/* Student Academic Details Card */}
              <div className="rounded-xl border border-slate-200/80 bg-slate-50/70 p-4">
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200/80">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Academic Credentials
                  </span>
                  <span className="text-xs font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
                    {student?.admissionYear
                      ? `Batch of ${student.admissionYear}`
                      : "Active Student"}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="flex items-center gap-2 text-slate-700">
                    <GraduationCap className="w-4 h-4 text-blue-600 shrink-0" />
                    <span className="text-slate-500">Name:</span>
                    <span className="font-semibold text-slate-900 truncate">
                      {student?.username ? student.username.toUpperCase() : "Student"}
                    </span>
                  </div>

                  {student?.rollNumber && (
                    <div className="flex items-center gap-2 text-slate-700">
                      <Hash className="w-4 h-4 text-blue-600 shrink-0" />
                      <span className="text-slate-500">Roll No:</span>
                      <span className="font-mono font-bold text-slate-900">
                        {student.rollNumber}
                      </span>
                    </div>
                  )}

                  {student?.branchName && (
                    <div className="flex items-center gap-2 text-slate-700 sm:col-span-2">
                      <Building className="w-4 h-4 text-blue-600 shrink-0" />
                      <span className="text-slate-500 shrink-0">Branch:</span>
                      <span className="font-medium text-slate-900 truncate">
                        {student.branchName}
                      </span>
                    </div>
                  )}

                  {student?.batchYears && (
                    <div className="flex items-center gap-2 text-slate-700">
                      <Calendar className="w-4 h-4 text-blue-600 shrink-0" />
                      <span className="text-slate-500">Period:</span>
                      <span className="font-medium text-slate-900">
                        {student.batchYears}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center gap-2 text-slate-700">
                    <Building className="w-4 h-4 text-blue-600 shrink-0" />
                    <span className="text-slate-500">Institution:</span>
                    <span className="font-medium text-slate-900 truncate">
                      JSS Univ. Noida
                    </span>
                  </div>
                </div>
              </div>

              {/* Resume Upload & Database Section */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 font-heading">
                      <FileText className="w-4 h-4 text-blue-600" />
                      Placement Resume
                    </h3>
                    <p className="text-xs text-slate-500">
                      Upload your resume in PDF (.pdf) or Word (.docx) format. Text will be automatically extracted and autofilled into your profile.
                    </p>
                  </div>
                </div>

                {/* Hidden native file input */}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/msword"
                  className="hidden"
                />

                {/* If Resume is Already Uploaded and in Database */}
                {resume ? (
                  <div className="space-y-3">
                    <div className="rounded-xl border border-blue-200 bg-blue-50/40 p-4 transition-all">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-start gap-3">
                          <div
                            className={`w-11 h-11 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 shadow-xs ${
                              isPdf
                                ? "bg-rose-100 text-rose-700 border border-rose-200"
                                : "bg-blue-100 text-blue-700 border border-blue-200"
                            }`}
                          >
                            {isPdf ? "PDF" : "DOCX"}
                          </div>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4 className="text-sm font-bold text-slate-900 break-all leading-tight">
                                {resume.fileName}
                              </h4>
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                Saved to Database
                              </span>
                            </div>
                            <div className="flex items-center gap-3 text-xs text-slate-500">
                              <span>{formatFileSize(resume.fileSize)}</span>
                              <span>•</span>
                              <span>
                                Updated{" "}
                                {new Date(resume.updatedAt).toLocaleDateString(
                                  undefined,
                                  {
                                    month: "short",
                                    day: "numeric",
                                    year: "numeric",
                                  }
                                )}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Quick action buttons */}
                        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap shrink-0">
                          <button
                            type="button"
                            onClick={() => previewResumeInNewTab(resume)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 shadow-2xs transition-colors"
                            title="Open in new tab"
                          >
                            <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
                            <span>View</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => downloadResumeFile(resume)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-blue-700 bg-white hover:bg-blue-50 border border-blue-200 shadow-2xs transition-colors"
                            title="Download to computer"
                          >
                            <Download className="w-3.5 h-3.5 text-blue-600" />
                            <span>Download</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isResumeLoading}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 shadow-2xs transition-colors disabled:opacity-50"
                            title="Replace with new file"
                          >
                            <RefreshCw
                              className={`w-3.5 h-3.5 text-slate-500 ${
                                isResumeLoading ? "animate-spin" : ""
                              }`}
                            />
                            <span>Replace</span>
                          </button>

                          {confirmDelete ? (
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={handleDelete}
                                disabled={isDeleting}
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 shadow-2xs transition-colors disabled:opacity-50"
                              >
                                Confirm
                              </button>
                              <button
                                type="button"
                                onClick={() => setConfirmDelete(false)}
                                className="inline-flex items-center px-2 py-1.5 rounded-lg text-xs font-medium text-slate-600 bg-white hover:bg-slate-100 border border-slate-200"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setConfirmDelete(true)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                              title="Delete resume"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* AI Autofill Prompt Card */}
                      <div className="mt-3 pt-3 border-t border-blue-200/60 flex items-center justify-between flex-wrap gap-2">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={handleManualReextract}
                            disabled={isParsingResume}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition-colors disabled:opacity-50"
                          >
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>
                              {candidateProfile
                                ? "Re-Extract Profile with AI"
                                : "Autofill Profile with AI"}
                            </span>
                          </button>

                          {candidateProfile && (
                            <button
                              type="button"
                              onClick={() => setModalTab("profile")}
                              className="text-xs font-semibold text-blue-700 hover:underline"
                            >
                              View Extracted Features →
                            </button>
                          )}
                        </div>

                        {/* Toggle Live PDF Preview */}
                        {isPdf && resume.fileData && (
                          <button
                            type="button"
                            onClick={() => setShowLivePreview(!showLivePreview)}
                            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
                          >
                            {showLivePreview ? (
                              <>
                                <EyeOff className="w-3.5 h-3.5" />
                                <span>Hide Preview</span>
                              </>
                            ) : (
                              <>
                                <Eye className="w-3.5 h-3.5" />
                                <span>Preview Document</span>
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    </div>

                    {/* PDF Viewer Frame */}
                    {showLivePreview && isPdf && resume.fileData && (
                      <div className="rounded-xl border border-slate-300 overflow-hidden bg-slate-900 shadow-inner">
                        <div className="bg-slate-800 text-slate-200 text-xs px-3 py-1.5 flex items-center justify-between">
                          <span className="font-mono text-[11px]">
                            {resume.fileName}
                          </span>
                          <span className="text-[10px] text-slate-400">PDF Document</span>
                        </div>
                        <iframe
                          src={resume.fileData}
                          title="Resume Preview"
                          className="w-full h-96 border-0 bg-white"
                        />
                      </div>
                    )}
                  </div>
                ) : (
                  /* Drag & Drop Upload Zone */
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`cursor-pointer rounded-2xl border-2 border-dashed p-8 text-center transition-all ${
                      isDragging
                        ? "border-blue-500 bg-blue-50/80 scale-[1.01]"
                        : "border-slate-300 hover:border-blue-400 bg-slate-50/60 hover:bg-blue-50/30"
                    }`}
                  >
                    <div className="mx-auto w-12 h-12 rounded-2xl bg-blue-100/80 text-blue-600 flex items-center justify-center mb-3">
                      <UploadCloud className="w-6 h-6" />
                    </div>
                    <h4 className="text-sm font-bold text-slate-800">
                      {isDragging
                        ? "Drop your resume now"
                        : "Click to upload or drag & drop"}
                    </h4>
                    <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                      Upload your resume in{" "}
                      <span className="font-semibold text-slate-700">
                        PDF (.pdf)
                      </span>{" "}
                      or{" "}
                      <span className="font-semibold text-slate-700">
                        Word (.docx)
                      </span>{" "}
                      format. Digital text is extracted directly without OCR for maximum speed and accuracy.
                    </p>

                    <div className="mt-4 flex items-center justify-center gap-2 flex-wrap">
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-md bg-rose-50 text-rose-700 border border-rose-200">
                        <FileCheck className="w-3 h-3" /> PDF (.pdf)
                      </span>
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 border border-blue-200">
                        <FileCheck className="w-3 h-3" /> Word (.docx)
                      </span>
                      <span className="text-[11px] text-slate-400 font-medium">
                        Max size: 5 MB
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            /* Tab 2: Candidate Profile View */
            <CandidateProfileView
              profile={candidateProfile}
              isParsing={isParsingResume}
              parsingStatus={parsingStatus}
              onSave={updateProfile}
              onReextract={handleManualReextract}
              hasResume={Boolean(resume)}
            />
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs">
          <span className="text-slate-500 font-medium">
            JSS University Noida · Placement Intelligence
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg font-semibold bg-slate-900 hover:bg-slate-800 text-white shadow-xs transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
