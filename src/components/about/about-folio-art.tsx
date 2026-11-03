"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, useMotionValue, useSpring, useTransform, type MotionValue } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import "./about-folio-art.css";

const photographs = [
  { id: "tahoe", label: "Lake Tahoe", caption: "A little further from the desk.", x: -68, y: -12, angle: -7, depth: 5, crop: "65% 50%" },
  { id: "camping", label: "Camping", caption: "Tall trees. A quieter weekend.", x: -108, y: 12, angle: -11, depth: 3, crop: "50% 55%" },
  { id: "skydiving", label: "Skydiving", caption: "Outside the comfort zone.", x: 108, y: 4, angle: 11, depth: 2, crop: "50% 50%" },
  { id: "bmw", label: "Road trips", caption: "Getting there is part of the fun.", x: 150, y: 57, angle: 15, depth: 1, crop: "50% 50%" },
  { id: "northern-lights", label: "Northern lights", caption: "One of those views that stays with you.", x: -9, y: -16, angle: -3, depth: 4, crop: "50% 40%" },
] as const;

function FolioPhotograph({ photo, index, progress, reduced }: { photo: typeof photographs[number]; index: number; progress: MotionValue<number>; reduced: boolean }) {
  const [selected, setSelected] = useState(false);
  const lead = photo.id === "tahoe";
  const x = useTransform(progress, [0, .12, .4, 1], ["calc(-50% + 0% * var(--folio-spread))", "calc(-50% + 0% * var(--folio-spread))", `calc(-50% + ${photo.x * .76}% * var(--folio-spread))`, `calc(-50% + ${photo.x}% * var(--folio-spread))`]);
  const y = useTransform(progress, [0, .12, .42, 1], [lead ? "-6%" : "115%", lead ? "-8%" : "100%", `${photo.y + 8}%`, `${photo.y}%`]);
  const rotate = useTransform(progress, [0, .15, .5, 1], [index % 2 ? 2 : -2, index % 2 ? 2 : -2, photo.angle * .75, photo.angle]);
  const opacity = useTransform(progress, [0, .05, .18], [lead ? 1 : 0, lead ? 1 : 0, 1]);
  return <motion.div className={`folio-photo-slot folio-photo-${photo.id}${selected ? " is-selected" : ""}`} style={{ x: reduced ? `calc(-50% + ${photo.x}% * var(--folio-spread))` : x, y: reduced ? `${photo.y}%` : y, rotate: reduced ? photo.angle : rotate, opacity: reduced ? 1 : opacity, zIndex: selected ? 12 : photo.depth }}>
    <Button asChild variant="ghost"><motion.button className="folio-photo" aria-label={`${photo.label}. ${photo.caption} ${selected ? "Hide" : "Show"} caption.`} aria-pressed={selected} onClick={() => setSelected(value => !value)} whileHover={reduced ? undefined : { y: -12, rotate: -photo.angle * .3 }} whileFocus={reduced ? undefined : { y: -12 }} transition={{ duration: .3, ease: [.22, 1, .36, 1] }}>
      <span className="folio-photo-image"><Image src={`/images/about/gallery/${photo.id}.webp`} alt={photo.label === "Lake Tahoe" ? "Tanmay by the water at Lake Tahoe" : photo.label === "Camping" ? "Tanmay camping among tall trees" : photo.label === "Skydiving" ? "Tanmay skydiving" : photo.label === "Road trips" ? "Tanmay beside a car on a road trip" : "Tanmay beneath the northern lights"} fill sizes="(max-width:600px) 45vw, 320px" style={{ objectPosition: photo.crop }} /><span className="folio-photo-caption">{photo.caption}<ArrowUpRight size={12} aria-hidden="true" /></span></span>
      <span className="folio-photo-label"><span>{photo.label}</span><small>0{index + 1}</small></span>
    </motion.button></Button>
  </motion.div>;
}

export function AboutFolioArt({ progress, reduced }: { progress: MotionValue<number>; reduced: boolean }) {
  const mouseX = useMotionValue(0), mouseY = useMotionValue(0);
  const driftX = useSpring(mouseX, { stiffness: 60, damping: 20 });
  const driftY = useSpring(mouseY, { stiffness: 60, damping: 20 });
  const lid = useTransform(progress, [0, .07, .3, 1], [0, 0, -153, -162]);
  const lidLayer = useTransform(progress, [0, .12, .3], [7, 5, 0]);
  const caseY = useTransform(progress, [0, .45, 1], [0, 12, 20]);
  const seal = useTransform(progress, [0, .14, .28], [1, .7, 0]);
  return <motion.div className="about-folio-art" style={{ x: driftX, y: driftY }} onPointerMove={event => { if (reduced || event.pointerType !== "mouse") return; const rect = event.currentTarget.getBoundingClientRect(); mouseX.set(((event.clientX-rect.left)/rect.width-.5)*22); mouseY.set(((event.clientY-rect.top)/rect.height-.5)*14); }} onPointerLeave={() => { mouseX.set(0); mouseY.set(0); }} aria-label="Photographs from my travels, opening from a personal travel folio">
    <div className="folio-ground-shadow" aria-hidden="true" />
    <motion.div className="folio-case-back" style={{ y: reduced ? 20 : caseY }} aria-hidden="true"><div className="folio-case-lining" /></motion.div>
    {photographs.map((photo, index) => <FolioPhotograph key={photo.id} photo={photo} index={index} progress={progress} reduced={reduced} />)}
    <motion.div className="folio-case-front" style={{ y: reduced ? 20 : caseY }} aria-hidden="true"><div className="folio-stitch" /><span className="folio-case-mark">TR</span><div className="folio-case-emboss"><span>A FEW PLACES.</span><span>A LITTLE OF ME.</span></div><span className="folio-case-corner">PERSONAL ARCHIVE</span></motion.div>
    <motion.div className="folio-case-lid" style={{ rotateX: reduced ? -162 : lid, y: reduced ? 20 : caseY, zIndex: reduced ? 0 : lidLayer }} aria-hidden="true"><div className="folio-lid-stitch" /><motion.span className="folio-clasp" style={{ opacity: reduced ? 0 : seal }} /></motion.div>
    <span className="folio-art-note">From my camera roll <i /> A few moments away from the desk.</span>
  </motion.div>;
}
