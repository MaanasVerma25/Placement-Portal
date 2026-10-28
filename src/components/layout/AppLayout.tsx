import React, { useEffect } from "react";
import { Outlet, useNavigate, useLocation, Link } from "react-router-dom";
import { Menu, ChevronRight } from "lucide-react";
import { SidebarProvider, AppSidebar, useSidebar } from "./AppSidebar";
import { useCompany } from "@/context/CompanyContext";
import { StudentUserMenu } from "@/components/auth/StudentUserMenu";

const AppHeader: React.FC = () => {
  const { toggleSidebar } = useSidebar();
  const { summary } = useCompany();
  const location = useLocation();

  const getPageTitle = () => {
    if (location.pathname.includes("skills")) return "Skill Intelligence";
    return "Company Intelligence";
  };

  return (
    <header className="sticky top-0 z-30 h-16 border-b border-[#E5E7EB] bg-white/95 backdrop-blur-xs px-4 sm:px-6 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <button
          onClick={toggleSidebar}
          className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          aria-label="Toggle navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Enterprise Breadcrumb */}
        <nav className="flex items-center text-xs sm:text-sm font-medium text-slate-500" aria-label="Breadcrumb">
          <Link to="/" className="flex items-center gap-1.5 hover:text-blue-600 transition-colors">
            <img
              src="/jss-logo.png"
              alt="JSS"
              className="w-4 h-4 rounded object-contain shrink-0"
            />
            <span>Companies</span>
          </Link>
          <ChevronRight className="w-4 h-4 mx-1.5 text-slate-400 shrink-0" />
          <span className="text-slate-800 font-semibold truncate max-w-[140px] sm:max-w-xs">
            {summary ? summary.short_name || summary.name : "Company"}
          </span>
          <ChevronRight className="w-4 h-4 mx-1.5 text-slate-400 shrink-0 hidden sm:inline-block" />
          <span className="text-blue-600 font-semibold hidden sm:inline-block">
            {getPageTitle()}
          </span>
        </nav>
      </div>

      <div className="flex items-center gap-2.5">
        <span className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
          <img
            src="/jss-logo.png"
            alt="JSS"
            className="w-3.5 h-3.5 rounded object-contain shrink-0"
          />
          JSS Placement Intelligence
        </span>
        <StudentUserMenu />
      </div>
    </header>
  );
};

export const AppLayout: React.FC = () => {
  const { selectedCompany, isReady } = useCompany();
  const navigate = useNavigate();

  // Route guard:
  // If selected-company is missing once ready: navigate("/").
  // Never render NotFound because company data is missing.
  useEffect(() => {
    if (isReady && !selectedCompany) {
      navigate("/", { replace: true });
    }
  }, [isReady, selectedCompany, navigate]);

  if (!isReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-medium text-slate-500">Loading Intelligence Hub...</p>
        </div>
      </div>
    );
  }

  if (!selectedCompany) {
    return null;
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex bg-white text-slate-900 font-body">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0 bg-white">
          <AppHeader />
          <main className="flex-1 overflow-x-hidden">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};
