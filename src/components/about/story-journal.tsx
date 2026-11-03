"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { ArrowLeft, ArrowRight, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { hallwayRooms } from "./hallway-data";
import { aboutPhotos } from "./photos";
import { PerspectiveScene } from "./perspective-scene";
import { ResearchScene } from "./research-scene";
import { WeekendExperience } from "./journal-experiences";

const Journey = dynamic(() => import("@/components/career-journey").then(module => module.CareerJourney), { ssr:false, loading:()=> <p className="journal-loading">Opening the atlas…</p> });

export function StoryJournal({ open, onOpenChange, chapter, onChapter }: { open:boolean; onOpenChange:(open:boolean)=>void; chapter:number; onChapter:(chapter:number)=>void }) {
  const room=hallwayRooms[chapter];
  return <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className={`about-journal ${chapter>=2?"journal-cinema-shell":""}`} onCloseAutoFocus={event=>{event.preventDefault();document.querySelector<HTMLElement>('.about-film,[data-about-stage]')?.focus({preventScroll:true});}}>
      <header className="journal-header"><span>TANMAY RAUT / A LIFE IN MOTION</span><DialogClose asChild><Button variant="ghost" size="icon" aria-label="Close journal"><X size={19}/></Button></DialogClose></header>
      <nav className="journal-chapters" aria-label="Story chapters">{hallwayRooms.map((item,index)=><Button key={item.number} variant="ghost" aria-pressed={chapter===index} onClick={()=>onChapter(index)}><span>{item.number}</span>{item.name}</Button>)}</nav>
      <article className="journal-body" key={chapter}>
        <p className="journal-eyebrow">CHAPTER {room.number} / {room.name}</p>
        <DialogTitle>{room.title}</DialogTitle>
        <DialogDescription>{room.text}</DialogDescription>{chapter===1&&<p>{room.detail}</p>}
        {chapter===0&&<Journey/>}
        {chapter===1&&<>
          <div className="journal-photos">{aboutPhotos.map(photo=><figure key={photo.id}><Image src={`/images/about/gallery/${photo.id}.webp`} alt={photo.label} width={600} height={700} sizes="(max-width:600px) 80vw, 350px"/><figcaption>{photo.label}<small>{photo.caption}</small></figcaption></figure>)}</div>
          <h3 className="journal-subtitle">Places that stay with me</h3><Journey/>
        </>}
        {chapter===2&&<WeekendExperience/>}
        {chapter===3&&<PerspectiveScene/>}
        {chapter===4&&<ResearchScene/>}
      </article>
      <footer className="journal-footer"><Button variant="ghost" onClick={()=>onChapter((chapter+4)%5)}><ArrowLeft size={16}/>Previous</Button><span>{room.number} / 05</span><Button variant="ghost" onClick={()=>onChapter((chapter+1)%5)}>Next<ArrowRight size={16}/></Button></footer>
    </DialogContent>
  </Dialog>;
}
