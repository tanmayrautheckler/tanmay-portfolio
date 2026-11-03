"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useAnimationFrame, useMotionValue, useReducedMotion, useTransform, type MotionValue } from "framer-motion";
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUpRight, BookOpen, Pause, Play, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StoryJournal } from "./story-journal";
import { aboutPhotos } from "./photos";
import { captionOpacity, clampFilm, filmBeat, filmBeats, sceneOpacity } from "./film-timeline";
import "./about-film.css";

function Beat({index,progress,active,children,className=""}:{index:number;progress:MotionValue<number>;active:boolean;children:ReactNode;className?:string}) {
  const opacity=useTransform(progress,value=>sceneOpacity(value,index));
  return <motion.div className={`film-beat ${className}`} style={{opacity,pointerEvents:active?"auto":"none"}} aria-hidden={!active} inert={!active}>{children}</motion.div>;
}
function Caption({index,progress,className,children}:{index:number;progress:MotionValue<number>;className:string;children:ReactNode}) {
  const opacity=useTransform(progress,value=>captionOpacity(value,index));
  const y=useTransform(progress,value=>(index-value*4)*24);
  return <motion.div className={className} style={{opacity,y}}>{children}</motion.div>;
}
function Memory({index,progress,onOpen}:{index:number;progress:MotionValue<number>;onOpen:()=>void}) {
  const photo=aboutPhotos[index];
  const x=useTransform(progress,value=>(value*4-2)*(index%2?100:-120));
  const y=useTransform(progress,value=>(value*4-2)*(index%2?-170:140));
  const rotate=useTransform(progress,value=>[-9,7,-5,10,-8,6][index]+(value*4-2)*9);
  const scale=useTransform(progress,value=>1+Math.max(0,value*4-2)*.17);
  return <motion.button className={`film-memory film-memory-${index}`} style={{x,y,rotate,scale}} onClick={onOpen} aria-label={`Explore ${photo.label}`}><Image src={`/images/about/gallery/${photo.id}.webp`} alt={photo.label} fill sizes="(max-width:700px) 65vw, 40vw"/><span>{photo.label}</span></motion.button>;
}

export function AboutFilm() {
  const root=useRef<HTMLDivElement>(null);
  const target=useRef(0),report=useRef(0),touch=useRef<number|null>(null);
  const progress=useMotionValue(0),lookX=useMotionValue(0),lookY=useMotionValue(0);
  const reduced=useReducedMotion();
  const [playing,setPlaying]=useState(false),[position,setPosition]=useState(0);
  const [journal,setJournal]=useState(false),[chapter,setChapter]=useState(0);
  const beat=filmBeat(position);
  const portraitX=useTransform(progress,[0,.25],[0,180]);
  const portraitScale=useTransform(progress,[0,.25],[1,1.16]);
  const lakeScale=useTransform(progress,[0,.25],[1.03,1.25]);
  const routeLength=useTransform(progress,[.14,.36],[0,1]);
  const mapX=useTransform(progress,[.1,.4],[90,-70]);
  const mapRotate=useTransform(progress,[.1,.4],[-8,3]);
  const auroraScale=useTransform(progress,[.6,.9],[1.2,1.02]);
  const finalScale=useTransform(progress,[.8,1],[1.2,1]);
  function seek(value:number){target.current=clampFilm(value);setPlaying(false);if(reduced){progress.set(target.current);setPosition(target.current);}}
  function read(index:number){setPlaying(false);setChapter(index);setJournal(true);}
  useAnimationFrame((_,rawDelta)=>{
    if(journal||document.hidden)return;
    const delta=Math.min(rawDelta,50);
    if(playing){target.current=clampFilm(target.current+delta/60000);if(target.current===1)setPlaying(false);}
    const next=reduced?target.current:progress.get()+(target.current-progress.get())*(1-Math.exp(-delta/130));
    progress.set(next);
    report.current+=delta;
    if(report.current>=100){report.current=0;setPosition(next);}
  });
  useEffect(()=>{
    const element=root.current;if(!element)return;
    const wheel=(event:WheelEvent)=>{
      if(event.ctrlKey||event.metaKey||journal)return;
      event.preventDefault();target.current=clampFilm(target.current+Math.max(-180,Math.min(180,event.deltaY))*.00036);setPlaying(false);
    };
    element.addEventListener("wheel",wheel,{passive:false});
    return()=>element.removeEventListener("wheel",wheel);
  },[journal]);
  return <div ref={root} className="about-film" data-beat={filmBeats[beat].id} tabIndex={0} aria-label="About Tanmay. Scroll, swipe or use arrow keys to move through the photo film."
    onKeyDown={event=>{
      if(event.target!==event.currentTarget)return;
      if(["ArrowDown","ArrowRight","PageDown"].includes(event.key)){event.preventDefault();seek(target.current+.04);}
      if(["ArrowUp","ArrowLeft","PageUp"].includes(event.key)){event.preventDefault();seek(target.current-.04);}
      if(event.key==="Home"){event.preventDefault();seek(0);}
      if(event.key==="End"){event.preventDefault();seek(1);}
      if(event.key===" "){event.preventDefault();setPlaying(value=>!value);}
    }}
    onPointerMove={event=>{if(!reduced&&event.pointerType==="mouse"){lookX.set((event.clientX/window.innerWidth-.5)*24);lookY.set((event.clientY/window.innerHeight-.5)*16);}}}
    onTouchStart={event=>{if((event.target as HTMLElement).closest("button,a,input"))return;touch.current=event.touches[0].clientY;}}
    onTouchMove={event=>{if(touch.current===null||journal)return;const y=event.touches[0].clientY;seek(target.current+(touch.current-y)*.0012);touch.current=y;}}
    onTouchEnd={()=>{touch.current=null;}}>
    <div className="film-topline"><span>TANMAY RAUT <i/> A LIFE IN MOTION</span><Button variant="ghost" onClick={()=>read(filmBeats[beat].journal)}><BookOpen size={14}/><span>Read my story</span></Button></div>
    <div className="film-screen">
      <Beat index={0} progress={progress} active={beat===0} className="film-opening">
        <motion.div className="film-backdrop" style={{scale:reduced?1:lakeScale}}><Image src="/images/about/tahoe/landscape.webp" alt="Mountains and water at Lake Tahoe" fill sizes="100vw" priority/></motion.div>
        <div className="film-shade"/>
        <Caption index={0} progress={progress} className="film-opening-copy"><p>MUMBAI → PHOENIX</p><h1>Always<br/><em>curious.</em></h1><span>About the way things work.<br/>And everything beyond work.</span><Button variant="ghost" onClick={()=>{target.current=.25;setPlaying(!reduced);if(reduced)seek(.25);}}>Meet the person<ArrowRight size={18}/></Button></Caption>
        <motion.div className="film-person" style={{x:reduced?0:portraitX,scale:reduced?1:portraitScale}}><Image src="/images/about/tahoe/tanmay.webp" alt="Tanmay by Lake Tahoe" fill sizes="(max-width:700px) 85vw, 50vw" priority/></motion.div>
        <div className="film-location">LAKE TAHOE, CALIFORNIA <span>FROM MY CAMERA ROLL</span></div>
      </Beat>
      <Beat index={1} progress={progress} active={beat===1} className="film-route">
        <motion.div className="film-world-map" style={{x:reduced?0:mapX,rotate:reduced?0:mapRotate}}>
          <Image src="/textures/earth-night.png" alt="World map at night" fill sizes="100vw"/>
          <svg viewBox="0 0 1000 500" aria-label="Journey from Mumbai through Manipal to Phoenix"><motion.path d="M702 197 L708 212 C 820 10, 350 5, 189 157" fill="none" stroke="#f4ca94" strokeWidth="2.5" style={{pathLength:routeLength}}/>{[[702,197],[708,212],[189,157]].map(([x,y],index)=><g key={index}><circle cx={x} cy={y} r="9" fill="#e8b475" opacity=".18"/><circle cx={x} cy={y} r="3" fill="#ffe1ad"/></g>)}<text x="730" y="190">MUMBAI</text><text x="730" y="235">MANIPAL</text><text x="90" y="151">PHOENIX</text></svg>
        </motion.div>
        <Caption index={1} progress={progress} className="film-route-copy"><p>A CHANGE OF PERSPECTIVE</p><h2>Different places.<br/><em>A wider view.</em></h2><span>Aeronautical engineering at Manipal.<br/>Mechanical engineering at ASU.<br/>A lot of learning between them.</span><Button variant="ghost" onClick={()=>read(0)}>The story so far<ArrowUpRight size={17}/></Button></Caption>
        <span className="film-coordinate">19.08° N 72.88° E <i/> 33.45° N 112.07° W</span>
      </Beat>
      <Beat index={2} progress={progress} active={beat===2} className="film-outside">
        <motion.div className="film-memories" style={{x:reduced?0:lookX,y:reduced?0:lookY}}>{aboutPhotos.map((photo,index)=><Memory key={photo.id} index={index} progress={progress} onOpen={()=>read(1)}/>)}</motion.div>
        <Caption index={2} progress={progress} className="film-outside-copy"><p>THERE’S MORE THAN A JOB TITLE</p><h2>Take the<br/><em>long way.</em></h2><span>A tent. A road trip. A view worth stopping for.</span><Button variant="ghost" onClick={()=>read(1)}>Open the camera roll<ArrowUpRight size={17}/></Button></Caption>
      </Beat>
      <Beat index={3} progress={progress} active={beat===3} className="film-curious">
        <motion.div className="film-backdrop" style={{scale:reduced?1:auroraScale}}><Image src="/images/about/gallery/northern-lights.webp" alt="Tanmay beneath the northern lights" fill sizes="100vw"/></motion.div><div className="film-shade"/>
        <Caption index={3} progress={progress} className="film-curious-copy"><p>OFF THE CLOCK</p><h2>A good question<br/><em>takes you places.</em></h2><span>Soccer to reset. Philosophy to think.<br/>Markets to keep asking why.</span><div className="film-interests"><Button variant="ghost" onClick={()=>read(2)}>Soccer<ArrowUpRight size={14}/></Button><Button variant="ghost" onClick={()=>read(3)}>Philosophy<ArrowUpRight size={14}/></Button><Button variant="ghost" onClick={()=>read(4)}>Markets<ArrowUpRight size={14}/></Button></div></Caption>
      </Beat>
      <Beat index={4} progress={progress} active={beat===4} className="film-ending">
        <motion.div className="film-backdrop" style={{scale:reduced?1:finalScale}}><Image src="/images/about/gallery/la-skyline.webp" alt="Tanmay overlooking Los Angeles" fill sizes="100vw"/></motion.div><div className="film-shade"/>
        <Caption index={4} progress={progress} className="film-ending-copy"><p>PHOENIX, ARIZONA / THE NEXT CHAPTER</p><h2>Still making<br/><em>new connections.</em></h2><span>These days, I look after business systems at Heckler Design.<br/>The curiosity comes with me.</span><Link href="/contact">Let’s talk<ArrowUpRight size={19}/></Link><Button variant="ghost" onClick={()=>seek(0)}><RotateCcw size={14}/>Back to the beginning</Button></Caption>
      </Beat>
    </div>
    <div className="film-grain" aria-hidden="true"/>
    <div className="film-controls" data-film-controls>
      <div className="film-control-line"><Button variant="ghost" size="icon" aria-label={playing?"Pause film":"Play film"} aria-pressed={playing} onClick={()=>{if(target.current>.995){target.current=0;progress.set(0);}setPlaying(value=>!value);}}>{playing?<Pause size={17}/>:<Play size={17}/>}</Button><span>{String(beat+1).padStart(2,"0")}<i/>05</span><label className="film-scrubber"><span className="sr-only">Film position</span><input type="range" min="0" max="1000" value={Math.round(position*1000)} onChange={event=>seek(Number(event.target.value)/1000)} aria-label="Film position" aria-valuetext={filmBeats[beat].label}/></label><Button variant="ghost" size="icon" aria-label="Previous scene" onClick={()=>seek(Math.max(0,beat-1)/4)}><ArrowLeft size={16}/></Button><Button variant="ghost" size="icon" aria-label="Next scene" onClick={()=>seek(Math.min(4,beat+1)/4)}><ArrowRight size={16}/></Button></div>
      <div className="film-chapters">{filmBeats.map((item,index)=><button key={item.id} aria-current={beat===index?"step":undefined} onClick={()=>seek(index/4)}>{item.label}</button>)}</div>
      <p className="film-instruction"><ArrowDown size={11}/>{playing?"Playing · drag timeline to explore":"Scroll or swipe to explore · or press play"}</p>
    </div>
    <StoryJournal open={journal} onOpenChange={setJournal} chapter={chapter} onChapter={setChapter}/>
  </div>;
}
