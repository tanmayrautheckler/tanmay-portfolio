"use client";

/* Scene-owned transforms are updated by the book's demand-driven renderer. */
import {useEffect, useMemo, useRef} from 'react';
import {useFrame} from '@react-three/fiber';
import {useTexture} from '@react-three/drei/core/Texture';
import * as THREE from 'three';
import ThoughtCard from './journal-paper-card';

type Time = {time: React.RefObject<{t: number}>};
type Point = [number, number, number];
const PAPER = '#eadfc6', INK = '#243c36', GOLD = '#b89b61';
const SAGE = '#7b8d75', CHARCOAL = '#222a26', WARM_WHITE = '#f8f0db';
const TERRAIN = {journalLayer: 'terrain', revealOrder: 0};
const ACTORS = {journalLayer: 'actors', revealOrder: 1};
const ATMOSPHERE = {journalLayer: 'atmosphere', revealOrder: 2};
const atlasHeight = (x: number) => {
  const phase = ((x + 2.4) % 1.6) / 1.6;
  return .045 + (1 - Math.abs(phase * 2 - 1)) * .19;
};

function Rod({from, to, radius = .015, color = GOLD}: {from: Point; to: Point; radius?: number; color?: string}) {
  const transform = useMemo(() => {
    const a = new THREE.Vector3(...from), b = new THREE.Vector3(...to);
    const direction = b.clone().sub(a);
    return {
      center: a.add(b).multiplyScalar(.5),
      length: direction.length(),
      rotation: new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction.normalize()),
    };
  }, [from, to]);
  return <mesh position={transform.center} quaternion={transform.rotation} castShadow>
    <cylinderGeometry args={[radius, radius, transform.length, 8]}/>
    <meshStandardMaterial color={color} roughness={.55} metalness={.2}/>
  </mesh>;
}

function FormulaCar({carRef, time}: Time & {carRef: React.RefObject<THREE.Group | null>}) {
  const wheels = useRef<THREE.Group>(null);
  useFrame(() => {
    if (wheels.current) wheels.current.children.forEach(wheel => { wheel.rotation.x = -Math.min(time.current.t, 8.5) * 7.5; });
  });
  return <group ref={carRef} scale={.8}>
    <mesh position={[0, .10, -.015]} castShadow><boxGeometry args={[.26, .105, .95]}/><meshStandardMaterial color={INK} roughness={.35}/></mesh>
    <mesh position={[0, .16, .34]} rotation={[Math.PI / 2, 0, Math.PI / 4]} scale={[1, 1, .68]} castShadow><coneGeometry args={[.14, .62, 4]}/><meshStandardMaterial color={INK} roughness={.35}/></mesh>
    {[-1, 1].map(side => <group key={side}>
      <mesh position={[side * .235, .17, -.13]} rotation={[0, side * .05, 0]} castShadow><boxGeometry args={[.2, .17, .49]}/><meshStandardMaterial color={INK} roughness={.35}/></mesh>
      <mesh position={[side * .235, .262, -.11]}><boxGeometry args={[.16, .008, .36]}/><meshStandardMaterial color={GOLD} metalness={.4} roughness={.45}/></mesh>
      {[-.39, .39].map(z => <Rod key={z} from={[side * .09, .1, z * .7]} to={[side * .35, .12, z]} radius={.012} color={CHARCOAL}/>)}
    </group>)}
    <mesh position={[0, .23, -.23]} scale={[.12, .19, .29]} castShadow><sphereGeometry args={[1, 18, 14]}/><meshStandardMaterial color={INK} roughness={.35}/></mesh>
    <mesh position={[0, .238, .04]} scale={[1, .55, 1.3]}><sphereGeometry args={[.115, 18, 12]}/><meshStandardMaterial color={CHARCOAL} roughness={.8}/></mesh>
    <mesh position={[0, .29, .02]} castShadow><sphereGeometry args={[.068, 16, 12]}/><meshStandardMaterial color={PAPER} roughness={.5}/></mesh>
    <mesh position={[0, .31, .05]} rotation={[-Math.PI / 2, 0, 0]} scale={[.86, 1.2, 1]}><torusGeometry args={[.145, .015, 7, 28, Math.PI * 1.75]}/><meshStandardMaterial color={GOLD} metalness={.5} roughness={.4}/></mesh>
    <Rod from={[0, .32, .18]} to={[0, .14, .29]} radius={.014}/>
    <group ref={wheels}>
      {[-1, 1].flatMap(side => [-1, 1].map(axle => <group key={`${side}-${axle}`} position={[side * .365, .145, axle * .365]}>
        <mesh rotation={[0, 0, Math.PI / 2]} castShadow><cylinderGeometry args={[.145, .145, axle < 0 ? .15 : .12, 24]}/><meshStandardMaterial color={CHARCOAL} roughness={.94}/></mesh>
        <mesh position={[side * .079, 0, 0]} rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[.085, .085, .006, 20]}/><meshStandardMaterial color={GOLD} roughness={.45} metalness={.5}/></mesh>
        <mesh position={[side * .083, 0, 0]} rotation={[0, Math.PI / 2, 0]}><torusGeometry args={[.107, .005, 5, 24]}/><meshStandardMaterial color={PAPER}/></mesh>
      </group>))}
    </group>
    <mesh position={[0, .095, .6]} castShadow><boxGeometry args={[.85, .025, .17]}/><meshStandardMaterial color={GOLD} roughness={.4}/></mesh>
    <mesh position={[0, .13, .565]} castShadow><boxGeometry args={[.75, .023, .08]}/><meshStandardMaterial color={INK}/></mesh>
    <mesh position={[0, .34, -.53]} castShadow><boxGeometry args={[.73, .035, .18]}/><meshStandardMaterial color={GOLD} roughness={.4}/></mesh>
    {[-.32, .32].map(x => <mesh key={x} position={[x, .26, -.54]} castShadow><boxGeometry args={[.025, .2, .21]}/><meshStandardMaterial color={INK}/></mesh>)}
    <Rod from={[-.12, .1, -.45]} to={[-.12, .34, -.53]} radius={.012}/>
    <Rod from={[.12, .1, -.45]} to={[.12, .34, -.53]} radius={.012}/>
  </group>;
}

export function RaceWeekend({time}: Time) {
  const car = useRef<THREE.Group>(null), curbs = useRef<THREE.InstancedMesh>(null);
  const path = useMemo(() => new THREE.CatmullRomCurve3(Array.from({length: 64}, (_, i) => {
    const a = i / 64 * Math.PI * 2;
    return new THREE.Vector3(Math.cos(a) * 2.03, .027, .08 + Math.sin(a) * .91);
  }), true), []);
  const track = useMemo(() => {
    const shape = new THREE.Shape();
    shape.absellipse(0, 0, 2.46, 1.3, 0, Math.PI * 2, false, 0);
    const hole = new THREE.Path();
    hole.absellipse(0, 0, 1.63, .54, 0, Math.PI * 2, true, 0);
    shape.holes.push(hole);
    return shape;
  }, []);
  useEffect(() => {
    if (!curbs.current) return;
    const dummy = new THREE.Object3D();
    for (let i = 0; i < 112; i++) {
      const a = i / 112 * Math.PI * 2;
      dummy.position.set(Math.cos(a) * 2.46, .052, .08 + Math.sin(a) * 1.3);
      dummy.rotation.y = Math.atan2(-Math.sin(a) * 2.46, Math.cos(a) * 1.3);
      dummy.updateMatrix();
      curbs.current.setMatrixAt(i, dummy.matrix);
      curbs.current.setColorAt(i, new THREE.Color(i % 2 ? PAPER : GOLD));
    }
    curbs.current.instanceMatrix.needsUpdate = true;
    if (curbs.current.instanceColor) curbs.current.instanceColor.needsUpdate = true;
  }, []);
  useFrame(() => {
    if (!car.current) return;
    const progress = THREE.MathUtils.clamp(time.current.t / 8.5, 0, 1);
    const point = path.getPointAt(progress), tangent = path.getTangentAt(progress);
    car.current.position.copy(point);
    car.current.rotation.y = Math.atan2(tangent.x, tangent.z);
  });
  return <>
    <group userData={TERRAIN}>
      <mesh position={[0, .025, .08]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow><shapeGeometry args={[track, 80]}/><meshStandardMaterial color='#44564f' roughness={.97} side={THREE.DoubleSide}/></mesh>
      <mesh><tubeGeometry args={[path, 96, .006, 4, true]}/><meshStandardMaterial color={PAPER} roughness={.9}/></mesh>
      <instancedMesh ref={curbs} args={[undefined, undefined, 112]} receiveShadow><boxGeometry args={[.112, .036, .05]}/><meshStandardMaterial roughness={1}/></instancedMesh>
      <mesh position={[2.03, .062, .08]} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[.7, .065]}/><meshStandardMaterial color={WARM_WHITE}/></mesh>
    </group>
    <group userData={ACTORS}>
      <FormulaCar carRef={car} time={time}/>
      <group position={[0, .025, .22]}>
        {[0, 1, 2].map(row => <mesh key={row} position={[0, .08 + row * .11, -.22 - row * .12]} castShadow receiveShadow><boxGeometry args={[1.75, .13 + row * .08, .2]}/><meshStandardMaterial color={row % 2 ? SAGE : PAPER} roughness={.85}/></mesh>)}
        <mesh position={[0, .65, -.3]} rotation={[.08, 0, 0]} castShadow><boxGeometry args={[2.0, .035, .5]}/><meshStandardMaterial color={INK} roughness={.8}/></mesh>
        {[-.84, .84].map(x => <Rod key={x} from={[x, 0, -.49]} to={[x, .64, -.49]} radius={.018}/>)}
        <mesh position={[0, .15, .08]} castShadow><boxGeometry args={[1.85, .29, .06]}/><meshStandardMaterial color={PAPER}/></mesh>
        {[-.67, -.34, 0, .34, .67].map(x => <mesh key={x} position={[x, .2, .114]}><planeGeometry args={[.19, .065]}/><meshStandardMaterial color={INK}/></mesh>)}
      </group>
    </group>
  </>;
}

function Atlas() {
  const source = useTexture('/images/about/journal/world-atlas.webp');
  const texture = useMemo(() => {
    // Own this print's sampler settings without mutating the shared loader cache.
    const print = source.clone();
    print.colorSpace = THREE.SRGBColorSpace;
    print.anisotropy = 4;
    print.needsUpdate = true;
    return print;
  }, [source]);
  const geometry = useMemo(() => {
    const surface = new THREE.PlaneGeometry(4.8, 2.55, 48, 12);
    surface.rotateX(-Math.PI / 2);
    const position = surface.attributes.position;
    for (let i = 0; i < position.count; i++) {
      const x = position.getX(i);
      // Alternating paper creases meet the supporting page at each valley.
      position.setY(i, atlasHeight(x));
    }
    position.needsUpdate = true; surface.computeVertexNormals(); return surface;
  }, []);
  useEffect(() => () => { texture.dispose(); geometry.dispose(); }, [texture, geometry]);
  return <mesh geometry={geometry} position={[0, 0, .16]} receiveShadow castShadow><meshStandardMaterial map={texture} roughness={1} side={THREE.DoubleSide}/></mesh>;
}

export function WorldWatch({time, variant = 'both'}: Time & {variant?: 'markets' | 'world' | 'both'}) {
  const bars = useRef<THREE.Group>(null);
  const chart = useMemo(() => new THREE.CatmullRomCurve3([
    [0, .28, 0], [.32, .5, 0], [.64, .4, 0], [.96, .74, 0], [1.28, .61, 0], [1.6, 1, 0],
  ].map(point => new THREE.Vector3(...point))), []);
  const routes = useMemo(() => [
    [[-1.28, atlasHeight(-1.28) + .03, -.35], [-.56, 1.1, -.28], [.63, atlasHeight(.63) + .03, -.22]],
    [[.63, atlasHeight(.63) + .03, -.22], [1.12, .9, .13], [1.67, atlasHeight(1.67) + .03, .55]],
    [[-1.28, atlasHeight(-1.28) + .03, -.35], [-1.4, .76, .15], [-1.01, atlasHeight(-1.01) + .03, .72]],
  ].map(points => new THREE.CatmullRomCurve3(points.map(point => new THREE.Vector3(...point)))), []);
  useFrame(() => {
    if (bars.current) bars.current.scale.y = Math.max(.03, THREE.MathUtils.smoothstep(time.current.t, .5, 2.4));
  });
  return <>
    {variant !== 'world' && <>
      <group userData={TERRAIN}>
        <mesh position={[-1.68, .07, .64]} castShadow receiveShadow><boxGeometry args={[2.23, .12, 1.54]}/><meshStandardMaterial color={INK} roughness={.75}/></mesh>
        {Array.from({length: 5}, (_, i) => <mesh key={i} position={[-1.68, .135, .13 + i * .25]} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[2.05, .007]}/><meshStandardMaterial color={SAGE}/></mesh>)}
      </group>
      <group userData={ACTORS}>
        <group ref={bars} position={[-2.48, .13, .95]}>
          {[.27, .49, .39, .73, .6, .99].map((height, i) => <group key={i} position={[i * .32, 0, 0]}>
            <mesh position={[0, height / 2, 0]} castShadow><boxGeometry args={[.19, height, .25]}/><meshStandardMaterial color={i % 2 ? GOLD : SAGE} roughness={.6}/></mesh>
            <mesh position={[0, height + .003, 0]}><boxGeometry args={[.19, .009, .25]}/><meshStandardMaterial color={PAPER}/></mesh>
          </group>)}
          <mesh castShadow><tubeGeometry args={[chart, 48, .021, 7, false]}/><meshStandardMaterial color={GOLD} metalness={.35} roughness={.5}/></mesh>
        </group>
      </group>
    </>}
    {variant !== 'markets' && <>
      <group userData={TERRAIN}><Atlas/></group>
      <group userData={ACTORS}>
        {[[-1.28, -.35], [.63, -.22], [1.67, .55], [-1.01, .72]].map(([x, z], i) => <group key={i} position={[x, atlasHeight(x) + .01, z]}>
          <mesh rotation={[-Math.PI / 2, 0, 0]}><ringGeometry args={[.085, .12, 32]}/><meshStandardMaterial color={GOLD}/></mesh>
          <mesh position={[0, .04, 0]} castShadow><sphereGeometry args={[.045, 12, 8]}/><meshStandardMaterial color={INK}/></mesh>
        </group>)}
        {routes.map((route, i) => <mesh key={i} castShadow><tubeGeometry args={[route, 32, .014, 6, false]}/><meshStandardMaterial color={GOLD} roughness={.55} metalness={.25}/></mesh>)}
      </group>
    </>}
  </>;
}

function CinemaScreen({time}: Time) {
  const reels = useRef<THREE.Group>(null), light = useRef<THREE.MeshBasicMaterial>(null);
  const map = useMemo(() => {
    const canvas = document.createElement('canvas'); canvas.width = 960; canvas.height = 540;
    const ctx = canvas.getContext('2d')!;
    const gradient = ctx.createLinearGradient(0, 0, 0, 540); gradient.addColorStop(0, '#142a2b'); gradient.addColorStop(1, '#73917b');
    ctx.fillStyle = gradient; ctx.fillRect(0, 0, 960, 540);
    const glow = ctx.createRadialGradient(680, 170, 8, 680, 170, 200); glow.addColorStop(0, '#e7c991'); glow.addColorStop(1, '#8c9b7b00');
    ctx.fillStyle = glow; ctx.fillRect(0, 0, 960, 540);
    ctx.fillStyle = '#f2dfb3'; ctx.beginPath(); ctx.arc(680, 170, 44, 0, Math.PI * 2); ctx.fill();
    const ridges = [[420, '#566c5b'], [470, '#384f45'], [520, '#203a34']] as const;
    ridges.forEach(([baseline, color], ridge) => {
      ctx.fillStyle = color; ctx.beginPath(); ctx.moveTo(0, 540);
      for (let x = 0; x <= 960; x += 30) ctx.lineTo(x, baseline - Math.sin(x * .009 + ridge) * 45 - Math.cos(x * .017 - ridge) * 23);
      ctx.lineTo(960, 540); ctx.closePath(); ctx.fill();
    });
    // Original landscape artwork, rather than a borrowed film frame.
    const texture = new THREE.CanvasTexture(canvas); texture.colorSpace = THREE.SRGBColorSpace; return texture;
  }, []);
  const beam = useMemo(() => {
    const origin = new THREE.Vector3(1.595, .57, .761), end = new THREE.Vector3(-.22, 1.08, -.707);
    const axis = end.clone().sub(origin);
    return {center: origin.clone().add(end).multiplyScalar(.5), length: axis.length(), rotation: new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), axis.normalize())};
  }, []);
  useEffect(() => () => map.dispose(), [map]);
  useFrame(() => {
    if (reels.current) reels.current.children.forEach(reel => { reel.rotation.z = -time.current.t * .8; });
    if (light.current) light.current.opacity = .045 + Math.sin(time.current.t * 18) * .003;
  });
  return <>
    <group userData={TERRAIN}>
      <mesh position={[-.22, .04, -.62]} castShadow receiveShadow><boxGeometry args={[3.2, .07, .47]}/><meshStandardMaterial color={INK}/></mesh>
      <mesh position={[-.22, 1.08, -.75]} castShadow><boxGeometry args={[3.12, 1.78, .075]}/><meshStandardMaterial color={PAPER} roughness={.95}/></mesh>
      <mesh position={[-.22, 1.08, -.707]}><planeGeometry args={[2.91, 1.6]}/><meshBasicMaterial map={map} toneMapped={false}/></mesh>
      {[-1.58, 1.14].map(x => <Rod key={x} from={[x, .08, -.62]} to={[x, .35, -.75]} radius={.025}/>)}
      {[-1.4, -.91, -.42, .07, .56].map(x => <group key={x} position={[x, 0, .83]}>
        <mesh position={[0, .16, 0]} castShadow><boxGeometry args={[.36, .1, .32]}/><meshStandardMaterial color={INK}/></mesh>
        <mesh position={[0, .34, .12]} rotation={[-.13, 0, 0]} castShadow><boxGeometry args={[.36, .36, .075]}/><meshStandardMaterial color={SAGE}/></mesh>
        {[-.12, .12].map(side => <Rod key={side} from={[side, .02, -.06]} to={[side, .12, -.06]} radius={.014}/>)}
      </group>)}
    </group>
    <group userData={ACTORS}>
      <group position={[1.82, 0, 1.12]} rotation={[0, .56, 0]}>
        <mesh position={[0, .08, 0]} castShadow><boxGeometry args={[.76, .15, .68]}/><meshStandardMaterial color={PAPER}/></mesh>
        <Rod from={[0, .15, 0]} to={[0, .39, 0]} radius={.055} color={INK}/>
        <mesh position={[0, .52, 0]} castShadow><boxGeometry args={[.59, .41, .42]}/><meshStandardMaterial color={INK} roughness={.65}/></mesh>
        <mesh position={[0, .57, -.3]} rotation={[Math.PI / 2, 0, 0]} castShadow><cylinderGeometry args={[.115, .13, .24, 24]}/><meshStandardMaterial color={GOLD} metalness={.5} roughness={.45}/></mesh>
        <mesh position={[0, .57, -.424]} rotation={[Math.PI / 2, 0, 0]}><circleGeometry args={[.089, 24]}/><meshBasicMaterial color={WARM_WHITE}/></mesh>
        <group ref={reels}>
          {[-.27, .27].map(x => <group key={x} position={[x, .95, .035]}>
            <mesh castShadow><torusGeometry args={[.23, .025, 8, 32]}/><meshStandardMaterial color={GOLD} metalness={.4} roughness={.45}/></mesh>
            <mesh rotation={[Math.PI / 2, 0, 0]} castShadow><cylinderGeometry args={[.06, .06, .08, 16]}/><meshStandardMaterial color={GOLD}/></mesh>
            {Array.from({length: 5}, (_, i) => <mesh key={i} position={[Math.cos(i / 5 * Math.PI * 2) * .11, Math.sin(i / 5 * Math.PI * 2) * .11, 0]} rotation={[0, 0, i / 5 * Math.PI * 2]}><boxGeometry args={[.22, .025, .022]}/><meshStandardMaterial color={GOLD}/></mesh>)}
          </group>)}
        </group>
      </group>
    </group>
    <group userData={ATMOSPHERE}>
      <mesh position={beam.center} quaternion={beam.rotation}>
        <cylinderGeometry args={[.73, .035, beam.length, 28, 1, true]}/><meshBasicMaterial ref={light} color='#ffe8ae' transparent opacity={.045} depthWrite={false} side={THREE.DoubleSide}/>
      </mesh>
    </group>
  </>;
}

function TacticalArena({time}: Time) {
  const signal = useRef<THREE.Mesh>(null);
  useFrame(() => {
    if (signal.current) signal.current.scale.setScalar(.94 + Math.sin(time.current.t * 2) * .04);
  });
  return <>
    <group userData={TERRAIN}>
      <mesh position={[0, .06, .15]} castShadow receiveShadow><boxGeometry args={[4.65, .11, 2.75]}/><meshStandardMaterial color={PAPER} roughness={1}/></mesh>
      {[[-1.5, -.5, 1.1, .65], [.23, -.6, 1.0, .45], [1.55, .4, .55, 1.2], [-.7, .95, 1.3, .35]].map(([x, z, w, d], i) => <group key={i} position={[x, .12, z]}>
        <mesh position={[0, .34, 0]} castShadow receiveShadow><boxGeometry args={[w, .68, d]}/><meshStandardMaterial color={i % 2 ? SAGE : INK} roughness={.9}/></mesh>
        <mesh position={[0, .7, 0]} castShadow><boxGeometry args={[w + .055, .045, d + .055]}/><meshStandardMaterial color={GOLD} roughness={.7}/></mesh>
        <mesh position={[0, .37, d / 2 + .004]}><planeGeometry args={[w * .58, .33]}/><meshStandardMaterial color='#aab19a'/></mesh>
      </group>)}
      <mesh position={[-.08, .122, .15]} rotation={[-Math.PI / 2, 0, 0]}><ringGeometry args={[.39, .41, 48]}/><meshStandardMaterial color={GOLD}/></mesh>
    </group>
    <group userData={ACTORS}>
      <group position={[-.08, .12, .15]}>
        <mesh position={[0, .11, 0]} rotation={[0, Math.PI / 4, 0]} castShadow><boxGeometry args={[.24, .22, .24]}/><meshStandardMaterial color={INK}/></mesh>
        <mesh ref={signal} position={[0, .33, 0]} rotation={[0, Math.PI / 4, 0]} castShadow><octahedronGeometry args={[.17, 0]}/><meshStandardMaterial color={GOLD} roughness={.45} metalness={.35}/></mesh>
      </group>
      {[[-1.5, .58], [.93, -.61]].map(([x, z], i) => <group key={i} position={[x, .12, z]} rotation={[0, i ? -.55 : .5, 0]}>
        <mesh position={[0, .27, 0]} castShadow><capsuleGeometry args={[.075, .24, 5, 10]}/><meshStandardMaterial color={i ? GOLD : INK}/></mesh>
        <mesh position={[0, .49, 0]} castShadow><sphereGeometry args={[.083, 14, 10]}/><meshStandardMaterial color={PAPER}/></mesh>
        {[-.045, .045].map(side => <Rod key={side} from={[side, .025, .025]} to={[side, .22, 0]} radius={.025} color={INK}/>)}
        <Rod from={[-.09, .31, 0]} to={[.01, .31, .17]} radius={.022} color={INK}/>
        <Rod from={[.09, .31, 0]} to={[.01, .31, .17]} radius={.022} color={INK}/>
      </group>)}
    </group>
  </>;
}

export function AfterHours({time, variant = 'both'}: Time & {variant?: 'valorant' | 'cinema' | 'both'}) {
  // The journal selects one topic per spread. The legacy combined variant remains supported.
  return variant === 'valorant' ? <TacticalArena time={time}/> : variant === 'cinema' ? <CinemaScreen time={time}/> : <>
    <group position={[-1.35, 0, 0]} scale={.51}><TacticalArena time={time}/></group>
    <group position={[1.35, 0, 0]} scale={.51}><CinemaScreen time={time}/></group>
  </>;
}

export function ResearchDesk() {
  const map = useMemo(() => {
    const canvas = document.createElement('canvas'); canvas.width = 768; canvas.height = 432;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = '#243c36'; ctx.fillRect(0, 0, 768, 432);
    ctx.fillStyle = PAPER; ctx.font = '28px Georgia'; ctx.fillText('Research desk', 38, 52);
    ctx.strokeStyle = '#50665a'; ctx.lineWidth = 1;
    for (let y = 100; y < 350; y += 50) { ctx.beginPath(); ctx.moveTo(38, y); ctx.lineTo(730, y); ctx.stroke(); }
    ctx.strokeStyle = GOLD; ctx.lineWidth = 4; ctx.beginPath();
    [[40, 260], [140, 290], [230, 200], [325, 220], [410, 150], [510, 175], [610, 120], [730, 150]].forEach(([x, y], i) => { if (i) ctx.lineTo(x, y); else ctx.moveTo(x, y); }); ctx.stroke();
    ctx.fillStyle = '#9fab91'; ctx.font = '18px monospace'; ctx.fillText('OBSERVE   /   QUESTION   /   TEST', 38, 390);
    const texture = new THREE.CanvasTexture(canvas); texture.colorSpace = THREE.SRGBColorSpace; return texture;
  }, []);
  useEffect(() => () => map.dispose(), [map]);
  return <>
    <group userData={TERRAIN}>
      <mesh position={[1.48, .07, .76]} castShadow receiveShadow><boxGeometry args={[2.2, .12, 1.65]}/><meshStandardMaterial color={PAPER} roughness={.9}/></mesh>
    </group>
    <group userData={ACTORS}>
      <group position={[1.45, .13, .28]}>
        <mesh position={[0, .105, .02]} castShadow><boxGeometry args={[.65, .055, .4]}/><meshStandardMaterial color={GOLD} roughness={.6}/></mesh>
        <Rod from={[0, .12, .02]} to={[0, .43, -.04]} radius={.035}/>
        <group position={[0, .82, -.04]} rotation={[-.12, 0, 0]}>
          <mesh castShadow><boxGeometry args={[1.91, 1.13, .075]}/><meshStandardMaterial color={INK} roughness={.7}/></mesh>
          <mesh position={[0, .01, .043]}><planeGeometry args={[1.76, .99]}/><meshBasicMaterial map={map} toneMapped={false}/></mesh>
        </group>
      </group>
      <mesh position={[1.34, .16, 1.1]} castShadow><boxGeometry args={[1.47, .045, .45]}/><meshStandardMaterial color={INK}/></mesh>
      {Array.from({length: 3}, (_, row) => Array.from({length: 9}, (_, column) => <mesh key={`${row}-${column}`} position={[.72 + column * .155, .189, .95 + row * .115]}><boxGeometry args={[.12, .012, .075]}/><meshStandardMaterial color={SAGE}/></mesh>))}
      <mesh position={[2.32, .18, 1.05]} scale={[.68, .37, 1]} castShadow><sphereGeometry args={[.15, 16, 12]}/><meshStandardMaterial color={GOLD} roughness={.6}/></mesh>
    </group>
  </>;
}

export function CuriosityStudy({time}: Time) {
  const needle = useRef<THREE.Mesh>(null);
  useFrame(() => {
    if (needle.current) needle.current.position.x = .52 + Math.min(time.current.t / 7, 1) * 1.67;
  });
  return <>
    <group userData={TERRAIN}>
      <mesh position={[-1.28, .07, .32]} castShadow receiveShadow><cylinderGeometry args={[.75, .79, .13, 48]}/><meshStandardMaterial color={INK} roughness={.8}/></mesh>
      <mesh position={[1.18, .035, .45]} rotation={[0, -.13, 0]} receiveShadow castShadow><boxGeometry args={[2.05, .045, 1.38]}/><meshStandardMaterial color={PAPER} roughness={1}/></mesh>
      <mesh position={[1.18, .065, .45]} rotation={[-Math.PI / 2, 0, -.13]}><planeGeometry args={[1.86, 1.15]}/><meshStandardMaterial color={WARM_WHITE}/></mesh>
    </group>
    <group userData={ACTORS}>
      <group position={[-1.28, .14, .32]}>
        <Rod from={[0, 0, 0]} to={[0, 1.38, 0]} radius={.035}/>
        <mesh position={[0, 1.36, 0]} castShadow><boxGeometry args={[.52, .045, .16]}/><meshStandardMaterial color={GOLD}/></mesh>
        {[0, .055].map(z => <mesh key={z} position={[0, .86, z]} scale={[1, 1.16, .6]} castShadow><torusGeometry args={[.49, .043, 10, 40, Math.PI]}/><meshStandardMaterial color={INK} roughness={.6}/></mesh>)}
        {[-1, 1].map(side => <group key={side} position={[side * .49, .76, .02]} rotation={[0, 0, side * .12]}>
          <mesh rotation={[0, 0, Math.PI / 2]} castShadow><cylinderGeometry args={[.23, .23, .13, 24]}/><meshStandardMaterial color={GOLD} roughness={.5} metalness={.2}/></mesh>
          <mesh position={[-side * .08, 0, 0]} rotation={[0, 0, Math.PI / 2]} castShadow><cylinderGeometry args={[.21, .21, .08, 24]}/><meshStandardMaterial color={INK} roughness={1}/></mesh>
        </group>)}
      </group>
      <group position={[1.18, .075, .45]} rotation={[0, -.13, 0]}>
        {Array.from({length: 27}, (_, i) => {
          const height = .045 + Math.pow(Math.sin(i * .67), 2) * .26;
          return <mesh key={i} position={[-.8 + i * .062, .005, -.17]} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[.018, height]}/><meshStandardMaterial color={i % 3 ? INK : GOLD}/></mesh>;
        })}
        <mesh position={[0, .004, .14]} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[1.65, .008]}/><meshStandardMaterial color={GOLD}/></mesh>
      </group>
      <mesh ref={needle} position={[.52, .09, .25]} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[.012, .5]}/><meshStandardMaterial color={GOLD}/></mesh>
      <group position={[.98, .02, 1.22]}>
        <mesh position={[0, .035, 0]} castShadow><boxGeometry args={[1.08, .07, .42]}/><meshStandardMaterial color={INK}/></mesh>
        <ThoughtCard label='Why?' position={[0, .22, -.02]}/>
      </group>
      <Rod from={[2.03, .09, .81]} to={[2.42, .09, -.1]} radius={.023} color={INK}/>
      <mesh position={[2.43, .09, -.13]} rotation={[-Math.PI / 2, -.4, 0]}><coneGeometry args={[.025, .09, 8]}/><meshStandardMaterial color={GOLD}/></mesh>
    </group>
  </>;
}
