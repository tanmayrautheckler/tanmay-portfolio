"use client";

import { useRef, useState } from "react";
import { AnimatePresence, motion, useMotionValueEvent, useTransform, type MotionValue } from "framer-motion";
import { Button } from "@/components/ui/button";
import "./about-folio-journey.css";

const stops = [
  { name: "Manipal", place: "MANIPAL INSTITUTE OF TECHNOLOGY", role: "Aeronautical engineering", note: "B.Tech Aeronautical Engineering · GPA 3.5", short: "Engineering begins" },
  { name: "Mumbai", place: "VATS & VESSELS", role: "On the manufacturing floor", note: "Production supervisor, working with welders and machinists.", short: "Learning by making" },
  { name: "ASU", place: "ARIZONA STATE UNIVERSITY", role: "A different perspective", note: "MS Mechanical Engineering · GPA 3.8", short: "Across continents" },
  { name: "United Foods", place: "UNITED FOODS INTERNATIONAL", role: "Back to production", note: "Manufacturing engineering, putting learning to work.", short: "Studies into practice" },
  { name: "Heckler", place: "HECKLER DESIGN", role: "Connecting the business", note: "Odoo and business systems across eight departments.", short: "The work today" },
] as const;

const points = [[40, 96], [220, 46], [400, 96], [580, 46], [760, 96]] as const;
const route = "M40 96C100 96 160 46 220 46C280 46 340 96 400 96C460 96 520 46 580 46C640 46 700 96 760 96";

function routePoint(value: number) {
  const t = Math.min(1, Math.max(0, Number.isFinite(value) ? value : 0));
  const segment = Math.min(3, Math.floor(t * 4));
  const u = t * 4 - segment;
  const a = points[segment], b = points[segment + 1];
  return { x: a[0] + (b[0] - a[0]) * u, y: a[1] + (b[1] - a[1]) * (3 * u * u - 2 * u * u * u) };
}

/** Progress is local to this journey, from 0 at Manipal to 1 at Heckler. */
export function AboutFolioJourney({ progress, reduced }: { progress: MotionValue<number>; reduced: boolean }) {
  const [automatic, setAutomatic] = useState(() => Math.min(4, Math.max(0, Math.round(progress.get() * 4))));
  const [manual, setManual] = useState<number | null>(null);
  const chosenAt = useRef(0);
  const drawn = useTransform(progress, value => Math.min(1, Math.max(0, value)));
  const markerX = useTransform(progress, value => routePoint(value).x);
  const markerY = useTransform(progress, value => routePoint(value).y);
  useMotionValueEvent(progress, "change", value => {
    setAutomatic(Math.min(4, Math.max(0, Math.round(value * 4))));
    if (Math.abs(value - chosenAt.current) > .035) setManual(null);
  });
  const selected = manual ?? automatic;
  const stop = stops[selected];

  return <section className="folio-journey" aria-label="From engineering studies to business systems">
    <header><span>A FEW STOPS THAT SHAPED ME</span><span>INDIA <i /> ARIZONA</span></header>
    <div className="folio-journey-route" aria-hidden="true"><svg viewBox="0 0 800 138" fill="none"><path d={route} className="folio-route-base" /><motion.path d={route} className="folio-route-drawn" style={{ pathLength: drawn }} />{points.map(([x, y], index) => <g key={index}><circle cx={x} cy={y} r={selected === index ? 7 : 4} className={selected === index ? "folio-route-selected" : "folio-route-stop"} /></g>)}<motion.circle cx={markerX} cy={markerY} r="12" className="folio-route-halo" /><motion.circle cx={markerX} cy={markerY} r="4.5" className="folio-route-traveler" /></svg></div>
    <nav aria-label="Explore the five journey stops">{stops.map((item, index) => <Button key={item.name} variant="ghost" aria-pressed={selected === index} onClick={() => { chosenAt.current = progress.get(); setManual(index); }} aria-label={`Explore ${item.name}: ${item.short}`}><span>0{index + 1}</span><strong>{item.name}</strong></Button>)}</nav>
    <AnimatePresence mode="wait"><motion.div className="folio-journey-note" key={selected} initial={{ opacity: reduced ? 1 : 0, y: reduced ? 0 : 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: reduced ? 1 : 0 }} transition={{ duration: reduced ? 0 : .16 }} aria-live="polite"><span>{stop.place}</span><div><h3>{stop.role}</h3><p>{stop.note}</p></div><small>{String(selected + 1).padStart(2, "0")} / 05</small></motion.div></AnimatePresence>
  </section>;
}
