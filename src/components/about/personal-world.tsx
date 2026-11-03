"use client";

import { Component, useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { useInView, useReducedMotion } from "framer-motion";
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, BookOpen, DoorOpen, Footprints, RotateCcw, X, Compass, Goal, Search, Send, Sparkles, Flashlight, Volume2, VolumeX, Expand, MousePointer2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { hallwayRooms, nearestDoor } from "./hallway-data";
import type { WalkInput, WalkSnapshot } from "./hallway-stage";
import styles from "./personal-world.module.css";
import { WorldAudio } from "./world-audio";
import { StoryJournal } from "./story-journal";

const HallwayStage=dynamic(()=>import("./hallway-stage"),{ssr:false,loading:()=> <div className={styles.loading}>Opening the building…</div>});
const initialSnapshot:WalkSnapshot={x:0,z:2.8,yaw:0,room:null,door:null};
class WorldBoundary extends Component<{children:ReactNode},{failed:boolean}>{
  state={failed:false};
  static getDerivedStateFromError(){return {failed:true};}
  render(){return this.state.failed?<div className={styles.loading}>3D is unavailable here. Choose “Read the rooms” to explore every story.</div>:this.props.children;}
}

export function PersonalWorld({fullPage=false}:{fullPage?:boolean}){
  const root=useRef<HTMLDivElement>(null);
  const stage=useRef<HTMLDivElement>(null);
  const nearby=useRef(initialSnapshot);
  const input=useRef<WalkInput>({keys:new Set(),turn:0,pitch:0});
  const pointer=useRef<{x:number;y:number;distance:number}|null>(null);
  const dragging=useRef(false);
  const inView=useInView(root,{margin:"100px"});
  const reduced=useReducedMotion();
  const [entered,setEntered]=useState(false);
  const [ready,setReady]=useState(false);
  const [doors,setDoors]=useState([false,false,false,false,false]);
  const [actions,setActions]=useState([0,0,0,0,0]);
  const [visited,setVisited]=useState<number[]>([]);
  const [snapshot,setSnapshot]=useState(initialSnapshot);
  const [reset,setReset]=useState(0);
  const [reading,setReading]=useState(false);
  const [journalChapter,setJournalChapter]=useState(0);
  const [storyVisible,setStoryVisible]=useState(true);
  const [notice,setNotice]=useState("");
  const [flashlight,setFlashlight]=useState(true);
  const [sound,setSound]=useState(false);
  const [mouseLocked,setMouseLocked]=useState(false);
  const audio=useRef<WorldAudio|null>(null);
  const onStep=useCallback((inRoom:boolean)=>{if(sound)audio.current?.play("step",inRoom);},[sound]);
  const playDoor=useCallback(()=>{if(sound)audio.current?.play("door");},[sound]);
  const collected=actions.filter(value=>value>0).length;
  const rooftop=snapshot.z < -33.3;
  const onReady=useCallback(()=>setReady(true),[]);
  const update=useCallback((next:WalkSnapshot)=>{
    const previous=nearby.current.room;
    nearby.current=next;setSnapshot(next);
    if(next.room!==null){
      const room=next.room;
      setVisited(v=>v.includes(room)?v:[...v,room]);
      if(previous!==room)setStoryVisible(false);
    }
  },[setStoryVisible]);
  const openDoor=useCallback((index:number)=>{
    if(!entered || dragging.current)return;
    if(nearestDoor(nearby.current)!==index){setNotice("Walk closer to the door.");return;}
    playDoor();
    setDoors(previous=>{
      // Leave doors open when the visitor is already inside their room.
      if(nearby.current.room===index)return previous;
      return previous.map((value,i)=>i===index?!value:value);
    });
    setNotice("");
  },[entered,playDoor]);
  const objectAction=useCallback((index:number)=>{
    if(dragging.current || nearby.current.room!==index)return;
    const target=hallwayRooms[index];
    if(Math.hypot(nearby.current.x-target.side*7.8,nearby.current.z-(target.z-.7))>2.4){setNotice("Look for the glowing keepsake, then move closer.");return;}
    setStoryVisible(true);
    if(sound)audio.current?.play("found");
    setActions(previous=>previous.map((value,i)=>i===index?value+1:value));
  },[setStoryVisible,sound]);
  useEffect(()=>()=>audio.current?.dispose(),[]);
  useEffect(()=>{
    const change=()=>{setMouseLocked(document.pointerLockElement===stage.current);input.current.keys.clear();};
    const look=(event:MouseEvent)=>{if(document.pointerLockElement!==stage.current)return;input.current.turn-=event.movementX*.002;input.current.pitch-=event.movementY*.002;};
    document.addEventListener("pointerlockchange",change);
    document.addEventListener("mousemove",look);
    return()=>{document.removeEventListener("pointerlockchange",change);document.removeEventListener("mousemove",look);};
  },[]);
  function toggleSound(){
    if(!sound){try{audio.current??=new WorldAudio();audio.current.enable();}catch{setNotice("Audio unavailable in this browser.");return;}}
    setSound(value=>!value);
  }
  useEffect(()=>{
    const release=()=>{input.current.keys.clear();pointer.current=null;dragging.current=false;};
    window.addEventListener("blur",release);
    document.addEventListener("visibilitychange",release);
    return()=>{release();window.removeEventListener("blur",release);document.removeEventListener("visibilitychange",release);};
  },[]);
  useEffect(()=>{
    if(!notice)return;
    const timer=setTimeout(()=>setNotice(""),2400);
    return()=>clearTimeout(timer);
  },[notice]);
  function enter(){
    input.current.keys.clear();input.current.turn=0;input.current.pitch=0;
    setReset(value=>value+1);setEntered(true);setReading(false);
    requestAnimationFrame(()=>{
      stage.current?.scrollIntoView({behavior:reduced?"instant":"smooth",block:"start"});
      stage.current?.focus({preventScroll:true});
    });
  }
  function openJournal(index:number){
    input.current.keys.clear();
    if(document.pointerLockElement===stage.current)document.exitPointerLock();
    if(document.fullscreenElement===stage.current)void document.exitFullscreen().catch(()=>{});
    setJournalChapter(index);setReading(true);
  }
  function leave(){input.current.keys.clear();setEntered(false);if(document.pointerLockElement===stage.current)document.exitPointerLock();if(document.fullscreenElement===stage.current)void document.exitFullscreen().catch(()=>{});stage.current?.focus({preventScroll:true});}
  function interactNearby(){const {room,door}=nearby.current;if(room!==null)objectAction(room);else if(door!==null)openDoor(door);}
  const room=snapshot.room===null?null:hallwayRooms[snapshot.room];
  const door=snapshot.door===null?null:hallwayRooms[snapshot.door];
  const nearObject=room!==null && Math.hypot(snapshot.x-room.side*7.8,snapshot.z-(room.z-.7))<=2.4;
  function hold(code:string){input.current.keys.add(code);stage.current?.focus({preventScroll:true});}
  function release(code:string){input.current.keys.delete(code);}
  const movementCodes=["KeyW","KeyA","KeyS","KeyD","ArrowUp","ArrowDown","ArrowLeft","ArrowRight","ShiftLeft","ShiftRight","KeyC"];
  return <div ref={root} className={styles.world} data-full-page={fullPage}>
    <div className={styles.stage} ref={stage} data-about-stage tabIndex={0} role="group" aria-label="Explore Tanmay’s building. W A S D to walk, drag to look, E to open a nearby door, Escape to pause." data-entered={entered} data-player-x={snapshot.x.toFixed(2)} data-player-z={snapshot.z.toFixed(2)} data-player-yaw={snapshot.yaw.toFixed(2)} data-room={snapshot.room ?? "hallway"}
      onKeyDown={event=>{
        if(event.key==="Escape"){leave();return;}
        if(!entered || reading || (event.target!==event.currentTarget && event.target instanceof HTMLButtonElement))return;
        if(movementCodes.includes(event.code)){event.preventDefault();input.current.keys.add(event.code);}
        if(event.code==="KeyF"&&!event.repeat){event.preventDefault();setFlashlight(value=>!value);}
        if(event.code==="KeyE"&&!event.repeat){event.preventDefault();interactNearby();}
      }}
      onKeyUp={event=>{input.current.keys.delete(event.code);}}
      onBlur={event=>{if(!event.currentTarget.contains(event.relatedTarget as Node))input.current.keys.clear();}}>
      <div className={styles.canvasLayer}
        onPointerDown={event=>{if(!entered)return;stage.current?.focus({preventScroll:true});if(mouseLocked)return;pointer.current={x:event.clientX,y:event.clientY,distance:0};dragging.current=false;}}
        onPointerMove={event=>{
          if(!entered || !pointer.current)return;
          const dx=event.clientX-pointer.current.x,dy=event.clientY-pointer.current.y;
          input.current.turn-=dx*.004;input.current.pitch-=dy*.003;
          pointer.current={x:event.clientX,y:event.clientY,distance:pointer.current.distance+Math.abs(dx)+Math.abs(dy)};
          dragging.current=pointer.current.distance>6;
          if(dragging.current&&!event.currentTarget.hasPointerCapture(event.pointerId))event.currentTarget.setPointerCapture(event.pointerId);
        }}
        onPointerUp={event=>{pointer.current=null;requestAnimationFrame(()=>{dragging.current=false;});if(event.currentTarget.hasPointerCapture(event.pointerId))event.currentTarget.releasePointerCapture(event.pointerId);}}
        onPointerCancel={()=>{pointer.current=null;dragging.current=false;}}
      >
        {(inView||entered) && <WorldBoundary><HallwayStage entered={entered&&!reading} active={(inView||entered)&&!reading} reduced={!!reduced} doors={doors} actions={actions} input={input} reset={reset} onUpdate={update} onDoor={openDoor} onObject={objectAction} onReady={onReady} flashlight={flashlight} onStep={onStep}/></WorldBoundary>}
      </div>
      {fullPage&&<div className="about-prologue" data-hidden={entered} aria-hidden="true"><Image src="/images/about/tahoe/landscape.webp" alt="" fill sizes="100vw" priority/><div className="about-prologue-shade"/><div className="about-prologue-person"><Image src="/images/about/tahoe/tanmay.webp" alt="" fill sizes="(max-width:700px) 85vw, 45vw" priority/></div><span className="about-opening-location">LAKE TAHOE / A MOMENT AWAY FROM THE DESK</span></div>}
      <div className={styles.vignette}/>
      <div className={styles.topline}><span>THE LONG WAY HOME <i/> TANMAY RAUT</span><div><span>{collected} / 5 discoveries</span>{entered&&<Button variant="ghost" size="icon" onClick={leave} aria-label="Pause exploration"><X size={17}/></Button>}</div></div>
      {!entered?<div className={styles.invitation}>
        <p>{fullPage?"TANMAY RAUT / MUMBAI TO PHOENIX":"AN EXPLORABLE PORTRAIT / CHAPTER 01"}</p>{fullPage?<h1>A life<br/><em>in motion.</em></h1>:<h3>The long<br/><em>way home.</em></h3>}<span>{fullPage?<>Engineer by training. Curious by nature.<br/>Come in. There’s more to the story.</>:<>Some things you learn by looking around.<br/>Five rooms. Your own pace.</>}</span>
        <Button onClick={enter} disabled={!ready}><Footprints size={16}/>{ready?"Enter my world":"Opening the building…"}</Button>
        <small>WASD walk · Shift sprint · C crouch · E interact</small>
        {fullPage&&<Button variant="ghost" className="about-read-instead" onClick={()=>openJournal(0)}><BookOpen size={15}/>Read my story</Button>}
      </div>:<>
        <span className={styles.crosshair} aria-hidden="true"/>
        <div className={styles.tools}>
          {fullPage&&<Button variant="outline" size="icon" aria-label="Open story journal" onClick={()=>openJournal(snapshot.room??0)}><BookOpen size={17}/></Button>}
          <Button variant="outline" size="icon" aria-label="Toggle flashlight" aria-pressed={flashlight} onClick={()=>setFlashlight(value=>!value)}><Flashlight size={17}/></Button>
          <Button variant="outline" size="icon" aria-label={sound?"Mute game sound":"Enable game sound"} aria-pressed={sound} onClick={toggleSound}>{sound?<Volume2 size={17}/>:<VolumeX size={17}/>}</Button>
          <Button variant="outline" size="icon" aria-label="Capture mouse for free look" aria-pressed={mouseLocked} onClick={()=>{stage.current?.focus();if(mouseLocked)document.exitPointerLock();else void stage.current?.requestPointerLock()?.catch(()=>setNotice("Mouse capture unavailable. Drag to look instead."));}}><MousePointer2 size={17}/></Button>
          <Button variant="outline" size="icon" aria-label="Toggle fullscreen exploration" onClick={()=>{if(document.fullscreenElement)void document.exitFullscreen().catch(()=>{});else void stage.current?.requestFullscreen().catch(()=>setNotice("Fullscreen unavailable in this preview."));}}><Expand size={17}/></Button>
        </div>
        <div className={styles.location}><span>{rooftop?"THE ROOFTOP":room?"ROOM "+room.number:"THE HALLWAY"}</span><strong>{rooftop?"You found the long way round.":room?room.name:collected===5?"All five found. The rooftop is open.":"Find five keepsakes. Unlock the rooftop."}</strong></div>
        <div className={styles.passport} aria-label={collected+" of 5 keepsakes collected"}>{hallwayRooms.map((item,index)=>{const Icon=[Send,Compass,Goal,BookOpen,Search][index];return <span key={item.number} data-found={actions[index]>0} title={item.keepsake}><Icon size={16}/><small>{item.number}</small></span>;})}</div>
        <div className={styles.map} aria-label={"You are "+(room?"in "+room.name:"in the hallway")}>
          <span>FLOOR 01</span><div className={styles.mapHall}/>
          {hallwayRooms.map((item,index)=><i key={item.number} className={styles.mapRoom} data-side={item.side} data-visited={visited.includes(index)} style={{top:(20+(4-item.z)/36*95)+"px"}}>{item.number}</i>)}
          <b className={styles.mapPlayer} style={{left:(50+snapshot.x*2.4)+"%",top:(20+(4-snapshot.z)/36*95)+"px",transform:"translate(-50%,-50%) rotate("+(-snapshot.yaw*180/Math.PI)+"deg)"}}>▲</b>
        </div>
        {rooftop && <div className={styles.rooftopNote}><Sparkles size={22}/><h4>Glad you took a look around.</h4><p>A few of the things that make me, me.</p></div>}
        {room && storyVisible && <aside className={styles.roomStory} aria-label={"About "+room.name}>
          <Button size="icon" variant="ghost" onClick={()=>setStoryVisible(false)} aria-label="Put story away"><X size={14}/></Button>
          <p>FOUND / {room.number}</p><h4>{room.title}</h4><p>{room.text}</p><p>{room.detail}</p>{fullPage&&<Button variant="ghost" onClick={()=>openJournal(snapshot.room!)}>Look closer<ArrowRight size={15}/></Button>}
        </aside>}
        {room&&!storyVisible&&<Button className={styles.showStory} variant="outline" onClick={()=>setStoryVisible(true)}><BookOpen size={14}/>Read this room</Button>}
        <div className={styles.interaction} aria-live="polite">
          {notice?<span>{notice}</span>:room&&nearObject?<><Button onClick={()=>objectAction(snapshot.room!)}>{room.action}<ArrowRight size={16}/></Button><span>{actions[snapshot.room!]>0?room.response:"Click the object or press E."}</span></>:room?<span>Look for the glowing keepsake. Walk closer to pick it up.</span>:rooftop?<span>Five keepsakes. Five little windows into my life.</span>:door?<><Button onClick={()=>openDoor(snapshot.door!)}><DoorOpen size={17}/>{doors[snapshot.door!]?"Close":"Open"} room {door.number}</Button><span>{door.name} · E to {doors[snapshot.door!]?"close":"open"}</span></>:<span>{collected===5?"Head to the glowing door at the end of the hall.":"Find a glowing keepsake in each room."}</span>}
        </div>
        <div className={styles.walkControls} aria-label="Walking controls">
          {([["ArrowLeft","Turn left",ArrowLeft],["KeyW","Walk forward",ArrowUp],["ArrowRight","Turn right",ArrowRight],["KeyS","Walk backward",ArrowDown]] as const).map(([code,label,Icon])=><Button key={code} variant="outline" size="icon" aria-label={label}
            onPointerDown={event=>{event.preventDefault();event.currentTarget.setPointerCapture(event.pointerId);hold(code);}}
            onPointerUp={()=>release(code)} onPointerCancel={()=>release(code)} onLostPointerCapture={()=>release(code)}
            onKeyDown={event=>{if(event.key===" "||event.key==="Enter"){event.preventDefault();hold(code);}}}
            onKeyUp={()=>release(code)} onBlur={()=>release(code)}
          ><Icon size={19}/></Button>)}
        </div>
        <div className={styles.keyHint}>WASD / WALK <span>SHIFT / SPRINT</span> E / INTERACT <span>F / LIGHT · C / CROUCH</span></div>
      </>}
    </div>
    {!fullPage&&<div className={styles.footer}><span>{visited.length} rooms explored · {collected} keepsakes found</span><div><Button variant="ghost" size="sm" onClick={()=>setReading(value=>!value)} aria-expanded={reading}><BookOpen size={14}/>{reading?"Close stories":"Read the rooms"}</Button><Button variant="ghost" size="icon" aria-label="Return to building entrance" onClick={()=>{input.current.keys.clear();setReset(value=>value+1);setStoryVisible(true);stage.current?.focus({preventScroll:true});}}><RotateCcw size={15}/></Button></div></div>}
    {fullPage?<StoryJournal open={reading} onOpenChange={setReading} chapter={journalChapter} onChapter={setJournalChapter}/>:reading&&<div className={styles.reading}>{hallwayRooms.map(item=><article key={item.number}><span>{item.number} / {item.name}</span><h4>{item.title}</h4><p>{item.text}</p><p>{item.detail}</p></article>)}</div>}
  </div>;
}
