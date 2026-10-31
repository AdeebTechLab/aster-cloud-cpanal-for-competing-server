import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="topbar-wrap">
      <div className="topbar content-width">
        <a
          className="brand-group"
          href="#top"
          aria-label="Northstar Cloud home"
        >
          <span className="brand-mark" aria-hidden="true">
            <span className="brand-mark-inner">
              <Image src="/icons/headerimg.svg" alt="" width={32} height={32} />
              {/* <img src="/icons/headerimg.svg" alt="" /> */}
            </span>
          </span>
          <span className="brand-text flex items-center justify-between ">
            <span className="brand-name">northstar</span>
            <span className="brand-sub">cloud</span>
          </span>
        </a>
        <nav className="main-nav" aria-label="Main navigation">
          <a href="#compute">Cloud Computing</a>
          <a href="#workloads">Solutions</a>
          <a href="#pricing">Pricing</a>
          <a href="#docs">Documentation</a>
          <a href="#support">Support</a>
        </nav>
        <div className="header-actions">
          <a className="btn btn-ghost" href="/login">
            Log in
          </a>
          <Link className="btn btn-primary" href="/signup">
            Sign up
            <span className="btn-arrow">
              <ArrowRight size={16} />
            </span>
          </Link>
        </div>
      </div>
    </header>
  );
}
