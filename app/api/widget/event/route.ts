import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

function withCors(res: NextResponse) {
  res.headers.set("Access-Control-Allow-Origin", "*");
  res.headers.set("Access-Control-Allow-Methods", "POST,OPTIONS");
  res.headers.set("Access-Control-Allow-Headers", "content-type");
  return res;
}

export async function OPTIONS() {
  return withCors(new NextResponse(null, { status: 204 }));
}

export async function POST(req: Request) {
  const supabase = createAdminClient();
  const body = await req.json();

  if (!body.siteId || !body.campaignId || !body.type) {
    return withCors(NextResponse.json({ error: "Missing required payload" }, { status: 400 }));
  }

  const { data: campaign } = await supabase
    .from("campaigns")
    .select("id,user_id,site_id")
    .eq("id", body.campaignId)
    .eq("site_id", body.siteId)
    .single();

  if (!campaign) {
    return withCors(NextResponse.json({ error: "Invalid site/campaign" }, { status: 404 }));
  }

  if (body.type === "impression") {
    await supabase.from("campaign_events").insert({
      site_id: body.siteId,
      campaign_id: body.campaignId,
      event_type: "impression",
      metadata: { path: body.path ?? null, pageUrl: body.pageUrl ?? null }
    });
  }

  if (body.type === "lead") {
    if (!body.email || typeof body.email !== "string") {
      return withCors(NextResponse.json({ error: "Email required" }, { status: 400 }));
    }

    await supabase.from("campaign_events").insert({
      site_id: body.siteId,
      campaign_id: body.campaignId,
      event_type: "lead",
      metadata: { path: body.path ?? null, pageUrl: body.pageUrl ?? null }
    });

    await supabase.from("leads").insert({
      site_id: body.siteId,
      campaign_id: body.campaignId,
      user_id: campaign.user_id,
      email: body.email,
      metadata: { source: "widget", pageUrl: body.pageUrl ?? null }
    });
  }

  return withCors(NextResponse.json({ ok: true }));
}
