"use client";

import {useEffect, useMemo, useRef} from 'react';
import {useFrame} from '@react-three/fiber';
import {RoundedBox} from '@react-three/drei/core/RoundedBox';
import * as THREE from 'three';
import Athlete from './journal-athlete';
import {useJournalSurface} from './journal-materials';
import {PickleballBall, PickleballPaddle} from './journal-pickleball-equipment';
import {PICKLEBALL_BALL_RADIUS, samplePickleballRally} from './journal-pickleball-motion';

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
  const at = (u: number, v: number) => {
    const slack = Math.sin(u * Math.PI) * Math.sin(v * Math.PI);
    return [(u - .5) * width, v * height - slack * .018, depth * v - slack * .035];
  };
  for (let x = 0; x <= columns; x++) for (let y = 0; y < rows; y++) points.push(...at(x / columns, y / rows), ...at(x / columns, (y + 1) / rows));
  for (let y = 0; y <= rows; y++) for (let x = 0; x < columns; x++) points.push(...at(x / columns, y / rows), ...at((x + 1) / columns, y / rows));
  const geometry = new THREE.BufferGeometry(); geometry.setAttribute('position', new THREE.Float32BufferAttribute(points, 3)); return geometry;
}

function useGroundArtwork(kind: 'court' | 'field' | 'rubber') {
  const texture = useMemo(() => {
    const canvas = document.createElement('canvas'); canvas.width = 1024; canvas.height = 1024;
    const c = canvas.getContext('2d')!;
    if (kind === 'court') {
      c.fillStyle = '#617c6f'; c.fillRect(0, 0, 1024, 1024);
      // The painted 20:44 rectangle fits the existing square recreation apron.
      const length = 946, width = length * 20 / 44, left = (1024 - width) / 2, top = (1024 - length) / 2;
      const kitchen = length * 7 / 44;
      c.fillStyle = '#426658'; c.fillRect(left, top, width, length);
      c.fillStyle = '#4b6d5d'; c.fillRect(left, 512 - kitchen, width, kitchen * 2);
      c.strokeStyle = '#e1e0cd'; c.lineWidth = length * (2 / 12) / 44;
      c.strokeRect(left, top, width, length);
      c.beginPath();
      c.moveTo(left, 512 - kitchen); c.lineTo(left + width, 512 - kitchen);
      c.moveTo(left, 512 + kitchen); c.lineTo(left + width, 512 + kitchen);
      c.moveTo(512, top); c.lineTo(512, 512 - kitchen);
      c.moveTo(512, 512 + kitchen); c.lineTo(512, top + length); c.stroke();
    } else if (kind === 'field') {
      c.fillStyle = '#6e855e'; c.fillRect(0, 0, 1024, 1024);
      for (let i = 0; i < 8; i++) { c.fillStyle = i % 2 ? '#6a8059' : '#728861'; c.fillRect(i * 128, 0, 128, 1024); }
      c.fillStyle = '#b4a581'; c.fillRect(74, 102, 247, 820);
      c.strokeStyle = '#e2dfc9'; c.lineWidth = 4; c.strokeRect(58, 78, 908, 871);
      c.strokeRect(522, 78, 376, 211); c.strokeRect(601, 78, 218, 97);
      c.beginPath(); c.arc(710, 530, 168, 0, Math.PI * 2); c.stroke();
      c.beginPath(); c.moveTo(448, 530); c.lineTo(966, 530); c.stroke();
      c.strokeRect(66, 198, 262, 6); c.strokeRect(66, 820, 262, 6);
    } else {
      c.fillStyle = '#323b34'; c.fillRect(0, 0, 1024, 1024);
    }
    // Fine aggregate, grass and rubber grain stay quieter than the court lines.
    for (let i = 0; i < 18000; i++) {
      const x = (Math.sin(i * 27.3) * .5 + .5) * 1024, y = (Math.sin(i * 63.1 + 5) * .5 + .5) * 1024;
      if (kind === 'field') {
        c.strokeStyle = i % 2 ? 'rgba(31,53,31,.13)' : 'rgba(178,188,136,.14)'; c.lineWidth = .8;
        c.beginPath(); c.moveTo(x, y); c.lineTo(x + Math.sin(i) * 1.5, y - 2.7 - i % 3); c.stroke();
      } else {
        c.fillStyle = i % 2 ? 'rgba(16,32,22,.065)' : 'rgba(229,230,205,.075)'; c.fillRect(x, y, kind === 'rubber' ? 1.7 : 1.2, 1.1);
      }
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
  const court = useGroundArtwork('court'), field = useGroundArtwork('field'), rubber = useGroundArtwork('rubber');
  return <group userData={TERRAIN}>
    <RoundedBox args={[5.65, .075, 3.47]} radius={.022} smoothness={2} position={[0, .036, 0]} receiveShadow castShadow><meshStandardMaterial {...concrete} color='#a8a993' roughness={.95}/></RoundedBox>
    <mesh position={[-1.48, .077, -.28]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow><planeGeometry args={[2.39, 2.39]}/><meshStandardMaterial {...concrete} map={court} roughness={.95}/></mesh>
    <mesh position={[1.35, .078, -.28]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow><planeGeometry args={[2.56, 2.39]}/><meshStandardMaterial {...turf} map={field} roughness={1}/></mesh>
    <mesh position={[-.55, .083, 1.33]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow><planeGeometry args={[4.2, .66]}/><meshStandardMaterial {...concrete} map={rubber} color='#d0d4c4' roughness={1}/></mesh>
    <mesh position={[-.09, .083, -.28]} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[.13, 2.4]}/><meshStandardMaterial color='#d1c5a4' roughness={1}/></mesh>
  </group>;
}

function PickleballNet() {
  const net = useMemo(() => {
    const points: number[] = [], columns = 48, rows = 11, width = 1.12;
    const top = (x: number) => .43 - .024 * Math.max(0, 1 - (x / .56) ** 2);
    const at = (u: number, v: number) => {const x = (u - .5) * width; return [x, .10 + (top(x) - .10) * v, .009 * Math.sin(u * Math.PI) * Math.sin(v * Math.PI)];};
    const segment = (a: number[], b: number[]) => points.push(...a, ...b);
    for (let col = 0; col <= columns; col++) for (let row = 0; row < rows; row++) segment(at(col / columns, row / rows), at(col / columns, (row + 1) / rows));
    for (let row = 0; row <= rows; row++) for (let col = 0; col < columns; col++) segment(at(col / columns, row / rows), at((col + 1) / columns, row / rows));
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(points, 3)); return g;
  }, []);
  const tape = useMemo(() => {
    const g = new THREE.PlaneGeometry(1.14, .020, 48, 1), p = g.attributes.position;
    for (let i = 0; i < p.count; i++) {const x = p.getX(i); p.setY(i, p.getY(i) + .43 - .024 * Math.max(0, 1 - (x / .56) ** 2));}
    g.computeVertexNormals(); return g;
  }, []);
  useEffect(() => () => {net.dispose(); tape.dispose();}, [net, tape]);
  return <group userData={EQUIPMENT} name='fixed-pickleball-net'>
    <group position={[-1.48, .08, -.28]}>
      {[-.59, .59].map(x => <group key={x}>
        <Pole from={[x, 0, 0]} to={[x, .46, 0]} radius={.013} color={INK} metalness={.16}/>
        <mesh position={[x, .013, 0]} castShadow><cylinderGeometry args={[.065, .075, .025, 20]}/><meshStandardMaterial color='#59665a' metalness={.22} roughness={.72}/></mesh>
        <mesh position={[x, .455, 0]}><sphereGeometry args={[.014, 12, 8]}/><meshStandardMaterial color={INK} roughness={.8}/></mesh>
      </group>)}
      <lineSegments geometry={net}><lineBasicMaterial color='#37473a' transparent opacity={.28}/></lineSegments>
      <mesh geometry={tape}><meshStandardMaterial color='#dfdfcb' roughness={1} side={THREE.DoubleSide}/></mesh>
      <Pole from={[-.56, .10, 0]} to={[.56, .10, 0]} radius={.002} color='#6b7560' metalness={0}/>
    </group>
  </group>;
}

function CourtBench() {
  return <group userData={EQUIPMENT} position={[-2.4, .08, .72]}>
    <RoundedBox args={[.48, .045, .25]} radius={.015} smoothness={2} position={[0, .18, 0]} castShadow><meshStandardMaterial color='#a9936c' roughness={.87}/></RoundedBox>
    {[-.17, .17].map(x => <Pole key={x} from={[x, .01, 0]} to={[x, .16, 0]} radius={.018} color={INK}/>)}
    {[-.09, .09].map((x, i) => <group key={x} position={[x, 0, .17]} rotation={[-.30, 0, i ? -.08 : .08]}>
      <PickleballPaddle position={[0, .024, 0]} scale={[.70, .77, .72]} faceColor={i ? '#a79570' : '#344f40'}/>
    </group>)}
  </group>;
}

function PickleballRallyBall({time}: Time) {
  const ball = useRef<THREE.Group>(null);
  useFrame(() => {
    if (!ball.current) return;
    const sample = samplePickleballRally(time.current.t);
    ball.current.position.set(...sample.ball.position);
    ball.current.rotation.set(time.current.t * 4, time.current.t * 2.3, 0);
  });
  return <group userData={{...PEOPLE, revealOrder: 3}}>
    <group ref={ball}><PickleballBall radius={PICKLEBALL_BALL_RADIUS}/></group>
  </group>;
}

function TableTennisPaddle() {
  return <group>
    <RoundedBox args={[.030, .088, .021]} radius={.008} smoothness={2} position={[0, .024, 0]} castShadow><meshStandardMaterial color='#a98e65' roughness={.85}/></RoundedBox>
    <mesh position={[0, .115, 0]} rotation={[Math.PI / 2, 0, 0]} scale={[1, 1, 1.08]} castShadow><cylinderGeometry args={[.064, .064, .012, 28]}/><meshStandardMaterial color='#c5ab7a' roughness={.83}/></mesh>
    <mesh position={[0, .115, .007]} rotation={[Math.PI / 2, 0, 0]} scale={[1, 1, 1.08]} castShadow><cylinderGeometry args={[.061, .061, .003, 28]}/><meshStandardMaterial color='#273c32' roughness={.96}/></mesh>
    <mesh position={[0, .115, -.007]} rotation={[Math.PI / 2, 0, 0]} scale={[1, 1, 1.08]}><cylinderGeometry args={[.061, .061, .003, 28]}/><meshStandardMaterial color='#915948' roughness={.96}/></mesh>
  </group>;
}

function TableTennis({time}: Time) {
  const net = useMemo(() => {
    const points: number[] = [], width = .60, height = .072;
    const at = (u: number, v: number) => [(u - .5) * width, .36 + v * height - .002 * Math.sin(u * Math.PI) * v, .002 * Math.sin(u * Math.PI) * Math.sin(v * Math.PI)];
    for (let i = 0; i <= 32; i++) points.push(...at(i / 32, 0), ...at(i / 32, 1));
    for (let row = 0; row <= 5; row++) for (let i = 0; i < 32; i++) points.push(...at(i / 32, row / 5), ...at((i + 1) / 32, row / 5));
    const geometry = new THREE.BufferGeometry(); geometry.setAttribute('position', new THREE.Float32BufferAttribute(points, 3)); return geometry;
  }, []);
  useEffect(() => () => net.dispose(), [net]);
  return <>
    <group userData={EQUIPMENT} name='table-tennis-table' position={[-2.43, .08, -.43]}>
      {[-1, 1].map(side => <RoundedBox key={side} args={[.52, .026, .472]} radius={.005} smoothness={2} position={[0, .347, side * .239]} receiveShadow castShadow><meshStandardMaterial color='#355c4a' roughness={.82}/></RoundedBox>)}
      {[-.25, .25].map(x => <mesh key={x} position={[x, .361, 0]} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[.007, .935]}/><meshStandardMaterial color={CREAM} roughness={.98}/></mesh>)}
      {[-.465, .465].map(z => <mesh key={z} position={[0, .361, z]} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[.505, .007]}/><meshStandardMaterial color={CREAM} roughness={.98}/></mesh>)}
      <mesh position={[0, .361, 0]} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[.003, .935]}/><meshStandardMaterial color={CREAM} roughness={.98}/></mesh>
      {[-.18, .18].map(x => <group key={x}>
        {[-.32, .32].map(z => <group key={z}>
          <Pole from={[x, .04, z]} to={[x, .332, z]} radius={.013} color={INK} metalness={.45}/>
          <mesh position={[x, .025, z]} rotation={[0, 0, Math.PI / 2]} castShadow><cylinderGeometry args={[.024, .024, .019, 12]}/><meshStandardMaterial color='#30372f' roughness={.98}/></mesh>
        </group>)}
        <Pole from={[x, .10, -.32]} to={[x, .30, .22]} radius={.007} color='#66756a' metalness={.55}/>
        <Pole from={[x, .30, -.22]} to={[x, .10, .32]} radius={.007} color='#66756a' metalness={.55}/>
      </group>)}
      <Pole from={[-.18, .31, -.32]} to={[.18, .31, -.32]} radius={.009} color={INK}/>
      <Pole from={[-.18, .31, .32]} to={[.18, .31, .32]} radius={.009} color={INK}/>
      {[-.30, .30].map(x => <group key={x}>
        <Pole from={[x, .345, 0]} to={[x, .434, 0]} radius={.005} color='#3b4b3f' metalness={.25}/>
        <RoundedBox args={[.047, .010, .038]} radius={.003} smoothness={2} position={[Math.sign(x) * .277, .34, 0]}><meshStandardMaterial color='#687469' roughness={.58} metalness={.5}/></RoundedBox>
      </group>)}
      <lineSegments geometry={net}><lineBasicMaterial color='#364639' transparent opacity={.52}/></lineSegments>
      <Pole from={[-.30, .432, 0]} to={[.30, .432, 0]} radius={.0025} color={CREAM} metalness={0}/>
      <mesh position={[.07, .373, .25]} castShadow><sphereGeometry args={[.012, 16, 12]}/><meshStandardMaterial color='#f0ead6' roughness={.75}/></mesh>
    </group>
    <group userData={PEOPLE} name='table-tennis-players'>
      <Athlete time={time} activity='racket' racketPose='ready' position={[-2.43, .08, -1.22]} scale={.83} shirt='#8a9d84' trousers='#314d3e' equipment={<TableTennisPaddle/>}/>
      <Athlete time={time} activity='racket' racketPose='ready' position={[-2.43, .08, .36]} angle={Math.PI} scale={.83} shirt='#c1ac89' trousers='#34463c' equipment={<TableTennisPaddle/>}/>
    </group>
  </>;
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
    <lineSegments geometry={net} position={[0, 0, -.29]}><lineBasicMaterial color='#d6d8bf' transparent opacity={.48}/></lineSegments>
    <lineSegments geometry={roof}><lineBasicMaterial color='#d6d8bf' transparent opacity={.40}/></lineSegments>
    {[-.625, .625].map(x => <lineSegments key={x} geometry={sideNet} position={[x, 0, 0]}><lineBasicMaterial color='#d6d8bf' transparent opacity={.40}/></lineSegments>)}
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
    if (football.current) { football.current.position.set(1.78, .147, .30 - shot * 1.42); football.current.rotation.x = -time.current.t * 3; }
    if (cricket.current) { const pass = (time.current.t / 4.4) % 1; cricket.current.position.set(.62, .11, -.95 + pass * 1.25); }
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
  // Other activities stay between points while the first rally is reviewed.
  const stillTime = useRef({t: 10 * Math.PI / 1.7});
  return <>
    <RecreationGround/>
    <PickleballNet/>
    <CourtBench/>
    <TableTennis time={stillTime}/>
    <group userData={EQUIPMENT}>
      <Goal/>
      <CricketWicket position={[.62, .08, -.95]}/>
      <CricketWicket position={[.62, .08, .70]}/>
    </group>
    <GymEquipment/>
    <group userData={PEOPLE}>
      <Athlete time={time} activity='racket' racketPose='pickleball-front' position={[-1.42, .08, .52]} angle={Math.PI} scale={.83} shirt='#d8dfce' trousers='#345345' equipment={<PickleballPaddle/>}/>
      <Athlete time={time} activity='racket' racketPose='pickleball-back' position={[-1.84, .08, -1.04]} scale={.83} shirt='#ad9671' equipment={<PickleballPaddle/>}/>
      <Athlete time={stillTime} activity='kick' position={[1.9, .08, .45]} angle={Math.PI} scale={.91} shirt='#e0ddc9' trousers='#4b6852'/>
      <Athlete time={stillTime} activity='bat' position={[.62, .08, .37]} angle={Math.PI} scale={.85} shirt='#eee8d6' trousers='#ddd6c1' equipment={<CricketBat/>}/>
      <Athlete time={stillTime} activity='lift' position={[.15, .085, 1.29]} scale={.94} shirt='#a88d67' trousers='#293d34' skin='#a97751'/>
    </group>
    <PickleballRallyBall time={time}/>
    <FieldBalls time={stillTime}/>
  </>;
}
