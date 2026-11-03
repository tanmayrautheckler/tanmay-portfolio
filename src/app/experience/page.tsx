"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowDown, ArrowRight, ArrowUpRight, ChevronDown, Download, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { experiences, type Experience } from "@/data/experience";
import { CHECKPOINTS } from "@/data/journey-checkpoints";
import "@/components/profile-pages.css";

type CareerEntry = Experience & { id: string; year: string; links: { label: string; href: string }[] };
const viva = CHECKPOINTS.find(item => item.id === "viva")!;
const roles: CareerEntry[] = [
  { ...experiences[0], id: "heckler-current", year: "2024", links: [{ label: "Heckler Headless", href: "/projects/heckler-headless" }, { label: "Operations workflows", href: "/projects/odoo-operations" }, { label: "Manufacturing costs", href: "/projects/manufacturing-cost-accounting" }] },
  { ...experiences[1], id: "heckler-erp", year: "2023", links: [{ label: "Odoo 16 to 17 case study", href: "/case-studies/odoo-17" }, { label: "Accounting implementation", href: "/projects/odoo-accounting" }] },
  { ...experiences[2], id: "united-foods", year: "2023", links: [] },
  { id: "viva-railings", year: String(viva.year), title: viva.title, company: "VIVA Railings", location: "Dallas, TX", period: "2022", description: "My first Odoo implementation, connecting manufacturing process work with business systems.", highlights: ["Manufacturing process engineering at VIVA Railings", "First Odoo implementation, where the ERP part of my career began"], type: "manufacturing", links: [] },
  { ...experiences[3], id: "vats-vessels", year: "2020", links: [] },
];
const departments = ["Manufacturing", "Procurement", "Sales", "Finance", "Quality", "Inventory", "CRM", "Shipping"];

export default function ExperiencePage() {
  const [expanded, setExpanded] = useState<Set<string>>(() => new Set([roles[0].id]));
  const allExpanded = expanded.size === roles.length;
  const toggle = (id: string) => setExpanded(current => {
    const next = new Set(current);
    if (next.has(id)) next.delete(id); else next.add(id);
    return next;
  });

  return (
    <div className="profile-page experience-ledger">
      <header className="career-header">
        <div><p className="profile-kicker">Experience</p><h1>From the floor.<br /><em>Through the business.</em></h1><p className="profile-lead">The tools changed. The thread stayed the same: understand how the work happens, then help people do it better.</p></div>
        <div className="career-header-note"><span>Based in Phoenix</span><p>Manufacturing experience.<br />Business systems ownership.<br />One connected perspective.</p><Button asChild variant="ghost" className="profile-text-link"><a href="/resume.pdf" target="_blank" rel="noopener noreferrer"><Download size={15} /> View résumé</a></Button></div>
      </header>

      <div className="career-layout">
        <aside className="career-index" aria-label="Career navigation"><p className="profile-kicker">The chapters</p><nav>{roles.map((role, i) => <a key={role.id} href={`#${role.id}`}><span>0{i + 1}</span><div>{role.company}<small>{role.year}{i === 0 ? " to now" : ""}</small></div><ArrowDown size={13} /></a>)}</nav><Link className="career-education-link" href="/about#learning-title">Education & learning <ArrowUpRight size={14} /></Link></aside>
        <div className="career-records">
          <div className="career-record-toolbar"><span>Roles & responsibilities</span><Button variant="ghost" className="profile-text-link" onClick={() => setExpanded(allExpanded ? new Set() : new Set(roles.map(role => role.id)))}>{allExpanded ? "Collapse details" : "Expand all details"}<ChevronDown size={14} className={allExpanded ? "rotate-180" : ""} /></Button></div>
          {roles.map((role, index) => {
            const isExpanded = expanded.has(role.id);
            return <article key={role.id} id={role.id} className="career-entry" data-current={index === 0}>
              <div className="career-entry-meta"><span>{role.period}</span>{index === 0 && <strong>Current role</strong>}<span><MapPin size={12} /> {role.location}</span></div>
              <h2>{role.title.replace(" — ", ", ")}</h2><p className="career-company">{role.company}</p><p className="career-description">{role.description}</p>
              {index === 0 && <div className="career-departments" aria-label="Departments connected through Odoo"><span>Connected through Odoo</span><ul>{departments.map(department => <li key={department}>{department}</li>)}</ul></div>}
              <Button variant="ghost" className="career-details-toggle" aria-expanded={isExpanded} aria-controls={`${role.id}-details`} onClick={() => toggle(role.id)}>{isExpanded ? "Close responsibilities" : "Open responsibilities"}<ChevronDown size={15} className={isExpanded ? "rotate-180" : ""} /></Button>
              <div id={`${role.id}-details`} className="career-details" hidden={!isExpanded}>
                <ul>{role.highlights.map((highlight, i) => <li key={highlight}><span>0{i + 1}</span><p>{highlight}</p></li>)}</ul>
              </div>
              {role.links.length > 0 && <div className="career-proof"><p>See the work</p>{role.links.map(link => <Link key={link.href} href={link.href}>{link.label}<ArrowUpRight size={14} /></Link>)}</div>}
            </article>;
          })}
        </div>
      </div>

      <footer className="profile-next"><div><span className="profile-kicker">What that adds up to</span><h2>Experience, <em>put to work.</em></h2></div><Button asChild variant="outline" className="profile-outline-link"><Link href="/skills">Explore capabilities <ArrowRight size={16} /></Link></Button></footer>
    </div>
  );
}
