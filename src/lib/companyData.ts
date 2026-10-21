export interface CompanySummary {
  name: string;
  short_name: string;
  logo_url: string;
  category: string;
  company_type: "Super Dream" | "Dream" | "Standard" | "Regular" | string;
  incorporation_year: number | string;
  employee_size: string;
  headquarters_address: string;
  operating_countries: string;
  office_locations: string;
  yoy_growth_rate: string;
  website_url: string;
  raw: Record<string, any>;
}

export interface CompanyProfile {
  name: string;
  short_name: string;
  category: string;
  incorporation_year: number | string;
  nature_of_company: string;
  overview_text: string;
  headquarters_address: string;
  operating_countries: string;
  office_count: string;
  office_locations: string;
  employee_size: string;
  vision_statement: string;
  mission_statement: string;
  core_values: string;
  history_timeline: string;
  recent_news: string;

  // Digital Presence
  website_url: string;
  linkedin_url: string;
  twitter_handle: string;
  facebook_url: string;
  instagram_url: string;
  primary_contact_email: string;
  primary_phone_number: string;

  // Risk & Compliance
  regulatory_status: string;
  legal_issues: string;
  esg_ratings: string;
  supply_chain_dependencies: string;
  geopolitical_risks: string;
  macro_risks: string;
  carbon_footprint: string;
  ethical_sourcing: string;

  // Brand & Ratings
  marketing_video_url: string;
  customer_testimonials: string;
  website_quality: string;
  website_rating: string;
  website_traffic_rank: string;
  social_media_followers: string;
  glassdoor_rating: string;
  indeed_rating: string;
  google_rating: string;
  awards_recognitions: string;
  brand_sentiment_score: string;
  event_participation: string;

  // Products & Services
  pain_points_addressed: string;
  focus_sectors: string;
  offerings_description: string;
  top_customers: string;
  core_value_proposition: string;
  unique_differentiators: string;
  competitive_advantages: string;
  weaknesses_gaps: string;
  key_challenges_needs: string;
  key_competitors: string;
  market_share_percentage: string;
  sales_motion: string;
  customer_concentration_risk: string;
  exit_strategy_history: string;
  benchmark_vs_peers: string;
  future_projections: string;
  strategic_priorities: string;
  industry_associations: string;
  case_studies: string;
  go_to_market_strategy: string;
  innovation_roadmap: string;
  product_pipeline: string;
  tam: string;
  sam: string;
  som: string;

  // Culture & Benefits
  leave_policy: string;
  health_support: string;
  fixed_vs_variable_pay: string;
  bonus_predictability: string;
  esops_incentives: string;
  family_health_insurance: string;
  relocation_support: string;
  lifestyle_benefits: string;
  hiring_velocity: string;
  employee_turnover: string;
  avg_retention_tenure: string;
  diversity_metrics: string;
  work_culture_summary: string;
  manager_quality: string;
  psychological_safety: string;
  feedback_culture: string;
  diversity_inclusion_score: string;
  ethical_standards: string;
  burnout_risk: string;
  layoff_history: string;
  mission_clarity: string;
  sustainability_csr: string;
  crisis_behavior: string;

  // Funding & Financials
  annual_revenue: string;
  annual_profit: string;
  revenue_mix: string;
  valuation: string;
  yoy_growth_rate: string;
  profitability_status: string;
  key_investors: string;
  recent_funding_rounds: string;
  total_capital_raised: string;
  customer_acquisition_cost: string;
  customer_lifetime_value: string;
  cac_ltv_ratio: string;
  churn_rate: string;
  net_promoter_score: string;
  burn_rate: string;
  runway_months: string;
  burn_multiplier: string;

  // Work Location & Commute
  remote_policy_details: string;
  typical_hours: string;
  overtime_expectations: string;
  weekend_work: string;
  flexibility_level: string;
  location_centrality: string;
  public_transport_access: string;
  cab_policy: string;
  airport_commute_time: string;
  office_zone_type: string;
  area_safety: string;
  safety_policies: string;
  infrastructure_safety: string;
  emergency_preparedness: string;

  // Leadership
  ceo_name: string;
  ceo_linkedin_url: string;
  key_leaders: string;
  warm_intro_pathways: string;
  decision_maker_access: string;
  contact_person_name: string;
  contact_person_title: string;
  contact_person_email: string;
  contact_person_phone: string;
  board_members: string;

  // Career Growth & Learning
  training_spend: string;
  onboarding_quality: string;
  learning_culture: string;
  exposure_quality: string;
  mentorship_availability: string;
  internal_mobility: string;
  promotion_clarity: string;
  tools_access: string;
  role_clarity: string;
  early_ownership: string;
  work_impact: string;
  execution_thinking_balance: string;
  automation_level: string;
  cross_functional_exposure: string;
  company_maturity: string;
  brand_value: string;
  client_quality: string;
  exit_opportunities: string;
  skill_relevance: string;
  external_recognition: string;
  network_strength: string;
  global_exposure: string;

  // Technology Stack & Ecosystem
  technology_partners: string;
  intellectual_property: string;
  r_and_d_investment: string;
  ai_ml_adoption_level: string;
  tech_stack: string;
  cybersecurity_posture: string;
  partnership_ecosystem: string;
  tech_adoption_rating: string;

  // Catch-all for additional fields
  [key: string]: any;
}

export type BloomLevel = "CU" | "AP" | "AS" | "EV" | "CR";
export type CriticalityLevel = "Critical" | "Important" | "Baseline";
export type DifficultyTier = "EXPERT" | "ADVANCED" | "PRO" | "BEGINNER";

export interface DashboardSkill {
  skill_set_id: number;
  skill_set_name: string;
  required_level: number;
  required_proficiency: string;
  bloom_level: BloomLevel;
  bloom_label: string;
  criticality: CriticalityLevel;
  difficulty: DifficultyTier;
}

// Helper functions
export function asString(val: any, fallback = "Not Available"): string {
  if (val === null || val === undefined) return fallback;
  const s = String(val).trim();
  if (!s || s.toLowerCase() === "null" || s.toLowerCase() === "undefined") return fallback;
  return s;
}

export function asRecord(val: any): Record<string, any> {
  return typeof val === "object" && val !== null ? val : {};
}

export function isNullish(val: any): boolean {
  if (val === null || val === undefined) return true;
  const s = String(val).trim().toLowerCase();
  return (
    s === "" ||
    s === "na" ||
    s === "n/a" ||
    s === "none" ||
    s === "-" ||
    s === "null" ||
    s === "undefined" ||
    s === "not applicable"
  );
}

export function splitItems(str: string): string[] {
  if (!str) return [];
  return str
    .split(/[;\n•]/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0 && !isNullish(s));
}

export function titleCaseFromCode(code: string): string {
  return code
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export function scoreToDifficulty(score: number): DifficultyTier {
  if (score >= 8) return "EXPERT";
  if (score >= 6) return "ADVANCED";
  if (score >= 4) return "PRO";
  return "BEGINNER";
}

export function proficiencyToBloom(level: number): { code: BloomLevel; label: string } {
  if (level <= 2) return { code: "CU", label: "Conceptual Understanding" };
  if (level <= 4) return { code: "AP", label: "Applied Problem Solving" };
  if (level <= 6) return { code: "AS", label: "Analytical Synthesis" };
  if (level <= 8) return { code: "EV", label: "Evaluative Architecture" };
  return { code: "CR", label: "Creative Innovation" };
}

export function scoreToCriticality(score: number): CriticalityLevel {
  if (score >= 7) return "Critical";
  if (score >= 5) return "Important";
  return "Baseline";
}

// Normalizers
export function normalizeCompanySummary(short_json: Record<string, any>): CompanySummary {
  const sj = asRecord(short_json);
  return {
    name: asString(sj.name, "Company Name"),
    short_name: asString(sj.short_name, sj.name || "Company"),
    logo_url: asString(sj.logo_url, ""),
    category: asString(sj.category, "Enterprise"),
    company_type: asString(sj.company_type, "Standard"),
    incorporation_year: sj.incorporation_year || "N/A",
    employee_size: asString(sj.employee_size, "N/A"),
    headquarters_address: asString(sj.headquarters_address, "Global"),
    operating_countries: asString(sj.operating_countries, ""),
    office_locations: asString(sj.office_locations, ""),
    yoy_growth_rate: asString(sj.yoy_growth_rate, "N/A"),
    website_url: asString(sj.website_url, ""),
    raw: sj,
  };
}

export function normalizeCompanyProfile(
  full_json: Record<string, any>,
  short_json?: Record<string, any>
): CompanyProfile {
  const fj = asRecord(full_json);
  const sj = asRecord(short_json);
  const combined = { ...sj, ...fj };

  return {
    ...combined,
    name: asString(combined.name, "Company Name"),
    short_name: asString(combined.short_name, combined.name || "Company"),
    category: asString(combined.category, "Enterprise"),
    incorporation_year: combined.incorporation_year || "N/A",
    nature_of_company: asString(combined.nature_of_company, "Public"),
    overview_text: asString(combined.overview_text, "No overview provided."),
    headquarters_address: asString(combined.headquarters_address, "Global"),
    operating_countries: asString(combined.operating_countries, "Global"),
    office_count: asString(combined.office_count, "Multiple"),
    office_locations: asString(combined.office_locations, "Multiple"),
    employee_size: asString(combined.employee_size, "N/A"),
    vision_statement: asString(combined.vision_statement, "N/A"),
    mission_statement: asString(combined.mission_statement, "N/A"),
    core_values: asString(combined.core_values, "N/A"),
    history_timeline: asString(combined.history_timeline, "N/A"),
    recent_news: asString(combined.recent_news, "N/A"),

    website_url: asString(combined.website_url, ""),
    linkedin_url: asString(combined.linkedin_url, ""),
    twitter_handle: asString(combined.twitter_handle, ""),
    facebook_url: asString(combined.facebook_url, ""),
    instagram_url: asString(combined.instagram_url, ""),
    primary_contact_email: asString(combined.primary_contact_email, "N/A"),
    primary_phone_number: asString(combined.primary_phone_number, "N/A"),

    regulatory_status: asString(combined.regulatory_status, "Compliant"),
    legal_issues: asString(combined.legal_issues, "None"),
    esg_ratings: asString(combined.esg_ratings, "N/A"),
    supply_chain_dependencies: asString(combined.supply_chain_dependencies, "N/A"),
    geopolitical_risks: asString(combined.geopolitical_risks, "N/A"),
    macro_risks: asString(combined.macro_risks, "N/A"),
    carbon_footprint: asString(combined.carbon_footprint, "N/A"),
    ethical_sourcing: asString(combined.ethical_sourcing, "N/A"),

    marketing_video_url: asString(combined.marketing_video_url, ""),
    customer_testimonials: asString(combined.customer_testimonials, "N/A"),
    website_quality: asString(combined.website_quality, "Enterprise"),
    website_rating: asString(combined.website_rating, "N/A"),
    website_traffic_rank: asString(combined.website_traffic_rank, "N/A"),
    social_media_followers: asString(combined.social_media_followers, "N/A"),
    glassdoor_rating: asString(combined.glassdoor_rating, "N/A"),
    indeed_rating: asString(combined.indeed_rating, "N/A"),
    google_rating: asString(combined.google_rating, "N/A"),
    awards_recognitions: asString(combined.awards_recognitions, "N/A"),
    brand_sentiment_score: asString(combined.brand_sentiment_score, "Positive"),
    event_participation: asString(combined.event_participation, "N/A"),

    pain_points_addressed: asString(combined.pain_points_addressed, "N/A"),
    focus_sectors: asString(combined.focus_sectors, "Technology"),
    offerings_description: asString(combined.offerings_description, "N/A"),
    top_customers: asString(combined.top_customers, "Enterprise clients"),
    core_value_proposition: asString(combined.core_value_proposition, "N/A"),
    unique_differentiators: asString(combined.unique_differentiators, "N/A"),
    competitive_advantages: asString(combined.competitive_advantages, "N/A"),
    weaknesses_gaps: asString(combined.weaknesses_gaps, "N/A"),
    key_challenges_needs: asString(combined.key_challenges_needs, "N/A"),
    key_competitors: asString(combined.key_competitors, "N/A"),
    market_share_percentage: asString(combined.market_share_percentage, "N/A"),
    sales_motion: asString(combined.sales_motion, "Enterprise"),
    customer_concentration_risk: asString(combined.customer_concentration_risk, "Low"),
    exit_strategy_history: asString(combined.exit_strategy_history, "Public"),
    benchmark_vs_peers: asString(combined.benchmark_vs_peers, "N/A"),
    future_projections: asString(combined.future_projections, "N/A"),
    strategic_priorities: asString(combined.strategic_priorities, "N/A"),
    industry_associations: asString(combined.industry_associations, "N/A"),
    case_studies: asString(combined.case_studies, "N/A"),
    go_to_market_strategy: asString(combined.go_to_market_strategy, "N/A"),
    innovation_roadmap: asString(combined.innovation_roadmap, "N/A"),
    product_pipeline: asString(combined.product_pipeline, "N/A"),
    tam: asString(combined.tam, "N/A"),
    sam: asString(combined.sam, "N/A"),
    som: asString(combined.som, "N/A"),

    leave_policy: asString(combined.leave_policy, "Standard"),
    health_support: asString(combined.health_support, "Comprehensive"),
    fixed_vs_variable_pay: asString(combined.fixed_vs_variable_pay, "N/A"),
    bonus_predictability: asString(combined.bonus_predictability, "N/A"),
    esops_incentives: asString(combined.esops_incentives, "N/A"),
    family_health_insurance: asString(combined.family_health_insurance, "Covered"),
    relocation_support: asString(combined.relocation_support, "Provided"),
    lifestyle_benefits: asString(combined.lifestyle_benefits, "N/A"),
    hiring_velocity: asString(combined.hiring_velocity, "High"),
    employee_turnover: asString(combined.employee_turnover, "N/A"),
    avg_retention_tenure: asString(combined.avg_retention_tenure, "N/A"),
    diversity_metrics: asString(combined.diversity_metrics, "N/A"),
    work_culture_summary: asString(combined.work_culture_summary, "Collaborative"),
    manager_quality: asString(combined.manager_quality, "N/A"),
    psychological_safety: asString(combined.psychological_safety, "High"),
    feedback_culture: asString(combined.feedback_culture, "Continuous"),
    diversity_inclusion_score: asString(combined.diversity_inclusion_score, "High"),
    ethical_standards: asString(combined.ethical_standards, "High"),
    burnout_risk: asString(combined.burnout_risk, "Moderate"),
    layoff_history: asString(combined.layoff_history, "Low"),
    mission_clarity: asString(combined.mission_clarity, "High"),
    sustainability_csr: asString(combined.sustainability_csr, "Active"),
    crisis_behavior: asString(combined.crisis_behavior, "Resilient"),

    annual_revenue: asString(combined.annual_revenue, "N/A"),
    annual_profit: asString(combined.annual_profit, "N/A"),
    revenue_mix: asString(combined.revenue_mix, "N/A"),
    valuation: asString(combined.valuation, "N/A"),
    yoy_growth_rate: asString(combined.yoy_growth_rate, "N/A"),
    profitability_status: asString(combined.profitability_status, "Profitable"),
    key_investors: asString(combined.key_investors, "Institutional"),
    recent_funding_rounds: asString(combined.recent_funding_rounds, "Public"),
    total_capital_raised: asString(combined.total_capital_raised, "N/A"),
    customer_acquisition_cost: asString(combined.customer_acquisition_cost, "N/A"),
    customer_lifetime_value: asString(combined.customer_lifetime_value, "N/A"),
    cac_ltv_ratio: asString(combined.cac_ltv_ratio, "N/A"),
    churn_rate: asString(combined.churn_rate, "N/A"),
    net_promoter_score: asString(combined.net_promoter_score, "N/A"),
    burn_rate: asString(combined.burn_rate, "N/A"),
    runway_months: asString(combined.runway_months, "N/A"),
    burn_multiplier: asString(combined.burn_multiplier, "N/A"),

    remote_policy_details: asString(combined.remote_policy_details, "Hybrid"),
    typical_hours: asString(combined.typical_hours, "Standard"),
    overtime_expectations: asString(combined.overtime_expectations, "Occasional"),
    weekend_work: asString(combined.weekend_work, "Rare"),
    flexibility_level: asString(combined.flexibility_level, "Flexible"),
    location_centrality: asString(combined.location_centrality, "Central"),
    public_transport_access: asString(combined.public_transport_access, "Good"),
    cab_policy: asString(combined.cab_policy, "Provided"),
    airport_commute_time: asString(combined.airport_commute_time, "N/A"),
    office_zone_type: asString(combined.office_zone_type, "IT Park"),
    area_safety: asString(combined.area_safety, "High"),
    safety_policies: asString(combined.safety_policies, "Comprehensive"),
    infrastructure_safety: asString(combined.infrastructure_safety, "Standard"),
    emergency_preparedness: asString(combined.emergency_preparedness, "Standard"),

    ceo_name: asString(combined.ceo_name, "N/A"),
    ceo_linkedin_url: asString(combined.ceo_linkedin_url, ""),
    key_leaders: asString(combined.key_leaders, "N/A"),
    warm_intro_pathways: asString(combined.warm_intro_pathways, "Alumni"),
    decision_maker_access: asString(combined.decision_maker_access, "Structured"),
    contact_person_name: asString(combined.contact_person_name, "N/A"),
    contact_person_title: asString(combined.contact_person_title, "N/A"),
    contact_person_email: asString(combined.contact_person_email, "N/A"),
    contact_person_phone: asString(combined.contact_person_phone, "N/A"),
    board_members: asString(combined.board_members, "N/A"),

    training_spend: asString(combined.training_spend, "N/A"),
    onboarding_quality: asString(combined.onboarding_quality, "Standard"),
    learning_culture: asString(combined.learning_culture, "Continuous"),
    exposure_quality: asString(combined.exposure_quality, "High"),
    mentorship_availability: asString(combined.mentorship_availability, "Available"),
    internal_mobility: asString(combined.internal_mobility, "Moderate"),
    promotion_clarity: asString(combined.promotion_clarity, "Structured"),
    tools_access: asString(combined.tools_access, "Enterprise"),
    role_clarity: asString(combined.role_clarity, "High"),
    early_ownership: asString(combined.early_ownership, "Medium"),
    work_impact: asString(combined.work_impact, "High"),
    execution_thinking_balance: asString(combined.execution_thinking_balance, "Balanced"),
    automation_level: asString(combined.automation_level, "High"),
    cross_functional_exposure: asString(combined.cross_functional_exposure, "High"),
    company_maturity: asString(combined.company_maturity, "Established"),
    brand_value: asString(combined.brand_value, "Top Tier"),
    client_quality: asString(combined.client_quality, "Global Enterprises"),
    exit_opportunities: asString(combined.exit_opportunities, "Strong"),
    skill_relevance: asString(combined.skill_relevance, "Very High"),
    external_recognition: asString(combined.external_recognition, "High"),
    network_strength: asString(combined.network_strength, "Strong"),
    global_exposure: asString(combined.global_exposure, "High"),

    technology_partners: asString(combined.technology_partners, "N/A"),
    intellectual_property: asString(combined.intellectual_property, "N/A"),
    r_and_d_investment: asString(combined.r_and_d_investment, "N/A"),
    ai_ml_adoption_level: asString(combined.ai_ml_adoption_level, "N/A"),
    tech_stack: asString(combined.tech_stack, "N/A"),
    cybersecurity_posture: asString(combined.cybersecurity_posture, "High"),
    partnership_ecosystem: asString(combined.partnership_ecosystem, "N/A"),
    tech_adoption_rating: asString(combined.tech_adoption_rating, "High"),
  };
}

export function normalizeDashboardSkills(skillLevels: any[]): DashboardSkill[] {
  if (!Array.isArray(skillLevels)) return [];
  return skillLevels.map((s) => {
    const level = Number(s.required_level) || 5;
    const bloom = proficiencyToBloom(level);
    return {
      skill_set_id: s.skill_set_id || 0,
      skill_set_name: asString(s.skill_set_name, "Technical Skill"),
      required_level: level,
      required_proficiency: asString(s.required_proficiency, "Proficient"),
      bloom_level: bloom.code,
      bloom_label: bloom.label,
      criticality: scoreToCriticality(level),
      difficulty: scoreToDifficulty(level),
    };
  });
}
