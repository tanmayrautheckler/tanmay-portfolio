"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Sphere, Html } from "@react-three/drei";
import { useRef, useState, Suspense, useMemo, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import * as THREE from "three";

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
  // Career
  { name: "Manipal", lat: 13.35, lng: 74.79, type: "career", year: "2016–2019", description: "B.Tech Aeronautical Engineering", color: "#f59e0b", blurb: "Where it all began — engineering fundamentals at MIT Manipal" },
  { name: "Mumbai", lat: 19.08, lng: 72.88, type: "career", year: "2020–2022", description: "Production Supervisor — Vats & Vessels", color: "#ef4444", blurb: "Managing 30+ welders & machinists on the factory floor" },
  { name: "Phoenix", lat: 33.45, lng: -112.07, type: "career", year: "2022–Now", description: "ASU → United Foods → Heckler Design", color: "#0EBBFF", blurb: "Master's degree, then building ERP systems that run businesses" },
  // US
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
  // International
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

// Airplane dot traveling along arc
function AirplaneDot({ start, end, color, delay }: { start: THREE.Vector3; end: THREE.Vector3; color: string; delay: number }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const trailRef = useRef<THREE.Points>(null);
  const trailPositions = useRef(new Float32Array(30 * 3));

  const fullPoints = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i <= 80; i++) {
      const t = i / 80;
      const p = new THREE.Vector3().lerpVectors(start, end, t);
      p.normalize().multiplyScalar(2 * (1 + 0.22 * Math.sin(Math.PI * t)));
      pts.push(p);
    }
    return pts;
  }, [start, end]);

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    const time = clock.getElapsedTime() - delay;
    if (time < 0) { meshRef.current.visible = false; return; }
    meshRef.current.visible = true;

    const cycle = (time % 5) / 3;
    if (cycle > 1) { meshRef.current.visible = false; return; }

    const idx = Math.min(Math.floor(cycle * fullPoints.length), fullPoints.length - 1);
    const pt = fullPoints[idx];
    meshRef.current.position.copy(pt);

    // Update trail
    if (trailRef.current) {
      const arr = trailPositions.current;
      // Shift positions back
      for (let i = arr.length - 3; i >= 3; i -= 3) {
        arr[i] = arr[i - 3];
        arr[i + 1] = arr[i - 2];
        arr[i + 2] = arr[i - 1];
      }
      arr[0] = pt.x; arr[1] = pt.y; arr[2] = pt.z;
      (trailRef.current.geometry.attributes.position as THREE.BufferAttribute).needsUpdate = true;
    }
  });

  return (
    <>
      <mesh ref={meshRef}>
        <sphereGeometry args={[0.03, 8, 8]} />
        <meshBasicMaterial color={color} />
      </mesh>
      <points ref={trailRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[trailPositions.current, 3]} />
        </bufferGeometry>
        <pointsMaterial size={0.015} color={color} transparent opacity={0.4} sizeAttenuation />
      </points>
    </>
  );
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
      {isCareer && (
        <mesh ref={pulseRef}>
          <sphereGeometry args={[size * 3, 16, 16]} />
          <meshBasicMaterial color={loc.color} transparent opacity={0.15} />
        </mesh>
      )}
      <mesh ref={meshRef} onClick={onClick}>
        <sphereGeometry args={[size, 16, 16]} />
        <meshStandardMaterial color={loc.color} emissive={loc.color} emissiveIntensity={isActive ? 2 : 0.8} />
      </mesh>
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
  const positions = useMemo(() => {
    const pts: number[] = [];
    const landRegions = [
      { latMin: 10, latMax: 55, lngMin: -130, lngMax: -60 },
      { latMin: -35, latMax: 10, lngMin: -80, lngMax: -35 },
      { latMin: 35, latMax: 70, lngMin: -10, lngMax: 40 },
      { latMin: -35, latMax: 35, lngMin: 10, lngMax: 55 },
      { latMin: 5, latMax: 55, lngMin: 60, lngMax: 140 },
      { latMin: -40, latMax: -10, lngMin: 115, lngMax: 155 },
      { latMin: 5, latMax: 35, lngMin: 65, lngMax: 90 },
    ];
    for (let i = 0; i < 2000; i++) {
      const region = landRegions[Math.floor(Math.random() * landRegions.length)];
      const lat = region.latMin + Math.random() * (region.latMax - region.latMin);
      const lng = region.lngMin + Math.random() * (region.lngMax - region.lngMin);
      const v = latLngToVec3(lat + (Math.random() - 0.5) * 5, lng + (Math.random() - 0.5) * 5, 2.005);
      pts.push(v.x, v.y, v.z);
    }
    return new Float32Array(pts);
  }, []);

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.008} color="#0EBBFF" transparent opacity={0.25} sizeAttenuation />
    </points>
  );
}

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

// Camera controller for auto-tour
function CameraController({ target, isTouring }: { target: THREE.Vector3 | null; isTouring: boolean }) {
  const { camera } = useThree();
  const targetPos = useRef(new THREE.Vector3(0, 1.5, 5));

  useFrame(() => {
    if (!isTouring || !target) return;
    // Position camera looking at the target location from outside
    const dir = target.clone().normalize();
    const camPos = dir.multiplyScalar(5).add(new THREE.Vector3(0, 1, 0));
    targetPos.current.lerp(camPos, 0.02);
    camera.position.lerp(targetPos.current, 0.02);
    camera.lookAt(0, 0, 0);
  });

  return null;
}

function Globe({ activeIndex, onMarkerClick, selectedLoc, onLocSelect, isTouring }: {
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
      globeRef.current.rotation.y += 0.001;
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
        <Sphere args={[2, 64, 64]}>
          <meshStandardMaterial color="#0a0a1a" roughness={1} metalness={0} />
        </Sphere>
        <Sphere args={[2.15, 64, 64]}>
          <meshStandardMaterial color="#0EBBFF" transparent opacity={0.03} side={THREE.BackSide} />
        </Sphere>
        <Sphere args={[2.25, 64, 64]}>
          <meshStandardMaterial color="#0EBBFF" transparent opacity={0.015} side={THREE.BackSide} />
        </Sphere>
        <ContinentDots />
        <GridLines />
        {arcs.map((arc, i) => (
          <AnimatedArc key={`arc-${i}`} start={arc.start} end={arc.end} color={arc.color} delay={i * 1.5} />
        ))}
        {arcs.map((arc, i) => (
          <AirplaneDot key={`plane-${i}`} start={arc.start} end={arc.end} color={arc.color} delay={i * 1.5 + 0.5} />
        ))}
        {locations.map((loc, i) => {
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

// Passport stamp component
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
      {/* Stamp overlay effect */}
      <div className="absolute inset-0 rounded-lg border border-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity" style={{
        background: "repeating-linear-gradient(45deg, transparent, transparent 3px, rgba(168,85,247,0.03) 3px, rgba(168,85,247,0.03) 6px)"
      }} />
    </motion.div>
  );
}

// Photo card popup
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

// Timeline scrubber
function TimelineScrubber({ activeIndex, onIndexChange, careerLocs, isTouring }: {
  activeIndex: number;
  onIndexChange: (i: number) => void;
  careerLocs: Location[];
  isTouring: boolean;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState(false);

  const handleInteraction = useCallback((clientX: number) => {
    if (!trackRef.current) return;
    const rect = trackRef.current.getBoundingClientRect();
    const pct = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    const idx = Math.round(pct * (careerLocs.length - 1));
    onIndexChange(idx);
  }, [careerLocs.length, onIndexChange]);

  const handleMouseDown = (e: React.MouseEvent) => { setDragging(true); handleInteraction(e.clientX); };
  const handleMouseMove = (e: React.MouseEvent) => { if (dragging) handleInteraction(e.clientX); };
  const handleMouseUp = () => setDragging(false);

  const progress = careerLocs.length > 1 ? activeIndex / (careerLocs.length - 1) : 0;

  return (
    <div className="px-6 md:px-8 py-3" style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
      <div className="flex items-center gap-4">
        <span className="text-[10px] text-gray-600 font-mono shrink-0">2016</span>
        <div
          ref={trackRef}
          className="flex-1 relative h-8 flex items-center cursor-pointer"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          {/* Track */}
          <div className="absolute inset-y-3 left-0 right-0 rounded-full bg-gray-800">
            <motion.div
              className="h-full rounded-full"
              style={{ background: `linear-gradient(90deg, #f59e0b, #ef4444, #0EBBFF)` }}
              animate={{ width: `${progress * 100}%` }}
              transition={{ duration: isTouring ? 0.8 : 0.2 }}
            />
          </div>
          {/* Stops */}
          {careerLocs.map((loc, i) => {
            const pct = careerLocs.length > 1 ? (i / (careerLocs.length - 1)) * 100 : 0;
            return (
              <div
                key={loc.name}
                className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 z-10"
                style={{ left: `${pct}%` }}
              >
                <motion.div
                  className="w-4 h-4 rounded-full border-2 cursor-pointer"
                  style={{
                    background: i <= activeIndex ? loc.color : "#1a1a2e",
                    borderColor: loc.color,
                    boxShadow: i === activeIndex ? `0 0 12px ${loc.color}` : "none"
                  }}
                  whileHover={{ scale: 1.3 }}
                  onClick={() => onIndexChange(i)}
                />
              </div>
            );
          })}
          {/* Thumb */}
          <motion.div
            className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-6 h-6 rounded-full border-2 border-white shadow-lg z-20"
            style={{ background: careerLocs[activeIndex]?.color || "#0EBBFF" }}
            animate={{ left: `${progress * 100}%` }}
            transition={{ duration: isTouring ? 0.8 : 0.15 }}
          />
        </div>
        <span className="text-[10px] text-gray-600 font-mono shrink-0">Now</span>
      </div>
      {/* Active location label */}
      <motion.div
        key={activeIndex}
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mt-1"
      >
        <span className="text-xs font-mono" style={{ color: careerLocs[activeIndex]?.color }}>{careerLocs[activeIndex]?.year}</span>
        <span className="text-gray-600 mx-2">·</span>
        <span className="text-sm font-semibold text-white">{careerLocs[activeIndex]?.description}</span>
      </motion.div>
    </div>
  );
}

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

  // Stamp visibility on scroll
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) setStampsVisible(true);
    }, { threshold: 0.3 });
    if (stampsRef.current) observer.observe(stampsRef.current);
    return () => observer.disconnect();
  }, []);

  // Auto-tour
  const startTour = useCallback(() => {
    setIsTouring(true);
    setActiveIndex(0);
    setTourText(careerLocs[0].blurb || careerLocs[0].description || "");

    let step = 0;
    const interval = setInterval(() => {
      step++;
      if (step >= careerLocs.length) {
        clearInterval(interval);
        setTimeout(() => {
          setIsTouring(false);
          setTourText("");
        }, 2000);
        return;
      }
      setActiveIndex(step);
      setTourText(careerLocs[step].blurb || careerLocs[step].description || "");
    }, 3500);

    return () => clearInterval(interval);
  }, [careerLocs]);

  return (
    <div className="rounded-3xl overflow-hidden relative" style={{ background: "#050510", border: "1px solid rgba(14,187,255,0.1)" }}>
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
          <button
            onClick={startTour}
            disabled={isTouring}
            className="ml-2 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border border-cyan-500/40 text-cyan-400 hover:bg-cyan-500/10 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isTouring ? "Playing..." : "▶ Play My Story"}
          </button>
        </div>
      </div>

      {/* Tour narration overlay */}
      <AnimatePresence>
        {isTouring && tourText && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-16 left-1/2 -translate-x-1/2 z-30 px-6 py-3 rounded-xl border border-white/10 max-w-sm text-center"
            style={{ background: "rgba(10,10,30,0.9)", backdropFilter: "blur(20px)" }}
          >
            <motion.p
              key={tourText}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-sm text-white font-medium"
            >
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

      {/* Photo card popup */}
      <AnimatePresence>
        {selectedLoc && !isTouring && (
          <PhotoCard loc={selectedLoc} onClose={() => setSelectedLoc(null)} />
        )}
      </AnimatePresence>

      {/* 3D Globe */}
      <div className="h-[480px] md:h-[580px] relative cursor-grab active:cursor-grabbing">
        <Canvas camera={{ position: [0, 1.5, 5], fov: 42 }} dpr={[1, 2]} frameloop="always">
          <Suspense fallback={null}>
            <ambientLight intensity={0.2} />
            <directionalLight position={[5, 3, 5]} intensity={0.4} color="#ffffff" />
            <pointLight position={[-5, -3, -5]} intensity={0.2} color="#a855f7" />
            <pointLight position={[3, 2, -3]} intensity={0.3} color="#0EBBFF" />
            <Stars />
            <Globe
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
            <span>Drag to rotate</span>
            <span className="w-1 h-1 rounded-full bg-gray-700" />
            <span>Scroll to zoom</span>
            <span className="w-1 h-1 rounded-full bg-gray-700" />
            <span>Click markers</span>
          </div>
        )}
      </div>

      {/* Timeline scrubber */}
      <TimelineScrubber
        activeIndex={activeIndex}
        onIndexChange={setActiveIndex}
        careerLocs={careerLocs}
        isTouring={isTouring}
      />

      {/* Info panel */}
      <div className="px-6 md:px-8 pb-6 pt-2" style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
        {/* US states */}
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

        {/* International — Passport stamps */}
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
