"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Pause, Play, MoveUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useReducedMotion } from "framer-motion";
import { Mesh, OrthographicCamera, PlaneGeometry, Scene, ShaderMaterial, Vector2, WebGLRenderer } from "three";

// Transparent, GPU-rendered atmosphere. The photograph remains visible if WebGL is unavailable.
const fragmentShader = `
precision mediump float;
uniform float time;
uniform vec2 pointer;
varying vec2 uvScene;
float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hash(i),hash(i+vec2(1.,0.)),f.x),mix(hash(i+vec2(0.,1.)),hash(i+vec2(1.,1.)),f.x),f.y);}
float cloud(vec2 p){return .57*noise(p)+.28*noise(p*2.03)+.15*noise(p*4.07);}
void main(){
 vec2 uv=uvScene;
 float t=time*.035;
 float mist=cloud(uv*vec2(5.,3.)+vec2(t,-t*.35)+pointer*.08);
 float horizon=exp(-pow((uv.y-.43)*5.,2.));
 float beam=0.;
 for(int i=0;i<3;i++){
  float x=.12+float(i)*.38;
  float centre=x+(1.-uv.y)*(.18*sin(time*.09+float(i)*2.));
  float width=.018+(1.-uv.y)*.12;
  beam+=exp(-pow((uv.x-centre)/width,2.))*smoothstep(.15,.92,uv.y)*.075;
 }
 float alpha=(mist*.11*horizon+beam*mist);
 gl_FragColor=vec4(vec3(.69,.79,.85),alpha);
}`;

export function LivingStadium(){
 const root=useRef<HTMLDivElement>(null),layer=useRef<HTMLDivElement>(null),canvas=useRef<HTMLCanvasElement>(null);
 const pointer=useRef({x:0,y:0}),pausedRef=useRef(false),resume=useRef<()=>void>(()=>{});
 const reduced=useReducedMotion();
 const [paused,setPaused]=useState(false),[lights,setLights]=useState(true);
 useEffect(()=>{
  const host=root.current,photo=layer.current,target=canvas.current;
  if(!host||!photo||!target)return;
  let renderer:WebGLRenderer|undefined;
  try{renderer=new WebGLRenderer({canvas:target,alpha:true,antialias:false,powerPreference:"low-power"});}catch{return;}
  renderer.setPixelRatio(Math.min(window.devicePixelRatio,1.5));
  const scene=new Scene(),camera=new OrthographicCamera(-1,1,1,-1,0,2);
  camera.position.z=1;
  const material=new ShaderMaterial({transparent:true,depthWrite:false,uniforms:{time:{value:0},pointer:{value:new Vector2()}},vertexShader:"varying vec2 uvScene;void main(){uvScene=uv;gl_Position=vec4(position,1.);}",fragmentShader});
  const geometry=new PlaneGeometry(2,2);scene.add(new Mesh(geometry,material));
  let inView=true,frame=0,last=0,elapsed=0,x=0,y=0,stillRendered=false;
  const schedule=()=>{if(!frame)frame=requestAnimationFrame(draw);};
  const draw=(now:number)=>{
   frame=0;
   if(!inView||document.hidden||pausedRef.current||(reduced&&stillRendered))return;
   const delta=Math.min((now-last)/1000,.08);last=now;
   if(!reduced)elapsed+=delta;
   x+=(pointer.current.x-x)*.035;y+=(pointer.current.y-y)*.035;
   photo.style.transform=reduced?'scale(1.045)':`scale(1.065) translate3d(${x*10+Math.sin(elapsed*.09)*3}px,${y*6}px,0)`;
   material.uniforms.time.value=elapsed;material.uniforms.pointer.value.set(x,y);
   renderer?.render(scene,camera);stillRendered=true;
   if(!reduced)schedule();
  };
  resume.current=schedule;
  const resize=new ResizeObserver(()=>{renderer?.setSize(host.clientWidth,host.clientHeight,false);stillRendered=false;schedule();});resize.observe(host);
  const observer=new IntersectionObserver(([entry])=>{inView=entry.isIntersecting;if(inView)schedule();});observer.observe(host);
  const visibility=()=>{if(!document.hidden)schedule();};document.addEventListener("visibilitychange",visibility);
  schedule();
  return()=>{cancelAnimationFrame(frame);resume.current=()=>{};document.removeEventListener("visibilitychange",visibility);resize.disconnect();observer.disconnect();geometry.dispose();material.dispose();renderer?.dispose();renderer?.forceContextLoss();};
 },[reduced]);
 function togglePause(){pausedRef.current=!pausedRef.current;setPaused(pausedRef.current);if(!pausedRef.current)resume.current();}
 return <div className="living-stadium" ref={root} data-lights={lights} onPointerMove={event=>{const box=event.currentTarget.getBoundingClientRect();pointer.current={x:(event.clientX-box.left)/box.width-.5,y:(event.clientY-box.top)/box.height-.5};}} onPointerLeave={()=>{pointer.current={x:0,y:0};}}>
  <div className="stadium-photograph" ref={layer}><Image src="/images/about/stadium-night.webp" alt="Cinematic view across a floodlit football stadium, with a ball on the grass" fill sizes="(max-width:700px) 100vw, 1060px" priority/><div className="stadium-grade"/></div>
  <canvas ref={canvas} className="stadium-atmosphere" aria-hidden="true"/>
  <div className="stadium-specks" aria-hidden="true">{Array.from({length:16},(_,i)=><i key={i} style={{left:`${(i*37)%100}%`,top:`${(i*23)%65}%`,animationDelay:`${-i*1.7}s`,animationDuration:`${13+i%5}s`,animationPlayState:paused?"paused":"running"}}/>)}</div>
  <header className="stadium-topline"><span><i/>AFTER THE FINAL WHISTLE</span><Button variant="ghost" size="icon" onClick={togglePause} aria-label={paused?"Play stadium atmosphere":"Pause stadium atmosphere"}>{paused?<Play size={16}/>:<Pause size={16}/>}</Button></header>
  <div className="stadium-number" aria-hidden="true">10</div>
  <div className="stadium-story"><span>FC BARCELONA / LIONEL MESSI</span><h3>Barça. Messi.<br/><em>Match day.</em></h3><p>Barça is my team. Messi is my player.<br/>Football is how I switch off.</p><Button variant="ghost" onClick={()=>setLights(value=>!value)} aria-pressed={!lights}>Change the atmosphere<MoveUpRight size={14}/></Button></div>
  <div className="stadium-bottom"><span>MATCH DAY, IN MY OWN WORLD</span><span>{reduced?"STILL VIEW":paused?"SCENE PAUSED":"MOVE YOUR POINTER TO LOOK AROUND"}</span></div>
 </div>;
}
