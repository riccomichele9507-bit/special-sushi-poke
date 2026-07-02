import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth/require-admin";
import { createClient } from "@/lib/supabase/server";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { PrinterStatusBanner } from "@/components/admin/printer-status-banner";

export const metadata: Metadata = {
  title: "Admin — Special Sushi Poke",
  robots: { index: false, follow: false },
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireAdmin();
  const supabase = await createClient();
  const { data: health } = await supabase
    .from("printer_health")
    .select(
      "last_poll_at, paper_status, pending_jobs_count, oldest_pending_age_seconds, printing_in_progress",
    )
    .eq("id", 1)
    .maybeSingle();

  return (
    <div className="min-h-screen bg-paper md:flex">
      <AdminSidebar userEmail={user.email ?? ""} />
      <div className="flex-1 flex flex-col min-w-0">
        <PrinterStatusBanner initialHealth={health ?? null} />
        <main className="flex-1 p-6 max-w-6xl w-full mx-auto">{children}</main>
      </div>
    </div>
  );
}
