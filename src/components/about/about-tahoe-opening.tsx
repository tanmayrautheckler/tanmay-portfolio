"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { motion, useInView, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { ArrowDown, Pause, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import "./about-tahoe-opening.css";

const LakeCanvas = dynamic(() => import("./spatial-scenes").then(module => module.LakeCanvas), { ssr: false });

export function AboutTahoeOpening() {
  const root = useRef<HTMLElement>(null);
  const pointer = useRef({ x: .5, y: .3 });
  const reduced = useReducedMotion();
  const visible = useInView(root, { amount: .05 });
  const [paused, setPaused] = useState(false);
  const [pageVisible, setPageVisible] = useState(true);
  const { scrollYProgress } = useScroll({ target: root, offset: ["start start", "end start"] });
  const landscapeScale = useTransform(scrollYProgress, [0, 1], [1.08, 1]);
  const landscapeY = useTransform(scrollYProgress, [0, 1], [0, 65]);
  const portraitY = useTransform(scrollYProgress, [0, 1], [0, 140]);
  const portraitScale = useTransform(scrollYProgress, [0, 1], [1, 1.04]);
  const copyY = useTransform(scrollYProgress, [0, 1], [0, -35]);
  const active = visible && pageVisible && !paused && !reduced;

  useEffect(() => {
    const update = () => setPageVisible(!document.hidden);
    document.addEventListener("visibilitychange", update);
    return () => document.removeEventListener("visibilitychange", update);
  }, []);

  return <section ref={root} className="about-tahoe-opening" aria-label="About Tanmay Raut"
    onPointerMove={event => {
      if (!active || event.pointerType !== "mouse") return;
      const box = event.currentTarget.getBoundingClientRect();
      pointer.current = { x: (event.clientX - box.left) / box.width, y: 1 - (event.clientY - box.top) / box.height };
    }} onPointerLeave={() => { pointer.current = { x: .5, y: .3 }; }}>
    <motion.div className="tahoe-opening-landscape" style={{ scale: reduced ? 1 : landscapeScale, y: reduced ? 0 : landscapeY }}>
      <Image src="/images/about/tahoe/landscape.webp" alt="Lake Tahoe and mountains across the water" fill sizes="100vw" priority />
      {!reduced && <div className="tahoe-opening-water"><LakeCanvas active={active} paused={!active} pointer={pointer} /></div>}
    </motion.div>
    <div className="tahoe-opening-shade" aria-hidden="true" />
    <header className="tahoe-opening-topline"><span>MUMBAI → PHOENIX</span><Button variant="ghost" size="icon" disabled={Boolean(reduced)} onClick={() => setPaused(value => !value)} aria-label={paused ? "Play lake atmosphere" : "Pause lake atmosphere"} aria-pressed={paused}>{paused ? <Play size={15} /> : <Pause size={15} />}</Button></header>
    <motion.div className="tahoe-opening-copy" style={{ y: reduced ? 0 : copyY }}>
      <span>THE PERSON BEHIND THE WORK</span><h1>Tanmay<br /><em>Raut.</em></h1>
      <p>I look after business systems at Heckler Design.<br />Outside work: football, travel and following a good question.</p>
      <a href="#about-story">Keep exploring<ArrowDown size={16} /></a>
    </motion.div>
    <motion.div className="tahoe-opening-person" style={{ y: reduced ? 0 : portraitY, scale: reduced ? 1 : portraitScale }}><Image src="/images/about/tahoe/tanmay.webp" alt="Tanmay standing beside Lake Tahoe" fill sizes="(max-width:700px) 85vw, 55vw" priority /></motion.div>
    <div className="tahoe-opening-location"><span>LAKE TAHOE, CALIFORNIA</span><small>A moment away from the desk.</small></div>
    <div className="tahoe-opening-edge" aria-hidden="true" />
  </section>;
}
