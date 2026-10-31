"use client";

import { useParams } from "next/navigation";
import { AdminSectionContent, type AdminSection } from "@/components/admin/admin-sections";

const sections = new Set<AdminSection>([
  "customers",
  "servers",
  "plans",
  "billing",
  "support",
  "security",
  "settings",
]);

export default function AdminSectionPage() {
  const params = useParams<{ section: string }>();
  const section = params.section as AdminSection;
  if (!sections.has(section)) {
    return (
      <section className="rounded-xl border border-[#e7ebf3] bg-white p-8 text-center">
        <h1 className="text-base font-bold text-[#172340]">Page not found</h1>
        <p className="mt-2 text-xs text-[#8290a8]">This admin section does not exist.</p>
      </section>
    );
  }
  return <AdminSectionContent section={section} />;
}
