"use client";

/* R3F intentionally mutates its owned Three.js camera, geometry and textures
 * inside the render loop. These objects are not React state. */
/* eslint-disable react-hooks/immutability */

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree, type ThreeEvent } from "@react-three/fiber";
import { RoundedBox, useTexture } from "@react-three/drei";
import { gsap } from "gsap";
import * as THREE from "three";
import type { JournalDirection, JournalTurn } from "./journal-types";
import content from "./content.json";
import {supportsJournal3D} from "./journal-capabilities";
import { pagePosition } from "./journal-math";

let graphicsSupport: Promise<boolean>|undefined;
const checkGraphics = () => graphicsSupport ??= Promise.resolve().then(()=>supportsJournal3D(document.createElement('canvas')));

const WIDTH = 3.15;
const HEIGHT = 4.4;
const PAGE_Y = .195;
const ASSETS = "/images/about/journal/";
const PAGE_FILES = ["person", "journey", "outside", "after-dark", "matchday", "curiosity"];
type Props = {
  spread: number;
  turn: JournalTurn | null;
  onComplete: (spread: number) => void;
  onReady: () => void;
  onFailure: (reason?: "webgl-unavailable" | "context-lost") => void;
  onMemory: (index: number) => void;
  onNavigate: (direction: JournalDirection) => void;
  onDragStart: (x: number, direction: JournalDirection) => void;
  onDragMove: (x: number) => void;
  onDragEnd: (cancelled?: boolean) => void;
};

function CameraRig({ open }: { open: boolean }) {
  const { camera, size, pointer, invalidate } = useThree();
  const last = useRef([0, 0]);
  useEffect(() => {
    const ortho = camera as THREE.OrthographicCamera;
    ortho.zoom = Math.min(size.width / (size.width < 900 ? (open ? 7.2 : 4.8) : 8.3), size.height / 5.7);
    ortho.updateProjectionMatrix();
    invalidate();
  }, [camera, size.width, size.height, open, invalidate]);
  useFrame((_, delta) => {
    const x = pointer.x * (open ? .07 : .22);
    const z = 5.9 + pointer.y * .08;
    camera.position.x = THREE.MathUtils.damp(camera.position.x, x, 7, Math.min(delta, .1));
    camera.position.z = THREE.MathUtils.damp(camera.position.z, z, 7, Math.min(delta, .1));
    camera.lookAt(0, .2, 0);
    if (Math.abs(last.current[0] - camera.position.x) + Math.abs(last.current[1] - camera.position.z) > .0001) invalidate();
    last.current = [camera.position.x, camera.position.z];
  });
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

function Book(props: Props) {
  const { spread, turn, onComplete, onReady, onDragStart, onDragMove, onDragEnd, onNavigate } = props;
  const textures = useTexture(["cover", ...PAGE_FILES, "cloth"].map(name => ASSETS + name + (name === 'cloth' ? '.png' : '.webp')));
  const { invalidate, gl } = useThree();
  const root = useRef<THREE.Group>(null);
  const cover = useRef<THREE.Group>(null);
  const leftStack = useRef<THREE.Group>(null);
  const motion = useRef({ value: 0 });
  const activeDrag = useRef(false);
  const dragMoved = useRef(false);
  const dragOrigin = useRef(0);
  const prepared = useRef(false);
  const announced = useRef(false);
  const readyFrame = useRef<number|null>(null);
  const isCover = !!turn && (turn.from === 0 || turn.to === 0);
  const fromSpread = Math.max(1, turn?.from ?? spread);
  const toSpread = Math.max(1, turn?.to ?? spread);
  const forward = (turn?.to ?? spread) > (turn?.from ?? spread);
  const coverSpread = turn?.from === 0 ? toSpread : fromSpread;
  const leftIndex = isCover ? coverSpread : turn && !forward ? toSpread : fromSpread;
  const rightIndex = isCover ? coverSpread : turn && forward ? toSpread : fromSpread;
  const coverMap = textures[0];
  const pages = textures.slice(1,-1);
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
    if (turn.progress === undefined) motion.current.value = forward ? 0 : 1;
    const destination = turn.cancelled ? (forward ? 0 : 1) : (forward ? 1 : 0);
    const tween = gsap.to(motion.current, {
      value: destination,
      duration: isCover ? 1.45 : Math.max(.3, .95 * Math.abs(destination - motion.current.value)),
      ease: isCover ? 'power2.inOut' : 'power2.out',
      onUpdate: invalidate,
      onComplete: () => onComplete(turn.cancelled ? turn.from : turn.to),
    });
    return () => { tween.kill(); };
  }, [turn, forward, isCover, invalidate, onComplete]);
  useFrame(() => {
    const opened = isCover ? motion.current.value : (spread > 0 ? 1 : 0);
    if (cover.current) {
      cover.current.rotation.z = opened * Math.PI;
      cover.current.position.y = .224 - opened * .14;
    }
    if (root.current) {
      root.current.position.x = -WIDTH / 2 * (1 - opened);
      root.current.rotation.y = -.08 * (1 - opened);
    }
    if (leftStack.current) leftStack.current.visible = opened > .92;
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
      activeDrag.current = true;
      (event.target as unknown as {setPointerCapture: (id: number) => void}).setPointerCapture(event.pointerId);
      onDragStart(event.nativeEvent.clientX, direction);
    },
    onPointerMove: (event: ThreeEvent<PointerEvent>) => {
      invalidate();
      if (!activeDrag.current) return;
      event.stopPropagation();
      if (Math.abs(event.nativeEvent.clientX - dragOrigin.current) > 6) dragMoved.current = true;
      onDragMove(event.nativeEvent.clientX);
    },
    onPointerUp: (event: ThreeEvent<PointerEvent>) => {
      if (!activeDrag.current) return;
      event.stopPropagation();
      activeDrag.current = false;
      onDragEnd();
      (event.target as unknown as {releasePointerCapture: (id: number) => void}).releasePointerCapture(event.pointerId);
      if (!dragMoved.current) {
        if (memory !== undefined) props.onMemory(memory);
        else onNavigate(direction);
      }
    },
    onPointerCancel: () => { activeDrag.current = false; onDragEnd(true); },
    onLostPointerCapture: () => {if (activeDrag.current) {activeDrag.current=false;onDragEnd(true);}},
    onPointerOver: () => { if (!turn) gl.domElement.style.cursor = memory !== undefined ? 'zoom-in' : spread === 0 ? 'pointer' : spread === content.spreads.length && direction === 'next' ? 'default' : 'grab'; },
    onPointerOut: () => { if (!activeDrag.current) gl.domElement.style.cursor = ''; },
  });
  return <group ref={root} position={[spread > 0 ? 0 : -WIDTH / 2, 0, 0]} rotation={[0, spread > 0 ? 0 : -.08, 0]}>
    <PageBlock side="right" />
    <PrintedPage side="right" map={pages[(rightIndex - 1) * 2 + 1]} />
    <group ref={leftStack} visible={false}>
      <PageBlock side="left" />
      <PrintedPage side="left" map={pages[(leftIndex - 1) * 2]} />
    </group>
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
    {turn && !isCover && <TurningPage
      phase={motion}
      front={pages[(forward ? fromSpread : toSpread) * 2 - 1]}
      back={pages[(forward ? toSpread : fromSpread) * 2 - 2]}
    />}
    <mesh position={[WIDTH / 2, .31, 0]} rotation={[-Math.PI / 2, 0, 0]} {...grab('next')}>
      <planeGeometry args={[WIDTH, HEIGHT]} />
      <meshBasicMaterial transparent opacity={0} depthWrite={false} />
    </mesh>
    {!turn && spread > 0 && (spread===1
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
  </group>;
}

function Desk() {
  const { invalidate } = useThree();
  const [wood, normal] = useTexture([ASSETS + 'desk.webp', ASSETS + 'desk-normal.webp']);
  const maps = useMemo(() => [wood, normal].map((source, index) => {
    const copy = source.clone();
    copy.wrapS = copy.wrapT = THREE.RepeatWrapping;
    copy.repeat.set(1.6, 1.6);
    copy.colorSpace = index === 0 ? THREE.SRGBColorSpace : THREE.NoColorSpace;
    copy.anisotropy = 4;
    return copy;
  }), [wood, normal]);
  useEffect(() => () => maps.forEach(map => map.dispose()), [maps]);
  const cup = useMemo(() => [new THREE.Vector2(.31, 0),new THREE.Vector2(.37,.04),new THREE.Vector2(.43,.53),new THREE.Vector2(.43,.58),new THREE.Vector2(.39,.58),new THREE.Vector2(.33,.12),new THREE.Vector2(.29,.09)], []);
  return <group>
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0,-.075,0]} receiveShadow onPointerMove={() => invalidate()}>
      <planeGeometry args={[40, 40]} />
      <meshStandardMaterial map={maps[0]} normalMap={maps[1]} normalScale={new THREE.Vector2(.12,.12)} color="#584539" roughness={.82} />
    </mesh>
    <group position={[4.05,-.02,-1.65]} rotation={[0,.3,0]}>
      <mesh receiveShadow castShadow position={[0,.035,0]}><cylinderGeometry args={[.7,.65,.055,48]}/><meshStandardMaterial color="#d8d3c6" roughness={.24}/></mesh>
      <mesh castShadow receiveShadow><latheGeometry args={[cup,48]}/><meshStandardMaterial color="#ece5d4" roughness={.24}/></mesh>
      <mesh position={[0,.51,0]} rotation={[-Math.PI/2,0,0]}><circleGeometry args={[.385,48]}/><meshStandardMaterial color="#160c08" roughness={.16}/></mesh>
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
  const { gl } = useThree();
  useEffect(() => {
    const canvas = gl.domElement;
    const fail=()=>onFailure('context-lost');
    canvas.addEventListener('webglcontextlost', fail);
    return () => canvas.removeEventListener('webglcontextlost', fail);
  }, [gl, onFailure]);
  return <>
    <color attach="background" args={['#261e18']} />
    <ambientLight intensity={.85} color="#e9e1d2" />
    <directionalLight position={[-3,8,-4]} intensity={3.1} color="#ffefd6" castShadow shadow-mapSize={[2048,2048]} shadow-camera-left={-7} shadow-camera-right={7} shadow-camera-top={7} shadow-camera-bottom={-7} shadow-bias={-.0005} shadow-normalBias={.015} shadow-radius={3} />
    <directionalLight position={[5,5,5]} intensity={.65} color="#d9e4ef" />
    <CameraRig open={props.spread > 0 || !!props.turn} />
    <Suspense fallback={null}><Desk/><Book {...props}/></Suspense>
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
  return <Canvas orthographic shadows={{type:THREE.PCFShadowMap}} frameloop="demand" dpr={[1,1.6]} camera={{position:[0,11,5.9],zoom:100,near:.1,far:70}}
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
