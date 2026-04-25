"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface CampaignRow { id: string; name: string; type: string; status: string; }

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<CampaignRow[]>([]);

  useEffect(() => {
    fetch("/api/campaigns").then(async (res) => setCampaigns(await res.json()));
  }, []);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Campaigns</CardTitle>
        <Button asChild><Link href="/dashboard/campaigns/new">New campaign</Link></Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {campaigns.map((campaign) => (
            <div key={campaign.id} className="flex items-center justify-between rounded-md border p-3">
              <div>
                <p className="font-medium">{campaign.name}</p>
                <p className="text-sm text-slate-500">{campaign.type}</p>
              </div>
              <Badge>{campaign.status}</Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
