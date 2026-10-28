import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import {
  Mail,
  Lock,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  ShieldAlert,
  ArrowLeft,
  User,
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
  { id: "j25cse108@jssuninoida.edu.in", label: "j25cse108" },
  { id: "j24aiml042@jssuninoida.edu.in", label: "j24aiml042" },
  { id: "j23it089@jssuninoida.edu.in", label: "j23it089" },
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
      if (sessionStorage.getItem("just_created_account") === "true") {
        sessionStorage.removeItem("just_created_account");
        navigate("/profile?onboarding=true&new=true", { replace: true });
        return;
      }
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

        sessionStorage.setItem("just_created_account", "true");
        const { error, user: newUser } = await signUpWithPassword(email, password, fullName);
        if (error) {
          sessionStorage.removeItem("just_created_account");
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
              description: `Welcome! Setting up your placement profile`,
            });
            navigate("/profile?onboarding=true&new=true");
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
    <div className="min-h-screen bg-[#f5f5f7] text-[#1d1d1f] font-body flex flex-col justify-between selection:bg-[#0071e3] selection:text-white">
      {/* Slim Top Navigation */}
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-[#d2d2d7]">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <img
              src="/jss-logo.png"
              alt="JSS University Logo"
              className="w-8 h-8 rounded-[8px] object-contain shadow-xs select-none"
            />
            <div className="flex flex-col text-left">
              <span className="font-heading font-semibold text-[15px] tracking-tight text-[#1d1d1f] leading-none">
                JSS UNIVERSITY
              </span>
              <span className="text-[11px] text-[#6e6e73] font-normal tracking-normal mt-0.5">
                Placement Intelligence Hub
              </span>
            </div>
          </Link>

          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-[14px] font-medium text-[#0071e3] hover:text-[#0077ed] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3]"
          >
            <ArrowLeft className="w-4 h-4" aria-hidden="true" />
            <span>Return to Directory</span>
          </Link>
        </div>
      </header>

      {/* Main Centered White Form Panel */}
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="max-w-[480px] w-full bg-white rounded-[18px] border border-[#d2d2d7] p-8 sm:p-10 shadow-[0_2px_12px_rgba(0,0,0,0.04)] text-left">
          {/* Header & Title */}
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-3">
              <img
                src="/jss-logo.png"
                alt="JSS University Logo"
                className="w-10 h-10 rounded-[8px] object-contain shadow-xs"
              />
              <div>
                <p className="text-[13px] font-semibold text-[#1d1d1f] tracking-tight">
                  JSS UNIVERSITY NOIDA
                </p>
                <p className="text-[11px] text-[#6e6e73]">
                  Placement Intelligence Portal
                </p>
              </div>
            </div>
            <h1 className="text-[28px] font-semibold text-[#1d1d1f] tracking-tight leading-tight">
              Sign in with your College ID
            </h1>
            <p className="text-[14px] text-[#6e6e73] mt-2 leading-relaxed">
              Access verified campus recruitment intelligence and skill roadmaps reserved for JSS University students.
            </p>
          </div>

          {/* Segmented Control Tabs */}
          <div
            role="tablist"
            aria-label="Authentication mode"
            className="p-1 rounded-[12px] bg-[#f5f5f7] border border-[#d2d2d7] grid grid-cols-3 gap-1 mb-6"
          >
            <button
              type="button"
              role="tab"
              aria-selected={mode === "signin"}
              onClick={() => {
                setMode("signin");
                setStatusMessage(null);
              }}
              className={`py-1.5 text-[13px] rounded-[8px] transition-all select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3] ${
                mode === "signin"
                  ? "bg-white text-[#1d1d1f] font-medium shadow-[0_1px_3px_rgba(0,0,0,0.08)]"
                  : "text-[#6e6e73] hover:text-[#1d1d1f] font-normal"
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={mode === "signup"}
              onClick={() => {
                setMode("signup");
                setStatusMessage(null);
              }}
              className={`py-1.5 text-[13px] rounded-[8px] transition-all select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3] ${
                mode === "signup"
                  ? "bg-white text-[#1d1d1f] font-medium shadow-[0_1px_3px_rgba(0,0,0,0.08)]"
                  : "text-[#6e6e73] hover:text-[#1d1d1f] font-normal"
              }`}
            >
              Register
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={mode === "magiclink"}
              onClick={() => {
                setMode("magiclink");
                setStatusMessage(null);
              }}
              className={`py-1.5 text-[13px] rounded-[8px] transition-all select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3] ${
                mode === "magiclink"
                  ? "bg-white text-[#1d1d1f] font-medium shadow-[0_1px_3px_rgba(0,0,0,0.08)]"
                  : "text-[#6e6e73] hover:text-[#1d1d1f] font-normal"
              }`}
            >
              Magic Link
            </button>
          </div>

          {/* College Domain Requirement & Sample Accounts */}
          <div className="p-3.5 bg-[#f5f5f7] rounded-[12px] border border-[#d2d2d7] mb-6 text-[13px] space-y-2">
            <p className="text-[#1d1d1f] font-medium">
              Restricted Student Access
            </p>
            <p className="text-[#6e6e73] leading-relaxed">
              Authentication is strictly limited to college email addresses ending with{" "}
              <code className="font-mono text-[12px] text-[#0071e3] bg-white px-1.5 py-0.5 rounded border border-[#d2d2d7]">
                {COLLEGE_DOMAIN_DISPLAY}
              </code>
            </p>
            <div className="pt-2 border-t border-[#e2e2e7] flex items-center gap-1.5 flex-wrap">
              <span className="text-[11px] text-[#6e6e73]">Quick fill:</span>
              {SAMPLE_STUDENTS.map((sample) => (
                <button
                  key={sample.id}
                  type="button"
                  onClick={() => setEmail(sample.id)}
                  className="text-[11px] font-mono px-2 py-0.5 rounded bg-white hover:bg-slate-50 text-[#1d1d1f] border border-[#d2d2d7] transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#0071e3]"
                >
                  {sample.label}
                </button>
              ))}
            </div>
          </div>

          {/* Live Student Card Preview */}
          {parsedStudent.isValidStudentFormat && (
            <div className="p-3.5 rounded-[12px] bg-[#eef8f1] border border-[#d0edd8] text-[13px] text-[#248a3d] mb-6 flex items-start gap-2.5">
              <img
                src="/jss-logo.png"
                alt="JSS"
                className="w-5 h-5 rounded object-contain mt-0.5 shrink-0"
              />
              <div>
                <span className="font-semibold block">JSS Verified Student Identity</span>
                <span className="text-[12px] opacity-90 block mt-0.5">
                  {parsedStudent.branchName} · Roll #{parsedStudent.rollNumber} · Batch {parsedStudent.batchYears}
                </span>
              </div>
            </div>
          )}

          {/* Status Message Alert */}
          {statusMessage && (
            <div
              className={`mb-5 p-3.5 rounded-[12px] text-[13px] flex items-start gap-2.5 ${
                statusMessage.type === "success"
                  ? "bg-[#eef8f1] text-[#248a3d] border border-[#d0edd8]"
                  : "bg-rose-50 text-rose-700 border border-rose-200"
              }`}
            >
              {statusMessage.type === "success" ? (
                <CheckCircle2 className="w-4 h-4 text-[#248a3d] shrink-0 mt-0.5" aria-hidden="true" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" aria-hidden="true" />
              )}
              <span className="leading-relaxed">{statusMessage.text}</span>
            </div>
          )}

          {/* Non-college domain warning banner */}
          {isDomainWrong && (
            <div className="mb-5 p-3 rounded-[12px] bg-amber-50 border border-amber-200 text-amber-900 text-[13px] flex items-start gap-2.5">
              <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" aria-hidden="true" />
              <div>
                <span className="font-medium block">Non-College Domain Detected</span>
                <span>Only emails ending with </span>
                <span className="font-mono font-semibold">{COLLEGE_DOMAIN_DISPLAY}</span>
                <span> are permitted.</span>
                <button
                  type="button"
                  onClick={appendDomain}
                  className="ml-2 font-medium text-[#0071e3] hover:underline focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#0071e3]"
                >
                  Fix domain
                </button>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Student Full Name for registration */}
            {mode === "signup" && (
              <div>
                <label className="block text-[13px] font-medium text-[#1d1d1f] mb-1.5">
                  Student Full Name
                </label>
                <div className="relative flex items-center">
                  <User className="w-4 h-4 text-[#6e6e73] absolute left-3.5 pointer-events-none" aria-hidden="true" />
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Aryan Sharma"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-[12px] bg-[#f5f5f7] border border-[#d2d2d7] text-[#1d1d1f] text-[14px] focus:outline-none focus:bg-white focus:border-[#0071e3] focus:ring-2 focus:ring-[#0071e3]/20 transition-all"
                    required
                  />
                </div>
              </div>
            )}

            {/* College Email Address */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-[13px] font-medium text-[#1d1d1f]">
                  College Email Address
                </label>
                {!email.endsWith(COLLEGE_DOMAIN) && email.length > 0 && (
                  <button
                    type="button"
                    onClick={appendDomain}
                    className="text-[12px] font-medium text-[#0071e3] hover:text-[#0077ed] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#0071e3]"
                  >
                    + Add {COLLEGE_DOMAIN_DISPLAY}
                  </button>
                )}
              </div>
              <div className="relative flex items-center">
                <Mail className="w-4 h-4 text-[#6e6e73] absolute left-3.5 pointer-events-none" aria-hidden="true" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={`j25cse108@${COLLEGE_DOMAIN}`}
                  className={`w-full pl-10 pr-3.5 py-2.5 rounded-[12px] bg-[#f5f5f7] border text-[14px] font-mono focus:outline-none focus:bg-white transition-all ${
                    validationError
                      ? "border-rose-400 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 text-rose-900"
                      : "border-[#d2d2d7] focus:border-[#0071e3] focus:ring-2 focus:ring-[#0071e3]/20 text-[#1d1d1f]"
                  }`}
                  required
                />
              </div>
              {validationError && (
                <p className="mt-1 text-[12px] text-rose-600 font-medium">
                  {validationError}
                </p>
              )}
            </div>

            {/* Password field for signin & signup */}
            {(mode === "signin" || mode === "signup") && (
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-[13px] font-medium text-[#1d1d1f]">
                    Password
                  </label>
                  {mode === "signin" && (
                    <button
                      type="button"
                      onClick={() => {
                        setMode("forgot");
                        setStatusMessage(null);
                      }}
                      className="text-[12px] font-medium text-[#0071e3] hover:text-[#0077ed] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#0071e3]"
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <div className="relative flex items-center">
                  <Lock className="w-4 h-4 text-[#6e6e73] absolute left-3.5 pointer-events-none" aria-hidden="true" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-2.5 rounded-[12px] bg-[#f5f5f7] border border-[#d2d2d7] text-[#1d1d1f] text-[14px] focus:outline-none focus:bg-white focus:border-[#0071e3] focus:ring-2 focus:ring-[#0071e3]/20 transition-all"
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 p-1 rounded-full text-[#6e6e73] hover:text-[#1d1d1f] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3]"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {mode === "signup" && (
                  <p className="mt-1 text-[12px] text-[#6e6e73]">
                    Must be at least 6 characters.
                  </p>
                )}
              </div>
            )}

            {/* Primary Action Blue Button */}
            <button
              type="submit"
              disabled={isSubmitting || Boolean(validationError)}
              className="w-full mt-4 h-[44px] rounded-[12px] bg-[#0071e3] hover:bg-[#0077ed] active:bg-[#006edb] disabled:opacity-50 disabled:cursor-not-allowed text-white text-[14px] font-medium transition-colors duration-150 flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3] focus-visible:ring-offset-2"
            >
              {isSubmitting ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  {mode === "signin" && "Sign In with College ID"}
                  {mode === "signup" && "Register Student Account"}
                  {mode === "magiclink" && "Send Magic Login Link"}
                  {mode === "forgot" && "Send Password Reset Link"}
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </>
              )}
            </button>
          </form>

          {/* Mode Footer Switchers */}
          <div className="mt-6 pt-5 border-t border-[#f0f0f2] text-center text-[13px] text-[#6e6e73]">
            {mode === "signin" && (
              <p>
                Don't have an account?{" "}
                <button
                  type="button"
                  onClick={() => setMode("signup")}
                  className="font-medium text-[#0071e3] hover:underline focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#0071e3]"
                >
                  Create student account
                </button>
              </p>
            )}

            {mode === "signup" && (
              <p>
                Already registered?{" "}
                <button
                  type="button"
                  onClick={() => setMode("signin")}
                  className="font-medium text-[#0071e3] hover:underline focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#0071e3]"
                >
                  Sign in here
                </button>
              </p>
            )}

            {(mode === "magiclink" || mode === "forgot") && (
              <button
                type="button"
                onClick={() => setMode("signin")}
                className="font-medium text-[#0071e3] hover:underline focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#0071e3]"
              >
                ← Back to standard Sign In
              </button>
            )}
          </div>
        </div>
      </main>

      {/* University Footer */}
      <footer className="border-t border-[#d2d2d7] bg-white py-6 text-center text-[12px] text-[#6e6e73]">
        <div className="max-w-[1200px] mx-auto px-4">
          <p>
            JSS Academy of Higher Education &amp; Research / JSS University Noida · Placement Intelligence Hub
          </p>
        </div>
      </footer>
    </div>
  );
};
