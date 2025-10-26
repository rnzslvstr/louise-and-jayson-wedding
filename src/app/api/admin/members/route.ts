// src/app/api/admin/members/route.ts
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

// GET: list members, optional ?household_id=...
export async function GET(req: Request) {
  const session = await requireSession();
  if (session instanceof NextResponse) return session;

  const { searchParams } = new URL(req.url);
  const household_id = searchParams.get("household_id") ?? undefined;

  let query = supabaseAdmin
    .from("members")
    .select("id,household_id,first_name,last_name,email,created_at")
    .order("created_at", { ascending: false });

  if (household_id) query = query.eq("household_id", household_id);

  const { data, error } = await query;
  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true, members: data });
}

// POST: create member {household_id, first_name, last_name, email?}
export async function POST(req: Request) {
  const session = await requireSession();
  if (session instanceof NextResponse) return session;

  const body = await req.json();
  const household_id = (body?.household_id ?? "").trim();
  const first_name = (body?.first_name ?? "").trim();
  const last_name = (body?.last_name ?? "").trim();
  const email = (body?.email ?? "").trim() || null;

  if (!household_id || !first_name || !last_name) {
    return NextResponse.json(
      { ok: false, error: "household_id, first_name, last_name are required" },
      { status: 400 }
    );
  }

  const { data, error } = await supabaseAdmin
    .from("members")
    .insert([{ household_id, first_name, last_name, email }])
    .select("id,household_id,first_name,last_name,email,created_at")
    .single();

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true, member: data });
}

// DELETE: ?id=<member_id>
export async function DELETE(req: Request) {
  const session = await requireSession();
  if (session instanceof NextResponse) return session;

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json({ ok: false, error: "Missing id" }, { status: 400 });
  }
  const { error } = await supabaseAdmin.from("members").delete().eq("id", id);
  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
