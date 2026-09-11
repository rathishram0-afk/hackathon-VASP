import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  // Surfaced at first use rather than import time to keep pages that don't
  // need auth (e.g. static marketing routes) from crashing at build time.
  console.warn(
    'NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY must be set (see .env.example) for authentication to work.'
  );
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
