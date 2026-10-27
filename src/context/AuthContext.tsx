import React, { createContext, useContext, useEffect, useState, useMemo } from "react";
import { User, Session, AuthError } from "@supabase/supabase-js";
import { supabase, isSupabaseConfigured } from "@/lib/supabaseClient";
import {
  isCollegeEmail,
  parseStudentEmail,
  getEmailValidationError,
  ParsedStudentInfo,
} from "@/lib/authUtils";

export interface StudentAuthContextType {
  user: User | null;
  session: Session | null;
  student: ParsedStudentInfo | null;
  isLoading: boolean;
  isCollegeAuthorized: boolean;
  signInWithPassword: (email: string, password: string) => Promise<{ error: AuthError | Error | null }>;
  signUpWithPassword: (
    email: string,
    password: string,
    fullName?: string
  ) => Promise<{ error: AuthError | Error | null; user: User | null }>;
  signInWithOtp: (email: string) => Promise<{ error: AuthError | Error | null }>;
  verifyOtp: (
    email: string,
    token: string,
    type?: "email" | "signup" | "magiclink"
  ) => Promise<{ error: AuthError | Error | null }>;
  resetPasswordForEmail: (email: string) => Promise<{ error: AuthError | Error | null }>;
  signOut: () => Promise<{ error: AuthError | Error | null }>;
}

const AuthContext = createContext<StudentAuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Derived student information
  const student = useMemo(() => {
    if (!user?.email) return null;
    return parseStudentEmail(user.email);
  }, [user]);

  const isCollegeAuthorized = Boolean(user?.email && isCollegeEmail(user.email));

  useEffect(() => {
    let mounted = true;

    // Safety check for active session on load
    const initializeAuth = async () => {
      try {
        if (!isSupabaseConfigured) {
          setIsLoading(false);
          return;
        }

        const { data, error } = await supabase.auth.getSession();
        if (error) {
          console.error("Supabase getSession error:", error);
        }

        if (mounted) {
          const currentSession = data.session;
          if (currentSession?.user?.email) {
            // Verify college domain enforcement
            if (!isCollegeEmail(currentSession.user.email)) {
              console.warn("Unauthorized domain detected. Logging out.");
              await supabase.auth.signOut();
              setUser(null);
              setSession(null);
            } else {
              setSession(currentSession);
              setUser(currentSession.user);
            }
          } else {
            setSession(null);
            setUser(null);
          }
          setIsLoading(false);
        }
      } catch (err) {
        console.error("Auth init exception:", err);
        if (mounted) setIsLoading(false);
      }
    };

    initializeAuth();

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
      if (newSession?.user?.email) {
        if (!isCollegeEmail(newSession.user.email)) {
          console.warn("Domain check failed during auth change. Signing out.");
          await supabase.auth.signOut();
          setUser(null);
          setSession(null);
        } else {
          setSession(newSession);
          setUser(newSession.user);
        }
      } else {
        setSession(null);
        setUser(null);
      }
      setIsLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // Sign in using email and password
  const signInWithPassword = async (email: string, password: string) => {
    const validationError = getEmailValidationError(email);
    if (validationError) {
      return { error: new Error(validationError) };
    }

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });

      return { error };
    } catch (err: any) {
      return { error: err };
    }
  };

  // Sign up using college email and password
  const signUpWithPassword = async (email: string, password: string, fullName?: string) => {
    const validationError = getEmailValidationError(email);
    if (validationError) {
      return { error: new Error(validationError), user: null };
    }

    const parsedInfo = parseStudentEmail(email);

    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
        options: {
          data: {
            full_name: fullName || parsedInfo.displayName || parsedInfo.username,
            branch_code: parsedInfo.branchCode || null,
            branch_name: parsedInfo.branchName || null,
            roll_number: parsedInfo.rollNumber || null,
            batch_years: parsedInfo.batchYears || null,
            admission_year: parsedInfo.admissionYear || null,
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      return { error, user: data.user };
    } catch (err: any) {
      return { error: err, user: null };
    }
  };

  // Send Magic Link / OTP to College Email
  const signInWithOtp = async (email: string) => {
    const validationError = getEmailValidationError(email);
    if (validationError) {
      return { error: new Error(validationError) };
    }

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim().toLowerCase(),
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      return { error };
    } catch (err: any) {
      return { error: err };
    }
  };

  // Verify 6-digit OTP code if user is using OTP verification
  const verifyOtp = async (
    email: string,
    token: string,
    type: "email" | "signup" | "magiclink" = "email"
  ) => {
    try {
      const { error } = await supabase.auth.verifyOtp({
        email: email.trim().toLowerCase(),
        token: token.trim(),
        type,
      });

      return { error };
    } catch (err: any) {
      return { error: err };
    }
  };

  // Password reset request
  const resetPasswordForEmail = async (email: string) => {
    const validationError = getEmailValidationError(email);
    if (validationError) {
      return { error: new Error(validationError) };
    }

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(
        email.trim().toLowerCase(),
        {
          redirectTo: `${window.location.origin}/auth/callback?type=recovery`,
        }
      );
      return { error };
    } catch (err: any) {
      return { error: err };
    }
  };

  // Sign out
  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      setUser(null);
      setSession(null);
      return { error };
    } catch (err: any) {
      setUser(null);
      setSession(null);
      return { error: err };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        student,
        isLoading,
        isCollegeAuthorized,
        signInWithPassword,
        signUpWithPassword,
        signInWithOtp,
        verifyOtp,
        resetPasswordForEmail,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
