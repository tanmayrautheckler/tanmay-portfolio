"use client";

import { useRef, useState, useEffect, useCallback, type CSSProperties } from "react";
import Image from "next/image";
import dynamic from "next/dynamic";
import { motion, useInView, useMotionValueEvent, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { ArrowDown, Box, Factory, Layers, Route, ArrowLeft, ArrowRight, Pause, Play, Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNatureSounds } from "@/hooks/use-nature-sounds";
import { aboutPhotos } from "./photos";
import styles from "./immersive-journey.module.css";

const LakeCanvas = dynamic(() => import("./spatial-scenes").then(mod => mod.LakeCanvas), { ssr: false });
const GalleryCanvas = dynamic(() => import("./spatial-scenes").then(mod => mod.GalleryCanvas), { ssr: false });

const chapters = ["The person", "The way I think", "Outside the lines"];
const systems = [
  { label: "The floor", icon: Factory, title: "It started with making things.", text: "Managing welders and machinists taught me to look at the actual work before changing the process.", detail: "Manufacturing · People · Process" },
  { label: "The connections", icon: Route, title: "One change touches everything.", text: "An order becomes a production plan, a purchase, a shipment and an entry in the books. I work on the connections between them.", detail: "Orders · Production · Shipping" },
  { label: "The system", icon: Layers, title: "Now I build around that reality.", text: "At Heckler Design, I look after Odoo and the business systems that help those teams work together.", detail: "Odoo · Integrations · Accounting" },
];

export function ImmersiveJourney() {
  const root = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  const inView = useInView(root, { amount: .02 });
  const [pageVisible, setPageVisible] = useState(true);
  const [paused, setPaused] = useState(false);
  const { playing, toggle } = useNatureSounds();
  const lakePointer = useRef({ x: .5, y: .3 });
  const drag = useRef(0);
  const dragStart = useRef<number | null>(null);
  useEffect(() => {
    const update = () => setPageVisible(!document.hidden);
    document.addEventListener("visibilitychange", update);
    return () => document.removeEventListener("visibilitychange", update);
  }, []);
  const [chapter, setChapter] = useState(0);
  const [system, setSystem] = useState(0);
  const [photo, setPhoto] = useState(0);
  const { scrollYProgress: progress } = useScroll({ target: root, offset: ["start start", "end end"] });
  // A CSS variable keeps scroll opacity separate from the parent route fade.
  const firstOpacity = useTransform(progress, [0, .23, .34], [1, 1, 0]);
  const firstScale = useTransform(progress, [0, .34], [1, 1.16]);
  const portraitY = useTransform(progress, [0, .34], [0, 120]);
  const titleY = useTransform(progress, [0, .34], [0, -150]);
  const secondOpacity = useTransform(progress, [.25, .35, .60, .71], [0, 1, 1, 0]);
  const secondY = useTransform(progress, [.25, .39, .67], [100, 0, -60]);
  const thirdOpacity = useTransform(progress, [.63, .74, 1], [0, 1, 1]);
  const thirdScale = useTransform(progress, [.63, .9], [.88, 1]);
  const rotate = useTransform(progress, [.28, .66], [-14, 12]);
  useMotionValueEvent(progress, "change", value => setChapter(value < .30 ? 0 : value < .67 ? 1 : 2));

  const jump = useCallback((index: number) => {
    if (!root.current) return;
    if (reduced) { document.getElementById(`about-scene-${index}`)?.scrollIntoView({ behavior: "instant", block: "start" }); return; }
    const start = root.current.getBoundingClientRect().top + window.scrollY;
    const distance = root.current.offsetHeight - window.innerHeight;
    window.scrollTo({ top: start + distance * [0, .46, .85][index], behavior: "smooth" });
  }, [reduced]);
  useEffect(() => {
    const showPhotos = () => jump(2);
    window.addEventListener("about:photos", showPhotos);
    const frame = window.location.hash === "#about-photos" ? requestAnimationFrame(showPhotos) : null;
    return () => { window.removeEventListener("about:photos", showPhotos); if(frame!==null)cancelAnimationFrame(frame); };
  }, [jump]);
  const selected = systems[system];
  const selectedPhoto = aboutPhotos[photo];
  return <section ref={root} className={styles.journey} data-reduced={!!reduced} aria-label="Meet Tanmay, a story in three scenes">
    <div className={styles.viewport}>
      <motion.article id="about-scene-0" className={`${styles.scene} ${styles.lake}`} onPointerMove={event=>{const bounds=event.currentTarget.getBoundingClientRect();lakePointer.current={x:(event.clientX-bounds.left)/bounds.width,y:1-(event.clientY-bounds.top)/bounds.height};}} style={{ "--scene-opacity": reduced ? 1 : firstOpacity, pointerEvents: reduced || chapter === 0 ? "auto" : "none" } as CSSProperties} inert={!reduced && chapter !== 0}>
        <motion.div className={styles.landscape} style={{ scale: reduced ? 1 : firstScale }}>
          <Image src="/images/about/tahoe/landscape.webp" alt="Illustrated mountains and water at Lake Tahoe" fill sizes="100vw" priority/>
          {!reduced && <div className={styles.lakeCanvas}><LakeCanvas pointer={lakePointer} active={inView && pageVisible && chapter === 0} paused={paused}/></div>} 
        </motion.div>
        <div className={styles.lakeShade}/>
        <motion.div className={styles.openingType} style={{ y: reduced ? 0 : titleY }}>
          <p className={styles.eyebrow}>Tanmay Raut / Mumbai to Phoenix</p>
          <h1>Always<br/><em>curious.</em></h1>
          <p className={styles.intro}>About the way things work.<br/>And everything beyond work.</p>
        </motion.div>
        {<motion.div className={styles.portrait} style={{ y: reduced ? 0 : portraitY }}><Image src="/images/about/tahoe/tanmay.webp" alt="Illustrated portrait of Tanmay" fill sizes="(max-width:700px) 70vw, 45vw" priority/></motion.div>}
        <div className={styles.sceneTop}><span>01 / THE PERSON</span><div className={styles.ambienceControls}>{!reduced && <Button variant="ghost" size="icon" aria-label={paused ? "Play lake animation" : "Pause lake animation"} onClick={()=>setPaused(!paused)}>{paused ? <Play size={14}/> : <Pause size={14}/>}</Button>}<Button variant="ghost" size="icon" onClick={toggle} aria-label={playing ? "Mute nature sounds" : "Play nature sounds"} aria-pressed={playing}>{playing ? <Volume2 size={14}/> : <VolumeX size={14}/>}</Button></div></div>
        <div className={styles.location}>LAKE TAHOE, CALIFORNIA <span>39.1° N / 120.0° W</span></div>
      </motion.article>

      <motion.article id="about-scene-1" className={`${styles.scene} ${styles.work}`} style={{ "--scene-opacity": reduced ? 1 : secondOpacity, pointerEvents: reduced || chapter === 1 ? "auto" : "none" } as CSSProperties} inert={!reduced && chapter !== 1}>
        <div className={styles.sceneTop}><span>02 / THE WAY I THINK</span><span>FOLLOW THE CONNECTIONS</span></div>
        <motion.div className={styles.workLayout} style={{ y: reduced ? 0 : secondY }}>
          <div className={styles.workText}><p className={styles.eyebrow}>From the shop floor to the system</p><h2>Nothing works<br/>{" "}<em>in isolation.</em></h2><div className={styles.systemTabs} aria-label="Explore how I work">{systems.map((item,index)=><Button key={item.label} variant="ghost" aria-pressed={system===index} onClick={()=>setSystem(index)}>{String(index+1).padStart(2,"0")} {item.label}</Button>)}</div><div className={styles.systemCopy} aria-live="polite"><h3>{selected.title}</h3><p>{selected.text}</p></div></div>
          <div className={styles.blueprint}>
            <span className={styles.diagramLabel}>A BUSINESS, CONNECTED</span>
            <motion.div className={styles.orbit} style={{ rotate: reduced ? 0 : rotate }}><i/><i/><i/></motion.div>
            <svg className={styles.connections} viewBox="0 0 500 420" aria-hidden="true"><path d="M250 210 L90 100 M250 210 L410 100 M250 210 L90 320 M250 210 L410 320"/>{!reduced && chapter === 1 && <circle r="4"><animateMotion dur="3s" repeatCount="indefinite" path="M90 100 L250 210 L410 320"/></circle>}{!reduced && chapter === 1 && <circle r="4"><animateMotion dur="4s" repeatCount="indefinite" path="M410 100 L250 210 L90 320"/></circle>}</svg>
            <div className={styles.core}><Box size={36} strokeWidth={1}/><span>{["PEOPLE", "PROCESS", "ODOO"][system]}</span></div>
            {["Orders", "Materials", "Production", "The books"].map((label,index)=><div key={label} className={`${styles.node} ${styles[`node${index}`]}`}><span>0{index+1}</span>{label}<i/></div>)}
            <p className={styles.diagramFoot}>{selected.detail}</p>
          </div>
        </motion.div>
      </motion.article>

      <motion.article id="about-scene-2" className={`${styles.scene} ${styles.travel}`} style={{ "--scene-opacity": reduced ? 1 : thirdOpacity, pointerEvents: reduced || chapter === 2 ? "auto" : "none" } as CSSProperties} inert={!reduced && chapter !== 2}>
        <div className={styles.sceneTop}><span>03 / OUTSIDE THE LINES</span><span>DRAG TO EXPLORE</span></div>
        <motion.div className={styles.travelLayout} style={{ scale: reduced ? 1 : thirdScale }}>
          <div className={styles.travelText}><p className={styles.eyebrow}>There is more to life than a job title</p><h2>Take the<br/>{" "}<em>long way.</em></h2><p>Soccer. New places. Markets. Books that make me rethink things.</p><p>I like leaving room for something I haven’t tried.</p><a href="#about-personal">Step inside <ArrowDown size={16}/></a></div>
          <div className={styles.galleryRoom} role="group" aria-label="Travel gallery. Drag sideways or use arrow keys to explore." tabIndex={0}
            onKeyDown={event=>{if(event.key === "ArrowRight" || event.key === "ArrowLeft"){event.preventDefault();setPhoto(index=>(index+(event.key==="ArrowRight"?1:5))%6);}}}
            onPointerDown={event=>{dragStart.current=event.clientX;event.currentTarget.setPointerCapture(event.pointerId);}}
            onPointerMove={event=>{if(dragStart.current!==null)drag.current=(event.clientX-dragStart.current)*.004;}}
            onPointerCancel={()=>{dragStart.current=null;drag.current=0;}}
            onPointerUp={event=>{if(dragStart.current!==null){const dx=event.clientX-dragStart.current;if(Math.abs(dx)>40)setPhoto(index=>(index+(dx<0?1:5))%6);}dragStart.current=null;drag.current=0;event.currentTarget.releasePointerCapture(event.pointerId);}}>
            <div className={styles.roomFloor}/>
            {reduced ? <div className={styles.galleryFallback}><Image src={`/images/about/gallery/${selectedPhoto.id}.webp`} alt={selectedPhoto.label} fill sizes="(max-width:700px) 90vw, 600px"/></div> : <GalleryCanvas selected={photo} onSelect={setPhoto} drag={drag} active={chapter===2 && inView && pageVisible} reduced={!!reduced} fallback={<div className={styles.galleryFallback}><Image src={`/images/about/gallery/${selectedPhoto.id}.webp`} alt={selectedPhoto.label} fill sizes="(max-width:700px) 90vw, 600px"/></div>}/>}
          </div>
          <div className={styles.galleryConsole}>
            <div className={styles.galleryCaption} aria-live="polite"><span>{String(photo+1).padStart(2,"0")} / 06</span><h3>{selectedPhoto.label}</h3><p>{selectedPhoto.caption}</p></div>
            <div className={styles.galleryNavigation}><Button variant="outline" size="icon" aria-label="Previous travel photo" onClick={()=>setPhoto(index=>(index+5)%6)}><ArrowLeft size={17}/></Button><span>Drag to explore</span><Button variant="outline" size="icon" aria-label="Next travel photo" onClick={()=>setPhoto(index=>(index+1)%6)}><ArrowRight size={17}/></Button></div>
            <div className={styles.photoChoices} aria-label="Choose a travel moment">{aboutPhotos.map((item,index)=><button key={item.id} aria-label={`Show ${item.label}`} aria-pressed={photo===index} onClick={()=>setPhoto(index)}><Image src={`/images/lifestyle/thumbs/${item.id}.jpg`} alt="" fill sizes="60px"/><span>{String(index+1).padStart(2,"0")}</span></button>)}</div>
          </div>
        </motion.div>
      </motion.article>

      {!reduced && <div className={styles.chapterBar}><div className={styles.chapters}>{chapters.map((label,index)=><Button key={label} variant="ghost" aria-current={chapter===index ? "step" : undefined} onClick={()=>jump(index)}><span>0{index+1}</span><span>{label}</span></Button>)}</div><a href="#about-details" className={styles.skip}>Skip intro <ArrowDown size={14}/></a><motion.div className={styles.progress} style={{scaleX:progress}}/></div>}
    </div>
    {!reduced && <div className={styles.scrollHint} aria-hidden="true">SCROLL TO EXPLORE <ArrowDown size={14}/></div>}
  </section>;
}
