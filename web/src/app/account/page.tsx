import type { Metadata } from "next";
import { DashboardShell } from "@/components/DashboardShell";
import { ProfilePanel } from "@/components/ProfilePanel";

export const metadata: Metadata = { title: "My account | Sukoonam" };

export default function AccountPage() {
  return (
    <DashboardShell>
      <ProfilePanel role="customer" nextUp="Your booking history will appear here." />
    </DashboardShell>
  );
}
