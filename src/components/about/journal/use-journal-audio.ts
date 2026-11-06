"use client";
import {useCallback,useEffect,useRef,useState} from 'react';
import type {JournalSceneKind} from './journal-content';

/** Original synthesized foley. No recordings, club music or remote requests. */
export function useJournalAudio(scene:JournalSceneKind,open:boolean,turning:boolean,replay:number) {
 const [enabled,setEnabled]=useState(false);
 const context=useRef<AudioContext|null>(null);
 const toggle=useCallback(async()=>{
  if(enabled){setEnabled(false);return;}
  try {
   context.current??=new AudioContext();
   await context.current.resume();setEnabled(true);
  } catch {setEnabled(false);}
 },[enabled]);
 useEffect(()=>()=>{void context.current?.close();context.current=null;},[]);
 useEffect(()=>{
  const ctx=context.current;if(!enabled||!ctx||!open)return;
  const nodes:AudioNode[]=[],sources:AudioScheduledSourceNode[]=[];
  const master=ctx.createGain();master.gain.value=0;master.connect(ctx.destination);nodes.push(master);
  const now=ctx.currentTime,span=turning?.55:18;
  master.gain.setValueAtTime(0,now);master.gain.linearRampToValueAtTime(turning?.09:.025,now+.2);
  master.gain.setValueAtTime(turning?.09:.025,now+span-.35);master.gain.linearRampToValueAtTime(0,now+span);
  let seed=163;
  const noise=ctx.createBuffer(1,ctx.sampleRate*3,ctx.sampleRate),data=noise.getChannelData(0);
  for(let i=0;i<data.length;i++){seed=(seed*1664525+1013904223)>>>0;data[i]=((seed>>>8)/0xffffff)*2-1;}
  const source=ctx.createBufferSource();source.buffer=noise;source.loop=true;
  const filter=ctx.createBiquadFilter();filter.type=turning?'highpass':'bandpass';
  filter.frequency.value=turning?850:scene==='football'?650:scene==='travel'?1300:scene==='journey'?180:scene==='cinema'?350:420;
  filter.Q.value=turning?.3:scene==='football'?1.8:.45;
  source.connect(filter);filter.connect(master);source.start();source.stop(now+span);sources.push(source);nodes.push(source,filter);
  if(!turning){
   const osc=ctx.createOscillator(),gain=ctx.createGain();
   osc.type=scene==='formula'?'sawtooth':scene==='valorant'?'triangle':'sine';
   const base=scene==='formula'?75:scene==='cinema'?48:scene==='football'?110:scene==='journey'?62:scene==='travel'?174:130;
   osc.frequency.setValueAtTime(base,now);osc.frequency.exponentialRampToValueAtTime(base*(scene==='formula'?3.2:1.04),now+8);osc.frequency.exponentialRampToValueAtTime(base,now+17);
   gain.gain.value=scene==='travel'?.07:.17;osc.connect(gain);gain.connect(master);osc.start();osc.stop(now+span);sources.push(osc);nodes.push(osc,gain);
   // Quiet, spaced environmental cues; no alarms or sharp stingers.
   for(let i=0;i<4;i++){
    const tone=ctx.createOscillator(),volume=ctx.createGain(),start=now+1.1+i*3.6;
    tone.type='sine';tone.frequency.value=scene==='travel'?1700+i*170:scene==='valorant'?440+i*110:220+i*27;
    volume.gain.setValueAtTime(0,start);volume.gain.linearRampToValueAtTime(scene==='travel'?.12:.055,start+.07);volume.gain.exponentialRampToValueAtTime(.001,start+.5);
    tone.connect(volume);volume.connect(master);tone.start(start);tone.stop(start+.6);sources.push(tone);nodes.push(tone,volume);
   }
  }
  const visibility=()=>{master.gain.cancelScheduledValues(ctx.currentTime);master.gain.setTargetAtTime(document.hidden?0:.025,ctx.currentTime,.08);};
  document.addEventListener('visibilitychange',visibility);
  return ()=>{document.removeEventListener('visibilitychange',visibility);sources.forEach(s=>{try{s.stop();}catch{}});nodes.forEach(n=>n.disconnect());};
 },[scene,enabled,open,turning,replay]);
 return {enabled,toggle};
}
