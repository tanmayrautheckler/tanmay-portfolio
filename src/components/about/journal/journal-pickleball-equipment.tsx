'use client';

import {useEffect, useMemo} from 'react';
import * as THREE from 'three';
import {mergeGeometries} from 'three/examples/jsm/utils/BufferGeometryUtils.js';

type Point = [number, number, number];
type Placement = {position?: Point; rotation?: Point; scale?: number | Point};
type PaddleProps = Placement & {faceColor?: string; accentColor?: string};
type BallProps = Placement & {radius?: number; color?: string};

/** Head remains .18 x .22 x .025; the held grip's attachment is [0,0,0]. */
function paddleOutline() {
  const shape = new THREE.Shape();
  shape.moveTo(-.021, .1485);
  shape.bezierCurveTo(-.050, .153, -.0865, .178, -.0865, .212);
  shape.lineTo(-.0865, .318);
  shape.quadraticCurveTo(-.0865, .3615, -.047, .3615);
  shape.lineTo(.047, .3615);
  shape.quadraticCurveTo(.0865, .3615, .0865, .318);
  shape.lineTo(.0865, .212);
  shape.bezierCurveTo(.0865, .178, .050, .153, .021, .1485);
  shape.closePath();
  return shape;
}

function insetOutline(factor: number) {
  const points = paddleOutline().getPoints(10).map(p => new THREE.Vector2(p.x * factor, .255 + (p.y - .255) * factor));
  return new THREE.Shape(points);
}

function colored(geometry: THREE.BufferGeometry, color: string, matrix?: THREE.Matrix4) {
  const result = geometry.index ? geometry.toNonIndexed() : geometry.clone();
  if (matrix) result.applyMatrix4(matrix);
  result.deleteAttribute('uv');
  const colors = new Float32Array(result.attributes.position.count * 3), tint = new THREE.Color(color);
  for (let i = 0; i < colors.length; i += 3) tint.toArray(colors, i);
  result.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  geometry.dispose();
  return result;
}

function makePaddle(accentColor: string) {
  const parts: THREE.BufferGeometry[] = [];
  const body = new THREE.ExtrudeGeometry(paddleOutline(), {depth: .018, bevelEnabled: true, bevelSize: .0035, bevelThickness: .0035, bevelSegments: 2, curveSegments: 10, steps: 1});
  body.translate(0, 0, -.009);
  parts.push(colored(body, '#18231e'));
  const neck = new THREE.Shape();
  neck.moveTo(-.0095, .080);neck.lineTo(.0095, .080);neck.lineTo(.025, .158);neck.lineTo(-.025, .158);neck.closePath();
  const throat = new THREE.ExtrudeGeometry(neck, {depth: .013, bevelEnabled: true, bevelSize: .0015, bevelThickness: .0015, bevelSegments: 1, steps: 1});
  throat.translate(0, 0, -.0065);parts.push(colored(throat, new THREE.Color(accentColor).multiplyScalar(.86).getStyle()));
  const grip = new THREE.CylinderGeometry(.0108, .012, .135, 8, 1);
  grip.translate(0, .0325, 0);parts.push(colored(grip, '#29342d'));
  const wrapPoints = Array.from({length: 65}, (_, i) => {const t = i / 64, a = t * Math.PI * 14;return new THREE.Vector3(Math.cos(a) * .0117, -.030 + t * .124, Math.sin(a) * .0117);});
  const wrap = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(wrapPoints), 64, .00075, 4, false);
  parts.push(colored(wrap, '#526051'));
  const cap = new THREE.CylinderGeometry(.0137, .0142, .008, 8, 1);
  cap.translate(0, -.039, 0);parts.push(colored(cap, '#18231e'));
  const collar = new THREE.CylinderGeometry(.012, .012, .011, 8, 1);
  collar.translate(0, .100, 0);parts.push(colored(collar, accentColor));
  const band = insetOutline(.935), hole = new THREE.Path(insetOutline(.905).getPoints(1).reverse());band.holes.push(hole);
  for (const side of [-1, 1]) {
    const pinstripe = new THREE.ShapeGeometry(band, 8);
    if (side < 0) pinstripe.rotateY(Math.PI);
    pinstripe.translate(0, 0, side * .0127);
    // The shape is symmetric around X, so the rear shares the same outline.
    parts.push(colored(pinstripe, accentColor));
  }
  const surround = mergeGeometries(parts, false)!;parts.forEach(g => g.dispose());
  const front = new THREE.ShapeGeometry(insetOutline(.903), 10), back = front.clone();
  front.translate(0, 0, .0128);back.rotateY(Math.PI);back.translate(0, 0, -.0128);
  const frontFlat = front.toNonIndexed(), backFlat = back.toNonIndexed();
  const faces = mergeGeometries([frontFlat, backFlat], false)!;front.dispose();back.dispose();frontFlat.dispose();backFlat.dispose();
  const positions = faces.attributes.position, uvs = new Float32Array(positions.count * 2);
  for (let i = 0; i < positions.count; i++) {uvs[i * 2] = (positions.getX(i) + .09) / .18;uvs[i * 2 + 1] = (positions.getY(i) - .145) / .22;}
  faces.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
  const weave = new Uint8Array(64 * 64 * 4);
  for (let y = 0; y < 64; y++) for (let x = 0; x < 64; x++) {const i = (y * 64 + x) * 4, v = ((Math.floor(x / 2) + Math.floor(y / 2)) % 2 ? 137 : 119) + Math.round(Math.sin(x * 1.5 + y) * 4);weave[i] = weave[i + 1] = weave[i + 2] = v;weave[i + 3] = 255;}
  const bump = new THREE.DataTexture(weave, 64, 64);bump.wrapS = bump.wrapT = THREE.RepeatWrapping;bump.repeat.set(3, 4);bump.needsUpdate = true;
  return {surround, faces, bump};
}

/** Static unbranded graphite paddle with a rubber edge and wrapped grip.
 * No animation, model download, generated image or branding is involved. */
export function PickleballPaddle({position, rotation, scale, faceColor = '#283b33', accentColor = '#b09a73'}: PaddleProps) {
  const paddle = useMemo(() => makePaddle(accentColor), [accentColor]);
  useEffect(() => () => {paddle.surround.dispose();paddle.faces.dispose();paddle.bump.dispose();}, [paddle]);
  return <group position={position} rotation={rotation} scale={scale} name="unbranded-graphite-pickleball-paddle">
    <mesh geometry={paddle.surround} castShadow receiveShadow><meshStandardMaterial vertexColors color="#ffffff" roughness={.77} metalness={.05}/></mesh>
    <mesh geometry={paddle.faces} castShadow receiveShadow><meshPhysicalMaterial color={faceColor} bumpMap={paddle.bump} bumpScale={.000075} roughness={.67} metalness={.14} clearcoat={.1} clearcoatRoughness={.5}/></mesh>
  </group>;
}

const HOLE_COUNT = 40;
const HOLE_ANGLE = .135;
function holeDirections() {
  return Array.from({length: HOLE_COUNT}, (_, i) => {
    const y = 1 - 2 * (i + .5) / HOLE_COUNT, r = Math.sqrt(1 - y * y), a = i * 2.399963229728653;
    return new THREE.Vector3(Math.cos(a) * r, y, Math.sin(a) * r);
  });
}

function makeBall(color: string) {
  const directions = holeDirections(), parts: THREE.BufferGeometry[] = [];
  const outer = new THREE.SphereGeometry(1, 32, 20).toNonIndexed();
  const inner = new THREE.SphereGeometry(.90, 24, 16).toNonIndexed();
  // Inward normals and reversed winding make the inside of the hollow shell
  // visible through openings, rather than painting dark discs onto a sphere.
  const p = inner.attributes.position, n = inner.attributes.normal;
  for (let i = 0; i < p.count; i += 3) for (const attr of [p, n]) {
    const a = new THREE.Vector3().fromBufferAttribute(attr, i + 1), b = new THREE.Vector3().fromBufferAttribute(attr, i + 2);
    attr.setXYZ(i + 1, b.x, b.y, b.z);attr.setXYZ(i + 2, a.x, a.y, a.z);
  }
  for (let i = 0; i < n.count; i++) n.setXYZ(i, -n.getX(i), -n.getY(i), -n.getZ(i));
  for (const [geometry, tint] of [[outer, color], [inner, new THREE.Color(color).multiplyScalar(.64).getStyle()]] as const) {
    const g = colored(geometry, tint);g.setAttribute('holeWall', new THREE.BufferAttribute(new Float32Array(g.attributes.position.count), 1));parts.push(g);
  }
  const positions: number[] = [], normals: number[] = [], c = Math.cos(HOLE_ANGLE), s = Math.sin(HOLE_ANGLE);
  const emit = (direction: THREE.Vector3, tangent: THREE.Vector3, bitangent: THREE.Vector3, angle: number, radius: number) => {
    const radial = tangent.clone().multiplyScalar(Math.cos(angle)).addScaledVector(bitangent, Math.sin(angle));
    const point = direction.clone().multiplyScalar(c).addScaledVector(radial, s).multiplyScalar(radius);
    const normal = direction.clone().multiplyScalar(s).addScaledVector(radial, -c);
    positions.push(point.x, point.y, point.z);normals.push(normal.x, normal.y, normal.z);
  };
  for (const direction of directions) {
    const tangent = new THREE.Vector3().crossVectors(Math.abs(direction.y) > .9 ? new THREE.Vector3(1, 0, 0) : new THREE.Vector3(0, 1, 0), direction).normalize();
    const bitangent = new THREE.Vector3().crossVectors(direction, tangent).normalize();
    for (let j = 0; j < 10; j++) {
      const a = j / 10 * Math.PI * 2, b = (j + 1) / 10 * Math.PI * 2;
      for (const [angle, radius] of [[a, 1], [a, .9], [b, 1], [b, 1], [a, .9], [b, .9]]) emit(direction, tangent, bitangent, angle, radius);
    }
  }
  const walls = new THREE.BufferGeometry();walls.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));walls.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
  const rims = colored(walls, color);rims.setAttribute('holeWall', new THREE.BufferAttribute(new Float32Array(rims.attributes.position.count).fill(1), 1));parts.push(rims);
  const geometry = mergeGeometries(parts, false)!;parts.forEach(g => g.dispose());
  const material = new THREE.MeshStandardMaterial({vertexColors: true, roughness: .43, metalness: 0, side: THREE.DoubleSide});
  const depth = new THREE.MeshDepthMaterial({depthPacking: THREE.RGBADepthPacking, side: THREE.DoubleSide});
  for (const m of [material, depth]) {
    m.onBeforeCompile = shader => {
      shader.uniforms.uPickleHoles = {value: directions};
      shader.vertexShader = 'attribute float holeWall; varying vec3 vPicklePosition; varying float vPickleWall;\n' + shader.vertexShader;
      shader.vertexShader = shader.vertexShader.replace('#include <begin_vertex>', '#include <begin_vertex>\nvPicklePosition=position;vPickleWall=holeWall;');
      shader.fragmentShader = `uniform vec3 uPickleHoles[${HOLE_COUNT}]; varying vec3 vPicklePosition; varying float vPickleWall;\n` + shader.fragmentShader;
      shader.fragmentShader = shader.fragmentShader.replace('#include <clipping_planes_fragment>', `#include <clipping_planes_fragment>\nif(vPickleWall<.5){vec3 d=normalize(vPicklePosition);for(int i=0;i<${HOLE_COUNT};i++){if(dot(d,uPickleHoles[i])>${Math.cos(HOLE_ANGLE).toFixed(9)})discard;}}`);
    };
    m.customProgramCacheKey = () => 'journal-pickleball-perforated-40';
  }
  return {geometry, material, depth};
}

/** A hollow perforated ball: shader cutouts open all forty holes through both
 * shell faces, and modeled inner walls give those openings physical thickness.
 * Shadow cutouts use the same mask. Radius/footprint never animate. */
export function PickleballBall({radius = .037, color = '#d1d574', position, rotation, scale = 1}: BallProps) {
  const ball = useMemo(() => makeBall(color), [color]);
  useEffect(() => () => {ball.geometry.dispose();ball.material.dispose();ball.depth.dispose();}, [ball]);
  return <group position={position} rotation={rotation} scale={scale}>
    <mesh scale={radius} geometry={ball.geometry} material={ball.material} customDepthMaterial={ball.depth} name="hollow-perforated-pickleball" castShadow receiveShadow/>
  </group>;
}
