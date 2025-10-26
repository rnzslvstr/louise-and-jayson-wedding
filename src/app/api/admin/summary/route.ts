export const runtime = 'nodejs';

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { COOKIE_NAME, verifySession } from "@/lib/auth";
import supabaseAdmin from "@/lib/supabaseAdmin";

async function requireSession() {
  const token = (await cookies()).get(COOKIE_NAME)?.value;
  const session = verifySession(token);
  if (!session) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }
  return session;
}

type Totals = { total: number; accept: number; decline: number; pending: number };

function tally(rows: Array<{ status: "accept" | "decline" | "pending" }>): Totals {
  const out: Totals = { total: 0, accept: 0, decline: 0, pending: 0 };
  for (const r of rows) {
    out.total += 1;
    if (r.status === "accept") out.accept += 1;
    else if (r.status === "decline") out.decline += 1;
    else out.pending += 1;
  }
  return out;
}

export async function GET(req: Request) {
  const session = await requireSession();
  if (session instanceof NextResponse) return session;

  const { searchParams } = new URL(req.url);
  const household_id = searchParams.get("household_id");

  try {
    if (household_id) {
      const { data: members, error: mErr } = await supabaseAdmin
        .from("members")
        .select("id")
        .eq("household_id", household_id);
      if (mErr) return NextResponse.json({ ok: false, error: mErr.message }, { status: 500 });

      const ids = (members ?? []).map((m) => m.id);
      if (ids.length === 0) {
        return NextResponse.json({ ok: true, totals: { total: 0, accept: 0, decline: 0, pending: 0 } });
      }

      const { data: rsvps, error: rErr } = await supabaseAdmin
        .from("rsvps")
        .select("status")
        .in("member_id", ids);
      if (rErr) return NextResponse.json({ ok: false, error: rErr.message }, { status: 500 });

      const totals = tally((rsvps ?? []) as any);
      return NextResponse.json({ ok: true, totals });
    } else {
      const { data: rsvps, error: rErr } = await supabaseAdmin
        .from("rsvps")
        .select("status");
      if (rErr) return NextResponse.json({ ok: false, error: rErr.message }, { status: 500 });

      const totals = tally((rsvps ?? []) as any);
      return NextResponse.json({ ok: true, totals });
    }
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message ?? "Summary failed" }, { status: 500 });
  }
}
