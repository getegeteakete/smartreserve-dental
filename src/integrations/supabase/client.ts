// SmartReserve予約システム - Supabase Client
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// 環境変数から取得（.env.localで設定）
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "https://pzdrgwlqznnswztimryc.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB6ZHJnd2xxem5uc3d6dGltcnljIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc3NTM1NTAsImV4cCI6MjA3MzMyOTU1MH0.NudkhWsEBHHFXpycDFYha6LNxIch6W3xSHKWgoVH-nU";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);