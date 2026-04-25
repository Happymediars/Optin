import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getCurrentUserId } from "@/lib/auth";

export async function GET() {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json([], { status: 401 });

  const supabase = createAdminClient();
  const { data } = await supabase.from("sites").select("id,domain").eq("user_id", userId).order("created_at", { ascending: false });
  return NextResponse.json(data ?? []);
}

export async function POST(req: Request) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("sites")
    .insert({ user_id: userId, domain: body.domain.replace(/^https?:\/\//, "") })
    .select("id,domain")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data);
}
