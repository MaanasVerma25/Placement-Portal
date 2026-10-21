import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from "react";
import { SEED_COMPANIES } from "@/data/seedCompanies";
import {
  CompanySummary,
  CompanyProfile,
  DashboardSkill,
  normalizeCompanySummary,
  normalizeCompanyProfile,
  normalizeDashboardSkills,
} from "@/lib/companyData";

export interface StoredCompany {
  companyId: number;
  companyName: string;
  logoUrl: string;
}

export interface ActiveCompany {
  company_id: number;
  short_json?: any;
  full_json?: any;
  skill_levels?: any[];
  [key: string]: any;
}

interface CompanyContextType {
  selectedCompany: ActiveCompany | null;
  summary: CompanySummary | null;
  profile: CompanyProfile | null;
  skills: DashboardSkill[];
  setSelectedCompanyById: (id: number) => void;
  selectCompany: (company: ActiveCompany | any) => void;
  clearSelectedCompany: () => void;
  isReady: boolean;
}

const CompanyContext = createContext<CompanyContextType | undefined>(undefined);

const STORAGE_KEY = "selected-company";

export const CompanyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedCompany, setSelectedCompany] = useState<ActiveCompany | null>(null);
  const [isReady, setIsReady] = useState<boolean>(false);

  // Restore on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && parsed.companyId) {
          const match = SEED_COMPANIES.find((c) => c.company_id === parsed.companyId);
          if (match) {
            setSelectedCompany(match);
          } else {
            setSelectedCompany({
              company_id: parsed.companyId,
              short_json: parsed.short_json || {
                name: parsed.companyName || "Company",
                logo_url: parsed.logoUrl || "",
              },
            });
          }
        } else if (SEED_COMPANIES.length > 0) {
          setSelectedCompany(SEED_COMPANIES[0]);
        }
      } else if (SEED_COMPANIES.length > 0) {
        // Fallback default
        setSelectedCompany(SEED_COMPANIES[0]);
      }
    } catch (e) {
      console.error("Error reading selected-company from localStorage", e);
    } finally {
      setIsReady(true);
    }
  }, []);

  const selectCompany = useCallback((company: ActiveCompany | any) => {
    setSelectedCompany(company);
    try {
      const storedData: StoredCompany & { short_json?: any } = {
        companyId: company.company_id,
        companyName: company.short_json?.name || company.name || "Company",
        logoUrl: company.short_json?.logo_url || company.logo_url || "",
        short_json: company.short_json,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(storedData));
    } catch (e) {
      console.error("Error saving selected-company to localStorage", e);
    }
  }, []);

  const setSelectedCompanyById = useCallback(
    (id: number) => {
      const found = SEED_COMPANIES.find((c) => c.company_id === id);
      if (found) {
        selectCompany(found);
      } else {
        selectCompany({
          company_id: id,
          short_json: { name: `Company #${id}` },
        });
      }
    },
    [selectCompany]
  );

  const clearSelectedCompany = useCallback(() => {
    setSelectedCompany(null);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      console.error("Error clearing selected-company from localStorage", e);
    }
  }, []);

  const summary = useMemo<CompanySummary | null>(() => {
    if (!selectedCompany) return null;
    return normalizeCompanySummary(selectedCompany.short_json);
  }, [selectedCompany]);

  const profile = useMemo<CompanyProfile | null>(() => {
    if (!selectedCompany) return null;
    return normalizeCompanyProfile(selectedCompany.full_json, selectedCompany.short_json);
  }, [selectedCompany]);

  const skills = useMemo<DashboardSkill[]>(() => {
    if (!selectedCompany) return [];
    return normalizeDashboardSkills(selectedCompany.skill_levels || []);
  }, [selectedCompany]);

  return (
    <CompanyContext.Provider
      value={{
        selectedCompany,
        summary,
        profile,
        skills,
        setSelectedCompanyById,
        selectCompany,
        clearSelectedCompany,
        isReady,
      }}
    >
      {children}
    </CompanyContext.Provider>
  );
};

export function useCompany(): CompanyContextType {
  const context = useContext(CompanyContext);
  if (!context) {
    throw new Error("useCompany must be used within a CompanyProvider");
  }
  return context;
}
