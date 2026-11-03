"use client";
import { useState } from "react";
import { Check, CheckCheck, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DialogClose, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { readyDateLabel, validSchedule, type SupplyOrder, type SupplyLine } from "./supply-desk-model";
import "./supply-desk.css";
export function CommitmentSheet({ order, onSave, onClose }: { order: SupplyOrder; onSave: (lines: SupplyLine[], reference: string) => void; onClose: () => void }) {
  const [lines, setLines] = useState(() => order.lines.map(line => ({ ...line })));
  const [reference, setReference] = useState(order.reference || "SAMPLE-54");
  const patch = (id: string, change: Partial<SupplyLine>) => setLines(current => current.map(line => line.id === id ? { ...line, ...change } : line));
  const ready = validSchedule(lines) && reference.trim().length > 0;
  return <form className="supply-plan-form" onSubmit={event => { event.preventDefault(); if (ready) onSave(lines, reference.trim()); }}>
    <header><div><p>COMMITMENT / {order.id}</p><DialogTitle>Make the dates add up.</DialogTitle><DialogDescription>Split quantities across ready dates. This is a fictional, local-only exercise.</DialogDescription></div><DialogClose asChild><Button variant="ghost" aria-label="Close commitment planner"><X size={19} /></Button></DialogClose></header>
    <div className="supply-plan-body" data-lenis-prevent>
      <label className="supply-reference">Your sample reference<input required maxLength={35} value={reference} onChange={event => setReference(event.target.value)} /></label>
      <div className="supply-bulk"><span>Requested by <strong>{readyDateLabel(order.requested)}</strong></span><Button type="button" variant="ghost" onClick={() => setLines(current => current.map(line => ({ ...line, date: current[0].date, laterDate: current[0].laterDate })))}>Use first item’s dates for all</Button></div>
      {lines.map((line, index) => <fieldset key={line.id} className="supply-line-plan"><legend><span>0{index + 1}</span>{line.name}<small>{line.quantity} ordered</small></legend>
        <div className="supply-batch-row"><span className="supply-batch-dot" /><label>First batch<input type="number" min={1} max={line.quantity} step={1} required value={line.first} onChange={event => patch(line.id, { first: Number(event.target.value) })} aria-label={`${line.name} first batch quantity`} /></label><label>Ready date<input type="date" required value={line.date} onChange={event => patch(line.id, { date: event.target.value })} aria-label={`${line.name} first ready date`} /></label></div>
        {line.first < line.quantity && <div className="supply-batch-row" data-later><span className="supply-batch-dot" /><div><span>Remaining</span><strong>{line.quantity - line.first} <small>units</small></strong></div><label>Later ready date<input type="date" min={line.date} required value={line.laterDate} onChange={event => patch(line.id, { laterDate: event.target.value })} aria-label={`${line.name} remaining ready date`} /></label></div>}
        <div className="supply-balance" data-valid={Number.isInteger(line.first) && line.first > 0 && line.first <= line.quantity}><span style={{ width: `${Math.max(0, Math.min(100, line.first / line.quantity * 100))}%` }} /><i /></div>
        <p className="supply-balance-text">{Number.isInteger(line.first) && line.first > 0 && line.first <= line.quantity ? <><Check size={12} /> All {line.quantity} units accounted for{line.first < line.quantity ? " · two batches" : " · one batch"}</> : "First batch must be a whole number between 1 and the ordered quantity."}</p>
      </fieldset>)}
      {!validSchedule(lines) && <p className="supply-validation" role="status">Check quantities and dates. Later batches cannot be ready before first batches.</p>}
      <p className="supply-plan-caption">A ready date is a commitment to prepare goods, not a delivery guarantee.</p>
    </div>
    <footer><Button type="button" variant="ghost" onClick={onClose}>Cancel</Button><Button type="submit" disabled={!ready} className="supply-primary"><CheckCheck size={16} /> Confirm commitment</Button></footer>
  </form>;
}

