import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getCurrentUserId } from "@/lib/auth";

export async function GET() {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json([], { status: 401 });

  const supabase = createAdminClient();
  const { data } = await supabase
    .from("leads")
    .select("id,email,created_at,campaigns(name)")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(500);

  return NextResponse.json(
    (data ?? []).map((row) => ({
      id: row.id,
      email: row.email,
      created_at: row.created_at,
      campaign_name: (row.campaigns as { name?: string } | null)?.name ?? "Unknown"
    }))
  );
}
