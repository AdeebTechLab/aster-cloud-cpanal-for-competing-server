"use client";

import { useParams } from "next/navigation";
import {
  DashboardSectionContent,
  type DashboardSection,
} from "@/components/dashboard/dashboard-sections";
import { useDashboardData } from "@/components/dashboard/dashboard-shell";

const sections = new Set<DashboardSection>([
  "servers",
  "deploy",
  "ssh-keys",
  "firewall",
  "billing",
  "activity",
  "support",
  "settings",
]);

export default function DashboardSectionPage() {
  const params = useParams<{ section: string }>();
  const section = params.section as DashboardSection;
  const { account, updateAccount } = useDashboardData();

  if (!sections.has(section)) {
    return (
      <section className="rounded-2xl border border-[#e7ebf3] bg-white p-8 text-center">
        <h1 className="text-lg font-bold text-[#172340]">Page not found</h1>
        <p className="mt-2 text-sm text-[#8290a8]">
          This dashboard section does not exist.
        </p>
      </section>
    );
  }

  return (
    <DashboardSectionContent
      section={section}
      account={account}
      updateAccount={updateAccount}
    />
  );
}
