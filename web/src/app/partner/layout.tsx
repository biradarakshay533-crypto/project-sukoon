import { Suspense } from "react";
import type { ReactNode } from "react";
import { PartnerAlerts } from "@/components/PartnerAlerts";

// Every partner page gets the new-request popup.
export default function PartnerLayout({ children }: { children: ReactNode }) {
  return (
    <>
      {children}
      <Suspense fallback={null}>
        <PartnerAlerts />
      </Suspense>
    </>
  );
}
