"use client";

import { useState, type CSSProperties } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowRight, ArrowUpRight, Check, Pause, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import "./research-scene.css";

// These research inputs and the scan → deep-dive → briefing sequence come from
// the personal trading repository. No account data or market values are used.
const lenses = [
  { name: "Technicals", question: "What does the price structure say?", detail: "RSI, MACD and price structure give the move some context.", source: "data_fetch.py" },
  { name: "Momentum", question: "How is the move developing?", detail: "The deep dive compares one week, one month and three months of movement.", source: "deepdive.py" },
  { name: "Fundamentals", question: "What is underneath the ticker?", detail: "Growth, margins and cash flow bring the business into the picture.", source: "deepdive.py" },
  { name: "News", question: "What happened around the move?", detail: "Events and catalysts offer something specific to investigate.", source: "deepdive.py" },
  { name: "News quality", question: "How much should I trust the story?", detail: "Source weighting and a priced-in check help separate the headline from its context.", source: "news_edge.py" },
  { name: "Community", question: "What are other people noticing?", detail: "Reddit and YouTube discussion add another input to examine.", source: "community_score.py" },
  { name: "Insider activity", question: "What are insiders doing?", detail: "Form 4 open-market buys sit alongside the other research inputs.", source: "insider.py" },
  { name: "Squeeze context", question: "What else could be driving it?", detail: "Short interest and catalysts provide a separate view of the setup.", source: "squeeze_radar.py" },
] as const;

const stages = [
  { name: "Find a question", title: "It starts with\na question.", line: "Markets are something I study for fun. I built a platform to follow the questions further." },
  { name: "Look closer", title: "One subject.\nEight ways in.", line: "A headline is a beginning. I wanted somewhere to bring the rest of the context together." },
  { name: "Make sense of it", title: "Something to\ncome back to.", line: "The morning briefing brings the research together. Building the system is part of the curiosity." },
] as const;

export function ResearchScene() {
  const [stage, setStage] = useState(0);
  const [lens, setLens] = useState(4);
  const [paused, setPaused] = useState(false);
  const [look, setLook] = useState({ x: 0, y: 0 });
  const reduced = useReducedMotion();
  const current = lenses[lens];
  const instant = reduced ? 0 : .55;
  return <section className="research-scene" data-stage={stage} data-paused={paused || reduced} aria-label="Inside my personal market research project"
    style={{ "--desk-x": `${reduced ? 0 : look.x * 7}px`, "--desk-y": `${reduced ? 0 : look.y * 4}px` } as CSSProperties}
    onPointerMove={event => { if (event.pointerType !== "mouse" || paused || reduced) return; const box = event.currentTarget.getBoundingClientRect(); setLook({ x: (event.clientX - box.left) / box.width - .5, y: (event.clientY - box.top) / box.height - .5 }); }} onPointerLeave={() => setLook({ x: 0, y: 0 })}>
    <div className="research-room-light" aria-hidden="true" />
    <header className="research-scene-header"><span><i />AFTER HOURS / A PERSONAL PURSUIT</span><Button variant="ghost" size="icon" onClick={() => setPaused(value => !value)} aria-label={paused ? "Play desk atmosphere" : "Pause desk atmosphere"}>{paused ? <Play size={15} /> : <Pause size={15} />}</Button></header>
    <footer className="research-scene-footer"><nav aria-label="Explore my research process">{stages.map((item, index) => <Button key={item.name} variant="ghost" aria-pressed={stage === index} onClick={() => setStage(index)}><small>0{index + 1}</small><span>{item.name}</span><ArrowRight size={13} /></Button>)}</nav><Link href="/projects/trading-research-desk">See what I built<ArrowUpRight size={13} /></Link></footer>
    <div className="research-scene-caption" aria-live="polite"><span>THE THINGS I BUILD FOR MYSELF</span><AnimatePresence mode="wait"><motion.div key={stage} initial={{ opacity: 0, y: reduced ? 0 : 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: instant / 2 }}><h3>{stages[stage].title}</h3><p>{stages[stage].line}</p></motion.div></AnimatePresence></div>
    <div className="research-workbench" aria-live="polite">
      <div className="research-table-edge" aria-hidden="true" />
      <div className="research-lamp-shadow" aria-hidden="true" />
      <AnimatePresence mode="wait">
        {stage === 0 && <motion.div key="scanner" className="research-scan-object" initial={{ opacity: 0, rotateY: reduced ? 0 : -9, x: reduced ? 0 : 25 }} animate={{ opacity: 1, rotateY: 0, x: 0 }} exit={{ opacity: 0, x: reduced ? 0 : -20 }} transition={{ duration: instant }}>
          <div className="research-screen-bezel"><div className="research-screen-glass"><div className="research-screen-heading"><span>TANMAY / RESEARCH</span><i>PLATFORM VIEW</i></div><div className="research-screen-question">What’s worth<br /><em>a closer look?</em></div><div className="research-scan-lines">{["Price structure", "Momentum", "Upcoming events", "Research watchlist"].map((item, index) => <div key={item}><span>0{index + 1}</span><b>{item}</b><span className="research-signal-bars" aria-hidden="true">{[0, 1, 2, 3, 4].map(bar => <i key={bar} style={{ animationDelay: `${(index * 5 + bar) * -.3}s` }} />)}</span></div>)}</div><div className="research-screen-foot"><span>FOLLOW THE QUESTION</span><ArrowRight size={14} /></div><div className="research-screen-sweep" aria-hidden="true" /></div><span className="research-device-mark">BUILT AFTER HOURS</span></div>
          <div className="research-monitor-neck" aria-hidden="true" /><div className="research-monitor-foot" aria-hidden="true" />
          <div className="research-pencil" aria-hidden="true" />
          <div className="research-small-note"><span>NOTE TO SELF</span><p>Look at the<br />whole picture.</p><i>scan → question → research</i></div>
        </motion.div>}
        {stage === 1 && <motion.div key="dossier" className="research-dossier-object" initial={{ opacity: 0, rotate: reduced ? 0 : 5, y: reduced ? 0 : 20 }} animate={{ opacity: 1, rotate: 0, y: 0 }} exit={{ opacity: 0, y: reduced ? 0 : -15 }} transition={{ duration: instant }}>
          <div className="research-folder-sheet research-folder-sheet-back" aria-hidden="true" /><div className="research-folder-sheet research-folder-sheet-mid" aria-hidden="true" />
          <div className="research-dossier-page"><header><span>PERSONAL RESEARCH / FIELD NOTE</span><b>{String(lens + 1).padStart(2, "0")}<small>/ 08</small></b></header><div className="research-page-rule" /><span className="research-dossier-label">{current.name}</span><AnimatePresence mode="wait"><motion.div key={lens} initial={{ opacity: 0, x: reduced ? 0 : 9 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} transition={{ duration: instant / 3 }}><h4>{current.question}</h4><p>{current.detail}</p></motion.div></AnimatePresence><div className="research-page-source"><span>PART OF THE PLATFORM I BUILT</span><span className="research-source-kind">RESEARCH ENGINE / INPUT {String(lens + 1).padStart(2, "0")}</span></div><div className="research-page-stamp">A CLOSER<br />LOOK</div></div>
        </motion.div>}
        {stage === 2 && <motion.div key="brief" className="research-brief-object" initial={{ opacity: 0, rotate: reduced ? 0 : -5, y: reduced ? 0 : 25 }} animate={{ opacity: 1, rotate: 0, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: instant }}>
          <div className="research-brief-shadow" aria-hidden="true" /><article className="research-brief-page"><header><span>TANMAY’S PERSONAL RESEARCH</span><b>AM</b></header><span className="research-brief-edition">DAILY REVIEW / WHAT THE SYSTEM BRINGS TOGETHER</span><h4>The morning<br /><em>picture.</em></h4><div className="research-brief-rule" /><ol>{[{ title: "Candidates worth following", note: "Scanner → watchlist → deep dive" }, { title: "Context around the idea", note: "News, signals and research inputs" }, { title: "Things to check again", note: "Alerts, risk context and data health" }].map((item, index) => <li key={item.title}><span>0{index + 1}</span><div><strong>{item.title}</strong><small>{item.note}</small></div><Check size={15} /></li>)}</ol><footer><span>ONE SYSTEM. MORE CONTEXT.</span><span>PYTHON / REACT</span></footer></article><div className="research-brief-pencil" aria-hidden="true" />
        </motion.div>}
      </AnimatePresence>
    </div>
    {stage === 1 && <nav className="research-evidence-tabs" aria-label="Research inputs">{lenses.map((item, index) => <Button key={item.name} variant="ghost" aria-pressed={lens === index} onClick={() => setLens(index)}><small>{String(index + 1).padStart(2, "0")}</small>{item.name}</Button>)}</nav>}

  </section>;
}
