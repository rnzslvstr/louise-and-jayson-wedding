// src/app/api/health/route.ts
import { NextResponse } from "next/server";
import supabaseAdmin from "@/lib/supabaseAdmin";

export async function GET() {
  try {
    const lockIso = process.env.RSVP_LOCK_ISO ?? "not-set";

    // Try a simple read from the settings table (created earlier)
    const { data: settings, error } = await supabaseAdmin
      .from("settings")
      .select("key,value")
      .eq("key", "rsvp_lock_iso")
      .maybeSingle();

    if (error) throw error;

    return NextResponse.json({
      ok: true,
      env: {
        NEXT_PUBLIC_SUPABASE_URL: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL),
        SUPABASE_ANON_KEY: Boolean(process.env.SUPABASE_ANON_KEY),
        SUPABASE_SERVICE_ROLE_KEY: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
        RSVP_LOCK_ISO: lockIso,
      },
      db: { settings },
    });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message ?? String(e) },
      { status: 500 }
    );
  }
}
