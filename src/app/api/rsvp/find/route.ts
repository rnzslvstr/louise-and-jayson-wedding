// src/app/api/rsvp/find/route.ts
import { NextResponse } from "next/server";
import supabaseAdmin from "@/lib/supabaseAdmin";

/**
 * Body: { full_name: string }
 * Returns: { ok: true, household, members } or { ok: false, error }
 *
 * Simple name match:
 *  - Split full_name on spaces → first token = first_name, last token = last_name
 *  - Case-insensitive search in members
 *  - If multiple matches exist, returns the first household found
 */
export async function POST(req: Request) {
  try {
    const { full_name } = await req.json();
    if (!full_name || typeof full_name !== "string") {
      return NextResponse.json(
        { ok: false, error: "Full name is required" },
        { status: 400 }
      );
    }

    // naive parsing: first word = first, last word = last
    const parts = full_name.trim().split(/\s+/);
    if (parts.length < 2) {
      return NextResponse.json(
        { ok: false, error: "Please enter first and last name" },
        { status: 400 }
      );
    }
    const first = parts[0];
    const last = parts[parts.length - 1];

    const { data: memberMatch, error: memberErr } = await supabaseAdmin
      .from("members")
      .select("id, household_id, first_name, last_name")
      .ilike("first_name", first)
      .ilike("last_name", last)
      .limit(1)
      .maybeSingle();

    if (memberErr) {
      return NextResponse.json(
        { ok: false, error: memberErr.message },
        { status: 500 }
      );
    }

    if (!memberMatch) {
      return NextResponse.json(
        { ok: false, error: "We couldn't find your name. Please check spelling or contact the couple." },
        { status: 404 }
      );
    }

    const household_id = memberMatch.household_id;

    const { data: household, error: hErr } = await supabaseAdmin
      .from("households")
      .select("id, label, search_key, created_at")
      .eq("id", household_id)
      .single();

    if (hErr) {
      return NextResponse.json({ ok: false, error: hErr.message }, { status: 500 });
    }

    const { data: members, error: mErr } = await supabaseAdmin
      .from("members")
      .select("id, first_name, last_name, email")
      .eq("household_id", household_id)
      .order("created_at", { ascending: true });

    if (mErr) {
      return NextResponse.json({ ok: false, error: mErr.message }, { status: 500 });
    }

    // Also include current RSVP statuses (if any)
    const memberIds = (members ?? []).map((m) => m.id);
    let rsvps: Record<string, string> = {};
    if (memberIds.length) {
      const { data: rsvpRows, error: rErr } = await supabaseAdmin
        .from("rsvps")
        .select("member_id, status")
        .in("member_id", memberIds);
      if (rErr) {
        return NextResponse.json({ ok: false, error: rErr.message }, { status: 500 });
      }
      rsvps = Object.fromEntries((rsvpRows ?? []).map((r) => [r.member_id, r.status]));
    }

    return NextResponse.json({
      ok: true,
      household,
      members,
      rsvps,
      found_member_id: memberMatch.id,
    });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message ?? "Lookup failed" },
      { status: 500 }
    );
  }
}
