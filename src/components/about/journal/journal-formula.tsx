"use client";

import {useEffect, useMemo, useRef} from 'react';
import {useFrame} from '@react-three/fiber';
import * as THREE from 'three';

type Time = {time: React.RefObject<{t: number}>};
type Point = [number, number, number];
type Section = {z: number; width: number; bottom: number; top: number};
const GREEN = '#174a3c', GOLD = '#c0a36a', PAPER = '#e8dfc9';
const TERRAIN = {journalLayer: 'terrain', revealOrder: 0};
const ACTORS = {journalLayer: 'actors', revealOrder: 1};

function loft(sections: Section[], sides = 20) {
  const vertices: number[] = [], indices: number[] = [];
  sections.forEach(section => {
    const middle = (section.bottom + section.top) / 2;
    for (let j = 0; j < sides; j++) {
      const angle = j / sides * Math.PI * 2;
      vertices.push(Math.cos(angle) * section.width, middle + Math.sin(angle) * (section.top - section.bottom) / 2, section.z);
    }
  });
  for (let ring = 0; ring < sections.length - 1; ring++) {
    for (let j = 0; j < sides; j++) {
      const a = ring * sides + j, b = ring * sides + (j + 1) % sides;
      indices.push(a, b, a + sides, b, b + sides, a + sides);
    }
  }
  const firstCenter = vertices.length / 3;
  vertices.push(0, (sections[0].top + sections[0].bottom) / 2, sections[0].z);
  const end = sections[sections.length - 1], lastCenter = vertices.length / 3;
  vertices.push(0, (end.top + end.bottom) / 2, end.z);
  for (let j = 0; j < sides; j++) {
    indices.push(firstCenter, (j + 1) % sides, j);
    indices.push(lastCenter, (sections.length - 1) * sides + j, (sections.length - 1) * sides + (j + 1) % sides);
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
  geometry.setIndex(indices); geometry.computeVertexNormals();
  return geometry;
}

function wing(span: number, chord: number) {
  const positions: number[] = [], indices: number[] = [];
  const rows = 16, columns = 8;
  for (let side = 0; side < 2; side++) {
    for (let i = 0; i <= rows; i++) {
      const across = i / rows * 2 - 1;
      for (let j = 0; j <= columns; j++) {
        const along = j / columns;
        const taper = 1 - Math.abs(across) * .12;
        const camber = Math.sin(along * Math.PI) * .035 + across * across * .035;
        positions.push(across * span / 2, camber + (side ? -.012 : .012), (along - .5) * chord * taper);
      }
    }
  }
  const layerSize = (rows + 1) * (columns + 1);
  for (let side = 0; side < 2; side++) {
    for (let i = 0; i < rows; i++) for (let j = 0; j < columns; j++) {
      const a = side * layerSize + i * (columns + 1) + j, b = a + columns + 1;
      if (side) indices.push(a, b, a + 1, a + 1, b, b + 1);
      else indices.push(a, a + 1, b, a + 1, b + 1, b);
    }
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setIndex(indices); geometry.computeVertexNormals();
  return geometry;
}

function ribbon(curve: THREE.CatmullRomCurve3, width: number) {
  const vertices: number[] = [], indices: number[] = [];
  for (let i = 0; i <= 180; i++) {
    const point = curve.getPointAt(i / 180), tangent = curve.getTangentAt(i / 180);
    const normal = new THREE.Vector3(tangent.z, 0, -tangent.x).normalize().multiplyScalar(width / 2);
    vertices.push(point.x + normal.x, point.y, point.z + normal.z, point.x - normal.x, point.y, point.z - normal.z);
    if (i < 180) { const a = i * 2; indices.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); }
  }
  // Tight inside corners can reverse a strip triangle. Keep every road face
  // upward so double-sided lighting cannot create black triangular patches.
  for (let i = 0; i < indices.length; i += 3) {
    const a=indices[i]*3,b=indices[i+1]*3,c=indices[i+2]*3;
    const normalY=(vertices[b+2]-vertices[a+2])*(vertices[c]-vertices[a])-(vertices[b]-vertices[a])*(vertices[c+2]-vertices[a+2]);
    if(normalY<0)[indices[i+1],indices[i+2]]=[indices[i+2],indices[i+1]];
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
  geometry.setIndex(indices);
  // The circuit is one horizontal surface, including the closed seam.
  const normals = new Float32Array(vertices.length);
  for (let i = 1; i < normals.length; i += 3) normals[i] = 1;
  geometry.setAttribute('normal', new THREE.BufferAttribute(normals, 3));
  return geometry;
}

function useCarResources() {
  const resources = useMemo(() => {
    const floorOutline = new THREE.Shape();
    floorOutline.moveTo(-.23, 1.0); floorOutline.lineTo(.23, 1.0); floorOutline.lineTo(.30, .3);
    floorOutline.lineTo(.47, .14); floorOutline.lineTo(.45, -.8); floorOutline.lineTo(.26, -.95);
    floorOutline.lineTo(-.26, -.95); floorOutline.lineTo(-.45, -.8); floorOutline.lineTo(-.47, .14);
    floorOutline.lineTo(-.30, .3); floorOutline.closePath();
    const floor = new THREE.ExtrudeGeometry(floorOutline, {depth: .025, bevelEnabled: false});
    floor.rotateX(Math.PI / 2);
    const geometries = {
      body: loft([
        {z: -.86, width: .08, bottom: .10, top: .28}, {z: -.67, width: .13, bottom: .095, top: .41},
        {z: -.39, width: .20, bottom: .09, top: .40}, {z: -.09, width: .205, bottom: .085, top: .34},
        {z: .22, width: .18, bottom: .09, top: .29}, {z: .52, width: .105, bottom: .095, top: .235},
        {z: .83, width: .069, bottom: .105, top: .19}, {z: 1.01, width: .045, bottom: .105, top: .15},
      ]),
      sidepod: loft([
        {z: -.74, width: .065, bottom: .1, top: .21}, {z: -.51, width: .12, bottom: .1, top: .28},
        {z: -.23, width: .15, bottom: .11, top: .34}, {z: .13, width: .14, bottom: .12, top: .33},
        {z: .28, width: .095, bottom: .13, top: .28},
      ]),
      cowl: loft([
        {z: -.87, width: .025, bottom: .2, top: .3}, {z: -.62, width: .075, bottom: .23, top: .43},
        {z: -.37, width: .09, bottom: .27, top: .57}, {z: -.20, width: .065, bottom: .3, top: .61},
      ], 16),
      frontWing: wing(1.17, .25), rearWing: wing(1.01, .27), floor,
    };
    const materials = {
      green: new THREE.MeshPhysicalMaterial({color: GREEN, roughness: .29, metalness: .28, clearcoat: .8, clearcoatRoughness: .24}),
      gold: new THREE.MeshStandardMaterial({color: GOLD, roughness: .38, metalness: .52}),
      carbon: new THREE.MeshStandardMaterial({color: '#1b2422', roughness: .72, metalness: .12}),
      rubber: new THREE.MeshStandardMaterial({color: '#202522', roughness: .98}),
      tread: new THREE.MeshStandardMaterial({color: '#282c28', roughness: 1}),
      paper: new THREE.MeshStandardMaterial({color: PAPER, roughness: .7}),
      dark: new THREE.MeshStandardMaterial({color: '#101916', roughness: .78}),
    };
    return {geometries, materials};
  }, []);
  useEffect(() => () => {
    Object.values(resources.geometries).forEach(geometry => geometry.dispose());
    Object.values(resources.materials).forEach(material => material.dispose());
  }, [resources]);
  return resources;
}

type CarResources = ReturnType<typeof useCarResources>;

function Suspension({from, to, material}: {from: Point; to: Point; material: THREE.Material}) {
  const transform = useMemo(() => {
    const start = new THREE.Vector3(...from), finish = new THREE.Vector3(...to), delta = finish.clone().sub(start);
    return {position: start.add(finish).multiplyScalar(.5), length: delta.length(), quaternion: new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), delta.normalize())};
  }, [from, to]);
  return <mesh position={transform.position} quaternion={transform.quaternion} material={material} castShadow><cylinderGeometry args={[.012, .012, transform.length, 7]}/></mesh>;
}

function Tire({side, rear, detailed, resources}: {side: number; rear: boolean; detailed: boolean; resources: CarResources}) {
  const ribs = useRef<THREE.InstancedMesh>(null);
  const width = rear ? .21 : .17;
  useEffect(() => {
    if (!ribs.current) return;
    const dummy = new THREE.Object3D();
    for (let i = 0; i < 48; i++) {
      const angle = i / 48 * Math.PI * 2;
      dummy.position.set(0, Math.cos(angle) * .2005, Math.sin(angle) * .2005);
      dummy.rotation.x = angle; dummy.updateMatrix(); ribs.current.setMatrixAt(i, dummy.matrix);
    }
    ribs.current.instanceMatrix.needsUpdate = true;
  }, []);
  const outer = side * (width / 2 + .002);
  return <>
    <mesh rotation={[0, 0, Math.PI / 2]} material={resources.materials.rubber} castShadow><cylinderGeometry args={[.2, .2, width, detailed ? 32 : 16]}/></mesh>
    {detailed && <instancedMesh ref={ribs} args={[undefined, resources.materials.tread, 48]}><boxGeometry args={[width * .85, .002, .008]}/></instancedMesh>}
    <mesh position={[outer, 0, 0]} rotation={[0, side * Math.PI / 2, 0]} material={resources.materials.carbon}><circleGeometry args={[.139, 24]}/></mesh>
    <mesh position={[outer + side * .002, 0, 0]} rotation={[0, Math.PI / 2, 0]} material={resources.materials.gold}><torusGeometry args={[.132, .009, 6, detailed ? 32 : 16]}/></mesh>
    {detailed && <>
      <mesh position={[outer, 0, 0]} rotation={[0, Math.PI / 2, 0]} material={resources.materials.tread}><torusGeometry args={[.183, .008, 6, 32]}/></mesh>
      {Array.from({length: 7}, (_, i) => <mesh key={i} position={[outer + side * .004, 0, 0]} rotation={[i / 7 * Math.PI * 2, 0, 0]} material={resources.materials.gold}><boxGeometry args={[.012, .016, .239]}/></mesh>)}
    </>}
    <mesh position={[outer + side * .012, 0, 0]} rotation={[0, 0, Math.PI / 2]} material={resources.materials.gold}><cylinderGeometry args={[.035, .035, .026, 6]}/></mesh>
  </>;
}

function GrandPrixCar({time, resources, detailed = false, rolling = false}: Time & {resources: CarResources; detailed?: boolean; rolling?: boolean}) {
  const wheels = useRef<THREE.Group>(null);
  const halo = useMemo(() => new THREE.CatmullRomCurve3([
    [-.17, .46, -.15], [-.205, .46, .055], [-.15, .44, .28], [0, .43, .37],
    [.15, .44, .28], [.205, .46, .055], [.17, .46, -.15],
  ].map(point => new THREE.Vector3(...point))), []);
  useFrame(() => {
    if (wheels.current) wheels.current.children.forEach(wheel => { wheel.rotation.x = rolling ? -time.current.t * 11 : 0; });
  });
  const {geometries: geometry, materials: material} = resources;
  return <group>
    <mesh geometry={geometry.floor} material={material.carbon} position={[0, .085, 0]} castShadow/>
    <mesh geometry={geometry.body} material={material.green} castShadow/>
    <mesh geometry={geometry.cowl} material={material.green} castShadow/>
    {[-1, 1].map(side => <group key={side}>
      <mesh geometry={geometry.sidepod} material={material.green} position={[side * .285, 0, 0]} castShadow/>
      <mesh position={[side * .285, .328, -.10]} rotation={[0, side * .04, 0]} material={material.gold}><boxGeometry args={[.14, .008, .39]}/></mesh>
      <mesh position={[side * .288, .26, .215]} rotation={[.1, 0, 0]} material={material.dark}><boxGeometry args={[.15, .069, .055]}/></mesh>
      {[-.66, .66].map(z => <group key={z}>
        <Suspension from={[side * .12, .12, z * .75]} to={[side * .46, .20, z]} material={material.carbon}/>
        <Suspension from={[side * .13, .25, z * .62]} to={[side * .46, .20, z]} material={material.carbon}/>
      </group>)}
    </group>)}
    <mesh position={[0, .335, .015]} scale={[.157, .055, .235]} material={material.dark}><sphereGeometry args={[1, 24, 14]}/></mesh>
    <mesh position={[0, .385, .035]} material={material.paper} castShadow><sphereGeometry args={[.077, 18, 12]}/></mesh>
    <mesh position={[0, .395, .099]} rotation={[-.12, 0, 0]} scale={[1, .45, .38]} material={material.dark}><sphereGeometry args={[.069, 18, 10]}/></mesh>
    <mesh material={material.gold} castShadow><tubeGeometry args={[halo, 32, .018, 8, false]}/></mesh>
    <Suspension from={[0, .43, .37]} to={[0, .21, .53]} material={material.gold}/>
    {[-.17, .17].map(x => <Suspension key={x} from={[x, .46, -.15]} to={[x, .29, -.23]} material={material.gold}/>)}
    <mesh position={[0, .54, -.18]} material={material.gold}><torusGeometry args={[.068, .014, 7, 20]}/></mesh>
    <mesh position={[0, .54, -.18]} material={material.dark}><circleGeometry args={[.058, 20]}/></mesh>
    <group ref={wheels}>
      {[-1, 1].flatMap(side => [-1, 1].map(axle => <group key={`${side}-${axle}`} position={[side * .47, .2, axle * .66]}><Tire side={side} rear={axle < 0} detailed={detailed} resources={resources}/></group>))}
    </group>
    <mesh geometry={geometry.frontWing} material={material.gold} position={[0, .10, .99]} castShadow/>
    <mesh geometry={geometry.frontWing} material={material.green} position={[0, .15, .9]} scale={[.88, 1, .58]} castShadow/>
    <mesh geometry={geometry.frontWing} material={material.gold} position={[0, .185, .83]} scale={[.72, .6, .45]} castShadow/>
    {[-.575, .575].map(x => <mesh key={x} position={[x, .15, .97]} material={material.green} castShadow><boxGeometry args={[.024, .20, .29]}/></mesh>)}
    <mesh geometry={geometry.rearWing} material={material.green} position={[0, .48, -.92]} castShadow/>
    <mesh geometry={geometry.rearWing} material={material.gold} position={[0, .555, -.94]} scale={[1, .7, .65]} castShadow/>
    {[-.5, .5].map(x => <mesh key={x} position={[x, .41, -.93]} material={material.green} castShadow><boxGeometry args={[.026, .33, .33]}/></mesh>)}
    {[-.12, .12].map(x => <Suspension key={x} from={[x, .12, -.76]} to={[x, .48, -.91]} material={material.gold}/>)}
    {detailed && <>
      {[-.3, -.15, 0, .15, .3].map(x => <mesh key={x} position={[x, .11, -.85]} material={material.carbon}><boxGeometry args={[.015, .12, .24]}/></mesh>)}
      {[-1, 1].map(side => <group key={side}>
        <Suspension from={[side * .16, .28, .24]} to={[side * .28, .35, .3]} material={material.gold}/>
        <mesh position={[side * .3, .355, .3]} material={material.green}><boxGeometry args={[.12, .055, .07]}/></mesh>
      </group>)}
      <mesh position={[0, .198, .74]} material={material.gold}><boxGeometry args={[.018, .008, .26]}/></mesh>
    </>}
  </group>;
}

function PitGarage() {
  return <group position={[-.63, 0, -1.47]}>
    <mesh position={[0, .035, 0]} castShadow receiveShadow><boxGeometry args={[1.15, .065, .58]}/><meshStandardMaterial color={PAPER} roughness={1}/></mesh>
    <mesh position={[0, .35, -.21]} castShadow><boxGeometry args={[1.05, .64, .07]}/><meshStandardMaterial color='#345a49' roughness={.7}/></mesh>
    {[-.51, .51].map(x => <mesh key={x} position={[x, .35, -.03]} castShadow><boxGeometry args={[.06, .64, .42]}/><meshStandardMaterial color={PAPER}/></mesh>)}
    <mesh position={[0, .69, -.025]} castShadow><boxGeometry args={[1.16, .045, .56]}/><meshStandardMaterial color={GREEN} roughness={.45}/></mesh>
    <mesh position={[0, .63, .267]}><boxGeometry args={[1.05, .045, .015]}/><meshStandardMaterial color={GOLD} metalness={.5} roughness={.4}/></mesh>
    <mesh position={[-.13, .15, -.07]} castShadow><boxGeometry args={[.4, .22, .28]}/><meshStandardMaterial color='#243b32'/></mesh>
    {[.11, .17, .23].map(y => <mesh key={y} position={[-.13, y, .075]}><boxGeometry args={[.34, .008, .007]}/><meshStandardMaterial color={GOLD}/></mesh>)}
    {[.12, .26, .4].map(y => <mesh key={y} position={[.34, y, -.06]} castShadow><cylinderGeometry args={[.1, .1, .12, 18]}/><meshStandardMaterial color='#202522' roughness={1}/></mesh>)}
  </group>;
}

export function RaceWeekend({time}: Time) {
  const resources = useCarResources();
  const racer = useRef<THREE.Group>(null), kerbs = useRef<THREE.InstancedMesh>(null);
  const circuit = useMemo(() => new THREE.CatmullRomCurve3([
    [-2.41, .035, -.85], [-1.77, .035, -1.12], [-.85, .035, -.85], [-.53, .035, -.23],
    [-.91, .035, .38], [-.68, .035, 1.01], [-1.35, .035, 1.31], [-2.23, .035, .95],
    [-2.46, .035, .21], [-2.07, .035, -.25],
  ].map(point => new THREE.Vector3(...point)), true, 'catmullrom', .3), []);
  const road = useMemo(() => ribbon(circuit, .4), [circuit]);
  useEffect(() => () => road.dispose(), [road]);
  useEffect(() => {
    if (!kerbs.current) return;
    const dummy = new THREE.Object3D(), normal = new THREE.Vector3();
    for (let i = 0; i < 140; i++) {
      const point = circuit.getPointAt(i / 140), tangent = circuit.getTangentAt(i / 140);
      normal.set(tangent.z, 0, -tangent.x).normalize().multiplyScalar(.224);
      dummy.position.copy(point).add(normal); dummy.position.y = .044;
      dummy.rotation.y = Math.atan2(tangent.x, tangent.z); dummy.updateMatrix();
      kerbs.current.setMatrixAt(i, dummy.matrix);
      kerbs.current.setColorAt(i, new THREE.Color(i % 2 ? PAPER : GOLD));
    }
    kerbs.current.instanceMatrix.needsUpdate = true;
    if (kerbs.current.instanceColor) kerbs.current.instanceColor.needsUpdate = true;
  }, [circuit]);
  useFrame(() => {
    if (!racer.current) return;
    const progress = (time.current.t / 11) % 1;
    const point = circuit.getPointAt(progress), tangent = circuit.getTangentAt(progress);
    racer.current.position.copy(point); racer.current.rotation.y = Math.atan2(tangent.x, tangent.z);
  });
  return <>
    <group userData={TERRAIN}>
      <mesh geometry={road}><meshStandardMaterial color='#3f4a43' roughness={.98} side={THREE.DoubleSide}/></mesh>
      <instancedMesh ref={kerbs} args={[undefined, undefined, 140]} receiveShadow><boxGeometry args={[.065, .024, .083]}/><meshStandardMaterial roughness={.85}/></instancedMesh>
      <group position={[1.30, 0, .18]} rotation={[0, -.3, 0]}>
        <mesh position={[0, .055, 0]} receiveShadow castShadow><boxGeometry args={[1.65, .11, 2.65]}/><meshStandardMaterial color='#d2c5a7' roughness={.93}/></mesh>
        <mesh position={[0, .112, 0]} receiveShadow><boxGeometry args={[1.54, .008, 2.54]}/><meshStandardMaterial color='#435449' roughness={.86}/></mesh>
        {[-.70, .70].map(x => <mesh key={x} position={[x, .118, 0]}><boxGeometry args={[.012, .006, 2.35]}/><meshStandardMaterial color={GOLD}/></mesh>)}
        {[-1.14, 1.14].map(z => <mesh key={z} position={[0, .118, z]}><boxGeometry args={[1.4, .006, .012]}/><meshStandardMaterial color={GOLD}/></mesh>)}
      </group>
    </group>
    <group userData={{...ACTORS, revealOrder: 0}}>
      <group position={[1.30, .117, .18]} rotation={[0, -.3, 0]}><GrandPrixCar time={time} resources={resources} detailed/></group>
    </group>
    <group userData={{...ACTORS, revealOrder: 2}}>
      <group ref={racer} scale={.29}>
        <mesh position={[0, .006, 0]} rotation={[-Math.PI / 2, 0, 0]} scale={[.49, 1.01, 1]}><circleGeometry args={[1, 32]}/><meshBasicMaterial color='#101916' transparent opacity={.16} depthWrite={false}/></mesh>
        <GrandPrixCar time={time} resources={resources} rolling/>
      </group>
      <PitGarage/>
    </group>
  </>;
}
