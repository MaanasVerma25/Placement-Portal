import { useQuery } from "@tanstack/react-query";
import { supabase, isSupabaseConfigured } from "@/lib/supabaseClient";
import {
  CompanySummary,
  CompanyProfile,
  DashboardSkill,
  normalizeCompanySummary,
  normalizeCompanyProfile,
  normalizeDashboardSkills,
} from "@/lib/companyData";
import { SEED_COMPANIES } from "@/data/seedCompanies";
import { getSkillTopics, SkillTopic } from "@/data/skillTopics";

export interface CompanyListItem extends CompanySummary {
  company_id: number;
  short_json: Record<string, any>;
}

export interface CompanyProfileDetail extends CompanyProfile {
  company_id: number;
  short_json: Record<string, any>;
  full_json: Record<string, any>;
  summary: CompanySummary;
}

export interface SkillWithRoadmap extends DashboardSkill {
  topics: SkillTopic[];
}

/**
 * Categorize recruiting organizations into standard university placement tiers
 * when explicit company_type is not present in raw JSON.
 */
export function deriveCompanyTier(
  shortJson: Record<string, any>,
  fullJson: Record<string, any>
): "Super Dream" | "Dream" | "Standard" | "Regular" {
  if (shortJson.company_type) return shortJson.company_type;
  if (fullJson.company_type) return fullJson.company_type;

  const name = String(shortJson.name || "").toLowerCase();
  const cat = String(shortJson.category || fullJson.category || "").toLowerCase();

  // Super Dream: Tier-1 Big Tech, AI & High-Frequency Engineering
  const superDreamKeywords = [
    "google", "apple", "microsoft", "amazon", "meta", "nvidia", "netflix",
    "adobe", "uber", "salesforce", "oracle", "snowflake", "databricks", "stripe",
    "spacex", "openai", "qualcomm", "intel", "amd"
  ];
  if (superDreamKeywords.some((k) => name.includes(k))) {
    return "Super Dream";
  }

  // Dream: Global Financial Institutions, Major Product SaaS, Scale-ups & GCCs
  const dreamKeywords = [
    "fractal", "bank", "goldman", "morgan", "financial", "fintech",
    "wealth", "investment", "credit", "paypal", "visa", "mastercard",
    "samsung", "cisco", "atlassian", "twilio", "intuit", "walmart",
    "bloomberg", "airbus", "boeing"
  ];
  if (
    dreamKeywords.some((k) => name.includes(k)) ||
    cat.includes("fintech") ||
    cat.includes("banking") ||
    cat.includes("scale-up") ||
    cat.includes("unicorn")
  ) {
    return "Dream";
  }

  // Regular: Startups, Specialized SMBs, and EdTech
  if (cat.includes("startup") || cat.includes("smb") || cat.includes("edtech")) {
    return "Regular";
  }

  // Standard: Established Enterprise IT Services, Consulting, and Engineering
  return "Standard";
}

/**
 * Fetch companies list from public.company_json.
 * Uses short_json & full_json mapped through normalizeCompanySummary.
 */
export async function fetchCompanies(): Promise<CompanyListItem[]> {
  const seedFallback = () =>
    SEED_COMPANIES.map((sc) => ({
      ...normalizeCompanySummary(sc.short_json),
      company_id: sc.company_id,
      short_json: sc.short_json,
    }));

  if (!isSupabaseConfigured) {
    return seedFallback();
  }

  try {
    const { data, error } = await supabase
      .from("company_json")
      .select("company_id, short_json, full_json")
      .order("company_id", { ascending: true });

    if (error) {
      console.warn("Supabase company query notice (falling back to seed companies):", error);
      return seedFallback();
    }

    if (!data || data.length === 0) {
      return seedFallback();
    }

    return (data || []).map((row: any) => {
      const shortJson = (row.short_json as Record<string, any>) || {};
      const fullJson = (row.full_json as Record<string, any>) || {};

      const derivedType = deriveCompanyTier(shortJson, fullJson);
      const resolvedHq =
        shortJson.headquarters_address ||
        fullJson.headquarters_address ||
        (shortJson.office_locations ? shortJson.office_locations.split(";")[0].trim() : "Global");

      const enrichedShort = {
        ...shortJson,
        company_type: shortJson.company_type || fullJson.company_type || derivedType,
        headquarters_address: resolvedHq,
        website_url: shortJson.website_url || fullJson.website_url || "",
      };

      const summary = normalizeCompanySummary(enrichedShort);
      return {
        ...summary,
        company_id: Number(row.company_id),
        short_json: enrichedShort,
        full_json: fullJson,
      };
    });
  } catch (err) {
    console.warn("Network or client error fetching from Supabase, using seed fallback:", err);
    return seedFallback();
  }
}

/**
 * Fetch full company profile for a single company from public.company_json.
 * Uses full_json & short_json mapped through normalizeCompanyProfile.
 */
export async function fetchCompanyProfile(
  companyId: number
): Promise<CompanyProfileDetail> {
  const seedFallback = () => {
    const match =
      SEED_COMPANIES.find((c) => c.company_id === companyId) || SEED_COMPANIES[0];
    const profile = normalizeCompanyProfile(match.full_json, match.short_json);
    const summary = normalizeCompanySummary(match.short_json);
    return {
      ...profile,
      company_id: match.company_id,
      short_json: match.short_json,
      full_json: match.full_json,
      summary,
    };
  };

  if (!isSupabaseConfigured) {
    return seedFallback();
  }

  try {
    const { data, error } = await supabase
      .from("company_json")
      .select("company_id, short_json, full_json")
      .eq("company_id", companyId)
      .single();

    if (error || !data) {
      console.warn(`Company profile query notice for ${companyId}, using fallback:`, error);
      return seedFallback();
    }

    const shortJson = (data.short_json as Record<string, any>) || {};
    const fullJson = (data.full_json as Record<string, any>) || {};
    const profile = normalizeCompanyProfile(fullJson, shortJson);
    const summary = normalizeCompanySummary(shortJson);

    return {
      ...profile,
      company_id: Number(data.company_id),
      short_json: shortJson,
      full_json: fullJson,
      summary,
    };
  } catch (err) {
    console.warn(`Exception fetching company profile for company_id ${companyId}, using fallback:`, err);
    return seedFallback();
  }
}

/**
 * Fetch required skill benchmarks & 10-level roadmaps for a company.
 * Reads from:
 *   - public.company_skill_levels
 *   - public.skill_set_master
 *   - public.proficiency_levels
 *   - public.skill_set_topics
 */
export async function fetchCompanySkills(
  companyId: number
): Promise<SkillWithRoadmap[]> {
  const seedFallback = () => {
    const match =
      SEED_COMPANIES.find((c) => c.company_id === companyId) || SEED_COMPANIES[0];
    const normalized = normalizeDashboardSkills(match.skill_levels);
    return normalized.map((skill) => ({
      ...skill,
      topics: getSkillTopics(skill.skill_set_id),
    }));
  };

  if (!isSupabaseConfigured) {
    return seedFallback();
  }

  try {
    // 1. Fetch company_skill_levels for this company
    const { data: skillLevelsData, error: slError } = await supabase
      .from("company_skill_levels")
      .select("company_id, skill_set_id, required_level, required_proficiency_level_id")
      .eq("company_id", companyId);

    if (slError) {
      console.warn(`Notice fetching company_skill_levels for company_id ${companyId}, using fallback:`, slError);
      return seedFallback();
    }

    if (!skillLevelsData || skillLevelsData.length === 0) {
      return seedFallback();
    }

    const skillSetIds = Array.from(
      new Set(skillLevelsData.map((row: any) => Number(row.skill_set_id)))
    );

    // 2, 3, 4. Fetch the 3 supporting tables in parallel
    const [masterRes, profRes, topicsRes] = await Promise.all([
      supabase
        .from("skill_set_master")
        .select("skill_set_id, skill_set_name, short_name")
        .in("skill_set_id", skillSetIds),
      supabase
        .from("proficiency_levels")
        .select("proficiency_level_id, proficiency_name, proficiency_code"),
      supabase
        .from("skill_set_topics")
        .select("skill_set_id, level_number, topics")
        .in("skill_set_id", skillSetIds),
    ]);

    if (masterRes.error || profRes.error || topicsRes.error) {
      console.warn("Notice fetching supporting skill tables, using fallback:", {
        master: masterRes.error,
        prof: profRes.error,
        topics: topicsRes.error,
      });
      return seedFallback();
    }

  // Lookup maps
  const skillMasterMap = new Map<number, string>();
  (masterRes.data || []).forEach((row: any) => {
    skillMasterMap.set(
      Number(row.skill_set_id),
      row.skill_set_name || row.short_name || `Skill #${row.skill_set_id}`
    );
  });

  const profMap = new Map<number, string>();
  (profRes.data || []).forEach((row: any) => {
    profMap.set(
      Number(row.proficiency_level_id),
      row.proficiency_name || row.proficiency_code || "Proficient"
    );
  });

  const topicsMap = new Map<number, SkillTopic[]>();
  (topicsRes.data || []).forEach((row: any) => {
    const sId = Number(row.skill_set_id);
    if (!topicsMap.has(sId)) {
      topicsMap.set(sId, []);
    }
    const rawTopic = row.topics || row.topic_name || row.topic;
    const topicText = Array.isArray(rawTopic)
      ? rawTopic.join(", ")
      : typeof rawTopic === "object" && rawTopic !== null
      ? JSON.stringify(rawTopic)
      : String(rawTopic || "Core milestone");

    topicsMap.get(sId)!.push({
      level_number: Number(row.level_number),
      topic: topicText,
    });
  });

  // Sort topics by level_number ascending
  topicsMap.forEach((list) => {
    list.sort((a, b) => a.level_number - b.level_number);
  });

  // Assemble raw skill level rows for normalizer
  const rawSkills = skillLevelsData.map((row: any) => {
    const sId = Number(row.skill_set_id);
    const profId = Number(row.required_proficiency_level_id);
    return {
      skill_set_id: sId,
      skill_set_name: skillMasterMap.get(sId) || `Skill #${sId}`,
      required_level: Number(row.required_level) || 5,
      required_proficiency: profMap.get(profId) || "Proficient",
    };
  });

  // Pass through existing normalizer
  const normalized = normalizeDashboardSkills(rawSkills);

  // Attach roadmap topics from Supabase
  return normalized.map((skill) => ({
    ...skill,
    topics: topicsMap.get(skill.skill_set_id) || [],
  }));
  } catch (err) {
    console.warn(`Exception in fetchCompanySkills for ${companyId}, using fallback:`, err);
    return seedFallback();
  }
}

// React Query Hooks

export function useCompanies() {
  return useQuery({
    queryKey: ["companies"],
    queryFn: fetchCompanies,
  });
}

export function useCompanyProfile(companyId: number | null | undefined) {
  return useQuery({
    queryKey: ["companyProfile", companyId],
    queryFn: () => fetchCompanyProfile(companyId!),
    enabled: typeof companyId === "number" && !isNaN(companyId) && companyId > 0,
  });
}

export function useCompanySkills(companyId: number | null | undefined) {
  return useQuery({
    queryKey: ["companySkills", companyId],
    queryFn: () => fetchCompanySkills(companyId!),
    enabled: typeof companyId === "number" && !isNaN(companyId) && companyId > 0,
  });
}
