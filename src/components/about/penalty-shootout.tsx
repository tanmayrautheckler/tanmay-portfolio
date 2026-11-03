"use client";

import { useEffect, useId, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, RotateCcw, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { resolveShot, shotFeedback, type ShotOutcome } from "@/lib/penalty-game";
import styles from "./playroom.module.css";

type Phase = "ready" | "charging" | "flight" | "result";
export function PenaltyShootout() {
  const [phase, setPhase] = useState<Phase>("ready");
  const [aim, setAim] = useState(65);
  const [power, setPower] = useState(65);
  const [keeper, setKeeper] = useState(0);
  const [shots, setShots] = useState<ShotOutcome[]>([]);
  const [untimed, setUntimed] = useState(false);
  const reducedMotion = useReducedMotion();
  const practice = untimed || !!reducedMotion;
  const stage = useRef<HTMLDivElement>(null);
  const lock = useRef(false);
  const id = useId().replace(/:/g, "");
  const score = shots.filter(s => s === "goal").length;
  const complete = shots.length === 5 && phase === "result";
  const last = shots[shots.length - 1];

  useEffect(() => {
    if (phase !== "charging") return;
    let frame: number;
    const start = performance.now();
    function tick(now: number) {
      const t = (now - start) / 1000;
      setPower(Math.round((1 - Math.cos(t * 3.1)) * 50));
      setKeeper(Math.sin(t * 1.9 + shots.length * 1.7) * 83);
      frame = requestAnimationFrame(tick);
    }
    const pause = () => { if (document.hidden) setPhase("ready"); };
    const observer = new IntersectionObserver(([entry]) => { if (!entry.isIntersecting) setPhase("ready"); });
    if (stage.current) observer.observe(stage.current);
    document.addEventListener("visibilitychange", pause);
    frame = requestAnimationFrame(tick);
    return () => { cancelAnimationFrame(frame); observer.disconnect(); document.removeEventListener("visibilitychange", pause); };
  }, [phase, shots.length]);

  useEffect(() => {
    if (phase !== "flight") return;
    const timer = setTimeout(() => setPhase("result"), reducedMotion ? 40 : 850);
    return () => clearTimeout(timer);
  }, [phase, reducedMotion]);

  function shoot() {
    if (lock.current || shots.length >= 5 || phase === "flight" || phase === "result") return;
    if (!practice && phase === "ready") { setPhase("charging"); return; }
    lock.current = true;
    setShots(previous => [...previous, resolveShot(aim, keeper, power)]);
    setPhase("flight");
  }
  function next() { lock.current = false; setKeeper(0); setPower(65); setPhase("ready"); }
  function restart() { setShots([]); next(); }
  const flight = phase === "flight" || phase === "result";
  const ballX = flight ? 360 + aim * 2.45 : 360;
  const ballY = flight ? last === "over" ? 50 : last === "saved" ? 196 : 135 : 356;
  const feedback = phase === "result" ? `${shotFeedback(last, power)}${complete ? ` Finished: ${score} of 5.` : ""}` : phase === "charging" ? "Watch the keeper. Shoot when the marker reaches the green zone." : phase === "flight" ? "Shot away…" : practice ? "Choose your aim and power, then shoot. No timer." : "Choose your aim, then start your run-up.";

  return <div className={styles.game} ref={stage}>
    <div className={styles.gameTop}><div><span className={styles.eyebrow}>Weekend kickabout</span><h3>Five shots. Find the corner.</h3></div><div className={styles.score}><strong>{score}<span> / 5</span></strong><span>Goals</span></div></div>
    <div className={styles.pitch}>
      <div className={styles.shotDots} aria-label={`${shots.length} of 5 shots taken`}>{Array.from({length:5},(_,i)=><span key={i} data-result={shots[i] || "pending"} aria-label={`Shot ${i+1}: ${shots[i] || 'not taken'}`}>{shots[i] === "goal" ? "✓" : shots[i] ? "×" : String(i+1)}</span>)}</div>
      <svg viewBox="0 0 720 400" role="img" aria-label="Soccer goal with a moving goalkeeper and your aiming target">
        <defs><pattern id={`${id}-net`} width="20" height="18" patternUnits="userSpaceOnUse"><path d="M20 0H0V18" fill="none" stroke="#e3ead7" strokeOpacity=".2" /></pattern><linearGradient id={`${id}-pitch`} x2="0" y2="1"><stop stopColor="#183c33" /><stop offset="1" stopColor="#294b3c" /></linearGradient></defs>
        <path fill={`url(#${id}-pitch)`} d="M0 0h720v400H0z" />
        {[0,1,2,3].map(i=><path key={i} d={`M0 ${230+i*45}h720v23H0z`} fill="#b7cbb8" opacity=".035" />)}
        <path d="M0 230h720M185 230 95 400M535 230l90 170M275 350q85-45 170 0" stroke="#dce8cf" strokeOpacity=".25" fill="none" />
        <path d="m120 245 20-160h440l20 160z" fill="#071d19" fillOpacity=".25" stroke="#e3ead7" strokeOpacity=".4" />
        <path d="M140 85h440v160H140z" fill={`url(#${id}-net)`} stroke="#ecefe4" strokeWidth="5" />
        <path d="M140 245h440" stroke="#ecefe4" strokeWidth="2" />
        <motion.g animate={{ x:360+(flight && last === "saved" ? aim : keeper)*2.45, y:185 }} initial={false} transition={{duration:reducedMotion ? 0 : flight ? .45 : 0}} fill="none" strokeLinecap="round" strokeLinejoin="round">
          <ellipse cy="58" rx="25" ry="5" fill="#0a251e" opacity=".5" />
          <circle cy="-20" r="10" fill="#eee2c8" />
          <path d="M-12-5h24l7 35h-38z" fill="#dea772" />
          <path d="M-13 0-33 17-40 4M13 0l20 17 7-13" stroke="#dea772" strokeWidth="10" />
          <path d="M-9 32-18 55M9 32l18 23" stroke="#e5e6d8" strokeWidth="10" />
        </motion.g>
        {!flight && <g transform={`translate(${360+aim*2.45} 135)`} stroke="#d2e6ae" strokeWidth="1.5" fill="none"><circle r="14" /><path d="M-20 0h9M11 0h9M0-20v9M0 11v9" /></g>}
        <motion.g animate={{x:ballX,y:ballY,scale:flight ? .55 : 1,rotate:flight?300:0}} initial={false} transition={{duration:reducedMotion?0:.65,ease:[.2,.7,.3,1]}}>
          <circle r="13" fill="#f4f1df" stroke="#132e23" strokeWidth="1.5" /><path d="m0-6 6 4-2 7h-8l-2-7zM0-13v7M12-3 6-2M8 10 4 5M-8 10-4 5M-12-3-6-2" fill="#263d32" stroke="#263d32" strokeWidth="1.5" />
        </motion.g>
      </svg>
    </div>
    <div className={styles.gameControls}>
      <div className={styles.settings}>
        <label><span><Target size={14} />Aim <small>Left ↔ right</small></span><input aria-label="Shot aim" type="range" min="-85" max="85" value={aim} disabled={flight} onChange={e=>setAim(Number(e.target.value))} /></label>
        <div><span className={styles.controlLabel}>Power <small>{practice ? 'Choose your power' : 'Green zone: 55–80'}</small></span>{practice ? <input aria-label="Shot power" type="range" min="0" max="100" value={power} disabled={flight} onChange={e=>setPower(Number(e.target.value))} /> : <div className={styles.powerTrack} aria-hidden="true"><span className={styles.sweetSpot} /><span className={styles.powerMarker} style={{left:`${power}%`}} /></div>}</div>
      </div>
      <p className={styles.feedback} role="status" aria-live="polite">{feedback}</p>
      <div className={styles.gameActions}>
        {phase === "result" ? <Button className={styles.primary} onClick={complete?restart:next}>{complete?"Play again":"Next shot"}<ArrowRight size={16}/></Button> : <Button className={styles.primary} onClick={shoot} disabled={phase === "flight"}>{phase === "charging" || practice ? "Shoot" : "Start run-up"}<ArrowRight size={16}/></Button>}
        <Button variant="ghost" onClick={restart} aria-label="Restart shootout"><RotateCcw size={16}/></Button>
        <label className={styles.practice}><input type="checkbox" checked={practice} disabled={!!reducedMotion || phase!=="ready" || shots.length>0} onChange={e=>{setUntimed(e.target.checked);setKeeper(0);setPower(65);}} />Untimed practice</label>
      </div>
      <p className={styles.hint}>Aim with the slider. Press Enter or Space on the shoot button. In timed mode, wait for green and avoid the keeper.</p>
    </div>
  </div>;
}
