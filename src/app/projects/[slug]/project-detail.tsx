"use client";

import Link from "next/link";
import Image from "next/image";
import dynamic from "next/dynamic";
import type { ReactNode } from "react";
import { ArrowLeft, ArrowRight, ArrowUpRight } from "lucide-react";
import { projects, type CaseStudySection } from "@/data/projects";
import { ProjectVisual } from "@/components/projects/project-visual";
import { Button } from "@/components/ui/button";
import { mockups } from "@/components/project-mockups";
import styles from "@/components/projects/work.module.css";

const MermaidDiagram = dynamic(() => import("@/components/mermaid-diagram"), {
  ssr: false,
  loading: () => <p className="py-8 text-sm text-text-secondary" role="status">Loading the system diagram…</p>,
});

function Figure({ children, caption }: { children: ReactNode; caption?: string }) {
  return <figure>{children}{caption && <figcaption>{caption}</figcaption>}</figure>;
}

function CaseStudyContent({ section }: { section: CaseStudySection }) {
  const Mockup = section.mockup ? mockups[section.mockup] : null;
  const Left = section.mockupLeft ? mockups[section.mockupLeft] : null;
  const Right = section.mockupRight ? mockups[section.mockupRight] : null;
  switch (section.type) {
    case "narrative":
      return <p>{section.body}</p>;
    case "mockup":
    case "flow":
      return <Figure caption={section.caption}>{Mockup && <div className={styles.mockupFrame}><Mockup /></div>}</Figure>;
    case "mockup-pair":
      return <div className={styles.figurePair}><Figure caption={section.captionLeft}>{Left && <div className={styles.mockupFrame}><Left /></div>}</Figure><Figure caption={section.captionRight}>{Right && <div className={styles.mockupFrame}><Right /></div>}</Figure></div>;
    case "metrics":
      return <dl className={styles.metrics}>{section.metrics?.map((metric) => <div key={metric.label}><dt>{metric.value}</dt><dd>{metric.label}{metric.sub && <span>{metric.sub}</span>}</dd></div>)}</dl>;
    case "quote":
      return <blockquote className={styles.storyQuote}>{section.body}</blockquote>;
    case "image":
      return <Figure caption={section.caption}>{section.image && <Image src={section.image} alt={section.caption || section.title || "Project screenshot"} width={1200} height={800} sizes="(max-width: 900px) 90vw, 850px" />}</Figure>;
    case "image-pair":
      return <div className={styles.figurePair}><Figure caption={section.captionLeft}>{section.imageLeft && <Image src={section.imageLeft} alt={section.captionLeft || "First project view"} width={800} height={600} sizes="(max-width: 640px) 90vw, 400px" />}</Figure><Figure caption={section.captionRight}>{section.imageRight && <Image src={section.imageRight} alt={section.captionRight || "Second project view"} width={800} height={600} sizes="(max-width: 640px) 90vw, 400px" />}</Figure></div>;
    case "image-grid":
      return <div className={styles.figurePair}>{section.images?.map((image) => <Figure key={image.src} caption={image.caption}><Image src={image.src} alt={image.caption || "Project screenshot"} width={800} height={600} sizes="(max-width: 640px) 90vw, 400px" /></Figure>)}</div>;
    case "mermaid":
      return section.mermaid ? <MermaidDiagram chart={section.mermaid} caption={section.caption} /> : null;
    case "code":
      return <Figure caption={section.caption}><details className={styles.codeBlock}><summary>Inspect the implementation · {section.language || "Code"}</summary><pre><code>{section.code}</code></pre></details></Figure>;
  }
}

export default function ProjectDetail({ slug }: { slug: string }) {
  const projectIndex = projects.findIndex((project) => project.slug === slug);
  const project = projects[projectIndex];
  if (!project) return null;
  const sections = project.caseStudy ?? [];
  const demo = project.preview ?? (["trading-research-desk", "neighbourhelper"].includes(slug)
    ? { href: "/#off-the-clock", label: slug === "trading-research-desk" ? "Try the research desk" : "Explore the neighbourhood prototype" }
    : ["manufacturing-cost-accounting", "csku-cut-parts", "framework-configurator"].includes(slug)
      ? { href: "/#under-the-surface", label: "Explore the interactive cost workbench" }
      : null);
  const related = Array.from(new Map([
    ...projects.filter((item) => project.relatedSlugs?.includes(item.slug)),
    ...projects.filter((item) => item.slug !== slug && item.category === project.category),
    ...projects.filter((item) => item.slug !== slug && item.category !== project.category),
  ].map(item => [item.slug, item])).values()).slice(0, 2);
  return (
    <article className={styles.work}>
      <header className={styles.detailHero}>
        <Link href="/projects/archive" className={styles.backLink}><ArrowLeft size={15} /> All projects</Link>
        <div className={styles.detailMeta}><span>Project {String(projectIndex + 1).padStart(2, "0")} / {project.category}</span><span>{project.date}</span></div>
        <h1>{project.title}</h1><p className={styles.lead}>{project.description}</p>
      </header>
      <div className={styles.detailIntro}>
        <section className={styles.roleNote} aria-labelledby="contribution-heading"><h2 id="contribution-heading">My contribution</h2><p>{project.role}</p></section>
        <div className={styles.toolsNote}><span>Tools & disciplines</span><ul aria-label="Technologies and disciplines">{project.tech.map((tech) => <li key={tech}>{tech}</li>)}</ul></div>
      </div>
      <section className={styles.detailVisual} aria-label="Project at a glance"><ProjectVisual project={project} />{demo && <div className={styles.demoLink}><p>Explore the idea</p><span>{project.preview?.description ?? (slug === "trading-research-desk" ? "A guided demonstration of the research workflow, using illustrative examples." : slug === "neighbourhelper" ? "Walk through a sample request and see the different people involved." : "Take apart an illustrative product and change the assumptions behind its cost.")}</span><Button asChild variant="outline"><Link href={demo.href} {...(project.preview ? { target: "_blank", rel: "noreferrer" } : {})}>{demo.label} <ArrowUpRight size={15} /></Link></Button></div>}</section>
      <div className={styles.detailBody}>
        <aside className={styles.contentsRail}><p>In this project</p><nav aria-label="Project contents"><a href="#overview">The starting point</a><a href="#approach">What I built</a>{sections.map((section, index) => section.title && <a key={index} href={`#section-${index}`}>{section.title}</a>)}<a href="#outcomes">Outcomes & scope</a><a href="#related">Keep exploring</a></nav></aside>
        <div className={styles.story}>
          <section id="overview" className={styles.storySection}><h2>The starting point</h2><p>{project.problem}</p></section>
          <section id="approach" className={styles.storySection}><h2>What I built</h2><p>{project.solution}</p></section>
          {sections.map((section, index) => <section className={styles.storySection} id={`section-${index}`} key={index}>{section.title && <h2>{section.title}</h2>}<CaseStudyContent section={section} /></section>)}
          <section id="outcomes" className={styles.storySection}><h2>Outcomes & scope</h2><ul className={styles.outcomes}>{project.impact.map((item, index) => <li key={item}><span>{String(index + 1).padStart(2, "0")}</span><p>{item}</p></li>)}</ul></section>
        </div>
      </div>
      <section id="related" className={styles.related} aria-labelledby="related-heading">
        <div className={styles.sectionHeading}><h2 id="related-heading">Keep exploring</h2><Link href="/projects/archive" className={styles.textLink}>Complete index <ArrowUpRight size={16} /></Link></div>
        <div className={styles.relatedGrid}>{related.map((item) => <Link key={item.slug} href={`/projects/${item.slug}`}><span className={styles.relatedMeta}>{item.category} / {item.date}</span><h3>{item.title}</h3><p>{item.description}</p><span className={styles.textLink}>Inside the project <ArrowRight size={17} /></span></Link>)}</div>
      </section>
    </article>
  );
}
