import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  GraduationCap,
  LogOut,
  ChevronDown,
  ShieldCheck,
  FileText,
  UploadCloud,
  ExternalLink,
  Download,
  User,
  CheckCircle2,
  RefreshCw,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { StudentProfileModal } from "@/components/profile/StudentProfileModal";
import {
  formatFileSize,
  downloadResumeFile,
  previewResumeInNewTab,
  validateResumeFile,
} from "@/lib/resumeService";
import { toast } from "sonner";

export const StudentUserMenu: React.FC = () => {
  const { user, student, resume, isResumeLoading, uploadResume, signOut, isLoading } =
    useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const quickFileInputRef = useRef<HTMLInputElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    setIsOpen(false);
    const { error } = await signOut();
    if (error) {
      toast.error("Failed to sign out", { description: error.message });
    } else {
      toast.info("Logged out", {
        description: "You have been safely signed out.",
      });
    }
  };

  const handleQuickUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const file = files[0];

    const validation = validateResumeFile(file);
    if (!validation.valid) {
      toast.error("Invalid Resume File", {
        description: validation.error,
      });
      return;
    }

    const toastId = toast.loading("Saving resume to Supabase database...");
    const result = await uploadResume(file);

    if (result.success) {
      toast.success("Resume saved successfully!", {
        id: toastId,
        description: `${file.name} is saved in your profile database.`,
      });
    } else {
      toast.error("Upload Failed", {
        id: toastId,
        description: result.error || "Please try again.",
      });
    }

    if (quickFileInputRef.current) {
      quickFileInputRef.current.value = "";
    }
  };

  if (isLoading) {
    return <div className="w-20 h-8 rounded-lg bg-slate-100 animate-pulse" />;
  }

  if (!user) {
    return (
      <Link
        to="/login"
        className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition-colors"
      >
        <GraduationCap className="w-4 h-4" />
        <span>Student Login</span>
      </Link>
    );
  }

  const branchDisplay = student?.branchCode || "STUDENT";
  const rollDisplay = student?.rollNumber ? `#${student.rollNumber}` : "";
  const isPdf =
    resume?.fileName?.toLowerCase().endsWith(".pdf") ||
    resume?.fileType === "application/pdf";

  return (
    <>
      <div className="relative" ref={dropdownRef}>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 transition-all text-left shadow-xs cursor-pointer"
          aria-expanded={isOpen}
          id="student-profile-menu-button"
        >
          <div className="relative">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-blue-700 to-indigo-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
              {student?.branchCode ? student.branchCode.slice(0, 2) : "JS"}
            </div>
            {resume && (
              <span
                className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white ring-1 ring-emerald-600/20"
                title="Resume attached"
              />
            )}
          </div>
          <div className="hidden sm:flex flex-col">
            <span className="text-xs font-bold text-slate-800 leading-tight">
              {student?.username ? student.username.toUpperCase() : "Student"}
            </span>
            <span className="text-[10px] font-semibold text-blue-600">
              {branchDisplay} {rollDisplay}
            </span>
          </div>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
        </button>

        {/* Hidden File Input for quick upload */}
        <input
          type="file"
          ref={quickFileInputRef}
          onChange={handleQuickUpload}
          accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/msword"
          className="hidden"
        />

        {/* Profile Dropdown Popup Menu */}
        {isOpen && (
          <div className="absolute right-0 mt-2 w-80 rounded-2xl bg-white border border-slate-200/90 shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-1 duration-150">
            {/* Header Card */}
            <div className="p-4 bg-gradient-to-br from-slate-900 to-slate-800 text-white text-left">
              <div className="flex items-center justify-between mb-2">
                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                  <ShieldCheck className="w-3 h-3" /> JSS Verified
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  {student?.admissionYear
                    ? `Batch of ${student.admissionYear}`
                    : "Active"}
                </span>
              </div>

              <div className="font-heading font-bold text-sm text-white truncate">
                {student?.username ? student.username.toUpperCase() : user.email}
              </div>
              <div className="text-[11px] font-mono text-slate-300 truncate">
                {user.email}
              </div>

              {student?.branchName && (
                <div className="mt-2 text-xs font-medium text-blue-200 bg-white/10 px-2.5 py-1 rounded-md">
                  {student.branchName}
                </div>
              )}
            </div>

            {/* Resume Option Section */}
            <div className="p-3 bg-slate-50 border-b border-slate-100 text-left">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-blue-600" />
                  Profile Resume
                </span>
                {resume && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                    <CheckCircle2 className="w-2.5 h-2.5" />
                    In Database
                  </span>
                )}
              </div>

              {resume ? (
                <div className="p-2.5 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.5 rounded font-mono shrink-0 ${
                          isPdf
                            ? "bg-rose-100 text-rose-700"
                            : "bg-blue-100 text-blue-700"
                        }`}
                      >
                        {isPdf ? "PDF" : "DOCX"}
                      </span>
                      <span className="text-xs font-medium text-slate-800 truncate">
                        {resume.fileName}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 shrink-0 font-mono">
                      {formatFileSize(resume.fileSize)}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 pt-1 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => previewResumeInNewTab(resume)}
                      className="flex-1 inline-flex items-center justify-center gap-1 py-1 px-2 rounded-lg text-[11px] font-medium text-slate-700 hover:bg-slate-100 transition-colors"
                    >
                      <ExternalLink className="w-3 h-3 text-slate-400" />
                      <span>View</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => downloadResumeFile(resume)}
                      className="flex-1 inline-flex items-center justify-center gap-1 py-1 px-2 rounded-lg text-[11px] font-medium text-blue-700 hover:bg-blue-50 transition-colors"
                    >
                      <Download className="w-3 h-3 text-blue-600" />
                      <span>Download</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => quickFileInputRef.current?.click()}
                      disabled={isResumeLoading}
                      className="inline-flex items-center justify-center p-1 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
                      title="Replace Resume"
                    >
                      <RefreshCw
                        className={`w-3 h-3 ${isResumeLoading ? "animate-spin" : ""}`}
                      />
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => quickFileInputRef.current?.click()}
                  disabled={isResumeLoading}
                  className="w-full flex items-center justify-between p-2.5 rounded-xl border border-dashed border-blue-300 hover:border-blue-500 bg-blue-50/50 hover:bg-blue-50 transition-colors text-left group"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                      <UploadCloud className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-blue-900 leading-tight">
                        Upload Resume
                      </div>
                      <div className="text-[10px] text-blue-600">
                        PDF or DOCX (Max 5MB)
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] font-semibold text-blue-600 group-hover:translate-x-0.5 transition-transform">
                    Select File →
                  </span>
                </button>
              )}
            </div>

            {/* Student Meta Details */}
            <div className="p-3 text-xs space-y-1.5 border-b border-slate-100 text-left bg-white">
              {student?.rollNumber && (
                <div className="flex items-center justify-between text-slate-600">
                  <span className="font-medium text-[11px]">Roll Number:</span>
                  <span className="font-mono font-bold text-slate-800">
                    {student.rollNumber}
                  </span>
                </div>
              )}
              {student?.batchYears && (
                <div className="flex items-center justify-between text-slate-600">
                  <span className="font-medium text-[11px]">Period:</span>
                  <span className="font-semibold text-slate-800">
                    {student.batchYears}
                  </span>
                </div>
              )}
              <div className="flex items-center justify-between text-slate-600">
                <span className="font-medium text-[11px]">Institution:</span>
                <span className="font-semibold text-slate-800 truncate max-w-[140px]">
                  JSS Univ. Noida
                </span>
              </div>
            </div>

            {/* Actions: View Profile & Sign Out */}
            <div className="p-2 bg-slate-50/50 space-y-1">
              <Link
                to="/profile"
                onClick={() => setIsOpen(false)}
                className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold text-blue-700 hover:bg-blue-50 border border-blue-200/80 transition-all text-left shadow-2xs"
              >
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-blue-600" />
                  <span>Full Profile & RADIX Skills Page</span>
                </div>
                <span className="text-[10px] text-blue-500 font-bold">Open →</span>
              </Link>

              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  setIsProfileModalOpen(true);
                }}
                className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold text-slate-700 hover:text-blue-700 hover:bg-white border border-transparent hover:border-slate-200 transition-all text-left shadow-2xs"
              >
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-slate-500" />
                  <span>Quick Modal & Resume</span>
                </div>
                <span className="text-[10px] text-slate-400">Dossier →</span>
              </button>

              <button
                type="button"
                onClick={handleSignOut}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors text-left"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out of Portal</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Full Profile & Resume Modal */}
      <StudentProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
      />
    </>
  );
};
