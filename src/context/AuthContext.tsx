import React, { createContext, useContext, useEffect, useState, useMemo } from "react";
import { User, Session, AuthError } from "@supabase/supabase-js";
import { supabase, isSupabaseConfigured } from "@/lib/supabaseClient";
import {
  isCollegeEmail,
  parseStudentEmail,
  getEmailValidationError,
  ParsedStudentInfo,
} from "@/lib/authUtils";
import { StudentResume } from "@/types/resume";
import { CandidateProfile } from "@/types/candidateProfile";
import {
  saveResumeToDatabase,
  loadResumeFromDatabase,
  deleteResumeFromDatabase,
} from "@/lib/resumeService";
import {
  extractResumeText,
  parseResumeWithLLM,
  saveCandidateProfileToDatabase,
  loadCandidateProfileFromDatabase,
} from "@/lib/resumeParserService";

export interface StudentAuthContextType {
  user: User | null;
  session: Session | null;
  student: ParsedStudentInfo | null;
  resume: StudentResume | null;
  candidateProfile: CandidateProfile | null;
  isResumeLoading: boolean;
  isParsingResume: boolean;
  parsingStatus: string;
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
  uploadResume: (file: File) => Promise<{ success: boolean; resume?: StudentResume; error?: string }>;
  deleteResume: () => Promise<{ success: boolean; error?: string }>;
  reloadResume: (currentUser?: User | null) => Promise<void>;
  updateProfile: (profile: CandidateProfile) => Promise<{ success: boolean; error?: string }>;
  parseAndAutofillResume: (file: File) => Promise<{ success: boolean; profile?: CandidateProfile; error?: string }>;
}

const AuthContext = createContext<StudentAuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [resume, setResume] = useState<StudentResume | null>(null);
  const [candidateProfile, setCandidateProfile] = useState<CandidateProfile | null>(null);
  const [isResumeLoading, setIsResumeLoading] = useState<boolean>(false);
  const [isParsingResume, setIsParsingResume] = useState<boolean>(false);
  const [parsingStatus, setParsingStatus] = useState<string>("");
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

  // Reload resume and profile from database whenever authenticated user changes
  const reloadResume = React.useCallback(async (currentUser?: User | null) => {
    const targetUser = currentUser !== undefined ? currentUser : user;
    if (!targetUser) {
      setResume(null);
      setCandidateProfile(null);
      return;
    }
    setIsResumeLoading(true);
    try {
      const [loadedResume, loadedProfile] = await Promise.all([
        loadResumeFromDatabase(targetUser.id, targetUser.user_metadata),
        loadCandidateProfileFromDatabase(targetUser.id, targetUser.user_metadata),
      ]);
      setResume(loadedResume);
      setCandidateProfile(loadedProfile);
    } catch (err) {
      console.warn("Resume/profile fetch caught error:", err);
    } finally {
      setIsResumeLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user?.id) {
      reloadResume(user);
    } else {
      setResume(null);
      setCandidateProfile(null);
    }
  }, [user, reloadResume]);

  // Parse resume and autofill profile features using LLM + 12 RADIX categories
  const parseAndAutofillResume = async (file: File) => {
    if (!user || !user.email) {
      return { success: false, error: "Please log in with your college account to extract resume details." };
    }
    setIsParsingResume(true);
    setParsingStatus("Extracting raw document text...");
    try {
      // 1. Direct text extraction with OCR fallback
      const { text, source } = await extractResumeText(file, (msg) => setParsingStatus(msg));

      // 2. Feed text into OpenRouter LLM mapping to 12 RADIX categories + named tech
      setParsingStatus("Analyzing resume & mapping skills to 12 RADIX categories...");
      const profile = await parseResumeWithLLM(
        text,
        {
          userId: user.id,
          userEmail: user.email,
          studentName: student?.username,
          branchName: student?.branchName,
        },
        file.name,
        (msg) => setParsingStatus(msg)
      );

      profile.extractionSource = source;

      // 3. Save to database & cache
      setParsingStatus("Saving autofilled profile features to database...");
      await saveCandidateProfileToDatabase(profile);

      setCandidateProfile(profile);
      setParsingStatus("");
      return { success: true, profile };
    } catch (err: any) {
      console.error("Resume extraction/parsing error:", err);
      setParsingStatus("");
      return { success: false, error: err.message || "Failed to parse resume." };
    } finally {
      setIsParsingResume(false);
      setParsingStatus("");
    }
  };

  // Upload and persist resume, then automatically extract and autofill profile features
  const uploadResume = async (file: File) => {
    if (!user || !user.email) {
      return { success: false, error: "Please log in with your college account to upload a resume." };
    }
    setIsResumeLoading(true);
    try {
      // Step 1: Save resume file to database
      const result = await saveResumeToDatabase(user.id, user.email, file);
      if (result.success && result.resume) {
        setResume(result.resume);

        // Step 2: Automatically extract text and autofill candidate profile
        parseAndAutofillResume(file).catch((err) => {
          console.warn("Autofill background error:", err);
        });
      }
      return result;
    } finally {
      setIsResumeLoading(false);
    }
  };

  // Update profile manually (e.g. edits by student)
  const updateProfile = async (profile: CandidateProfile) => {
    if (!user) {
      return { success: false, error: "Not logged in." };
    }
    try {
      const res = await saveCandidateProfileToDatabase(profile);
      if (res.success) {
        setCandidateProfile(profile);
      }
      return res;
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  };

  // Remove resume
  const deleteResume = async () => {
    if (!user) {
      return { success: false, error: "Please log in to manage your resume." };
    }
    setIsResumeLoading(true);
    try {
      const result = await deleteResumeFromDatabase(user.id);
      if (result.success) {
        setResume(null);
      }
      return result;
    } finally {
      setIsResumeLoading(false);
    }
  };

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
      setResume(null);
      setCandidateProfile(null);
      return { error };
    } catch (err: any) {
      setUser(null);
      setSession(null);
      setResume(null);
      setCandidateProfile(null);
      return { error: err };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        student,
        resume,
        candidateProfile,
        isResumeLoading,
        isParsingResume,
        parsingStatus,
        isLoading,
        isCollegeAuthorized,
        signInWithPassword,
        signUpWithPassword,
        signInWithOtp,
        verifyOtp,
        resetPasswordForEmail,
        signOut,
        uploadResume,
        deleteResume,
        reloadResume,
        updateProfile,
        parseAndAutofillResume,
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
