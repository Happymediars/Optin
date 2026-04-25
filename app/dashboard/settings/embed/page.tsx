import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function EmbedPage() {
  return (
    <Card>
      <CardHeader><CardTitle>Embed script</CardTitle></CardHeader>
      <CardContent>
        <p className="mb-3 text-sm text-slate-600">Paste this script on every page of your website.</p>
        <pre className="overflow-x-auto rounded-md bg-slate-900 p-4 text-sm text-slate-100">
{`<script src="https://your-app-domain.com/widget.js" data-site-id="SITE_ID"></script>`}
        </pre>
      </CardContent>
    </Card>
  );
}
