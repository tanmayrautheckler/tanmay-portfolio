'use client';

import {useEffect, useMemo, useRef, type RefObject} from 'react';
import {useFrame} from '@react-three/fiber';
import {useGLTF} from '@react-three/drei/core/Gltf';
import * as THREE from 'three';
import {mergeGeometries} from 'three/examples/jsm/utils/BufferGeometryUtils.js';

import {ROADSTER_MODEL_URL} from './journal-models';
const WHEEL_RADIUS = .08021;
const START = .08;
const END = .89;
const JOURNEY_SECONDS = 42;

type RoadsterProps = {
  time: RefObject<{t: number}>;
  path: THREE.CatmullRomCurve3;
  /** Physical length in journal world units; the path itself is never scaled. */
  length?: number;
};

/** Two quiet cabin silhouettes share one geometry and one material. At the
 * unchanged miniature scale, separate fingers, noses and shirt meshes cost
 * more than they contribute. The hands remain at the steering-wheel height. */
function makeOccupants() {
  const parts: THREE.BufferGeometry[] = [];
  const add = (geometry: THREE.BufferGeometry, color: string, position: [number, number, number], scale: [number, number, number] = [1, 1, 1], angle = 0) => {
    geometry.applyMatrix4(new THREE.Matrix4().compose(
      new THREE.Vector3(...position),
      new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, 1), angle),
      new THREE.Vector3(...scale),
    ));
    geometry.deleteAttribute('uv');
    const colors = new Float32Array(geometry.attributes.position.count * 3);
    const tint = new THREE.Color(color);
    for (let i = 0; i < colors.length; i += 3) tint.toArray(colors, i);
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    parts.push(geometry);
  };
  for (const driver of [true, false]) {
    const z = driver ? -.103 : .103, shirt = driver ? '#647b77' : '#4a5d6a';
    add(new THREE.SphereGeometry(1, 10, 8), shirt, [-.014, .192, z], [.028, .045, .033], -.12);
    add(new THREE.CylinderGeometry(.009, .010, .02, 8), '#a87b5b', [0, .235, z]);
    add(new THREE.SphereGeometry(1, 10, 8), '#a87b5b', [.002, .262, z], [.021, .028, .020]);
    add(new THREE.SphereGeometry(1, 10, 6), driver ? '#302c26' : '#4c382b', [-.002, .278, z], [.020, .013, .020]);
    for (const side of [-1, 1]) {
      add(new THREE.CapsuleGeometry(.010, .037, 2, 6), shirt, [.017, .208, z + side * .029], [1, 1, 1], -.8);
      add(new THREE.CapsuleGeometry(.0075, .039, 2, 6), '#a87b5b', [.059, driver ? .207 : .183, z + side * .026], [1, 1, 1], driver ? -1.48 : -.90);
    }
  }
  const merged = mergeGeometries(parts, false)!;
  parts.forEach(part => part.dispose());
  return merged;
}

/** A rigid wheelbase follows two road contacts rather than the tangent at
 * the body's centre. This prevents front or rear tyres lifting on the bridge
 * approaches. Scratch objects are reused throughout the animation. */
function makeDrive(path: THREE.CatmullRomCurve3, length: number, wheels: THREE.Object3D[]) {
  const distance = path.getLength();
  const frontX = Math.max(...wheels.map(wheel => wheel.position.x));
  const rearX = Math.min(...wheels.map(wheel => wheel.position.x));
  const midpointX = (frontX + rearX) * length / 2;
  const front = new THREE.Vector3(), rear = new THREE.Vector3();
  const forward = new THREE.Vector3(), side = new THREE.Vector3(), up = new THREE.Vector3();
  const matrix = new THREE.Matrix4(), worldUp = new THREE.Vector3(0, 1, 0);
  const contact = new THREE.Vector3(), projected = new THREE.Vector3(), tangent = new THREE.Vector3();
  const contacts = wheels.map(wheel => {
    const y = Number(wheel.userData.journalRoadsterRestY ?? wheel.position.y);
    wheel.userData.journalRoadsterRestY = y;
    return {wheel, y, point: new THREE.Vector3(wheel.position.x * length, 0, wheel.position.z * length)};
  });
  return (root: THREE.Group, elapsed: number) => {
    // Smooth braking over the final second. Holding at the end avoids the
    // discontinuous jump of looping an open road across a visible spread.
    const seconds = THREE.MathUtils.clamp(elapsed, 0, JOURNEY_SECONDS);
    const braking = Math.max(0, seconds - (JOURNEY_SECONDS - 1));
    const travelled = (seconds - .5 * braking * braking) / (JOURNEY_SECONDS - .5);
    const progress = THREE.MathUtils.lerp(START, END, Math.min(1, travelled));
    path.getPointAt(THREE.MathUtils.clamp(progress + frontX * length / distance, 0, 1), front);
    path.getPointAt(THREE.MathUtils.clamp(progress + rearX * length / distance, 0, 1), rear);
    forward.subVectors(front, rear).normalize();
    side.crossVectors(forward, worldUp).normalize();
    up.crossVectors(side, forward).normalize();
    matrix.makeBasis(forward, up, side);
    root.quaternion.setFromRotationMatrix(matrix);
    root.position.copy(front).add(rear).multiplyScalar(.5).addScaledVector(forward, -midpointX);
    const wheelAngle = -(progress - START) * distance / (WHEEL_RADIUS * length);
    for (const item of contacts) {
      contact.copy(item.point).applyQuaternion(root.quaternion).add(root.position);
      let u = THREE.MathUtils.clamp(progress + item.point.x / distance, 0, 1);
      // A tiny independent suspension correction handles the road's lateral
      // twist on curves without stretching the wheelbase or floating a tyre.
      for (let iteration = 0; iteration < 3; iteration++) {
        path.getPointAt(u, projected);path.getTangentAt(u, tangent);
        const horizontal = tangent.x * tangent.x + tangent.z * tangent.z;
        u = THREE.MathUtils.clamp(u + ((contact.x - projected.x) * tangent.x + (contact.z - projected.z) * tangent.z) / (distance * horizontal), 0, 1);
      }
      path.getPointAt(u, projected);
      item.wheel.position.y = item.y + (projected.y - contact.y) / (up.y * length);
      item.wheel.rotation.z = wheelAngle;
    }
  };
}

/** CC0 Innerscene geometry, locally optimized into material batches and four
 * wheel pivots. See public/models/journal/roadster/SOURCE.md for provenance.
 * The source model is one unit long, faces +X and touches the road at y=0. */
export default function Roadster({time, path, length = .63}: RoadsterProps) {
  const moving = useRef<THREE.Group>(null);
  const {scene} = useGLTF(ROADSTER_MODEL_URL);
  const occupants = useMemo(() => makeOccupants(), []);
  useEffect(() => () => occupants.dispose(), [occupants]);
  const model = useMemo(() => {
    const instance = scene.clone(true);
    const wheels: THREE.Object3D[] = [];
    instance.traverse(object => {
      if (/^Wheel_(Front|Rear)_(Right|Left)$/.test(object.name)) wheels.push(object);
      if (object instanceof THREE.Mesh) {
        object.castShadow = true;
        object.receiveShadow = true;
      }
    });
    return {instance, wheels};
  }, [scene]);
  const drive = useMemo(() => makeDrive(path, length, model.wheels), [path, length, model]);
  useFrame(() => {
    if (moving.current) drive(moving.current, time.current.t);
  });

  return <group ref={moving} name="unbranded-roadster-on-the-valley-road">
    <group scale={length}>
      <primitive object={model.instance} dispose={null}/>
      <mesh geometry={occupants} castShadow><meshStandardMaterial vertexColors roughness={.84}/></mesh>
    </group>
  </group>;
}
