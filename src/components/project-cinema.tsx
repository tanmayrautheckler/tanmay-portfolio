"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useMotionValueEvent, useReducedMotion, useScroll, useSpring } from "framer-motion";
import { ArrowDown, ArrowUpRight, Expand, Pause, Play, RotateCcw, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import "./project-cinema.css";

const DURATION = 14.8;
const scenes = [
  { name: "The handoff", time: .8, poster: "intro", screen: "01_form_view.png", title: "A return is more than a parcel.", text: "A defect becomes an inspection, a disposition and a conversation with a supplier. This is how I connected those steps in Odoo." },
  { name: "The decision", time: 4.5, poster: "record", screen: "01_form_view.png", title: "Give the next person context.", text: "The record keeps the item, defect, severity and disposition together. Replace, credit or return to vendor: the decision stays with the evidence." },
  { name: "The next step", time: 7.2, poster: "queue", screen: "03_kanban_view.png", title: "Make the handoff visible.", text: "The queue puts draft, sent, responded and confirmed returns in one view, so the team can see where each conversation stands." },
  { name: "The other side", time: 10, poster: "vendor", screen: "04_vendor_portal.png", title: "Bring the vendor into the loop.", text: "The portal gives the supplier a view of the defective items, a place for their RMA reference and a way to schedule the return." },
];
const sceneAt = (time: number) => time < 2.8 ? 0 : time < 5.7 ? 1 : time < 8.65 ? 2 : 3;

/** A small encoded film carries the expensive graphics; the page owns navigation. */
export function ProjectCinema() {
  const section = useRef<HTMLElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const stage = useRef<HTMLButtonElement>(null);
  const reduced = useReducedMotion();
  const [wide, setWide] = useState(false);
  const [near, setNear] = useState(false);
  const [requested, setRequested] = useState(false);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const [mode, setMode] = useState<"scroll" | "manual" | "playing">("scroll");
  const [time, setTime] = useState(.8);
  const [active, setActive] = useState(0);
  const [inspect, setInspect] = useState(false);
  const [pointer, setPointer] = useState(false);
  const desiredTime = useRef(.8);
  const frame = useRef(0);
  const modeRef = useRef(mode);
  const { scrollYProgress } = useScroll({ target: section, offset: ["start start", "end end"] });
  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const lensX = useSpring(pointerX, { stiffness: 230, damping: 27 });
  const lensY = useSpring(pointerY, { stiffness: 230, damping: 27 });
  const scrollEnabled = wide && !reduced;
  const loadVideo = requested || (near && scrollEnabled);
  const showPoster = !ready || failed || (!!reduced && mode !== "playing");

  useEffect(() => { modeRef.current = mode; }, [mode]);
  useEffect(() => {
    const query = window.matchMedia("(min-width: 1000px) and (min-height: 720px), (min-width: 720px) and (max-width: 999px) and (min-height: 760px)");
    const sync = () => setWide(query.matches);
    sync(); query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, []);
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) setNear(true);
      else { video.current?.pause(); setMode(current => current === "playing" ? "manual" : current); }
    }, { rootMargin: "250px 0px" });
    if (section.current) observer.observe(section.current);
    const hide = () => { if (document.hidden) { video.current?.pause(); setMode(current => current === "playing" ? "manual" : current); } };
    document.addEventListener("visibilitychange", hide);
    return () => { observer.disconnect(); document.removeEventListener("visibilitychange", hide); cancelAnimationFrame(frame.current); };
  }, []);
  useEffect(() => {
    if (reduced) video.current?.pause();
  }, [reduced]);

  const seek = useCallback((next: number) => {
    desiredTime.current = Math.max(0, Math.min(DURATION - .05, next));
    setTime(desiredTime.current);
    setActive(sceneAt(desiredTime.current));
    cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(() => {
      const el = video.current;
      if (el && el.readyState >= 1 && !el.seeking && Math.abs(el.currentTime - desiredTime.current) > .045) el.currentTime = desiredTime.current;
    });
  }, []);

  useMotionValueEvent(scrollYProgress, "change", value => {
    if (scrollEnabled && modeRef.current === "scroll") seek(.8 + value * (DURATION - .85));
  });

  const chooseScene = (index: number) => {
    video.current?.pause(); modeRef.current = "manual"; setMode("manual"); seek(scenes[index].time);
  };
  const play = async () => {
    const el = video.current;
    if (!el) return;
    if (mode === "playing") { el.pause(); setMode("manual"); return; }
    if (time >= DURATION - .5) { desiredTime.current = 0; setTime(0); }
    modeRef.current = "playing"; setRequested(true); setMode("playing");
    if (failed) { setFailed(false); el.load(); }
    // A cold mobile load applies the requested start in loadedmetadata before playing.
    if (el.readyState >= 2) {
      el.currentTime = desiredTime.current;
      try { await el.play(); } catch { setMode("manual"); }
    }
  };
  const resetScroll = () => {
    video.current?.pause(); modeRef.current = "scroll"; setMode("scroll"); seek(.8 + scrollYProgress.get() * (DURATION - .85));
  };

  return (
    <section ref={section} id="systems-in-motion" className="project-cinema" data-scroll={scrollEnabled} aria-labelledby="cinema-title">
      <div className="cinema-sticky">
        <header className="cinema-header">
          <div><p className="cinema-kicker"><span /> Inside the work / 001</p><h2 id="cinema-title">Built around <em>the handoff.</em></h2></div>
          <p className="cinema-intro">A closer look at my QC &amp; vendor returns work.<br /><span>{scrollEnabled ? "Scroll to move through the story." : "Choose a scene, or play the short film."}</span></p>
        </header>

        <div className="cinema-theatre">
          <div className="cinema-screen-wrap">
            <button ref={stage} type="button" className="cinema-screen" aria-label={`Inspect original project capture: ${scenes[active].name}`} onClick={() => { video.current?.pause(); if (mode === "playing") setMode("manual"); setInspect(true); }}
              onPointerEnter={event => { if (reduced || event.pointerType !== "mouse") return; const box = event.currentTarget.getBoundingClientRect(); const x = event.clientX - box.left; const y = event.clientY - box.top; pointerX.set(x); pointerY.set(y); lensX.jump(x); lensY.jump(y); setPointer(true); }}
              onPointerMove={event => { if (reduced || event.pointerType !== "mouse") return; const box = event.currentTarget.getBoundingClientRect(); pointerX.set(event.clientX - box.left); pointerY.set(event.clientY - box.top); setPointer(true); }} onPointerLeave={() => setPointer(false)}>
              <video ref={video} className="cinema-video" src={loadVideo ? "/videos/quality-story.mp4" : undefined} muted playsInline preload={loadVideo ? "auto" : "none"} aria-hidden="true" tabIndex={-1}
                onLoadedMetadata={() => { if (video.current) video.current.currentTime = desiredTime.current; }}
                onLoadedData={() => { setReady(true); if (modeRef.current === "playing") video.current?.play().catch(() => setMode("manual")); }} onEmptied={() => setReady(false)}
                onSeeked={() => { if (modeRef.current !== "playing" && Math.abs((video.current?.currentTime ?? 0) - desiredTime.current) > .08) seek(desiredTime.current); }}
                onTimeUpdate={() => { if (modeRef.current === "playing" && video.current) { const next = video.current.currentTime; desiredTime.current = next; setTime(next); setActive(sceneAt(next)); } }}
                onPause={() => setMode(current => current === "playing" ? "manual" : current)} onEnded={() => setMode("manual")} onError={() => { setFailed(true); setMode("manual"); }} />
              {showPoster && <Image src={`/videos/quality-story-${scenes[active].poster}.webp`} alt="" fill sizes="(min-width: 1000px) 78vw, 100vw" className="cinema-poster" />}
              {!reduced && pointer && <motion.span className="cinema-lens" style={{ x: lensX, y: lensY }} aria-hidden="true"><Expand size={20} /><span>Inspect</span></motion.span>}
              <span className="cinema-inspect-hint"><Expand size={14} /> Inspect original</span>
            </button>
            <div className="cinema-transport">
              <Button variant="ghost" className="cinema-play" onClick={play} aria-label={mode === "playing" ? "Pause project film" : "Play project film"}>{mode === "playing" ? <Pause size={16} /> : <Play size={16} />}<span>{mode === "playing" ? "Pause" : "Play film"}</span></Button>
              <label className="cinema-seek"><span className="sr-only">Project film position</span><input type="range" min="0" max={DURATION - .05} step=".05" value={time} aria-valuetext={`${time.toFixed(1)} of ${DURATION} seconds`} onChange={event => { video.current?.pause(); setMode("manual"); seek(Number(event.target.value)); }} style={{ "--played": `${time / DURATION * 100}%` } as React.CSSProperties} /></label>
              <span className="cinema-time">{time.toFixed(1).padStart(4, "0")} <span>/ 14.8</span></span>
              {scrollEnabled && <Button variant="ghost" className="cinema-follow" onClick={resetScroll} aria-label="Follow scrolling" aria-pressed={mode === "scroll"} title="Follow scrolling"><RotateCcw size={15} /><span>Scroll</span></Button>}
            </div>
          </div>

          <aside className="cinema-context">
            <div className="cinema-count" aria-hidden="true">0{active + 1}<span>/ 04</span></div>
            <nav className="cinema-chapters" aria-label="QC and RMA story scenes">{scenes.map((scene, i) => <Button key={scene.name} variant="ghost" className="cinema-chapter" aria-pressed={active === i} onClick={() => chooseScene(i)}><span>0{i + 1}</span>{scene.name}<span className="cinema-chapter-dot" /></Button>)}</nav>
            <div className="cinema-note"><h3>{scenes[active].title}</h3><p>{scenes[active].text}</p></div>
            <Link className="cinema-case" href="/projects/qc-vendor-rma">The full project <ArrowUpRight size={18} /></Link>
          </aside>
        </div>
        <footer className="cinema-footer"><span>Existing project captures · Edited interface study · Silent</span><span>{scrollEnabled && mode === "scroll" ? <><ArrowDown size={13} /> Your scroll is the playhead</> : "Four perspectives. One connected workflow."}</span></footer>
        {failed && <p className="cinema-error" role="status">Film unavailable. Scene previews and original project captures remain available.</p>}
      </div>

      <Dialog open={inspect} onOpenChange={setInspect}><DialogContent className="cinema-dialog" aria-describedby="cinema-inspect-description" onCloseAutoFocus={event => { event.preventDefault(); stage.current?.focus({ preventScroll: true }); }}>
        <header><div><DialogTitle>{scenes[active].name} / Original project capture</DialogTitle><DialogDescription id="cinema-inspect-description">Existing project interface with illustrative data. Scroll within the image to inspect details.</DialogDescription></div><DialogClose asChild><Button variant="ghost" aria-label="Close project capture"><X size={20} /></Button></DialogClose></header>
        <div className="cinema-original" tabIndex={0} role="region" aria-label="Original project capture, scroll to inspect" data-lenis-prevent><Image src={`/screenshots/${scenes[active].screen}`} width={1440} height={900} alt={`${scenes[active].title} Original QC and vendor RMA interface.`} /></div>
        <nav aria-label="Inspect another project capture">{scenes.slice(1).map((scene, i) => <Button key={scene.name} variant="ghost" aria-pressed={active === i + 1} onClick={() => chooseScene(i + 1)}>{scene.name}</Button>)}</nav>
      </DialogContent></Dialog>
    </section>
  );
}
