import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

const configured =
  url && key &&
  !url.includes('your-project-id') &&
  !key.includes('your-anon');

export const supabase = configured ? createClient(url, key) : null;
