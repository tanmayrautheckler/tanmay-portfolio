"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import content from "./content.json";

export const memories = [
  {image:content.spreads[0].right.image!,alt:content.spreads[0].right.alt!,label:'Somewhere along the way',note:'Road trips'},
  ...content.spreads[1].left.photos!, ...content.spreads[1].right.photos!,
];

function PageFooter({number}: {number:string}) {
  return <footer className="j-page-footer"><span>TANMAY RAUT / PERSONAL NOTES</span><span>{number}</span></footer>;
}

export default function ReaderPage({index,onMemory}: {index:number;onMemory:(index:number)=>void}) {
  const person=content.spreads[0].left;
  const roots=content.spreads[0].right;
  const day=content.spreads[1].left;
  const night=content.spreads[1].right;
  const football=content.spreads[2].left;
  const curious=content.spreads[2].right;
  if(index===0) return <article className="j-paper j-person">
    <span className="j-print-label">{person.kicker}</span><h2>{person.title}</h2><p>{person.body}</p>
    <div className="j-portrait"><div/><Image src={person.image!} width={1024} height={1536} alt={person.alt!}/><span>MUMBAI<br/><i aria-hidden="true">↓</i><br/>PHOENIX</span></div>
    <p className="j-signature">Tanmay.</p><PageFooter number={person.number}/>
  </article>;
  if(index===1) return <article className="j-paper j-roots">
    <span className="j-print-label">{roots.kicker}</span><h2>{roots.title}</h2><p>{roots.body}</p>
    <div className="j-airmail" aria-label="Mumbai to Phoenix"><div><strong>MUM</strong><span>Mumbai</span></div><span className="j-flight-line" aria-hidden="true">↝</span><div><strong>PHX</strong><span>Phoenix</span></div></div>
    <button className="j-road-print" onClick={()=>onMemory(0)} aria-label="Open road trip photograph"><Image src={roots.image!} width={900} height={550} alt={roots.alt!}/><span>Somewhere along the way.</span></button>
    <Link href={roots.link!.href} className="j-paper-link">{roots.link!.label}<ArrowUpRight size={16}/></Link><PageFooter number={roots.number}/>
  </article>;
  if(index===2||index===3) {
    const page=index===2?day:night;
    return <article className={`j-paper j-travel ${index===3?'j-night':'j-day'}`}>
      <span className="j-print-label">{page.kicker}</span><h2>{page.title}</h2>
      <div className="j-print-composition">{page.photos!.map((photo,i)=><button className={`j-memory-print j-memory-print-${i}`} key={photo.image} onClick={()=>onMemory((index===2?1:3)+i)} aria-label={`Open ${photo.note} photograph`}><Image src={photo.image} alt={photo.alt} width={900} height={photo.shape==='portrait'?1200:650}/><span>{photo.label}</span><em>{photo.note}</em></button>)}</div>
      <p className="j-travel-note">{page.body}</p><PageFooter number={page.number}/>
    </article>;
  }
  if(index===4) return <article className="j-paper j-matchday">
    <span className="j-print-label">{football.kicker}</span><h2>{football.title}</h2>
    <div className="j-match-art" aria-label="An illustrated blue and garnet number 10 Messi shirt on a football pitch">
      <div className="j-pitch" aria-hidden="true"><i/><b/><span/></div><div className="j-shirt" aria-hidden="true"><span>MESSI</span><strong>10</strong></div><span className="j-club-label">FC BARCELONA</span>
    </div><p>{football.body}</p><p className="j-margin-note">{football.aside}</p><PageFooter number={football.number}/>
  </article>;
  return <article className="j-paper j-curious"><span className="j-print-label">{curious.kicker}</span><h2>{curious.title}</h2><p>{curious.body}</p>
    <div className="j-question" aria-hidden="true"><span/>?</div>
    <div className="j-research"><span className="j-print-label">A PERSONAL RABBIT HOLE</span><h3>{curious.project!.title}</h3><p>{curious.project!.body}</p><Link href={curious.project!.href} className="j-paper-link">{curious.project!.label}<ArrowUpRight size={17}/></Link></div>
    <p className="j-margin-note">{curious.note}</p><PageFooter number={curious.number}/>
  </article>;
}
