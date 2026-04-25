import { NextResponse } from "next/server";
import Papa from "papaparse";
import { createAdminClient } from "@/lib/supabase/admin";
import { getCurrentUserId } from "@/lib/auth";

export async function GET() {
  const userId = await getCurrentUserId();
  if (!userId) return new NextResponse("Unauthorized", { status: 401 });

  const supabase = createAdminClient();
  const { data } = await supabase
    .from("leads")
    .select("email,created_at,campaigns(name),sites(domain)")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  const csv = Papa.unparse(
    (data ?? []).map((lead) => ({
      email: lead.email,
      campaign: (lead.campaigns as { name?: string } | null)?.name ?? "",
      site: (lead.sites as { domain?: string } | null)?.domain ?? "",
      captured_at: lead.created_at
    }))
  );

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": 'attachment; filename="leads.csv"'
    }
  });
}
