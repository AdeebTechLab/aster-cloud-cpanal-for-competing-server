import { workloadCards } from "@/data/landing-page";
import { SectionEyebrow } from "@/components/ui/section-eyebrow";

export function WorkloadsSection() {
  return (
    <section className="workloads-section" id="workloads">
      <div className="content-width workloads-inner">
        <div className="section-heading centered">
          <SectionEyebrow label="Built for modern workloads" />
          <h2>Powerful Cloud Infrastructure for Every Workload</h2>
          <p>
            From your first deployment to enterprise-scale applications, access
            the performance, flexibility, and control you need to build
            confidently in the cloud.
          </p>
        </div>
        <div className="workload-grid">
          {workloadCards.map(({ icon: Icon, title, text }) => (
            <article key={title} className="info-card">
              <div className="card-icon">
                <Icon size={22} />
              </div>
              <h3>{title}</h3>
              <p>{text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
