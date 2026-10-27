import React, { useRef } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  GraduationCap,
  ShieldCheck,
  FileText,
  UploadCloud,
  Sparkles,
  RefreshCw,
  ExternalLink,
  Download,
  Building,
  Hash,
  Database,
  Calendar,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { CandidateProfileView } from "@/components/profile/CandidateProfileView";
import {
  formatFileSize,
  downloadResumeFile,
  previewResumeInNewTab,
  validateResumeFile,
} from "@/lib/resumeService";
import { toast } from "sonner";

export const CandidateProfilePage: React.FC = () => {
  const {
    user,
    student,
    resume,
    candidateProfile,
    isResumeLoading,
    isParsingResume,
    parsingStatus,
    uploadResume,
    parseAndAutofillResume,
    updateProfile,
  } = useAuth();

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const file = files[0];

    const validation = validateResumeFile(file);
    if (!validation.valid) {
      toast.error("Invalid File", { description: validation.error });
      return;
    }

    const toastId = toast.loading("Saving resume and extracting profile with AI...");
    const result = await uploadResume(file);
    if (result.success) {
      toast.success("Resume uploaded! Extracting features...", { id: toastId });
    } else {
      toast.error("Upload failed", { id: toastId, description: result.error });
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleManualReextract = async () => {
    if (!resume?.fileData) {
      toast.error("No resume file available to re-analyze.");
      return;
    }

    try {
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
      } else {
        toast.error("Extraction failed", { id: toastId, description: result.error });
      }
    } catch (err: any) {
      toast.error("Re-analysis error", { description: err.message });
    }
  };

  const isPdf =
    resume?.fileName?.toLowerCase().endsWith(".pdf") ||
    resume?.fileType === "application/pdf";

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      {/* Top Navigation */}
      <header className="sticky top-0 z-30 h-16 border-b border-[#E5E7EB] bg-white/95 backdrop-blur-xs px-4 sm:px-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-blue-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Companies</span>
          </Link>
          <span className="text-slate-300">|</span>
          <div className="flex items-center gap-2">
            <h1 className="text-sm font-bold text-slate-900 font-heading">
              Candidate Placement Profile
            </h1>
            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              <ShieldCheck className="w-3 h-3" /> JSS Verified
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
            <Database className="w-3.5 h-3.5" />
            Supabase DB Synced
          </span>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Profile Dossier Header Banner */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-700 to-indigo-600 text-white font-bold text-xl flex items-center justify-center shrink-0 shadow-md shadow-blue-600/20">
                {student?.branchCode ? student.branchCode.slice(0, 2) : "JS"}
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-lg font-bold text-slate-900 font-heading">
                    {candidateProfile?.fullName ||
                      (student?.username ? student.username.toUpperCase() : "Student")}
                  </h2>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200">
                    {student?.admissionYear
                      ? `Batch of ${student.admissionYear}`
                      : "Batch 2025"}
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-mono">{user?.email}</p>
                {student?.branchName && (
                  <p className="text-xs font-medium text-slate-700">
                    {student.branchName} · JSS University Noida
                  </p>
                )}
              </div>
            </div>

            {/* Resume Action Bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 shrink-0">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/msword"
                className="hidden"
              />

              {resume ? (
                <div className="flex items-center gap-2 p-1.5 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="flex items-center gap-2 px-2">
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded font-mono ${
                        isPdf
                          ? "bg-rose-100 text-rose-700"
                          : "bg-blue-100 text-blue-700"
                      }`}
                    >
                      {isPdf ? "PDF" : "DOCX"}
                    </span>
                    <span className="text-xs font-medium text-slate-800 max-w-[120px] truncate">
                      {resume.fileName}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => previewResumeInNewTab(resume)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-white transition-colors"
                    title="View Resume in New Tab"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => downloadResumeFile(resume)}
                    className="p-1.5 rounded-lg text-blue-600 hover:text-blue-800 hover:bg-white transition-colors"
                    title="Download Resume"
                  >
                    <Download className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isResumeLoading}
                    className="px-2.5 py-1 rounded-lg text-xs font-semibold text-slate-700 hover:bg-white transition-colors border border-transparent hover:border-slate-200"
                  >
                    Replace
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-sm transition-colors"
                >
                  <UploadCloud className="w-4 h-4" />
                  <span>Upload Resume (PDF / DOCX)</span>
                </button>
              )}

              {resume && (
                <button
                  type="button"
                  onClick={handleManualReextract}
                  disabled={isParsingResume}
                  className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 transition-colors disabled:opacity-50"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{isParsingResume ? "Extracting..." : "Re-Extract Profile"}</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Candidate Profile View Section */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
          <CandidateProfileView
            profile={candidateProfile}
            isParsing={isParsingResume}
            parsingStatus={parsingStatus}
            onSave={updateProfile}
            onReextract={handleManualReextract}
            hasResume={Boolean(resume)}
          />
        </div>
      </main>
    </div>
  );
};
