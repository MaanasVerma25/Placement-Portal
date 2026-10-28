import React, { createContext, useContext, useState, useEffect } from "react";
import { NavLink, Link, useLocation } from "react-router-dom";
import { Building2, Sparkles, ArrowLeft, Menu, X, ChevronRight, Layers, User } from "lucide-react";
import { useCompany } from "@/context/CompanyContext";
import { CompanyLogo } from "@/components/CompanyLogo";

// Context for sidebar state
interface SidebarContextType {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  isMobile: boolean;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export const SidebarProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (!mobile) {
        setIsOpen(true);
      } else {
        setIsOpen(false);
      }
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Close mobile sidebar on route change
  useEffect(() => {
    if (isMobile) {
      setIsOpen(false);
    }
  }, [location.pathname, isMobile]);

  const toggleSidebar = () => setIsOpen((prev) => !prev);

  return (
    <SidebarContext.Provider value={{ isOpen, setIsOpen, toggleSidebar, isMobile }}>
      {children}
    </SidebarContext.Provider>
  );
};

export const useSidebar = () => {
  const ctx = useContext(SidebarContext);
  if (!ctx) throw new Error("useSidebar must be used within SidebarProvider");
  return ctx;
};

export const AppSidebar: React.FC = () => {
  const { isOpen, setIsOpen, isMobile } = useSidebar();
  const { summary } = useCompany();

  const navItems = [
    {
      to: "/company/intelligence",
      label: "Company Intelligence",
      icon: Building2,
      badge: "22 Sections",
    },
    {
      to: "/company/skills",
      label: "Skill Intelligence",
      icon: Sparkles,
      badge: "Roadmap",
    },
  ];

  return (
    <>
      {/* Mobile overlay */}
      {isMobile && isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-slate-900/30 backdrop-blur-xs z-40 transition-opacity"
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex flex-col w-64 border-r border-[#E5E7EB] bg-[#F8FAFC] transition-transform duration-200 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0 lg:static`}
      >
        {/* Top Header / Wordmark */}
        <div className="h-16 px-4 border-b border-[#E5E7EB] flex items-center justify-between bg-[#F8FAFC]">
          <Link to="/" className="flex items-center gap-2.5 text-left group">
            <img
              src="/jss-logo.png"
              alt="JSS University Logo"
              className="w-8 h-8 rounded-[6px] object-contain shrink-0 shadow-xs"
            />
            <div className="flex flex-col">
              <span className="font-heading font-extrabold text-sm tracking-wider text-slate-900 group-hover:text-blue-600 transition-colors leading-tight">
                JSS UNIVERSITY
              </span>
              <span className="inline-flex items-center text-[10px] font-bold text-blue-600 tracking-wider">
                INTELLIGENCE PLATFORM
              </span>
            </div>
          </Link>

          {isMobile && (
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-md text-slate-500 hover:text-slate-800 hover:bg-slate-200/60"
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Selected Company Context Preview */}
        {summary && (
          <div className="px-4 py-3.5 mx-3 mt-3 mb-2 rounded-xl bg-white border border-[#E5E7EB] shadow-xs flex items-center gap-3">
            <CompanyLogo
              name={summary.name}
              logoUrl={summary.logo_url}
              websiteUrl={summary.website_url}
              size="sm"
            />
            <div className="min-w-0 flex-1">
              <p className="text-xs font-heading font-semibold text-slate-900 truncate">
                {summary.short_name || summary.name}
              </p>
              <p className="text-[11px] text-slate-500 truncate">{summary.category || "Enterprise"}</p>
            </div>
          </div>
        )}

        {/* Navigation Items */}
        <div className="flex-1 px-3 py-3 space-y-1 overflow-y-auto">
          <div className="px-3 pb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Intelligence Hub
          </div>
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-[#EFF6FF] text-[#2563EB] font-semibold border border-blue-100/80 shadow-xs"
                    : "text-[#334155] hover:bg-slate-200/50 hover:text-slate-900"
                }`
              }
            >
              <div className="flex items-center gap-3">
                <item.icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </div>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-200/60 text-slate-600 font-semibold">
                {item.badge}
              </span>
            </NavLink>
          ))}

          <div className="pt-3 px-3 pb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Candidate Profile
          </div>
          <NavLink
            to="/profile"
            className={({ isActive }) =>
              `flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? "bg-[#EFF6FF] text-[#2563EB] font-semibold border border-blue-100/80 shadow-xs"
                  : "text-[#334155] hover:bg-slate-200/50 hover:text-slate-900"
              }`
            }
          >
            <div className="flex items-center gap-3">
              <User className="w-4 h-4 shrink-0 text-blue-600" />
              <span>My Profile & Skills</span>
            </div>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 font-semibold">
              RADIX
            </span>
          </NavLink>
        </div>

        {/* Footer: All Companies link (NO user profile, NO logout) */}
        <div className="p-3 border-t border-[#E5E7EB] bg-[#F8FAFC]">
          <Link
            to="/"
            className="flex items-center justify-between w-full px-3.5 py-2.5 text-xs font-semibold text-slate-600 hover:text-blue-600 hover:bg-white rounded-lg border border-transparent hover:border-[#E5E7EB] transition-all"
          >
            <div className="flex items-center gap-2">
              <ArrowLeft className="w-4 h-4 text-slate-400" />
              <span>All Companies</span>
            </div>
            <span className="text-[10px] text-slate-400">Directory</span>
          </Link>
        </div>
      </aside>
    </>
  );
};
