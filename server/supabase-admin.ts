import 'dotenv/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE || process.env.SUPABASE_KEY;

if (!supabaseUrl) {
  console.warn('SUPABASE_URL is not set. Supabase admin client will not be available.');
}
if (!serviceRoleKey) {
  console.warn('SUPABASE_SERVICE_ROLE is not set. Supabase admin client will not be available.');
}

export const supabaseAdmin: SupabaseClient | undefined = (supabaseUrl && serviceRoleKey)
  ? createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false },
      db: { schema: 'public' },
    })
  : undefined;


