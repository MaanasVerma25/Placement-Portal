import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import {
  GraduationCap,
  Mail,
  Lock,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Building,
  ShieldAlert,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import {
  COLLEGE_DOMAIN,
  COLLEGE_DOMAIN_DISPLAY,
  parseStudentEmail,
  getEmailValidationError,
} from "@/lib/authUtils";
import { toast } from "sonner";

type AuthMode = "signin" | "signup" | "magiclink" | "forgot";

const SAMPLE_STUDENTS = [
  { id: "j25cse108@jssuninoida.edu.in", label: "CSE 2025 (j25cse108)" },
  { id: "j24aiml042@jssuninoida.edu.in", label: "AIML 2024 (j24aiml042)" },
  { id: "j23it089@jssuninoida.edu.in", label: "IT 2023 (j23it089)" },
];

export const AuthPage: React.FC = () => {
  const { user, signInWithPassword, signUpWithPassword, signInWithOtp, resetPasswordForEmail } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [mode, setMode] = useState<AuthMode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // If already logged in, redirect
  useEffect(() => {
    if (user) {
      const searchParams = new URLSearchParams(location.search);
      const redirectTo = searchParams.get("redirect") || "/";
      navigate(redirectTo, { replace: true });
    }
  }, [user, navigate, location.search]);

  // Real-time student info parse
  const parsedStudent = parseStudentEmail(email);
  const validationError = email.length > 5 ? getEmailValidationError(email) : null;
  const isDomainWrong = email.includes("@") && !email.toLowerCase().endsWith(`@${COLLEGE_DOMAIN}`);

  const appendDomain = () => {
    if (!email) {
      setEmail(`j25cse108@${COLLEGE_DOMAIN}`);
      return;
    }
    const cleanUsername = email.split("@")[0].trim();
    setEmail(`${cleanUsername}@${COLLEGE_DOMAIN}`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMessage(null);

    const emailErr = getEmailValidationError(email);
    if (emailErr) {
      setStatusMessage({ type: "error", text: emailErr });
      toast.error("Email Authorization Error", { description: emailErr });
      return;
    }

    setIsSubmitting(true);

    try {
      if (mode === "signin") {
        if (!password) {
          setStatusMessage({ type: "error", text: "Please enter your password." });
          setIsSubmitting(false);
          return;
        }

        const { error } = await signInWithPassword(email, password);
        if (error) {
          const msg = error.message || "Failed to sign in. Please verify your credentials.";
          setStatusMessage({ type: "error", text: msg });
          toast.error("Sign In Failed", { description: msg });
        } else {
          toast.success("Welcome back!", {
            description: `Logged in as ${email}`,
          });
          const searchParams = new URLSearchParams(location.search);
          navigate(searchParams.get("redirect") || "/");
        }
      } else if (mode === "signup") {
        if (!password || password.length < 6) {
          setStatusMessage({ type: "error", text: "Password must be at least 6 characters long." });
          setIsSubmitting(false);
          return;
        }

        const { error, user: newUser } = await signUpWithPassword(email, password, fullName);
        if (error) {
          const msg = error.message || "Failed to create account.";
          setStatusMessage({ type: "error", text: msg });
          toast.error("Registration Failed", { description: msg });
        } else {
          const confirmationRequired = newUser && !newUser.confirmed_at && newUser.identities?.length;
          if (confirmationRequired) {
            setStatusMessage({
              type: "success",
              text: `Verification link sent to ${email}. Please check your college inbox to confirm your account.`,
            });
            toast.success("Account Created!", {
              description: `Verification link sent to ${email}`,
            });
          } else {
            toast.success("Account created and verified!", {
              description: `Welcome to JSS Placement Hub`,
            });
            navigate("/");
          }
        }
      } else if (mode === "magiclink") {
        const { error } = await signInWithOtp(email);
        if (error) {
          const msg = error.message || "Failed to send magic link.";
          setStatusMessage({ type: "error", text: msg });
          toast.error("Magic Link Failed", { description: msg });
        } else {
          setStatusMessage({
            type: "success",
            text: `Magic sign-in link dispatched to ${email}. Click the link in your college mailbox to log in instantly.`,
          });
          toast.success("Magic Link Dispatched", {
            description: `Check your inbox at ${email}`,
          });
        }
      } else if (mode === "forgot") {
        const { error } = await resetPasswordForEmail(email);
        if (error) {
          const msg = error.message || "Failed to send password reset.";
          setStatusMessage({ type: "error", text: msg });
          toast.error("Reset Failed", { description: msg });
        } else {
          setStatusMessage({
            type: "success",
            text: `Password recovery instructions sent to ${email}. Check your college mail to set a new password.`,
          });
          toast.success("Recovery Email Sent", {
            description: `Check ${email}`,
          });
        }
      }
    } catch (err: any) {
      const msg = err.message || "An unexpected error occurred.";
      setStatusMessage({ type: "error", text: msg });
      toast.error("Error", { description: msg });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between selection:bg-blue-500 selection:text-white">
      {/* Top Simple Navigation */}
      <nav className="h-16 px-4 sm:px-8 border-b border-slate-200 bg-white flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-xs">
            JSS
          </div>
          <div className="flex flex-col text-left">
            <span className="font-heading font-extrabold text-sm tracking-wider text-slate-900 group-hover:text-blue-600 transition-colors">
              JSS UNIVERSITY
            </span>
            <span className="text-[10px] font-bold text-blue-600 tracking-wider">
              PLACEMENT INTELLIGENCE PORTAL
            </span>
          </div>
        </Link>

        <Link
          to="/"
          className="text-xs font-semibold text-slate-600 hover:text-blue-600 transition-colors"
        >
          ← Return to Directory
        </Link>
      </nav>

      {/* Main Authentication Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-8 sm:py-12 flex items-center justify-center">
        <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Column: College Identity & Live Student Badge Preview */}
          <div className="lg:col-span-5 space-y-6 text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
              <GraduationCap className="w-4 h-4 text-blue-600" />
              <span>Student Authentication Portal</span>
            </div>

            <div>
              <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Sign in with your College ID
              </h1>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                Access verified campus recruitment intelligence, skill ladders, and hiring analytics reserved exclusively for JSS University students.
              </p>
            </div>

            {/* Email Pattern Notice Box */}
            <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-start gap-2.5">
                <Building className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
                <div className="text-xs">
                  <span className="font-bold text-slate-900 block">Restricted Student Access</span>
                  <p className="text-slate-500 mt-0.5">
                    Authentication is strictly limited to active college email addresses:
                  </p>
                  <code className="mt-1.5 inline-block font-mono text-[11px] px-2 py-0.5 rounded bg-blue-50 text-blue-800 font-semibold border border-blue-100">
                    username{COLLEGE_DOMAIN_DISPLAY}
                  </code>
                </div>
              </div>

              {/* Sample Helper Chips */}
              <div className="pt-2 border-t border-slate-100">
                <span className="text-[11px] font-semibold text-slate-400 block mb-1.5">
                  Sample Student Format:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {SAMPLE_STUDENTS.map((sample) => (
                    <button
                      key={sample.id}
                      type="button"
                      onClick={() => setEmail(sample.id)}
                      className="text-[11px] font-mono px-2 py-1 rounded-md bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-700 border border-slate-200 transition-colors"
                    >
                      {sample.id.split("@")[0]}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Live Student Identity Card Preview */}
            <div
              className={`p-4 rounded-xl border transition-all duration-300 ${
                parsedStudent.isValidStudentFormat
                  ? "bg-gradient-to-br from-blue-900 to-indigo-950 text-white border-blue-800 shadow-md"
                  : "bg-slate-100/70 border-dashed border-slate-300 text-slate-500"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider">
                  {parsedStudent.isValidStudentFormat ? "Student Card Preview" : "Live ID Detector"}
                </span>
                {parsedStudent.isValidStudentFormat ? (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                    <CheckCircle2 className="w-3 h-3" /> JSS Verified
                  </span>
                ) : (
                  <span className="text-[10px] text-slate-400">Awaiting input</span>
                )}
              </div>

              {parsedStudent.isValidStudentFormat ? (
                <div className="mt-3 space-y-1.5">
                  <div className="font-heading font-bold text-base text-white">
                    {fullName || parsedStudent.username.toUpperCase()}
                  </div>
                  <div className="text-xs text-blue-200 font-medium">
                    {parsedStudent.branchName}
                  </div>
                  <div className="pt-2 flex items-center justify-between text-[11px] text-blue-300 border-t border-blue-800/80">
                    <span>Roll No: #{parsedStudent.rollNumber}</span>
                    <span>Batch: {parsedStudent.batchYears}</span>
                  </div>
                </div>
              ) : (
                <p className="mt-2 text-xs text-slate-400">
                  Type your student ID (e.g. <span className="font-mono text-slate-600 font-semibold">j25cse108@jssuninoida.edu.in</span>) to preview your credentials.
                </p>
              )}
            </div>
          </div>

          {/* Right Column: Authentication Card */}
          <div className="lg:col-span-7">
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xl shadow-slate-200/40 p-6 sm:p-8">
              {/* Navigation Tabs */}
              <div className="flex border-b border-slate-200 mb-6">
                <button
                  type="button"
                  onClick={() => {
                    setMode("signin");
                    setStatusMessage(null);
                  }}
                  className={`pb-3 text-xs sm:text-sm font-semibold transition-colors relative mr-6 ${
                    mode === "signin"
                      ? "text-blue-600 border-b-2 border-blue-600 -mb-px"
                      : "text-slate-500 hover:text-slate-900"
                  }`}
                >
                  Student Sign In
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMode("signup");
                    setStatusMessage(null);
                  }}
                  className={`pb-3 text-xs sm:text-sm font-semibold transition-colors relative mr-6 ${
                    mode === "signup"
                      ? "text-blue-600 border-b-2 border-blue-600 -mb-px"
                      : "text-slate-500 hover:text-slate-900"
                  }`}
                >
                  Register Account
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMode("magiclink");
                    setStatusMessage(null);
                  }}
                  className={`pb-3 text-xs sm:text-sm font-semibold transition-colors relative ${
                    mode === "magiclink"
                      ? "text-blue-600 border-b-2 border-blue-600 -mb-px"
                      : "text-slate-500 hover:text-slate-900"
                  }`}
                >
                  Magic Link
                </button>
              </div>

              {/* Status Alert Banner */}
              {statusMessage && (
                <div
                  className={`mb-5 p-3.5 rounded-xl text-xs sm:text-sm flex items-start gap-2.5 ${
                    statusMessage.type === "success"
                      ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                      : "bg-rose-50 text-rose-800 border border-rose-200"
                  }`}
                >
                  {statusMessage.type === "success" ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  )}
                  <span className="leading-relaxed">{statusMessage.text}</span>
                </div>
              )}

              {/* Invalid domain warning banner */}
              {isDomainWrong && (
                <div className="mb-5 p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2">
                  <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold block">Non-College Domain Detected</span>
                    Only emails ending with <span className="font-mono font-bold">{COLLEGE_DOMAIN_DISPLAY}</span> are permitted.
                    <button
                      type="button"
                      onClick={appendDomain}
                      className="ml-2 font-bold text-amber-700 underline hover:text-amber-900"
                    >
                      Fix domain
                    </button>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4 text-left">
                {/* Full Name field for registration */}
                {mode === "signup" && (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                      Student Full Name
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="e.g. Aryan Sharma"
                        className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-colors"
                        required
                      />
                    </div>
                  </div>
                )}

                {/* College Email Input */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                      College Email Address
                    </label>
                    {!email.endsWith(COLLEGE_DOMAIN) && email.length > 0 && (
                      <button
                        type="button"
                        onClick={appendDomain}
                        className="text-[11px] font-semibold text-blue-600 hover:text-blue-800"
                      >
                        + Add {COLLEGE_DOMAIN_DISPLAY}
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={`j25cse108@${COLLEGE_DOMAIN}`}
                      className={`w-full pl-10 pr-3.5 py-2.5 rounded-lg border text-sm font-mono focus:outline-none focus:ring-2 transition-colors ${
                        validationError
                          ? "border-rose-300 focus:ring-rose-500/20 focus:border-rose-500 text-rose-900"
                          : "border-slate-300 focus:ring-blue-500/20 focus:border-blue-600 text-slate-900"
                      }`}
                      required
                    />
                  </div>
                  {validationError && (
                    <p className="mt-1 text-[11px] text-rose-600 font-medium">
                      {validationError}
                    </p>
                  )}
                </div>

                {/* Password Input for signin / signup */}
                {(mode === "signin" || mode === "signup") && (
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                        Password
                      </label>
                      {mode === "signin" && (
                        <button
                          type="button"
                          onClick={() => {
                            setMode("forgot");
                            setStatusMessage(null);
                          }}
                          className="text-[11px] font-semibold text-blue-600 hover:text-blue-800"
                        >
                          Forgot Password?
                        </button>
                      )}
                    </div>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                      <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-10 pr-10 py-2.5 rounded-lg border border-slate-300 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-colors"
                        required
                        minLength={6}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600 focus:outline-none"
                        aria-label="Toggle password visibility"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {mode === "signup" && (
                      <p className="mt-1 text-[11px] text-slate-500">
                        Minimum 6 characters. Use a secure password.
                      </p>
                    )}
                  </div>
                )}

                {/* Submit Action Button */}
                <button
                  type="submit"
                  disabled={isSubmitting || Boolean(validationError)}
                  className="w-full mt-2 py-3 px-4 rounded-xl font-heading font-bold text-sm text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 transition-all"
                >
                  {isSubmitting ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      {mode === "signin" && "Sign In with College ID"}
                      {mode === "signup" && "Register Student Account"}
                      {mode === "magiclink" && "Send Magic Login Link"}
                      {mode === "forgot" && "Send Password Reset Link"}
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              {/* Mode Footer Switchers */}
              <div className="mt-6 pt-5 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
                {mode === "signin" && (
                  <>
                    <span>Don't have an account yet?</span>
                    <button
                      type="button"
                      onClick={() => setMode("signup")}
                      className="font-bold text-blue-600 hover:text-blue-800"
                    >
                      Create student account →
                    </button>
                  </>
                )}

                {mode === "signup" && (
                  <>
                    <span>Already have an account?</span>
                    <button
                      type="button"
                      onClick={() => setMode("signin")}
                      className="font-bold text-blue-600 hover:text-blue-800"
                    >
                      Sign in here →
                    </button>
                  </>
                )}

                {(mode === "magiclink" || mode === "forgot") && (
                  <button
                    type="button"
                    onClick={() => setMode("signin")}
                    className="font-bold text-blue-600 hover:text-blue-800 mx-auto"
                  >
                    ← Back to standard Sign In
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer Info */}
      <footer className="py-4 border-t border-slate-200 bg-white text-center text-xs text-slate-500">
        <span>JSS Academy of Higher Education & Research / JSS University Noida</span>
        <span className="mx-2">•</span>
        <span>Secure Student Placement Portal</span>
      </footer>
    </div>
  );
};
