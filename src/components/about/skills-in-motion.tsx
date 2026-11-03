"use client";

import { useEffect, useId, useRef, useState, type CSSProperties } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useInView, useReducedMotion } from "framer-motion";
import { ArrowRight, Pause, Play, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import styles from "./skills-in-motion.module.css";

const steps = [
  {
    name: "Process design", short: "Map it", title: "First, understand the handoffs.",
    description: "I work with the people doing the job, map the awkward parts and turn the process into rules a system can follow.",
    skills: ["Workflow mapping", "Business rules", "Exception handling"],
    proof: "Dealer ordering, production planning and purchasing in one shared platform.",
    href: "/projects/heckler-headless", project: "Heckler Headless", status: "Process mapped",
  },
  {
    name: "Odoo ERP", short: "Structure it", title: "Give the work a place to live.",
    description: "I connect sales, purchasing, inventory and accounting so the next team can work from the same operational records.",
    skills: ["Odoo", "Custom modules", "Financial validation"],
    proof: "Returns, timekeeping, tax and capacity workflows in Odoo 19.",
    href: "/projects/odoo-operations", project: "Odoo operations", status: "Records connected",
  },
  {
    name: "Manufacturing", short: "Make it", title: "Bring the plan back to the floor.",
    description: "Parts, routings and available capacity have to agree. My manufacturing background helps me ask what the plan needs to work in practice.",
    skills: ["BOMs & routings", "Capacity planning", "Quality control"],
    proof: "Manufacturing queues, component shortages and workload drawn from production records.",
    href: "/projects/odoo-operations", project: "Manufacturing operations", status: "Production planned",
  },
  {
    name: "Integrations", short: "Connect it", title: "Keep the other systems in step.",
    description: "Commerce, tax and shipping each hold a piece of the order. I work on the rules that keep those pieces consistent.",
    skills: ["Shopify", "ShipStation", "Stripe Tax"],
    proof: "Custom Stripe Tax work follows orders through invoices, exemptions, freight and refunds.",
    href: "/projects/odoo-operations", project: "Tax & operational integrations", status: "Systems in sync",
  },
  {
    name: "AI & automation", short: "Ask it", title: "Make the answer easier to reach.",
    description: "I connect AI tools to operational data, so questions about the work can lead back to the records behind the answer.",
    skills: ["MCP", "Python", "Odoo XML-RPC"],
    proof: "An MCP server connects Claude to Odoo for operational queries and analysis.",
    href: "/projects/ai-erp-connector", project: "AI-to-ERP connector", status: "Ready to investigate",
  },
];

const reveal = { initial: { opacity: 0, y: 13 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -9 } };
type ArtProps = { reduced: boolean; id: string };
function DraftingGrid({id}:{id:string}) {
  return <><defs><pattern id={id+"grid"} width="24" height="24" patternUnits="userSpaceOnUse"><path d="M24 0H0V24" fill="none" stroke="#29392e" strokeOpacity=".07" strokeWidth=".6"/></pattern><linearGradient id={id+"metal"} x1="0" y1="0" x2="1" y2="1"><stop stopColor="#83948b"/><stop offset=".5" stopColor="#334a42"/><stop offset="1" stopColor="#162e28"/></linearGradient><linearGradient id={id+"paper"} x2="0" y2="1"><stop stopColor="#fffcf0"/><stop offset="1" stopColor="#e4e4d5"/></linearGradient><filter id={id+"shadow"} x="-50%" y="-50%" width="200%" height="220%"><feDropShadow dx="0" dy="12" stdDeviation="10" floodColor="#243b2a" floodOpacity=".15"/></filter></defs><rect width="640" height="380" fill={"url(#"+id+"grid)"}/><path d="M24 36v-12h12M604 24h12v12M24 344v12h12M604 356h12v-12" fill="none" stroke="#85917c"/></>;
}
function FlowArt({reduced,id}:ArtProps){
  const rows=[{y:90,label:"SALES",task:"Dealer request",x:62},{y:180,label:"OPERATIONS",task:"Check stock & capacity",x:228},{y:270,label:"FINANCE",task:"Invoice & reconcile",x:350}];
  return <g><text x="30" y="53" className={styles.micro}>WORKFLOW / BEFORE THE BUILD</text>{rows.map((row,i)=><g key={row.label}><text x="28" y={row.y+39} className={styles.laneLabel}>{row.label}</text><path d={"M140 "+(row.y+34)+"H614"} stroke="#637b64" strokeOpacity=".15" strokeDasharray="3 5"/><motion.g initial={{opacity:reduced?1:0,x:reduced?0:-15}} animate={{opacity:1,x:0}} transition={{delay:reduced?0:i*.18}}><rect x={row.x+85} y={row.y} width={i===1?190:155} height="63" rx="3" fill={"url(#"+id+"paper)"} stroke="#9da58f"/><circle cx={row.x+103} cy={row.y+18} r="3" fill="#db5c35"/><text x={row.x+116} y={row.y+22} className={styles.tiny}>0{i+1}</text><text x={row.x+101} y={row.y+44} className={styles.artLabel}>{row.task}</text></motion.g></g>)}<motion.path d="M302 121H340V166H355M502 211H533V256" fill="none" stroke="#ce592e" strokeWidth="2" initial={{pathLength:reduced?1:0}} animate={{pathLength:1}} transition={{duration:1,delay:.3}}/><g transform="translate(40 335)"><circle r="3" fill="#d16135"/><text x="12" y="4" className={styles.tiny}>Every handoff needs a next step.</text></g></g>;
}
function ERPArt({reduced,id}:ArtProps){return <g filter={"url(#"+id+"shadow)"}><motion.g initial={{y:reduced?0:18,opacity:reduced?1:0}} animate={{y:0,opacity:1}}><rect x="66" y="44" width="508" height="288" rx="6" fill="#f6f4e9" stroke="#9ca590"/><path d="M72 44H568Q574 44 574 50V85H66V50Q66 44 72 44" fill="#293f35"/><circle cx="85" cy="65" r="3" fill="#e7d8ad"/><text x="99" y="69" fill="#eee9d7" fontSize="11" fontFamily="monospace">ODOO / SHARED RECORD</text><text x="94" y="120" className={styles.artHeading}>One order. Connected records.</text><text x="94" y="143" className={styles.tiny}>SALES ORDER / ILLUSTRATION 024</text><rect x="94" y="163" width="452" height="36" fill="#e5e7d9"/><text x="106" y="186" className={styles.tiny}>PRODUCT</text><text x="343" y="186" className={styles.tiny}>QTY</text><text x="419" y="186" className={styles.tiny}>NEXT STEP</text>{["Tablet stand","Mounting kit","Shipping"].map((label,i)=><motion.g key={label} initial={{opacity:reduced?1:0}} animate={{opacity:1}} transition={{delay:i*.17+.2}}><path d={"M94 "+(233+i*32)+"H546"} stroke="#bcc3b0" strokeWidth=".5"/><text x="106" y={220+i*32} className={styles.artLabel}>{label}</text><text x="349" y={220+i*32} className={styles.artLabel}>{i===2?"1":"12"}</text><text x="419" y={220+i*32} className={styles.tiny}>{["PLAN","RESERVE","PREPARE"][i]}</text></motion.g>)}<rect x="419" y="107" width="127" height="27" rx="13" fill="#dbe3cc"/><text x="435" y="125" className={styles.tiny}>CONFIRMED ✓</text></motion.g></g>;}
function ManufacturingArt({reduced,id}:ArtProps){return <g><text x="30" y="53" className={styles.micro}>ASSEMBLY / KNOW THE PARTS</text><ellipse cx="310" cy="315" rx="137" ry="15" fill="#4c6552" opacity=".07"/><motion.g initial={{y:reduced?0:35,opacity:reduced?1:0}} animate={{y:0,opacity:1}} transition={{duration:.8}}><path d="m203 293 124-31 119 28-124 36z" fill={"url(#"+id+"metal)"} stroke="#203d31"/><path d="m203 293 119 33v7l-119-33zm119 33 124-36v7l-124 36z" fill="#233a31"/></motion.g><motion.g initial={{y:reduced?0:45,opacity:reduced?1:0}} animate={{y:0,opacity:1}} transition={{duration:.8,delay:.1}}><path d="m294 159 34-8 18 114-35 9z" fill={"url(#"+id+"metal)"} stroke="#233a31"/><path d="m311 274 35-9 17 6-35 10z" fill="#30473b"/></motion.g><motion.g initial={{y:reduced?0:55,opacity:reduced?1:0}} animate={{y:0,opacity:1}} transition={{duration:.8,delay:.2}}><path d="m233 89 155-27 30 105-155 31z" fill={"url(#"+id+"metal)"} stroke="#20382e"/><path d="m242 96 139-24 25 87-138 27z" fill="#dce6d9"/><path d="m264 116 85-15m-80 30 103-19m-97 35 74-13m-69 29 103-20" stroke="#819c85" strokeWidth="3"/></motion.g><g fill="none" stroke="#85977c" strokeWidth=".8"><path d="M262 177H160V148H80M339 213H459V189H565M323 304H489V322H565"/><circle cx="262" cy="177" r="3" fill="#d45f33"/><circle cx="339" cy="213" r="3" fill="#d45f33"/><circle cx="323" cy="304" r="3" fill="#d45f33"/></g><text x="80" y="133" className={styles.tiny}>01 / COMPONENTS</text><text x="459" y="174" className={styles.tiny}>02 / ROUTING</text><text x="459" y="345" className={styles.tiny}>03 / CAPACITY</text><text x="30" y="352" className={styles.micro}>PARTS → PROCESS → PLAN</text></g>;}
function IntegrationArt({reduced}:ArtProps){return <g><text x="30" y="53" className={styles.micro}>INTEGRATIONS / SAME ORDER, DIFFERENT SYSTEMS</text><g stroke="#9da78f" strokeWidth="1" fill="none"><path d="M174 139H258V191H320M174 275H258V191M466 139H382V191H320M466 275H382V191"/></g>{[[174,139,"Shopify","COMMERCE"],[466,139,"Stripe Tax","TAX"],[174,275,"ShipStation","SHIPPING"],[466,275,"The books","ACCOUNTING"]].map(([x,y,label,sub],i)=><motion.g key={label} initial={{opacity:reduced?1:0,scale:reduced?1:.9}} animate={{opacity:1,scale:1}} transition={{delay:i*.12}} style={{transformOrigin:x+"px "+y+"px"}}><rect x={Number(x)-76} y={Number(y)-36} width="152" height="72" rx="3" fill="#f8f5e9" stroke="#9ca68d"/><text x={x} y={Number(y)-9} textAnchor="middle" className={styles.tiny}>{sub}</text><text x={x} y={Number(y)+14} textAnchor="middle" className={styles.artHeading}>{label}</text></motion.g>)}<circle cx="320" cy="191" r="34" fill="#294534"/><text x="320" y="195" textAnchor="middle" fill="#edead4" fontSize="12" fontFamily="monospace">ORDER</text>{!reduced && ["M174 139H258V191H286","M354 191H382V139H466","M174 275H258V191H286","M354 191H382V275H466"].map((path,i)=><circle key={path} r="4" fill="#d56135"><animateMotion path={path} dur="2.6s" begin={i*.3+"s"} repeatCount="indefinite"/></circle>)}<text x="320" y="344" textAnchor="middle" className={styles.tiny}>Invoices. Exemptions. Freight. Refunds.</text></g>;}
function AIArt({reduced,id}:ArtProps){return <g filter={"url(#"+id+"shadow)"}><rect x="66" y="44" width="508" height="288" rx="6" fill="#f5f4e9" stroke="#9ca590"/><rect x="66" y="44" width="508" height="40" rx="5" fill="#293f35"/><circle cx="87" cy="64" r="3" fill="#c4d99e"/><text x="101" y="69" fill="#eee9d7" fontSize="11" fontFamily="monospace">CLAUDE ↔ MCP ↔ ODOO</text><motion.g initial={{opacity:reduced?1:0,x:reduced?0:15}} animate={{opacity:1,x:0}}><rect x="175" y="108" width="365" height="42" rx="3" fill="#e4e6d7"/><text x="193" y="134" className={styles.artLabel}>Which parts are holding up this order?</text></motion.g><motion.g initial={{opacity:reduced?1:0,y:reduced?0:10}} animate={{opacity:1,y:0}} transition={{delay:.5}}><circle cx="101" cy="186" r="12" fill="#d9dfc9"/><path d="m96 186 4 4 7-8" fill="none" stroke="#3b5a3b"/><text x="125" y="183" className={styles.tiny}>SEARCH PRODUCTION & COMPONENTS</text><path d="M126 196H538" stroke="#b8c3a9"/><text x="96" y="226" className={styles.artLabel}>Start with the component shortages.</text><text x="96" y="248" className={styles.tiny}>Then check the affected production records.</text><rect x="96" y="273" width="187" height="28" rx="2" fill="#dfe6d2"/><text x="109" y="291" className={styles.tiny}>↗ FOLLOW THE SOURCE</text><text x="425" y="291" className={styles.micro}>ILLUSTRATION</text></motion.g></g>;}
const arts=[FlowArt,ERPArt,ManufacturingArt,IntegrationArt,AIArt];

export function SkillsInMotion(){
  const root=useRef<HTMLDivElement>(null);
  const inView=useInView(root,{amount:.25});
  const reduced=useReducedMotion();
  const id=useId().replace(/[^a-zA-Z0-9]/g,"");
  const [progress,setProgress]=useState(0);
  const [playing,setPlaying]=useState(false);
  const [pageVisible,setPageVisible]=useState(true);
  const active=Math.min(4,Math.floor(progress/20));
  const step=steps[active];
  const Art=arts[active];
  const finished=progress>=100;
  useEffect(()=>{const update=()=>setPageVisible(!document.hidden);document.addEventListener("visibilitychange",update);return()=>document.removeEventListener("visibilitychange",update);},[]);
  useEffect(()=>{
    if(!playing || finished || !inView || !pageVisible || reduced)return;
    let previous=performance.now();
    const timer=setInterval(()=>{const now=performance.now();const advance=Math.min(now-previous,200)/260;previous=now;setProgress(value=>Math.min(100,value+advance));},80);
    return()=>clearInterval(timer);
  },[playing,finished,inView,pageVisible,reduced]);
  const isPlaying=playing && progress<100;
  function select(index:number){setPlaying(false);setProgress(index*20+10);}
  function toggle(){if(progress>=100)setProgress(0);setPlaying(!isPlaying);}
  return <div className={styles.instrument} ref={root} data-playing={isPlaying && inView && pageVisible} style={{"--skill-progress":progress+"%"} as CSSProperties}>
    <div className={styles.instrumentTop}><span><i/> THE WORK, CONNECTED</span><span>ILLUSTRATED ORDER / 024</span></div>
    <div className={styles.transport}>
      <div className={styles.trackLabels} role="group" aria-label="Explore skills">{steps.map((item,index)=><Button key={item.name} variant="ghost" aria-pressed={active===index} className={styles.station} onClick={()=>select(index)}><span>{String(index+1).padStart(2,"0")}</span><strong>{item.short}</strong><small>{item.name}</small></Button>)}</div>
      <div className={styles.rail}><div className={styles.railFill}/><span className={styles.orderToken} aria-hidden="true"><svg viewBox="0 0 24 24"><path d="m12 2 9 5v10l-9 5-9-5V7zM3 7l9 5 9-5M12 12v10M7.5 4.5l9 5" fill="none" stroke="currentColor" strokeWidth="1.5"/></svg></span></div>
      <div className={styles.playback}><div>{!reduced && <Button size="sm" onClick={toggle} className={styles.playButton} aria-label={isPlaying?"Pause skills journey":"Play skills journey"}>{isPlaying?<Pause size={14}/>:<Play size={14}/>}<span>{isPlaying?"Pause":"Follow the order"}</span></Button>}<Button variant="ghost" size="icon" aria-label="Restart skills journey" onClick={()=>{setPlaying(false);setProgress(0);}}><RotateCcw size={15}/></Button></div><label className={styles.scrubber}><span>Drag to explore</span><input type="range" min="0" max="100" step="1" value={progress} aria-label="Order journey progress" aria-valuetext={step.name+", step "+(active+1)+" of 5"} onChange={e=>{setPlaying(false);setProgress(Number(e.target.value));}}/></label><Link href="/skills">All skills<ArrowRight size={14}/></Link></div>
    </div>
    <div className={styles.presentation}>
      <div className={styles.artboard}>
        <svg viewBox="0 0 640 380" role="img" aria-label={step.name+": "+step.status}><DraftingGrid id={id}/><AnimatePresence mode="wait" initial={false}><motion.g key={active} initial={{opacity:reduced?1:0}} animate={{opacity:1}} exit={{opacity:reduced?1:0}} transition={{duration:reduced?0:.2}}><Art reduced={!!reduced || !inView || !pageVisible} id={id}/></motion.g></AnimatePresence></svg>
        <div className={styles.artFoot}><span><i/> {step.status}</span><span>0{active+1} / 05</span></div>
      </div>
      <div className={styles.explanation}>
        <span className={styles.chapterNumber}>0{active+1}<span> / 05</span></span>
        <AnimatePresence mode="wait" initial={false}><motion.div key={active} {...(reduced?{}:reveal)} transition={{duration:.25}}>
          <p className={styles.discipline}>{step.name}</p><h3>{step.title}</h3><p className={styles.description}>{step.description}</p>
          <div className={styles.skillTags}>{step.skills.map(skill=><span key={skill}>{skill}</span>)}</div>
          <div className={styles.evidence}><span>IN MY WORK</span><p>{step.proof}</p><Link href={step.href}>{step.project}<ArrowRight size={15}/></Link></div>
        </motion.div></AnimatePresence>
      </div>
    </div>

  </div>;
}
