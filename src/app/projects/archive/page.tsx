"use client";
import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowLeft, ArrowUpRight, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { projects, categories, type ProjectCategory } from "@/data/projects";
import styles from "@/components/projects/work.module.css";

function yearOf(date: string) {
  const years = date.match(/20\d{2}/g);
  return years ? Number(years[years.length - 1]) : 0;
}
export default function ArchivePage() {
  const [filter, setFilter] = useState<ProjectCategory | "All">("All");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("newest");
  const filtered = useMemo(() => projects.filter((project) => {
    const haystack = `${project.title} ${project.description} ${project.tech.join(" ")} ${project.category} ${project.date}`.toLowerCase();
    return (filter === "All" || project.category === filter) && query.trim().toLowerCase().split(/\s+/).every((term) => haystack.includes(term));
  }).sort((a, b) => sort === "title" ? a.title.localeCompare(b.title) : sort === "oldest" ? yearOf(a.date) - yearOf(b.date) : yearOf(b.date) - yearOf(a.date)), [filter, query, sort]);
  const changed = filter !== "All" || query !== "" || sort !== "newest";
  return (
    <article className={styles.work}>
      <header className={styles.archiveHero}>
        <Link href="/projects" className={styles.backLink}><ArrowLeft size={15} /> Selected work</Link>
        <p className={styles.eyebrow}>The project files / Complete index</p>
        <div className={styles.archiveTitle}><h1>A record of<br /><em>making things work.</em></h1><div className={styles.archiveCount}><strong>{projects.length}</strong><span>Projects to explore</span></div></div>
        <p className={styles.lead}>Business systems, research tools and early experiments. Find a familiar problem, follow a technology, or browse from the beginning.</p>
      </header>
      <section className={styles.archiveTools} aria-label="Find projects">
        <div className={styles.searchRow}>
          <div className={styles.searchField}><label htmlFor="project-search">Search the collection</label><div><Search size={18} aria-hidden="true" /><input id="project-search" type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Try Odoo, tax, trading…" />{query && <Button variant="ghost" size="icon" aria-label="Clear search" onClick={() => setQuery("")}><X size={16} /></Button>}</div></div>
          <div className={styles.sortField}><label htmlFor="project-sort">Order</label><select id="project-sort" value={sort} onChange={(event) => setSort(event.target.value)}><option value="newest">Newest first</option><option value="oldest">Oldest first</option><option value="title">Title A to Z</option></select></div>
        </div>
        <div className={styles.filters} role="group" aria-label="Project category">
          <Button variant="ghost" aria-pressed={filter === "All"} onClick={() => setFilter("All")}>Everything <span>{projects.length}</span></Button>
          {categories.filter((category) => projects.some((project) => project.category === category)).map((category) => <Button key={category} variant="ghost" aria-pressed={filter === category} onClick={() => setFilter(category)}>{category}<span>{projects.filter((project) => project.category === category).length}</span></Button>)}
        </div>
      </section>
      <div className={styles.resultsHeading}><p role="status" aria-live="polite">{filtered.length} {filtered.length === 1 ? "project" : "projects"}{filter !== "All" ? ` in ${filter}` : " in the collection"}</p>{changed && <Button variant="ghost" size="sm" onClick={() => { setFilter("All"); setQuery(""); setSort("newest"); }}>Reset filters <X size={14} /></Button>}</div>
      <div className={styles.archiveList}>
        {filtered.map((project, index) => <Link href={`/projects/${project.slug}`} className={styles.archiveEntry} key={project.slug}>
          <div className={styles.entryDate}><span>{String(index + 1).padStart(2, "0")}</span><span>{project.date}</span></div>
          <div><div className={styles.entryMeta}>{project.category}{project.featured && <span>Selected</span>}</div><h2>{project.title}</h2><p>{project.description}</p><div className={styles.entryTech}>{project.tech.slice(0, 4).join(" / ")}{project.tech.length > 4 ? ` / +${project.tech.length - 4}` : ""}</div></div>
          <ArrowUpRight size={23} strokeWidth={1.5} aria-hidden="true" />
        </Link>)}
        {filtered.length === 0 && <div className={styles.empty}><Search size={30} strokeWidth={1} /><h2>No matching projects.</h2><p>Try a broader topic or clear the current filters.</p><Button variant="outline" onClick={() => { setFilter("All"); setQuery(""); }}>Show all projects</Button></div>}
      </div>
      <p className={styles.archiveNote}>Each project explains my contribution and its scope. Personal prototypes and research tools are identified within their stories.</p>
    </article>
  );
}
