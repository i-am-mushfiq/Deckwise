import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Returns null if env vars are not set yet (dev without Supabase configured).
// All callers guard with `if (!supabase) return;`
export const supabase = (url && key) ? createClient(url, key) : null;
