import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AnalyticsChart } from "@/components/dashboard/analytics-chart";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardHomePage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("campaign_stats_daily")
    .select("day, impressions, leads")
    .order("day", { ascending: true })
    .limit(14);

  const chartData = (data ?? []).map((d) => ({ date: d.day, impressions: d.impressions, leads: d.leads }));
  const totals = chartData.reduce(
    (acc, row) => ({ impressions: acc.impressions + row.impressions, leads: acc.leads + row.leads }),
    { impressions: 0, leads: 0 }
  );
  const conversion = totals.impressions ? ((totals.leads / totals.impressions) * 100).toFixed(2) : "0.00";

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Analytics</h1>
      <div className="grid gap-4 md:grid-cols-3">
        <Card><CardHeader><CardTitle>Impressions</CardTitle></CardHeader><CardContent>{totals.impressions}</CardContent></Card>
        <Card><CardHeader><CardTitle>Leads</CardTitle></CardHeader><CardContent>{totals.leads}</CardContent></Card>
        <Card><CardHeader><CardTitle>Conversion Rate</CardTitle></CardHeader><CardContent>{conversion}%</CardContent></Card>
      </div>
      <Card>
        <CardHeader><CardTitle>Last 14 days</CardTitle></CardHeader>
        <CardContent><AnalyticsChart data={chartData} /></CardContent>
      </Card>
    </div>
  );
}
