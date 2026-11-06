"use client";

/* R3F intentionally mutates its owned Three.js camera, geometry and textures
 * inside the render loop. These objects are not React state. */
/* eslint-disable react-hooks/immutability */

import { Component, Suspense, type ReactNode, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree, type ThreeEvent } from "@react-three/fiber";
import { RoundedBox } from "@react-three/drei/core/RoundedBox";
import { useTexture } from "@react-three/drei/core/Texture";
import { gsap } from "gsap";
import * as THREE from "three";
import {RoomEnvironment} from 'three/examples/jsm/environments/RoomEnvironment.js';
import type { JournalDirection, JournalTurn } from "./journal-types";
import content from "./journal-content";
import {paperUrls,spreadAssets} from './journal-assets';
import {supportsJournal3D} from "./journal-capabilities";
import { pagePosition } from "./journal-math";
import LivingSpread from "./journal-popups";
import {sheetPhase} from "./journal-timeline";

let graphicsSupport: Promise<boolean>|undefined;
const checkGraphics = () => graphicsSupport ??= Promise.resolve().then(()=>supportsJournal3D(document.createElement('canvas')));

const WIDTH = 3.15;
const HEIGHT = 4.4;
const PAGE_Y = .195;
const ASSETS = "/images/about/journal/";
type Props = {
  preparingSpread:number;
  living: boolean;
  replay: number;
  spread: number;
  turn: JournalTurn | null;
  onComplete: (spread: number) => void;
  onReady: () => void;
  onPagesReady: (loaded:number[]) => void;
  onPagesFailed: (spread:number) => void;
  onFailure: (reason?: "webgl-unavailable" | "context-lost") => void;
  onMemory: (index: number) => void;
  onNavigate: (direction: JournalDirection) => void;
  onDragStart: (x: number, direction: JournalDirection) => void;
  onDragMove: (x: number) => void;
  onDragEnd: (cancelled?: boolean) => void;
};

function CameraRig({ open,living,active }: { open: boolean;living:boolean;active:boolean }) {
  const { camera, size, pointer, invalidate } = useThree();
  const last = useRef([0,0,0,0,0]),look=useRef(.2),initialized=useRef(false);
  const framed=useRef(28);
  useLayoutEffect(() => {
    const perspective=camera as THREE.PerspectiveCamera;
    const y=open&&living?7.7:11,z=open&&living?9.6:5.9,target=open&&living?1:.2;
    const distance=Math.hypot(y-target,z);
    const vertical=(open&&living?4.9:5.7)*size.height/Math.max(220,size.height-(open&&living?100:0));
    const horizontal=size.width<900?(open?7.3:4.8):8.6;
    framed.current=THREE.MathUtils.radToDeg(2*Math.atan(Math.max(vertical,horizontal/(size.width/size.height))/(2*distance)));
    // Correct projection precedes the first visible frame, avoiding a late
    // replacement cover. Later changes travel with the physical opening.
    if(!initialized.current){
      perspective.fov=framed.current;perspective.position.set(0,y,z);
      look.current=target;perspective.lookAt(0,target,0);
      perspective.updateProjectionMatrix();initialized.current=true;
    }
    invalidate();
  }, [camera, size.width, size.height, open, living, invalidate]);
  useFrame((_, delta) => {
    if (!active) return;
    const perspective=camera as THREE.PerspectiveCamera,dt=Math.min(delta,.1);
    const x = pointer.x * (open ? (living ? .18 : .07) : .22);
    const z = (open&&living?9.6:5.9) + pointer.y * .08;
    const y = open&&living?7.7:11;
    camera.position.x = THREE.MathUtils.damp(camera.position.x,x,7,dt);
    camera.position.y = THREE.MathUtils.damp(camera.position.y,y,7,dt);
    camera.position.z = THREE.MathUtils.damp(camera.position.z,z,7,dt);
    look.current=THREE.MathUtils.damp(look.current,open&&living?1:.2,7,dt);
    perspective.fov=THREE.MathUtils.damp(perspective.fov,framed.current,7,dt);
    perspective.updateProjectionMatrix();camera.lookAt(0,look.current,0);
    const current=[camera.position.x,camera.position.z,camera.position.y,perspective.fov,look.current];
    if(current.some((value,index)=>Math.abs(value-last.current[index])>.0001))invalidate();
    last.current=current;
  });
  return null;
}

/** A prefiltered studio reflection environment, generated once on the GPU.
 * No remote HDR or extra render pass is needed during page animation. */
function StudioLight(){
  const {gl,scene,invalidate}=useThree();
  useEffect(()=>{
    const room=new RoomEnvironment(),generator=new THREE.PMREMGenerator(gl);
    const environment=generator.fromScene(room,.04,.1,100,{size:128});
    const previous=scene.environment,previousIntensity=scene.environmentIntensity;
    scene.environment=environment.texture;scene.environmentIntensity=.55;
    room.dispose();generator.dispose();invalidate();
    return ()=>{scene.environment=previous;scene.environmentIntensity=previousIntensity;environment.dispose();};
  },[gl,scene,invalidate]);
  return null;
}

function PrintedPage({ map, side }: { map: THREE.Texture; side: 'left' | 'right' }) {
  return <mesh position={[side === 'left' ? -WIDTH / 2 : WIDTH / 2, PAGE_Y, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
    <planeGeometry args={[WIDTH, HEIGHT, 12, 12]} />
    <meshStandardMaterial map={map} roughness={.96} metalness={0} />
  </mesh>;
}

/** A real curved sheet. Vertices follow the hinge and curl progressively toward
 * the free edge; front and back use separate printed pages, with corrected UVs. */
function TurningPage({ front, back, phase }: { front: THREE.Texture; back: THREE.Texture; phase: React.RefObject<{ value: number }> }) {
  const geometry = useMemo(() => {
    const plane = new THREE.PlaneGeometry(WIDTH, HEIGHT, 56, 14);
    plane.rotateX(-Math.PI / 2);
    plane.translate(WIDTH / 2, 0, 0);
    return plane;
  }, []);
  const base = useMemo(() => Float32Array.from(geometry.attributes.position.array), [geometry]);
  const reverse = useMemo(() => {
    const copy = back.clone();
    copy.wrapS = THREE.RepeatWrapping;
    copy.repeat.x = -1;
    copy.offset.x = 1;
    copy.needsUpdate = true;
    return copy;
  }, [back]);
  useEffect(() => () => { geometry.dispose(); }, [geometry]);
  useEffect(() => () => reverse.dispose(), [reverse]);
  useFrame(() => {
    const positions = geometry.attributes.position;
    for (let i = 0; i < positions.count; i++) {
      const u = base[i * 3] / WIDTH;
      const z = base[i * 3 + 2];
      const point = pagePosition(u, z, phase.current.value, WIDTH, HEIGHT);
      positions.setXYZ(i, point[0], point[1], point[2]);
    }
    positions.needsUpdate = true;
    geometry.computeVertexNormals();
  });
  return <group>
    <mesh geometry={geometry} castShadow receiveShadow>
      <meshStandardMaterial map={front} roughness={.9} side={THREE.FrontSide} />
    </mesh>
    <mesh geometry={geometry} castShadow receiveShadow>
      <meshStandardMaterial map={reverse} roughness={.9} side={THREE.BackSide} />
    </mesh>
  </group>;
}

function PageBlock({ side }: { side: 'left' | 'right' }) {
  const x = side === 'left' ? -WIDTH / 2 : WIDTH / 2;
  return <group>
    <RoundedBox args={[WIDTH + .14, .075, HEIGHT + .16]} radius={.035} smoothness={3} position={[x, .012, 0]} castShadow receiveShadow>
      <meshStandardMaterial color="#203a32" roughness={.74} />
    </RoundedBox>
    <RoundedBox args={[WIDTH - .015, .13, HEIGHT - .015]} radius={.015} smoothness={2} position={[x, .115, 0]} castShadow receiveShadow>
      <meshStandardMaterial color="#dcd4bd" roughness={1} />
    </RoundedBox>
    {Array.from({length: 10}, (_, i) => <mesh key={i} position={[x, .066 + i * .011, HEIGHT / 2]}>
      <boxGeometry args={[WIDTH - .025, .0014, .006]} />
      <meshStandardMaterial color={i % 3 ? '#b4ac97' : '#f4edda'} roughness={1} />
    </mesh>)}
  </group>;
}

/** Speculative neighbour loading is isolated from the visible renderer. An
 * unavailable image must not dismantle an otherwise healthy current spread. */
class PreparationBoundary extends Component<{spread:number;onFailure:(spread:number)=>void;children:ReactNode},{failed:boolean}> {
  state={failed:false};
  static getDerivedStateFromError(){return {failed:true};}
  componentDidCatch(){this.props.onFailure(this.props.spread);}
  render(){return this.state.failed?null:this.props.children;}
}

function PrepareTexture({url}:{url:string}) {
  useTexture(url);
  return null;
}
function SpreadReady({spread,onReady}:{spread:number;onReady:(loaded:number[])=>void}) {
  useEffect(()=>onReady([spread]),[spread,onReady]);return null;
}
function PreparePaper({spread,onReady}:{spread:number;onReady:(loaded:number[])=>void}) {
  return <>{spreadAssets(spread).map(url=><PrepareTexture key={url} url={url}/>)}<SpreadReady spread={spread} onReady={onReady}/></>;
}

function BookPaper({spread,turn,motion,living}:{spread:number;turn:JournalTurn|null;motion:React.RefObject<{value:number}>;living:boolean}) {
  const {gl,invalidate}=useThree();
  const left=useRef<THREE.Group>(null);
  const isCover=!!turn&&(turn.from===0||turn.to===0);
  const from=Math.max(1,turn?.from??spread),to=Math.max(1,turn?.to??spread);
  const forward=(turn?.to??spread)>(turn?.from??spread);
  const cover=turn?.from===0?to:from;
  const leftIndex=isCover?cover:turn&&!forward?to:from;
  const rightIndex=isCover?cover:turn&&forward?to:from;
  const leftFront=useTexture(paperUrls(leftIndex,living)[0]),leftBack=useTexture(paperUrls(leftIndex,living)[1]);
  const rightFront=useTexture(paperUrls(rightIndex,living)[0]),rightBack=useTexture(paperUrls(rightIndex,living)[1]);
  const pages=useMemo(()=>[leftFront,leftBack,rightFront,rightBack],[leftFront,leftBack,rightFront,rightBack]);
  useEffect(()=>{
    pages.forEach(map=>{map.colorSpace=THREE.SRGBColorSpace;map.anisotropy=Math.min(8,gl.capabilities.getMaxAnisotropy());map.needsUpdate=true;});
    invalidate();
  },[pages,gl,invalidate]);
  useFrame(()=>{if(left.current)left.current.visible=(isCover?motion.current.value:spread>0?1:0)>.55;});
  return <>
    <PrintedPage side="right" map={rightBack}/>
    <group ref={left} visible={false}><PageBlock side="left"/><PrintedPage side="left" map={leftFront}/></group>
    {turn&&!isCover&&<TurningPage phase={motion} front={leftBack} back={rightFront}/>}
  </>;
}

function Book(props: Props & {active:boolean}) {
  const { spread, turn, onComplete, onReady, onDragStart, onDragMove, onDragEnd, onNavigate } = props;
  const textures = useTexture([ASSETS+'cover.webp',ASSETS+'cloth.png']);
  const { invalidate, gl } = useThree();
  const root = useRef<THREE.Group>(null);
  const cover = useRef<THREE.Group>(null);
  const motion = useRef({ value: 0 });
  const paperMotion = useRef({ value: 0 });
  const turnTween = useRef<gsap.core.Tween|null>(null);
  const rendering = useRef(props.active);
  const activeDrag = useRef(false);
  const activePointer = useRef<number|null>(null);
  const dragMoved = useRef(false);
  const dragOrigin = useRef(0);
  const prepared = useRef(false);
  const announced = useRef(false);
  const readyFrame = useRef<number|null>(null);
  const isCover = !!turn && (turn.from === 0 || turn.to === 0);
  const forward = (turn?.to ?? spread) > (turn?.from ?? spread);
  const coverMap = textures[0];
  const cloth = textures[textures.length-1];
  useEffect(() => {
    textures.forEach(texture => { texture.colorSpace = THREE.SRGBColorSpace; texture.anisotropy = Math.min(8, gl.capabilities.getMaxAnisotropy()); texture.needsUpdate = true; });
    cloth.colorSpace = THREE.NoColorSpace;
    cloth.wrapS = cloth.wrapT = THREE.RepeatWrapping;
    cloth.repeat.set(6, 8);
    prepared.current = true;
    invalidate();
  }, [textures, cloth, gl, invalidate]);
  useEffect(() => () => {
    if (readyFrame.current !== null) cancelAnimationFrame(readyFrame.current);
    announced.current = false;
  }, []);
  useEffect(() => {
    if (!turn) return;
    if (turn.manual) {
      motion.current.value = turn.progress ?? (forward ? 0 : 1);
      invalidate();
      return;
    }
    motion.current.value = turn.progress ?? (forward ? 0 : 1);
    const destination = turn.cancelled ? (forward ? 0 : 1) : (forward ? 1 : 0);
    const tween = gsap.to(motion.current, {
      value: destination,
      duration: Math.max(.26, (isCover ? 1.75 : 1.4) * Math.abs(destination - motion.current.value)),
      ease: 'power2.inOut',
      onUpdate: () => {if(rendering.current)invalidate();},
      onComplete: () => onComplete(turn.cancelled ? turn.from : turn.to),
    });
    turnTween.current=tween;
    if(!rendering.current)tween.pause();
    return () => { tween.kill();turnTween.current=null; };
  }, [turn, forward, isCover, invalidate, onComplete]);
  useEffect(()=>{
    rendering.current=props.active;
    if(props.active){turnTween.current?.resume();invalidate();}
    else turnTween.current?.pause();
  },[props.active,invalidate]);
  useFrame(() => {
    paperMotion.current.value=turn?sheetPhase(motion.current.value,turn.from,turn.to):spread>0?1:0;
    const opened = isCover ? paperMotion.current.value : (spread > 0 ? 1 : 0);
    if (cover.current) {
      cover.current.rotation.z = opened * Math.PI;
      cover.current.position.y = .224 - opened * .14;
    }
    if (root.current) {
      root.current.position.x = -WIDTH / 2 * (1 - opened);
      root.current.rotation.y = -.08 * (1 - opened);
    }
    // Reveal only after this frame has drawn the textured, correctly posed
    // book. Texture loading alone does not mean the first frame is ready.
    if (prepared.current && !announced.current) {
      announced.current = true;
      readyFrame.current = requestAnimationFrame(onReady);
    }
  });

  const grab = (direction: JournalDirection, memory?: number) => ({
    onPointerDown: (event: ThreeEvent<PointerEvent>) => {
      if (event.button !== 0 || activeDrag.current || turn || (spread === content.spreads.length && direction === 'next')) return;
      event.stopPropagation();
      dragOrigin.current = event.nativeEvent.clientX;
      dragMoved.current = false;
      activeDrag.current = true;activePointer.current=event.pointerId;
      (event.target as unknown as {setPointerCapture: (id: number) => void}).setPointerCapture(event.pointerId);
      onDragStart(event.nativeEvent.clientX, direction);
    },
    onPointerMove: (event: ThreeEvent<PointerEvent>) => {
      invalidate();
      if (!activeDrag.current || activePointer.current!==event.pointerId) return;
      event.stopPropagation();
      if (Math.abs(event.nativeEvent.clientX - dragOrigin.current) > 6) dragMoved.current = true;
      onDragMove(event.nativeEvent.clientX);
    },
    onPointerUp: (event: ThreeEvent<PointerEvent>) => {
      if (!activeDrag.current || activePointer.current!==event.pointerId) return;
      event.stopPropagation();
      activeDrag.current = false;activePointer.current=null;
      onDragEnd();
      const target=event.target as unknown as {hasPointerCapture:(id:number)=>boolean;releasePointerCapture:(id:number)=>void};
      if(target.hasPointerCapture(event.pointerId))target.releasePointerCapture(event.pointerId);
      if (!dragMoved.current) {
        if (memory !== undefined) props.onMemory(memory);
        else onNavigate(direction);
      }
    },
    onPointerCancel: (event:ThreeEvent<PointerEvent>) => {if(activePointer.current!==event.pointerId)return;activeDrag.current=false;activePointer.current=null;onDragEnd(true);},
    onLostPointerCapture: (event:ThreeEvent<PointerEvent>) => {if(activeDrag.current&&activePointer.current===event.pointerId){activeDrag.current=false;activePointer.current=null;onDragEnd(true);}},
    onPointerOver: () => { if (!turn) gl.domElement.style.cursor = memory !== undefined ? 'zoom-in' : spread === 0 ? 'pointer' : spread === content.spreads.length && direction === 'next' ? 'default' : 'grab'; },
    onPointerOut: () => { if (!activeDrag.current) gl.domElement.style.cursor = ''; },
  });
  return <group ref={root} position={[spread > 0 ? 0 : -WIDTH / 2, 0, 0]} rotation={[0, spread > 0 ? 0 : -.08, 0]}>
    <PageBlock side="right" />
    <PreparationBoundary key={`requested-${props.preparingSpread}`} spread={props.preparingSpread} onFailure={props.onPagesFailed}><Suspense fallback={null}><PreparePaper spread={props.preparingSpread} onReady={props.onPagesReady}/></Suspense></PreparationBoundary>
    {spread>0&&[spread-1,spread+1].filter(index=>index>0&&index<=content.spreads.length&&index!==props.preparingSpread).map(index=><PreparationBoundary key={`prepare-${index}`} spread={index} onFailure={props.onPagesFailed}><Suspense fallback={null}><PreparePaper spread={index} onReady={props.onPagesReady}/></Suspense></PreparationBoundary>)}
    <Suspense fallback={null}><BookPaper spread={spread} turn={turn} motion={paperMotion} living={props.living}/></Suspense>
    <group ref={cover} position={[0, .224, 0]}>
      <RoundedBox args={[WIDTH + .13, .075, HEIGHT + .17]} radius={.025} smoothness={4} position={[WIDTH / 2, 0, 0]} castShadow receiveShadow>
        <meshStandardMaterial color="#233a31" bumpMap={cloth} bumpScale={.015} roughness={.7} />
      </RoundedBox>
      <mesh position={[WIDTH / 2, .044, 0]} rotation={[-Math.PI / 2, 0, 0]} castShadow>
        <planeGeometry args={[WIDTH + .07, HEIGHT + .09]} />
        <meshStandardMaterial map={coverMap} bumpMap={cloth} bumpScale={.008} roughness={.6} metalness={.12} />
      </mesh>
      <mesh position={[WIDTH / 2, -.044, 0]} rotation={[Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[WIDTH, HEIGHT]} />
        <meshStandardMaterial color="#d8cdb4" roughness={1} />
      </mesh>
    </group>
    <mesh position={[-.035, .11, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
      <cylinderGeometry args={[.095, .095, HEIGHT + .1, 20]} />
      <meshStandardMaterial color="#1b3029" roughness={.65} />
    </mesh>
    {/* Ribbon bookmark protrudes from the paper stack. */}
    <mesh position={[WIDTH * .7, .06, HEIGHT / 2 + .18]} rotation={[-Math.PI / 2, 0, .035]} receiveShadow>
      <planeGeometry args={[.16, .55]} />
      <meshStandardMaterial color="#9c344a" roughness={.9} side={THREE.DoubleSide} />
    </mesh>
    <mesh position={[WIDTH / 2, .31, 0]} rotation={[-Math.PI / 2, 0, 0]} {...grab('next')}>
      <planeGeometry args={[WIDTH, HEIGHT]} />
      <meshBasicMaterial transparent opacity={0} depthWrite={false} />
    </mesh>
    {!props.living && !turn && spread > 0 && (spread===1
      ? [{side:'right',x:95,y:820,w:815,h:360,memory:0}]
      : spread===2 ? [
        {side:'left',x:82,y:388,w:856,h:430,memory:1},
        {side:'left',x:335,y:856,w:562,h:360,memory:2},
        {side:'right',x:95,y:392,w:620,h:460,memory:3},
        {side:'right',x:388,y:887,w:496,h:326,memory:4},
      ] : []).map(photo=><mesh key={photo.memory}
        position={[(photo.side==='left'?-WIDTH:0)+(photo.x+photo.w/2)/1000*WIDTH,.34,((photo.y+photo.h/2)/1400-.5)*HEIGHT]}
        rotation={[-Math.PI/2,0,0]} {...grab(photo.side==='left'?'previous':'next',photo.memory)}>
        <planeGeometry args={[photo.w/1000*WIDTH,photo.h/1400*HEIGHT]}/>
        <meshBasicMaterial transparent opacity={0} depthWrite={false}/>
      </mesh>)}
    {spread > 0 && <mesh position={[-WIDTH / 2, .31, 0]} rotation={[-Math.PI / 2, 0, 0]} {...grab('previous')}>
      <planeGeometry args={[WIDTH, HEIGHT]} />
      <meshBasicMaterial transparent opacity={0} depthWrite={false} />
    </mesh>}
    {props.living && [...new Set(turn?[turn.from,turn.to]:[spread])].filter(index=>index>0).map(index=><Suspense key={index} fallback={null}><LivingSpread spread={index} replay={props.replay} turn={turn} phase={motion} active={props.active} onMemory={props.onMemory}/></Suspense>)}
  </group>;
}

function Desk() {
  const { invalidate } = useThree();
  const [wood, normal] = useTexture([ASSETS + 'desk.webp', ASSETS + 'desk-normal.webp']);
  const maps = useMemo(() => [wood, normal].map((source, index) => {
    const copy = source.clone();
    copy.wrapS = copy.wrapT = THREE.RepeatWrapping;
    copy.repeat.set(6.4, 6.4);
    copy.colorSpace = index === 0 ? THREE.SRGBColorSpace : THREE.NoColorSpace;
    copy.anisotropy = 4;
    return copy;
  }), [wood, normal]);
  useEffect(() => () => maps.forEach(map => map.dispose()), [maps]);
  const cup = useMemo(() => [new THREE.Vector2(.31, 0),new THREE.Vector2(.37,.04),new THREE.Vector2(.43,.53),new THREE.Vector2(.43,.58),new THREE.Vector2(.39,.58),new THREE.Vector2(.33,.12),new THREE.Vector2(.29,.09)], []);
  return <group>
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0,-.075,0]} receiveShadow onPointerMove={() => invalidate()}>
      <planeGeometry args={[160, 160]} />
      <meshStandardMaterial map={maps[0]} normalMap={maps[1]} normalScale={new THREE.Vector2(.12,.12)} color="#584539" roughness={.82} />
    </mesh>
    <group position={[4.05,-.02,-1.65]} rotation={[0,.3,0]}>
      <mesh receiveShadow castShadow position={[0,.035,0]}><cylinderGeometry args={[.7,.65,.055,48]}/><meshStandardMaterial color="#d8d3c6" roughness={.24}/></mesh>
      <mesh castShadow receiveShadow><latheGeometry args={[cup,48]}/><meshStandardMaterial color="#ece5d4" roughness={.24}/></mesh>
      <mesh position={[0,.51,0]} rotation={[-Math.PI/2,0,0]}><circleGeometry args={[.385,48]}/><meshPhysicalMaterial color="#160c08" roughness={.38} envMapIntensity={.02} specularIntensity={.05}/></mesh>
      <mesh position={[.445,.31,0]} scale={[.7,1,1]} castShadow><torusGeometry args={[.23,.055,12,32]}/><meshStandardMaterial color="#e5ddcc" roughness={.25}/></mesh>
    </group>
    <group position={[4.2,.015,1.4]} rotation={[0,-.26,0]}>
      <mesh rotation={[Math.PI/2,0,0]} castShadow><cylinderGeometry args={[.045,.045,2.25,16]}/><meshStandardMaterial color="#192b29" roughness={.34}/></mesh>
      <mesh position={[0,0,-1.2]} rotation={[Math.PI/2,0,0]} castShadow><coneGeometry args={[.045,.17,16]}/><meshStandardMaterial color="#b5a17a" roughness={.28} metalness={.75}/></mesh>
      <mesh position={[.022,.035,.68]} castShadow><boxGeometry args={[.025,.02,.36]}/><meshStandardMaterial color="#b5a17a" metalness={.8} roughness={.24}/></mesh>
      <mesh position={[0,0,.95]} rotation={[Math.PI/2,0,0]}><cylinderGeometry args={[.048,.048,.08,16]}/><meshStandardMaterial color="#b5a17a" metalness={.8} roughness={.24}/></mesh>
    </group>
  </group>;
}

function World(props: Props) {
  const {onFailure}=props;
  const { gl,invalidate,setFrameloop } = useThree();
  const [active,setActive]=useState(true);
  useEffect(()=>{
    let intersecting=true;
    const update=()=>setActive(intersecting&&!document.hidden);
    const observer=new IntersectionObserver(entries=>{intersecting=entries[0]?.isIntersecting??true;update();},{threshold:.01});
    observer.observe(gl.domElement);
    document.addEventListener('visibilitychange',update);update();
    return ()=>{observer.disconnect();document.removeEventListener('visibilitychange',update);};
  },[gl]);
  useEffect(()=>{setFrameloop(active?'demand':'never');if(active)invalidate();},[active,invalidate,setFrameloop]);
  useEffect(() => {
    const canvas = gl.domElement;
    const fail=()=>onFailure('context-lost');
    canvas.addEventListener('webglcontextlost', fail);
    return () => canvas.removeEventListener('webglcontextlost', fail);
  }, [gl, onFailure]);
  return <>
    <color attach="background" args={['#261e18']} />
    <StudioLight/>
    <ambientLight intensity={.22} color="#e9e1d2" />
    <hemisphereLight intensity={.3} color="#e7edf2" groundColor="#655444"/>
    <directionalLight position={[-3,8,-4]} intensity={2.2} color="#fff3e2" castShadow shadow-mapSize={[2048,2048]} shadow-camera-left={-5} shadow-camera-right={5} shadow-camera-top={5} shadow-camera-bottom={-5} shadow-bias={-.00015} shadow-normalBias={.004} shadow-radius={3} />
    <directionalLight position={[5,5,5]} intensity={.8} color="#d9e4ef" />
    <CameraRig open={props.spread > 0 || !!props.turn} living={props.living} active={active}/>
    <Suspense fallback={null}><Desk/><Book {...props} active={active}/></Suspense>
  </>;
}

export default function JournalScene(props: Props) {
  const {onFailure}=props;
  const [graphicsReady,setGraphicsReady]=useState(false);
  useEffect(()=>{
    let active=true;
    checkGraphics().then(supported=>{
      if(!active)return;
      if(supported)setGraphicsReady(true);
      else onFailure('webgl-unavailable');
    });
    return ()=>{active=false;};
  },[onFailure]);
  if(!graphicsReady)return null;
  return <Canvas shadows={{type:THREE.PCFShadowMap}} frameloop="demand" dpr={[1,1.6]} camera={{position:[0,11,5.9],fov:28,near:.1,far:140}}
    gl={{antialias:true,alpha:false,powerPreference:'default'}}
    onCreated={({gl,invalidate}) => {
      gl.toneMapping = THREE.ACESFilmicToneMapping;
      gl.toneMappingExposure = .95;
      invalidate();
    }}
    onPointerMissed={() => {}}
    aria-hidden="true">
    <World {...props}/>
  </Canvas>;
}
