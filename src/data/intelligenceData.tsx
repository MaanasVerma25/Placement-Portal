import React from "react";
import {
  Building2,
  Compass,
  Users2,
  DollarSign,
  Globe2,
  Boxes,
  Cpu,
  Handshake,
  Swords,
  TrendingUp,
  Award,
  HeartHandshake,
  Newspaper,
  BarChart3,
  ShieldAlert,
  MapPin,
  LifeBuoy,
  GraduationCap,
  Sparkles,
  Gift,
  Share2,
  Mail,
} from "lucide-react";
import { CompanyProfile, isNullish } from "@/lib/companyData";

export interface IntelligenceField {
  key: string;
  label: string;
  value: string;
  type?: "text" | "url" | "video" | "rating" | "list" | "paragraph" | "auto-pill";
}

export interface IntelligenceSection {
  id: string;
  number: number;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  fields: IntelligenceField[];
}

export function buildIntelligenceSections(profile?: CompanyProfile): IntelligenceSection[] {
  const p = profile || ({} as Partial<CompanyProfile>);

  const getVal = (key: string, fallback = "Not Available") => {
    const val = (p as any)?.[key];
    if (isNullish(val)) return "Not Available";
    return String(val);
  };

  const sections: IntelligenceSection[] = [
    {
      id: "company-identity",
      number: 1,
      title: "Company Identity",
      icon: Building2,
      fields: [
        { key: "name", label: "Official Name", value: getVal("name"), type: "text" },
        { key: "short_name", label: "Brand Short Name", value: getVal("short_name"), type: "text" },
        { key: "category", label: "Category", value: getVal("category"), type: "auto-pill" },
        { key: "company_type", label: "Tier / Placement Band", value: getVal("company_type"), type: "auto-pill" },
        { key: "incorporation_year", label: "Incorporated In", value: getVal("incorporation_year"), type: "text" },
        { key: "nature_of_company", label: "Nature of Business", value: getVal("nature_of_company"), type: "text" },
        { key: "employee_size", label: "Global Workforce", value: getVal("employee_size"), type: "text" },
      ],
    },
    {
      id: "overview-vision",
      number: 2,
      title: "Overview & Vision",
      icon: Compass,
      fields: [
        { key: "overview_text", label: "Executive Summary", value: getVal("overview_text"), type: "paragraph" },
        { key: "vision_statement", label: "Vision Statement", value: getVal("vision_statement"), type: "paragraph" },
        { key: "mission_statement", label: "Mission Statement", value: getVal("mission_statement"), type: "paragraph" },
        { key: "core_values", label: "Core Operating Values", value: getVal("core_values"), type: "auto-pill" },
        { key: "history_timeline", label: "Historical Milestones", value: getVal("history_timeline"), type: "list" },
      ],
    },
    {
      id: "leadership",
      number: 3,
      title: "Leadership",
      icon: Users2,
      fields: [
        { key: "ceo_name", label: "Chief Executive Officer", value: getVal("ceo_name"), type: "text" },
        { key: "key_leaders", label: "Key Executive Leadership", value: getVal("key_leaders"), type: "list" },
        { key: "board_members", label: "Board of Directors", value: getVal("board_members"), type: "list" },
        { key: "decision_maker_access", label: "Decision Maker Access", value: getVal("decision_maker_access"), type: "text" },
        { key: "warm_intro_pathways", label: "Alumni & Intro Pathways", value: getVal("warm_intro_pathways"), type: "auto-pill" },
      ],
    },
    {
      id: "funding-financials",
      number: 4,
      title: "Funding & Financials",
      icon: DollarSign,
      fields: [
        { key: "valuation", label: "Enterprise Valuation / M-Cap", value: getVal("valuation"), type: "text" },
        { key: "annual_revenue", label: "Annual Revenue", value: getVal("annual_revenue"), type: "text" },
        { key: "annual_profit", label: "Annual Net Profit", value: getVal("annual_profit"), type: "text" },
        { key: "revenue_mix", label: "Revenue Mix / Streams", value: getVal("revenue_mix"), type: "auto-pill" },
        { key: "yoy_growth_rate", label: "YoY Growth Rate", value: getVal("yoy_growth_rate"), type: "text" },
        { key: "profitability_status", label: "Profitability Status", value: getVal("profitability_status"), type: "auto-pill" },
        { key: "key_investors", label: "Institutional Investors", value: getVal("key_investors"), type: "auto-pill" },
        { key: "recent_funding_rounds", label: "Recent Funding / Market Status", value: getVal("recent_funding_rounds"), type: "text" },
        { key: "total_capital_raised", label: "Total Capital Raised", value: getVal("total_capital_raised"), type: "text" },
        { key: "burn_rate", label: "Burn Rate", value: getVal("burn_rate"), type: "text" },
        { key: "runway_months", label: "Runway Months", value: getVal("runway_months"), type: "text" },
        { key: "burn_multiplier", label: "Burn Multiplier", value: getVal("burn_multiplier"), type: "text" },
      ],
    },
    {
      id: "global-presence",
      number: 5,
      title: "Global Presence",
      icon: Globe2,
      fields: [
        { key: "headquarters_address", label: "Global Headquarters", value: getVal("headquarters_address"), type: "text" },
        { key: "operating_countries", label: "Countries of Operation", value: getVal("operating_countries"), type: "auto-pill" },
        { key: "office_count", label: "Total Delivery Centers", value: getVal("office_count"), type: "text" },
        { key: "office_locations", label: "Major Office Hubs", value: getVal("office_locations"), type: "auto-pill" },
      ],
    },
    {
      id: "products-services",
      number: 6,
      title: "Products & Services",
      icon: Boxes,
      fields: [
        { key: "offerings_description", label: "Core Service Offerings", value: getVal("offerings_description"), type: "auto-pill" },
        { key: "focus_sectors", label: "Industry Verticals", value: getVal("focus_sectors"), type: "auto-pill" },
        { key: "product_pipeline", label: "Product & Solution Pipeline", value: getVal("product_pipeline"), type: "auto-pill" },
        { key: "pain_points_addressed", label: "Enterprise Pain Points Solved", value: getVal("pain_points_addressed"), type: "auto-pill" },
        { key: "case_studies", label: "Flagship Client Engagements", value: getVal("case_studies"), type: "auto-pill" },
      ],
    },
    {
      id: "technology-stack",
      number: 7,
      title: "Technology Stack",
      icon: Cpu,
      fields: [
        { key: "tech_stack", label: "Core Technologies & Platforms", value: getVal("tech_stack"), type: "auto-pill" },
        { key: "ai_ml_adoption_level", label: "AI & Automation Depth", value: getVal("ai_ml_adoption_level"), type: "paragraph" },
        { key: "intellectual_property", label: "Proprietary IP & Accelerators", value: getVal("intellectual_property"), type: "auto-pill" },
        { key: "r_and_d_investment", label: "Annual R&D Commitment", value: getVal("r_and_d_investment"), type: "text" },
        { key: "tech_adoption_rating", label: "Industry Tech Adoption Rating", value: getVal("tech_adoption_rating"), type: "auto-pill" },
      ],
    },
    {
      id: "partnerships-ecosystem",
      number: 8,
      title: "Partnerships & Ecosystem",
      icon: Handshake,
      fields: [
        { key: "technology_partners", label: "Global Technology Alliances", value: getVal("technology_partners"), type: "auto-pill" },
        { key: "partnership_ecosystem", label: "Ecosystem Integration", value: getVal("partnership_ecosystem"), type: "auto-pill" },
        { key: "industry_associations", label: "Industry Associations & Fora", value: getVal("industry_associations"), type: "auto-pill" },
      ],
    },
    {
      id: "competitive-landscape",
      number: 9,
      title: "Competitive Landscape",
      icon: Swords,
      fields: [
        { key: "key_competitors", label: "Primary Competitors", value: getVal("key_competitors"), type: "auto-pill" },
        { key: "competitive_advantages", label: "Competitive Moats", value: getVal("competitive_advantages"), type: "auto-pill" },
        { key: "unique_differentiators", label: "Unique Value Differentiators", value: getVal("unique_differentiators"), type: "auto-pill" },
        { key: "weaknesses_gaps", label: "Strategic Challenges & Gaps", value: getVal("weaknesses_gaps"), type: "auto-pill" },
        { key: "benchmark_vs_peers", label: "Benchmarking vs Peer Group", value: getVal("benchmark_vs_peers"), type: "auto-pill" },
        { key: "market_share_percentage", label: "Estimated Market Share", value: getVal("market_share_percentage"), type: "text" },
      ],
    },
    {
      id: "market-opportunity",
      number: 10,
      title: "Market Opportunity",
      icon: TrendingUp,
      fields: [
        { key: "tam", label: "Total Addressable Market (TAM)", value: getVal("tam"), type: "text" },
        { key: "sam", label: "Serviceable Addressable Market (SAM)", value: getVal("sam"), type: "text" },
        { key: "som", label: "Serviceable Obtainable Market (SOM)", value: getVal("som"), type: "text" },
        { key: "future_projections", label: "Long-term Growth Forecast", value: getVal("future_projections"), type: "text" },
        { key: "strategic_priorities", label: "Horizon Strategic Priorities", value: getVal("strategic_priorities"), type: "auto-pill" },
        { key: "go_to_market_strategy", label: "Go-To-Market Execution", value: getVal("go_to_market_strategy"), type: "auto-pill" },
      ],
    },
    {
      id: "core-value-proposition-esg",
      number: 11,
      title: "Core Value Proposition & ESG",
      icon: Award,
      fields: [
        { key: "core_value_proposition", label: "Core Enterprise Proposition", value: getVal("core_value_proposition"), type: "auto-pill" },
        { key: "esg_ratings", label: "ESG Commitments & Standards", value: getVal("esg_ratings"), type: "auto-pill" },
        { key: "sustainability_csr", label: "Sustainability & CSR Programs", value: getVal("sustainability_csr"), type: "auto-pill" },
        { key: "carbon_footprint", label: "Carbon Neutrality Trajectory", value: getVal("carbon_footprint"), type: "text" },
        { key: "ethical_sourcing", label: "Ethical Procurement & Governance", value: getVal("ethical_sourcing"), type: "auto-pill" },
      ],
    },
    {
      id: "culture-work-life",
      number: 12,
      title: "Culture & Work Life",
      icon: HeartHandshake,
      fields: [
        { key: "work_culture_summary", label: "Culture Overview", value: getVal("work_culture_summary"), type: "auto-pill" },
        { key: "manager_quality", label: "Leadership Coaching & Manager Quality", value: getVal("manager_quality"), type: "text" },
        { key: "psychological_safety", label: "Psychological Safety", value: getVal("psychological_safety"), type: "text" },
        { key: "feedback_culture", label: "Feedback & Appraisal Frequency", value: getVal("feedback_culture"), type: "auto-pill" },
        { key: "diversity_inclusion_score", label: "DEI Programs & Representation", value: getVal("diversity_inclusion_score"), type: "auto-pill" },
        { key: "burnout_risk", label: "Pacing & Burnout Risk Index", value: getVal("burnout_risk"), type: "text" },
        { key: "crisis_behavior", label: "Crisis Leadership & Transparency", value: getVal("crisis_behavior"), type: "text" },
        { key: "ethical_standards", label: "Ethical Code & Compliance Culture", value: getVal("ethical_standards"), type: "auto-pill" },
      ],
    },
    {
      id: "recent-news-milestones",
      number: 13,
      title: "Recent News & Milestones",
      icon: Newspaper,
      fields: [
        { key: "recent_news", label: "Strategic Milestones & Acquisitions", value: getVal("recent_news"), type: "auto-pill" },
        { key: "event_participation", label: "Global Keynote Summits & Presence", value: getVal("event_participation"), type: "auto-pill" },
      ],
    },
    {
      id: "sales-customer-metrics",
      number: 14,
      title: "Sales & Customer Metrics",
      icon: BarChart3,
      fields: [
        { key: "sales_motion", label: "Go-to-Market Motion", value: getVal("sales_motion"), type: "text" },
        { key: "top_customers", label: "Representative Marquee Clients", value: getVal("top_customers"), type: "auto-pill" },
        { key: "customer_concentration_risk", label: "Concentration Risk", value: getVal("customer_concentration_risk"), type: "text" },
        { key: "customer_acquisition_cost", label: "CAC Benchmark", value: getVal("customer_acquisition_cost"), type: "text" },
        { key: "customer_lifetime_value", label: "Enterprise LTV", value: getVal("customer_lifetime_value"), type: "text" },
        { key: "cac_ltv_ratio", label: "CAC / LTV Ratio", value: getVal("cac_ltv_ratio"), type: "text" },
        { key: "churn_rate", label: "Annual Client Churn Rate", value: getVal("churn_rate"), type: "text" },
        { key: "net_promoter_score", label: "Net Promoter Score (NPS)", value: getVal("net_promoter_score"), type: "rating" },
      ],
    },
    {
      id: "risk-compliance",
      number: 15,
      title: "Risk & Compliance",
      icon: ShieldAlert,
      fields: [
        { key: "regulatory_status", label: "Certifications & Governance", value: getVal("regulatory_status"), type: "auto-pill" },
        { key: "legal_issues", label: "Legal & Regulatory Exposure", value: getVal("legal_issues"), type: "paragraph" },
        { key: "supply_chain_dependencies", label: "Critical Dependencies", value: getVal("supply_chain_dependencies"), type: "auto-pill" },
        { key: "geopolitical_risks", label: "Geopolitical & Cross-border Risks", value: getVal("geopolitical_risks"), type: "auto-pill" },
        { key: "macro_risks", label: "Macroeconomic Sensitivities", value: getVal("macro_risks"), type: "auto-pill" },
        { key: "cybersecurity_posture", label: "Cyber Defense Architecture", value: getVal("cybersecurity_posture"), type: "auto-pill" },
        { key: "layoff_history", label: "Workforce Restructuring History", value: getVal("layoff_history"), type: "text" },
      ],
    },
    {
      id: "work-location-commute",
      number: 16,
      title: "Work Location & Commute",
      icon: MapPin,
      fields: [
        { key: "remote_policy_details", label: "Remote & Hybrid Flexibility", value: getVal("remote_policy_details"), type: "text" },
        { key: "flexibility_level", label: "Work Model Classification", value: getVal("flexibility_level"), type: "auto-pill" },
        { key: "typical_hours", label: "Standard Working Hours", value: getVal("typical_hours"), type: "text" },
        { key: "overtime_expectations", label: "Overtime Expectations", value: getVal("overtime_expectations"), type: "text" },
        { key: "weekend_work", label: "Weekend Engagement", value: getVal("weekend_work"), type: "text" },
        { key: "office_zone_type", label: "Office Zone Classification", value: getVal("office_zone_type"), type: "text" },
        { key: "location_centrality", label: "Transit Connectivity", value: getVal("location_centrality"), type: "text" },
        { key: "public_transport_access", label: "Public Transit Hubs", value: getVal("public_transport_access"), type: "auto-pill" },
        { key: "cab_policy", label: "Corporate Commute / Cab Fleet", value: getVal("cab_policy"), type: "auto-pill" },
        { key: "airport_commute_time", label: "Average Airport Transit Time", value: getVal("airport_commute_time"), type: "text" },
      ],
    },
    {
      id: "safety-wellbeing",
      number: 17,
      title: "Safety & Wellbeing",
      icon: LifeBuoy,
      fields: [
        { key: "area_safety", label: "Campus & Neighborhood Security", value: getVal("area_safety"), type: "auto-pill" },
        { key: "safety_policies", label: "Late-night & Employee Safety", value: getVal("safety_policies"), type: "auto-pill" },
        { key: "infrastructure_safety", label: "Building & Facility Standards", value: getVal("infrastructure_safety"), type: "auto-pill" },
        { key: "emergency_preparedness", label: "Emergency Response & Drills", value: getVal("emergency_preparedness"), type: "auto-pill" },
        { key: "health_support", label: "Wellness & Psychological Support", value: getVal("health_support"), type: "auto-pill" },
      ],
    },
    {
      id: "career-growth-learning",
      number: 18,
      title: "Career Growth & Learning",
      icon: GraduationCap,
      fields: [
        { key: "training_spend", label: "Annual Learning Investment", value: getVal("training_spend"), type: "text" },
        { key: "onboarding_quality", label: "Graduate Onboarding Program", value: getVal("onboarding_quality"), type: "text" },
        { key: "learning_culture", label: "Certifications & Upskilling Culture", value: getVal("learning_culture"), type: "auto-pill" },
        { key: "exposure_quality", label: "Enterprise Technology Exposure", value: getVal("exposure_quality"), type: "text" },
        { key: "mentorship_availability", label: "Mentorship Networks", value: getVal("mentorship_availability"), type: "auto-pill" },
        { key: "internal_mobility", label: "Role & Practice Mobility", value: getVal("internal_mobility"), type: "text" },
        { key: "promotion_clarity", label: "Advancement & Promotion Framework", value: getVal("promotion_clarity"), type: "auto-pill" },
        { key: "tools_access", label: "Modern Developer Tools Access", value: getVal("tools_access"), type: "auto-pill" },
        { key: "role_clarity", label: "Role & Competency Clarity", value: getVal("role_clarity"), type: "text" },
        { key: "early_ownership", label: "Early Client Ownership", value: getVal("early_ownership"), type: "text" },
        { key: "work_impact", label: "Direct Business Impact", value: getVal("work_impact"), type: "auto-pill" },
        { key: "cross_functional_exposure", label: "Cross-functional Tracks", value: getVal("cross_functional_exposure"), type: "auto-pill" },
        { key: "exit_opportunities", label: "Industry Exit Opportunities", value: getVal("exit_opportunities"), type: "auto-pill" },
        { key: "skill_relevance", label: "Market Skill Relevance", value: getVal("skill_relevance"), type: "text" },
        { key: "network_strength", label: "Alumni Network Reach", value: getVal("network_strength"), type: "auto-pill" },
        { key: "global_exposure", label: "Global Mobility & Projects", value: getVal("global_exposure"), type: "auto-pill" },
      ],
    },
    {
      id: "brand-reputation",
      number: 19,
      title: "Brand & Reputation",
      icon: Sparkles,
      fields: [
        { key: "brand_value", label: "Brand Equity Standing", value: getVal("brand_value"), type: "text" },
        { key: "awards_recognitions", label: "Industry Awards & Recognitions", value: getVal("awards_recognitions"), type: "auto-pill" },
        { key: "brand_sentiment_score", label: "Public Sentiment Perception", value: getVal("brand_sentiment_score"), type: "paragraph" },
        { key: "marketing_video_url", label: "Official Spotlight Video", value: getVal("marketing_video_url"), type: "video" },
        { key: "customer_testimonials", label: "Key Case Highlights", value: getVal("customer_testimonials"), type: "auto-pill" },
        { key: "website_quality", label: "Digital Presence Quality", value: getVal("website_quality"), type: "text" },
      ],
    },
    {
      id: "compensation-benefits",
      number: 20,
      title: "Compensation & Benefits",
      icon: Gift,
      fields: [
        { key: "leave_policy", label: "Leave & Time Off Architecture", value: getVal("leave_policy"), type: "auto-pill" },
        { key: "fixed_vs_variable_pay", label: "Pay Structure Model", value: getVal("fixed_vs_variable_pay"), type: "text" },
        { key: "bonus_predictability", label: "Incentive Predictability", value: getVal("bonus_predictability"), type: "text" },
        { key: "esops_incentives", label: "Equity & Performance Incentives", value: getVal("esops_incentives"), type: "auto-pill" },
        { key: "family_health_insurance", label: "Dependent Medical Cover", value: getVal("family_health_insurance"), type: "auto-pill" },
        { key: "relocation_support", label: "Relocation Assistance", value: getVal("relocation_support"), type: "auto-pill" },
        { key: "lifestyle_benefits", label: "Wellness & Lifestyle Perks", value: getVal("lifestyle_benefits"), type: "auto-pill" },
      ],
    },
    {
      id: "digital-presence-ratings",
      number: 21,
      title: "Digital Presence & Ratings",
      icon: Share2,
      fields: [
        { key: "website_url", label: "Corporate Website", value: getVal("website_url"), type: "url" },
        { key: "linkedin_url", label: "LinkedIn Company Page", value: getVal("linkedin_url"), type: "url" },
        { key: "twitter_handle", label: "Twitter / X Profile", value: getVal("twitter_handle"), type: "text" },
        { key: "facebook_url", label: "Facebook Page", value: getVal("facebook_url"), type: "url" },
        { key: "instagram_url", label: "Instagram Channel", value: getVal("instagram_url"), type: "url" },
        { key: "website_traffic_rank", label: "Global Traffic Standing", value: getVal("website_traffic_rank"), type: "auto-pill" },
        { key: "social_media_followers", label: "Global Community Followers", value: getVal("social_media_followers"), type: "text" },
        { key: "glassdoor_rating", label: "Glassdoor Rating", value: getVal("glassdoor_rating"), type: "rating" },
        { key: "indeed_rating", label: "Indeed Workplace Rating", value: getVal("indeed_rating"), type: "rating" },
        { key: "google_rating", label: "Google Review Score", value: getVal("google_rating"), type: "rating" },
      ],
    },
    {
      id: "contact-information",
      number: 22,
      title: "Contact Information",
      icon: Mail,
      fields: [
        { key: "primary_contact_email", label: "Primary Campus/Talent Email", value: getVal("primary_contact_email"), type: "text" },
        { key: "primary_phone_number", label: "Campus Recruitment Helpline", value: getVal("primary_phone_number"), type: "text" },
        { key: "contact_person_name", label: "Designated Executive Contact", value: getVal("contact_person_name"), type: "text" },
        { key: "contact_person_title", label: "Designated Title", value: getVal("contact_person_title"), type: "text" },
        { key: "contact_person_email", label: "Executive Contact Email", value: getVal("contact_person_email"), type: "text" },
        { key: "contact_person_phone", label: "Executive Contact Phone", value: getVal("contact_person_phone"), type: "text" },
        { key: "ceo_linkedin_url", label: "CEO Professional Profile", value: getVal("ceo_linkedin_url"), type: "url" },
      ],
    },
  ];

  return sections;
}
