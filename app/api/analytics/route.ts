import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getCurrentUserId } from "@/lib/auth";

export async function GET() {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json([], { status: 401 });

  const supabase = createAdminClient();
  const { data } = await supabase
    .from("campaign_stats_daily")
    .select("day,impressions,leads,conversion_rate")
    .eq("user_id", userId)
    .order("day", { ascending: true });

  return NextResponse.json(data ?? []);
}
