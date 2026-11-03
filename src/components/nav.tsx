"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowUpRight, FileDown, Menu, Search, X } from "lucide-react";
import { ThemeSelector } from "./theme-selector";
import { Button } from "./ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "./ui/dialog";
import { contactDetails, isActiveRoute, siteNavigation } from "@/data/site-navigation";
import { cn } from "@/lib/utils";

export function Nav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const close = () => setOpen(false);
    document.addEventListener("portfolio:close-overlays", close);
    return () => document.removeEventListener("portfolio:close-overlays", close);
  }, []);
  const current = siteNavigation.find((link) => isActiveRoute(pathname, link.href));

  return (
    <header className="site-header">
      <a className="site-skip-link" href="#main-content">Skip to content</a>
      <nav className="site-nav" aria-label="Main navigation">
        <Link href="/" className="site-brand" aria-label="Tanmay Raut, home">
          <span className="site-monogram">TR<span>.</span></span>
          <span className="site-brand-detail">Tanmay Raut<small>Systems &amp; the people using them</small></span>
        </Link>
        <div className="site-primary-links">
          {siteNavigation.filter((link) => ["/projects", "/about", "/labs"].includes(link.href)).map((link) => (
            <Link key={link.href} href={link.href} aria-current={isActiveRoute(pathname, link.href) ? "page" : undefined}>{link.label}</Link>
          ))}
        </div>
        <div className="site-nav-actions">
          <Button variant="ghost" className="site-search-button" aria-label="Search pages and projects" onClick={() => document.dispatchEvent(new Event("portfolio:open-search"))}>
            <Search size={17} /><span>Search</span><kbd>⌘K</kbd>
          </Button>
          <a href={contactDetails.resume} download="Tanmay-Raut-Resume.pdf" aria-label="Download resume" className="site-resume"><FileDown size={17} /><span>CV</span></a>
          <ThemeSelector />
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild><Button variant="outline" className="site-menu-button"><Menu size={17} /><span>Menu</span></Button></DialogTrigger>
            <DialogContent className="site-menu-panel" onCloseAutoFocus={(event) => {
              const searchInput = document.querySelector<HTMLInputElement>('.site-command-panel[data-state="open"] input[cmdk-input]');
              if (searchInput) {
                event.preventDefault();
                searchInput.focus({ preventScroll: true });
              }
            }}>
              <div className="site-menu-heading">
                <div><DialogTitle>Find your way.</DialogTitle><DialogDescription>Work, background and a few things to play with.</DialogDescription></div>
                <DialogClose asChild><Button variant="ghost" size="icon" aria-label="Close menu"><X /></Button></DialogClose>
              </div>
              <nav className="site-menu-grid" aria-label="All pages">
                {["Explore", "Background"].map((group) => <div key={group}>
                  <p className="site-eyebrow">{group}</p>
                  {siteNavigation.filter((link) => link.group === group).map((link) => (
                    <Link key={link.href} href={link.href} onClick={() => setOpen(false)} aria-current={isActiveRoute(pathname, link.href) ? "page" : undefined} className={cn("site-menu-link", isActiveRoute(pathname, link.href) && "is-current")}>
                      <div><span>{link.label}</span><small>{link.description}</small></div><ArrowUpRight size={22} />
                    </Link>
                  ))}
                </div>)}
              </nav>
              <div className="site-menu-bottom"><span>You’re in {current?.label ?? "Case studies"}</span><Link href="/contact" onClick={() => setOpen(false)}>Let’s talk <ArrowUpRight size={18} /></Link></div>
            </DialogContent>
          </Dialog>
        </div>
      </nav>
    </header>
  );
}
