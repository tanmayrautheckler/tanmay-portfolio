"use client";

import {useEffect, useMemo, type RefObject} from 'react';
import {useFrame} from '@react-three/fiber';
import {useGLTF} from '@react-three/drei/core/Gltf';
import {clone} from 'three/examples/jsm/utils/SkeletonUtils.js';
import {mergeGeometries} from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import * as THREE from 'three';
import {CLIMBER_MODEL_URL} from './journal-models';

type Point = [number, number, number];
const DESIGN_HEIGHT = 1.4;
const DEFAULT_HEIGHT = .83;
const UP = new THREE.Vector3(0, 1, 0);

/** Fixed surface contacts, in the default .83-high actor's local coordinates.
 * The actor faces +Z; a parent places the entire actor against its own crag. */
export const CLIMBER_HOLDS = {
 leftHand: [-.22, .99, .17].map(n => n * DEFAULT_HEIGHT / DESIGN_HEIGHT) as Point,
 rightHand: [.24, 1.11, .17].map(n => n * DEFAULT_HEIGHT / DESIGN_HEIGHT) as Point,
 nextHand: [.22, 1.31, .17].map(n => n * DEFAULT_HEIGHT / DESIGN_HEIGHT) as Point,
 leftFoot: [-.115, .03, .16].map(n => n * DEFAULT_HEIGHT / DESIGN_HEIGHT) as Point,
 rightFoot: [.13, .15, .17].map(n => n * DEFAULT_HEIGHT / DESIGN_HEIGHT) as Point,
} as const;

function ease(a: number, b: number, t: number) {
 const p = THREE.MathUtils.clamp((t - a) / (b - a), 0, 1); return p * p * (3 - 2 * p);
}

/** One deliberate move, hold, then a controlled down-climb to replay. All four
 * contacts remain fixed during the pull; the free hand moves only on release. */
export function climberMotion(seconds: number) {
 const t = ((Math.max(0, seconds) % 12) + 12) % 12;
 const reach = ease(1.2, 3.2, t) * (1 - ease(9.4, 11.2, t));
 const pull = ease(3.7, 6.4, t) * (1 - ease(7.9, 9.2, t));
 return {reach, pull, release: Math.sin(Math.PI * reach)};
}

type Profile = [height: number, width: number, depth: number, z?: number];
function profile(rows: Profile[], segments = 16) {
 const positions: number[] = [], uv: number[] = [], indices: number[] = [];
 rows.forEach(([y, w, d, z = 0], j) => {
  for (let i = 0; i <= segments; i++) {const a = i / segments * Math.PI * 2; positions.push(Math.cos(a) * w, y, Math.sin(a) * d + z); uv.push(i / segments, j / (rows.length - 1));}
 });
 for (let j = 0; j < rows.length - 1; j++) for (let i = 0; i < segments; i++) {const a = j * (segments + 1) + i, b = a + segments + 1; indices.push(a, b, a + 1, a + 1, b, b + 1);}
 for (const j of [0, rows.length - 1]) {const center = positions.length / 3, [y, , , z = 0] = rows[j]; positions.push(0, y, z); uv.push(.5, .5); for (let i = 0; i < segments; i++) {const a = j * (segments + 1) + i; if (j === 0) indices.push(center, a, a + 1); else indices.push(center, a + 1, a);}}
 const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); g.setIndex(indices); g.computeVertexNormals(); return g;
}

function makeRig(source: THREE.Group) {
 const root = new THREE.Group(); root.name = 'contact-rigged-adult-climber';
 const anatomy = clone(source); root.add(anatomy);
 const bones = new Map<string, THREE.Bone>(), rest = new Map<THREE.Bone, THREE.Quaternion>();
 const ownedGeometry: THREE.BufferGeometry[] = [], ownedMaterial: THREE.Material[] = [];
 anatomy.traverse(o => {
  if (o instanceof THREE.Bone) {bones.set(o.name, o); rest.set(o, o.quaternion.clone());}
  if (o instanceof THREE.Mesh) {o.castShadow = o.receiveShadow = true; const m = (o.material as THREE.MeshStandardMaterial).clone(); m.envMapIntensity = .16; o.material = m; ownedMaterial.push(m);}
 });
 const bone = (name: string) => {const b = bones.get(name); if (!b) throw new Error(`Missing climber bone ${name}`); return b;};
 const pelvis = bone('root'), pelvisRest = pelvis.position.clone();
 const modelInverse = new THREE.Matrix4(), matrix = new THREE.Matrix4();
 const scratchPosition = new THREE.Vector3(), scratchScale = new THREE.Vector3(), scratchQuaternion = new THREE.Quaternion();
 const localPosition = (b: THREE.Object3D, out = new THREE.Vector3()) => {out.setFromMatrixPosition(b.matrixWorld).applyMatrix4(modelInverse); return out;};
 const localQuaternion = (b: THREE.Object3D, out = new THREE.Quaternion()) => {matrix.multiplyMatrices(modelInverse, b.matrixWorld).decompose(scratchPosition, out, scratchScale); return out;};
 const refresh = () => {root.updateWorldMatrix(true, true); modelInverse.copy(root.matrixWorld).invert();};
 refresh();
 const limbs = [-1, 1].map(side => {
  const suffix = side === 1 ? 'L' : 'R';
  const arm = {upper: bone(`upperarm01${suffix}`), lower: bone(`lowerarm01${suffix}`), end: bone(`wrist${suffix}`)};
  const leg = {upper: bone(`upperleg01${suffix}`), lower: bone(`lowerleg01${suffix}`), end: bone(`foot${suffix}`)};
  const lengths = (chain: typeof arm) => ({...chain, origin: localPosition(chain.upper), a: localPosition(chain.upper).distanceTo(localPosition(chain.lower)), b: localPosition(chain.lower).distanceTo(localPosition(chain.end))});
  const gripOffset=localPosition(bone(`finger3-1${suffix}`)).sub(localPosition(arm.end)).length();
  return {side, suffix, arm: lengths(arm), leg: lengths(leg), gripOffset};
 });
 type Chain = typeof limbs[number]['arm'];
 function orient(b: THREE.Bone, from: THREE.Vector3, to: THREE.Vector3) {
  const delta = new THREE.Quaternion().setFromUnitVectors(from.clone().normalize(), to.clone().normalize());
  const desired = delta.multiply(localQuaternion(b));
  const parent = localQuaternion(b.parent!).invert(); b.quaternion.copy(parent.multiply(desired)); refresh();
 }
 function solve(chain: Chain, target: THREE.Vector3, pole: THREE.Vector3) {
  const s = localPosition(chain.upper), e = localPosition(chain.lower);
  const direction = target.clone().sub(s), d = THREE.MathUtils.clamp(direction.length(), Math.abs(chain.a - chain.b) + .0001, chain.a + chain.b - .0001); direction.normalize();
  const bend = pole.clone().sub(s); bend.addScaledVector(direction, -bend.dot(direction)); bend.normalize();
  const along = (chain.a * chain.a - chain.b * chain.b + d * d) / (2 * d), altitude = Math.sqrt(Math.max(0, chain.a * chain.a - along * along));
  const elbow = s.clone().addScaledVector(direction, along).addScaledVector(bend, altitude);
  orient(chain.upper, e.clone().sub(s), elbow.clone().sub(s));
  const actualElbow = localPosition(chain.lower), actualEnd = localPosition(chain.end);
  orient(chain.lower, actualEnd.sub(actualElbow), target.clone().sub(actualElbow));
  // The hand/foot orientation is solved separately, so contact is independent
  // of forearm twist and the authored A-pose's rest rotations.
 }
 const fabricCanvas = document.createElement('canvas'); fabricCanvas.width = fabricCanvas.height = 128;
 const ctx = fabricCanvas.getContext('2d')!; ctx.fillStyle = '#808080'; ctx.fillRect(0, 0, 128, 128);
 for (let y = 0; y < 128; y += 2) for (let x = 0; x < 128; x += 2) {const n = 115 + Math.round((Math.sin(x * 39.7 + y * 91.3) * .5 + .5) * 25); ctx.fillStyle = `rgb(${n},${n},${n})`; ctx.fillRect(x, y, 1, 1);}
 const fabric = new THREE.CanvasTexture(fabricCanvas); fabric.wrapS = fabric.wrapT = THREE.RepeatWrapping; fabric.repeat.set(3, 3);
 const material = (color: string, roughness = .88, metalness = 0) => {const m = new THREE.MeshStandardMaterial({color, roughness, metalness, envMapIntensity: .18}); ownedMaterial.push(m); return m;};
 const skin = material('#ae8066');
 const jacket = material('#9e4c35'), panel = material('#713b2d'), trousers = material('#34423d'), rubber = material('#222a27'), webbing = material('#28332f'), gold = material('#b7ae8a', .5, .45), helmetMat = material('#d1c6a5', .58);
 for (const m of [jacket, panel, trousers]) {m.bumpMap = fabric; m.bumpScale = .0015;}
 const mesh = (geometry: THREE.BufferGeometry, m: THREE.Material, parent: THREE.Object3D = root) => {ownedGeometry.push(geometry); const o = new THREE.Mesh(geometry, m); o.castShadow = o.receiveShadow = true; parent.add(o); return o;};
 const torso = new THREE.Group(); root.add(torso);
 mesh(profile([[-.05,.135,.10],[.04,.154,.112],[.16,.163,.118],[.30,.196,.128],[.40,.218,.114],[.47,.213,.095],[.495,.17,.083],[.535,.082,.068],[.55,.064,.058]]), jacket, torso);
 const zipper = mesh(new THREE.BoxGeometry(.008,.38,.012), gold, torso); zipper.position.set(0,.23,.124);
 const collar = mesh(new THREE.CylinderGeometry(.074,.08,.047,16,1,true), panel, torso); collar.position.y=.542;
 const neck = mesh(new THREE.CylinderGeometry(.046,.053,.13,14),skin,torso);neck.position.set(0,.592,.025);
 const belt = mesh(new THREE.CylinderGeometry(.157,.153,.05,20,1,true), webbing, torso); belt.scale.z=.73; belt.position.y=.034;
 const buckle = mesh(new THREE.BoxGeometry(.05,.038,.016), gold, torso); buckle.position.set(0,.035,.117);
 const harnessLoop = mesh(new THREE.TorusGeometry(.028,.006,6,18), gold, torso); harnessLoop.position.set(.02,-.005,.139);
 for (const side of [-1,1]) {
  const pocket = mesh(new THREE.BoxGeometry(.084,.098,.008), panel, torso); pocket.position.set(side*.094,.19,.125); pocket.rotation.z=side*.08;
  const seam = mesh(new THREE.BoxGeometry(.006,.33,.009), panel, torso); seam.position.set(side*.135,.23,.092); seam.rotation.z=-side*.13;
 }
 const seat = mesh(profile([[-.08,.12,.09],[0,.151,.108],[.095,.145,.107]]), trousers);
 const headGear = new THREE.Group(); root.add(headGear);
 const dome = mesh(new THREE.SphereGeometry(.123,20,12,0,Math.PI*2,0,Math.PI*.61),helmetMat,headGear); dome.scale.set(.93,.86,1.11); dome.position.set(0,.094,-.018);
 const rim = mesh(new THREE.TorusGeometry(.116,.009,6,40),rubber,headGear); rim.rotation.x=Math.PI/2; rim.scale.set(.94,1.12,1); rim.position.set(0,.058,-.018);
 for (const side of [-1,1]) for (const offset of [-.036,.014,.061]) {const vent=mesh(new THREE.BoxGeometry(.014,.008,.047),rubber,headGear); const vx=side*.052,vz=offset-.025,vy=.094+.86*Math.sqrt(Math.max(0,.123**2-(vx/.93)**2-((vz+.018)/1.11)**2));vent.position.set(vx,vy+.001,vz);vent.rotation.z=-side*.33;}
 const strap = mesh(new THREE.TorusGeometry(.092,.004,5,24,0,Math.PI),webbing,headGear); strap.rotation.z=Math.PI; strap.position.set(0,.007,.016); strap.scale.set(1,1.26,.65);
 const limbCloth = limbs.map(({side}) => {
  const shoulder = mesh(new THREE.SphereGeometry(.08,14,9),jacket);
  const elbow = mesh(new THREE.SphereGeometry(.058,12,8),jacket);
  const knee = mesh(new THREE.SphereGeometry(.065,12,8),trousers);
  const hip = mesh(new THREE.SphereGeometry(.091,14,9),trousers);
  const sleeve = mesh(profile([[0,.053,.055],[.12,.063,.067],[.25,.083,.083],[.27,.058,.06]]), jacket);
  const forearm = mesh(profile([[0,.034,.038],[.10,.047,.052],[.25,.057,.059],[.27,.051,.053]]), jacket);
  const cuff = mesh(new THREE.CylinderGeometry(.039,.039,.025,12), panel);
  const thigh = mesh(profile([[0,.060,.065],[.19,.082,.09],[.40,.095,.099],[.44,.078,.086]]),trousers);
  const calf = mesh(profile([[0,.038,.045],[.14,.055,.059],[.37,.067,.067],[.45,.061,.066]]),trousers);
  const bootGroup = new THREE.Group(); root.add(bootGroup);
  const shoe = mesh(profile([[-.045,.048,.092,.051],[.003,.057,.12,.055],[.055,.052,.09,.039],[.11,.038,.044,.003]]),rubber,bootGroup);
  const sole = mesh(new THREE.BoxGeometry(.121,.022,.24),rubber,bootGroup); sole.position.set(0,-.047,.052);
  for(let i=0;i<4;i++){const lace=mesh(new THREE.BoxGeometry(.067,.006,.008),gold,bootGroup);lace.position.set(0,.048-i*.003,.025+i*.024);lace.rotation.z=side*.07;}
  const legLoop = mesh(new THREE.CylinderGeometry(.096,.091,.027,16,1,true),webbing);
  const carabiner = mesh(new THREE.TorusGeometry(.024,.004,6,18),gold);carabiner.scale.set(.64,1,1);
  return {shoulder,elbow,knee,hip,sleeve,forearm,cuff,thigh,calf,bootGroup,shoe,legLoop,carabiner};
 });
 // Equipment pieces with a shared rigid parent/material can share a draw.
 // Articulated limbs stay separate; no animation or silhouette is removed.
 for(const parent of [torso,headGear,...limbCloth.map(c=>c.bootGroup)]){
  const batches=new Map<THREE.Material,THREE.Mesh[]>();
  for(const child of parent.children)if(child instanceof THREE.Mesh){const m=child.material as THREE.Material;batches.set(m,[...(batches.get(m)??[]),child]);}
  for(const [m,children]of batches){
   if(children.length<2)continue;
   const temporary=children.map(child=>{child.updateMatrix();return child.geometry.clone().applyMatrix4(child.matrix);});
   const combined=mergeGeometries(temporary);temporary.forEach(g=>g.dispose());
   if(combined){children.forEach(child=>parent.remove(child));mesh(combined,m,parent);}
  }
 }
 // A thin, dynamic rope is one local buffer updated in place, with fixed upper
 // anchor. It runs from the climber's belay loop to the nearest protection.
 const ropePositions = new Float32Array(15*3), ropeGeometry = new THREE.BufferGeometry(); ropeGeometry.setAttribute('position',new THREE.BufferAttribute(ropePositions,3)); ownedGeometry.push(ropeGeometry);
 const ropeMaterial=new THREE.LineBasicMaterial({color:'#c7aa72'});ownedMaterial.push(ropeMaterial);const rope=new THREE.Line(ropeGeometry,ropeMaterial);root.add(rope);
 const cached = {left: new THREE.Vector3(), right: new THREE.Vector3(), shoulder: new THREE.Vector3(), hips: new THREE.Vector3(), head: new THREE.Vector3()};
 const putSegment=(o:THREE.Mesh,a:THREE.Vector3,b:THREE.Vector3,authoredLength:number)=>{const v=b.clone().sub(a);o.position.copy(a);o.quaternion.setFromUnitVectors(UP,v.clone().normalize());o.scale.y=v.length()/authoredLength;};
 const authoredScale=DESIGN_HEIGHT/1.786;
 const at=(p:Point)=>new THREE.Vector3(...p).divideScalar(authoredScale);
 const holds={left:at([-.22,.99,.17]),right:at([.24,1.11,.17]),next:at([.22,1.31,.17]),footLeft:at([-.115,.03,.16]),footRight:at([.13,.15,.17])};
 const gripDirection=new THREE.Vector3(0,.11,.018).normalize();
 // The planted point is the front of the actual boot sole, not the ankle bone.
 const bootContact=new THREE.Vector3(0,-.058,.168);
 const bootRotations=limbs.map(({side})=>new THREE.Quaternion().setFromEuler(new THREE.Euler(.10,side*.11,side*.065)));

 let lastSeconds=Number.NaN;
 function pose(seconds:number){
  if(seconds===lastSeconds)return;
  lastSeconds=seconds;
  const motion=climberMotion(seconds);let contactError=0;
  for(const [b,q]of rest)b.quaternion.copy(q);
  const targets=limbs.map(({side,gripOffset},i)=>{
   const handContact=side===-1?holds.left.clone():holds.right.clone().lerp(holds.next,motion.reach);
   if(side===1)handContact.z-=motion.release*.055/authoredScale;
   const footContact=(side===-1?holds.footLeft:holds.footRight).clone();
   return {handContact,footContact,wrist:handContact.clone().addScaledVector(gripDirection,-gripOffset),ankle:footContact.clone().sub(bootContact.clone().applyQuaternion(bootRotations[i]))};
  });
  const desiredShift=at([-.012+motion.pull*.019,-.052+motion.pull*.108,-.017+motion.pull*.025]);
  // Project the pelvis into the intersection of both legs' and arms' reachable
  // volumes. The body yields before a planted boot or gripping hand can slide.
  // A small reserve avoids straight locked knees at the top of the transfer.
  for(let pass=0;pass<8;pass++)limbs.forEach(({arm,leg},i)=>{
   for(const [chain,target,reserve]of [[leg,targets[i].ankle,.012],[arm,targets[i].wrist,.004]] as const){
    const center=target.clone().sub(chain.origin),offset=desiredShift.clone().sub(center),limit=chain.a+chain.b-reserve;
    if(offset.length()>limit)desiredShift.copy(center).add(offset.setLength(limit));
   }
  });
  pelvis.position.copy(pelvisRest).add(desiredShift);refresh();
  limbs.forEach(({side,suffix,arm,leg},i)=>{
   const target=targets[i];
   solve(arm,target.wrist,new THREE.Vector3(side*.58,.99,-.22).divideScalar(authoredScale));
   solve(leg,target.ankle,new THREE.Vector3(side*.35,.47,-.20).divideScalar(authoredScale));
   // Keep the knuckle contact above the wrist, with the fingers curled around
   // its hold. Curling the phalanges does not move their planted base joint.
   const finger=bone(`finger3-1${suffix}`),wrist=localPosition(arm.end);
   orient(arm.end,localPosition(finger).sub(wrist),gripDirection);
   for(const [name,b]of bones)if(name.startsWith('finger')&&name.endsWith(suffix)){const curl=name.includes('-1')?.25:name.includes('-2')?.55:.38;b.quaternion.multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1,0,0),curl));}
   refresh();
   contactError=Math.max(contactError,localPosition(finger).distanceTo(target.handContact),localPosition(leg.end).distanceTo(target.ankle));
  });
  localPosition(bone('upperarm01L'),cached.left);localPosition(bone('upperarm01R'),cached.right);cached.shoulder.copy(cached.left).add(cached.right).multiplyScalar(.5);
  localPosition(bone('upperleg01L'),cached.left);localPosition(bone('upperleg01R'),cached.right);cached.hips.copy(cached.left).add(cached.right).multiplyScalar(.5);
  torso.position.copy(cached.hips);torso.quaternion.setFromUnitVectors(UP,cached.shoulder.clone().sub(cached.hips).normalize());seat.position.copy(cached.hips);
  localPosition(bone('head'),cached.head);headGear.position.copy(cached.head);headGear.quaternion.copy(localQuaternion(bone('head'),scratchQuaternion));
  limbs.forEach(({side,arm,leg},i)=>{
   const c=limbCloth[i],s=localPosition(arm.upper),e=localPosition(arm.lower),w=localPosition(arm.end),h=localPosition(leg.upper),k=localPosition(leg.lower),f=localPosition(leg.end);
   c.shoulder.position.copy(s);c.shoulder.scale.set(1,.92,1);c.elbow.position.copy(e);c.knee.position.copy(k);c.hip.position.copy(h);
   putSegment(c.sleeve,e,s,.27);putSegment(c.forearm,w,e,.27);c.cuff.position.copy(w);c.cuff.quaternion.copy(c.forearm.quaternion);
   putSegment(c.thigh,k,h,.44);putSegment(c.calf,f,k,.45);c.bootGroup.position.copy(f);c.bootGroup.quaternion.copy(bootRotations[i]);
   c.legLoop.position.copy(h).lerp(k,.22);c.legLoop.quaternion.copy(c.thigh.quaternion);c.carabiner.position.copy(cached.hips).add(new THREE.Vector3(side*.16,-.06,.035));
  });
  const belay=torso.localToWorld(new THREE.Vector3(.02,.005,.14));root.worldToLocal(belay);const anchor=at([.16,1.38,.18]);
  for(let i=0;i<15;i++){const p=i/14;ropePositions[i*3]=THREE.MathUtils.lerp(belay.x,anchor.x,p)+Math.sin(p*Math.PI)*.025;ropePositions[i*3+1]=THREE.MathUtils.lerp(belay.y,anchor.y,p)-Math.sin(p*Math.PI)*.035;ropePositions[i*3+2]=THREE.MathUtils.lerp(belay.z,anchor.z,p)-Math.sin(p*Math.PI)*.025;}
  ropeGeometry.attributes.position.needsUpdate=true;ropeGeometry.computeBoundingSphere();
  const defaultScale=DEFAULT_HEIGHT/1.786;
  root.userData.seconds=seconds;root.userData.contactError=contactError*defaultScale;root.userData.phase=motion;
  root.userData.contacts=limbs.map(({suffix},i)=>({
   hand:localPosition(bone(`finger3-1${suffix}`)).multiplyScalar(defaultScale).toArray(),
   handTarget:targets[i].handContact.clone().multiplyScalar(defaultScale).toArray(),
   foot:root.worldToLocal(limbCloth[i].bootGroup.localToWorld(bootContact.clone())).multiplyScalar(defaultScale).toArray(),
   footTarget:targets[i].footContact.clone().multiplyScalar(defaultScale).toArray(),
  }));
  root.userData.pelvis=desiredShift.clone().multiplyScalar(defaultScale).toArray();
  root.updateWorldMatrix(true,true);
 }
 pose(0);
 return {root,pose,dispose(){ownedGeometry.forEach(g=>g.dispose());ownedMaterial.forEach(m=>m.dispose());fabric.dispose();}};
}

/** Detailed CC0 MakeHuman anatomy, locally trimmed to exposed head/hands;
 * authored clothes and deterministic two-bone IK. No remote runtime assets.
 * Default height deliberately preserves the existing miniature's .83 scale. */
export function HeroClimber({time,height=DEFAULT_HEIGHT}:{time:RefObject<{t:number}>;height?:number}){
 const {scene}=useGLTF(CLIMBER_MODEL_URL);
 const rig=useMemo(()=>makeRig(scene),[scene]);
 useEffect(()=>()=>rig.dispose(),[rig]);
 useFrame(()=>rig.pose(time.current.t));
 return <group scale={height/1.786}><primitive object={rig.root} dispose={null}/></group>;
}
