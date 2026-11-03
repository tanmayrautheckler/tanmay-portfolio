"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { animate, motion, useInView, useMotionValue, useMotionValueEvent, useReducedMotion, useTransform } from "framer-motion";
import { Pause, Play, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import styles from "./travel-film.module.css";

export function TravelFilm() {
  const stage = useRef<HTMLDivElement>(null);
  const visible = useInView(stage, { amount: 0.35 });
  const reducedMotion = useReducedMotion();
  const progress = useMotionValue(0);
  const [position, setPosition] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [replayCount, setReplayCount] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const [pageVisible, setPageVisible] = useState(true);
  const scale = useTransform(progress, [0, 1], [1.65, 1]);
  const titleY = useTransform(progress, [0, 0.55, 1], [30, 0, 0]);
  const titleOpacity = useTransform(progress, [0, 0.35, 0.6], [0, 0, 1]);
  useMotionValueEvent(progress, "change", value => setPosition(Math.round(value * 100)));

  useEffect(() => {
    const update = () => setPageVisible(!document.hidden);
    document.addEventListener("visibilitychange", update);
    return () => document.removeEventListener("visibilitychange", update);
  }, []);

  useEffect(() => {
    if (!loaded || !visible || !pageVisible || !playing || reducedMotion || progress.get() >= 1) return;
    const playback = animate(progress, 1, {
      duration: (1 - progress.get()) * 10,
      ease: "linear",
      onComplete: () => setPlaying(false),
    });
    return () => playback.stop();
  }, [loaded, visible, pageVisible, playing, reducedMotion, progress, replayCount]);

  function replay() {
    progress.stop();
    progress.set(0);
    setPlaying(true);
    setReplayCount(value => value + 1);
  }

  return <div className={styles.film} ref={stage}>
    <div className={styles.topline}><span>From my camera roll</span><span>Los Angeles, California</span></div>
    <div className={styles.frame}>
      <motion.div className={styles.camera} style={{ scale: reducedMotion ? 1 : scale }}>
        <Image src="/images/lifestyle/la-skyline.jpg" alt="Tanmay overlooking the Los Angeles skyline" fill sizes="(max-width:767px) 100vw, 980px" onLoad={() => setLoaded(true)} />
      </motion.div>
      <div className={styles.shade} aria-hidden="true" />
      <div className={styles.viewfinder} aria-hidden="true"><i/><i/><i/><i/></div>
      <motion.div className={styles.caption} style={{ y: reducedMotion ? 0 : titleY, opacity: reducedMotion ? 1 : titleOpacity }} aria-hidden="true">
        <span>A little further from the desk.</span>
        <strong>Another<br/><em>perspective.</em></strong>
      </motion.div>
      <span className={styles.frameNumber} aria-hidden="true">LA / 01</span>
    </div>
    {reducedMotion ? <p className={styles.stillNote}>Still view. Reduced motion is enabled.</p> : <div className={styles.controls}>
      <Button variant="ghost" onClick={position >= 100 ? replay : () => setPlaying(value => !value)} aria-label={position >= 100 ? "Replay photo animation" : playing ? "Pause photo animation" : "Play photo animation"}>
        {position >= 100 ? <RotateCcw size={17}/> : playing ? <Pause size={17}/> : <Play size={17}/>}
      </Button>
      <label><span className="sr-only">Photo animation position</span><input type="range" min="0" max="100" value={position} onChange={event => { progress.stop(); setPlaying(false); progress.set(Number(event.target.value) / 100); }} aria-valuetext={`${position}% through the photo animation`} /></label>
      <span className={styles.time}>{(position / 10).toFixed(1)} / 10s</span>
      <Button variant="ghost" onClick={replay} aria-label="Restart photo animation"><RotateCcw size={15}/></Button>
    </div>}
    <p className={styles.note}>{reducedMotion ? "A view from Los Angeles." : "A view from Los Angeles. Drag the timeline to explore the photo."}</p>
  </div>;
}
