import Link from "next/link";

const links = [
  { href: "/dashboard", label: "Overview" },
  { href: "/dashboard/sites", label: "Websites" },
  { href: "/dashboard/campaigns", label: "Campaigns" },
  { href: "/dashboard/leads", label: "Leads" },
  { href: "/dashboard/settings/embed", label: "Embed" }
];

export function Sidebar() {
  return (
    <aside className="w-56 border-r bg-white p-4">
      <h2 className="mb-3 text-xs font-semibold uppercase text-slate-500">Dashboard</h2>
      <nav className="space-y-1">
        {links.map((item) => (
          <Link key={item.href} className="block rounded-md px-3 py-2 text-sm hover:bg-slate-100" href={item.href}>
            {item.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
