import { landingStats } from "@/data/landing-page";

export function StatsSection() {
  return (
    <section className="stats-strip" aria-label="Platform statistics">
      <div className="content-width stats-grid">
        {landingStats.map((stat) => (
          <div key={stat.value} className="stat-box">
            <div className="stat-value">{stat.value}</div>
            <div className="stat-label">{stat.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
