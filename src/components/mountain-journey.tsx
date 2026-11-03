"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useMotionValue, useMotionValueEvent, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { ArrowDown, ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CHECKPOINTS, PATH_D, pathPointAt, progressToSeason, type Season } from "@/data/journey-checkpoints";
import "./mountain-journey.css";

const SEASONS: Season[] = ["spring", "summer", "autumn", "winter"];
const STAGE_TITLES = [
  "Learning how things work.",
  "From drawings to the shop floor.",
  "A move across the world.",
  "Where the systems story began.",
  "Learning from the production line.",
  "Connecting the whole business.",
];
const STAGE_LABELS = ["Manipal", "Vats & Vessels", "Arizona State", "VIVA Railings", "United Foods", "Heckler Design"];
const WORLD_WIDTH = 1920;
const WORLD_HEIGHT = 1080;
const clamp = (value: number, min = 0, max = 1) => Math.min(max, Math.max(min, value));

// The character and checkpoint data use piecewise Bézier time. Convert that
// same time to distance for the path reveal, so the line ends at the hiker.
const PATH_SAMPLES = Array.from({ length: 201 }, (_, i) => pathPointAt(i / 200));
const PATH_DISTANCES = [0];
for (let i = 1; i < PATH_SAMPLES.length; i++) {
  const a = PATH_SAMPLES[i - 1];
  const b = PATH_SAMPLES[i];
  PATH_DISTANCES.push(PATH_DISTANCES[i - 1] + Math.hypot(b.x - a.x, b.y - a.y));
}
function traveledDistance(progress: number) {
  const sample = clamp(progress) * 200;
  const index = Math.min(199, Math.floor(sample));
  return (PATH_DISTANCES[index] + (PATH_DISTANCES[index + 1] - PATH_DISTANCES[index]) * (sample - index)) / PATH_DISTANCES[200];
}

function seasonOpacity(season: Season, progress: number) {
  // Spring remains the opaque base. Upper layers crossfade in sequentially,
  // avoiding dark gaps between paintings.
  if (season === "spring") return 1;
  const start = { summer: 0.22, autumn: 0.5, winter: 0.76 }[season];
  return clamp((progress - start) / 0.13);
}

function calendarYear(progress: number) {
  const stops = [{ t: 0, year: 2016 }, ...CHECKPOINTS, { t: 1, year: 2026 }];
  const next = stops.findIndex((stop) => stop.t >= progress);
  if (next <= 0) return 2016;
  const a = stops[next - 1];
  const b = stops[next];
  return Math.round(a.year + (b.year - a.year) * ((progress - a.t) / (b.t - a.t)));
}

function SeasonalPainting({ season, progress }: { season: Season; progress: ReturnType<typeof useMotionValue<number>> }) {
  const opacity = useTransform(progress, (value) => seasonOpacity(season, value));
  return <motion.image href={`/images/journey/${season}.webp`} x="0" y="0" width={WORLD_WIDTH} height={WORLD_HEIGHT} preserveAspectRatio="none" style={{ opacity }} />;
}

export function MountainJourney() {
  const sectionRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const hikerScaleRef = useRef<SVGGElement>(null);
  const hikerFacingRef = useRef<SVGGElement>(null);
  const progress = useMotionValue(0);
  const aspect = useMotionValue(1.75);
  const [manual, setManual] = useState(false);
  const [stage, setStage] = useState(0);
  const [year, setYear] = useState(2016);
  const [season, setSeason] = useState<Season>("spring");
  const reducedMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start 64px", "end end"] });

  useEffect(() => {
    const media = window.matchMedia("(min-width: 480px) and (min-height: 760px) and (prefers-reduced-motion: no-preference), (min-width: 900px) and (min-height: 700px) and (prefers-reduced-motion: no-preference)");
    const update = () => setManual(!media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      if (height > 0) aspect.set(width / height);
    });
    observer.observe(canvas);
    return () => observer.disconnect();
  }, [aspect]);

  useMotionValueEvent(scrollYProgress, "change", (value) => {
    if (!manual) progress.set(clamp(value));
  });
  useMotionValueEvent(progress, "change", (value) => {
    // Native SVG transforms anchor scale/mirroring at the feet (0, 0).
    // CSS fill-box origins include the sprite sheet and can displace the figure.
    hikerScaleRef.current?.setAttribute("transform", `scale(${0.95 - value * 0.4})`);
    hikerFacingRef.current?.setAttribute("transform", `scale(${Math.cos(pathPointAt(value).angle) < 0 ? -1 : 1} 1)`);
    const index = Math.max(0, CHECKPOINTS.findLastIndex((checkpoint) => value >= checkpoint.t - 0.018));
    // React renders only when a milestone, year or season changes. Camera,
    // painting blend, path and sprite update without React renders.
    setStage((current) => current === index ? current : index);
    const nextYear = calendarYear(value);
    setYear((current) => current === nextYear ? current : nextYear);
    const nextSeason = progressToSeason(value);
    setSeason((current) => current === nextSeason ? current : nextSeason);
  });

  const camera = useTransform([progress, aspect], ([rawProgress, rawAspect]) => {
    const p = Number(rawProgress);
    const ratio = Number(rawAspect);
    const point = pathPointAt(p);
    const width = Math.min(WORLD_WIDTH, 1510 - p * 320);
    const height = Math.min(ratio < 1.2 ? 850 - p * 300 : WORLD_HEIGHT, width / ratio);
    const fittedWidth = height * ratio;
    // Keep the climber left of the milestone copy. On narrow scenes the
    // overlay becomes a separate row, so the climber sits near the center.
    const anchorX = ratio < 1.2 ? 0.48 : 0.38;
    const x = clamp(point.x - fittedWidth * anchorX, 0, WORLD_WIDTH - fittedWidth);
    const y = clamp(point.y - height * 0.62, 0, WORLD_HEIGHT - height);
    return `${x} ${y} ${fittedWidth} ${height}`;
  });
  const hikerX = useTransform(progress, (value) => pathPointAt(value).x);
  const hikerY = useTransform(progress, (value) => pathPointAt(value).y);
  const spriteViewBox = useTransform(progress, (value) => {
    const resting = CHECKPOINTS.some((checkpoint) => Math.abs(value - checkpoint.t) < 0.014);
    const frame = resting || reducedMotion ? 0 : Math.floor(traveledDistance(value) * 78) % 6;
    return `${frame * 236} 0 236 400`;
  });
  const revealedPath = useTransform(progress, traveledDistance);
  const progressScale = useTransform(progress, (value) => clamp(value));

  function goToStage(index: number) {
    const next = clamp(index, 0, CHECKPOINTS.length - 1);
    const targetProgress = next === CHECKPOINTS.length - 1 ? 0.985 : CHECKPOINTS[next].t + 0.005;
    if (manual || reducedMotion) {
      progress.set(targetProgress);
      return;
    }
    const section = sectionRef.current;
    if (!section) return;
    const start = section.getBoundingClientRect().top + window.scrollY - 64;
    const distance = section.offsetHeight - (window.innerHeight - 64);
    window.scrollTo({ top: start + targetProgress * distance, behavior: "smooth" });
  }

  const checkpoint = CHECKPOINTS[stage];

  return (
    <section id="my-journey" ref={sectionRef} aria-labelledby="mountain-title" className="mountain-journey">
      <div className="mountain-sticky">
        <div className="mountain-canvas">
          <div ref={canvasRef} className="mountain-viewport">
          <motion.svg className="mountain-world" viewBox={camera} preserveAspectRatio="xMidYMid slice" aria-hidden="true">
            {SEASONS.map((item) => <SeasonalPainting key={item} season={item} progress={progress} />)}
            <path d={PATH_D} fill="none" stroke="#fbf8eb" strokeOpacity="0.3" strokeWidth="3" strokeDasharray="4 9" strokeLinecap="round" />
            <motion.path d={PATH_D} fill="none" stroke="#fff9df" strokeWidth="4" strokeLinecap="round" style={{ pathLength: revealedPath }} />
            {CHECKPOINTS.map((item, index) => {
              const point = pathPointAt(item.t);
              return <g key={item.id} transform={`translate(${point.x} ${point.y})`}>
                <circle r={stage === index ? 11 : 6} fill={index <= stage ? "#fff9df" : "#172822"} fillOpacity={index <= stage ? 1 : 0.4} stroke="#fff9df" strokeWidth="2" />
                {stage === index && <circle r="20" fill="none" stroke="#fff9df" strokeWidth="1" strokeOpacity="0.45" />}
              </g>;
            })}
            <motion.g style={{ x: hikerX, y: hikerY }}>
              <g ref={hikerScaleRef} transform="scale(0.95)">
                <ellipse cx="0" cy="3" rx="22" ry="6" fill="#152b25" fillOpacity="0.35" />
                <g ref={hikerFacingRef}>
                  <motion.svg x="-35" y="-113" width="70" height="119" viewBox={spriteViewBox} overflow="hidden">
                    <image href="/images/journey/hiker-sprite.webp" x="0" y="0" width="1416" height="400" />
                  </motion.svg>
                </g>
              </g>
            </motion.g>
          </motion.svg>
          <div className="mountain-shade" aria-hidden="true" />
          <header className="mountain-heading">
            <p>2016 to now / My journey</p>
            <h2 id="mountain-title">Still <span className="serif-display">climbing.</span></h2>
            <span className="mountain-scroll-hint">{manual ? "Choose a stop along the way" : "Scroll to follow the trail"}{!manual && <ArrowDown size={13} />}</span>
          </header>
          <div className="mountain-clock" aria-label={`Year ${year}, ${season}`}><span>{season}</span><strong>{year}</strong></div>
          </div>
          <div className="mountain-milestone" aria-live={manual ? "polite" : "off"}>
            <AnimatePresence mode="wait" initial={false}>
              <motion.div key={checkpoint.id} initial={reducedMotion ? false : { opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: reducedMotion ? 0 : -8 }} transition={{ duration: reducedMotion ? 0 : 0.25 }}>
                <p className="mountain-stage-count">0{stage + 1} / 06 <span>{checkpoint.current ? "Current chapter" : checkpoint.year}</span></p>
                <h3>{STAGE_TITLES[stage]}</h3>
                <p className="mountain-org">{STAGE_LABELS[stage]}</p>
                <p className="mountain-role">{checkpoint.title}</p>
                <Link href="/experience">Full career story <ArrowRight size={15} /></Link>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
        <div className="mountain-controls">
          <nav aria-label="Career milestones" className="mountain-stages">
            {CHECKPOINTS.map((item, index) => <Button key={item.id} variant="ghost" aria-pressed={stage === index} onClick={() => goToStage(index)} className="mountain-stage"><span>{item.current ? "Now" : item.year}</span><span>{STAGE_LABELS[index]}</span></Button>)}
          </nav>
          <div className="mountain-step-controls"><Button variant="ghost" size="icon" aria-label="Previous career milestone" disabled={stage === 0} onClick={() => goToStage(stage - 1)}><ArrowLeft /></Button><Button variant="ghost" size="icon" aria-label="Next career milestone" disabled={stage === CHECKPOINTS.length - 1} onClick={() => goToStage(stage + 1)}><ArrowRight /></Button></div>
        </div>
        <div className="mountain-progress" aria-hidden="true"><motion.span style={{ scaleX: progressScale }} /></div>
      </div>
    </section>
  );
}
