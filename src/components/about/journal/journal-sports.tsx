"use client";

import {useEffect, useMemo, useRef} from 'react';
import {useFrame} from '@react-three/fiber';
import {RoundedBox} from '@react-three/drei/core/RoundedBox';
import * as THREE from 'three';
import Athlete from './journal-athlete';
import {useJournalSurface} from './journal-materials';

type Time = {time: React.RefObject<{t: number}>};
type Point = [number, number, number];
const CREAM = '#e4dfcc', INK = '#263b32', STEEL = '#a9afa5';
const TERRAIN = {journalLayer: 'terrain', revealOrder: 0};
const EQUIPMENT = {journalLayer: 'actors', revealOrder: 1};
const PEOPLE = {journalLayer: 'actors', revealOrder: 2};

function Pole({from, to, radius = .015, color = STEEL, metalness = .7}: {from: Point; to: Point; radius?: number; color?: string; metalness?: number}) {
  const transform = useMemo(() => {
    const a = new THREE.Vector3(...from), b = new THREE.Vector3(...to), delta = b.clone().sub(a);
    return {center: a.add(b).multiplyScalar(.5), length: delta.length(), rotation: new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), delta.normalize())};
  }, [from, to]);
  return <mesh position={transform.center} quaternion={transform.rotation} castShadow><cylinderGeometry args={[radius, radius, transform.length, 10]}/><meshStandardMaterial color={color} metalness={metalness} roughness={.38}/></mesh>;
}

function netGeometry(width: number, height: number, columns: number, rows: number, depth = 0) {
  const points: number[] = [];
  for (let x = 0; x <= columns; x++) {
    const px = -width / 2 + x / columns * width;
    points.push(px, 0, 0, px, height, depth);
  }
  for (let y = 0; y <= rows; y++) {
    const py = y / rows * height;
    points.push(-width / 2, py, depth * y / rows, width / 2, py, depth * y / rows);
  }
  const geometry = new THREE.BufferGeometry(); geometry.setAttribute('position', new THREE.Float32BufferAttribute(points, 3)); return geometry;
}

function useGroundArtwork(kind: 'court' | 'field') {
  const texture = useMemo(() => {
    const canvas = document.createElement('canvas'); canvas.width = 1024; canvas.height = 1024;
    const c = canvas.getContext('2d')!;
    if (kind === 'court') {
      c.fillStyle = '#547568'; c.fillRect(0, 0, 1024, 1024);
      c.fillStyle = '#416758'; c.fillRect(90, 70, 844, 884);
      c.strokeStyle = '#e5e2cb'; c.lineWidth = 5; c.strokeRect(90, 70, 844, 884);
      c.strokeRect(155, 70, 714, 884);
      c.beginPath(); c.moveTo(90, 512); c.lineTo(934, 512); c.moveTo(90, 330); c.lineTo(934, 330); c.moveTo(90, 694); c.lineTo(934, 694); c.moveTo(512, 70); c.lineTo(512, 330); c.moveTo(512, 694); c.lineTo(512, 954); c.stroke();
      c.strokeStyle = '#c8b47e'; c.lineWidth = 3; c.strokeRect(192, 145, 640, 734);
      c.beginPath(); c.moveTo(192, 391); c.lineTo(832, 391); c.moveTo(192, 633); c.lineTo(832, 633); c.stroke();
    } else {
      c.fillStyle = '#778e60'; c.fillRect(0, 0, 1024, 1024);
      for (let i = 0; i < 8; i++) { c.fillStyle = i % 2 ? '#74895d' : '#7e9467'; c.fillRect(i * 128, 0, 128, 1024); }
      c.fillStyle = '#bbaa83'; c.fillRect(74, 102, 247, 820);
      c.strokeStyle = '#e7e2c9'; c.lineWidth = 4; c.strokeRect(58, 78, 908, 871);
      c.strokeRect(522, 78, 376, 211); c.strokeRect(601, 78, 218, 97);
      c.beginPath(); c.arc(710, 530, 168, 0, Math.PI * 2); c.stroke();
      c.beginPath(); c.moveTo(448, 530); c.lineTo(966, 530); c.stroke();
      c.strokeRect(66, 198, 262, 6); c.strokeRect(66, 820, 262, 6);
    }
    // Fine, deterministic surface wear; photographic normal/roughness maps add relief.
    for (let i = 0; i < 2300; i++) {
      c.fillStyle = i % 2 ? 'rgba(28,45,30,.045)' : 'rgba(240,237,209,.065)';
      c.fillRect((Math.sin(i * 27.3) * .5 + .5) * 1024, (Math.sin(i * 63.1 + 5) * .5 + .5) * 1024, 3, 2);
    }
    const map = new THREE.CanvasTexture(canvas); map.colorSpace = THREE.SRGBColorSpace; map.anisotropy = 4; return map;
  }, [kind]);
  useEffect(() => () => texture.dispose(), [texture]); return texture;
}

function RecreationGround() {
  const concrete = useJournalSurface('concrete', [3, 3], .28), turf = useJournalSurface('ground', [3, 3], .16);
  const court = useGroundArtwork('court'), field = useGroundArtwork('field');
  return <group userData={TERRAIN}>
    <RoundedBox args={[5.65, .075, 3.47]} radius={.022} smoothness={2} position={[0, .036, 0]} receiveShadow castShadow><meshStandardMaterial {...concrete} color='#a8a993' roughness={.95}/></RoundedBox>
    <mesh position={[-1.48, .077, -.28]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow><planeGeometry args={[2.39, 2.39]}/><meshStandardMaterial {...concrete} map={court} roughness={.95}/></mesh>
    <mesh position={[1.35, .078, -.28]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow><planeGeometry args={[2.56, 2.39]}/><meshStandardMaterial {...turf} map={field} roughness={1}/></mesh>
    <mesh position={[-.55, .083, 1.33]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow><planeGeometry args={[4.2, .66]}/><meshStandardMaterial {...concrete} color='#343d34' roughness={1}/></mesh>
    <mesh position={[-.09, .083, -.28]} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[.13, 2.4]}/><meshStandardMaterial color='#d1c5a4' roughness={1}/></mesh>
  </group>;
}

function RacketNet({time}: Time) {
  const adjustable = useRef<THREE.Group>(null);
  const geometry = useMemo(() => netGeometry(2.14, .52, 37, 10), []);
  useEffect(() => () => geometry.dispose(), [geometry]);
  useFrame(() => {
    if (!adjustable.current) return;
    const cycle = time.current.t % 24;
    // The same recreation court accommodates both racket sports; transitions
    // happen during a quiet beat instead of replacing the entire scene.
    const badminton = cycle < 10 ? 1 : cycle < 12 ? 1 - (cycle - 10) / 2 : cycle < 22 ? 0 : (cycle - 22) / 2;
    adjustable.current.scale.y = THREE.MathUtils.lerp(.62, 1, THREE.MathUtils.smoothstep(badminton, 0, 1));
  });
  return <group userData={EQUIPMENT}>
    <group position={[-1.48, .08, -.28]} ref={adjustable}>
      {[-1.10, 1.10].map(x => <group key={x}>
        <Pole from={[x, 0, 0]} to={[x, .73, 0]} radius={.018} color={INK}/>
        <mesh position={[x, .013, 0]} castShadow><cylinderGeometry args={[.075, .09, .025, 20]}/><meshStandardMaterial color={STEEL} metalness={.65} roughness={.4}/></mesh>
      </group>)}
      <lineSegments geometry={geometry} position={[0, .17, 0]}><lineBasicMaterial color='#26372c' transparent opacity={.62}/></lineSegments>
      <mesh position={[0, .70, 0]}><boxGeometry args={[2.18, .028, .017]}/><meshStandardMaterial color={CREAM} roughness={1}/></mesh>
      <Pole from={[-1.08, .17, 0]} to={[1.08, .17, 0]} radius={.004} color={CREAM} metalness={0}/>
    </group>
  </group>;
}

function Racket({time}: Time) {
  const badminton = useRef<THREE.Group>(null), pickleball = useRef<THREE.Group>(null);
  const strings = useMemo(() => {
    const positions: number[] = [];
    for (let i = -3; i <= 3; i++) {
      const x = i * .025, half = Math.sqrt(Math.max(0, .0104 - x * x));
      positions.push(x, .29 - half * 1.27, 0, x, .29 + half * 1.27, 0);
      positions.push(-half, .29 + x * 1.27, 0, half, .29 + x * 1.27, 0);
    }
    const geometry = new THREE.BufferGeometry(); geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3)); return geometry;
  }, []);
  useEffect(() => () => strings.dispose(), [strings]);
  useFrame(() => {
    const useRacket = time.current.t % 24 < 12;
    if (badminton.current) badminton.current.visible = useRacket;
    if (pickleball.current) pickleball.current.visible = !useRacket;
  });
  return <>
    <Pole from={[0, -.035, 0]} to={[0, .17, 0]} radius={.009} color='#38443b' metalness={.15}/>
    <group ref={badminton}>
      <mesh position={[0, .29, 0]} scale={[1, 1.27, 1]} castShadow><torusGeometry args={[.103, .009, 7, 32]}/><meshStandardMaterial color='#b6bda6' metalness={.65} roughness={.4}/></mesh>
      <lineSegments geometry={strings}><lineBasicMaterial color='#e6e3d2' transparent opacity={.75}/></lineSegments>
    </group>
    <group ref={pickleball} visible={false}>
      <RoundedBox args={[.18, .22, .025]} radius={.04} smoothness={2} position={[0, .255, 0]} castShadow><meshStandardMaterial color='#bba16a' roughness={.68}/></RoundedBox>
      <mesh position={[0, .26, .014]}><planeGeometry args={[.13, .13]}/><meshStandardMaterial color={INK} roughness={.9}/></mesh>
    </group>
  </>;
}

function RacketFlight({time}: Time) {
  const shuttle = useRef<THREE.Group>(null), ball = useRef<THREE.Mesh>(null);
  const feathers = useMemo(() => {
    const points: number[] = [];
    for (let i = 0; i < 10; i++) { const a = i / 10 * Math.PI * 2; points.push(Math.cos(a) * .009, -.025, Math.sin(a) * .009, Math.cos(a) * .045, .065, Math.sin(a) * .045); }
    const geometry = new THREE.BufferGeometry(); geometry.setAttribute('position', new THREE.Float32BufferAttribute(points, 3)); return geometry;
  }, []);
  useEffect(() => () => feathers.dispose(), [feathers]);
  useFrame(() => {
    const flight = Math.cos(time.current.t * 1.7), isBadminton = time.current.t % 24 < 12;
    const z = -.31 + flight * .66;
    if (shuttle.current) {
      shuttle.current.visible = isBadminton; shuttle.current.position.set(-1.63, 1.23 + (1 - flight * flight) * .25, z);
      shuttle.current.rotation.x = flight > 0 ? -.8 : .8;
    }
    if (ball.current) {
      ball.current.visible = !isBadminton; ball.current.position.set(-1.63, .74 + (1 - flight * flight) * .17, z);
      ball.current.rotation.set(time.current.t * 4, 0, time.current.t * 3);
    }
  });
  return <group userData={{...PEOPLE, revealOrder: 3}}>
    <group ref={shuttle}>
      <mesh position={[0, -.026, 0]}><sphereGeometry args={[.018, 12, 8]}/><meshStandardMaterial color={CREAM} roughness={.95}/></mesh>
      <lineSegments geometry={feathers}><lineBasicMaterial color='#f1efdb'/></lineSegments>
      <mesh position={[0, .02, 0]}><coneGeometry args={[.044, .09, 10, 1, true]}/><meshStandardMaterial color='#f1efdb' transparent opacity={.48} side={THREE.DoubleSide}/></mesh>
    </group>
    <mesh ref={ball} visible={false}><sphereGeometry args={[.037, 16, 12]}/><meshStandardMaterial color='#d2d590' roughness={.75}/></mesh>
  </group>;
}

function CourtBench() {
  return <group userData={EQUIPMENT} position={[-2.4, .08, .72]}>
    <RoundedBox args={[.48, .045, .25]} radius={.015} smoothness={2} position={[0, .18, 0]} castShadow><meshStandardMaterial color='#a9936c' roughness={.87}/></RoundedBox>
    {[-.17, .17].map(x => <Pole key={x} from={[x, .01, 0]} to={[x, .16, 0]} radius={.018} color={INK}/>)}
    {[-.09, .09].map((x, i) => <group key={x} position={[x, 0, .17]} rotation={[-.30, 0, i ? -.08 : .08]}>
      <Pole from={[0, .015, 0]} to={[0, .14, 0]} radius={.008} color={INK} metalness={0}/>
      <RoundedBox args={[.125, .17, .018]} radius={.027} smoothness={2} position={[0, .22, 0]} castShadow><meshStandardMaterial color={i ? '#c4b17f' : '#344f40'} roughness={.8}/></RoundedBox>
    </group>)}
  </group>;
}

function Goal() {
  const net = useMemo(() => netGeometry(1.25, .61, 18, 9, .04), []);
  const sideNet = useMemo(() => {
    const positions: number[] = [];
    for (let i = 0; i <= 9; i++) {
      const y = i / 9 * .61;
      positions.push(0, y, 0, 0, y, -.29 + i / 9 * .04);
    }
    for (let i = 0; i <= 4; i++) positions.push(0, 0, -i / 4 * .29, 0, .61, -i / 4 * .25);
    const geometry = new THREE.BufferGeometry(); geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3)); return geometry;
  }, []);
  const roof = useMemo(() => {
    const positions: number[] = [];
    for (let i = 0; i <= 18; i++) { const x = -.625 + i / 18 * 1.25; positions.push(x, .61, 0, x, .61, -.25); }
    for (let i = 0; i <= 4; i++) { const z = -i / 4 * .25; positions.push(-.625, .61, z, .625, .61, z); }
    const geometry = new THREE.BufferGeometry(); geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3)); return geometry;
  }, []);
  useEffect(() => () => { net.dispose(); roof.dispose(); sideNet.dispose(); }, [net, roof, sideNet]);
  return <group position={[1.85, .08, -1.09]}>
    {[-.625, .625].map(x => <group key={x}>
      <Pole from={[x, 0, 0]} to={[x, .61, 0]} radius={.021} color={CREAM} metalness={.15}/>
      <Pole from={[x, 0, -.29]} to={[x, .61, -.25]} radius={.009} color={STEEL}/>
      <Pole from={[x, .61, 0]} to={[x, .61, -.25]} radius={.01} color={STEEL}/>
      <Pole from={[x, 0, 0]} to={[x, 0, -.29]} radius={.01} color={STEEL}/>
    </group>)}
    <Pole from={[-.625, .61, 0]} to={[.625, .61, 0]} radius={.021} color={CREAM} metalness={.15}/>
    <lineSegments geometry={net} position={[0, 0, -.29]}><lineBasicMaterial color='#e9e6ce' transparent opacity={.65}/></lineSegments>
    <lineSegments geometry={roof}><lineBasicMaterial color='#e9e6ce' transparent opacity={.55}/></lineSegments>
    {[-.625, .625].map(x => <lineSegments key={x} geometry={sideNet} position={[x, 0, 0]}><lineBasicMaterial color='#e9e6ce' transparent opacity={.55}/></lineSegments>)}
  </group>;
}

function CricketWicket({position}: {position: Point}) {
  return <group position={position}>
    {[-.065, 0, .065].map(x => <Pole key={x} from={[x, 0, 0]} to={[x, .32, 0]} radius={.009} color='#c7a476' metalness={0}/>)}
    {[-.034, .034].map(x => <mesh key={x} position={[x, .329, 0]} rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[.006, .006, .07, 8]}/><meshStandardMaterial color='#d0b485' roughness={.8}/></mesh>)}
  </group>;
}

function CricketBat() {
  return <group>
    <Pole from={[0, .035, 0]} to={[0, -.15, 0]} radius={.013} color={INK} metalness={0}/>
    <RoundedBox args={[.11, .30, .035]} radius={.016} smoothness={2} position={[0, -.30, 0]} castShadow><meshStandardMaterial color='#c3a478' roughness={.78}/></RoundedBox>
    <mesh position={[0, -.24, .018]}><planeGeometry args={[.065, .07]}/><meshStandardMaterial color={INK} roughness={.9}/></mesh>
  </group>;
}

function FieldBalls({time}: Time) {
  const football = useRef<THREE.Mesh>(null), cricket = useRef<THREE.Mesh>(null);
  const texture = useMemo(() => {
    const canvas = document.createElement('canvas'); canvas.width = 512; canvas.height = 256;
    const c = canvas.getContext('2d')!; c.fillStyle = '#e9e6d5'; c.fillRect(0, 0, 512, 256);
    c.fillStyle = '#344033';
    for (let row = 0; row < 3; row++) for (let column = 0; column < 5; column++) {
      const x = 24 + column * 110 + row % 2 * 42, y = 30 + row * 100; c.beginPath();
      for (let p = 0; p < 5; p++) { const a = p / 5 * Math.PI * 2; if (p) c.lineTo(x + Math.cos(a) * 22, y + Math.sin(a) * 22); else c.moveTo(x + Math.cos(a) * 22, y + Math.sin(a) * 22); } c.closePath(); c.fill();
    }
    const map = new THREE.CanvasTexture(canvas); map.colorSpace = THREE.SRGBColorSpace; return map;
  }, []);
  useEffect(() => () => texture.dispose(), [texture]);
  useFrame(() => {
    const cycle = (time.current.t * 1.35 / (Math.PI * 2)) % 1;
    const shot = THREE.MathUtils.clamp((cycle - .25) / .45, 0, 1);
    if (football.current) { football.current.position.set(1.78, .147 + Math.sin(shot * Math.PI) * .22, .30 - shot * 1.42); football.current.rotation.x = -time.current.t * 3; }
    if (cricket.current) { const pass = (time.current.t / 4.4) % 1; cricket.current.position.set(.62, .22 + Math.sin(pass * Math.PI) * .08, -.95 + pass * 1.25); }
  });
  return <group userData={{...PEOPLE, revealOrder: 3}}>
    <mesh ref={football} castShadow><sphereGeometry args={[.065, 24, 16]}/><meshStandardMaterial map={texture} roughness={.8}/></mesh>
    <mesh ref={cricket} castShadow><sphereGeometry args={[.03, 12, 8]}/><meshStandardMaterial color='#915445' roughness={.65}/></mesh>
  </group>;
}

function GymEquipment() {
  return <group userData={EQUIPMENT}>
    <group position={[-1.94, .085, 1.36]}>
      <RoundedBox args={[1.08, .10, .34]} radius={.025} smoothness={2} position={[0, .20, 0]} castShadow><meshStandardMaterial color='#384139' roughness={.87}/></RoundedBox>
      {[-.34, .34].map(x => <group key={x}><Pole from={[x, .03, -.12]} to={[x, .15, -.07]} radius={.023}/><Pole from={[x, .03, .12]} to={[x, .15, .07]} radius={.023}/><Pole from={[x, .025, -.21]} to={[x, .025, .21]} radius={.025} color={INK}/></group>)}
    </group>
    <group position={[-.88, .085, 1.32]}>
      {[-.34, .34].map(x => <group key={x}>
        <mesh position={[x, .40, 0]} castShadow><boxGeometry args={[.045, .8, .045]}/><meshStandardMaterial color='#68756b' metalness={.7} roughness={.4}/></mesh>
        <mesh position={[x, .025, 0]} castShadow><boxGeometry args={[.12, .05, .53]}/><meshStandardMaterial color={INK} roughness={.75}/></mesh>
        {[.33, .52, .68].map(y => <Pole key={y} from={[x, y, 0]} to={[x, y, .085]} radius={.012} color={STEEL}/>)}
      </group>)}
      <Pole from={[-.34, .8, 0]} to={[.34, .8, 0]} radius={.024}/>
      <mesh position={[0, .35, .12]} rotation={[0, 0, Math.PI / 2]} castShadow><cylinderGeometry args={[.013, .013, .92, 12]}/><meshStandardMaterial color={STEEL} metalness={.8} roughness={.32}/></mesh>
      {[-1, 1].map(side => <mesh key={side} position={[side * .38, .35, .12]} rotation={[0, 0, Math.PI / 2]} castShadow><cylinderGeometry args={[.14, .14, .075, 24]}/><meshStandardMaterial color='#303932' roughness={.97}/></mesh>)}
    </group>
    <group position={[1.07, .085, 1.47]}>
      {[0, 1].map(i => <group key={i} position={[i * .33, 0, 0]} rotation={[0, i ? -.15 : .15, 0]}>
        <Pole from={[-.09, .08, 0]} to={[.09, .08, 0]} radius={.018}/>
        {[-.1, .1].map(x => <mesh key={x} position={[x, .08, 0]} rotation={[0, 0, Math.PI / 2]} castShadow><cylinderGeometry args={[.07, .07, .055, 6]}/><meshStandardMaterial color='#343d34' roughness={.95}/></mesh>)}
      </group>)}
    </group>
  </group>;
}

export function SportsSpread({time}: Time) {
  return <>
    <RecreationGround/>
    <RacketNet time={time}/>
    <CourtBench/>
    <group userData={EQUIPMENT}>
      <Goal/>
      <CricketWicket position={[.62, .08, -.95]}/>
      <CricketWicket position={[.62, .08, .70]}/>
    </group>
    <GymEquipment/>
    <group userData={PEOPLE}>
      <Athlete time={time} activity='racket' position={[-1.42, .08, .52]} angle={Math.PI} scale={.83} shirt='#d8dfce' trousers='#345345' equipment={<Racket time={time}/>}/>
      <Athlete time={time} activity='racket' position={[-1.84, .08, -1.04]} phase={Math.PI / 1.7} scale={.83} shirt='#ad9671' equipment={<Racket time={time}/>}/>
      <Athlete time={time} activity='kick' position={[1.9, .08, .45]} angle={Math.PI} scale={.91} shirt='#e0ddc9' trousers='#4b6852'/>
      <Athlete time={time} activity='bat' position={[.62, .08, .37]} angle={Math.PI} scale={.85} shirt='#eee8d6' trousers='#ddd6c1' equipment={<CricketBat/>}/>
      <Athlete time={time} activity='lift' position={[.15, .085, 1.29]} scale={.94} shirt='#a88d67' trousers='#293d34' skin='#a97751'/>
    </group>
    <RacketFlight time={time}/>
    <FieldBalls time={time}/>
  </>;
}
