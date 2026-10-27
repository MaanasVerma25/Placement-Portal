import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  GraduationCap,
  LogOut,
  ChevronDown,
  ShieldCheck,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

export const StudentUserMenu: React.FC = () => {
  const { user, student, signOut, isLoading } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
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
      toast.info("Logged out", { description: "You have been safely signed out." });
    }
  };

  if (isLoading) {
    return (
      <div className="w-20 h-8 rounded-lg bg-slate-100 animate-pulse" />
    );
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

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 transition-all text-left shadow-xs"
        aria-expanded={isOpen}
      >
        <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-blue-700 to-indigo-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
          {student?.branchCode ? student.branchCode.slice(0, 2) : "JS"}
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

      {/* Profile Popup Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 rounded-2xl bg-white border border-slate-200/90 shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-1 duration-150">
          {/* Header Card */}
          <div className="p-4 bg-gradient-to-br from-slate-900 to-slate-800 text-white text-left">
            <div className="flex items-center justify-between mb-2">
              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                <ShieldCheck className="w-3 h-3" /> JSS Verified
              </span>
              <span className="text-[10px] text-slate-400 font-mono">
                {student?.admissionYear ? `Batch of ${student.admissionYear}` : "Active"}
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

          {/* Student Meta Details */}
          <div className="p-3 text-xs space-y-2 border-b border-slate-100 text-left bg-slate-50/50">
            {student?.rollNumber && (
              <div className="flex items-center justify-between text-slate-600">
                <span className="font-medium text-[11px]">Roll Number:</span>
                <span className="font-mono font-bold text-slate-800">{student.rollNumber}</span>
              </div>
            )}
            {student?.batchYears && (
              <div className="flex items-center justify-between text-slate-600">
                <span className="font-medium text-[11px]">Academic Period:</span>
                <span className="font-semibold text-slate-800">{student.batchYears}</span>
              </div>
            )}
            <div className="flex items-center justify-between text-slate-600">
              <span className="font-medium text-[11px]">Institution:</span>
              <span className="font-semibold text-slate-800 truncate max-w-[140px]">JSS Univ. Noida</span>
            </div>
          </div>

          {/* Actions */}
          <div className="p-2 bg-white">
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
  );
};
