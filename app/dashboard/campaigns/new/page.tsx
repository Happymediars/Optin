"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";

interface Site { id: string; domain: string; }

export default function NewCampaignPage() {
  const router = useRouter();
  const [sites, setSites] = useState<Site[]>([]);
  const [form, setForm] = useState({
    site_id: "",
    name: "",
    type: "lightbox",
    headline: "Get 10% off",
    subheadline: "Join our newsletter.",
    button_text: "Subscribe",
    success_message: "Thanks for subscribing!",
    delaySeconds: 3,
    scrollPercent: 50,
    exitIntent: true,
    urlContains: "",
    device: "all",
    frequencyHours: 24,
    status: "active"
  });

  useEffect(() => {
    fetch("/api/sites").then(async (res) => {
      const rows = await res.json();
      setSites(rows);
      if (rows[0]) setForm((f) => ({ ...f, site_id: rows[0].id }));
    });
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    await fetch("/api/campaigns", { method: "POST", body: JSON.stringify(form) });
    router.push("/dashboard/campaigns");
  }

  return (
    <form className="space-y-6" onSubmit={onSubmit}>
      <Card>
        <CardHeader><CardTitle>Campaign setup</CardTitle></CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div><Label>Website</Label><Select value={form.site_id} onChange={(e)=>setForm({...form,site_id:e.target.value})}>{sites.map((s)=><option key={s.id} value={s.id}>{s.domain}</option>)}</Select></div>
          <div><Label>Name</Label><Input value={form.name} onChange={(e)=>setForm({...form,name:e.target.value})} required /></div>
          <div><Label>Type</Label><Select value={form.type} onChange={(e)=>setForm({...form,type:e.target.value})}><option value="lightbox">Lightbox popup</option><option value="floating_bar">Floating bar</option><option value="slide_in">Slide-in</option><option value="fullscreen">Fullscreen welcome mat</option><option value="inline">Inline form</option></Select></div>
          <div><Label>Status</Label><Select value={form.status} onChange={(e)=>setForm({...form,status:e.target.value})}><option value="active">Active</option><option value="draft">Draft</option><option value="paused">Paused</option></Select></div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Simple form editor</CardTitle></CardHeader>
        <CardContent className="grid gap-4">
          <div><Label>Headline</Label><Input value={form.headline} onChange={(e)=>setForm({...form,headline:e.target.value})} /></div>
          <div><Label>Subheadline</Label><Input value={form.subheadline} onChange={(e)=>setForm({...form,subheadline:e.target.value})} /></div>
          <div><Label>Button text</Label><Input value={form.button_text} onChange={(e)=>setForm({...form,button_text:e.target.value})} /></div>
          <div><Label>Success message</Label><Input value={form.success_message} onChange={(e)=>setForm({...form,success_message:e.target.value})} /></div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Display rules</CardTitle></CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div><Label>After X seconds</Label><Input type="number" value={form.delaySeconds} onChange={(e)=>setForm({...form,delaySeconds:Number(e.target.value)})} /></div>
          <div><Label>Scroll percentage</Label><Input type="number" value={form.scrollPercent} onChange={(e)=>setForm({...form,scrollPercent:Number(e.target.value)})} /></div>
          <div><Label>Exit intent</Label><Select value={String(form.exitIntent)} onChange={(e)=>setForm({...form,exitIntent:e.target.value === "true"})}><option value="true">Enabled</option><option value="false">Disabled</option></Select></div>
          <div><Label>URL contains</Label><Input value={form.urlContains} onChange={(e)=>setForm({...form,urlContains:e.target.value})} placeholder="/pricing" /></div>
          <div><Label>Device targeting</Label><Select value={form.device} onChange={(e)=>setForm({...form,device:e.target.value})}><option value="all">All</option><option value="desktop">Desktop</option><option value="mobile">Mobile</option></Select></div>
          <div><Label>Frequency cap (hours)</Label><Input type="number" value={form.frequencyHours} onChange={(e)=>setForm({...form,frequencyHours:Number(e.target.value)})} /></div>
        </CardContent>
      </Card>
      <Button type="submit">Create campaign</Button>
    </form>
  );
}
