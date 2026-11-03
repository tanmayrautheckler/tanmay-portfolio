"use client";

import { Component, useRef, useState, type ReactNode } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import Image from "next/image";
import { motion, useMotionValue, useMotionValueEvent, useReducedMotion, useScroll } from "framer-motion";
import { ArrowDown, ArrowUpRight, ChevronLeft, ChevronRight, MousePointer2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import "./about-world-story.css";

const Scene=dynamic(()=>import('./about-world-scene'),{ssr:false,loading:()=> <div className="world-loading">Opening the landscape…</div>});
const beats=[
 {name:"The person",title:"Tanmay Raut.",text:"From Mumbai. Now in Phoenix, looking after business systems at Heckler Design."},
 {name:"The journey",title:"Learning by getting closer.",text:"Manipal. ASU. Manufacturing floors. Each stop brought me closer to how things work, and the people behind them."},
 {name:"Outside work",title:"Taking the long way.",text:"Road trips, camping, skydiving. A new place to explore, or Barça and Messi to follow."},
 {name:"Still curious",title:"Still asking why.",text:"Some questions follow me home. I listen to different philosophies and built a trading platform to explore markets."},
 {name:"What’s next",title:"There’s more to come.",text:"The work keeps changing. So do the questions. If you have something interesting in mind, let’s talk."},
];
class WorldBoundary extends Component<{children:ReactNode;onFailure:()=>void},{failed:boolean}>{state={failed:false};static getDerivedStateFromError(){return {failed:true};}componentDidCatch(){this.props.onFailure();}render(){return this.state.failed?<div className="world-fallback"><Image src="/images/about/tahoe/landscape.webp" alt="Mountains at Lake Tahoe" fill sizes="100vw"/><p>3D view unavailable on this device. Scroll to follow the story.</p></div>:this.props.children;}}
export function AboutWorldStory(){
 const root=useRef<HTMLDivElement>(null),pointer=useRef({x:0,y:0});
 const reduced=Boolean(useReducedMotion());
 const [beat,setBeat]=useState(0),[details,setDetails]=useState(false),[failed,setFailed]=useState(false);
 const renderedProgress=useMotionValue(0),beatRef=useRef(0);
 const {scrollYProgress}=useScroll({target:root,offset:["start start","end end"]});
 useMotionValueEvent(scrollYProgress,"change",value=>{if(failed)renderedProgress.set(value);});
 useMotionValueEvent(renderedProgress,"change",value=>{const next=Math.min(4,Math.max(0,Math.round(value*4)));if(next!==beatRef.current){beatRef.current=next;setBeat(next);setDetails(false);}});
 function travel(index:number){pointer.current={x:0,y:0};if(!root.current)return;const max=root.current.scrollHeight-window.innerHeight;window.scrollTo({top:root.current.getBoundingClientRect().top+window.scrollY+max*Math.min(4,Math.max(0,index))/4,behavior:reduced?"instant":"smooth"});setDetails(false);}
 return <div ref={root} className="about-world-story">
  <div className="world-viewport" onPointerMove={event=>{if(event.pointerType!=="mouse"||window.innerWidth<600||(event.target as HTMLElement).closest("button,a,aside"))return;const rect=event.currentTarget.getBoundingClientRect();pointer.current={x:(event.clientX-rect.left)/rect.width*2-1,y:(event.clientY-rect.top)/rect.height*2-1};}} onPointerLeave={()=>{pointer.current={x:0,y:0};}}>
   <div className="world-canvas"><WorldBoundary onFailure={()=>setFailed(true)}><Scene renderedProgress={renderedProgress} progress={scrollYProgress} pointer={pointer} reduced={reduced}/></WorldBoundary></div>
   <div className="world-shade"/>
   <header className="world-topline"><span>TANMAY RAUT / THROUGH MY WORLD</span><span>{String(beat+1).padStart(2,'0')} / 05</span></header>
   <motion.div className="world-story-copy" key={beat} initial={{opacity:0,y:reduced?0:14}} animate={{opacity:1,y:0}} exit={{opacity:0,y:reduced?0:-12}} transition={{duration:.3}}><span>{beats[beat].name}</span><h1>{beats[beat].title}</h1><p>{beats[beat].text}</p>
    {beat===0&&<Button variant="ghost" onClick={()=>travel(1)}>Follow the journey<ArrowDown size={16}/></Button>}
    {beat===1&&<Button variant="ghost" onClick={()=>setDetails(value=>!value)} aria-expanded={details}>Education & working life<ArrowUpRight size={15}/></Button>}
    {beat===2&&<span className="world-footnote">My photographs. My moments outside work.</span>}
    {beat===3&&<Link href="/projects/trading-research-desk">See what I built<ArrowUpRight size={15}/></Link>}
    {beat===4&&<Link href="/contact">Let’s talk<ArrowUpRight size={17}/></Link>}
   </motion.div>
   {details&&beat===1&&<aside className="world-life-notes"><Button variant="ghost" onClick={()=>setDetails(false)}>Close ×</Button><span>THE STOPS THAT SHAPED ME</span><dl><dt>Manipal Institute of Technology</dt><dd>B.Tech Aeronautical Engineering · GPA 3.5</dd><dt>Vats & Vessels / Mumbai</dt><dd>Production supervisor. Welders, machinists and manufacturing.</dd><dt>Arizona State University</dt><dd>MS Mechanical Engineering · GPA 3.8</dd><dt>United Foods / Phoenix</dt><dd>Manufacturing Engineer</dd><dt>Heckler Design / Today</dt><dd>Odoo and business systems across eight departments.</dd></dl><Link href="/experience">Explore my experience<ArrowUpRight size={13}/></Link></aside>}
   <div className="world-controls"><div className="world-route"><span>SCROLL TO TRAVEL</span><div className="world-track"><motion.i style={{scaleX:renderedProgress,transformOrigin:"left"}}/>{beats.map((item,index)=><button key={item.name} aria-label={`Travel to ${item.name}`} aria-current={beat===index?"step":undefined} onClick={()=>travel(index)} style={{left:`${index*25}%`}}><i/><span>{item.name}</span></button>)}</div><div className="world-arrows"><Button variant="ghost" size="icon" aria-label="Previous story moment" onClick={()=>travel(beat-1)} disabled={beat===0}><ChevronLeft size={18}/></Button><Button variant="ghost" size="icon" aria-label="Next story moment" onClick={()=>travel(beat+1)} disabled={beat===4}><ChevronRight size={18}/></Button></div></div><p><MousePointer2 size={12}/>{reduced?"Reduced motion view":"Move your pointer to look around"}<span>Scroll or swipe to move forward</span></p></div>
  </div>
 </div>;
}
