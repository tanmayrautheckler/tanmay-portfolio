"use client";

import { ArrowDown, ArrowRight, Boxes, Check, Database, FileCheck2, MessageSquare, Search, ShieldCheck, SlidersHorizontal } from "lucide-react";
import Image from "next/image";
import { TaxCertificateWorkflow, ContactCleanupWorkflow } from "./project-workflows";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import type { Project } from "@/data/projects";
import styles from "./work.module.css";

const projectFlows: Record<string, string[]> = {
  "heckler-headless": ["Dealer quote", "Material planning", "Operational records"],
  "odoo-operations": ["Receive a return", "Inspect & resolve", "Accounting handoff"],
  "csku-cut-parts": ["Component SKU", "BOM & routing", "Per-part costs"],
  "odoo-accounting": ["Purchases", "Inventory valuation", "General ledger"],
  "framework-configurator": ["Shopify selection", "Product variant", "Manufacturing order"],
  "stripe-integration": ["Customer invoice", "Portal payment", "Stripe"],
  "sql-kpi-dashboards": ["Operational data", "SQL measures", "Team dashboards"],
  "barcode-sku-audit": ["Shopify exports", "Odoo records", "Printed labels"],
  "3d-printer-planning": ["BOM dependencies", "Daily occupancy", "Scheduling what-ifs"],
  "attendance-gate": ["Clock in", "Choose an activity", "Track work & breaks"],
  "trip-command": ["Flight update", "Booking change", "Driver & agency"],
  "odoo-upgrade-16-17": ["Audit & testing", "Migration", "Training & follow-up"],
  "rma-workflow": ["Return request", "Inventory adjustment", "Credit note"],
  "barcode-label-system": ["Clean product data", "Manufacturing order", "Print on demand"],
  "spc-quality-analysis": ["Process samples", "Control charts", "Capability analysis"],
  "operations-optimization": ["Constraints", "Optimization model", "Scheduling scenarios"],
  "aerodynamics-cfd": ["Airfoil geometry", "Mesh & simulation", "Pressure, lift & drag"],
  "supply-chain-project": ["Supplier network", "Inventory locations", "Cost tradeoffs"],
};

function ResearchSketch() {
  return <Tabs defaultValue="lenses" className={styles.researchSketch}>
    <TabsList variant="line" className={styles.researchTabs} aria-label="Explore the research system"><TabsTrigger value="lenses">Research</TabsTrigger><TabsTrigger value="news">News</TabsTrigger><TabsTrigger value="risk">Risk</TabsTrigger><TabsTrigger value="validation">Validation</TabsTrigger></TabsList>
    <TabsContent value="lenses"><div className={styles.lensGrid}>{["Technicals", "Momentum", "Fundamentals", "News", "News timing", "Community", "Insiders", "Squeeze context"].map((lens, index) => <span key={lens}><i>{String(index + 1).padStart(2, "0")}</i>{lens}</span>)}</div><p>Eight perspectives feed one company report, with explicit reasons behind its rule-based verdict.</p></TabsContent>
    <TabsContent value="news"><div className={styles.researchFlow}><span>Source quality</span><ArrowDown size={17} /><span>Recent price movement</span><ArrowDown size={17} /><strong>Fresh / Watch / Chase risk</strong></div><p>A strong headline alone is not enough. The system also checks whether the price has already moved.</p></TabsContent>
    <TabsContent value="risk"><div className={styles.riskChecks}>{["Position concentration", "Sector exposure", "Portfolio beta", "Positions near stops"].map((check) => <span key={check}><ShieldCheck size={16} />{check}</span>)}</div><p>Portfolio checks influence suggested entry size. This is research and record-keeping, not broker execution.</p></TabsContent>
    <TabsContent value="validation"><div className={styles.validationSketch}><span>Historical simulation</span><strong>Reconstructible signals only</strong><span>Slippage · sizing · stops · targets</span></div><p>Historical coverage is partial. Forward logs and validation tools are separate from the daily research workflow.</p></TabsContent>
  </Tabs>;
}

/** Conceptual diagrams, separate from screenshots or live product data. */
export function ProjectVisual({ project }: { project: Project }) {
  const vendor = project.slug === "vendor-management-portal";
  const quality = project.slug === "qc-vendor-rma";
  const connector = project.slug === "ai-erp-connector";
  const trading = project.slug === "trading-research-desk";
  const tax = project.slug === "ai-tax-exemptions";
  const contacts = project.slug === "customer-data-foundations";
  const health = project.slug === "saanvilo-health";
  return (
    <div className={styles.visual} role="figure" aria-label={`${project.title}: ${health ? "deployed prototype preview" : "conceptual system illustration"}`} data-kind={tax || contacts ? "workflow" : health ? "health" : vendor ? "portal" : quality ? "quality" : connector ? "connector" : trading ? "research" : "system"}>
      <div className={styles.visualTop}><span>{tax || contacts ? "Try the workflow" : health ? "Product preview" : trading ? "Research desk" : "System sketch"}</span><span>TR / {project.date}</span></div>
      {tax ? <TaxCertificateWorkflow /> : contacts ? <ContactCleanupWorkflow /> : health ? <div className={styles.healthSketch}><Image src="/images/projects/saanvilo-overview.webp" alt="Saanvilo's deployed sample-data overview with report capture, medicine entries and visit preparation" width={1440} height={1000} sizes="(max-width:640px) 90vw, 900px" /><div><strong>A little less to carry.</strong><span>Family records · Visit preparation · Interactive prototype</span></div></div> : project.slug === "heckler-headless" ? <div className={styles.platformSketch}>
        <span className={styles.sketchLabel}>The workflow crosses the whole business</span>
        <div>{["Quotes & orders", "Supply & planning", "Tax & approvals", "Contacts & identity"].map((name, index) => <span key={name}><small>0{index + 1}</small><strong>{name}</strong></span>)}</div>
        <p><Database size={17} /><strong>Connected operational records</strong><span>Odoo / Shopify / Account directory</span></p>
        <span className={styles.sketchFoot}>Shared platform · My contributions</span>
      </div> : vendor ? (
        <div className={styles.portalSketch}>
          <div className={styles.sheetSketch}>
            <span className={styles.sketchLabel}>One shared record</span>
            <div className={styles.sheetHeading}><Boxes size={19} /><strong>Vendor workspace</strong></div>
            {["Products", "Purchase orders", "Deliveries", "Returns"].map((item, index) => <div className={styles.sheetRow} key={item}><span>0{index + 1}</span><span>{item}</span><span className={styles.recordLine} /></div>)}
          </div>
          <div className={styles.connectedRecord}><Database size={22} /><strong>Odoo 19</strong><span>Admin + vendor views</span></div>
        </div>
      ) : quality ? (
        <div className={styles.qualitySketch}>
          <span className={styles.sketchLabel}>A return has a next step</span>
          <div className={styles.qualityLanes}>
            {[{ name: "Inspect", icon: Search }, { name: "Decide", icon: SlidersHorizontal }, { name: "Resolve", icon: FileCheck2 }].map(({ name, icon: Icon }, index) => <div key={name}><span className={styles.laneNumber}>0{index + 1}</span><Icon size={26} strokeWidth={1.3} /><strong>{name}</strong><span className={styles.recordLine} /><span className={styles.recordLine} /></div>)}
          </div>
          <div className={styles.sketchFoot}><ShieldCheck size={15} /> Clear ownership at every handoff</div>
        </div>
      ) : connector ? (
        <div className={styles.connectorSketch}>
          <div className={styles.question}><MessageSquare size={18} /><span>Ask a business question</span></div><ArrowDown size={20} />
          <div className={styles.toolRoute}><span>MCP tools</span><ArrowRight size={18} /><Database size={20} /><span>Odoo</span></div><ArrowDown size={20} />
          <div className={styles.answer}><Check size={18} /><span>An answer grounded in records</span></div>
        </div>
      ) : trading ? (
        <ResearchSketch />
      ) : project.slug === "neighbourhelper" ? (
        <div className={styles.neighbourSketch}><span className={styles.sketchLabel}>A prototype for everyday help</span><div className={styles.neighbourRoles}><span>Family</span><span>Older adult</span><strong>A request<br />for help</strong><span>Volunteer</span><span>Admin</span></div><p>Request → apply → update → complete</p><span className={styles.sketchFoot}>Mock data and local state. No backend.</span></div>
      ) : project.slug === "manufacturing-cost-accounting" ? (
        <div className={styles.costSketch}><span className={styles.sketchLabel}>Follow the cost into the accounts</span><div><span>Materials</span><b>+</b><span>Labour</span><b>+</b><span>Overhead</span></div><ArrowDown size={24} /><strong>Cost per unit</strong><span className={styles.costLedger}>Production records → Odoo Accounting</span></div>
      ) : project.slug === "stripe-tax-odoo" ? (
        <div className={styles.taxSketch}><span className={styles.sketchLabel}>Tax has a lifecycle</span><div>{["Order", "Invoice", "Refund"].map((stage, index) => <span key={stage}><i>0{index + 1}</i><strong>{stage}</strong><small>{["Calculate", "Post transaction", "Reverse tax"][index]}</small></span>)}</div><span className={styles.sketchFoot}>Exemptions · Freight · Recalculation</span></div>
      ) : (
        <div className={styles.systemSketch}><span className={styles.sketchLabel}>{project.category}</span><div className={styles.projectFlow}>{(projectFlows[project.slug] ?? project.tech.slice(0, 3)).map((step, index) => <div key={step}><span>0{index + 1}</span><strong>{step}</strong>{index < 2 && <ArrowDown size={17} />}</div>)}</div><span className={styles.sketchFoot}>A map of the project’s moving parts</span></div>
      )}
      <span className={styles.visualCaption}>{health ? "Actual demo capture · Sample data" : tax || contacts ? "Illustrative workflow" : "Conceptual illustration"}</span>
    </div>
  );
}
