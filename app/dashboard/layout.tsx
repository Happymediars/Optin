import { Sidebar } from "@/components/dashboard/sidebar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="mx-auto flex min-h-[calc(100vh-65px)] max-w-7xl">
      <Sidebar />
      <section className="flex-1 p-6">{children}</section>
    </main>
  );
}
