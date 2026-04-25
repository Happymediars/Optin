import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getCurrentUserId } from "@/lib/auth";

export async function GET() {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json([], { status: 401 });

  const supabase = createAdminClient();
  const { data } = await supabase
    .from("campaigns")
    .select("id,name,type,status")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  return NextResponse.json(data ?? []);
}

export async function POST(req: Request) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const supabase = createAdminClient();
  const payload = {
    user_id: userId,
    site_id: body.site_id,
    name: body.name,
    type: body.type,
    status: body.status,
    headline: body.headline,
    subheadline: body.subheadline,
    button_text: body.button_text,
    success_message: body.success_message,
    display_rules: {
      delaySeconds: body.delaySeconds,
      scrollPercent: body.scrollPercent,
      exitIntent: body.exitIntent,
      urlContains: body.urlContains,
      device: body.device,
      frequencyHours: body.frequencyHours
    }
  };

  const { data, error } = await supabase.from("campaigns").insert(payload).select("id").single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data);
}
