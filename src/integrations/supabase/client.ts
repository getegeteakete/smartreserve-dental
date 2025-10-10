// SmartReserve予約システム - Supabase Client
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// 環境変数から取得（.env.localで設定）
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "https://vnwnevhakhgbbxxlmutx.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZud25ldmhha2hnYmJ4eGxtdXR4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAwODExMzEsImV4cCI6MjA3NTY1NzEzMX0.hqpohfHtthILwY9wSRwoPQI9h_wnfaJ_ZSosZzkUW-8";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);