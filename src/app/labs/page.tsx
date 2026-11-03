"use client";

import { useRef, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { Dialog } from "radix-ui";
import { MotionConfig } from "framer-motion";
import { ArrowRight, ArrowUpRight, Bot, Check, Expand, Layers3, Package, RotateCcw, SlidersHorizontal, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProjectCinema } from "@/components/project-cinema";
import "./labs.css";

function DemoLoading() { return <div className="labs-loading" role="status">Preparing the workspace…</div>; }
const BackorderDashboard = dynamic(() => import("@/components/labs/backorder-dashboard").then((module) => module.BackorderDashboard), { ssr: false, loading: DemoLoading });
const VendorPortalApp = dynamic(() => import("@/components/labs/vendor-portal-card").then((module) => module.VendorPortalApp), { ssr: false, loading: DemoLoading });
const MCPCoworkApp = dynamic(() => import("@/components/labs/mcp-cowork-card").then((module) => module.MCPCoworkApp), { ssr: false, loading: DemoLoading });
const SupplyDesk = dynamic(() => import("@/components/labs/supply-desk").then((module) => module.SupplyDesk), { ssr: false, loading: DemoLoading });

const LABS = [
  { id: "supply", title: "Partner workspace", short: "Every handoff connected.", icon: Layers3, question: "The whole picture. Then the next action.", description: "Explore an overview that leads into real controls: task ownership, searchable orders, batch commitments, dispatch and return responses. Every record here is fictional.", steps: ["Click an overview chart to inspect its orders", "Take a task, plan its batches and record dispatch", "Resolve a return or query the current sample records"], detail: "/projects/heckler-headless", component: SupplyDesk },
  { id: "orders", title: "Backorders", short: "Find what can ship.", icon: SlidersHorizontal, question: "What can we ship today?", description: "Filter the order queue, follow the bottleneck and inspect the lines behind a total.", steps: ["Pick a status or sales channel", "Open an order to see its line items", "Export the filtered rows as CSV"], detail: "/projects/sql-kpi-dashboards", component: BackorderDashboard },
  { id: "returns", title: "Supplier returns", short: "Follow a resolution.", icon: Package, question: "A defect. What happens next?", description: "Work through a supplier return from the reported problem to a sample credit draft.", steps: ["Select a reported RMA", "Choose Credit, then approve the return", "Issue a sample credit note"], detail: "/projects/qc-vendor-rma", component: VendorPortalApp },
  { id: "assistant", title: "Odoo assistant", short: "Look inside the answer.", icon: Bot, question: "How did the answer get here?", description: "Follow a prepared question through the plan, Odoo query, returned records and final answer.", steps: ["Choose one of six sample questions", "Follow the tool calls and returned records", "Try another question or reset"], detail: "/projects/ai-erp-connector", component: MCPCoworkApp },
];

function Preview({ id }: { id: string }) {
  if (id === "supply") return <div className="labs-preview-supply" aria-hidden="true"><span><i /><b /></span><span><i /><b /></span><small>plan → commit → dispatch</small></div>;
  if (id === "orders") return <div className="labs-preview-orders" aria-hidden="true"><span style={{ width: "74%" }} /><span style={{ width: "46%" }} /><span style={{ width: "61%" }} /><span style={{ width: "28%" }} /></div>;
  if (id === "returns") return <div className="labs-preview-returns" aria-hidden="true"><span>01</span><i /><span>02</span><i /><span><Check size={13} /></span></div>;
  return <div className="labs-preview-assistant" aria-hidden="true"><span>question</span><i>↳</i><span>records</span><i>↳</i><strong>answer</strong></div>;
}

export default function LabsPage() {
  const [selected, setSelected] = useState("supply");
  const [resetKey, setResetKey] = useState(0);
  const [expanded, setExpanded] = useState(false);
  const fullscreenButton = useRef<HTMLButtonElement>(null);
  const lab = LABS.find((item) => item.id === selected) ?? LABS[0];
  const Demo = lab.component;

  return (
    <MotionConfig reducedMotion="user">
      <article className="labs-page">
        <header className="labs-heading"><p>PLAYGROUND / WORKING EXAMPLES</p><h1>Go on.<br /><span>Try the controls.</span></h1><div><p>A few workflows from my work, opened up for you to explore.</p><span>04 DEMOS<br />ALL SAMPLE DATA</span></div></header>
        <Tabs value={selected} onValueChange={setSelected} className="labs-tabs">
          <TabsList aria-label="Choose a working demo" className="labs-selector">{LABS.map((item, index) => { const Icon = item.icon; return <TabsTrigger key={item.id} value={item.id}><span className="labs-selector-top"><span>0{index + 1}</span><Icon size={15} /></span><Preview id={item.id} /><strong>{item.title}</strong><span className="labs-selector-caption">{item.short}</span></TabsTrigger>; })}</TabsList>
          {LABS.map((item) => <TabsContent key={item.id} value={item.id} className="labs-panel"><div className="labs-brief"><div><p>YOUR WORKSPACE / {String(LABS.indexOf(item) + 1).padStart(2, "0")}</p><h2>{item.question}</h2><p>{item.description}</p><Link href={item.detail}>Read the project <ArrowUpRight size={14} /></Link></div><ol>{item.steps.map((step, index) => <li key={step}><span>0{index + 1}</span>{step}</li>)}</ol></div></TabsContent>)}
        </Tabs>
        <div id="working-demo" className="labs-workspace scroll-mt-24" data-demo={selected}>
          <div className="labs-toolbar"><div><span /><strong>{lab.title}</strong><span className="labs-sample-label">Sample workspace</span></div><div><Button variant="ghost" onClick={() => setResetKey((key) => key + 1)} aria-label="Reset current demo"><RotateCcw size={14} /><span>Reset</span></Button><Button ref={fullscreenButton} variant="ghost" onClick={() => setExpanded(true)} aria-haspopup="dialog" aria-label="Open demo in full screen"><Expand size={14} /><span>Full screen</span></Button></div></div>
          <div className="labs-demo-surface"><Demo key={`${selected}-${resetKey}`} /></div>
          <p className="labs-workspace-note">Use the controls inside the workspace. Changes reset when you switch demos.</p>
        </div>
        <div className="labs-bottom"><div><span>WHY THESE EXIST</span><p>Small interactions make a process easier to understand. These examples keep the useful parts of real workflows and replace the business records with sample data.</p></div><Link href="/contact">Have a process in mind?<ArrowRight size={18} /></Link></div>
      </article>
      <ProjectCinema />
      <Dialog.Root open={expanded} onOpenChange={setExpanded}>
        <Dialog.Portal><Dialog.Overlay className="labs-dialog-overlay" /><Dialog.Content className="labs-dialog" aria-describedby="labs-dialog-description" onCloseAutoFocus={(event) => { event.preventDefault(); fullscreenButton.current?.focus(); }}><div className="labs-dialog-heading"><div><Dialog.Title>{lab.title}</Dialog.Title><Dialog.Description id="labs-dialog-description">A fresh sample session. All changes stay in this demo.</Dialog.Description></div><div><Button variant="ghost" onClick={() => setResetKey((key) => key + 1)} aria-label="Reset full screen demo"><RotateCcw size={16} /></Button><Dialog.Close asChild><Button variant="ghost" aria-label="Close full screen demo"><X size={19} /></Button></Dialog.Close></div></div><div className="labs-dialog-surface" data-demo={selected}><Demo key={`full-${selected}-${resetKey}`} /></div></Dialog.Content></Dialog.Portal>
      </Dialog.Root>
    </MotionConfig>
  );
}
