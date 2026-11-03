import type { Metadata } from "next";
import { CustomerBookings } from "@/components/CustomerBookings";
import { DashboardShell } from "@/components/DashboardShell";
import { ProfilePanel } from "@/components/ProfilePanel";

export const metadata: Metadata = { title: "My account | Sukoonam" };

export default function AccountPage() {
  return (
    <DashboardShell>
      <ProfilePanel role="customer" nextUp={<CustomerBookings />} />
    </DashboardShell>
  );
}
