import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="text-4xl font-bold">OptinMonster-style SaaS MVP</h1>
      <p className="mt-4 text-slate-600">Build campaigns, capture leads, and track conversions.</p>
      <div className="mt-8 flex gap-3">
        <Button asChild>
          <Link href="/sign-up">Get started</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/dashboard">Open dashboard</Link>
        </Button>
      </div>
    </main>
  );
}
