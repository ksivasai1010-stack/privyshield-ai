import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = (process.env.SUPABASE_URL || '').trim();
// Prioritize Service Role Key for backend administrative operations; fallback to Anon Key
const supabaseKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || '').trim();

let supabaseClient = null;

if (supabaseUrl && supabaseKey && !supabaseUrl.includes('your-project') && !supabaseKey.includes('your-supabase')) {
  try {
    supabaseClient = createClient(supabaseUrl, supabaseKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });
    // Mask endpoint domain for security
    const maskedUrl = supabaseUrl.replace(/^(https?:\/\/)([^.]+)(\..*)$/, '$1***$3');
    console.log(`[Supabase] Backend client initialized with endpoint: ${maskedUrl}`);
  } catch (err) {
    console.warn('[Supabase] Failed to initialize client. Verify URL format in backend/.env.');
  }
} else {
  console.log('[Supabase] Remote credentials not configured in backend/.env. Using local resilient security store.');
}

export const supabase = supabaseClient;
export function isSupabaseConnected() {
  return !!supabaseClient;
}
