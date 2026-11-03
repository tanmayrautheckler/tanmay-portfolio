import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { GithubIcon, LinkedinIcon } from "./social-icons";
import { CopyEmail } from "./copy-email";
import { contactDetails, siteNavigation } from "@/data/site-navigation";

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="site-footer-inner">
        <div className="site-footer-top">
          <div><p className="site-eyebrow">Keep exploring</p><Link href="/contact" className="site-footer-invite">Have something in mind?<ArrowUpRight /></Link><p className="site-footer-note">A process, a project, or a good conversation.</p></div>
          <nav aria-label="Footer navigation" className="site-footer-links">{siteNavigation.filter((link) => link.href !== "/").map((link) => <Link key={link.href} href={link.href}>{link.label}</Link>)}</nav>
        </div>
        <div className="site-footer-bottom"><p>Tanmay Raut <span>· Phoenix, Arizona</span></p><div className="site-footer-socials">
          <a href={contactDetails.github} target="_blank" rel="noopener noreferrer" aria-label="GitHub"><GithubIcon className="size-4" /></a>
          <a href={contactDetails.linkedin} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn"><LinkedinIcon className="size-4" /></a>
          <CopyEmail variant="icon" />
          <a href={contactDetails.resume} download="Tanmay-Raut-Resume.pdf">Download CV <ArrowUpRight size={14} /></a>
        </div></div>
      </div>
    </footer>
  );
}
