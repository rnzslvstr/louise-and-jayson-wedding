// src/lib/supabaseAdmin.ts
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Server-only client (service role). Do NOT import this in client components.
const supabaseAdmin = createClient(url, serviceRole, {
  auth: { persistSession: false },
});

export default supabaseAdmin;
