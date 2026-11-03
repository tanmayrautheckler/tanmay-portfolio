"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { motion, useMotionValueEvent, useReducedMotion, useScroll, useSpring, useTransform } from "framer-motion";
import { ArrowDown, ArrowUpRight, RotateCcw, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AboutFolioArt } from "./about-folio-art";
import { AboutFolioJourney } from "./about-folio-journey";
import "./about-folio.css";

const chapters = [
  { label: "A little about me", title: <>An engineer.<br/>And <em>then some.</em></>, text: "I’m Tanmay. Mumbai roots, Phoenix days. I work on business systems at Heckler Design. I find plenty to be curious about outside them.", note: "A few things I carry with me." },
  { label: "The route here", title: <>Different places.<br/><em>A wider view.</em></>, text: "Aeronautical engineering in Manipal. Mechanical engineering at ASU. Manufacturing floors, then the systems connecting them. Each stop changed how I see the next.", note: "Pick a stop. There’s a story behind each one." },
  { label: "Away from the desk", title: <>Usually taking<br/><em>the long way.</em></>, text: "A tent among the trees. A road I haven’t taken. Occasionally, jumping out of a plane. And when Barça are playing, you know where my attention is.", note: "Hover or tap a photograph to look closer." },
  { label: "Still curious", title: <>Some questions<br/><em>come home.</em></>, text: "I listen to different philosophies. Follow football. Barça and Messi, always. And when markets sent me down a rabbit hole, I built my own trading research platform.", note: "Curiosity doesn’t stay in one lane." },
];
const learning = ["Lean Six Sigma Green Belt", "SAP S/4HANA Essentials", "Supply Chain Operations · Rutgers", "Tableau Visualization", "Materials Selection · MIT", "Root Cause Analysis"];

export function AboutFolio() {
  const root = useRef<HTMLDivElement>(null);
  const chapterRef = useRef(0);
  const [chapter, setChapter] = useState(0);
    const reduced = Boolean(useReducedMotion());
  const { scrollYProgress } = useScroll({ target: root, offset: ["start start", "end end"] });
  const smooth = useSpring(scrollYProgress, { stiffness: 65, damping: 24, mass: .4 });
  const progress = reduced ? scrollYProgress : smooth;
  const journeyProgress = useTransform(progress, [.25, .5], [0, 1]);
  useMotionValueEvent(progress, "change", value => {
    const next = Math.min(3, Math.floor(value * 4));
    if (next !== chapterRef.current) { chapterRef.current = next; setChapter(next); }
  });
  function go(index: number) {
    if (!root.current) return;
    const start = window.scrollY + root.current.getBoundingClientRect().top - 64;
    const distance = root.current.offsetHeight - window.innerHeight;
    window.scrollTo({ top: start + distance * ([0, .34, .62, .94][index]), behavior: reduced ? "instant" : "smooth" });
  }
  return <div ref={root} className="about-folio" data-chapter={chapter} data-paused={reduced}>
    <div className="folio-page">
      <header className="folio-masthead"><span>TANMAY RAUT <i/> PERSONAL NOTES</span><span>BASED IN PHOENIX, AZ</span></header>
      <div className="folio-composition">
        <div className="folio-words">
          <span className="folio-chapter">0{chapter + 1} / {chapters[chapter].label}</span>
          <motion.div key={chapter} initial={reduced ? false : { opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .4 }}>
            <h1>{chapters[chapter].title}</h1><p>{chapters[chapter].text}</p>
          </motion.div>
          <div className="folio-actions">
            {chapter === 0 && <Button variant="ghost" onClick={() => go(1)}>Unpack my story <ArrowDown/></Button>}
            {chapter === 1 && <Link href="/experience">My working life <ArrowUpRight/></Link>}
            {chapter === 2 && <span className="folio-handwritten">More life. Less screen time.</span>}
            {chapter === 3 && <Link href="/projects/trading-research-desk">See what I built <ArrowUpRight/></Link>}
          </div>
        </div>
        <div className="folio-visual">
          <AboutFolioArt progress={progress} reduced={reduced}/>
          <div className="folio-route-layer" aria-hidden={chapter !== 1} inert={chapter !== 1}>
            <AboutFolioJourney progress={journeyProgress} reduced={reduced}/>
          </div>
          <span className="folio-pencil-note">{chapters[chapter].note}</span>
        </div>
      </div>
      <footer className="folio-bottom">
        <nav aria-label="Story chapters">{chapters.map((item, i) => <Button key={item.label} variant="ghost" onClick={() => go(i)} aria-current={chapter === i ? "step" : undefined}><small>0{i + 1}</small><span>{["The person", "The journey", "Outside work", "Still curious"][i]}</span></Button>)}</nav>
        <div className="folio-utilities">
          <Button variant="ghost" size="icon" aria-label="Back to the beginning" onClick={() => go(0)}><RotateCcw/></Button>
          <Dialog><DialogTrigger asChild><Button variant="ghost" aria-label="Read background and qualifications"><Plus/><span>More about me</span></Button></DialogTrigger>
            <DialogContent className="folio-background"><DialogTitle>The details, too.</DialogTitle><DialogDescription>Engineering roots. Systems work. Still learning.</DialogDescription><div className="folio-background-body"><h3>Education</h3><p>B.Tech Aeronautical Engineering · Manipal Institute of Technology · GPA 3.5. Mechanical minor and Supply Chain Management.</p><p>MS Mechanical Engineering · Arizona State University · GPA 3.8. Statistical process control, quality and operations.</p><h3>What I work with</h3><p>Odoo ERP, business process design, manufacturing operations, cost accounting, integrations and AI workflows. At Heckler, the work spans eight departments.</p><h3>Continuing to learn</h3><ul>{learning.map(item => <li key={item}>{item}</li>)}</ul><Link href="/experience">Explore my experience <ArrowUpRight size={15}/></Link><Link href="/contact">Start a conversation <ArrowUpRight size={15}/></Link></div></DialogContent>
          </Dialog>
        </div>
      </footer>
      <div className="folio-scroll"><span>SCROLL TO UNFOLD</span><div><motion.i style={{ scaleX: progress, transformOrigin: "left" }}/></div><span>0{chapter + 1} — 04</span></div>
    </div>
  </div>;
}
