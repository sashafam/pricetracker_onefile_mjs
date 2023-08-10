import { config as dotenvConfig } from 'dotenv';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

dotenvConfig();

const supabaseUrl: string = process.env.SUPABASE_URL!;
const supabaseKey: string = process.env.SUPABASE_KEY!;

const supabase: SupabaseClient = createClient(supabaseUrl, supabaseKey, {
  persistSession: false,
});

export default supabase;
