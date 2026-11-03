"use client";

import Link from "next/link";
import { ArrowRight, ArrowUpRight, Check, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { skillCategories } from "@/data/skills";
import { projects } from "@/data/projects";
import "@/components/profile-pages.css";

const domains = [
  { id: "systems", label: "Systems & ERP", question: "How should the whole process fit together?", description: "Map the handoffs, make the records consistent and configure the system around the work. My day-to-day focus is Odoo across manufacturing and the business teams around it.", route: ["People & process", "Odoo workflows", "Connected records"], proof: ["vendor-management-portal", "odoo-accounting"], focus: "Process architecture" },
  { id: "automation", label: "Automation & AI", question: "Where can a useful tool take the repetitive work?", description: "I define the problem, prototype with AI tools and work through the checks that make a workflow usable. That includes Odoo Studio, custom modules and connecting ERP data to conversational tools.", route: ["Operational question", "Tool interface", "Useful next step"], proof: ["ai-erp-connector", "barcode-sku-audit"], focus: "Practical automation" },
  { id: "manufacturing", label: "Manufacturing & CI", question: "What does the production floor actually need?", description: "Bills of materials, routings and planning need to reflect how something gets made. My manufacturing background helps me connect the physical process to the system that describes it.", route: ["Parts & constraints", "Routing & capacity", "Production plan"], proof: ["csku-cut-parts", "3d-printer-planning"], focus: "Manufacturing systems" },
  { id: "integrations", label: "Integrations", question: "What needs to stay true when data moves?", description: "An integration needs more than a successful API call. I work through the record lifecycle, the exceptions and what the person using the system needs to see.", route: ["Source record", "Mapping & checks", "Next system"], proof: ["stripe-tax-odoo", "heckler-headless"], focus: "System connections" },
  { id: "analytics", label: "Analytics & Visualization", question: "Can someone use this number to make a decision?", description: "Define the question before designing the dashboard. I work with operational KPIs, SQL reporting and financial validation, supported by statistical analysis from my engineering studies.", route: ["Business question", "Validated records", "Clear view"], proof: ["sql-kpi-dashboards", "spc-quality-analysis"], focus: "Decision support" },
  { id: "engineering", label: "Tools & Engineering", question: "Which tool helps move the work forward?", description: "Engineering and project tools support the bigger process. CAD familiarity comes from my engineering background; planning tools help coordinate the people, dependencies and decisions around a delivery.", route: ["Understand constraints", "Model or plan", "Review & coordinate"], proof: ["aerodynamics-cfd", "operations-optimization"], focus: "Engineering foundations" },
];

export default function SkillsPage() {
  return (
    <div className="profile-page capability-page">
      <header className="capability-header"><div><p className="profile-kicker">Capabilities</p><h1>A practical<br /><em>set of tools.</em></h1></div><div><p className="profile-lead">Manufacturing, business systems and hands-on problem solving.</p><p className="profile-body">Choose an area to see the tools I use and the work behind them.</p><a href="#capability-index" className="profile-inline-link">Browse the complete list <ArrowRight size={14} /></a></div></header>

      <Tabs defaultValue="systems" className="capability-explorer">
        <TabsList variant="line" className="capability-selectors" aria-label="Capability areas">{domains.map((domain, index) => <TabsTrigger key={domain.id} value={domain.id} className="capability-selector"><span>0{index + 1}</span>{domain.label}<Plus size={15} /></TabsTrigger>)}</TabsList>
        {domains.map((domain, index) => <TabsContent key={domain.id} value={domain.id} className="capability-panel">
          <div className="capability-premise"><div><span className="profile-kicker">{domain.focus}</span><h2>{domain.question}</h2><p>{domain.description}</p></div><ol className="capability-route">{domain.route.map((step, i) => <li key={step}><span>0{i + 1}</span><strong>{step}</strong>{i < domain.route.length - 1 && <ArrowRight size={18} aria-hidden="true" />}</li>)}</ol></div>
          <div className="capability-working-set"><div><p className="profile-kicker">The working set</p><ul className="capability-tools">{skillCategories[index].skills.map(skill => <li key={skill.name}><Check size={13} /><span>{skill.name}</span></li>)}</ul></div><div className="capability-evidence"><p className="profile-kicker">See it in the work</p>{domain.proof.map(slug => {
            const project = projects.find(item => item.slug === slug);
            if (!project) return null;
            return <Link key={slug} href={`/projects/${slug}`}><span>{project.category === "Academic" ? "Engineering study" : project.category}</span><h3>{project.title}</h3><p>{project.role}</p><span className="capability-proof-link">Explore project <ArrowUpRight size={16} /></span></Link>;
          })}</div></div>
        </TabsContent>)}
      </Tabs>

      <section id="capability-index" className="profile-section capability-index" aria-labelledby="capability-index-title"><div className="profile-section-heading"><div><p className="profile-kicker">Complete index</p><h2 id="capability-index-title">Tools & <em>disciplines.</em></h2></div><p>A quick reference across the areas above. The project examples show where they fit.</p></div><div className="capability-index-list">{skillCategories.map((category, i) => <details key={category.name} className="profile-details"><summary><span><small>0{i + 1}</small>{category.name}</span><span>{category.skills.length} skills</span></summary><ul>{category.skills.map(skill => <li key={skill.name}><span>{skill.name}</span><small>{skill.level}</small></li>)}</ul></details>)}</div></section>

      <footer className="profile-next"><div><span className="profile-kicker">Have a process to improve?</span><h2>Let’s work <em>through it.</em></h2></div><Button asChild variant="outline" className="profile-outline-link"><Link href="/contact">Start a conversation <ArrowRight size={16} /></Link></Button></footer>
    </div>
  );
}
