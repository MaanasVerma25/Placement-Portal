# JSS UNIVERSITY Companies Research & Placement Analytics Portal
> Also known as **JSS Placement Intelligence Hub**

A mobile-first, enterprise-grade React + Vite + TypeScript + Tailwind v3 + shadcn/ui Single Page Application designed for students and placement teams to evaluate campus recruiting organizations across 22 comprehensive intelligence dimensions and technical competency ladders.

---

## 1. Phase 1 Scope & Architecture (UI-Only)

- **UI-Only Phase**: This phase implements the complete frontend shell, components, animations, navigation, and state persistence with **zero database dependencies**.
- **No Supabase / Database in Phase 1**: No Supabase client, no SQL migrations, no RLS policies, and no `@supabase/supabase-js` dependency.
- **Single Seed Source**: All company data originates from `src/data/seedCompanies.ts`, containing a real-world enterprise dataset for **Accenture plc** mapping 1:1 to future JSONB database schemas.
- **Data Layer Normalizers**: In `src/lib/companyData.ts`, pure functions (`normalizeCompanySummary`, `normalizeCompanyProfile`, `normalizeDashboardSkills`) accept raw JSON shapes (`short_json`, `full_json`, `skill_levels`). Transitioning to Supabase in Phase 2 requires changing only the data provider file without modifying UI components.

---

## 2. Public Access & Zero Auth Constraint

- **Completely Public**: There is **no authentication**, no `/login` route, no `AuthContext`, no `ProtectedRoute`, and no logout action.
- **Direct Linkability**: Every visitor can access all pages, research recruiting companies, and explore skill roadmaps directly.

---

## 3. Institution Details

- **College Name**: **JSS UNIVERSITY**
- **College Short Name**: **JSS**
- **Brand Wordmark**: Text-based wordmark (`JSS UNIVERSITY`) with an accompanying enterprise pill (`JSS · INTELLIGENCE PLATFORM`).
- **College Logo Constraint**: In strict adherence to guidelines, no college logo asset (`.png`, `.jpg`, `.svg`) is present in `public/` or referenced anywhere in code.

---

## 4. Design System & Tokens

Built with enterprise SaaS aesthetics (clean Google Workspace style):
- **Typography**: Outfit for all headings (`font-heading`), Inter for body text (`font-body`) via Google Fonts.
- **Clean Palette**:
  - Main background: `#FFFFFF`
  - Sidebar background: `#F8FAFC` (border `#E5E7EB`, text `#334155`)
  - Active navigation: `#2563EB` text on `#EFF6FF` background with subtle border
- **Category Colors (Exact Hex)**:
  - Super Dream: `#7c3aed`
  - Dream: `#2563eb`
  - Standard: `#16a34a`
  - Regular: `#d97706`
- **Bloom's Taxonomy Levels (Exact Hex)**:
  - CU (Conceptual Understanding): `#3b82f6`
  - AP (Applied Problem Solving): `#22c55e`
  - AS (Analytical Synthesis): `#eab308`
  - EV (Evaluative Architecture): `#ef4444`
  - CR (Creative Innovation): `#a855f7`
- **Strict Privacy Compliance**: Absolutely **no CTC, Stipend, or Selection Ratio** metrics appear anywhere across the portal.

---

## 5. Routing Architecture

Nested React Router 6 configuration:

```tsx
<Routes>
  <Route path="/" element={<Index />} />

  <Route path="/company" element={<AppLayout />}>
    <Route index element={<Navigate to="intelligence" replace />} />
    <Route path="intelligence" element={<CompanyIntelligence />} />
    <Route path="skills" element={<SkillIntelligence />} />
  </Route>

  <Route path="*" element={<NotFound />} />
</Routes>
```

- `/` – Directory of recruiting companies with live debounced search, category filter pills, and company cards.
- `/company` – Automatically redirects to `/company/intelligence`.
- `/company/intelligence` – Sticky company header, 22-tab scroll-spy navigation, and 22 intelligence section cards.
- `/company/skills` – Bloom taxonomy scale, Criticality framework, and 12 technical skill cards with expandable 10-level milestone ladders.
- `*` – Dedicated 404 page for unmatched URLs only.

---

## 6. Local Storage Persistence & Refresh Resilience

When a company card is clicked:
1. Object `{ companyId, companyName, logoUrl }` is persisted to `localStorage` under key `"selected-company"`.
2. `CompanyContext` restores this company on page reload.
3. Refreshing directly on `/company/intelligence` or `/company/skills` retains the active company.
4. If storage is empty when visiting a company route, the user is redirected gracefully to `/` (never rendering a false 404).

---

## 7. 22 Intelligence Dimensions (in order)

1. Company Identity
2. Overview & Vision
3. Leadership
4. Funding & Financials
5. Global Presence
6. Products & Services
7. Technology Stack
8. Partnerships & Ecosystem
9. Competitive Landscape
10. Market Opportunity
11. Core Value Proposition & ESG
12. Culture & Work Life
13. Recent News & Milestones
14. Sales & Customer Metrics
15. Risk & Compliance
16. Work Location & Commute
17. Safety & Wellbeing
18. Career Growth & Learning
19. Brand & Reputation
20. Compensation & Benefits
21. Digital Presence & Ratings
22. Contact Information

---

## 8. Verification & Test Commands

Run the test suite:
```bash
npm test
```

Run production build:
```bash
npm run build
```

Run local development server:
```bash
npm run dev
```

---

## 9. Phase 2 — Supabase

Paste `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` into `.env`, then:
```bash
npm install && npm run dev
```

### Architecture & Data Rules
- **Direct JSON Table**: Read-only connection using `@supabase/supabase-js`. Company listings and profiles query `public.company_json` exclusively (`short_json` and `full_json`). No joins on 90+ normalized company tables.
- **Skill Competency Tables**: Required skills and 10-level milestone roadmaps query only 4 dedicated tables:
  1. `public.company_skill_levels`
  2. `public.skill_set_master`
  3. `public.proficiency_levels`
  4. `public.skill_set_topics`
- **Data Normalizers**: Pure normalizers in `src/lib/companyData.ts` (`normalizeCompanySummary`, `normalizeCompanyProfile`, `normalizeDashboardSkills`) pipe Supabase rows into standard dashboard models.
- **Zero Auth & Strict Privacy**: Completely public SPA. No authentication, login, or credentials UI. Absolutely no CTC, Stipend, or Selection Ratio metrics are displayed.

