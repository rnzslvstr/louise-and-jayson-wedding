// src/app/api/rsvp/submit/route.ts
import { NextResponse } from "next/server";
import supabaseAdmin from "@/lib/supabaseAdmin";

/**
 * Body: {
 *   household_id: string,
 *   decisions: Array<{ member_id: string, status: 'accept' | 'decline' }>,
 *   submitter_email: string,
 *   found_member_id?: string
 * }
 *
 * Behavior:
 *  - Locks updates if current time >= RSVP_LOCK_ISO (if provided)
 *  - Validates all member_ids belong to household_id
 *  - Upserts RSVPs for each member
 *  - Stores submitter_email on each row (best-effort record of who submitted)
 */
export async function POST(req: Request) {
  try {
    const { household_id, decisions, submitter_email, found_member_id } = await req.json();

    if (!household_id || !Array.isArray(decisions) || decisions.length === 0) {
      return NextResponse.json(
        { ok: false, error: "household_id and decisions are required" },
        { status: 400 }
      );
    }

    // Lock check
    const lockIso = process.env.RSVP_LOCK_ISO;
    if (lockIso) {
      const now = new Date();
      const lock = new Date(lockIso);
      if (!isNaN(lock.getTime()) && now >= lock) {
        return NextResponse.json(
          { ok: false, error: "RSVP updates are closed. Please contact the couple for changes." },
          { status: 403 }
        );
      }
    }

    // Validate household exists
    const { data: household, error: hErr } = await supabaseAdmin
      .from("households")
      .select("id")
      .eq("id", household_id)
      .single();

    if (hErr || !household) {
      return NextResponse.json(
        { ok: false, error: "Household not found" },
        { status: 404 }
      );
    }

    // Load members of household
    const { data: members, error: mErr } = await supabaseAdmin
      .from("members")
      .select("id")
      .eq("household_id", household_id);

    if (mErr) {
      return NextResponse.json({ ok: false, error: mErr.message }, { status: 500 });
    }

    const allowedIds = new Set((members ?? []).map((m) => m.id));
    const invalid = (decisions as any[]).find(
      (d) => !d?.member_id || !allowedIds.has(d.member_id) || !["accept", "decline"].includes(d.status)
    );
    if (invalid) {
      return NextResponse.json(
        { ok: false, error: "One or more decisions are invalid for this household" },
        { status: 400 }
      );
    }

    // Upsert RSVPs
    // Note: rsvps.member_id is UNIQUE, so insert...on conflict do update
    const rows = decisions.map((d: any) => ({
      member_id: d.member_id,
      status: d.status,
      submitted_by_member_id: found_member_id ?? null,
      submitted_by_email: submitter_email ?? null,
      updated_at: new Date().toISOString(),
    }));

    const { error: upErr } = await supabaseAdmin.from("rsvps").upsert(rows, {
      onConflict: "member_id",
    });

    if (upErr) {
      return NextResponse.json({ ok: false, error: upErr.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message ?? "Submit failed" },
      { status: 500 }
    );
  }
}
