import Link from "next/link";
import { pageLinks, siteConfig } from "../lib/site";

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="page-shell footer-grid">
        <div>
          <strong>{siteConfig.brand}</strong>
          <p>{siteConfig.location} · {siteConfig.displayPhone}</p>
        </div>
        <nav className="footer-links" aria-label="Links do rodape">
          {pageLinks.map((link) => (
            <Link href={link.href} key={link.href}>
              {link.label}
            </Link>
          ))}
          <Link href="/perguntas-frequentes">FAQ</Link>
        </nav>
      </div>
    </footer>
  );
}
