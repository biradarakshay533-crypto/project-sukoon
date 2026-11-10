import type { Metadata } from "next";
import { DashboardShell } from "@/components/DashboardShell";
import { PartnerSpaCard } from "@/components/PartnerSpaCard";
import { ProfilePanel } from "@/components/ProfilePanel";
import { PushSwitch } from "@/components/PushSwitch";

export const metadata: Metadata = { title: "Partner dashboard | Sukoonam" };

export default function PartnerPage() {
  return (
    <DashboardShell>
      <ProfilePanel role="partner" alerts={<PushSwitch />} nextUp={<PartnerSpaCard />} />
    </DashboardShell>
  );
}
