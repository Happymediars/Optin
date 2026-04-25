import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

function deviceMatches(device: string, userAgent: string) {
  const isMobile = /Mobi|Android/i.test(userAgent);
  if (device === "mobile") return isMobile;
  if (device === "desktop") return !isMobile;
  return true;
}

function withCors(res: NextResponse) {
  res.headers.set("Access-Control-Allow-Origin", "*");
  res.headers.set("Access-Control-Allow-Methods", "GET,OPTIONS");
  res.headers.set("Access-Control-Allow-Headers", "content-type");
  return res;
}

export async function OPTIONS() {
  return withCors(new NextResponse(null, { status: 204 }));
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const siteId = url.searchParams.get("siteId");
  const pageUrl = url.searchParams.get("url") || "";
  const userAgent = req.headers.get("user-agent") || "";

  if (!siteId) return withCors(NextResponse.json({ campaigns: [] }));

  const supabase = createAdminClient();
  const { data } = await supabase
    .from("campaigns")
    .select("id,name,type,headline,subheadline,button_text,success_message,display_rules,status")
    .eq("site_id", siteId)
    .eq("status", "active");

  const campaigns = (data ?? []).filter((campaign) => {
    const rules = campaign.display_rules as { urlContains?: string; device?: string };
    if (rules.urlContains && !pageUrl.includes(rules.urlContains)) return false;
    return deviceMatches(rules.device ?? "all", userAgent);
  });

  return withCors(NextResponse.json({ campaigns }));
}
