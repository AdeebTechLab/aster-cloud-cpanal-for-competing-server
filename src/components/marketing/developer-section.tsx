import { developerFeatures } from "@/data/landing-page";
import { SectionEyebrow } from "@/components/ui/section-eyebrow";

export function DeveloperSection() {
  return (
    <section className="developer-section" id="pricing">
      <div className="content-width developer-inner">
        <SectionEyebrow label="Why Northstar Cloud" small />
        <h2>Built for Developers. Designed for Performance.</h2>
        <p>
          Spend less time managing infrastructure and more time building what
          matters. Get the speed, clarity, and global reach your applications
          need to grow.
        </p>
        <div className="feature-grid">
          {developerFeatures.map(({ icon: Icon, title, text }) => (
            <article key={title} className="feature-card">
              <div className="card-icon small-icon">
                <Icon size={18} />
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
