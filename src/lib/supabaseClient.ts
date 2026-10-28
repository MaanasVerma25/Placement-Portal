import { createClient } from "@supabase/supabase-js";

// Project credentials with fallback so the portal reliably connects to Supabase
const DEFAULT_SUPABASE_URL = "https://zhkogcekjgczpeuwbken.supabase.co";
const DEFAULT_SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpoa29nY2VramdjenBldXdia2VuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTIxMjI5NzUsImV4cCI6MjEwNzY5ODk3NX0.Zw4Sf7PfJjiJvVG_jte_T-_ts0iZVxUCPR2UTeto2K4";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || DEFAULT_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
