"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowLeft, ArrowRight, ArrowUpRight, BookOpen, Moon, RotateCcw, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import "./journal-experiences.css";
import { LivingStadium } from "./living-stadium";

const stops=[
  {place:"Manipal",code:"MIT",caption:"Engineering begins",title:"B.Tech Aeronautical Engineering",text:"Manipal Institute of Technology",notes:"Mechanical minor · Supply Chain Management",stamp:"GPA 3.5"},
  {place:"Mumbai",code:"BOM",caption:"On the factory floor",title:"Learning how things get made",text:"Production Supervisor at Vats & Vessels",notes:"Working with welders and machinists. Understanding the process by being close to it.",stamp:"Manufacturing"},
  {place:"Arizona State",code:"ASU",caption:"A different perspective",title:"MS Mechanical Engineering",text:"Arizona State University, Phoenix",notes:"SPC · Quality Control · Operations Management",stamp:"GPA 3.8"},
  {place:"United Foods",code:"UFI",caption:"Putting learning to work",title:"Back to the production floor",text:"United Foods International",notes:"Part of the journey from engineering studies to working with manufacturing teams.",stamp:"Phoenix"},
  {place:"Heckler",code:"HD",caption:"The work today",title:"Connecting the whole business",text:"ERP and business systems at Heckler Design",notes:"Odoo, process design, integrations and cost accounting. Still connected to the people doing the work.",stamp:"Today"},
] as const;

export function OriginExperience(){
  const [selected,setSelected]=useState(0);
  const reduced=useReducedMotion();
  const stop=stops[selected];
  return <div className="origin-experience">
    <div className="origin-flight"><header><span>THE JOURNEY SO FAR</span><span>INDIA → ARIZONA</span></header><div className="origin-cities"><span>MUM<small>Where I’m from</small></span><svg viewBox="0 0 200 60" aria-hidden="true"><path d="M5 45Q100 -30 195 45"/><path d="m178 40 17 5-9-14"/></svg><span>PHX<small>Where I am now</small></span></div>
      <div className="origin-route"><svg viewBox="0 0 800 155" aria-hidden="true"><path d="M40 88Q130 15 220 88T400 88T580 88T760 88" className="route-ghost"/><motion.path d="M40 88Q130 15 220 88T400 88T580 88T760 88" initial={{pathLength:reduced?1:0}} animate={{pathLength:1}} transition={{duration:reduced?0:1.5}}/>{stops.map((_,index)=><circle key={index} cx={40+index*180} cy="88" r="4"/>)}<motion.circle className="route-marker" cy="88" r="10" animate={{cx:40+selected*180}} transition={{duration:reduced?0:.5,type:"tween"}}/></svg>
        <nav aria-label="Places in my journey">{stops.map((item,index)=><button key={item.code} aria-pressed={selected===index} onClick={()=>setSelected(index)}><span>{String(index+1).padStart(2,"0")}</span>{item.place}</button>)}</nav>
      </div>
    </div>
    <AnimatePresence mode="wait"><motion.div className="origin-ticket" key={selected} initial={{opacity:reduced?1:0,y:reduced?0:10}} animate={{opacity:1,y:0}} exit={{opacity:0}} transition={{duration:.18}}><div className="origin-ticket-code"><span>{stop.code}</span><small>{stop.caption}</small></div><div><p>{stop.text}</p><h3>{stop.title}</h3><span>{stop.notes}</span></div><b>{stop.stamp}</b></motion.div></AnimatePresence>
    <div className="origin-navigation"><span>Pick a stop. See what came with it.</span><div><Button variant="ghost" size="icon" aria-label="Previous journey stop" onClick={()=>setSelected((selected+4)%5)}><ArrowLeft size={16}/></Button><Button variant="ghost" size="icon" aria-label="Next journey stop" onClick={()=>setSelected((selected+1)%5)}><ArrowRight size={16}/></Button></div></div>
    <details className="origin-learning"><summary><BookOpen size={15}/>Learning along the way<span>Open notes +</span></summary><div>{["Lean Six Sigma Green Belt","SAP S/4HANA Essentials","Supply Chain Ops (Rutgers)","Tableau Visualization","Materials Selection (MIT)","Root Cause Analysis"].map(item=><span key={item}>{item}</span>)}</div></details>
  </div>;
}

const frequencies=[
  {label:"Match day",frequency:"01",line:"Barça. Messi. Match day.",detail:"The team I follow. The player I keep coming back to."},
  {label:"The long way",frequency:"02",line:"The drive is part of it.",detail:"Road trips, a new place and a reason to take the scenic route."},
  {label:"No signal",frequency:"03",line:"Some distance from the desk.",detail:"Tall trees, open skies and a quieter kind of weekend."},
] as const;

export function WeekendExperience(){
  const [station,setStation]=useState(0),[night,setNight]=useState(false);
  const reduced=useReducedMotion();
  return <div className="weekend-experience weekend-cinema">
    {station===0?<LivingStadium/>:<div className="weekend-screen" data-station={station}>
      <AnimatePresence mode="wait"><motion.div className="weekend-visual" key={`${station}-${night}`} initial={{opacity:reduced?1:0,scale:reduced?1:1.04}} animate={{opacity:1,scale:1}} exit={{opacity:0}} transition={{duration:.5}}>
        <Image src={`/images/about/gallery/${station===1?"bmw":night?"northern-lights":"camping"}.webp`} alt={station===1?"Tanmay on a road trip":night?"Tanmay beneath the northern lights":"Tanmay camping"} fill sizes="(max-width:700px) 90vw, 1000px"/>
      </motion.div></AnimatePresence>
      <span className="weekend-on-air"><i/>OFF DUTY / {frequencies[station].frequency}</span>
      {station===2&&<Button className="weekend-light" variant="ghost" aria-label={night?"Show daylight postcard":"Show after-dark postcard"} onClick={()=>setNight(value=>!value)}>{night?<Moon size={15}/>:<Sun size={15}/>} {night?"Under stars":"Under trees"}</Button>}
      <div className="weekend-caption"><h3>{frequencies[station].line}</h3><p>{frequencies[station].detail}</p></div>
    </div>}
    <nav className="weekend-cinema-nav" aria-label="Weekend worlds"><span>OUTSIDE WORK</span><div className="weekend-stations">{frequencies.map((item,index)=><Button key={item.label} variant="ghost" aria-pressed={station===index} onClick={()=>setStation(index)}><small>{item.frequency}</small>{item.label}<ArrowUpRight size={12}/></Button>)}</div></nav>
  </div>;
}

const questions=[
  {name:"First impression",question:"What am I assuming?",note:"The first reading is only one reading.",yaw:28},
  {name:"Another angle",question:"What changes from here?",note:"Same object. A different face becomes visible.",yaw:152},
  {name:"Step back",question:"What sits outside the frame?",note:"A little distance can change what seems important.",yaw:252},
] as const;
export function CuriosityExperience(){
  const [angle,setAngle]=useState(28),[view,setView]=useState(0);
  const radians=angle*Math.PI/180;
  const vertices=Array.from({length:8},(_,i)=>{
    const x=(i&1?1:-1)*80,y=(i&2?1:-1)*80,z=(i&4?1:-1)*80;
    const rx=x*Math.cos(radians)+z*Math.sin(radians),rz=-x*Math.sin(radians)+z*Math.cos(radians);
    const py=y*Math.cos(.38)-rz*Math.sin(.38),depth=y*Math.sin(.38)+rz*Math.cos(.38);
    const perspective=500/(500+depth);
    return {x:240+rx*perspective,y:195+py*perspective};
  });
  const faces=[[0,1,3,2],[4,5,7,6],[0,4,6,2]];
  const edges=[[0,1],[0,2],[0,4],[1,3],[1,5],[2,3],[2,6],[3,7],[4,5],[4,6],[5,7],[6,7]];
  return <div className="curiosity-experience"><div className="curiosity-study"><header><span>PERSPECTIVE STUDY / 001</span><Button variant="ghost" size="icon" aria-label="Reset perspective" onClick={()=>{setAngle(28);setView(0);}}><RotateCcw size={15}/></Button></header><svg viewBox="0 0 480 390" role="img" aria-label={`One cube viewed at ${angle} degrees`}><defs><pattern id="curiosity-grid" width="30" height="30" patternUnits="userSpaceOnUse"><path d="M30 0H0V30" fill="none" stroke="#3c66531c"/></pattern></defs><rect width="480" height="390" fill="url(#curiosity-grid)"/><ellipse cx="240" cy="326" rx="105" ry="13" fill="#314e3212"/><polygon points={faces[view].map(i=>`${vertices[i].x},${vertices[i].y}`).join(" ")} fill={["#658d7355","#d5b27e55","#8a9fb855"][view]} stroke="none"/>{edges.map(([a,b],index)=><line key={index} x1={vertices[a].x} y1={vertices[a].y} x2={vertices[b].x} y2={vertices[b].y} stroke="#244b3f" strokeWidth="2"/>)}{vertices.map((v,index)=><circle key={index} cx={v.x} cy={v.y} r="3" fill="#244b3f"/>)}</svg><label className="curiosity-rotate">Rotate the view<input type="range" min="0" max="360" value={angle} onChange={event=>setAngle(Number(event.target.value))} aria-label="Rotate perspective object"/><span>{angle}°</span></label></div>
    <div className="curiosity-notes"><span>AN IDEA TO TURN OVER</span><h3>{questions[view].question}</h3><p>{questions[view].note}</p><div className="curiosity-views">{questions.map((item,index)=><Button key={item.name} variant="ghost" aria-pressed={view===index} onClick={()=>{setView(index);setAngle(item.yaw);}}><span>0{index+1}</span>{item.name}<ArrowUpRight size={14}/></Button>)}</div><small>A small illustration of why I like philosophy and mental models: there’s usually another way to look.</small></div>
  </div>;
}

const researchLenses=[
  {name:"Technicals",file:"data_fetch.py",text:"Price structure, RSI, MACD and other technical context."},
  {name:"Momentum",file:"deepdive.py",text:"How a move is developing, rather than looking only for a cheap entry."},
  {name:"Fundamentals",file:"deepdive.py",text:"The business underneath the ticker and its longer-term context."},
  {name:"News",file:"deepdive.py",text:"Events and catalysts that could explain why something deserves attention."},
  {name:"News quality",file:"news_edge.py",text:"Source quality and a check for whether the move has already happened."},
  {name:"Community",file:"deepdive.py",text:"Community discussion as another input to investigate."},
  {name:"Insider activity",file:"deepdive.py",text:"Insider activity alongside the other research inputs."},
  {name:"Squeeze context",file:"squeeze_radar.py",text:"A separate lens on short-interest and event context."},
] as const;
export function AfterHoursExperience(){
  const [lens,setLens]=useState(0),[stage,setStage]=useState(1);
  return <div className="research-experience"><header><span><i/>TANMAY / AFTER-HOURS DESK</span><span>PERSONAL PROJECT</span></header><div className="research-workflow" aria-label="Research workflow">{["Find something","Ask better questions","Review the picture"].map((name,index)=><Button key={name} variant="ghost" aria-pressed={stage===index} onClick={()=>setStage(index)}><small>0{index+1}</small>{name}{index<2&&<ArrowRight size={13}/>}</Button>)}</div>
    <div className="research-desk">
      <div className="research-panel"><span>{stage===0?"THE SCAN":stage===1?"EIGHT LENSES":"THE MORNING REVIEW"}</span><h3>{["A place to start.","One ticker. More questions.","Bring it back together."][stage]}</h3><p>{["I built scanners to surface candidates, then follow them into a watchlist and deeper research.","The research engine brings eight different inputs together. Pick one to see what it adds.","A daily briefing connects scanner candidates, watchlists, alerts and risk checks. Health checks help surface stale or missing inputs."][stage]}</p>
        {stage===1?<div className="research-lenses">{researchLenses.map((item,index)=><Button key={item.name} variant="ghost" aria-pressed={lens===index} onClick={()=>setLens(index)}><small>{String(index+1).padStart(2,"0")}</small>{item.name}</Button>)}</div>:<div className="research-stack">{(stage===0?["Scanner candidates","Watchlist","Deeper research"]:["Research notes","Alerts & risk context","Saved briefing"]).map((item,index)=><div key={item}><span>0{index+1}</span>{item}<ArrowRight size={15}/></div>)}</div>}
      </div>
      <div className="research-scope"><svg viewBox="0 0 400 330" aria-hidden="true"><defs><pattern id="research-grid" width="25" height="25" patternUnits="userSpaceOnUse"><path d="M25 0H0V25" fill="none" stroke="#9ac6b416"/></pattern></defs><rect width="400" height="330" fill="url(#research-grid)"/><circle cx="200" cy="165" r="112" fill="none" stroke="#a8c7ae30"/><circle cx="200" cy="165" r="78" fill="none" stroke="#a8c7ae20"/>{researchLenses.map((_,index)=>{const x=200+Math.cos(index*Math.PI/4-Math.PI/2)*112,y=165+Math.sin(index*Math.PI/4-Math.PI/2)*112;return <g key={index}><line x1="200" y1="165" x2={x} y2={y} stroke={lens===index?"#e3bc87":"#81ad9a30"}/><circle cx={x} cy={y} r={lens===index?9:4} fill={lens===index?"#e3bc87":"#668d7c"}/></g>;})}<circle cx="200" cy="165" r="36" fill="#203d35" stroke="#bad0b866"/><text x="200" y="161" textAnchor="middle">{["SCAN","RESEARCH","BRIEFING"][stage]}</text><text x="200" y="177" textAnchor="middle">{["DISCOVER","8 LENSES","REVIEW"][stage]}</text></svg><div className="research-note"><span>{stage===1?researchLenses[lens].name:stage===0?"Follow a candidate":"Morning briefing"}</span><p>{stage===1?researchLenses[lens].text:stage===0?"Scanners narrow the search. A watchlist keeps the questions worth coming back to.":"Research, alerts and checks come together in one review."}</p></div></div>
    </div><footer><span>A look inside my personal research system.</span><Link href="/projects/trading-research-desk">Explore the build<ArrowUpRight size={15}/></Link></footer></div>;
}
