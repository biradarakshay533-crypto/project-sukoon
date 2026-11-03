import type { Metadata } from "next";
import { DashboardShell } from "@/components/DashboardShell";
import { PartnerSpaCard } from "@/components/PartnerSpaCard";
import { ProfilePanel } from "@/components/ProfilePanel";

export const metadata: Metadata = { title: "Partner dashboard | Sukoonam" };

export default function PartnerPage() {
  return (
    <DashboardShell>
      <ProfilePanel role="partner" nextUp={<PartnerSpaCard />} />
    </DashboardShell>
  );
}
