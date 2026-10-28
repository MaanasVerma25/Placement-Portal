-- ==============================================================================
-- JSS University Placement Intelligence Hub
-- Migration: Create student_resumes & candidate_profiles tables with RLS
-- Safe to re-run (idempotent) — drops policies before recreating them.
-- ==============================================================================

-- ============================================
-- 1. student_resumes table
-- ============================================
CREATE TABLE IF NOT EXISTS public.student_resumes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user_email TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  file_data TEXT, -- Base64 encoded document URI for instant retrieval
  storage_path TEXT,
  uploaded_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT student_resumes_user_id_key UNIQUE (user_id)
);

ALTER TABLE public.student_resumes ENABLE ROW LEVEL SECURITY;

-- Drop existing policies first (safe if they don't exist)
DROP POLICY IF EXISTS "Students can select own resume" ON public.student_resumes;
DROP POLICY IF EXISTS "Students can insert own resume" ON public.student_resumes;
DROP POLICY IF EXISTS "Students can update own resume" ON public.student_resumes;
DROP POLICY IF EXISTS "Students can delete own resume" ON public.student_resumes;

-- Recreate RLS policies
CREATE POLICY "Students can select own resume"
  ON public.student_resumes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Students can insert own resume"
  ON public.student_resumes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Students can update own resume"
  ON public.student_resumes FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Students can delete own resume"
  ON public.student_resumes FOR DELETE
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_student_resumes_user_id ON public.student_resumes(user_id);

-- ============================================
-- 2. candidate_profiles table
-- ============================================
CREATE TABLE IF NOT EXISTS public.candidate_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  headline TEXT,
  preferred_role TEXT,
  summary TEXT,
  location TEXT,
  linkedin_url TEXT,
  github_url TEXT,
  portfolio_url TEXT,
  education JSONB DEFAULT '[]'::jsonb,
  skills JSONB DEFAULT '{"radixSkills":[],"rawTechnicalSkills":[],"toolsAndFrameworks":[],"softSkills":[]}'::jsonb,
  projects JSONB DEFAULT '[]'::jsonb,
  experience JSONB DEFAULT '[]'::jsonb,
  certifications JSONB DEFAULT '[]'::jsonb,
  hackathons JSONB DEFAULT '[]'::jsonb,
  resume_file_name TEXT,
  extracted_at TIMESTAMPTZ DEFAULT NOW(),
  extraction_source TEXT DEFAULT 'direct_text',
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT candidate_profiles_user_id_key UNIQUE (user_id)
);

-- Ensure columns exist if table was already created
ALTER TABLE public.candidate_profiles ADD COLUMN IF NOT EXISTS preferred_role TEXT;
ALTER TABLE public.candidate_profiles ADD COLUMN IF NOT EXISTS hackathons JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.candidate_profiles ADD COLUMN IF NOT EXISTS resume_file_name TEXT;

ALTER TABLE public.candidate_profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies first (safe if they don't exist)
DROP POLICY IF EXISTS "Students can select own candidate profile" ON public.candidate_profiles;
DROP POLICY IF EXISTS "Students can insert own candidate profile" ON public.candidate_profiles;
DROP POLICY IF EXISTS "Students can update own candidate profile" ON public.candidate_profiles;
DROP POLICY IF EXISTS "Students can delete own candidate profile" ON public.candidate_profiles;

-- Recreate RLS policies
CREATE POLICY "Students can select own candidate profile"
  ON public.candidate_profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Students can insert own candidate profile"
  ON public.candidate_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Students can update own candidate profile"
  ON public.candidate_profiles FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Students can delete own candidate profile"
  ON public.candidate_profiles FOR DELETE
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_candidate_profiles_user_id ON public.candidate_profiles(user_id);

