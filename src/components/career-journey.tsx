"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Sphere, Html } from "@react-three/drei";
import { useRef, useState, Suspense, useMemo, useEffect, useCallback } from "react";
import * as THREE from "three";

interface Location {
  name: string;
  lat: number;
  lng: number;
  type: "career" | "travel-us" | "travel-intl";
  year?: string;
  description?: string;
  color: string;
}

const locations: Location[] = [
  // Career
  { name: "Manipal", lat: 13.35, lng: 74.79, type: "career", year: "2016–2019", description: "B.Tech Aeronautical Engineering", color: "#f59e0b" },
  { name: "Mumbai", lat: 19.08, lng: 72.88, type: "career", year: "2020–2022", description: "Production Supervisor — Vats & Vessels", color: "#ef4444" },
  { name: "Phoenix", lat: 33.45, lng: -112.07, type: "career", year: "2022–Now", description: "ASU → United Foods → Heckler Design", color: "#0EBBFF" },
  // US
  { name: "Hawaii", lat: 20.80, lng: -156.33, type: "travel-us", color: "#22c55e" },
  { name: "Florida", lat: 27.99, lng: -81.76, type: "travel-us", color: "#22c55e" },
  { name: "Georgia", lat: 33.75, lng: -84.39, type: "travel-us", color: "#22c55e" },
  { name: "South Carolina", lat: 33.84, lng: -81.16, type: "travel-us", color: "#22c55e" },
  { name: "Minnesota", lat: 44.98, lng: -93.27, type: "travel-us", color: "#22c55e" },
  { name: "Colorado", lat: 39.74, lng: -104.99, type: "travel-us", color: "#22c55e" },
  { name: "Idaho", lat: 43.62, lng: -114.74, type: "travel-us", color: "#22c55e" },
  { name: "Wyoming", lat: 44.43, lng: -110.59, type: "travel-us", color: "#22c55e" },
  { name: "Utah", lat: 38.57, lng: -109.55, type: "travel-us", color: "#22c55e" },
  { name: "New Jersey", lat: 40.06, lng: -74.41, type: "travel-us", color: "#22c55e" },
  { name: "New York", lat: 40.71, lng: -74.01, type: "travel-us", color: "#22c55e" },
  { name: "Massachusetts", lat: 42.36, lng: -71.06, type: "travel-us", color: "#22c55e" },
  { name: "West Virginia", lat: 38.35, lng: -81.63, type: "travel-us", color: "#22c55e" },
  { name: "Washington DC", lat: 38.91, lng: -77.04, type: "travel-us", color: "#22c55e" },
  { name: "Virginia", lat: 37.43, lng: -79.14, type: "travel-us", color: "#22c55e" },
  { name: "Maryland", lat: 39.29, lng: -76.61, type: "travel-us", color: "#22c55e" },
  { name: "California", lat: 37.77, lng: -122.42, type: "travel-us", color: "#22c55e" },
  { name: "Nevada", lat: 36.17, lng: -115.14, type: "travel-us", color: "#22c55e" },
  // International
  { name: "India", lat: 20.59, lng: 78.96, type: "travel-intl", color: "#a855f7" },
  { name: "France", lat: 48.86, lng: 2.35, type: "travel-intl", color: "#a855f7" },
  { name: "Bahamas", lat: 25.03, lng: -77.35, type: "travel-intl", color: "#a855f7" },
  { name: "Singapore", lat: 1.35, lng: 103.82, type: "travel-intl", color: "#a855f7" },
  { name: "Turkey", lat: 41.01, lng: 28.98, type: "travel-intl", color: "#a855f7" },
  { name: "Belgium", lat: 50.85, lng: 4.35, type: "travel-intl", color: "#a855f7" },
  { name: "Netherlands", lat: 52.37, lng: 4.90, type: "travel-intl", color: "#a855f7" },
];

function latLngToVec3(lat: number, lng: number, r: number): THREE.Vector3 {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);
  return new THREE.Vector3(-(r * Math.sin(phi) * Math.cos(theta)), r * Math.cos(phi), r * Math.sin(phi) * Math.sin(theta));
}

// Animated arc with glowing trail
function AnimatedArc({ start, end, color, delay }: { start: THREE.Vector3; end: THREE.Vector3; color: string; delay: number }) {
  const groupRef = useRef<THREE.Group>(null);
  const lineObjRef = useRef<THREE.Line | null>(null);

  const fullPoints = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i <= 80; i++) {
      const t = i / 80;
      const p = new THREE.Vector3().lerpVectors(start, end, t);
      p.normalize().multiplyScalar(2 * (1 + 0.2 * Math.sin(Math.PI * t)));
      pts.push(p);
    }
    return pts;
  }, [start, end]);

  useEffect(() => {
    if (!groupRef.current) return;
    const geom = new THREE.BufferGeometry();
    const mat = new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.8 });
    const line = new THREE.Line(geom, mat);
    groupRef.current.add(line);
    lineObjRef.current = line;
    return () => {
      groupRef.current?.remove(line);
      geom.dispose();
      mat.dispose();
    };
  }, [color]);

  useFrame(({ clock }) => {
    if (!lineObjRef.current) return;
    const time = clock.getElapsedTime() - delay;
    if (time < 0) return;
    const progress = Math.min(1, (time % 4) / 2);
    const count = Math.max(2, Math.floor(progress * fullPoints.length));
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = fullPoints[i].x;
      positions[i * 3 + 1] = fullPoints[i].y;
      positions[i * 3 + 2] = fullPoints[i].z;
    }
    lineObjRef.current.geometry.dispose();
    const newGeom = new THREE.BufferGeometry();
    newGeom.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    lineObjRef.current.geometry = newGeom;
  });

  return <group ref={groupRef} />;
}

// Pulsing marker
function Marker({ loc, isActive, onClick }: { loc: Location; isActive: boolean; onClick: () => void }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const pulseRef = useRef<THREE.Mesh>(null);
  const pos = useMemo(() => latLngToVec3(loc.lat, loc.lng, 2.01), [loc]);
  const isCareer = loc.type === "career";
  const size = isCareer ? 0.055 : 0.025;

  useFrame(({ clock }) => {
    if (pulseRef.current && isCareer) {
      const s = 1 + 0.3 * Math.sin(clock.getElapsedTime() * 2);
      pulseRef.current.scale.setScalar(s);
    }
    if (meshRef.current) {
      const hover = isActive ? 1.4 : 1;
      meshRef.current.scale.lerp(new THREE.Vector3(hover, hover, hover), 0.1);
    }
  });

  return (
    <group position={pos}>
      {/* Glow */}
      {isCareer && (
        <mesh ref={pulseRef}>
          <sphereGeometry args={[size * 3, 16, 16]} />
          <meshBasicMaterial color={loc.color} transparent opacity={0.15} />
        </mesh>
      )}
      {/* Main dot */}
      <mesh ref={meshRef} onClick={onClick}>
        <sphereGeometry args={[size, 16, 16]} />
        <meshStandardMaterial color={loc.color} emissive={loc.color} emissiveIntensity={isActive ? 2 : 0.8} />
      </mesh>
      {/* Label on hover for career */}
      {isCareer && isActive && (
        <Html distanceFactor={8} position={[0, 0.15, 0]} center>
          <div className="bg-black/80 backdrop-blur px-3 py-1.5 rounded-lg text-[11px] text-white whitespace-nowrap border border-white/10 pointer-events-none">
            <span className="font-bold">{loc.name}</span>
            {loc.year && <span className="text-white/50 ml-1.5">{loc.year}</span>}
          </div>
        </Html>
      )}
    </group>
  );
}

// Earth-like dots for continents
function ContinentDots() {
  const dotsRef = useRef<THREE.Points>(null);
  // Generate random dots biased toward land masses (rough approximation)
  const positions = useMemo(() => {
    const pts: number[] = [];
    const landRegions = [
      { latMin: 10, latMax: 55, lngMin: -130, lngMax: -60 },   // North America
      { latMin: -35, latMax: 10, lngMin: -80, lngMax: -35 },    // South America
      { latMin: 35, latMax: 70, lngMin: -10, lngMax: 40 },      // Europe
      { latMin: -35, latMax: 35, lngMin: 10, lngMax: 55 },      // Africa
      { latMin: 5, latMax: 55, lngMin: 60, lngMax: 140 },       // Asia
      { latMin: -40, latMax: -10, lngMin: 115, lngMax: 155 },   // Australia
      { latMin: 5, latMax: 35, lngMin: 65, lngMax: 90 },        // India
    ];
    for (let i = 0; i < 2000; i++) {
      const region = landRegions[Math.floor(Math.random() * landRegions.length)];
      const lat = region.latMin + Math.random() * (region.latMax - region.latMin);
      const lng = region.lngMin + Math.random() * (region.lngMax - region.lngMin);
      // Add some noise
      const noiseLat = lat + (Math.random() - 0.5) * 5;
      const noiseLng = lng + (Math.random() - 0.5) * 5;
      const v = latLngToVec3(noiseLat, noiseLng, 2.005);
      pts.push(v.x, v.y, v.z);
    }
    return new Float32Array(pts);
  }, []);

  return (
    <points ref={dotsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.008} color="#0EBBFF" transparent opacity={0.25} sizeAttenuation />
    </points>
  );
}

// Star field
function Stars() {
  const ref = useRef<THREE.Points>(null);
  const positions = useMemo(() => {
    const p = new Float32Array(500 * 3);
    for (let i = 0; i < 500; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = 8 + Math.random() * 5;
      p[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      p[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      p[i * 3 + 2] = r * Math.cos(phi);
    }
    return p;
  }, []);

  useFrame(({ clock }) => {
    if (ref.current) ref.current.rotation.y = clock.getElapsedTime() * 0.005;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.02} color="#ffffff" transparent opacity={0.5} sizeAttenuation />
    </points>
  );
}

function GridLines() {
  const groupRef = useRef<THREE.Group>(null);
  useEffect(() => {
    if (!groupRef.current) return;
    const mat = new THREE.LineBasicMaterial({ color: "#0EBBFF", transparent: true, opacity: 0.04 });
    for (let lat = -60; lat <= 60; lat += 30) {
      const pts: THREE.Vector3[] = [];
      for (let lng = 0; lng <= 360; lng += 3) pts.push(latLngToVec3(lat, lng, 2.008));
      const geom = new THREE.BufferGeometry().setFromPoints(pts);
      groupRef.current.add(new THREE.Line(geom, mat));
    }
    return () => { mat.dispose(); };
  }, []);
  return <group ref={groupRef} />;
}

function Globe({ activeIndex, onMarkerClick }: { activeIndex: number; onMarkerClick: (i: number) => void }) {
  const globeRef = useRef<THREE.Group>(null);
  const careerLocs = locations.filter(l => l.type === "career");

  useFrame(({ clock }) => {
    if (globeRef.current) {
      globeRef.current.rotation.y += 0.001;
    }
  });

  // Career arcs
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

  return (
    <group ref={globeRef}>
      {/* Globe sphere */}
      <Sphere args={[2, 64, 64]}>
        <meshStandardMaterial color="#0a0a1a" roughness={1} metalness={0} />
      </Sphere>
      {/* Atmosphere */}
      <Sphere args={[2.15, 64, 64]}>
        <meshStandardMaterial color="#0EBBFF" transparent opacity={0.03} side={THREE.BackSide} />
      </Sphere>
      <Sphere args={[2.25, 64, 64]}>
        <meshStandardMaterial color="#0EBBFF" transparent opacity={0.015} side={THREE.BackSide} />
      </Sphere>

      {/* Continent dots */}
      <ContinentDots />

      {/* Grid lines — rendered imperatively */}
      <GridLines />

      {/* Animated arcs */}
      {arcs.map((arc, i) => (
        <AnimatedArc key={i} start={arc.start} end={arc.end} color={arc.color} delay={i * 1.5} />
      ))}

      {/* Markers */}
      {locations.map((loc, i) => {
        const careerIdx = careerLocs.indexOf(loc);
        return (
          <Marker
            key={loc.name}
            loc={loc}
            isActive={careerIdx === activeIndex}
            onClick={() => { if (careerIdx >= 0) onMarkerClick(careerIdx); }}
          />
        );
      })}
    </group>
  );
}

export function CareerJourney() {
  const [activeIndex, setActiveIndex] = useState(2);
  const careerLocs = locations.filter(l => l.type === "career");
  const usTravel = locations.filter(l => l.type === "travel-us");
  const intlTravel = locations.filter(l => l.type === "travel-intl");
  const totalPlaces = locations.length;

  return (
    <div className="rounded-3xl overflow-hidden" style={{ background: "#050510", border: "1px solid rgba(14,187,255,0.1)" }}>
      {/* Header stats */}
      <div className="flex items-center justify-between px-6 md:px-8 pt-6">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          <span className="text-cyan-400 text-xs font-mono tracking-wider uppercase">Interactive Globe</span>
        </div>
        <div className="flex items-center gap-4 text-xs text-gray-500">
          <span><strong className="text-white">{totalPlaces}</strong> places</span>
          <span><strong className="text-green-400">{usTravel.length}</strong> US states</span>
          <span><strong className="text-purple-400">{intlTravel.length}</strong> countries</span>
        </div>
      </div>

      {/* 3D Globe */}
      <div className="h-[480px] md:h-[580px] relative cursor-grab active:cursor-grabbing">
        <Canvas camera={{ position: [0, 1.5, 5], fov: 42 }} dpr={[1, 2]} frameloop="always">
          <Suspense fallback={null}>
            <ambientLight intensity={0.2} />
            <directionalLight position={[5, 3, 5]} intensity={0.4} color="#ffffff" />
            <pointLight position={[-5, -3, -5]} intensity={0.2} color="#a855f7" />
            <pointLight position={[3, 2, -3]} intensity={0.3} color="#0EBBFF" />
            <Stars />
            <Globe activeIndex={activeIndex} onMarkerClick={setActiveIndex} />
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
            />
          </Suspense>
        </Canvas>
        {/* Instruction */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-[10px] text-gray-600 flex items-center gap-2">
          <span>Drag to rotate</span>
          <span className="w-1 h-1 rounded-full bg-gray-700" />
          <span>Scroll to zoom</span>
          <span className="w-1 h-1 rounded-full bg-gray-700" />
          <span>Click markers</span>
        </div>
      </div>

      {/* Info panel */}
      <div className="px-6 md:px-8 pb-6 pt-2" style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
        {/* Career */}
        <div className="flex items-center gap-2 mb-3 overflow-x-auto pb-1">
          <span className="text-[10px] uppercase tracking-wider text-gray-600 shrink-0 mr-1">Career</span>
          {careerLocs.map((loc, i) => (
            <button
              key={loc.name}
              onClick={() => setActiveIndex(i)}
              className={`shrink-0 px-4 py-1.5 rounded-full text-xs font-medium transition-all duration-300 ${
                i === activeIndex ? "text-black shadow-lg" : "border border-gray-800 text-gray-500 hover:text-white hover:border-gray-600"
              }`}
              style={i === activeIndex ? { background: loc.color, boxShadow: `0 0 20px ${loc.color}40` } : {}}
            >
              {loc.name}
            </button>
          ))}
        </div>
        {/* US */}
        <div className="flex items-center gap-1.5 mb-2 overflow-x-auto pb-1">
          <span className="text-[10px] uppercase tracking-wider text-gray-600 shrink-0 mr-1">US ({usTravel.length})</span>
          {usTravel.map((loc) => (
            <span key={loc.name} className="shrink-0 px-2 py-0.5 rounded-full text-[9px] border border-green-900/50 text-green-500/70">{loc.name}</span>
          ))}
        </div>
        {/* Intl */}
        <div className="flex items-center gap-1.5 mb-4 overflow-x-auto pb-1">
          <span className="text-[10px] uppercase tracking-wider text-gray-600 shrink-0 mr-1">Intl</span>
          {intlTravel.map((loc) => (
            <span key={loc.name} className="shrink-0 px-2 py-0.5 rounded-full text-[9px] border border-purple-800/50 text-purple-400/70">{loc.name}</span>
          ))}
        </div>
        {/* Active info */}
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full" style={{ background: careerLocs[activeIndex].color, boxShadow: `0 0 10px ${careerLocs[activeIndex].color}` }} />
          <div>
            <span className="text-xs font-mono" style={{ color: careerLocs[activeIndex].color }}>{careerLocs[activeIndex].year}</span>
            <span className="text-gray-600 mx-2">·</span>
            <span className="text-sm font-semibold text-white">{careerLocs[activeIndex].description}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
