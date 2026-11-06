"use client";

import {useEffect, useMemo, useRef} from 'react';
import {useFrame} from '@react-three/fiber';
import * as THREE from 'three';
import type {ReactNode} from 'react';

type Point = [number, number, number];
type Activity = 'racket' | 'kick' | 'bat' | 'lift';
type Props = {
  time: React.RefObject<{t: number}>;
  activity: Activity;
  position: Point;
  angle?: number;
  phase?: number;
  scale?: number;
  shirt?: string;
  trousers?: string;
  skin?: string;
  equipment?: ReactNode;
};
const UP = new THREE.Vector3(0, 1, 0);
const LIMBS = ['leftUpperArm', 'leftForearm', 'rightUpperArm', 'rightForearm', 'leftThigh', 'leftShin', 'rightThigh', 'rightShin'] as const;
type LimbName = typeof LIMBS[number];

function jerseyGeometry() {
  const vertices: number[] = [], indices: number[] = [];
  const rings = [[.555, .105, .067], [.62, .12, .073], [.755, .15, .079], [.81, .14, .068]];
  rings.forEach(([y, width, depth]) => {
    for (let i = 0; i < 20; i++) { const a = i / 20 * Math.PI * 2; vertices.push(Math.cos(a) * width, y, Math.sin(a) * depth); }
  });
  for (let ring = 0; ring < rings.length - 1; ring++) for (let i = 0; i < 20; i++) {
    const a = ring * 20 + i, b = ring * 20 + (i + 1) % 20;
    indices.push(a, a + 20, b, b, a + 20, b + 20);
  }
  const geometry = new THREE.BufferGeometry(); geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3)); geometry.setIndex(indices); geometry.computeVertexNormals();
  return geometry;
}

/** Adult-proportioned, articulated sporting figure. Limbs follow joint positions,
 * rather than swinging a single rigid cylinder from the shoulder or hip. */
export default function Athlete({time, activity, position, angle = 0, phase = 0, scale = 1, shirt = '#e2dfce', trousers = '#283b34', skin = '#bb8861', equipment}: Props) {
  const limbs = useRef<Partial<Record<LimbName, THREE.Mesh>>>({});
  const joints = useRef<Record<string, THREE.Mesh>>({});
  const torso = useRef<THREE.Mesh>(null), pelvis = useRef<THREE.Mesh>(null), head = useRef<THREE.Group>(null);
  const leftHand = useRef<THREE.Group>(null), rightHand = useRef<THREE.Group>(null);
  const leftShoe = useRef<THREE.Group>(null), rightShoe = useRef<THREE.Group>(null), bar = useRef<THREE.Group>(null);
  const geometry = useMemo(() => jerseyGeometry(), []);
  const scratch = useMemo(() => ({a: new THREE.Vector3(), b: new THREE.Vector3(), direction: new THREE.Vector3()}), []);
  const materials = useMemo(() => ({
    skin: new THREE.MeshStandardMaterial({color: skin, roughness: .86}),
    fabric: new THREE.MeshStandardMaterial({color: shirt, roughness: .96}),
    shorts: new THREE.MeshStandardMaterial({color: trousers, roughness: .94}),
    shoe: new THREE.MeshStandardMaterial({color: '#27302a', roughness: .89}),
    sole: new THREE.MeshStandardMaterial({color: '#dfddcc', roughness: .9}),
    hair: new THREE.MeshStandardMaterial({color: '#342b24', roughness: 1}),
    steel: new THREE.MeshStandardMaterial({color: '#9ba69e', metalness: .75, roughness: .36}),
  }), [shirt, trousers, skin]);
  useEffect(() => () => { geometry.dispose(); Object.values(materials).forEach(material => material.dispose()); }, [geometry, materials]);
  useFrame(() => {
    const t = time.current.t + phase, wave = Math.sin(t * 1.7), action = (Math.sin(t * 1.35) + 1) / 2;
    const crouch = activity === 'racket' ? .025 * (wave + 1) / 2 : activity === 'bat' ? .027 : .005;
    const hipY = .53 - crouch, shoulderY = .785 - crouch;
    const ls: Point = [-.145, shoulderY, 0], rs: Point = [.145, shoulderY, 0];
    const lh: Point = [-.082, hipY, 0], rh: Point = [.082, hipY, 0];
    let le: Point = [-.22, .65, .035], re: Point = [.22, .65, .035];
    let lw: Point = [-.20, .53, .12], rw: Point = [.20, .53, .12];
    let lk: Point = [-.10, .285, .025], rk: Point = [.10, .285, .025];
    let la: Point = [-.10, .062, .02], ra: Point = [.10, .062, .02];
    let wristX = 0, wristZ = 0;
    if (activity === 'racket') {
      le = [-.23, .66 - crouch, .04]; lw = [-.19, .76 - crouch, .17];
      if (time.current.t % 24 < 12) {
        re = [.23, .91 - crouch + wave * .065, .035]; rw = [.19, 1.10 - crouch + wave * .085, .16 + Math.cos(t * 1.7) * .06];
      } else {
        re = [.23, .65 - crouch, .07]; rw = [.22, .54 - crouch + wave * .045, .27 + Math.cos(t * 1.7) * .075];
      }
      lk = [-.13, .28 - crouch, .08]; rk = [.13, .28 - crouch, .05];
      la = [-.15, .062, .04]; ra = [.15, .062, -.04]; wristX = -.22 + wave * .5; wristZ = -.12 + wave * .16;
    } else if (activity === 'kick') {
      const kick = Math.pow(action, 3);
      le = [-.25, .70, -.02]; lw = [-.31, .70, .14]; re = [.24, .65, -.04]; rw = [.31, .59, -.13];
      lk = [-.11, .285, .04]; rk = [.13, .29 + kick * .035, .07 + kick * .13];
      la = [-.105, .062, 0]; ra = [.13, .062 + kick * .045, .05 + kick * .29];
    } else if (activity === 'bat') {
      le = [-.16, .64, .15]; re = [.17, .64, .14];
      rw = [.07 + wave * .07, .63 + action * .11, .27]; lw = [rw[0] - .065, rw[1] + .01, rw[2] + .015];
      lk = [-.12, .27, .07]; rk = [.15, .27, .04]; la = [-.17, .062, .07]; ra = [.17, .062, -.04];
      wristX = -.15 + wave * .7; wristZ = -.08 + wave * .25;
    } else {
      const curl = action * .25;
      le = [-.18, .60, .025]; re = [.18, .60, .025];
      lw = [-.23, .51 + curl, .18 + action * .07]; rw = [.23, .51 + curl, .18 + action * .07];
      la = [-.12, .062, .02]; ra = [.12, .062, .02];
      if (bar.current) bar.current.position.set(0, rw[1], rw[2]);
    }
    const setLimb = (name: LimbName, from: Point, to: Point) => {
      const mesh = limbs.current[name]; if (!mesh) return;
      scratch.a.set(...from); scratch.b.set(...to); scratch.direction.subVectors(scratch.b, scratch.a);
      mesh.position.copy(scratch.a).add(scratch.b).multiplyScalar(.5);
      const length = scratch.direction.length();
      mesh.quaternion.setFromUnitVectors(UP, scratch.direction.normalize()); mesh.scale.y = length;
    };
    setLimb('leftUpperArm', ls, le); setLimb('leftForearm', le, lw); setLimb('rightUpperArm', rs, re); setLimb('rightForearm', re, rw);
    setLimb('leftThigh', lh, lk); setLimb('leftShin', lk, la); setLimb('rightThigh', rh, rk); setLimb('rightShin', rk, ra);
    for (const [name, point] of [['leftElbow', le], ['rightElbow', re], ['leftKnee', lk], ['rightKnee', rk]] as const) {
      if (joints.current[name]) joints.current[name].position.set(...point);
    }
    if (torso.current) torso.current.position.y = -crouch;
    if (pelvis.current) pelvis.current.position.y = .535 - crouch;
    if (head.current) { head.current.position.y = -crouch; head.current.rotation.y = activity === 'racket' ? wave * .08 : 0; }
    if (leftHand.current) leftHand.current.position.set(...lw);
    if (rightHand.current) { rightHand.current.position.set(...rw); rightHand.current.rotation.set(wristX, 0, wristZ); }
    if (leftShoe.current) leftShoe.current.position.set(la[0], la[1] - .032, la[2] + .035);
    if (rightShoe.current) { rightShoe.current.position.set(ra[0], ra[1] - .032, ra[2] + .035); rightShoe.current.rotation.x = activity === 'kick' ? -action * .38 : 0; }
  });
  return <group position={position} rotation={[0, angle, 0]} scale={scale}>
    <mesh ref={torso} geometry={geometry} material={materials.fabric} castShadow/>
    <mesh ref={pelvis} position={[0, .535, 0]} scale={[.13, .078, .08]} material={materials.shorts} castShadow><sphereGeometry args={[1, 16, 12]}/></mesh>
    {LIMBS.map(name => {
      const thigh = name.includes('Thigh'), shin = name.includes('Shin'), forearm = name.includes('Forearm');
      return <mesh key={name} ref={mesh => { if (mesh) limbs.current[name] = mesh; }} material={thigh ? materials.shorts : shin || forearm ? materials.skin : materials.fabric} castShadow={thigh || shin}>
        <cylinderGeometry args={[thigh ? .046 : shin ? .03 : forearm ? .025 : .036, thigh ? .057 : shin ? .038 : forearm ? .03 : .042, 1, 12]}/>
      </mesh>;
    })}
    {['leftElbow', 'rightElbow', 'leftKnee', 'rightKnee'].map(name => <mesh key={name} ref={mesh => { if (mesh) joints.current[name] = mesh; }} material={materials.skin}><sphereGeometry args={[name.includes('Knee') ? .036 : .029, 10, 8]}/></mesh>)}
    <group ref={head}>
      <mesh position={[0, .815, 0]} scale={[1, 1, .52]} material={materials.fabric}><cylinderGeometry args={[.04, .14, .07, 18]}/></mesh>
      <mesh position={[0, .855, 0]} material={materials.skin}><cylinderGeometry args={[.036, .038, .075, 12]}/></mesh>
      <mesh position={[0, .932, .008]} scale={[.94, 1.1, .96]} material={materials.skin} castShadow><sphereGeometry args={[.067, 20, 16]}/></mesh>
      <mesh position={[0, .978, -.006]} scale={[1, .52, .98]} material={materials.hair}><sphereGeometry args={[.069, 18, 12]}/></mesh>
      <mesh position={[0, .933, .071]} scale={[.55, .65, 1]} material={materials.skin}><sphereGeometry args={[.018, 10, 8]}/></mesh>
      {[-.023, .023].map(x => <mesh key={x} position={[x, .951, .065]} material={materials.hair}><sphereGeometry args={[.0045, 8, 6]}/></mesh>)}
    </group>
    <group ref={leftHand}><mesh material={materials.skin} scale={[.8, 1.2, .8]}><sphereGeometry args={[.027, 10, 8]}/></mesh></group>
    <group ref={rightHand}><mesh material={materials.skin} scale={[.8, 1.2, .8]}><sphereGeometry args={[.027, 10, 8]}/></mesh>{equipment}</group>
    <group ref={leftShoe}>
      <mesh material={materials.shoe} scale={[.048, .032, .09]} castShadow><sphereGeometry args={[1, 14, 10]}/></mesh>
      <mesh position={[0, -.024, .006]} material={materials.sole}><boxGeometry args={[.082, .012, .15]}/></mesh>
      <mesh position={[0, .02, .012]} material={materials.sole}><boxGeometry args={[.04, .006, .036]}/></mesh>
    </group>
    <group ref={rightShoe}>
      <mesh material={materials.shoe} scale={[.048, .032, .09]} castShadow><sphereGeometry args={[1, 14, 10]}/></mesh>
      <mesh position={[0, -.024, .006]} material={materials.sole}><boxGeometry args={[.082, .012, .15]}/></mesh>
      <mesh position={[0, .02, .012]} material={materials.sole}><boxGeometry args={[.04, .006, .036]}/></mesh>
    </group>
    {activity === 'lift' && <group ref={bar}>
      <mesh rotation={[0, 0, Math.PI / 2]} material={materials.steel} castShadow><cylinderGeometry args={[.015, .015, .84, 12]}/></mesh>
      {[-1, 1].map(side => <group key={side} position={[side * .34, 0, 0]}>
        <mesh rotation={[0, 0, Math.PI / 2]} material={materials.shoe} castShadow><cylinderGeometry args={[.115, .115, .075, 24]}/></mesh>
        <mesh position={[side * .043, 0, 0]} rotation={[0, 0, Math.PI / 2]} material={materials.steel}><cylinderGeometry args={[.035, .035, .014, 16]}/></mesh>
      </group>)}
    </group>}
  </group>;
}
