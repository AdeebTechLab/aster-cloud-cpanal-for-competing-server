import { ArrowRight } from "lucide-react";

export function CallToAction() {
  return (
    <section className="cta-banner-wrap" id="signup">
      <div className="content-width cta-banner">
        <div>
          <h3>Your next big thing starts here.</h3>
          <p>
            Get your first environment running and keep your focus on what you
            want to build.
          </p>
        </div>
        <a className="btn btn-light" href="/signup">
          Create your account
          <span className="btn-arrow">
            <ArrowRight size={16} />
          </span>
        </a>
      </div>
    </section>
  );
}
