import { CallToAction } from "@/components/marketing/call-to-action";
import { DeveloperSection } from "@/components/marketing/developer-section";
import { FaqSection } from "@/components/marketing/faq-section";
import { HeroSection } from "@/components/marketing/hero-section";
import { SiteFooter } from "@/components/marketing/site-footer";
import { SiteHeader } from "@/components/marketing/site-header";
import { StatsSection } from "@/components/marketing/stats-section";
import { TerminalSection } from "@/components/marketing/terminal-section";
import { WorkloadsSection } from "@/components/marketing/workloads-section";

export default function HomePage() {
  return (
    <main className="page-shell">
      <SiteHeader />
      <HeroSection />
      <StatsSection />
      <WorkloadsSection />
      <TerminalSection />
      <FaqSection />
      <DeveloperSection />
      <CallToAction />
      <SiteFooter />
    </main>
  );
}
