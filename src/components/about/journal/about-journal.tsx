"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import Image from "next/image";
import {preload} from "react-dom";
import { Component, useCallback, useEffect, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import { ArrowLeft, ArrowRight, ArrowUpRight, BookOpen, View, X, Images, Sparkles, RotateCcw, Volume2,VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import content from "./journal-content";
import ReaderPage, {memories} from "./reader-page";
import {Dialog, DialogContent, DialogTitle, DialogDescription, DialogClose} from "@/components/ui/dialog";
import type { JournalDirection, JournalTurn } from "./journal-types";
import {useJournalAudio} from './use-journal-audio';
import {spreadAssets} from './journal-assets';
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
const INITIAL_TEXTURES=['cover.webp','cloth.png','desk.webp','desk-normal.webp'];

class SceneBoundary extends Component<{children:ReactNode;onFailure:()=>void}, {failed:boolean}> {
  state = {failed:false};
  static getDerivedStateFromError() { return {failed:true}; }
  componentDidCatch() { this.props.onFailure(); }
  render() { return this.state.failed ? null : this.props.children; }
}

export default function AboutJournal() {
  // React deduplicates these head hints across SSR and hydration. Cover/desk
  // get priority; interior pages can load in parallel without blocking cover.
  INITIAL_TEXTURES.forEach((file,index)=>preload(BASE+file,{as:'image',crossOrigin:'anonymous',media:QUERY,fetchPriority:index<4?'high':'low'}));
  spreadAssets(1).forEach(url=>preload(url,{as:'image',crossOrigin:'anonymous',media:QUERY,fetchPriority:'low'}));
  const sceneAvailable = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const [memory, setMemory] = useState<number|null>(null);
  const [reader, setReader] = useState(false);
  const [sceneFailed, setSceneFailed] = useState(false);
  const [failureReason,setFailureReason] = useState<string|null>(null);
  const [slowLoad,setSlowLoad] = useState(false);
  const [assetFailure,setAssetFailure] = useState<number|null>(null);
  const failedSpreads=useRef(new Set<number>());
  const [ready, setReady] = useState(false);
  const [pagesReady,setPagesReady] = useState(false);
  const [preparingSpread,setPreparingSpread]=useState(1);
  const preparingRef=useRef(1);
  const prepareSpread=useCallback((value:number)=>{preparingRef.current=value;setPreparingSpread(value);},[]);
  const preparedSpreads=useRef(new Set<number>());
  const readyRef=useRef(false);
  const pagesReadyRef=useRef(false);
  const [livingPages,setLivingPages] = useState(true);
  const [replay,setReplay] = useState(0);
  const [inView,setInView] = useState(true);
  const [queuedSpread, setQueuedSpread] = useState<number|null>(null);
  const queuedRef = useRef<number|null>(null);
  const requestedSpread = useRef(1);
  const [spread, setSpread] = useState(0);
  const spreadRef=useRef(0);
  const updateSpread=useCallback((value:number)=>{spreadRef.current=value;setSpread(value);},[]);
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
  const sound=useJournalAudio(active.scene,showScene&&spread>0&&inView,!!turn,replay);
  useEffect(()=>{
    const element=stage.current;
    if(!element)return;
    const observer=new IntersectionObserver(([entry])=>setInView(entry.isIntersecting),{threshold:0});
    observer.observe(element);
    return ()=>observer.disconnect();
  },[]);
  const updateTurn = useCallback((value:JournalTurn|null) => {turnRef.current=value;setTurn(value);}, []);
  const complete = useCallback((value:number) => {drag.current=null;updateSpread(value);updateTurn(null);stage.current?.focus({preventScroll:true});}, [updateSpread,updateTurn]);
  const openQueued = useCallback(() => {
    const target = queuedRef.current;
    if (target === null || turnRef.current) return;
    if(!readyRef.current||!preparedSpreads.current.has(Math.max(1,target)))return;
    queuedRef.current = null;
    setQueuedSpread(null);
    updateTurn({id:++serial.current,from:spreadRef.current,to:target});
  }, [updateTurn]);
  const onReady=useCallback(()=>{readyRef.current=true;setReady(true);if(preparedSpreads.current.has(preparingRef.current))setSlowLoad(false);openQueued();},[openQueued]);
  const onPagesReady=useCallback((loaded:number[])=>{
    loaded.forEach(value=>{preparedSpreads.current.add(value);failedSpreads.current.delete(value);});
    const complete=preparedSpreads.current.has(preparingRef.current);
    pagesReadyRef.current=complete;setPagesReady(complete);if(complete)setSlowLoad(false);
    setAssetFailure(previous=>previous!==null&&loaded.includes(previous)?null:previous);openQueued();
  },[openQueued]);
  const onPagesFailed=useCallback((failed:number)=>{
    failedSpreads.current.add(failed);
    // A failed speculative neighbour must not tear down a healthy open book.
    if(failed!==preparingRef.current&&queuedRef.current!==failed)return;
    setAssetFailure(failed);setSlowLoad(false);
    if(queuedRef.current===failed){queuedRef.current=null;setQueuedSpread(null);}
  },[]);
  const onFailure = useCallback((reason?:string) => {drag.current=null;setSlowLoad(false);setFailureReason(reason??"loading");setSceneFailed(true);readyRef.current=false;pagesReadyRef.current=false;setReady(false);setPagesReady(false);queuedRef.current=null;setQueuedSpread(null);if(spread>0)setReader(true);updateTurn(null);}, [spread,updateTurn]);
  useEffect(() => {
    // Slow networks and software GPUs are not renderer failures. Keep the
    // requested 3D book loading and offer an explicit reading alternative.
    if (!showScene || (ready && pagesReady)) return;
    let timeout: number|undefined;
    const watchVisibleLoad = () => {
      window.clearTimeout(timeout);
      // A background tab may pause rendering; that is not a renderer failure.
      if(document.visibilityState==='visible'&&inView) timeout=window.setTimeout(()=>setSlowLoad(true),SCENE_LOAD_LIMIT_MS);
    };
    watchVisibleLoad();
    document.addEventListener('visibilitychange',watchVisibleLoad);
    return () => {window.clearTimeout(timeout);document.removeEventListener('visibilitychange',watchVisibleLoad);};
  }, [showScene, ready, pagesReady, inView]);
  useEffect(() => {
    // A reduced-motion change can unmount the renderer mid-turn.
    const media = window.matchMedia(QUERY);
    const settle = () => {
      const current = turnRef.current;
      drag.current=null;setSlowLoad(false);
      if (media.matches) {prepareSpread(Math.max(1,spreadRef.current));readyRef.current=false;pagesReadyRef.current=false;setReady(false);setPagesReady(false);}
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
  }, [complete,prepareSpread]);
  useEffect(() => {
    if (!showScene && spread > 0) stage.current?.scrollIntoView({block:'start',behavior:'instant'});
  }, [showScene, spread, leaf]);
  const goTo = useCallback((target:number) => {
    if (turnRef.current || target < 0 || target > SPREAD_COUNT) return;
    // The latest navigation replaces an older cold-load request, including
    // selecting the already-open spread to cancel a pending destination.
    queuedRef.current=null;setQueuedSpread(null);setSlowLoad(false);setAssetFailure(null);
    if (target === spread) {
      const current=Math.max(1,target);prepareSpread(current);
      const prepared=preparedSpreads.current.has(current);pagesReadyRef.current=prepared;setPagesReady(prepared);
      if (!showScene) setLeaf(0);return;
    }
    setLeaf(0);
    if(target>0) requestedSpread.current=target;
    const wantsScene=window.matchMedia(QUERY).matches&&!reader;
    if(sceneFailed && wantsScene) return;
    if (!wantsScene) {updateSpread(target);return;}
    prepareSpread(Math.max(1,target));
    if(failedSpreads.current.has(Math.max(1,target))){setAssetFailure(Math.max(1,target));return;}
    if (!ready || !preparedSpreads.current.has(Math.max(1,target))) {
      // Preserve the requested 3D experience. A quick click must not silently
      // choose reading mode while the renderer or its textures are loading.
      queuedRef.current=target;
      setQueuedSpread(target);
      if(!preparedSpreads.current.has(Math.max(1,target))) {pagesReadyRef.current=false;setPagesReady(false);}
      return;
    }
    updateTurn({id:++serial.current,from:spread,to:target});
  }, [spread, showScene, ready, updateTurn, updateSpread, prepareSpread, sceneFailed, reader]);
  const navigate = useCallback((direction:JournalDirection) => {
    if (turn) return;
    if (!showScene && spread > 0) {
      if (direction === 'next' && leaf === 0) {setLeaf(1);return;}
      if (direction === 'previous' && leaf === 1) {setLeaf(0);return;}
      if (direction === 'previous' && spread > 1) {updateSpread(spread-1);setLeaf(1);return;}
    }
    goTo(spread + (direction === 'next' ? 1 : -1));
  }, [turn,showScene,spread,leaf,goTo,updateSpread]);
  const beginDrag = useCallback((x:number,direction:JournalDirection) => {
    if (turn || spread === 0 || (direction === 'previous' && spread === 1) || (direction === 'next' && spread === SPREAD_COUNT)) return;
    const target=spread+(direction==='next'?1:-1);
    // Preparing a cold leaf must never commit a page turn on pointer-down.
    // Track the gesture first; short or cancelled drags stay on this spread.
    if(!preparedSpreads.current.has(target))prepareSpread(target);
    drag.current = {start:x,direction,progress:direction==='next'?0:1,moved:false};
  }, [turn,spread,prepareSpread]);
  const moveDrag = useCallback((x:number) => {
    const d = drag.current;
    if (!d) return;
    const dx = x-d.start;
    if (!d.moved && Math.abs(dx) < 6) return;
    const distance = Math.min(520,(stage.current?.clientWidth ?? 1100)*.42);
    const amount = Math.max(0,Math.min(1,(d.direction==='next'?-dx:dx)/distance));
    d.moved = true;
    d.progress = d.direction === 'next' ? amount : 1-amount;
    const target=spread+(d.direction==='next'?1:-1);
    if(preparedSpreads.current.has(target))updateTurn({id:serial.current+1,from:spread,to:target,manual:true,progress:d.progress});
  }, [spread,updateTurn]);
  const endDrag = useCallback((cancelled=false) => {
    const d=drag.current;
    drag.current=null;
    const restoreCurrent=()=>{const current=Math.max(1,spread);prepareSpread(current);const prepared=preparedSpreads.current.has(current);pagesReadyRef.current=prepared;setPagesReady(prepared);};
    if (!d?.moved) {if(d)restoreCurrent();return;}
    const fraction=d.direction==='next'?d.progress:1-d.progress;
    const target=spread+(d.direction==='next'?1:-1);
    if(cancelled||fraction<.24)restoreCurrent();
    if(!preparedSpreads.current.has(target)){
      if(!cancelled&&fraction>=.24)goTo(target);
      return;
    }
    updateTurn({id:++serial.current,from:spread,to:target,progress:d.progress,cancelled:cancelled||fraction<.24});
  }, [spread,updateTurn,goTo,prepareSpread]);
  const openReader = () => {
    drag.current=null;setSlowLoad(false);setAssetFailure(null);
    queuedRef.current=null;
    setQueuedSpread(null);
    setReader(true);
    setLeaf(0);
    if(spread===0) updateSpread(requestedSpread.current);
  };
  const close = () => goTo(0);
  const nextDisabled = (sceneFailed&&!reader&&spread===0) || !!turn || (spread===SPREAD_COUNT && (showScene || leaf===1));
  const pad=(value:number)=>String(value).padStart(2,'0');
  const progress = spread === 0 ? 'Cover' : showScene ? `Spread ${pad(spread)} / ${pad(SPREAD_COUNT)}` : `Page ${pad((spread-1)*2+leaf+1)} / ${pad(SPREAD_COUNT*2)}`;

  return <section className="personal-journal" aria-labelledby="journal-title" data-open={spread>0} data-scene={sceneLayout} data-ready={ready} data-pages-ready={pagesReady} data-turning={!!turn} data-living={livingPages}>
    <header className="j-topline">
      <div><span className="j-dot"/><h1 id="journal-title">Tanmay Raut <span>/</span> Personal notes</h1></div>
      <div className="j-edition">VOL. 01 <span>PHOENIX, ARIZONA</span></div>
    </header>
    <div ref={stage} className="j-stage" tabIndex={0} aria-busy={preparingScene||queuedSpread!==null} aria-label="Personal journal. Use left and right arrow keys to turn pages."
      onKeyDown={event=>{
        if ((event.target as HTMLElement).closest('input,textarea,a')) return;
        if (event.key==='ArrowRight') {event.preventDefault();navigate('next');}
        if (event.key==='ArrowLeft') {event.preventDefault();navigate('previous');}
        if (event.key==='Escape' && spread>0) {event.preventDefault();close();}
      }}>
      {showScene && <div className="j-world" aria-hidden="true"><SceneBoundary onFailure={onFailure}>
        <Scene spread={spread} turn={turn} preparingSpread={preparingSpread} onComplete={complete} onReady={onReady} onPagesReady={onPagesReady} onPagesFailed={onPagesFailed} onFailure={onFailure} onMemory={setMemory}
          living={livingPages} replay={replay} onNavigate={navigate} onDragStart={beginDrag} onDragMove={moveDrag} onDragEnd={endDrag}/>
      </SceneBoundary></div>}
      {!sceneLayout && spread===0 && <div className="j-cover-fallback" aria-hidden="true"><Image loading="eager" src={BASE+'cover.webp'} width="1000" height="1400" alt=""/></div>}
      {preparingScene && <div className="j-scene-loading" aria-hidden="true"><span/></div>}
      {spread===0 && <div className="j-invitation">
        <span className="j-print-label">BEHIND THE WORK</span>
        <h2>A few pages{" "}<br/>about <em>me.</em></h2>
        <p>Where I started.{" "}<br/>What I keep coming back to.</p>
        <Button onClick={()=>sceneFailed||assetFailure===1?window.location.reload():goTo(1)} aria-busy={queuedSpread!==null} className="j-open-button">{sceneFailed?'Retry 3D book':assetFailure===1?'Retry artwork':queuedSpread!==null?'Opening your journal…':'Open my journal'}<ArrowRight size={17}/></Button>
        {(sceneFailed||slowLoad||assetFailure!==null) && <Button variant="ghost" className="j-read-alternative" onClick={openReader}>Read without 3D</Button>}
        {sceneLayout && <p className="j-loading-note" role="status" data-loading={preparingScene||!pagesReady}>{assetFailure!==null?'Some artwork is unavailable. You can read without 3D.':slowLoad?'Still loading 3D. You can keep waiting or read without 3D.':preparingScene||!pagesReady?(queuedSpread!==null?'Your book will open as soon as it’s ready.':ready?'Preparing the pages. You can click Open now.':'Preparing the 3D book. You can click Open now.'):'\u00a0'}</p>}
      </div>}
      {showScene && spread>0 && <div className="sr-only" key={spread}>
        <h2>{active.label}</h2><p>{active.left.title} {active.left.body}</p><p>{active.right.title} {active.right.body}</p>
        {spread===2 && [...content.spreads[1].left.photos!,...content.spreads[1].right.photos!].map(photo=><p key={photo.image}>{photo.label}: {photo.note}</p>)}
        {[active.left,active.right].filter(page=>page.project).map(page=><p key={page.number}>{page.project!.title}</p>)}
      </div>}
      {showScene && spread>0 && <div className="j-spread-caption" key={`caption-${spread}`}>
        <span className="j-print-label">{pad(spread)} / {active.label}</span>
        <h2>{spread===1?active.right.title.replaceAll('\n',' '):active.left.title.replaceAll('\n',' ')}</h2>
        <p>{spread===1?active.right.body:active.left.body}</p>
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
      {showScene && <div className="j-scene-note" aria-hidden="true">{spread===0?'A JOURNAL TO OPEN. A STORY TO EXPLORE.':spread===2?'AN OUTDOOR WORLD IN MINIATURE · DRAG TO TURN':'DRAG A PAGE OR USE THE ARROWS'}</div>}
      <span className="j-desk-mark" aria-hidden="true">EST. MUMBAI<br/>STILL CURIOUS</span>
    </div>
    <div className="j-toolbar">
      <div className="j-chapters" aria-label="Journal contents">
        {content.spreads.map((s,i)=><Button key={s.id} variant="ghost" className="j-chapter" aria-pressed={spread===i+1} aria-busy={queuedSpread===i+1} disabled={!!turn||(sceneFailed&&!reader)} onClick={()=>goTo(i+1)}><span>{pad(i+1)}</span>{s.label}</Button>)}
      </div>
      <nav className="j-pagination" aria-label="Turn journal pages">
        <Button variant="ghost" size="icon" className="j-control" aria-label="Previous journal page" disabled={spread===0||!!turn} onClick={()=>navigate('previous')}><ArrowLeft/></Button>
        <span role="status" aria-live="polite" className="j-page-status">{turn?'Turning…':queuedSpread!==null?'Preparing…':progress}</span>
        <Button variant="ghost" size="icon" className="j-control" aria-label={spread===0?'Open journal':'Next journal page'} disabled={nextDisabled} onClick={()=>navigate('next')}><ArrowRight/></Button>
      </nav>
      <div className="j-options">
        {showScene&&<Button variant="ghost" size="icon" className="j-control" aria-label={sound.enabled?'Mute journal sound':'Enable journal sound'} aria-pressed={sound.enabled} onClick={()=>void sound.toggle()}>{sound.enabled?<Volume2 size={17}/>:<VolumeX size={17}/>}</Button>}
        {showScene && spread>0 && <>
          <Button variant="ghost" className="j-reader-toggle" aria-label="Living pages" title="Living pages" aria-pressed={livingPages} disabled={!!turn} onClick={()=>setLivingPages(!livingPages)}><Sparkles size={16}/><span>Living pages</span></Button>
          {livingPages && <Button variant="ghost" size="icon" className="j-control" aria-label="Replay page scene" disabled={!!turn} onClick={()=>setReplay(replay+1)}><RotateCcw size={17}/></Button>}
        </>}
        {spread>0&&spread<=2 && <Button variant="ghost" size="icon" className="j-control" aria-label="Open loose photographs" disabled={!!turn} onClick={()=>setMemory(spread===2?1:0)}><Images/></Button>}
        {spread>0 && <Button variant="ghost" size="icon" className="j-control" aria-label="Close journal" disabled={!!turn} onClick={close}><X/></Button>}
        {sceneAvailable && sceneFailed && <Button variant="ghost" className="j-reader-toggle" onClick={()=>window.location.reload()}>Retry 3D</Button>}
        {sceneAvailable && !sceneFailed && <Button variant="ghost" className="j-reader-toggle" disabled={!!turn} onClick={()=>{if(reader){readyRef.current=false;pagesReadyRef.current=false;setReady(false);setPagesReady(false);prepareSpread(Math.max(1,spread));setReader(false);setLeaf(0);}else openReader();}}>{reader?<View size={16}/>:<BookOpen size={16}/>}<span>{reader?'Desk view':'Read text'}</span></Button>}
      </div>
    </div>
    <div className="j-underbar">
      <p>{spread===0?'A personal journal, best explored at your own pace.':active.summary}</p>
      {spread>0&&active.link?<Link href={active.link.href}>{active.link.label}<ArrowUpRight size={14}/></Link>:<Link href="/projects">Explore my work<ArrowUpRight size={14}/></Link>}
    </div>
    {spread>0&&active.scene==='football'&&<p className="j-media-credit">Messi photograph: <a href="https://commons.wikimedia.org/wiki/File:Leo_Messi_v_Granada_2014.jpg" target="_blank" rel="noreferrer">Lluís / L. F. Salas</a> (<a href="https://creativecommons.org/licenses/by/2.0/" target="_blank" rel="noreferrer">CC BY 2.0</a>). Resized and cropped for this scene.</p>}
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
    {showScene&&(slowLoad||assetFailure!==null)&&<p className="j-fallback-note" role="status">{assetFailure!==null?'Some journal artwork could not load. The current book remains available.':'3D loading is taking longer than usual. You can keep waiting or read without 3D.'} {assetFailure!==null&&<Button variant="link" onClick={()=>window.location.reload()}>Retry artwork</Button>}<Button variant="link" onClick={openReader}>Read without 3D</Button></p>}
    {sceneFailed && <p className="j-fallback-note" role="status">{failureReason==='webgl-unavailable'?'3D graphics (WebGL) are unavailable in this browser. You can read without 3D, or enable browser graphics acceleration and retry.':spread===0?'3D book could not start. Retry it, or choose Read without 3D.':'3D desk could not load. Reading view is active; all pages remain available.'}</p>}
    <noscript><p className="j-fallback-note">This journal uses JavaScript. You can also read my <Link href="/experience">career story</Link> and <Link href="/projects">projects</Link>.</p></noscript>
  </section>;
}
