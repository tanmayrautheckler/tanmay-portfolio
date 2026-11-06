"use client";
/* Renderer-owned Three.js transforms are animated outside React state. */
/* eslint-disable react-hooks/immutability */
import {useEffect,useLayoutEffect,useMemo,useRef} from 'react';
import {useFrame,useThree} from '@react-three/fiber';
import {useTexture} from '@react-three/drei/core/Texture';
import * as THREE from 'three';
import content from './journal-content';
import type {JournalTurn} from './journal-types';
import {WorldWatch,AfterHours,CuriosityStudy} from './journal-interests';
import {RaceWeekend} from './journal-formula';
import {TradingDesk} from './journal-trading';
import {ValorantScene} from './journal-valorant';
import {SportsSpread} from './journal-sports';
import {useJournalSurface} from './journal-materials';
import {Airliner,OutdoorWorld,FootballCinema} from './journal-cinematic';
import {EMERGENCE_SECONDS,OUTDOOR_EMERGENCE_SECONDS,incomingReveal,layerReveal,outdoorLayerReveal,outgoingReveal,smoothRange,turnProgress,type JournalLayer} from './journal-timeline';
const GOLD='#b89753';
type Point=[number,number,number];
type Props={spread:number;replay:number;turn:JournalTurn|null;phase:React.RefObject<{value:number}>;active:boolean;onMemory:(index:number)=>void};
function Photo({src,width,height,position,angle=0,onClick}:{src:string;width:number;height:number;position:Point;angle?:number;onClick:()=>void}) {
  const texture=useTexture(src);
  const {gl}=useThree();
  useEffect(()=>{texture.colorSpace=THREE.SRGBColorSpace;texture.needsUpdate=true;},[texture]);
  useEffect(()=>()=>{gl.domElement.style.cursor='';},[gl]);
  return <group position={position} rotation={[-.32,angle,0]}
    onPointerDown={e=>e.stopPropagation()} onClick={e=>{e.stopPropagation();onClick();}}
    onPointerOver={e=>{e.stopPropagation();gl.domElement.style.cursor='zoom-in';}}
    onPointerOut={()=>{gl.domElement.style.cursor='';}}>
    <mesh position={[0,height/2,0]} castShadow receiveShadow><boxGeometry args={[width+.09,height+.16,.025]}/><meshStandardMaterial color="#fffaec" roughness={.94}/></mesh>
    <mesh position={[0,height/2+.025,.015]}><planeGeometry args={[width,height]}/><meshBasicMaterial map={texture} toneMapped={false}/></mesh>
    <mesh position={[0,.03,-.035]} rotation={[.32,0,0]}><boxGeometry args={[width*.65,.045,.25]}/><meshStandardMaterial color="#d2c3a1"/></mesh>
  </group>;
}

function Gateway() {
 const stone=useJournalSurface('rock',[2.6,2.6],.2);
 const arch=useMemo(()=>{
  const shape=new THREE.Shape();shape.moveTo(-.77,0);shape.lineTo(.77,0);shape.lineTo(.77,.82);shape.lineTo(-.77,.82);shape.closePath();
  const hole=new THREE.Path();hole.moveTo(-.22,0);hole.lineTo(-.22,.4);hole.absarc(0,.4,.22,Math.PI,0,true);hole.lineTo(.22,0);hole.closePath();shape.holes.push(hole);
  return new THREE.ExtrudeGeometry(shape,{depth:.23,bevelEnabled:true,bevelSize:.015,bevelThickness:.012,bevelSegments:2});
 },[]);
 useEffect(()=>()=>arch.dispose(),[arch]);
 return <group position={[-1.7,.04,.08]} rotation={[0,.06,0]}>
  <mesh geometry={arch} castShadow receiveShadow><meshStandardMaterial {...stone} color="#dac6ac" roughness={.95}/></mesh>
  <mesh position={[0,.84,.115]} castShadow><boxGeometry args={[1.65,.075,.34]}/><meshStandardMaterial {...stone} color="#e4d1b3" roughness={.95}/></mesh>
  {[-.64,.64].map(x=><group key={x} position={[x,0,.115]}>
   <mesh position={[0,.53,0]} castShadow><boxGeometry args={[.21,1.06,.33]}/><meshStandardMaterial {...stone} color="#d3b794" roughness={.95}/></mesh>
   <mesh position={[0,1.085,0]} castShadow><sphereGeometry args={[.16,24,16,0,Math.PI*2,0,Math.PI/2]}/><meshStandardMaterial {...stone} color="#d8c1a2" roughness={.9}/></mesh>
   <mesh position={[0,1.21,0]}><coneGeometry args={[.025,.09,8]}/><meshStandardMaterial color={GOLD} roughness={.55} metalness={.2}/></mesh>
  </group>)}
  {[.15,.3,.45,.6,.73].map(y=><mesh key={y} position={[0,y,.237]}><boxGeometry args={[1.5,.009,.006]}/><meshStandardMaterial color="#9c815c" roughness={1}/></mesh>)}
  <mesh position={[0,.035,.14]} receiveShadow><boxGeometry args={[1.95,.07,.74]}/><meshStandardMaterial color="#d4b990" roughness={.94}/></mesh>
 </group>;
}

function Journey({time,onMemory}:{time:React.RefObject<{t:number}>;onMemory:(index:number)=>void}) {
 const rock=useJournalSurface('rock',[1.8,1.8],.35),ground=useJournalSurface('ground',[3,3],.16);
 const route=useMemo(()=>new THREE.CatmullRomCurve3([new THREE.Vector3(-1.6,.07,.85),new THREE.Vector3(-.72,.15,1.13),new THREE.Vector3(.2,.2,1.35),new THREE.Vector3(1.05,.15,1.1),new THREE.Vector3(1.85,.08,.75)]),[]);
 const skyline=[[-2.6,.54,.2],[-2.28,.78,.22],[-1.98,.43,.25],[-1.65,.9,.17],[-1.3,.61,.23],[-.98,.4,.2],[-.65,.67,.22]];
 return <group name="mumbai-to-phoenix-world">
  <group userData={{journalLayer:'terrain',revealOrder:0}}>
   <mesh position={[-1.65,.018,-.65]} rotation={[-Math.PI/2,0,0]} receiveShadow><planeGeometry args={[2.75,1.75]}/><meshStandardMaterial color="#456c70" roughness={.43} metalness={.16}/></mesh>
   {Array.from({length:8},(_,i)=><mesh key={i} position={[-1.65,.022,-1.25+i*.15]} rotation={[-Math.PI/2,0,0]}><planeGeometry args={[2.5-i*.07,.008]}/><meshBasicMaterial color="#9daf9b" transparent opacity={.25}/></mesh>)}
   {skyline.map(([x,h,w],i)=><group key={x} position={[x,0,-1.17]}>
    <mesh position={[0,h/2,0]} castShadow receiveShadow><boxGeometry args={[w,h,.2]}/><meshStandardMaterial color={i%2?'#9c917f':'#baa98a'} roughness={.92}/></mesh>
    {Array.from({length:Math.floor(h/.1)},(_,j)=><mesh key={j} position={[0,.08+j*.1,.103]}><boxGeometry args={[w*.57,.025,.003]}/><meshStandardMaterial color="#d0c3a4" roughness={.8}/></mesh>)}
   </group>)}
   <Gateway/>
  </group>
  <group userData={{journalLayer:'terrain',revealOrder:2}}>
   <mesh position={[1.66,.032,-.48]} scale={[1,.04,.68]} receiveShadow><sphereGeometry args={[1.4,36,20]}/><meshStandardMaterial {...ground} color="#d4b594" roughness={1}/></mesh>
   {[[-.15,.5,.42],[.48,.79,.5],[1.02,.48,.47]].map(([x,h,w],i)=><mesh key={i} position={[1.35+x,h*.5,-1.12]} rotation={[.2,i*.3,.09]} scale={[w,h,w*.7]} castShadow receiveShadow><dodecahedronGeometry args={[1,1]}/><meshStandardMaterial {...rock} color={i%2?'#ce9e80':'#d5ae90'} roughness={1}/></mesh>)}
   {[[-.7,.75,.3],[.2,1.05,.1],[.9,.55,.8]].map(([x,h,z],i)=><group key={i} position={[1.68+x,.045,z-.44]}>
    <mesh position={[0,h*.5,0]} castShadow><capsuleGeometry args={[.055,h-.11,4,10]}/><meshStandardMaterial color="#627759" roughness={.95}/></mesh>
    {[-1,1].map((side,j)=><group key={side} position={[side*.1,h*(.43+j*.15),0]}>
     <mesh rotation={[0,0,Math.PI/2]} castShadow><capsuleGeometry args={[.033,.13,3,8]}/><meshStandardMaterial color="#627759" roughness={.95}/></mesh>
     <mesh position={[side*.085,.09,0]} castShadow><capsuleGeometry args={[.033,.18,3,8]}/><meshStandardMaterial color="#627759" roughness={.95}/></mesh>
    </group>)}
   </group>)}
  </group>
  <group userData={{journalLayer:'actors',revealOrder:1}}>
   <mesh castShadow><tubeGeometry args={[route,64,.025,8,false]}/><meshStandardMaterial color="#c3a266" roughness={.65} metalness={.15}/></mesh>
   {[-1.58,1.85].map(x=><mesh key={x} position={[x,.08,.82]} rotation={[-Math.PI/2,0,0]}><ringGeometry args={[.08,.1,32]}/><meshStandardMaterial color={GOLD} metalness={.25} roughness={.5}/></mesh>)}
   <Photo src="/images/about/gallery/bmw.webp" width={.94} height={.68} position={[-2.12,.03,1.44]} angle={.08} onClick={()=>onMemory(0)}/>
  </group>
  <Airliner time={time}/>
 </group>;
}

type FadeMaterial={material:THREE.Material;opacity:number;transparent:boolean};
type LayerTransform={object:THREE.Object3D;layer:JournalLayer;order:number;y:number;scaleY:number;rotationX:number;rotationZ:number;mode:string;depth:number;hingeAxis:string;hingeAngle:number;fades:FadeMaterial[]};

/** A short ink construction on the paper, then the physical world takes over.
 * The lines live in the same 3D space as the sheet, not in a UI overlay. */
function InkContours({scene,reveal}:{scene:string;reveal:React.RefObject<{value:number}>}) {
 const material=useRef<THREE.LineBasicMaterial>(null);
 const geometry=useMemo(()=>{
  const positions:number[]=[];
  const path=(points:[number,number][])=>{for(let i=1;i<points.length;i++){positions.push(points[i-1][0],.014,points[i-1][1],points[i][0],.014,points[i][1]);}};
  if(scene==='football'){
   path([[-2.7,-1.55],[2.7,-1.55],[2.7,1.55],[-2.7,1.55],[-2.7,-1.55]]);path([[0,-1.55],[0,1.55]]);
   path(Array.from({length:49},(_,i)=>[Math.cos(i/48*Math.PI*2)*.5,Math.sin(i/48*Math.PI*2)*.5]));
  }else if(scene==='formula'){
   for(let ring=0;ring<2;ring++)path(Array.from({length:81},(_,i)=>{const a=i/80*Math.PI*2;return [Math.cos(a)*(2.55-ring*.13)+Math.sin(a*3)*.25,Math.sin(a)*(1.32-ring*.13)+Math.cos(a*2)*.2];}));
  }else if(scene==='travel'){
   path(Array.from({length:61},(_,i)=>{const z=-.5+i/60*2.09;return [.08+Math.sin((z+.2)*2.1)*.22,z];}));
   const route=new THREE.CatmullRomCurve3([new THREE.Vector3(-2.6,0,1.23),new THREE.Vector3(-1.65,0,.97),new THREE.Vector3(-.55,0,1.18),new THREE.Vector3(.45,0,1.28),new THREE.Vector3(1.45,0,1),new THREE.Vector3(2.65,0,1.43)]);
   path(Array.from({length:61},(_,i)=>{const p=route.getPoint(i/60);return [p.x,p.z];}));
   path([[-2.7,-.8],[-1.8,-1.45],[-.6,-1.63],[.3,-1.1]]);
  }else{
   for(let line=0;line<9;line++)path(Array.from({length:61},(_,i)=>{const x=-2.83+i/60*5.66;return [x,-1.7+line*.39+Math.sin(x*1.65+line*.37)*.16+Math.cos(x*2.8-line)*.06];}));
  }
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));g.setDrawRange(0,0);return g;
 },[scene]);
 useEffect(()=>()=>geometry.dispose(),[geometry]);
 useFrame(()=>{
  const p=reveal.current.value;
  const count=Math.floor(geometry.attributes.position.count*smoothRange(p,0,.32)/2)*2;
  geometry.setDrawRange(0,count);
  if(material.current)material.current.opacity=.43*(1-smoothRange(p,.38,.9));
 });
 return <lineSegments geometry={geometry} renderOrder={1}><lineBasicMaterial ref={material} color="#8d7953" transparent opacity={0} depthWrite={false}/></lineSegments>;
}

export default function LivingSpread({spread,replay,turn,phase,active,onMemory}:Props) {
 const root=useRef<THREE.Group>(null),world=useRef<THREE.Group>(null),motion=useRef({t:0}),reveal=useRef({value:0});
 const layers=useRef<LayerTransform[]>([]),lastTurn=useRef<number|null>(null),foldFrom=useRef(1);
 const {invalidate}=useThree();
 const scene=content.spreads[spread-1].scene;
 const outdoors=scene==='travel';
 useEffect(()=>{motion.current.t=0;reveal.current.value=0;invalidate();},[replay,invalidate]);
 useLayoutEffect(()=>{
  if(!world.current)return;
  const found:LayerTransform[]=[],clipped=new Map<THREE.Material,{planes:THREE.Plane[]|null;shadows:boolean;clipping?:boolean}>();
  const paperPlane=new THREE.Plane(new THREE.Vector3(0,1,0),-.205);
  const record=(object:THREE.Object3D,layer:JournalLayer):LayerTransform=>{
   const fades:FadeMaterial[]=[];
   object.traverse(child=>{
    if(!(child instanceof THREE.Mesh))return;
    for(const material of Array.isArray(child.material)?child.material:[child.material]){
     if(outdoors&&!clipped.has(material)){
      clipped.set(material,{planes:material.clippingPlanes,shadows:material.clipShadows,clipping:material instanceof THREE.ShaderMaterial?material.clipping:undefined});
      material.clippingPlanes=[...(material.clippingPlanes??[]),paperPlane];material.clipShadows=true;
      if(material instanceof THREE.ShaderMaterial)material.clipping=true;
      material.needsUpdate=true;
     }
     if(outdoors&&(layer==='atmosphere'||object.userData.journalReveal==='fade')&&!fades.some(item=>item.material===material))fades.push({material,opacity:material.opacity,transparent:material.transparent});
    }
   });
   return {object,layer,order:Number(object.userData.revealOrder??0),y:object.position.y,scaleY:object.scale.y,rotationX:object.rotation.x,rotationZ:object.rotation.z,mode:String(object.userData.journalReveal??(layer==='atmosphere'?'fade':'rise')),depth:Number(object.userData.journalRiseDepth??(layer==='terrain'?2.25:1.3)),hingeAxis:String(object.userData.journalHingeAxis??'x'),hingeAngle:Number(object.userData.journalHingeAngle??-Math.PI/2),fades};
  };
  const visit=(object:THREE.Object3D)=>{
   const layer=object.userData.journalLayer as JournalLayer|undefined;
   if(layer){found.push(record(object,layer));return;}
   object.children.forEach(visit);
  };
  visit(world.current);
  if(!found.length)found.push(record(world.current,'terrain'));
  layers.current=found;
  return ()=>{
   for(const item of found)for(const saved of item.fades){saved.material.opacity=saved.opacity;saved.material.transparent=saved.transparent;if(saved.material instanceof THREE.ShaderMaterial&&saved.material.uniforms.uReveal)saved.material.uniforms.uReveal.value=1;}
   for(const [material,saved] of clipped){material.clippingPlanes=saved.planes;material.clipShadows=saved.shadows;if(material instanceof THREE.ShaderMaterial)material.clipping=saved.clipping??false;material.needsUpdate=true;}
  };
 },[scene,outdoors]);
 useEffect(()=>{if(active)invalidate();},[active,invalidate]);
 useFrame(({pointer},delta)=>{
  if(!root.current||!active)return;
  if(turn){
   if(lastTurn.current!==turn.id){lastTurn.current=turn.id;foldFrom.current=reveal.current.value;}
   const progress=turnProgress(phase.current.value,turn.from,turn.to);
   if(turn.from===spread)reveal.current.value=foldFrom.current*outgoingReveal(progress);
   else reveal.current.value=incomingReveal(progress);
  }else{
   lastTurn.current=null;
   reveal.current.value=Math.min(1,reveal.current.value+Math.min(delta,outdoors ? .1 : .25)/(outdoors?OUTDOOR_EMERGENCE_SECONDS:EMERGENCE_SECONDS));
  }
  const value=reveal.current.value;
  root.current.visible=value>.0001;
  root.current.rotation.y=THREE.MathUtils.damp(root.current.rotation.y,outdoors?0:pointer.x*.012,5,Math.min(delta,.05));
  for(const item of layers.current){
   const amount=outdoors?outdoorLayerReveal(value,item.layer,item.order):layerReveal(value,item.layer,item.order);
   item.object.visible=amount>.001;
   if(outdoors){
    item.object.scale.y=item.scaleY;
    item.object.position.y=item.y-(item.mode==='rise'?(1-amount)*item.depth:0);
    item.object.rotation.x=item.rotationX+(item.mode==='hinge'&&item.hingeAxis==='x'?(1-amount)*item.hingeAngle:0);
    item.object.rotation.z=item.rotationZ+(item.mode==='hinge'&&item.hingeAxis==='z'?(1-amount)*item.hingeAngle:0);
    const fade=item.object.userData.journalFastFade?Math.min(1,amount*4):amount;
    for(const saved of item.fades){
     const material=saved.material,transparent=saved.transparent||fade<.999;
     material.opacity=saved.opacity*fade;
     if(material.transparent!==transparent){material.transparent=transparent;material.needsUpdate=true;}
     if(material instanceof THREE.ShaderMaterial&&material.uniforms.uReveal)material.uniforms.uReveal.value=fade;
    }
   }else{
    item.object.scale.y=item.scaleY*Math.max(.001,amount);
    item.object.position.y=item.y*amount;
    item.object.rotation.x=item.rotationX-(1-amount)*.18;
   }
  }
  // Freeze a departing scene before folding. The incoming scene keeps the same
  // clock and object roots when the sheet commits, so neither can jump/reset.
  if(value>(outdoors ? .985 : .62)&&(!turn||turn.to===spread))motion.current.t+=Math.min(delta,.05);
  if(value>.0001||!turn)invalidate();
 });
 return <group ref={root} position={[0,.21,0]} visible={false}>
  <InkContours scene={scene} reveal={reveal}/>
  <group ref={world}>
   {scene==='journey'?<Journey time={motion} onMemory={onMemory}/>:scene==='travel'?<OutdoorWorld time={motion}/>:scene==='sports'?<SportsSpread time={motion}/>:scene==='football'?<FootballCinema time={motion}/>:scene==='formula'?<RaceWeekend time={motion}/>:scene==='markets'?<TradingDesk time={motion}/>:scene==='world'?<WorldWatch time={motion} variant="world"/>:scene==='valorant'?<ValorantScene time={motion}/>:scene==='cinema'?<AfterHours time={motion} variant="cinema"/>:<CuriosityStudy time={motion}/>}
  </group>
 </group>;
}
