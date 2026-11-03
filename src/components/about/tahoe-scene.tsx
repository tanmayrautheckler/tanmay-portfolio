"use client";

import { useEffect, useId, useRef, useState, type PointerEvent } from "react";
import Image from "next/image";
import { motion, useInView, useReducedMotion, useSpring, useTransform } from "framer-motion";
import { Camera, Moon, Pause, Play, Sparkles, Sun, Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNatureSounds } from "@/hooks/use-nature-sounds";
import styles from "./tahoe-scene.module.css";

export function TahoeScene() {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { amount: 0.15 });
  const reducedMotion = useReducedMotion();
  const [paused, setPaused] = useState(false);
  const [original, setOriginal] = useState(false);
  const [night, setNight] = useState(false);
  const [pageVisible, setPageVisible] = useState(true);
  const { playing, toggle } = useNatureSounds();
  const filterId = `tahoe-water-${useId().replace(/:/g, "")}`;
  const running = inView && pageVisible && !paused && !original && !reducedMotion;
  const pointerX = useSpring(0, { stiffness: 80, damping: 25 });
  const pointerY = useSpring(0, { stiffness: 80, damping: 25 });
  const personX = useTransform(pointerX, value => value * 12);
  const personY = useTransform(pointerY, value => value * 4);
  const landscapeX = useTransform(pointerX, value => value * -5);
  const landscapeY = useTransform(pointerY, value => value * -2);

  useEffect(() => {
    const update = () => setPageVisible(!document.hidden);
    document.addEventListener("visibilitychange", update);
    return () => document.removeEventListener("visibilitychange", update);
  }, []);

  function move(event: PointerEvent<HTMLDivElement>) {
    if (!running || event.pointerType !== "mouse") return;
    const box = event.currentTarget.getBoundingClientRect();
    pointerX.set((event.clientX - box.left) / box.width * 2 - 1);
    pointerY.set((event.clientY - box.top) / box.height * 2 - 1);
  }

  return <figure ref={ref} className={styles.scene}>
    <div className={styles.stage} data-running={running} data-night={night && !original} onPointerMove={move} onPointerLeave={() => { pointerX.set(0); pointerY.set(0); }} role="img" aria-label={original ? "Original photo of Tanmay beside Lake Tahoe" : "Animated illustration of Tanmay at Lake Tahoe, with drifting clouds, moving water and mountains behind him"}>
      <div className={styles.illustration} hidden={original}>
        <motion.div className={styles.environment} style={{ x: reducedMotion || paused ? 0 : landscapeX, y: reducedMotion || paused ? 0 : landscapeY }}>
          <Image src="/images/about/tahoe/landscape.webp" alt="" fill sizes="(max-width:767px) 100vw, 980px" priority />
          <div className={styles.sky}><Image src="/images/about/tahoe/landscape.webp" alt="" fill sizes="(max-width:767px) 100vw, 980px" /></div>
          <svg className={styles.water} viewBox="0 0 1536 1024" preserveAspectRatio="none" aria-hidden="true">
            <defs><filter id={filterId} x="-3%" y="-3%" width="106%" height="106%" colorInterpolationFilters="sRGB">
              <feTurbulence type="fractalNoise" baseFrequency="0.009 0.06" numOctaves="1" seed="8" result="noise">
                {running && <animate attributeName="baseFrequency" values="0.009 0.06;0.012 0.08;0.009 0.06" dur="9s" repeatCount="indefinite" />}
              </feTurbulence><feDisplacementMap in="SourceGraphic" in2="noise" scale="10" xChannelSelector="R" yChannelSelector="G" />
            </filter></defs>
            <image href="/images/about/tahoe/landscape.webp" width="1536" height="1024" filter={`url(#${filterId})`} />
          </svg>
          <div className={styles.glints} aria-hidden="true">{Array.from({length:9},(_,index)=><i key={index} style={{left:`${9 + (index * 23) % 83}%`,top:`${56 + index * 2.8}%`,animationDelay:`${index * -.73}s`,width:`${18 + index * 4}px`}} />)}</div>
        </motion.div>
        <div className={styles.shadow} />
        <motion.div className={styles.personPosition} style={{ x: reducedMotion || paused ? 0 : personX, y: reducedMotion || paused ? 0 : personY }}>
          <div className={styles.person}><Image src="/images/about/tahoe/tanmay.webp" alt="" fill sizes="(max-width:767px) 50vw, 440px" priority /></div>
        </motion.div>
        <div className={styles.nightShade} />
        <div className={styles.stars} aria-hidden="true">{Array.from({length:14},(_,i)=><i key={i} style={{left:`${5 + (i * 31) % 91}%`,top:`${4 + (i * 13) % 32}%`,animationDelay:`${i * -.42}s`}} />)}</div>
        <div className={styles.location}><span>LAKE TAHOE</span><span>Away from the desk.</span></div>
      </div>
      {original && <Image src="/images/lifestyle/tahoe.jpg" alt="" fill className={styles.original} sizes="(max-width:767px) 100vw, 980px" />}
    </div>
    <figcaption className={styles.caption}>
      <span>{original ? "The photo behind the scene" : "A moment from my travels, illustrated."}</span>
      <div className={styles.controls}>
        <Button variant="ghost" onClick={() => setOriginal(value => !value)} aria-pressed={original}>{original ? <Sparkles size={14}/> : <Camera size={14}/>}<span>{original ? "Back to scene" : "Original photo"}</span></Button>
        {!original && <>
          <Button variant="ghost" onClick={() => setNight(value => !value)} aria-label={night ? "Show Tahoe in daylight" : "Show Tahoe at night"}>{night ? <Sun size={14}/> : <Moon size={14}/>}<span>{night ? "Daylight" : "Nightfall"}</span></Button>
          <Button variant="ghost" onClick={() => setPaused(value => !value)} disabled={!!reducedMotion} aria-label={paused ? "Play Tahoe animation" : "Pause Tahoe animation"}>{paused ? <Play size={14}/> : <Pause size={14}/>}</Button>
        </>}
        <Button variant="ghost" onClick={toggle} aria-label={playing ? "Mute nature sounds" : "Play nature sounds"} aria-pressed={playing}>{playing ? <Volume2 size={14}/> : <VolumeX size={14}/>}</Button>
      </div>
    </figcaption>
  </figure>;
}
