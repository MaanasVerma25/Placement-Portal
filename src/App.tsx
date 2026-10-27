import React, { Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/context/AuthContext";
import { CompanyProvider } from "@/context/CompanyContext";
import { AppLayout } from "@/components/layout/AppLayout";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { Index } from "@/pages/Index";
import { AuthPage } from "@/pages/AuthPage";
import { AuthCallback } from "@/pages/AuthCallback";
import { CompanyIntelligence } from "@/pages/CompanyIntelligence";
import { SkillIntelligence } from "@/pages/SkillIntelligence";
import { CandidateProfilePage } from "@/pages/CandidateProfilePage";
import { NotFound } from "@/pages/NotFound";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 min
      gcTime: 10 * 60 * 1000, // 10 min
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster position="top-right" richColors />
        <AuthProvider>
          <CompanyProvider>
            <BrowserRouter>
              <Suspense
                fallback={
                  <div className="min-h-screen flex items-center justify-center bg-white">
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                      <span className="text-xs text-slate-500 font-medium">
                        Loading portal...
                      </span>
                    </div>
                  </div>
                }
              >
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/login" element={<AuthPage />} />
                  <Route path="/auth/callback" element={<AuthCallback />} />

                  <Route
                    path="/company"
                    element={
                      <ProtectedRoute>
                        <AppLayout />
                      </ProtectedRoute>
                    }
                  >
                    <Route index element={<Navigate to="intelligence" replace />} />
                    <Route path="intelligence" element={<CompanyIntelligence />} />
                    <Route path="skills" element={<SkillIntelligence />} />
                  </Route>

                  <Route
                    path="/profile"
                    element={
                      <ProtectedRoute>
                        <CandidateProfilePage />
                      </ProtectedRoute>
                    }
                  />

                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
            </BrowserRouter>
          </CompanyProvider>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
