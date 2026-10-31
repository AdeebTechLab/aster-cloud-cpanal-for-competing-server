import { footerColumns } from "@/data/landing-page";
import Image from "next/image";

export function SiteFooter() {
  return (
    <footer className="site-footer" id="docs">
      <div className="content-width footer-grid">
        <div className="footer-branding">
          <a
            href="#top"
            className="brand-group"
            aria-label="Northstar Cloud home"
          >
            <span className="brand-mark mini-mark">
              <span className="brand-mark-inner">
                <Image
                  src="/icons/headerimg.svg"
                  alt=""
                  width={32}
                  height={32}
                />
              </span>
            </span>
            <span className="brand-text small-brand">
              <span className="font-white ">northstar</span>
              <span className="brand-sub">cloud</span>
            </span>
          </a>
          <p>
            Cloud infrastructure designed to make building, shipping, and
            scaling feel straightforward.
          </p>
          <span className="footer-note">Built for the next thing.</span>
        </div>
        <div className="footer-links">
          {Object.entries(footerColumns).map(([title, links]) => (
            <div key={title}>
              <h4>{title}</h4>
              <ul>
                {links.map((link) => (
                  <li key={link}>{link}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
      <div className="footer-bottom content-width">
        <div className="legal-line">
          © 2026 Northstar Cloud. Concept UI — Pricing and specifications are
          illustrative.
        </div>
        <ul className="legal-links">
          <li>Privacy</li>
          <li>Terms</li>
          <li>Status</li>
        </ul>
      </div>
    </footer>
  );
}
