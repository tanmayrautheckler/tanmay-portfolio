"use client";

import { Canvas, useFrame, useThree, extend } from "@react-three/fiber";
import { OrbitControls, Sphere, Html, shaderMaterial } from "@react-three/drei";
import { useRef, useState, Suspense, useMemo, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import * as THREE from "three";

// ─── Data ──────────────────────────────────────────────────
interface Location {
  name: string;
  lat: number;
  lng: number;
  type: "career" | "travel-us" | "travel-intl";
  year?: string;
  description?: string;
  color: string;
  flag?: string;
  photo?: string;
  blurb?: string;
}

const locations: Location[] = [
  { name: "Manipal", lat: 13.35, lng: 74.79, type: "career", year: "2016–2019", description: "B.Tech Aeronautical Engineering", color: "#f59e0b", blurb: "Where it all began — engineering fundamentals at MIT Manipal" },
  { name: "Mumbai", lat: 19.08, lng: 72.88, type: "career", year: "2020–2022", description: "Production Supervisor — Vats & Vessels", color: "#ef4444", blurb: "Managing 30+ welders & machinists on the factory floor" },
  { name: "Phoenix", lat: 33.45, lng: -112.07, type: "career", year: "2022–Now", description: "ASU → United Foods → Heckler Design", color: "#0EBBFF", blurb: "Master's degree, then building ERP systems that run businesses" },
  { name: "Hawaii", lat: 20.80, lng: -156.33, type: "travel-us", color: "#22c55e", blurb: "Paradise on earth" },
  { name: "Florida", lat: 27.99, lng: -81.76, type: "travel-us", color: "#22c55e" },
  { name: "Georgia", lat: 33.75, lng: -84.39, type: "travel-us", color: "#22c55e" },
  { name: "South Carolina", lat: 33.84, lng: -81.16, type: "travel-us", color: "#22c55e" },
  { name: "Minnesota", lat: 44.98, lng: -93.27, type: "travel-us", color: "#22c55e" },
  { name: "Colorado", lat: 39.74, lng: -104.99, type: "travel-us", color: "#22c55e", blurb: "Mountain adventures" },
  { name: "Idaho", lat: 43.62, lng: -114.74, type: "travel-us", color: "#22c55e" },
  { name: "Wyoming", lat: 44.43, lng: -110.59, type: "travel-us", color: "#22c55e", blurb: "Yellowstone magic" },
  { name: "Utah", lat: 38.57, lng: -109.55, type: "travel-us", color: "#22c55e", blurb: "Monument Valley sunsets", photo: "/tanmay-portfolio/images/lifestyle/camping.jpg" },
  { name: "New Jersey", lat: 40.06, lng: -74.41, type: "travel-us", color: "#22c55e" },
  { name: "New York", lat: 40.71, lng: -74.01, type: "travel-us", color: "#22c55e", blurb: "The city that never sleeps" },
  { name: "Massachusetts", lat: 42.36, lng: -71.06, type: "travel-us", color: "#22c55e" },
  { name: "West Virginia", lat: 38.35, lng: -81.63, type: "travel-us", color: "#22c55e" },
  { name: "Washington DC", lat: 38.91, lng: -77.04, type: "travel-us", color: "#22c55e" },
  { name: "Virginia", lat: 37.43, lng: -79.14, type: "travel-us", color: "#22c55e" },
  { name: "Maryland", lat: 39.29, lng: -76.61, type: "travel-us", color: "#22c55e" },
  { name: "California", lat: 37.77, lng: -122.42, type: "travel-us", color: "#22c55e", blurb: "LA skyline views", photo: "/tanmay-portfolio/images/lifestyle/la-skyline.jpg" },
  { name: "Nevada", lat: 36.17, lng: -115.14, type: "travel-us", color: "#22c55e", blurb: "Vegas lights" },
  { name: "India", lat: 20.59, lng: 78.96, type: "travel-intl", color: "#a855f7", flag: "🇮🇳", blurb: "Home" },
  { name: "France", lat: 48.86, lng: 2.35, type: "travel-intl", color: "#a855f7", flag: "🇫🇷", blurb: "Oui oui" },
  { name: "Bahamas", lat: 25.03, lng: -77.35, type: "travel-intl", color: "#a855f7", flag: "🇧🇸", blurb: "Crystal clear waters" },
  { name: "Singapore", lat: 1.35, lng: 103.82, type: "travel-intl", color: "#a855f7", flag: "🇸🇬", blurb: "Future city" },
  { name: "Turkey", lat: 41.01, lng: 28.98, type: "travel-intl", color: "#a855f7", flag: "🇹🇷", blurb: "East meets West" },
  { name: "Belgium", lat: 50.85, lng: 4.35, type: "travel-intl", color: "#a855f7", flag: "🇧🇪", blurb: "Chocolate & waffles" },
  { name: "Netherlands", lat: 52.37, lng: 4.90, type: "travel-intl", color: "#a855f7", flag: "🇳🇱", blurb: "Canals & culture" },
  { name: "UK", lat: 51.51, lng: -0.13, type: "travel-intl", color: "#a855f7", flag: "🇬🇧", blurb: "Across the pond" },
  { name: "Iceland", lat: 64.13, lng: -21.90, type: "travel-intl", color: "#a855f7", flag: "🇮🇸", blurb: "Northern lights", photo: "/tanmay-portfolio/images/lifestyle/northern-lights.jpg" },
];

function latLngToVec3(lat: number, lng: number, r: number): THREE.Vector3 {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);
  return new THREE.Vector3(-(r * Math.sin(phi) * Math.cos(theta)), r * Math.cos(phi), r * Math.sin(phi) * Math.sin(theta));
}

// ─── Earth Shader ──────────────────────────────────────────
const EarthMaterial = shaderMaterial(
  { uTime: 0 },
  // Vertex
  `
  varying vec3 vNormal;
  varying vec3 vPosition;
  varying vec2 vUv;
  void main() {
    vNormal = normalize(normalMatrix * normal);
    vPosition = (modelViewMatrix * vec4(position, 1.0)).xyz;
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
  `,
  // Fragment — procedural earth
  `
  uniform float uTime;
  varying vec3 vNormal;
  varying vec3 vPosition;
  varying vec2 vUv;

  // Simple noise
  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
  }
  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    float a = hash(i);
    float b = hash(i + vec2(1.0, 0.0));
    float c = hash(i + vec2(0.0, 1.0));
    float d = hash(i + vec2(1.0, 1.0));
    return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
  }
  float fbm(vec2 p) {
    float v = 0.0;
    float a = 0.5;
    for (int i = 0; i < 5; i++) {
      v += a * noise(p);
      p *= 2.0;
      a *= 0.5;
    }
    return v;
  }

  void main() {
    // Convert UV to lat/lng style coordinates for continent generation
    vec2 p = vUv * vec2(8.0, 4.0);
    float land = fbm(p + vec2(0.5, 0.2));
    land = smoothstep(0.42, 0.52, land);

    // Ocean colors (deep blue to lighter)
    vec3 deepOcean = vec3(0.02, 0.04, 0.12);
    vec3 shallowOcean = vec3(0.04, 0.08, 0.18);
    vec3 oceanColor = mix(deepOcean, shallowOcean, fbm(vUv * 6.0));

    // Land colors
    vec3 lowland = vec3(0.04, 0.15, 0.06);
    vec3 highland = vec3(0.12, 0.22, 0.08);
    vec3 mountain = vec3(0.18, 0.16, 0.12);
    vec3 snow = vec3(0.7, 0.72, 0.75);

    float elevation = fbm(p * 1.5 + vec2(3.0, 1.0));
    vec3 landColor = mix(lowland, highland, smoothstep(0.3, 0.5, elevation));
    landColor = mix(landColor, mountain, smoothstep(0.5, 0.65, elevation));
    landColor = mix(landColor, snow, smoothstep(0.68, 0.75, elevation));

    // Polar ice caps
    float polar = abs(vUv.y - 0.5) * 2.0;
    float ice = smoothstep(0.82, 0.92, polar + fbm(vUv * 10.0) * 0.15);
    landColor = mix(landColor, vec3(0.8, 0.85, 0.9), ice);
    oceanColor = mix(oceanColor, vec3(0.5, 0.6, 0.7), ice * 0.5);

    vec3 baseColor = mix(oceanColor, landColor, land);

    // Lighting
    vec3 lightDir = normalize(vec3(0.5, 0.3, 1.0));
    float diff = max(dot(vNormal, lightDir), 0.0);
    float ambient = 0.15;
    vec3 lit = baseColor * (ambient + diff * 0.85);

    // Specular on ocean
    vec3 viewDir = normalize(-vPosition);
    vec3 halfDir = normalize(lightDir + viewDir);
    float spec = pow(max(dot(vNormal, halfDir), 0.0), 60.0) * (1.0 - land) * 0.4;
    lit += spec * vec3(0.3, 0.5, 0.8);

    // City lights on dark side
    float nightSide = smoothstep(0.0, -0.15, dot(vNormal, lightDir));
    float cities = step(0.72, fbm(vUv * vec2(30.0, 15.0))) * land;
    lit += nightSide * cities * vec3(1.0, 0.85, 0.4) * 0.6;

    // Subtle ocean shimmer
    float shimmer = noise(vUv * 40.0 + uTime * 0.02) * (1.0 - land) * 0.03;
    lit += shimmer * vec3(0.2, 0.4, 0.6);

    gl_FragColor = vec4(lit, 1.0);
  }
  `
);
extend({ EarthMaterial });


// ─── Cloud Shader ──────────────────────────────────────────
const CloudMaterial = shaderMaterial(
  { uTime: 0 },
  `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
  `,
  `
  uniform float uTime;
  varying vec2 vUv;
  float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  float noise(vec2 p) {
    vec2 i = floor(p); vec2 f = fract(p);
    f = f*f*(3.0-2.0*f);
    return mix(mix(hash(i),hash(i+vec2(1,0)),f.x), mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x), f.y);
  }
  float fbm(vec2 p) {
    float v=0.0, a=0.5;
    for(int i=0;i<4;i++){v+=a*noise(p);p*=2.0;a*=0.5;}
    return v;
  }
  void main() {
    vec2 p = vUv * vec2(6.0, 3.0) + vec2(uTime * 0.008, 0.0);
    float clouds = fbm(p);
    clouds = smoothstep(0.45, 0.7, clouds);
    gl_FragColor = vec4(1.0, 1.0, 1.0, clouds * 0.25);
  }
  `
);
extend({ CloudMaterial });

// ─── Miniature 3D Airplane ────────────────────────────────
function AirplaneModel({ color }: { color: string }) {
  const group = useRef<THREE.Group>(null);
  return (
    <group ref={group} scale={[0.025, 0.025, 0.025]}>
      {/* Fuselage */}
      <mesh>
        <cylinderGeometry args={[0.15, 0.3, 2.2, 8]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1.5} metalness={0.8} roughness={0.2} />
      </mesh>
      {/* Nose cone */}
      <mesh position={[0, 1.3, 0]}>
        <coneGeometry args={[0.15, 0.6, 8]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1.5} metalness={0.8} roughness={0.2} />
      </mesh>
      {/* Wings */}
      <mesh position={[0, 0.2, 0]} rotation={[0, 0, 0]}>
        <boxGeometry args={[3.2, 0.06, 0.5]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1.0} metalness={0.6} roughness={0.3} />
      </mesh>
      {/* Tail wing */}
      <mesh position={[0, -0.9, 0]}>
        <boxGeometry args={[1.4, 0.05, 0.35]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1.0} metalness={0.6} roughness={0.3} />
      </mesh>
      {/* Vertical stabilizer */}
      <mesh position={[0, -0.6, 0]} rotation={[0, 0, Math.PI / 2]}>
        <boxGeometry args={[0.8, 0.05, 0.35]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1.0} metalness={0.6} roughness={0.3} />
      </mesh>
      {/* Engine glow left */}
      <mesh position={[-0.8, -0.1, 0]}>
        <sphereGeometry args={[0.12, 8, 8]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
      {/* Engine glow right */}
      <mesh position={[0.8, -0.1, 0]}>
        <sphereGeometry args={[0.12, 8, 8]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
    </group>
  );
}

// ─── Flying Airplane with Contrail ─────────────────────────
function FlyingAirplane({ start, end, color, delay }: { start: THREE.Vector3; end: THREE.Vector3; color: string; delay: number }) {
  const groupRef = useRef<THREE.Group>(null);
  const trailGroupRef = useRef<THREE.Group>(null);
  const trailLineRef = useRef<THREE.Line | null>(null);
  const trailPoints = useRef<THREE.Vector3[]>([]);
  const maxTrail = 40;

  const fullPoints = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i <= 100; i++) {
      const t = i / 100;
      const p = new THREE.Vector3().lerpVectors(start, end, t);
      p.normalize().multiplyScalar(2 * (1 + 0.25 * Math.sin(Math.PI * t)));
      pts.push(p);
    }
    return pts;
  }, [start, end]);

  useEffect(() => {
    if (!trailGroupRef.current) return;
    const geom = new THREE.BufferGeometry();
    const mat = new THREE.LineBasicMaterial({ color: "#ffffff", transparent: true, opacity: 0.3 });
    const line = new THREE.Line(geom, mat);
    trailGroupRef.current.add(line);
    trailLineRef.current = line;
    return () => {
      trailGroupRef.current?.remove(line);
      geom.dispose();
      mat.dispose();
    };
  }, []);

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const time = clock.getElapsedTime() - delay;
    if (time < 0) { groupRef.current.visible = false; return; }

    const cycle = (time % 6) / 4;
    if (cycle > 1) {
      groupRef.current.visible = false;
      trailPoints.current = [];
      return;
    }

    groupRef.current.visible = true;
    const idx = Math.min(Math.floor(cycle * fullPoints.length), fullPoints.length - 1);
    const nextIdx = Math.min(idx + 1, fullPoints.length - 1);
    const pt = fullPoints[idx];
    const next = fullPoints[nextIdx];

    groupRef.current.position.copy(pt);

    // Orient airplane along flight path
    const direction = new THREE.Vector3().subVectors(next, pt).normalize();
    const up = pt.clone().normalize();
    const quaternion = new THREE.Quaternion();
    const lookMat = new THREE.Matrix4().lookAt(new THREE.Vector3(), direction, up);
    quaternion.setFromRotationMatrix(lookMat);
    const adjust = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), Math.PI / 2);
    quaternion.multiply(adjust);
    groupRef.current.quaternion.copy(quaternion);

    // Banking
    const bank = Math.sin(cycle * Math.PI * 2) * 0.2;
    groupRef.current.rotateOnAxis(new THREE.Vector3(0, 1, 0), bank);

    // Contrail
    trailPoints.current.push(pt.clone());
    if (trailPoints.current.length > maxTrail) trailPoints.current.shift();

    if (trailLineRef.current && trailPoints.current.length >= 2) {
      const geom = new THREE.BufferGeometry().setFromPoints(trailPoints.current);
      trailLineRef.current.geometry.dispose();
      trailLineRef.current.geometry = geom;
    }
  });

  return (
    <>
      <group ref={groupRef}>
        <AirplaneModel color={color} />
        <pointLight color={color} intensity={2} distance={0.5} />
      </group>
      <group ref={trailGroupRef} />
    </>
  );
}

// ─── Glowing Arc Tube ──────────────────────────────────────
function GlowingArc({ start, end, color, delay }: { start: THREE.Vector3; end: THREE.Vector3; color: string; delay: number }) {
  const meshRef = useRef<THREE.Mesh>(null);

  const { tube, fullPoints } = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i <= 80; i++) {
      const t = i / 80;
      const p = new THREE.Vector3().lerpVectors(start, end, t);
      p.normalize().multiplyScalar(2 * (1 + 0.22 * Math.sin(Math.PI * t)));
      pts.push(p);
    }
    const curve = new THREE.CatmullRomCurve3(pts);
    return { tube: new THREE.TubeGeometry(curve, 80, 0.008, 6, false), fullPoints: pts };
  }, [start, end]);

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    const mat = meshRef.current.material as THREE.ShaderMaterial;
    const time = clock.getElapsedTime() - delay;
    if (time < 0) { meshRef.current.visible = false; return; }
    meshRef.current.visible = true;
    mat.uniforms.uProgress.value = Math.min(1, (time % 5) / 2.5);
  });

  const mat = useMemo(() => new THREE.ShaderMaterial({
    uniforms: {
      uColor: { value: new THREE.Color(color) },
      uProgress: { value: 0 },
    },
    vertexShader: `
      attribute float arcProgress;
      varying float vProgress;
      void main() {
        // Use UV.x as progress along tube
        vProgress = uv.x;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform vec3 uColor;
      uniform float uProgress;
      varying float vProgress;
      void main() {
        if (vProgress > uProgress) discard;
        float glow = 1.0 - smoothstep(0.0, 0.05, abs(vProgress - uProgress));
        float base = 0.4 + glow * 0.6;
        float alpha = base * smoothstep(0.0, 0.05, vProgress);
        gl_FragColor = vec4(uColor * (1.0 + glow * 2.0), alpha);
      }
    `,
    transparent: true,
    side: THREE.DoubleSide,
    depthWrite: false,
  }), [color]);

  return <mesh ref={meshRef} geometry={tube} material={mat} />;
}

// ─── Pulsing Marker ────────────────────────────────────────
function Marker({ loc, isActive, onClick }: { loc: Location; isActive: boolean; onClick: () => void }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const pulseRef = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Mesh>(null);
  const pos = useMemo(() => latLngToVec3(loc.lat, loc.lng, 2.01), [loc]);
  const isCareer = loc.type === "career";
  const size = isCareer ? 0.055 : 0.025;

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (pulseRef.current && isCareer) {
      const s = 1 + 0.4 * Math.sin(t * 2);
      pulseRef.current.scale.setScalar(s);
    }
    if (ringRef.current && isCareer) {
      ringRef.current.rotation.z = t * 0.5;
      const s = 1.2 + 0.2 * Math.sin(t * 1.5);
      ringRef.current.scale.setScalar(s);
    }
    if (meshRef.current) {
      const hover = isActive ? 1.5 : 1;
      meshRef.current.scale.lerp(new THREE.Vector3(hover, hover, hover), 0.1);
    }
  });

  return (
    <group position={pos}>
      {isCareer && (
        <>
          <mesh ref={pulseRef}>
            <sphereGeometry args={[size * 4, 16, 16]} />
            <meshBasicMaterial color={loc.color} transparent opacity={0.08} />
          </mesh>
          <mesh ref={ringRef}>
            <ringGeometry args={[size * 2.5, size * 3, 32]} />
            <meshBasicMaterial color={loc.color} transparent opacity={0.2} side={THREE.DoubleSide} />
          </mesh>
        </>
      )}
      <mesh ref={meshRef} onClick={onClick}>
        <sphereGeometry args={[size, 16, 16]} />
        <meshStandardMaterial color={loc.color} emissive={loc.color} emissiveIntensity={isActive ? 3 : 1.2} toneMapped={false} />
      </mesh>
      {isCareer && isActive && (
        <Html distanceFactor={8} position={[0, 0.18, 0]} center>
          <div className="bg-black/90 backdrop-blur-xl px-4 py-2 rounded-xl text-[11px] text-white whitespace-nowrap border border-white/10 pointer-events-none shadow-2xl">
            <span className="font-bold">{loc.name}</span>
            {loc.year && <span className="text-white/40 ml-2">{loc.year}</span>}
          </div>
        </Html>
      )}
    </group>
  );
}

// ─── Stars with twinkling ──────────────────────────────────
function Stars() {
  const ref = useRef<THREE.Points>(null);
  const { positions, sizes } = useMemo(() => {
    const p = new Float32Array(800 * 3);
    const s = new Float32Array(800);
    for (let i = 0; i < 800; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = 10 + Math.random() * 8;
      p[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      p[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      p[i * 3 + 2] = r * Math.cos(phi);
      s[i] = 0.01 + Math.random() * 0.03;
    }
    return { positions: p, sizes: s };
  }, []);

  useFrame(({ clock }) => {
    if (ref.current) {
      ref.current.rotation.y = clock.getElapsedTime() * 0.003;
      // Twinkle via size attribute
      const sAttr = ref.current.geometry.attributes.size as THREE.BufferAttribute;
      const arr = sAttr.array as Float32Array;
      const t = clock.getElapsedTime();
      for (let i = 0; i < 800; i++) {
        arr[i] = sizes[i] * (0.5 + 0.5 * Math.sin(t * (1 + i * 0.01) + i));
      }
      sAttr.needsUpdate = true;
    }
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-size" args={[sizes, 1]} />
      </bufferGeometry>
      <pointsMaterial size={0.03} color="#ffffff" transparent opacity={0.7} sizeAttenuation vertexColors={false} />
    </points>
  );
}

// ─── Nebula dust ring ──────────────────────────────────────
function NebulaRing() {
  const ref = useRef<THREE.Points>(null);
  const positions = useMemo(() => {
    const p = new Float32Array(300 * 3);
    for (let i = 0; i < 300; i++) {
      const angle = Math.random() * Math.PI * 2;
      const r = 3.5 + Math.random() * 1.5;
      const y = (Math.random() - 0.5) * 0.3;
      p[i * 3] = Math.cos(angle) * r;
      p[i * 3 + 1] = y;
      p[i * 3 + 2] = Math.sin(angle) * r;
    }
    return p;
  }, []);

  useFrame(({ clock }) => {
    if (ref.current) ref.current.rotation.y = clock.getElapsedTime() * 0.01;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.015} color="#a855f7" transparent opacity={0.15} sizeAttenuation />
    </points>
  );
}

// ─── Camera Controller ─────────────────────────────────────
function CameraController({ target, isTouring }: { target: THREE.Vector3 | null; isTouring: boolean }) {
  const { camera } = useThree();
  const targetPos = useRef(new THREE.Vector3(0, 1.5, 5));

  useFrame(() => {
    if (!isTouring || !target) return;
    const dir = target.clone().normalize();
    const camPos = dir.multiplyScalar(5).add(new THREE.Vector3(0, 1, 0));
    targetPos.current.lerp(camPos, 0.02);
    camera.position.lerp(targetPos.current, 0.02);
    camera.lookAt(0, 0, 0);
  });

  return null;
}

// ─── Earth Globe ───────────────────────────────────────────
function EarthGlobe() {
  const meshRef = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (meshRef.current) {
      const mat = meshRef.current.material as THREE.ShaderMaterial & { uniforms: { uTime: { value: number } } };
      if (mat.uniforms?.uTime) mat.uniforms.uTime.value = clock.getElapsedTime();
    }
  });

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[2, 128, 64]} />
      {/* @ts-ignore */}
      <earthMaterial />
    </mesh>
  );
}

// ─── Cloud Layer ───────────────────────────────────────────
function CloudLayer() {
  const meshRef = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = clock.getElapsedTime() * 0.006;
      const mat = meshRef.current.material as THREE.ShaderMaterial & { uniforms: { uTime: { value: number } } };
      if (mat.uniforms?.uTime) mat.uniforms.uTime.value = clock.getElapsedTime();
    }
  });

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[2.04, 64, 32]} />
      {/* @ts-ignore */}
      <cloudMaterial transparent depthWrite={false} side={THREE.FrontSide} />
    </mesh>
  );
}

// ─── Main Globe Scene ──────────────────────────────────────
function GlobeScene({ activeIndex, onMarkerClick, selectedLoc, onLocSelect, isTouring }: {
  activeIndex: number;
  onMarkerClick: (i: number) => void;
  selectedLoc: Location | null;
  onLocSelect: (loc: Location | null) => void;
  isTouring: boolean;
}) {
  const globeRef = useRef<THREE.Group>(null);
  const careerLocs = locations.filter(l => l.type === "career");

  useFrame(() => {
    if (globeRef.current && !isTouring) {
      globeRef.current.rotation.y += 0.0008;
    }
  });

  const arcs = useMemo(() => {
    const result: { start: THREE.Vector3; end: THREE.Vector3; color: string }[] = [];
    for (let i = 0; i < careerLocs.length - 1; i++) {
      result.push({
        start: latLngToVec3(careerLocs[i].lat, careerLocs[i].lng, 2),
        end: latLngToVec3(careerLocs[i + 1].lat, careerLocs[i + 1].lng, 2),
        color: careerLocs[i + 1].color,
      });
    }
    return result;
  }, []);

  const tourTarget = useMemo(() => {
    if (!isTouring) return null;
    const loc = careerLocs[activeIndex];
    return latLngToVec3(loc.lat, loc.lng, 2);
  }, [isTouring, activeIndex]);

  return (
    <>
      <CameraController target={tourTarget} isTouring={isTouring} />
      <group ref={globeRef}>
        {/* Realistic Earth */}
        <EarthGlobe />
        <CloudLayer />


        {/* Glowing arcs */}
        {arcs.map((arc, i) => (
          <GlowingArc key={`arc-${i}`} start={arc.start} end={arc.end} color={arc.color} delay={i * 1.5} />
        ))}

        {/* Flying airplanes */}
        {arcs.map((arc, i) => (
          <FlyingAirplane key={`plane-${i}`} start={arc.start} end={arc.end} color={arc.color} delay={i * 1.5 + 0.5} />
        ))}

        {/* Location markers */}
        {locations.map((loc) => {
          const careerIdx = careerLocs.indexOf(loc);
          return (
            <Marker
              key={loc.name}
              loc={loc}
              isActive={careerIdx === activeIndex || selectedLoc?.name === loc.name}
              onClick={() => {
                if (careerIdx >= 0) onMarkerClick(careerIdx);
                onLocSelect(loc);
              }}
            />
          );
        })}
      </group>
    </>
  );
}

// ─── UI Components ─────────────────────────────────────────
function PassportStamp({ loc, index, isVisible }: { loc: Location; index: number; isVisible: boolean }) {
  return (
    <motion.div
      initial={{ scale: 0, rotate: -15, opacity: 0 }}
      animate={isVisible ? { scale: 1, rotate: Math.random() * 6 - 3, opacity: 1 } : {}}
      transition={{ type: "spring", stiffness: 300, damping: 20, delay: index * 0.08 }}
      className="relative shrink-0 w-[90px] h-[70px] rounded-lg border-2 border-dashed border-purple-500/40 flex flex-col items-center justify-center gap-0.5 cursor-pointer hover:border-purple-400 hover:bg-purple-500/10 transition-colors group"
      style={{ background: "rgba(168,85,247,0.05)" }}
    >
      <span className="text-xl leading-none">{loc.flag}</span>
      <span className="text-[9px] font-bold text-purple-300 uppercase tracking-wide">{loc.name}</span>
      {loc.blurb && (
        <span className="text-[7px] text-purple-400/60 text-center px-1 leading-tight">{loc.blurb}</span>
      )}
      <div className="absolute inset-0 rounded-lg border border-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity" style={{
        background: "repeating-linear-gradient(45deg, transparent, transparent 3px, rgba(168,85,247,0.03) 3px, rgba(168,85,247,0.03) 6px)"
      }} />
    </motion.div>
  );
}

function PhotoCard({ loc, onClose }: { loc: Location; onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.9 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      className="absolute top-4 right-4 z-20 w-56 rounded-xl overflow-hidden border border-white/10 shadow-2xl"
      style={{ background: "rgba(10,10,30,0.95)", backdropFilter: "blur(20px)" }}
    >
      {loc.photo && (
        <div className="w-full h-32 relative">
          <img src={loc.photo} alt={loc.name} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
        </div>
      )}
      <div className="p-3">
        <div className="flex items-center gap-2 mb-1">
          {loc.flag && <span className="text-lg">{loc.flag}</span>}
          <span className="text-sm font-bold text-white">{loc.name}</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded-full ml-auto" style={{
            background: loc.color + "20",
            color: loc.color,
            border: `1px solid ${loc.color}40`
          }}>
            {loc.type === "career" ? loc.year : loc.type === "travel-us" ? "US" : "Intl"}
          </span>
        </div>
        {loc.description && <p className="text-[10px] text-gray-400 mb-1">{loc.description}</p>}
        {loc.blurb && <p className="text-[11px] text-gray-300 italic">{loc.blurb}</p>}
      </div>
      <button onClick={onClose} className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/60 text-white/60 hover:text-white flex items-center justify-center text-xs">✕</button>
    </motion.div>
  );
}


// ─── Main Export ───────────────────────────────────────────
export function CareerJourney() {
  const [activeIndex, setActiveIndex] = useState(2);
  const [selectedLoc, setSelectedLoc] = useState<Location | null>(null);
  const [isTouring, setIsTouring] = useState(false);
  const [tourText, setTourText] = useState("");
  const [stampsVisible, setStampsVisible] = useState(false);
  const stampsRef = useRef<HTMLDivElement>(null);

  const careerLocs = locations.filter(l => l.type === "career");
  const usTravel = locations.filter(l => l.type === "travel-us");
  const intlTravel = locations.filter(l => l.type === "travel-intl");
  const totalPlaces = locations.length;

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) setStampsVisible(true);
    }, { threshold: 0.3 });
    if (stampsRef.current) observer.observe(stampsRef.current);
    return () => observer.disconnect();
  }, []);

  const startTour = useCallback(() => {
    setIsTouring(true);
    setActiveIndex(0);
    setTourText(careerLocs[0].blurb || careerLocs[0].description || "");

    let step = 0;
    const interval = setInterval(() => {
      step++;
      if (step >= careerLocs.length) {
        clearInterval(interval);
        setTimeout(() => { setIsTouring(false); setTourText(""); }, 2000);
        return;
      }
      setActiveIndex(step);
      setTourText(careerLocs[step].blurb || careerLocs[step].description || "");
    }, 3500);
    return () => clearInterval(interval);
  }, [careerLocs]);

  return (
    <div className="rounded-3xl overflow-hidden relative" style={{ background: "#050510", border: "1px solid rgba(14,187,255,0.1)" }}>
      {/* Header */}
      <div className="flex items-center justify-between px-6 md:px-8 pt-6">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          <span className="text-cyan-400 text-xs font-mono tracking-wider uppercase">Interactive Globe</span>
        </div>
        <div className="flex items-center gap-4 text-xs text-gray-500">
          <span><strong className="text-white">{totalPlaces}</strong> places</span>
          <span><strong className="text-green-400">{usTravel.length}</strong> US states</span>
          <span><strong className="text-purple-400">{intlTravel.length}</strong> countries</span>
          <button
            onClick={startTour}
            disabled={isTouring}
            className="ml-2 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border border-cyan-500/40 text-cyan-400 hover:bg-cyan-500/10 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isTouring ? "Playing..." : "▶ Play My Story"}
          </button>
        </div>
      </div>

      {/* Tour narration */}
      <AnimatePresence>
        {isTouring && tourText && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-16 left-1/2 -translate-x-1/2 z-30 px-6 py-3 rounded-xl border border-white/10 max-w-sm text-center"
            style={{ background: "rgba(10,10,30,0.9)", backdropFilter: "blur(20px)" }}
          >
            <motion.p key={tourText} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm text-white font-medium">
              {tourText}
            </motion.p>
            <div className="flex justify-center gap-1.5 mt-2">
              {careerLocs.map((_, i) => (
                <div key={i} className={`w-1.5 h-1.5 rounded-full transition-colors ${i === activeIndex ? "bg-cyan-400" : "bg-gray-700"}`} />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Photo card */}
      <AnimatePresence>
        {selectedLoc && !isTouring && (
          <PhotoCard loc={selectedLoc} onClose={() => setSelectedLoc(null)} />
        )}
      </AnimatePresence>

      {/* 3D Globe */}
      <div className="h-[500px] md:h-[600px] relative cursor-grab active:cursor-grabbing">
        <Canvas camera={{ position: [0, 1.5, 5], fov: 42 }} dpr={[1, 2]} frameloop="always" gl={{ antialias: true, alpha: true }}>
          <Suspense fallback={null}>
            <ambientLight intensity={0.15} />
            <directionalLight position={[5, 3, 5]} intensity={0.6} color="#ffffff" />
            <pointLight position={[-5, -3, -5]} intensity={0.3} color="#a855f7" />
            <pointLight position={[3, 2, -3]} intensity={0.4} color="#0EBBFF" />
            <Stars />
            <NebulaRing />
            <GlobeScene
              activeIndex={activeIndex}
              onMarkerClick={setActiveIndex}
              selectedLoc={selectedLoc}
              onLocSelect={setSelectedLoc}
              isTouring={isTouring}
            />
            <OrbitControls
              enableZoom
              enablePan={false}
              minDistance={3.5}
              maxDistance={8}
              minPolarAngle={Math.PI / 6}
              maxPolarAngle={Math.PI / 1.3}
              autoRotate={false}
              rotateSpeed={0.5}
              zoomSpeed={0.5}
              enabled={!isTouring}
            />
          </Suspense>
        </Canvas>
        {!isTouring && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-[10px] text-gray-600 flex items-center gap-2">
            <span>Drag to rotate</span><span className="w-1 h-1 rounded-full bg-gray-700" />
            <span>Scroll to zoom</span><span className="w-1 h-1 rounded-full bg-gray-700" />
            <span>Click markers</span>
          </div>
        )}
      </div>

      {/* Info panel */}
      <div className="px-6 md:px-8 pb-6 pt-2" style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
        <div className="flex items-center gap-1.5 mb-4 overflow-x-auto pb-1">
          <span className="text-[10px] uppercase tracking-wider text-gray-600 shrink-0 mr-1">US ({usTravel.length})</span>
          {usTravel.map((loc) => (
            <button
              key={loc.name}
              onClick={() => setSelectedLoc(selectedLoc?.name === loc.name ? null : loc)}
              className={`shrink-0 px-2 py-0.5 rounded-full text-[9px] border transition-colors ${
                selectedLoc?.name === loc.name
                  ? "border-green-400 text-green-300 bg-green-500/10"
                  : "border-green-900/50 text-green-500/70 hover:border-green-600 hover:text-green-400"
              }`}
            >
              {loc.name}
            </button>
          ))}
        </div>

        <div ref={stampsRef}>
          <div className="flex items-center gap-1.5 mb-2">
            <span className="text-[10px] uppercase tracking-wider text-gray-600 shrink-0">Passport</span>
            <span className="text-[10px] text-purple-400/50">{intlTravel.length} stamps collected</span>
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            {intlTravel.map((loc, i) => (
              <div key={loc.name} onClick={() => setSelectedLoc(selectedLoc?.name === loc.name ? null : loc)}>
                <PassportStamp loc={loc} index={i} isVisible={stampsVisible} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
