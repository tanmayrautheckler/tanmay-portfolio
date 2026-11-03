"use client";

import { useState, type CSSProperties } from "react";
import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowDownLeft, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import "./about-personal-atlas.css";

const album = [
  { id: "camping", label: "Camping", note: "Tall trees. A little distance from the desk.", shape: "1000 / 647", position: "50% 52%", tag: "A quieter weekend" },
  { id: "skydiving", label: "Skydiving", note: "A different view of things.", shape: "1000 / 563", position: "50% 50%", tag: "Outside the comfort zone" },
  { id: "northern-lights", label: "Northern lights", note: "One of those views that stays with you.", shape: "864 / 1184", position: "50% 48%", tag: "Worth looking up" },
  { id: "bmw", label: "Road trips", note: "Getting there is part of the fun.", shape: "1000 / 726", position: "50% 50%", tag: "The long way" },
  { id: "la-skyline", label: "Los Angeles", note: "Another place. Another perspective.", shape: "1000 / 756", position: "50% 38%", tag: "A change of scene" },
] as const;

export function AboutPersonalAtlas() {
  const [expanded, setExpanded] = useState<string | null>(null);
  const reduced = useReducedMotion();
  return <section className="personal-atlas" id="about-outside" aria-labelledby="personal-atlas-title">
    <header className="personal-atlas-heading"><div><span className="personal-atlas-kicker">AWAY FROM THE DESK</span><h2 id="personal-atlas-title">A little further <em>outside.</em></h2></div><p>A few moments from my camera roll.<br />The places are part of the story, too.</p></header>
    <div className="personal-atlas-spread">
      <div className="personal-atlas-margin" aria-hidden="true"><span>PERSONAL ARCHIVE</span><i /><span>01 — 05</span></div>
      {album.map((photo, index) => {
        const open = expanded === photo.id;
        return <motion.figure key={photo.id} layout={!reduced} transition={{ duration: reduced ? 0 : .45, ease: [.22, 1, .36, 1] }} className={`personal-atlas-frame personal-atlas-${photo.id}${open ? " is-expanded" : ""}`} style={{ "--photo-shape": photo.shape } as CSSProperties}>
          <div className="personal-atlas-photo">
            <Image src={`/images/about/gallery/${photo.id}.webp`} alt={photo.label === "Northern lights" ? "Tanmay looking up at the northern lights through a glass roof" : photo.label === "Camping" ? "Tanmay beside a tent among tall trees" : photo.label === "Skydiving" ? "Tanmay skydiving" : photo.label === "Road trips" ? "Tanmay beside a car during a road trip" : "Tanmay overlooking Los Angeles"} fill sizes={open ? "(max-width:700px) 90vw, 1120px" : "(max-width:700px) 90vw, 700px"} style={{ objectPosition: photo.position }} />
            <Button variant="ghost" size="icon" className="personal-atlas-expand" aria-label={`${open ? "Return" : "Enlarge"} ${photo.label} photo${open ? " to the album" : " within the album"}`} aria-expanded={open} onClick={() => setExpanded(open ? null : photo.id)}>{open ? <ArrowDownLeft size={17} /> : <ArrowUpRight size={17} />}</Button>
          </div>
          <figcaption><span className="personal-atlas-number">0{index + 1}</span><div><h3>{photo.label}</h3><p>{photo.note}</p></div><span className="personal-atlas-tag">{photo.tag}</span></figcaption>
          <AnimatePresence>{open && <motion.p className="personal-atlas-open-note" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>Full photograph <span>Use the corner arrow to return to the spread.</span></motion.p>}</AnimatePresence>
        </motion.figure>;
      })}
    </div>
    <footer className="personal-atlas-foot"><span>FROM MY CAMERA ROLL</span><span>There’s always somewhere else to explore.<ArrowUpRight size={13} aria-hidden="true" /></span></footer>
  </section>;
}
