// src/lib/supabaseClient.ts
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const anon = process.env.SUPABASE_ANON_KEY!;

// Browser-safe client (uses anon key)
const supabaseClient = createClient(url, anon);

export default supabaseClient;
