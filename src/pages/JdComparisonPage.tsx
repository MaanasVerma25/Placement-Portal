import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Briefcase,
  FileText,
  UploadCloud,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  XCircle,
  RefreshCw,
  TrendingUp,
  Award,
  Layers,
  ChevronRight,
  ShieldCheck,
  Building,
  Target,
  FileCheck,
  HelpCircle,
  Clock,
  Printer,
  ChevronDown,
  Filter,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { validateResumeFile } from "@/lib/resumeService";
import {
  extractJdText,
  compareJdWithProfile,
  loadComparisonResultFromStorage,
  clearComparisonResultFromStorage,
} from "@/lib/jdComparisonService";
import {
  JdComparisonResult,
  MatchStatus,
  RequirementImportance,
} from "@/types/jdComparison";
import { RADIX_SKILL_CATEGORIES } from "@/lib/resumeParserService";
import { toast } from "sonner";

const SAMPLE_JD_BACKEND = `Role: Associate Backend Software Engineer
Company: CloudScale Systems
Location: Bangalore / Noida (Hybrid)
Experience: 0-2 Years (Freshers with strong project foundation eligible)

About the Role:
We are looking for an ambitious Backend Engineer to build robust, distributed microservices handling millions of API requests daily. You will design database schemas, optimize queries, and implement clean RESTful endpoints.

Key Requirements & Responsibilities:
- Strong proficiency in Python, Java, or C++ with knowledge of OOP principles.
- Experience with web frameworks such as FastAPI, Django, or Spring Boot.
- Solid understanding of Data Structures and Algorithms (Arrays, Trees, Graphs, Hashing, Dynamic Programming).
- Relational database experience with PostgreSQL or MySQL (indexing, schema design, transactions).
- Familiarity with caching systems like Redis and message queues (RabbitMQ/Kafka) is a plus.
- Basic understanding of Linux environments, Git, and containerization with Docker.
- Strong problem-solving aptitude and clear technical communication skills.
- B.Tech/B.E. in Computer Science, IT, or related technical disciplines with minimum 7.0 CGPA.`;

const SAMPLE_JD_AIML = `Role: Junior AI / ML Engineer
Company: NeuralWorks Innovations
Location: Delhi NCR / Remote
Experience: Fresh Graduate / 0-1 Years

About the Role:
NeuralWorks is expanding our Applied AI team. You will work on fine-tuning large language models, developing RAG (Retrieval Augmented Generation) pipelines, and deploying machine learning services into production.

Key Requirements:
- Proficient in Python with strong grasp of NumPy, Pandas, and PyTorch or TensorFlow.
- Understanding of LLM concepts: Prompt Engineering, Embeddings, Vector Databases, and LangChain/LlamaIndex.
- Solid CS fundamentals in Data Structures, Algorithms, and Object-Oriented Design.
- Experience building RESTful APIs using FastAPI or Flask to serve AI models.
- Familiarity with SQL (PostgreSQL) and Git version control.
- Demonstrable hands-on AI projects or hackathon participation.
- Strong analytical and quantitative problem-solving mindset.
- B.Tech in CSE, AI, Data Science, or related engineering degree.`;

export const JdComparisonPage: React.FC = () => {
  const { user, student, candidateProfile } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [comparison, setComparison] = useState<JdComparisonResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStatus, setProcessingStatus] = useState<string>("");
  const [pastedText, setPastedText] = useState("");
  const [inputMode, setInputMode] = useState<"file" | "text">("file");
  const [filterStatus, setFilterStatus] = useState<"all" | "match" | "gap" | "must_have">("all");
  const [activeTab, setActiveTab] = useState<"requirements" | "radix" | "insights" | "prep">("requirements");

  // Load existing comparison from storage on mount
  useEffect(() => {
    const saved = loadComparisonResultFromStorage();
    if (saved) {
      setComparison(saved);
    }
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const file = files[0];

    const validation = validateResumeFile(file);
    if (!validation.valid) {
      toast.error("Invalid JD Document", { description: validation.error });
      return;
    }

    setIsProcessing(true);
    setProcessingStatus("Reading Job Description file...");
    const toastId = toast.loading("Extracting JD text and running AI comparison...");

    try {
      // 1. Text extraction (supports PDF, DOCX with OCR fallback)
      setProcessingStatus("Extracting document text (PDF/DOCX)...");
      const { text } = await extractJdText(file, (msg) => setProcessingStatus(msg));

      if (!text || text.trim().length < 30) {
        throw new Error("Could not extract readable text from this document. Please ensure it is not password protected.");
      }

      // 2. Feed into LLM side-by-side comparison
      setProcessingStatus("Comparing requirements against your 12 RADIX profile...");
      const result = await compareJdWithProfile({
        jdText: text,
        candidateProfile,
        studentMeta: {
          username: student?.username,
          email: user?.email,
          branchName: student?.branchName,
          branchCode: student?.branchCode,
          rollNumber: student?.rollNumber,
          admissionYear: student?.admissionYear,
        },
        fileName: file.name,
        sourceType: file.name.toLowerCase().endsWith(".pdf") ? "pdf" : "docx",
        onProgress: (msg) => setProcessingStatus(msg),
      });

      setComparison(result);
      toast.success("JD Comparison Ready!", {
        id: toastId,
        description: `Match score: ${result.overallMatchScore}% (${result.verdict})`,
      });
    } catch (err: any) {
      console.error("JD Comparison failed:", err);
      toast.error("Comparison Failed", {
        id: toastId,
        description: err.message || "Failed to compare JD.",
      });
    } finally {
      setIsProcessing(false);
      setProcessingStatus("");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handlePastedTextSubmit = async () => {
    if (!pastedText.trim() || pastedText.trim().length < 40) {
      toast.error("Job Description too short", {
        description: "Please paste at least 40 characters describing the job requirements.",
      });
      return;
    }

    setIsProcessing(true);
    setProcessingStatus("Analyzing pasted Job Description with AI...");
    const toastId = toast.loading("Analyzing JD requirements side-by-side...");

    try {
      const result = await compareJdWithProfile({
        jdText: pastedText,
        candidateProfile,
        studentMeta: {
          username: student?.username,
          email: user?.email,
          branchName: student?.branchName,
          branchCode: student?.branchCode,
          rollNumber: student?.rollNumber,
          admissionYear: student?.admissionYear,
        },
        fileName: "Pasted_Job_Description",
        sourceType: "text",
        onProgress: (msg) => setProcessingStatus(msg),
      });

      setComparison(result);
      toast.success("JD Comparison Ready!", {
        id: toastId,
        description: `Match score: ${result.overallMatchScore}% (${result.verdict})`,
      });
    } catch (err: any) {
      console.error("Text JD comparison error:", err);
      toast.error("Comparison Failed", {
        id: toastId,
        description: err.message || "Failed to compare JD.",
      });
    } finally {
      setIsProcessing(false);
      setProcessingStatus("");
    }
  };

  const handleLoadSample = async (sampleText: string, sampleTitle: string) => {
    setIsProcessing(true);
    setProcessingStatus(`Loading sample ${sampleTitle}...`);
    const toastId = toast.loading(`Analyzing sample JD: ${sampleTitle}...`);

    try {
      const result = await compareJdWithProfile({
        jdText: sampleText,
        candidateProfile,
        studentMeta: {
          username: student?.username,
          email: user?.email,
          branchName: student?.branchName,
          branchCode: student?.branchCode,
          rollNumber: student?.rollNumber,
          admissionYear: student?.admissionYear,
        },
        fileName: `${sampleTitle.replace(/\s+/g, "_")}.txt`,
        sourceType: "text",
        onProgress: (msg) => setProcessingStatus(msg),
      });

      setComparison(result);
      toast.success("Sample JD Analyzed!", {
        id: toastId,
        description: `Match score: ${result.overallMatchScore}% (${result.verdict})`,
      });
    } catch (err: any) {
      toast.error("Analysis Failed", { id: toastId, description: err.message });
    } finally {
      setIsProcessing(false);
      setProcessingStatus("");
    }
  };

  const handleClear = () => {
    clearComparisonResultFromStorage();
    setComparison(null);
    setPastedText("");
    toast.info("Comparison cleared");
  };

  const handlePrint = () => {
    window.print();
  };

  // Filter requirements
  const filteredRequirements = (comparison?.requirementsComparison || []).filter((req) => {
    if (filterStatus === "match") return req.matchStatus === "match";
    if (filterStatus === "gap") return req.matchStatus === "gap";
    if (filterStatus === "must_have") return req.importance === "must_have";
    return true;
  });

  const matchCount = (comparison?.requirementsComparison || []).filter((r) => r.matchStatus === "match").length;
  const partialCount = (comparison?.requirementsComparison || []).filter((r) => r.matchStatus === "partial").length;
  const gapCount = (comparison?.requirementsComparison || []).filter((r) => r.matchStatus === "gap").length;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/msword"
        className="hidden"
      />

      {/* Top Header */}
      <header className="sticky top-0 z-30 h-16 border-b border-[#E5E7EB] bg-white/95 backdrop-blur-xs px-4 sm:px-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            to="/profile"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-blue-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Profile & RADIX</span>
          </Link>
          <span className="text-slate-300">|</span>
          <div className="flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-indigo-600" />
            <h1 className="text-sm font-bold text-slate-900 font-heading">
              Job Description (JD) Intelligence & Side-by-Side Match
            </h1>
            <span className="hidden md:inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
              <Sparkles className="w-3 h-3 text-indigo-500" /> AI Comparative Engine
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {comparison && (
            <button
              onClick={handlePrint}
              className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100 border border-slate-200 transition-colors"
              title="Print or export report"
            >
              <Printer className="w-3.5 h-3.5 text-slate-500" />
              <span>Print / Export</span>
            </button>
          )}
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
            <ShieldCheck className="w-3.5 h-3.5" />
            JSS Verified
          </span>
        </div>
      </header>

      {/* Profile Notice if no resume uploaded yet */}
      {!candidateProfile && (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-4">
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-between gap-3 text-xs text-amber-900">
            <div className="flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                <strong>Profile Tip:</strong> You haven't uploaded your resume yet. You can still test any JD, but uploading your resume in your{" "}
                <Link to="/profile" className="underline font-semibold hover:text-amber-950">
                  Full Profile
                </Link>{" "}
                will provide richer 12 RADIX skill and project comparisons!
              </span>
            </div>
            <Link
              to="/profile"
              className="shrink-0 px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-lg text-[11px]"
            >
              Upload Resume
            </Link>
          </div>
        </div>
      )}

      {/* Main Container */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Upload / Input Card */}
        <section className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5 sm:p-6 transition-all">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600">
                  <Briefcase className="w-4 h-4" />
                </span>
                <h2 className="text-base font-bold text-slate-900">
                  Enter Job Description (JD)
                </h2>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Upload any recruiter JD in PDF or DOCX file format (with OCR fallback for scanned docs), or paste JD text. Our AI compares your 12 RADIX skills and projects side by side.
              </p>
            </div>

            {/* Input Mode Selector */}
            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl text-xs font-semibold self-start sm:self-auto">
              <button
                type="button"
                onClick={() => setInputMode("file")}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  inputMode === "file"
                    ? "bg-white text-indigo-700 shadow-2xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Upload File (PDF/DOCX)
              </button>
              <button
                type="button"
                onClick={() => setInputMode("text")}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  inputMode === "text"
                    ? "bg-white text-indigo-700 shadow-2xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Paste JD Text
              </button>
            </div>
          </div>

          {/* Processing Indicator */}
          {isProcessing && (
            <div className="my-6 p-4 rounded-xl bg-indigo-50/80 border border-indigo-200 flex items-center gap-3 animate-pulse">
              <RefreshCw className="w-5 h-5 text-indigo-600 animate-spin shrink-0" />
              <div>
                <p className="text-xs font-bold text-indigo-900">
                  AI Pipeline in progress...
                </p>
                <p className="text-[11px] text-indigo-700">
                  {processingStatus || "Analyzing document and matching with candidate profile..."}
                </p>
              </div>
            </div>
          )}

          {/* Mode 1: File Upload */}
          {inputMode === "file" && !isProcessing && (
            <div className="mt-5 space-y-4">
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-indigo-200 hover:border-indigo-400 bg-indigo-50/20 hover:bg-indigo-50/40 rounded-2xl p-6 sm:p-8 text-center cursor-pointer transition-all group"
              >
                <div className="w-12 h-12 mx-auto rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform shadow-2xs">
                  <UploadCloud className="w-6 h-6" />
                </div>
                <div className="text-sm font-bold text-slate-800">
                  Upload Job Description File
                </div>
                <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                  Drag and drop your JD here, or click to browse. Supports{" "}
                  <strong className="text-slate-700">PDF</strong> and{" "}
                  <strong className="text-slate-700">DOCX / Word</strong> documents up to 10MB.
                </p>
                <div className="mt-4 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 transition-colors shadow-2xs">
                  <FileText className="w-3.5 h-3.5" />
                  <span>Select JD File</span>
                </div>
              </div>

              {/* Sample JDs for quick testing */}
              <div className="flex flex-wrap items-center gap-2 pt-2 text-xs">
                <span className="text-slate-400 font-medium">Or test with ready samples:</span>
                <button
                  type="button"
                  onClick={() => handleLoadSample(SAMPLE_JD_BACKEND, "Backend Engineer JD")}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 font-medium transition-colors border border-slate-200"
                >
                  ⚡ Sample Backend Engineer JD
                </button>
                <button
                  type="button"
                  onClick={() => handleLoadSample(SAMPLE_JD_AIML, "AI/ML Engineer JD")}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 font-medium transition-colors border border-slate-200"
                >
                  ⚡ Sample AI/ML Engineer JD
                </button>
              </div>
            </div>
          )}

          {/* Mode 2: Paste JD Text */}
          {inputMode === "text" && !isProcessing && (
            <div className="mt-5 space-y-4">
              <textarea
                value={pastedText}
                onChange={(e) => setPastedText(e.target.value)}
                placeholder="Paste the complete Job Description here (Role title, company, requirements, responsibilities, eligibility)..."
                rows={6}
                className="w-full p-3.5 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 text-xs font-mono text-slate-800 placeholder:text-slate-400 focus:outline-none transition-all"
              />
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-slate-400">
                  {pastedText.length} characters entered
                </span>
                <button
                  type="button"
                  onClick={handlePastedTextSubmit}
                  disabled={pastedText.trim().length < 30}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white text-xs font-semibold transition-colors shadow-2xs"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Compare with My Profile</span>
                </button>
              </div>
            </div>
          )}
        </section>

        {/* COMPARISON RESULTS SECTION */}
        {comparison && (
          <div className="space-y-6 animate-in fade-in duration-300">
            {/* Hero Verdict Card */}
            <section className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

              <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                {/* Left: Job Meta & Verdict */}
                <div className="space-y-3 max-w-2xl">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/10 text-indigo-200 text-xs font-medium border border-white/10">
                      <Building className="w-3.5 h-3.5" />
                      {comparison.companyName}
                    </span>
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/10 text-slate-300 text-xs font-mono">
                      <Clock className="w-3 h-3" />
                      {comparison.experienceLevel}
                    </span>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-indigo-500/30 text-indigo-300 border border-indigo-400/30">
                      {comparison.sourceType.toUpperCase()} Extracted
                    </span>
                  </div>

                  <h2 className="text-xl sm:text-2xl font-bold font-heading text-white">
                    {comparison.jobTitle}
                  </h2>

                  <p className="text-xs text-indigo-100/90 leading-relaxed">
                    {comparison.roleOverview}
                  </p>

                  <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-xs text-slate-200 leading-relaxed">
                    <strong className="text-indigo-300">Executive Fit Analysis: </strong>
                    {comparison.fitSummary}
                  </div>
                </div>

                {/* Right: Score Dial & Badge */}
                <div className="flex flex-col items-center justify-center p-5 rounded-2xl bg-white/10 border border-white/15 backdrop-blur-xs shrink-0 min-w-[200px] text-center">
                  <div className="relative w-24 h-24 rounded-full flex items-center justify-center border-4 border-indigo-400/40 shadow-inner bg-slate-900/40 mb-2">
                    <div className="text-center">
                      <span className="text-2xl sm:text-3xl font-extrabold font-mono text-white">
                        {comparison.overallMatchScore}%
                      </span>
                      <div className="text-[9px] uppercase tracking-wider text-indigo-200 font-bold">
                        Fit Score
                      </div>
                    </div>
                  </div>

                  <span
                    className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${
                      comparison.verdict === "Strong Match"
                        ? "bg-emerald-500/20 text-emerald-300 border border-emerald-400/30"
                        : comparison.verdict === "Moderate Match"
                        ? "bg-amber-500/20 text-amber-300 border border-amber-400/30"
                        : "bg-rose-500/20 text-rose-300 border border-rose-400/30"
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {comparison.verdict}
                  </span>

                  {/* Requirements Quick Counters */}
                  <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-white/10 w-full text-center">
                    <div>
                      <div className="text-emerald-400 font-bold font-mono text-xs">
                        {matchCount}
                      </div>
                      <div className="text-[10px] text-slate-300">Matches</div>
                    </div>
                    <div>
                      <div className="text-amber-400 font-bold font-mono text-xs">
                        {partialCount}
                      </div>
                      <div className="text-[10px] text-slate-300">Partial</div>
                    </div>
                    <div>
                      <div className="text-rose-400 font-bold font-mono text-xs">
                        {gapCount}
                      </div>
                      <div className="text-[10px] text-slate-300">Gaps</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Bar */}
              <div className="mt-6 pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
                <div className="flex items-center gap-2">
                  <FileCheck className="w-4 h-4 text-emerald-400" />
                  <span>
                    Compared against:{" "}
                    <strong className="text-white">
                      {candidateProfile?.fullName || student?.username || user?.email}
                    </strong>{" "}
                    ({student?.branchCode || "Engineering"})
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white font-medium transition-colors"
                  >
                    <RefreshCw className="w-3 h-3" /> Compare Another JD
                  </button>
                  <button
                    onClick={handleClear}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 font-medium transition-colors"
                  >
                    Clear
                  </button>
                </div>
              </div>
            </section>

            {/* Navigation Tabs */}
            <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto text-xs font-semibold">
              <button
                type="button"
                onClick={() => setActiveTab("requirements")}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition-all shrink-0 ${
                  activeTab === "requirements"
                    ? "bg-indigo-600 text-white shadow-2xs"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                <Layers className="w-4 h-4" />
                <span>Side-by-Side Requirements</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                  activeTab === "requirements" ? "bg-white/20 text-white" : "bg-slate-200 text-slate-700"
                }`}>
                  {comparison.requirementsComparison.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("radix")}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition-all shrink-0 ${
                  activeTab === "radix"
                    ? "bg-indigo-600 text-white shadow-2xs"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                <Target className="w-4 h-4" />
                <span>12 RADIX Skill Ladder</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                  activeTab === "radix" ? "bg-white/20 text-white" : "bg-slate-200 text-slate-700"
                }`}>
                  12
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("insights")}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition-all shrink-0 ${
                  activeTab === "insights"
                    ? "bg-indigo-600 text-white shadow-2xs"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                <TrendingUp className="w-4 h-4" />
                <span>Strengths & Gaps</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("prep")}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition-all shrink-0 ${
                  activeTab === "prep"
                    ? "bg-indigo-600 text-white shadow-2xs"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                <HelpCircle className="w-4 h-4" />
                <span>Interview Prep & Projects</span>
              </button>
            </div>

            {/* TAB 1: SIDE-BY-SIDE REQUIREMENTS COMPARISON */}
            {activeTab === "requirements" && (
              <div className="space-y-4">
                {/* Filters */}
                <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200">
                  <div className="flex items-center gap-1.5 text-xs">
                    <Filter className="w-3.5 h-3.5 text-slate-400" />
                    <span className="text-slate-500 font-medium">Filter Requirements:</span>
                    <button
                      type="button"
                      onClick={() => setFilterStatus("all")}
                      className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                        filterStatus === "all"
                          ? "bg-indigo-100 text-indigo-700 font-bold"
                          : "text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      All ({comparison.requirementsComparison.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setFilterStatus("match")}
                      className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                        filterStatus === "match"
                          ? "bg-emerald-100 text-emerald-800 font-bold"
                          : "text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      Matches ({matchCount})
                    </button>
                    <button
                      type="button"
                      onClick={() => setFilterStatus("gap")}
                      className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                        filterStatus === "gap"
                          ? "bg-rose-100 text-rose-800 font-bold"
                          : "text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      Gaps ({gapCount})
                    </button>
                    <button
                      type="button"
                      onClick={() => setFilterStatus("must_have")}
                      className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                        filterStatus === "must_have"
                          ? "bg-blue-100 text-blue-800 font-bold"
                          : "text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      Must-Haves Only
                    </button>
                  </div>

                  <span className="text-[11px] text-slate-400 font-mono">
                    Showing {filteredRequirements.length} of {comparison.requirementsComparison.length} items
                  </span>
                </div>

                {/* Side-by-Side Comparison Grid */}
                <div className="space-y-3">
                  {filteredRequirements.map((req) => {
                    const isMatch = req.matchStatus === "match";
                    const isPartial = req.matchStatus === "partial";
                    const isGap = req.matchStatus === "gap";

                    return (
                      <div
                        key={req.id}
                        className={`p-4 rounded-2xl border transition-all bg-white ${
                          isMatch
                            ? "border-emerald-200/90 hover:border-emerald-300 shadow-2xs"
                            : isPartial
                            ? "border-amber-200/90 hover:border-amber-300 shadow-2xs"
                            : "border-rose-200/90 hover:border-rose-300 shadow-2xs"
                        }`}
                      >
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
                          {/* Left Column (5 cols): JD Requirement */}
                          <div className="md:col-span-5 space-y-1.5">
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                                {req.category}
                              </span>
                              <span
                                className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                                  req.importance === "must_have"
                                    ? "bg-indigo-50 text-indigo-700 border border-indigo-200"
                                    : "bg-slate-50 text-slate-600 border border-slate-200"
                                }`}
                              >
                                {req.importance === "must_have" ? "Must-Have" : "Good-to-Have"}
                              </span>
                            </div>
                            <div className="text-xs font-semibold text-slate-900 leading-snug">
                              {req.requirement}
                            </div>
                          </div>

                          {/* Center Column (2 cols): Status Badge */}
                          <div className="md:col-span-2 flex flex-row md:flex-col items-center justify-center gap-1.5 py-1">
                            {isMatch && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                <span>Match</span>
                              </span>
                            )}
                            {isPartial && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-xs font-bold">
                                <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                                <span>Partial</span>
                              </span>
                            )}
                            {isGap && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200 text-xs font-bold">
                                <XCircle className="w-3.5 h-3.5 text-rose-600" />
                                <span>Skill Gap</span>
                              </span>
                            )}
                          </div>

                          {/* Right Column (5 cols): Candidate Evidence & Analysis */}
                          <div className="md:col-span-5 space-y-1.5 bg-slate-50/70 p-3 rounded-xl border border-slate-100">
                            <div className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
                              <ShieldCheck className="w-3 h-3 text-blue-600" />
                              <span>Your Profile Evidence:</span>
                            </div>
                            <p className="text-xs text-slate-800 leading-relaxed font-medium">
                              {req.candidateEvidence}
                            </p>
                            <div className="text-[11px] text-slate-500 italic pt-1 border-t border-slate-200/60">
                              Insight: {req.analysis}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB 2: 12 RADIX COMPETENCY LADDER COMPARISON */}
            {activeTab === "radix" && (
              <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 space-y-6">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 font-heading">
                    12 RADIX Competency Ladder Side-by-Side Analysis
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Comparison of this JD's target demand level against your verified placement competency scores (1 to 10 scale).
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {comparison.radixComparison.map((r) => {
                    const isAhead = r.status === "ahead";
                    const isMeets = r.status === "meets";
                    const isGap = r.status === "gap";
                    const delta = r.candidateLevel - r.jdDemandLevel;

                    return (
                      <div
                        key={r.skillSetId}
                        className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-indigo-200 transition-all space-y-3"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 font-mono font-bold text-xs flex items-center justify-center">
                              {r.shortName}
                            </span>
                            <div>
                              <div className="text-xs font-bold text-slate-900">
                                {r.skillSetName}
                              </div>
                              <div className="text-[10px] text-slate-400">
                                RADIX Category #{r.skillSetId}
                              </div>
                            </div>
                          </div>

                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              isAhead
                                ? "bg-emerald-100 text-emerald-800"
                                : isMeets
                                ? "bg-blue-100 text-blue-800"
                                : isGap
                                ? "bg-rose-100 text-rose-800"
                                : "bg-slate-100 text-slate-700"
                            }`}
                          >
                            {isAhead ? `Ahead (+${delta})` : isMeets ? "Meets Target" : `Gap (${delta})`}
                          </span>
                        </div>

                        {/* Visual Level Bars */}
                        <div className="space-y-1.5 text-xs">
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="text-slate-600 font-medium">Your Score:</span>
                            <span className="font-mono font-bold text-indigo-600">
                              {r.candidateLevel}/10
                            </span>
                          </div>
                          <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-indigo-600 rounded-full transition-all"
                              style={{ width: `${(r.candidateLevel / 10) * 100}%` }}
                            />
                          </div>

                          <div className="flex items-center justify-between text-[11px] pt-1">
                            <span className="text-slate-600 font-medium">JD Expected:</span>
                            <span className="font-mono font-bold text-slate-700">
                              {r.jdDemandLevel}/10
                            </span>
                          </div>
                          <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-slate-500 rounded-full transition-all"
                              style={{ width: `${(r.jdDemandLevel / 10) * 100}%` }}
                            />
                          </div>
                        </div>

                        {/* Matched Tech pills */}
                        {r.matchedTech && r.matchedTech.length > 0 && (
                          <div className="flex flex-wrap items-center gap-1 pt-1">
                            <span className="text-[10px] text-emerald-700 font-semibold">Matched:</span>
                            {r.matchedTech.map((tech) => (
                              <span
                                key={tech}
                                className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 font-mono"
                              >
                                {tech}
                              </span>
                            ))}
                          </div>
                        )}

                        <p className="text-[11px] text-slate-500 italic">
                          {r.summary}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB 3: KEY STRENGTHS & SKILL GAPS */}
            {activeTab === "insights" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Strengths Card */}
                <div className="p-5 sm:p-6 rounded-2xl bg-white border border-emerald-200 shadow-xs space-y-4">
                  <div className="flex items-center gap-2 pb-3 border-b border-emerald-100">
                    <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                      <Award className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-emerald-950">
                        Your Competitive Strengths
                      </h3>
                      <p className="text-[11px] text-emerald-700">
                        Where your profile gives you a distinct advantage
                      </p>
                    </div>
                  </div>

                  <ul className="space-y-2.5">
                    {comparison.keyStrengths.map((str, idx) => (
                      <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-800">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span className="leading-relaxed">{str}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Gaps Card */}
                <div className="p-5 sm:p-6 rounded-2xl bg-white border border-rose-200 shadow-xs space-y-4">
                  <div className="flex items-center gap-2 pb-3 border-b border-rose-100">
                    <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center">
                      <TrendingUp className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-rose-950">
                        Priority Gaps to Address
                      </h3>
                      <p className="text-[11px] text-rose-700">
                        Target areas to brush up on before campus interview rounds
                      </p>
                    </div>
                  </div>

                  <ul className="space-y-2.5">
                    {comparison.skillGaps.map((gap, idx) => (
                      <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-800">
                        <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                        <span className="leading-relaxed">{gap}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* TAB 4: INTERVIEW PREPARATION & RELEVANT PROJECTS */}
            {activeTab === "prep" && (
              <div className="space-y-6">
                {/* Relevant Projects */}
                <div className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 font-heading">
                      Profile Projects to Highlight for this JD
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Present these specific projects during your interview to directly answer the job requirements.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {comparison.relevantProjects.map((p, idx) => (
                      <div
                        key={idx}
                        className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2"
                      >
                        <div className="text-xs font-bold text-slate-900">
                          {p.projectTitle}
                        </div>
                        <p className="text-xs text-slate-600 leading-relaxed">
                          {p.alignmentReason}
                        </p>
                        {p.relevantSkills && p.relevantSkills.length > 0 && (
                          <div className="flex flex-wrap gap-1 pt-1">
                            {p.relevantSkills.map((s) => (
                              <span
                                key={s}
                                className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200"
                              >
                                {s}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Tailored Interview Questions */}
                <div className="p-5 sm:p-6 rounded-2xl bg-white border border-indigo-200 shadow-xs space-y-4">
                  <div className="flex items-center gap-2 pb-3 border-b border-indigo-100">
                    <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
                      <HelpCircle className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-indigo-950">
                        Tailored Interview Practice Questions
                      </h3>
                      <p className="text-[11px] text-indigo-700">
                        Questions recruiters are most likely to ask based on this JD and your specific profile
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {comparison.interviewPrep.suggestedQuestions.map((q, idx) => (
                      <div
                        key={idx}
                        className="p-3.5 rounded-xl bg-indigo-50/50 border border-indigo-100 text-xs text-slate-800 space-y-1"
                      >
                        <div className="font-bold text-indigo-950 flex items-center gap-1.5">
                          <span className="w-5 h-5 rounded-full bg-indigo-200 text-indigo-800 text-[10px] flex items-center justify-center font-mono">
                            {idx + 1}
                          </span>
                          <span>{q}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Action items */}
                  <div className="mt-4 pt-4 border-t border-indigo-100">
                    <h4 className="text-xs font-bold text-slate-800 mb-2">
                      Checklist Before Interview:
                    </h4>
                    <ul className="space-y-1.5 text-xs text-slate-600">
                      {comparison.interviewPrep.actionItems.map((act, i) => (
                        <li key={i} className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-indigo-600" />
                          <span>{act}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};
