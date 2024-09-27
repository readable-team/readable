import { createClient } from '@supabase/supabase-js';
import { env } from '$env/dynamic/public';

export const supabase = createClient(env.PUBLIC_SUPABASE_URL, env.PUBLIC_SUPABASE_KEY);
