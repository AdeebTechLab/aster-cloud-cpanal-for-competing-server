import { ArrowRight, Check, Cloud, Gauge, Globe, Shield } from "lucide-react";

export function HeroSection() {
  return (
    <section className="hero-section" id="top">
      <div className="content-width hero-grid">
        <div className="hero-copy">
          <div className="eyebrow">
            <span className="dot" />
            <span>Cloud infrastructure, reimagined</span>
          </div>
          <h1>
            Cloud
            <br />
            infrastructure.<span className="split-text">Without</span>
            <br />
            compromise.
          </h1>
          <p>
            Deploy high-performance compute in minutes. Predictable pricing,
            modern infrastructure, and developer-first tools, engineered to move
            your work forward.
          </p>
          <div className="cta-row">
            <a className="btn btn-primary hero-primary" href="/signup">
              Deploy now
              <span className="btn-arrow">
                <ArrowRight size={16} />
              </span>
            </a>
            <a className="btn btn-outline" href="#compute">
              Explore cloud compute
            </a>
          </div>
          <ul className="trust-row" aria-label="Service benefits">
            <li>
              <Check size={15} />
              <span>No long-term contracts</span>
            </li>
            <li>
              <Check size={15} />
              <span>Pay for what you use</span>
            </li>
            <li>
              <Check size={15} />
              <span>Deploy in minutes</span>
            </li>
          </ul>
        </div>
        <div
          className="hero-visual"
          aria-label="Cloud infrastructure status illustration"
        >
          <div className="status-card">
            <div className="status-dot" />
            <span>Compute status</span>
            <strong>All systems operational</strong>
            <div className="bars" aria-hidden="true">
              <span />
              <span />
              <span />
              <span />
            </div>
          </div>
          <div className="floating-card small-card card-top-left">
            <div className="mini-glyph">
              <Cloud size={16} />
            </div>
          </div>
          <div className="floating-card large-card">
            <div className="mini-glyph">
              <Gauge size={18} />
            </div>
          </div>
          <div className="floating-card small-card card-bottom-left">
            <div className="mini-glyph">
              <Shield size={16} />
            </div>
          </div>
          <div className="floating-card region-card">
            <div className="mini-glyph">
              <Globe size={14} />
            </div>
            <div className="region-copy">
              <strong>Global edge network</strong>
              <span>Connected across regions</span>
              <div className="signal-dots" aria-hidden="true">
                <span />
                <span />
                <span />
                <span />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
