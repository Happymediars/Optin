"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

interface Site { id: string; domain: string; }

export default function SitesPage() {
  const [sites, setSites] = useState<Site[]>([]);
  const [domain, setDomain] = useState("");

  async function loadSites() {
    const res = await fetch("/api/sites");
    setSites(await res.json());
  }

  async function addSite(e: React.FormEvent) {
    e.preventDefault();
    await fetch("/api/sites", { method: "POST", body: JSON.stringify({ domain }) });
    setDomain("");
    loadSites();
  }

  useEffect(() => {
    loadSites();
  }, []);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader><CardTitle>Add website/domain</CardTitle></CardHeader>
        <CardContent>
          <form className="flex gap-3" onSubmit={addSite}>
            <Input placeholder="example.com" value={domain} onChange={(e) => setDomain(e.target.value)} />
            <Button type="submit">Add</Button>
          </form>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>Websites</CardTitle></CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {sites.map((site) => <li key={site.id} className="rounded-md border p-3">{site.domain}</li>)}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
