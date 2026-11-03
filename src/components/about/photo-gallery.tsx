"use client";
import { useRef, useState } from "react";
import Image from "next/image";
import { ArrowLeft, ArrowRight, Expand, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { aboutPhotos } from "./photos";
import styles from "./about.module.css";

export function PhotoGallery() {
  const [selected, setSelected] = useState<number | null>(null);
  const opener = useRef<HTMLButtonElement | null>(null);
  const photo = aboutPhotos[selected ?? 0];
  function advance(direction: number) { setSelected(index => ((index ?? 0) + direction + aboutPhotos.length) % aboutPhotos.length); }
  return <>
    <div className={styles.galleryHeading}><span>Six moments away from the desk</span><span><Expand size={12}/>Open a photo</span></div>
    <div className={styles.photos}>{aboutPhotos.map((item,index)=><button key={item.id} className={styles.photo} aria-label={`Open ${item.label} photo`} aria-haspopup="dialog" onClick={event=>{opener.current=event.currentTarget;setSelected(index);}}><Image src={`/images/lifestyle/thumbs/${item.id}.jpg`} alt={item.label} fill sizes="(max-width:767px) 30vw, 150px"/><span>{item.label}</span></button>)}</div>
    <Dialog open={selected!==null} onOpenChange={open=>{if(!open)setSelected(null);}}>
      <DialogContent className={styles.photoDialog} onCloseAutoFocus={event=>{event.preventDefault();opener.current?.focus();}} onKeyDown={event=>{if(event.key==='ArrowRight'){event.preventDefault();advance(1);}if(event.key==='ArrowLeft'){event.preventDefault();advance(-1);}}}>
        <div className={styles.dialogTop}><span className={styles.kicker}>Away from the desk · {(selected ?? 0)+1} / 6</span><DialogClose asChild><Button variant="ghost" size="icon" aria-label="Close photo"><X size={18}/></Button></DialogClose></div>
        <div className={styles.largePhoto}><Image src={`/images/lifestyle/${photo.id}.jpg`} alt={photo.label} fill sizes="(max-width:767px) 90vw, 750px" className="object-contain"/></div>
        <div className={styles.photoCaption}><div aria-live="polite"><DialogTitle>{photo.title}</DialogTitle><DialogDescription>{photo.caption}</DialogDescription></div><div className="flex gap-2"><Button variant="outline" size="icon" aria-label="Previous photo" onClick={()=>advance(-1)}><ArrowLeft size={16}/></Button><Button variant="outline" size="icon" aria-label="Next photo" onClick={()=>advance(1)}><ArrowRight size={16}/></Button></div></div>
      </DialogContent>
    </Dialog>
  </>;
}
