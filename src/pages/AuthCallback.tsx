import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import { CheckCircle2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { isCollegeEmail } from "@/lib/authUtils";

export const AuthCallback: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [status, setStatus] = useState<"verifying" | "success" | "error">("verifying");
  const [errorMessage, setErrorMessage] = useState<string>("");

  useEffect(() => {
    const handleAuthRedirect = async () => {
      try {
        // Supabase auto-detects hash and URL params in getSession() / exchangeCodeForSession()
        const { data, error } = await supabase.auth.getSession();

        if (error) {
          console.error("Auth callback error:", error);
          setStatus("error");
          setErrorMessage(error.message);
          toast.error("Authentication Error", { description: error.message });
          return;
        }

        const user = data?.session?.user;
        if (!user) {
          // Check if there is an auth code in the query params to exchange
          const params = new URLSearchParams(location.search);
          const code = params.get("code");
          if (code) {
            const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
            if (exchangeError) {
              setStatus("error");
              setErrorMessage(exchangeError.message);
              return;
            }
          }
        }

        // Re-check session
        const { data: updatedData } = await supabase.auth.getSession();
        const activeUser = updatedData?.session?.user;

        if (activeUser?.email) {
          if (!isCollegeEmail(activeUser.email)) {
            await supabase.auth.signOut();
            setStatus("error");
            setErrorMessage("Access denied: You must authenticate with an official @jssuninoida.edu.in email address.");
            toast.error("Unauthorized Domain", {
              description: "Only JSS University student accounts are permitted.",
            });
            return;
          }

          setStatus("success");
          toast.success("Authentication Verified!", {
            description: `Welcome ${activeUser.email}`,
          });

          // Redirect to portal home
          setTimeout(() => {
            navigate("/", { replace: true });
          }, 1200);
        } else {
          // No user found, go back to login
          navigate("/login", { replace: true });
        }
      } catch (err: any) {
        setStatus("error");
        setErrorMessage(err.message || "Failed to process authentication link.");
      }
    };

    handleAuthRedirect();
  }, [navigate, location]);

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-slate-50 border border-slate-200 rounded-2xl p-8 text-center shadow-lg">
        {status === "verifying" && (
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
            <h2 className="font-heading font-bold text-lg text-slate-900">
              Verifying College Credentials...
            </h2>
            <p className="text-xs text-slate-500">
              Validating your JSS University student session with Supabase.
            </p>
          </div>
        )}

        {status === "success" && (
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h2 className="font-heading font-bold text-lg text-slate-900">
              Authentication Confirmed
            </h2>
            <p className="text-xs text-slate-500">
              Redirecting you to the JSS Placement Intelligence Portal...
            </p>
          </div>
        )}

        {status === "error" && (
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h2 className="font-heading font-bold text-lg text-slate-900">
              Authentication Error
            </h2>
            <p className="text-xs text-rose-600 leading-relaxed">
              {errorMessage || "Unable to authenticate with college credentials."}
            </p>
            <button
              onClick={() => navigate("/login")}
              className="mt-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-lg transition-colors"
            >
              Back to Login
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
