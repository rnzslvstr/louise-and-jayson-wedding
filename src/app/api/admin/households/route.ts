// src/app/api/admin/households/route.ts
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

// GET: list households
export async function GET() {
  const session = await requireSession();
  if (session instanceof NextResponse) return session;

  const { data, error } = await supabaseAdmin
    .from("households")
    .select("id,label,search_key,created_at")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true, households: data });
}

// POST: create household {label, search_key}
export async function POST(req: Request) {
  const session = await requireSession();
  if (session instanceof NextResponse) return session;

  const body = await req.json();
  const label = (body?.label ?? "").trim();
  const search_key = (body?.search_key ?? "").trim();

  if (!label && !search_key) {
    return NextResponse.json(
      { ok: false, error: "Provide at least a label or a search_key" },
      { status: 400 }
    );
  }

  const { data, error } = await supabaseAdmin
    .from("households")
    .insert([{ label: label || null, search_key: search_key || null }])
    .select("id,label,search_key,created_at")
    .single();

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true, household: data });
}

// DELETE: ?id=<household_id>
export async function DELETE(req: Request) {
  const session = await requireSession();
  if (session instanceof NextResponse) return session;

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json({ ok: false, error: "Missing id" }, { status: 400 });
  }
  const { error } = await supabaseAdmin.from("households").delete().eq("id", id);
  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
