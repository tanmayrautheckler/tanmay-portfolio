"use client";

import { Component, Suspense, useEffect, useMemo, useRef, useState, type ReactNode, type RefObject } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Image as ThreeImage, useTexture } from "@react-three/drei";
import * as THREE from "three";
import { aboutPhotos } from "./photos";

// An unavailable GPU or failed texture must never block the rest of About.
class SceneBoundary extends Component<{ children: ReactNode; fallback?: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() { return this.state.failed ? this.props.fallback ?? null : this.props.children; }
}

const lakeVertex = `varying vec2 vUv;
void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`;
const lakeFragment = `
uniform sampler2D uImage;
uniform float uTime;
uniform vec2 uCover;
uniform vec2 uPointer;
varying vec2 vUv;
void main(){
  vec2 viewUv=(vUv-.5)*.97+.5;
  vec2 uv=(viewUv-.5)*uCover+.5;
  uv+=(uPointer-.5)*vec2(.012,.006);
  // Only the water moves. Mountains, shore and the portrait remain stable.
  float lake=smoothstep(.13,.21,uv.y)*(1.-smoothstep(.43,.49,uv.y));
  float depth=1.-smoothstep(.16,.49,uv.y);
  float swell=sin(uv.x*39.+uv.y*64.-uTime*1.6);
  float ripple=sin(uv.x*107.-uv.y*88.+uTime*2.1);
  vec2 wave=vec2(swell*.0025,ripple*.0015+swell*.003);
  vec2 touch=(uPointer-.5)*uCover+.5;
  float distanceToPointer=length(uv-touch);
  float ring=sin(distanceToPointer*95.-uTime*3.)*exp(-distanceToPointer*10.);
  uv+=wave*lake*(.3+depth)+normalize(uv-touch+vec2(.0001))*ring*.003*lake;
  float sky=smoothstep(.63,.85,uv.y);
  uv.x+=sin(uTime*.08)*.009*sky;
  vec4 color=texture2D(uImage,uv);
  float reflection=pow(max(0.,sin(uv.x*230.+swell*2.+uTime)),18.);
  float lightPath=exp(-pow((uv.x-.72)*5.,2.));
  color.rgb+=vec3(.12,.10,.06)*reflection*lightPath*lake;
  color.rgb+=vec3(.015,.021,.022)*swell*lake;
  gl_FragColor=color;
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}`;

function LivingLake({ paused, pointer }: { paused: boolean; pointer: RefObject<{x:number;y:number}> }) {
  const sourceTexture = useTexture("/images/about/tahoe/landscape.webp");
  const texture = useMemo(() => {
    const copy = sourceTexture.clone();
    copy.colorSpace = THREE.SRGBColorSpace;
    copy.needsUpdate = true;
    return copy;
  }, [sourceTexture]);
  useEffect(() => () => texture.dispose(), [texture]);
  const material = useRef<THREE.ShaderMaterial>(null);
  const { viewport } = useThree();
  const aspect = viewport.width / viewport.height;
  const uniforms = useMemo(() => ({ uImage: { value: texture }, uTime: { value: 0 }, uCover: { value: new THREE.Vector2(1, 1) }, uPointer: { value: new THREE.Vector2(.5,.3) } }), [texture]);
  useEffect(() => {
    uniforms.uCover.value.set(aspect < 1.5 ? aspect / 1.5 : 1, aspect > 1.5 ? 1.5 / aspect : 1);
  }, [texture, uniforms, aspect]);
  useFrame((_, delta) => {
    if (material.current && !paused) {
      material.current.uniforms.uTime.value += Math.min(delta, .05);
      material.current.uniforms.uPointer.value.lerp(new THREE.Vector2(pointer.current.x,pointer.current.y),1-Math.exp(-delta*2));
    }
  });
  return <mesh scale={[viewport.width, viewport.height, 1]}><planeGeometry args={[1, 1]}/><shaderMaterial ref={material} uniforms={uniforms} vertexShader={lakeVertex} fragmentShader={lakeFragment} depthTest={false}/></mesh>;
}

export function LakeCanvas({ active, paused, pointer }: { active: boolean; paused: boolean; pointer: RefObject<{x:number;y:number}> }) {
  return <SceneBoundary><Canvas aria-hidden="true" orthographic camera={{ position: [0, 0, 5], zoom: 1 }} dpr={[1, 1.5]} gl={{ antialias: false, alpha: true, powerPreference: "low-power" }} frameloop={active && !paused ? "always" : "demand"} fallback={<span/>}>
    <Suspense fallback={null}><LivingLake paused={paused} pointer={pointer}/></Suspense>
  </Canvas></SceneBoundary>;
}

function PhotoPanel({ index, selected, onSelect, drag, reduced }: { index: number; selected: number; onSelect: (index: number) => void; drag: RefObject<number>; reduced: boolean }) {
  const group = useRef<THREE.Group>(null);
  const photo = aboutPhotos[index];
  const offset = ((index - selected + 9) % 6) - 3;
  const [initialPosition] = useState<[number, number, number]>(() => [offset * 4.8, 0, -Math.abs(offset) * 1.4]);
  useFrame((_, delta) => {
    if (!group.current) return;
    const relative = offset + drag.current;
    const amount = reduced ? 1 : 1 - Math.exp(-7 * Math.min(delta, .05));
    group.current.position.x = THREE.MathUtils.lerp(group.current.position.x, relative * 4.8, amount);
    group.current.position.z = THREE.MathUtils.lerp(group.current.position.z, -Math.abs(relative) * 1.4, amount);
    group.current.rotation.y = THREE.MathUtils.lerp(group.current.rotation.y, -relative * .23, amount);
  });
  return <group ref={group} position={initialPosition} onClick={event => { event.stopPropagation(); if (Math.abs(drag.current) < .025) onSelect(index); }}>
    <mesh position={[0, 0, -.08]}><boxGeometry args={[4.2, 4.5, .13]}/><meshStandardMaterial color="#ded9ca" roughness={.7}/></mesh>
    <ThreeImage url={`/images/about/gallery/${photo.id}.webp`} scale={[4.02, 4.32]} position={[0, 0, .002]} transparent radius={.008} toneMapped={false}/>
    <mesh position={[0, -2.37, -.2]} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[4.5, 1.2]}/><meshBasicMaterial color="#403c30" transparent opacity={.06} depthWrite={false}/></mesh>
  </group>;
}

function PhotoRing({ selected, onSelect, drag, reduced }: { selected: number; onSelect: (index: number) => void; drag: RefObject<number>; reduced: boolean }) {
  useFrame(({ camera, size, pointer }, delta) => {
    const cameraZ = size.width < 600 ? 8.4 : 6.8;
    camera.position.x = THREE.MathUtils.damp(camera.position.x, reduced ? 0 : pointer.x * .24, 3, delta);
    camera.position.y = THREE.MathUtils.damp(camera.position.y, .2 + (reduced ? 0 : pointer.y * .13), 3, delta);
    camera.position.z = THREE.MathUtils.damp(camera.position.z, cameraZ, 4, delta);
    camera.lookAt(0, 0, 0);
  });
  return <group>{aboutPhotos.map((photo,index)=><PhotoPanel key={photo.id} index={index} selected={selected} onSelect={onSelect} drag={drag} reduced={reduced}/>)}</group>;
}

export function GalleryCanvas({ selected, onSelect, drag, active, reduced, fallback }: { selected: number; onSelect: (index: number) => void; drag: RefObject<number>; active: boolean; reduced: boolean; fallback: ReactNode }) {
  return <SceneBoundary fallback={fallback}><Canvas aria-label="Rotating gallery of Tanmay’s travel photos" camera={{ position: [0, .2, 6.8], fov: 40 }} dpr={[1, 1.5]} gl={{ antialias: true, alpha: true, powerPreference: "low-power" }} frameloop={active ? "always" : "demand"} fallback={fallback}>
    <ambientLight intensity={1.6}/><directionalLight position={[2, 6, 5]} intensity={2}/>
    <Suspense fallback={null}><PhotoRing selected={selected} onSelect={onSelect} drag={drag} reduced={reduced}/></Suspense>
  </Canvas></SceneBoundary>;
}
