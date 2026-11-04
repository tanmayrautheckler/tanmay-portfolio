"use client";

import { useState } from "react";
import { ArrowDown, ArrowRight, Check, FileCheck2, GitMerge, ShieldCheck, ScanText, CircleHelp } from "lucide-react";
import { Button } from "@/components/ui/button";
import styles from "./project-workflows.module.css";

const taxCases = {
  covered: { label: "Clear evidence", states: ["AZ", "CA", "WA"], heading: "Ready for the configured approval path.", detail: "States, resale reason and supporting evidence agree. Full checks and rollout controls still govern the decision.", route: "Policy-based approval", tone: "clear" },
  missing: { label: "Missing state", states: ["AZ", "CA"], heading: "Washington needs its certificate.", detail: "The sample request includes WA. The supplied certificate covers AZ and CA. Ask for the missing evidence.", route: "Request information", tone: "review" },
  unreadable: { label: "Unclear scan", states: [], heading: "Keep the manual route open.", detail: "An unreadable document must not stop someone sending the form. Finance can review the original evidence.", route: "Finance review", tone: "review" },
} as const;
type TaxCase = keyof typeof taxCases;

export function TaxCertificateWorkflow() {
  const [scenario, setScenario] = useState<TaxCase>("covered");
  const [read, setRead] = useState(false);
  const item = taxCases[scenario];
  return <div className={styles.workflow}>
    <div role="group" aria-label="Certificate sample scenarios" className={styles.tabs}>
      {Object.entries(taxCases).map(([key, value]) => <Button key={key} variant="ghost" aria-pressed={scenario === key} onClick={() => { setScenario(key as TaxCase); setRead(false); }}>{value.label}</Button>)}
    </div>
    <div className={styles.document}>
      <div className={styles.documentTitle}><FileCheck2 size={20} /><div><strong>Resale certificate</strong><span>Fictional document / 01</span></div><span className={styles.documentStamp}>SAMPLE</span></div>
      <div className={styles.documentLines}><i /><i /><i /></div>
      <div className={styles.fieldRow}><span>Requested states</span><strong>AZ · CA · WA</strong></div>
      <Button variant="outline" className={styles.readButton} onClick={() => setRead(!read)}><ScanText size={15} />{read ? "Reset sample" : "Preview the certificate read"}<ArrowRight size={14} /></Button>
    </div>
    <ArrowDown className={styles.connector} size={18} />
    <div className={styles.result} data-tone={read ? item.tone : "idle"} role="status" aria-live="polite">
      <div className={styles.resultHeading}><span>{read ? item.route : "Assistance, with evidence."}</span>{read ? <ShieldCheck size={17} /> : <CircleHelp size={17} />}</div>
      {read && item.states.length > 0 && <div className={styles.stateChips}>{item.states.map(state => <span key={state}><Check size={12} />{state}</span>)}{scenario === "missing" && <span data-missing="true">WA · missing</span>}</div>}
      <strong>{read ? item.heading : "A suggestion is not an exemption."}</strong>
      <p>{read ? item.detail : "A quick read can fill the form. The full review checks what the evidence actually supports."}</p>
    </div>
    <p className={styles.sampleNote}>Interactive illustration · Fictional certificate · No upload</p>
  </div>;
}

const contactCases = {
  match: { label: "Clear match", title: "One person, two source references.", result: "Candidate for review", detail: "Normalize the repeated email and preserve both sources. Check the existing company relationship before changing anything.", second: "person@company.example", tone: "clear" },
  conflict: { label: "Conflicting company", title: "A shared domain cannot decide this.", result: "Needs an operator", detail: "Existing company affiliations disagree. Keep the records separate until the intended relationship is reviewed.", second: "Another company affiliation", tone: "review" },
  unknown: { label: "Unassigned", title: "Leave an uncertain match unresolved.", result: "Review queue", detail: "No reliable company affiliation is available. Record the gap instead of silently attaching the person to an account.", second: "Company relationship missing", tone: "review" },
} as const;
type ContactCase = keyof typeof contactCases;

export function ContactCleanupWorkflow() {
  const [scenario, setScenario] = useState<ContactCase>("match");
  const [preview, setPreview] = useState(false);
  const item = contactCases[scenario];
  return <div className={styles.workflow}>
    <div role="group" aria-label="Contact review sample scenarios" className={styles.tabs}>
      {Object.entries(contactCases).map(([key, value]) => <Button key={key} variant="ghost" aria-pressed={scenario === key} onClick={() => { setScenario(key as ContactCase); setPreview(false); }}>{value.label}</Button>)}
    </div>
    <div className={styles.sourceRecords}>
      <div className={styles.recordLabel}><span>Source records</span><span>Fictional example</span></div>
      <div className={styles.sourceRow}><span>A</span><div><strong>Contact 01</strong><small>person@company.example</small></div><span>Company A</span></div>
      <div className={styles.sourceRow}><span>B</span><div><strong>Contact 01</strong><small>{item.second}</small></div><span>{scenario === "match" ? "Company A" : "Review"}</span></div>
      <Button variant="outline" className={styles.readButton} onClick={() => setPreview(!preview)}><GitMerge size={15} />{preview ? "Reset mapping" : "Preview the match plan"}<ArrowRight size={14} /></Button>
    </div>
    <ArrowDown className={styles.connector} size={18} />
    <div className={styles.result} data-tone={preview ? item.tone : "idle"} role="status" aria-live="polite">
      <div className={styles.resultHeading}><span>{preview ? item.result : "Audit → Review → Apply"}</span><ShieldCheck size={17} /></div>
      <strong>{preview ? item.title : "Keep the relationship. Fix the record."}</strong>
      <p>{preview ? item.detail : "A proposed match stays separate from an applied change—and from permission to access an account."}</p>
    </div>
    <p className={styles.sampleNote}>Interactive illustration · Fictional records · No changes applied</p>
  </div>;
}
