import { Check, ChevronRight } from "lucide-react";
import { SectionEyebrow } from "@/components/ui/section-eyebrow";

const workflowBenefits = [
  {
    title: "Infrastructure as code",
    text: "Bring repeatable environments into your existing development workflow.",
  },
  {
    title: "Predictable performance",
    text: "Choose compute resources that map to your workload and growth.",
  },
  {
    title: "Observability that helps",
    text: "Understand instance health and resource usage at a glance.",
  },
];

export function TerminalSection() {
  return (
    <section className="terminal-section" id="compute">
      <div className="content-width terminal-grid">
        <div className="terminal-copy">
          <SectionEyebrow label="Made for real workflows" small />
          <h2>From terminal to production, without the friction.</h2>
          <p>
            A cloud platform should feel like a tool, not a maze. Provision
            infrastructure, automate repetitive work, and get back to building
            the product your users love.
          </p>
          <div className="check-list">
            {workflowBenefits.map((benefit) => (
              <div key={benefit.title} className="check-item">
                <div className="check-icon">
                  <Check size={14} />
                </div>
                <div>
                  <strong>{benefit.title}</strong>
                  <p>{benefit.text}</p>
                </div>
              </div>
            ))}
          </div>
          <a href="#docs" className="text-link">
            Explore developer docs
            <ChevronRight size={14} />
          </a>
        </div>
        <div
          className="terminal-window"
          aria-label="Example deployment terminal"
        >
          <div className="terminal-header">
            <div className="traffic-lights">
              <span />
              <span />
              <span />
            </div>
            <span className="terminal-path">Terminal — northstar</span>
          </div>
          <div className="terminal-body">
            <div className="terminal-line">$ northstar compute create \</div>
            <div className="terminal-line muted">--region=us-east2 \</div>
            <div className="terminal-line muted">--plan</div>
            <div className="terminal-line blank"> </div>
            <div className="terminal-line success">
              ✓ Validating configuration...
            </div>
            <div className="terminal-line success">
              ✓ Allocating compute resources...
            </div>
            <div className="terminal-line success">
              ✓ Configuring secure networking...
            </div>
            <div className="terminal-line blank"> </div>
            <div className="terminal-line strong">
              Instance ready in 42 seconds
            </div>
            <div className="terminal-line muted">
              → srv-ns-8f21.northstar.run
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
