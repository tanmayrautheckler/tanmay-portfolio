"use client";

import { useRef } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { ArrowDown, ArrowUpRight, MapPin } from "lucide-react";
import { AboutTahoeOpening } from "./about-tahoe-opening";
import { AboutPersonalAtlas } from "./about-personal-atlas";
import "./about-atlas-page.css";

const CareerJourney=dynamic(()=>import("@/components/career-journey").then(module=>module.CareerJourney),{ssr:false,loading:()=> <div className="atlas-globe-loading">Opening the interactive globe…</div>});
const chapters=[{id:"about-story",label:"The story"},{id:"about-journey",label:"The journey"},{id:"about-outside",label:"Outside work"},{id:"about-interests",label:"After hours"},{id:"about-learning",label:"Still learning"}];
const stops=[
 {place:"Manipal",org:"Manipal Institute of Technology",title:"Aeronautical engineering",text:"B.Tech Aeronautical Engineering · GPA 3.5. Mechanical minor and Supply Chain Management."},
 {place:"Mumbai",org:"Vats & Vessels",title:"Learning on the factory floor",text:"As a production supervisor, I worked with welders and machinists. It taught me to understand the work before changing the process."},
 {place:"Phoenix",org:"Arizona State University",title:"A different perspective",text:"MS Mechanical Engineering · GPA 3.8. SPC, Quality Control and Operations Management."},
 {place:"Phoenix",org:"United Foods",title:"Putting it into practice",text:"Back in manufacturing, working on processes and learning from the people around me."},
 {place:"Today",org:"Heckler Design",title:"Connecting the business",text:"I look after Odoo and business systems across eight departments. Manufacturing, purchasing, shipping and finance all meet here."},
];
const learning=["Lean Six Sigma Green Belt","SAP S/4HANA Essentials","Supply Chain Ops (Rutgers)","Tableau Visualization","Materials Selection (MIT)","Root Cause Analysis"];

export function AboutAtlasPage(){
 const globe=useRef<HTMLDivElement>(null);
 const nearGlobe=useInView(globe,{margin:"250px 0px"});
 const reduced=useReducedMotion();
 return <div className="about-atlas-page">
  <AboutTahoeOpening/>
  <nav className="atlas-page-nav" aria-label="Explore About">{chapters.map((chapter,index)=><a key={chapter.id} href={`#${chapter.id}`}><small>0{index+1}</small>{chapter.label}</a>)}</nav>
  <section id="about-story" className="atlas-introduction atlas-gutter" aria-labelledby="atlas-story-title">
   <span className="atlas-kicker">01 / A LITTLE CONTEXT</span>
   <div className="atlas-intro-layout"><h2 id="atlas-story-title">I started with<br/><em>how things are made.</em></h2><div><p>I started on a manufacturing floor. Now I work on the systems that connect the floor to the rest of the business.</p><p>At Heckler Design in Phoenix, that means Odoo, processes, integrations and cost accounting. I work with the people using those systems, figure out what needs to change, and see it through.</p><Link href="/experience">My working life<ArrowUpRight size={16}/></Link></div></div>
   <div className="atlas-practice"><span>THE THREAD THROUGH MY WORK</span><p>Manufacturing roots.<br/>A systems mindset.<br/><em>People at the centre.</em></p><Link href="/skills">The skills behind it<ArrowUpRight size={15}/></Link></div>
  </section>
  <section id="about-journey" className="atlas-journey" aria-labelledby="atlas-journey-title">
   <header className="atlas-section-heading atlas-gutter"><div><span className="atlas-kicker">02 / DIFFERENT PLACES, A WIDER VIEW</span><h2 id="atlas-journey-title">Mumbai to <em>Phoenix.</em></h2></div><p>The education, the work,<br/>and places along the way.</p></header>
   <div className="atlas-journey-layout atlas-gutter">
    <div className="atlas-globe-column"><div ref={globe} className="atlas-globe-frame">{nearGlobe?<CareerJourney/>:<div className="atlas-globe-loading"><MapPin size={22}/><span>Manipal · Mumbai · Phoenix</span><small>Interactive globe appears as you explore.</small></div>}</div><p className="atlas-globe-caption">Drag the globe, explore the markers, or play my story.</p></div>
    <ol className="atlas-life-stops">{stops.map((stop,index)=><motion.li key={stop.org} initial={reduced?false:{opacity:0,y:18}} whileInView={{opacity:1,y:0}} viewport={{once:true,amount:.35}} transition={{duration:.5}}><span className="atlas-stop-index">0{index+1}</span><div><span className="atlas-stop-place">{stop.place} / {stop.org}</span><h3>{stop.title}</h3><p>{stop.text}</p></div></motion.li>)}</ol>
   </div>
  </section>
  <AboutPersonalAtlas/>
  <section id="about-interests" className="atlas-interests atlas-gutter" aria-labelledby="atlas-interests-title">
   <header className="atlas-section-heading"><div><span className="atlas-kicker">04 / WHEN THE LAPTOP CLOSES</span><h2 id="atlas-interests-title">Some other <em>constants.</em></h2></div></header>
   <div className="atlas-afterhours-spread"><figure className="atlas-football"><div><Image src="/images/about/stadium-night.webp" alt="An imagined floodlit football stadium" fill sizes="(max-width:700px) 90vw, 650px"/><span>FC BARCELONA / LIONEL MESSI</span></div><figcaption><h3>Barça. Messi. Football.</h3><p>The team I follow. The player I keep coming back to.</p></figcaption></figure><div className="atlas-margin-notes"><article><span>01 / ANOTHER WAY TO LOOK</span><h3>I like a different perspective.</h3><p>I listen to different philosophies and ideas. Sometimes hearing how someone else sees something is enough to send me down a new rabbit hole.</p></article><article><span>02 / SOMETIMES I BUILD IT</span><h3>My own trading research platform.</h3><p>Markets started as an interest. I built tools to investigate them: scanners, eight research lenses and a morning briefing.</p><Link href="/projects/trading-research-desk">See what grew from that curiosity<ArrowUpRight size={15}/></Link></article></div></div>
  </section>
  <section id="about-learning" className="atlas-learning atlas-gutter" aria-labelledby="atlas-learning-title"><div><span className="atlas-kicker">05 / STILL LEARNING</span><h2 id="atlas-learning-title">More to <em>figure out.</em></h2><p>Engineering gave me a foundation. The work keeps adding to it.</p></div><ul>{learning.map((item,index)=><li key={item}><small>0{index+1}</small>{item}</li>)}</ul></section>
  <section className="atlas-contact atlas-gutter"><span className="atlas-kicker">PHOENIX, ARIZONA / OPEN TO A GOOD CONVERSATION</span><Link href="/contact">What are you<br/><em>working on?</em><ArrowUpRight/></Link><a href="#main-content" className="atlas-back-top">Back to the beginning<ArrowDown size={14}/></a></section>
 </div>;
}
