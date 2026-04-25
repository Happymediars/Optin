import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(req: Request) {
  const supabase = createAdminClient();
  const body = await req.json();

  if (body.type === "impression") {
    await supabase.from("campaign_events").insert({
      site_id: body.siteId,
      campaign_id: body.campaignId,
      event_type: "impression",
      metadata: { path: body.path }
    });
  }

  if (body.type === "lead") {
    await supabase.from("campaign_events").insert({
      site_id: body.siteId,
      campaign_id: body.campaignId,
      event_type: "lead",
      metadata: { path: body.path }
    });

    await supabase.from("leads").insert({
      site_id: body.siteId,
      campaign_id: body.campaignId,
      user_id: body.userId,
      email: body.email,
      metadata: { source: "widget" }
    });
  }

  return NextResponse.json({ ok: true });
}
