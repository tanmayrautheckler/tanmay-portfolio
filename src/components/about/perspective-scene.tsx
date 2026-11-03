"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { motion, useMotionValue, useReducedMotion, useSpring } from "framer-motion";
import { ArrowUpRight, Maximize2, Pause, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import "./perspective-scene.css";

const views = [
  { label: "Here", name: "Look at the foreground", scale: 1.16, y: "-5%", origin: "46% 68%", target: "The person in the frame", note: "Start with what’s close." },
  { label: "Beyond", name: "Look beyond to the sky", scale: 1.48, y: "12%", origin: "60% 30%", target: "The sky beyond the window", note: "Let something else come into view." },
  { label: "Whole view", name: "See the whole scene", scale: 1, y: "0%", origin: "50% 50%", target: "A little more context", note: "Same moment. A wider perspective." },
] as const;

/** One real photograph, three deliberate camera framings. */
export function PerspectiveScene() {
  const [view, setView] = useState(2);
  const [paused, setPaused] = useState(false);
  const reduced = useReducedMotion();
  const root = useRef<HTMLElement>(null);
  const pointerX = useMotionValue(0), pointerY = useMotionValue(0);
  const x = useSpring(pointerX, { stiffness: 45, damping: 22 });
  const y = useSpring(pointerY, { stiffness: 45, damping: 22 });
  const current = views[view];
  const still = Boolean(reduced || paused);

  return <section className="perspective-scene" ref={root} data-view={view} data-paused={still}
    aria-label="A different perspective, through my northern lights photograph"
    onPointerMove={event => {
      if (still || event.pointerType !== "mouse") return;
      const box = event.currentTarget.getBoundingClientRect();
      pointerX.set(((event.clientX - box.left) / box.width - .5) * 12);
      pointerY.set(((event.clientY - box.top) / box.height - .5) * 8);
    }}
    onPointerLeave={() => { pointerX.set(0); pointerY.set(0); }}>
    <div className="perspective-photo-window">
      <motion.div className="perspective-camera" animate={{ scale: current.scale, y: current.y }}
        style={{ transformOrigin: current.origin }} transition={{ duration: reduced ? 0 : 1.1, ease: [.22, .7, .18, 1] }}>
        <motion.div className="perspective-photo" style={{ x: still ? 0 : x, y: still ? 0 : y }}>
          <Image src="/images/about/gallery/northern-lights.webp" alt="Tanmay looking through a geometric window at the northern lights" fill sizes="(max-width:700px) 100vw, 1060px" priority />
          <div className="perspective-sky-light" aria-hidden="true" />
        </motion.div>
      </motion.div>
    </div>
    <div className="perspective-shade" aria-hidden="true" />
    <header className="perspective-topline"><span>04 / STILL CURIOUS</span><Button variant="ghost" size="icon" aria-label={paused ? "Resume sky movement" : "Pause sky movement"} aria-pressed={paused} onClick={() => setPaused(value => !value)}>{paused ? <Play size={15} /> : <Pause size={15} />}</Button></header>
    <div className="perspective-intro"><span>OUTSIDE MY OWN POINT OF VIEW</span><h3>One moment.<br /><em>Three ways to see it.</em></h3><p>I listen to different philosophies.<br />I like seeing the same thing another way.</p></div>
    <motion.div className="perspective-viewfinder" aria-hidden="true" animate={{ left: view === 0 ? "48%" : view === 1 ? "66%" : "66%", top: view === 0 ? "55%" : view === 1 ? "28%" : "43%", width: view === 2 ? "43%" : "24%", height: view === 2 ? "59%" : "30%" }} transition={{ duration: reduced ? 0 : .8 }}><i /><i /><i /><i /><span>{String(view + 1).padStart(2, "0")} / {view === 2 ? "WIDE" : view === 1 ? "DISTANCE" : "NEAR"}</span></motion.div>
    <div className="perspective-observation" aria-live="polite"><span>{current.target}</span><p>{current.note}</p></div>
    <footer className="perspective-console"><div><Maximize2 size={15} /><span>CHANGE YOUR VIEW</span></div><nav aria-label="Photograph perspectives">{views.map((item, index) => <Button key={item.label} variant="ghost" aria-label={item.name} aria-pressed={view === index} onClick={() => setView(index)}><small>0{index + 1}</small>{item.label}<ArrowUpRight size={13} /></Button>)}</nav><span>FROM MY CAMERA ROLL</span></footer>
  </section>;
}
