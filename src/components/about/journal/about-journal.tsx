"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import Image from "next/image";
import { Component, useCallback, useEffect, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import { ArrowLeft, ArrowRight, ArrowUpRight, BookOpen, View, X, Images } from "lucide-react";
import { Button } from "@/components/ui/button";
import content from "./content.json";
import ReaderPage, {memories} from "./reader-page";
import {Dialog, DialogContent, DialogTitle, DialogDescription, DialogClose} from "@/components/ui/dialog";
import type { JournalDirection, JournalTurn } from "./journal-types";
import "./journal.css";

const Scene = dynamic(() => import('./journal-scene'), {ssr:false});
const QUERY = '(prefers-reduced-motion: no-preference)';
const subscribe = (notify: () => void) => {
  const media = window.matchMedia(QUERY);
  media.addEventListener('change', notify);
  return () => media.removeEventListener('change', notify);
};
const getSnapshot = () => window.matchMedia(QUERY).matches;
// Unknown until hydration: do not briefly present the non-3D cover to every
// visitor before learning their motion preference.
const getServerSnapshot = (): boolean|null => null;
const SPREAD_COUNT = content.spreads.length;
const SCENE_LOAD_LIMIT_MS = 12_000;
const BASE = '/images/about/journal/';

class SceneBoundary extends Component<{children:ReactNode;onFailure:()=>void}, {failed:boolean}> {
  state = {failed:false};
  static getDerivedStateFromError() { return {failed:true}; }
  componentDidCatch() { this.props.onFailure(); }
  render() { return this.state.failed ? null : this.props.children; }
}

export default function AboutJournal() {
  const sceneAvailable = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const [memory, setMemory] = useState<number|null>(null);
  const [reader, setReader] = useState(false);
  const [sceneFailed, setSceneFailed] = useState(false);
  const [failureReason,setFailureReason] = useState<string|null>(null);
  const [ready, setReady] = useState(false);
  const [queuedSpread, setQueuedSpread] = useState<number|null>(null);
  const queuedRef = useRef<number|null>(null);
  const requestedSpread = useRef(1);
  const [spread, setSpread] = useState(0);
  const [leaf, setLeaf] = useState(0);
  const [turn, setTurn] = useState<JournalTurn|null>(null);
  const turnRef = useRef<JournalTurn|null>(null);
  const serial = useRef(0);
  const drag = useRef<{start:number;direction:JournalDirection;progress:number;moved:boolean}|null>(null);
  const swipe = useRef<{x:number;y:number}|null>(null);
  const stage = useRef<HTMLDivElement>(null);
  const showScene = sceneAvailable === true && !reader && !sceneFailed;
  const sceneLayout = sceneAvailable !== false && !reader && !sceneFailed;
  const preparingScene = sceneLayout && !ready;
  const active = content.spreads[Math.max(0,spread-1)];
  const updateTurn = useCallback((value:JournalTurn|null) => {turnRef.current=value;setTurn(value);}, []);
  const complete = useCallback((value:number) => {setSpread(value);updateTurn(null);stage.current?.focus({preventScroll:true});}, [updateTurn]);
  const onReady = useCallback(() => {
    setReady(true);
    const target = queuedRef.current;
    if (target === null) return;
    queuedRef.current = null;
    setQueuedSpread(null);
    updateTurn({id:++serial.current,from:spread,to:target});
  }, [spread,updateTurn]);
  const onFailure = useCallback((reason?:string) => {setFailureReason(reason??"loading");setSceneFailed(true);setReady(false);queuedRef.current=null;setQueuedSpread(null);if(spread>0)setReader(true);updateTurn(null);}, [spread,updateTurn]);
  useEffect(() => {
    // Dynamic imports, image requests and renderer creation can stall without
    // throwing. Never leave the journal dependent on an unbounded load.
    if (!showScene || ready) return;
    let timeout: number|undefined;
    const watchVisibleLoad = () => {
      window.clearTimeout(timeout);
      // A background tab may pause rendering; that is not a renderer failure.
      if(document.visibilityState==='visible') timeout=window.setTimeout(onFailure,SCENE_LOAD_LIMIT_MS);
    };
    watchVisibleLoad();
    document.addEventListener('visibilitychange',watchVisibleLoad);
    return () => {window.clearTimeout(timeout);document.removeEventListener('visibilitychange',watchVisibleLoad);};
  }, [showScene, ready, onFailure]);
  useEffect(() => {
    // A reduced-motion change can unmount the renderer mid-turn.
    const media = window.matchMedia(QUERY);
    const settle = () => {
      const current = turnRef.current;
      if (media.matches) setReady(false);
      if (!media.matches && current) complete(current.cancelled ? current.from : current.to);
      if (!media.matches && queuedRef.current !== null) {
        const target=queuedRef.current;
        queuedRef.current=null;
        setQueuedSpread(null);
        complete(target);
      }
    };
    media.addEventListener('change',settle);
    return () => media.removeEventListener('change',settle);
  }, [complete]);
  useEffect(() => {
    if (!showScene && spread > 0) stage.current?.scrollIntoView({block:'start',behavior:'instant'});
  }, [showScene, spread, leaf]);
  const goTo = useCallback((target:number) => {
    if (turn || target < 0 || target > SPREAD_COUNT) return;
    if (target === spread) {if (!showScene) setLeaf(0);return;}
    setLeaf(0);
    if(target>0) requestedSpread.current=target;
    const wantsScene=window.matchMedia(QUERY).matches&&!reader;
    if(sceneFailed && wantsScene) return;
    if (!wantsScene) {setSpread(target);return;}
    if (!ready) {
      // Preserve the requested 3D experience. A quick click must not silently
      // choose reading mode while the renderer or its textures are loading.
      queuedRef.current=target;
      setQueuedSpread(target);
      return;
    }
    updateTurn({id:++serial.current,from:spread,to:target});
  }, [turn, spread, showScene, ready, updateTurn, sceneFailed, reader]);
  const navigate = useCallback((direction:JournalDirection) => {
    if (turn) return;
    if (!showScene && spread > 0) {
      if (direction === 'next' && leaf === 0) {setLeaf(1);return;}
      if (direction === 'previous' && leaf === 1) {setLeaf(0);return;}
      if (direction === 'previous' && spread > 1) {setSpread(spread-1);setLeaf(1);return;}
    }
    goTo(spread + (direction === 'next' ? 1 : -1));
  }, [turn,showScene,spread,leaf,goTo]);
  const beginDrag = useCallback((x:number,direction:JournalDirection) => {
    if (turn || spread === 0 || (direction === 'previous' && spread === 1) || (direction === 'next' && spread === SPREAD_COUNT)) return;
    drag.current = {start:x,direction,progress:direction==='next'?0:1,moved:false};
  }, [turn,spread]);
  const moveDrag = useCallback((x:number) => {
    const d = drag.current;
    if (!d) return;
    const dx = x-d.start;
    if (!d.moved && Math.abs(dx) < 6) return;
    const distance = Math.min(520,(stage.current?.clientWidth ?? 1100)*.42);
    const amount = Math.max(0,Math.min(1,(d.direction==='next'?-dx:dx)/distance));
    d.moved = true;
    d.progress = d.direction === 'next' ? amount : 1-amount;
    updateTurn({id:serial.current+1,from:spread,to:spread+(d.direction==='next'?1:-1),manual:true,progress:d.progress});
  }, [spread,updateTurn]);
  const endDrag = useCallback((cancelled=false) => {
    const d=drag.current;
    drag.current=null;
    if (!d?.moved) return;
    const fraction=d.direction==='next'?d.progress:1-d.progress;
    updateTurn({id:++serial.current,from:spread,to:spread+(d.direction==='next'?1:-1),progress:d.progress,cancelled:cancelled||fraction<.24});
  }, [spread,updateTurn]);
  const openReader = () => {
    queuedRef.current=null;
    setQueuedSpread(null);
    setReader(true);
    setLeaf(0);
    if(spread===0) setSpread(requestedSpread.current);
  };
  const close = () => goTo(0);
  const nextDisabled = (sceneFailed&&!reader&&spread===0) || !!turn || (spread===SPREAD_COUNT && (showScene || leaf===1));
  const progress = spread === 0 ? 'Cover' : showScene ? `Spread 0${spread} / 0${SPREAD_COUNT}` : `Page 0${(spread-1)*2+leaf+1} / 0${SPREAD_COUNT*2}`;

  return <section className="personal-journal" aria-labelledby="journal-title" data-open={spread>0} data-scene={sceneLayout} data-ready={ready} data-turning={!!turn}>
    <header className="j-topline">
      <div><span className="j-dot"/><h1 id="journal-title">Tanmay Raut <span>/</span> Personal notes</h1></div>
      <div className="j-edition">VOL. 01 <span>PHOENIX, ARIZONA</span></div>
    </header>
    <div ref={stage} className="j-stage" tabIndex={0} aria-label="Personal journal. Use left and right arrow keys to turn pages."
      onKeyDown={event=>{
        if ((event.target as HTMLElement).closest('input,textarea,a')) return;
        if (event.key==='ArrowRight') {event.preventDefault();navigate('next');}
        if (event.key==='ArrowLeft') {event.preventDefault();navigate('previous');}
        if (event.key==='Escape' && spread>0) {event.preventDefault();close();}
      }}>
      {showScene && <div className="j-world" aria-hidden="true"><SceneBoundary onFailure={onFailure}>
        <Scene spread={spread} turn={turn} onComplete={complete} onReady={onReady} onFailure={onFailure} onMemory={setMemory}
          onNavigate={navigate} onDragStart={beginDrag} onDragMove={moveDrag} onDragEnd={endDrag}/>
      </SceneBoundary></div>}
      {!sceneLayout && spread===0 && <div className="j-cover-fallback" aria-hidden="true"><Image loading="eager" src={BASE+'cover.webp'} width="1000" height="1400" alt=""/></div>}
      {preparingScene && <div className="j-scene-loading" aria-hidden="true"><span/></div>}
      {spread===0 && <div className="j-invitation">
        <span className="j-print-label">BEHIND THE WORK</span>
        <h2>A few pages{" "}<br/>about <em>me.</em></h2>
        <p>Where I started.{" "}<br/>What I keep coming back to.</p>
        <Button onClick={()=>sceneFailed?window.location.reload():goTo(1)} aria-busy={queuedSpread!==null} className="j-open-button">{sceneFailed?'Retry 3D book':queuedSpread!==null?'Opening your journal…':'Open my journal'}<ArrowRight size={17}/></Button>
        {sceneFailed && <Button variant="ghost" className="j-read-alternative" onClick={openReader}>Read without 3D</Button>}
        {sceneLayout && <p className="j-loading-note" role="status" data-loading={preparingScene}>{preparingScene?(queuedSpread!==null?'Your book will open as soon as it’s ready.':'Preparing the 3D book. You can click Open now.'):'\u00a0'}</p>}
      </div>}
      {showScene && spread>0 && <div className="sr-only" key={spread}>
        <h2>{active.label}</h2><p>{active.left.title} {active.left.body}</p><p>{active.right.title} {active.right.body}</p>
        {spread===2 && [...content.spreads[1].left.photos!,...content.spreads[1].right.photos!].map(photo=><p key={photo.image}>{photo.label}: {photo.note}</p>)}
        {spread===3 && <p>{content.spreads[2].right.project!.title} {content.spreads[2].right.project!.body}</p>}
      </div>}
      {!showScene && spread>0 && <div className="j-reader"
        onPointerDown={event=>{if(event.pointerType==='touch') swipe.current={x:event.clientX,y:event.clientY};}}
        onPointerUp={event=>{
          const start=swipe.current;swipe.current=null;
          if (!start) return;
          const dx=event.clientX-start.x,dy=event.clientY-start.y;
          if (Math.abs(dx)>65&&Math.abs(dx)>Math.abs(dy)*1.6) navigate(dx<0?'next':'previous');
        }}
        onPointerCancel={()=>{swipe.current=null;}}>
        <ReaderPage index={(spread-1)*2+leaf} onMemory={setMemory}/>
      </div>}
      {showScene && <div className="j-scene-note" aria-hidden="true">{spread===0?'A JOURNAL TO OPEN. A STORY TO EXPLORE.':spread===2?'CLICK A PRINT TO LOOK CLOSER · DRAG TO TURN':'DRAG A PAGE OR USE THE ARROWS'}</div>}
      <span className="j-desk-mark" aria-hidden="true">EST. MUMBAI<br/>STILL CURIOUS</span>
    </div>
    <div className="j-toolbar">
      <div className="j-chapters" aria-label="Journal contents">
        {content.spreads.map((s,i)=><Button key={s.id} variant="ghost" className="j-chapter" aria-pressed={spread===i+1} aria-busy={queuedSpread===i+1} disabled={!!turn||(sceneFailed&&!reader)} onClick={()=>goTo(i+1)}><span>0{i+1}</span>{s.label}</Button>)}
      </div>
      <nav className="j-pagination" aria-label="Turn journal pages">
        <Button variant="ghost" size="icon" className="j-control" aria-label="Previous journal page" disabled={spread===0||!!turn} onClick={()=>navigate('previous')}><ArrowLeft/></Button>
        <span role="status" aria-live="polite" className="j-page-status">{turn?'Turning…':progress}</span>
        <Button variant="ghost" size="icon" className="j-control" aria-label={spread===0?'Open journal':'Next journal page'} disabled={nextDisabled} onClick={()=>navigate('next')}><ArrowRight/></Button>
      </nav>
      <div className="j-options">
        {spread>0 && <Button variant="ghost" size="icon" className="j-control" aria-label="Open loose photographs" disabled={!!turn} onClick={()=>setMemory(spread===2?1:0)}><Images/></Button>}
        {spread>0 && <Button variant="ghost" size="icon" className="j-control" aria-label="Close journal" disabled={!!turn} onClick={close}><X/></Button>}
        {sceneAvailable && sceneFailed && <Button variant="ghost" className="j-reader-toggle" onClick={()=>window.location.reload()}>Retry 3D</Button>}
        {sceneAvailable && !sceneFailed && <Button variant="ghost" className="j-reader-toggle" disabled={!!turn} onClick={()=>{if(reader){setReady(false);setReader(false);setLeaf(0);}else openReader();}}>{reader?<View size={16}/>:<BookOpen size={16}/>}<span>{reader?'Desk view':'Read text'}</span></Button>}
      </div>
    </div>
    <div className="j-underbar">
      <p>{spread===0?'A personal journal, best explored at your own pace.':spread===1?'Two places. One story.':spread===2?'Four moments. Four different perspectives.':'Football, philosophy and following an idea.'}</p>
      {spread===1?<Link href="/experience">The full career story<ArrowUpRight size={14}/></Link>:spread===3?<Link href="/projects/trading-research-desk">Inside my trading project<ArrowUpRight size={14}/></Link>:<Link href="/projects">Explore my work<ArrowUpRight size={14}/></Link>}
    </div>
    <Dialog open={memory!==null} onOpenChange={open=>{if(!open)setMemory(null);}}>
      <DialogContent className="j-photo-dialog" onCloseAutoFocus={event=>{event.preventDefault();stage.current?.focus({preventScroll:true});}} onKeyDown={event=>{
        if(event.key==='ArrowRight') {event.preventDefault();setMemory(((memory??0)+1)%memories.length);}
        if(event.key==='ArrowLeft') {event.preventDefault();setMemory(((memory??0)+memories.length-1)%memories.length);}
      }}>
        <div className="j-photo-top"><DialogTitle>Loose photographs</DialogTitle><DialogClose asChild><Button variant="ghost" size="icon" aria-label="Close photographs"><X/></Button></DialogClose></div>
        <DialogDescription>From my camera roll. A closer look at life beyond the desk.</DialogDescription>
        {memory!==null && <figure key={memory}><Image src={memories[memory].image} width={1200} height={1000} alt={memories[memory].alt} sizes="(max-width: 700px) 90vw, 900px"/><figcaption><em>{memories[memory].label}</em><span>{memories[memory].note}</span></figcaption></figure>}
        <div className="j-photo-nav"><Button variant="ghost" size="icon" aria-label="Previous photograph" onClick={()=>setMemory(((memory??0)+memories.length-1)%memories.length)}><ArrowLeft/></Button><span>{(memory??0)+1} / {memories.length}</span><Button variant="ghost" size="icon" aria-label="Next photograph" onClick={()=>setMemory(((memory??0)+1)%memories.length)}><ArrowRight/></Button></div>
      </DialogContent>
    </Dialog>
    {sceneFailed && <p className="j-fallback-note" role="status">{failureReason==='webgl-unavailable'?'3D graphics (WebGL) are unavailable in this browser. You can read without 3D, or enable browser graphics acceleration and retry.':spread===0?'3D book could not start. Retry it, or choose Read without 3D.':'3D desk could not load. Reading view is active; all pages remain available.'}</p>}
    <noscript><p className="j-fallback-note">This journal uses JavaScript. You can also read my <Link href="/experience">career story</Link> and <Link href="/projects">projects</Link>.</p></noscript>
  </section>;
}
