"use client";

import { DashboardOverview } from "@/components/dashboard/dashboard-overview";
import { useDashboardData } from "@/components/dashboard/dashboard-shell";

export default function DashboardPage() {
  const { dashboard } = useDashboardData();
  return <DashboardOverview dashboard={dashboard} />;
}
