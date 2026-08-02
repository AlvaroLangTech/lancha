import Link from "next/link";
import { pageLinks, siteConfig } from "../lib/site";

export function Header() {
  return (
    <header className="site-header">
      <div className="page-shell nav-shell">
        <Link className="brand" href="/" aria-label="Lancha Beju - inicio">
          <span>{siteConfig.brand}</span>
          <small>{siteConfig.tagline}</small>
        </Link>
        <nav className="main-nav" aria-label="Navegacao principal">
          {pageLinks.map((link) => (
            <Link href={link.href} key={link.href}>
              {link.label}
            </Link>
          ))}
        </nav>
        <a className="button button-primary nav-cta" href={siteConfig.whatsappHref}>
          WhatsApp
        </a>
      </div>
    </header>
  );
}
