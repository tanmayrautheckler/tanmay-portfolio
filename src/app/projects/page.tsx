import type { Metadata } from "next";
import Link from "next/link";
import { ArrowDown, ArrowRight, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProjectVisual } from "@/components/projects/project-visual";
import { projects } from "@/data/projects";
import styles from "@/components/projects/work.module.css";

export const metadata: Metadata = {
  title: "Selected work | Tanmay Raut",
  description: "The problems, decisions and implementation behind Tanmay Raut’s business systems and personal projects.",
};
const selectedOrder = ["heckler-headless", "ai-tax-exemptions", "customer-data-foundations", "vendor-management-portal", "qc-vendor-rma", "ai-erp-connector"];
const featured = projects.filter((project) => project.featured).sort((a, b) => selectedOrder.indexOf(a.slug) - selectedOrder.indexOf(b.slug));
const personal = projects.filter((project) => ["trading-research-desk", "neighbourhelper"].includes(project.slug));
const health = projects.find(project => project.slug === "saanvilo-health")!;

export default function ProjectsPage() {
  return (
    <article className={styles.work}>
      <header className={styles.indexHero}>
        <div>
          <p className={styles.eyebrow}>The project files / Selected work</p>
          <h1>Behind every screen,<br /><em>there’s a process.</em></h1>
          <p className={styles.lead}>The work starts with people trying to get something done. Here are the systems I’ve built around them, the decisions along the way and my part in each.</p>
          <div className={styles.heroActions}>
            <Button asChild size="lg" className={styles.primaryButton}><a href="#selected">Explore the work <ArrowDown /></a></Button>
            <Button asChild size="lg" variant="ghost"><Link href="/projects/archive">All {projects.length} projects <ArrowUpRight /></Link></Button>
          </div>
        </div>
        <aside className={styles.contentsCard} aria-label="Selected project shortcuts">
          <p className={styles.eyebrow}>Three places to start</p>
          {featured.slice(0, 3).map((project, index) => <a key={project.slug} href={`#${project.slug}`}><span>0{index + 1}</span><strong>{project.title}</strong><ArrowDown size={16} /></a>)}
          <p>Business systems, from the first question to the details that make them work.</p>
        </aside>
      </header>
      <section id="selected" aria-labelledby="selected-heading" className={styles.selected}>
        <div className={styles.sectionHeading}><h2 id="selected-heading">Selected work</h2><span>{String(featured.length).padStart(2, "0")} detailed project stories</span></div>
        {featured.map((project, index) => (
          <article className={styles.feature} id={project.slug} key={project.slug}>
            <div className={styles.featureCopy}>
              <p className={styles.eyebrow}><span>0{index + 1}</span> / {project.category} / {project.date}</p>
              <h3><Link href={`/projects/${project.slug}`}>{project.title}</Link></h3><p>{project.description}</p>
              <div className={styles.contribution}><span>My contribution</span><p>{project.role}</p></div>
              <Link className={styles.textLink} href={`/projects/${project.slug}`}>Inside the project <ArrowRight size={18} /></Link>
            </div>
            {["ai-tax-exemptions", "customer-data-foundations"].includes(project.slug)
              ? <div className={styles.visualLink}><ProjectVisual project={project} /></div>
              : <Link href={`/projects/${project.slug}`} className={styles.visualLink} aria-label={`Read ${project.title}`}><ProjectVisual project={project} /></Link>}
          </article>
        ))}
      </section>
      <section className={styles.personal} aria-labelledby="personal-heading">
        <div className={styles.sectionHeading}><h2 id="personal-heading">Independent products</h2><span>Research, health & community</span></div>
        <article className={styles.feature}>
          <div className={styles.featureCopy}>
            <p className={styles.eyebrow}>Personal product / Family-health prototype</p>
            <h3><Link href={`/projects/${health.slug}`}>{health.title}</Link></h3>
            <p>{health.description}</p>
            <div className={styles.contribution}><span>My contribution</span><p>{health.role}</p></div>
            <Link className={styles.textLink} href={`/projects/${health.slug}`}>Inside the product <ArrowRight size={18} /></Link>
          </div>
          <Link href={`/projects/${health.slug}`} className={styles.visualLink} aria-label="Read the Saanvilo family-health project"><ProjectVisual project={health} /></Link>
        </article>
        <div className={styles.personalGrid}>{personal.map((project) => <Link href={`/projects/${project.slug}`} className={styles.personalProject} key={project.slug}>
          <span className={styles.eyebrow}>{project.slug === "trading-research-desk" ? "Research system" : "Community-care prototype"}</span>
          <h3>{project.title}</h3><p>{project.description}</p><span className={styles.textLink}>Read the project <ArrowUpRight size={18} /></span>
        </Link>)}</div>
      </section>
      <Link href="/projects/archive" className={styles.archiveBridge}><div><p className={styles.eyebrow}>The complete collection</p><h2>There’s more in the archive.</h2><p>{projects.length} projects. Search by topic, technology or year.</p></div><ArrowUpRight size={42} strokeWidth={1} /></Link>
    </article>
  );
}
