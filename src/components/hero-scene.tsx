"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Float, MeshDistortMaterial, RoundedBox, Torus, Text } from "@react-three/drei";
import { useRef, Suspense, useMemo, useEffect } from "react";
import * as THREE from "three";

// Floating monitor with "code"
function Monitor() {
  const groupRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(clock.getElapsedTime() * 0.3) * 0.1;
      groupRef.current.position.y = Math.sin(clock.getElapsedTime() * 0.5) * 0.1;
    }
  });

  return (
    <group ref={groupRef} position={[0, 0.5, 0]}>
      {/* Monitor body */}
      <RoundedBox args={[2.4, 1.5, 0.08]} radius={0.05} position={[0, 0, 0]}>
        <meshStandardMaterial color="#1a1a2e" metalness={0.5} roughness={0.3} />
      </RoundedBox>
      {/* Screen */}
      <mesh position={[0, 0, 0.05]}>
        <planeGeometry args={[2.2, 1.3]} />
        <meshStandardMaterial color="#0a0a1a" emissive="#0EBBFF" emissiveIntensity={0.05} />
      </mesh>
      {/* Screen code lines */}
      {Array.from({ length: 8 }).map((_, i) => (
        <mesh key={i} position={[-0.8 + (i % 3) * 0.2, 0.4 - i * 0.12, 0.06]}>
          <planeGeometry args={[0.3 + Math.random() * 0.5, 0.04]} />
          <meshBasicMaterial color={i % 3 === 0 ? "#0EBBFF" : i % 3 === 1 ? "#a855f7" : "#22c55e"} transparent opacity={0.4 + Math.random() * 0.3} />
        </mesh>
      ))}
      {/* Stand */}
      <mesh position={[0, -0.9, 0]}>
        <cylinderGeometry args={[0.05, 0.05, 0.3]} />
        <meshStandardMaterial color="#333" metalness={0.8} />
      </mesh>
      <mesh position={[0, -1.05, 0.1]}>
        <boxGeometry args={[0.5, 0.02, 0.3]} />
        <meshStandardMaterial color="#333" metalness={0.8} />
      </mesh>
    </group>
  );
}

// Floating geometric shapes
function FloatingShapes() {
  const shapes = useMemo(() => [
    { pos: [-2.5, 1.2, -1] as [number, number, number], color: "#0EBBFF", speed: 1.5, type: "icosa" },
    { pos: [2.8, 0.8, -0.5] as [number, number, number], color: "#a855f7", speed: 2, type: "torus" },
    { pos: [-1.5, -0.8, 1] as [number, number, number], color: "#ec4899", speed: 1.8, type: "octa" },
    { pos: [1.8, -0.5, 1.5] as [number, number, number], color: "#22c55e", speed: 2.2, type: "icosa" },
    { pos: [0.5, 2, -1.5] as [number, number, number], color: "#f59e0b", speed: 1.3, type: "torus" },
  ], []);

  return (
    <>
      {shapes.map((s, i) => (
        <Float key={i} speed={s.speed} rotationIntensity={0.8} floatIntensity={0.6}>
          <mesh position={s.pos} scale={0.25 + i * 0.05}>
            {s.type === "icosa" ? <icosahedronGeometry args={[1, 0]} /> :
             s.type === "torus" ? <torusGeometry args={[1, 0.4, 8, 16]} /> :
             <octahedronGeometry args={[1, 0]} />}
            <MeshDistortMaterial
              color={s.color}
              wireframe
              distort={0.2}
              speed={1.5}
              transparent
              opacity={0.5}
            />
          </mesh>
        </Float>
      ))}
    </>
  );
}

// Data stream particles
function DataStream() {
  const ref = useRef<THREE.Points>(null);
  const count = 300;

  const [positions, velocities] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const vel = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 8;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 6;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 6;
      vel[i] = 0.005 + Math.random() * 0.01;
    }
    return [pos, vel];
  }, []);

  useFrame(() => {
    if (!ref.current) return;
    const posArr = ref.current.geometry.attributes.position.array as Float32Array;
    for (let i = 0; i < count; i++) {
      posArr[i * 3 + 1] -= velocities[i]; // Fall down
      if (posArr[i * 3 + 1] < -3) posArr[i * 3 + 1] = 3; // Reset to top
    }
    ref.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.015} color="#0EBBFF" transparent opacity={0.4} sizeAttenuation />
    </points>
  );
}

// Camera that slowly auto-orbits
function AutoOrbitCamera() {
  const { camera } = useThree();

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime() * 0.15;
    const radius = 5;
    camera.position.x = Math.sin(t) * radius;
    camera.position.z = Math.cos(t) * radius;
    camera.position.y = 1.5 + Math.sin(t * 0.5) * 0.5;
    camera.lookAt(0, 0, 0);
  });

  return null;
}

export function HeroScene() {
  return (
    <div className="absolute inset-0 z-0 opacity-80">
      <Canvas
        camera={{ position: [0, 1.5, 5], fov: 45 }}
        dpr={[1, 1.5]}
        frameloop="always"
        gl={{ alpha: true, antialias: true }}
        style={{ background: "transparent" }}
      >
        <Suspense fallback={null}>
          {/* Lighting */}
          <ambientLight intensity={0.15} />
          <pointLight position={[3, 3, 3]} intensity={0.6} color="#0EBBFF" />
          <pointLight position={[-3, 2, -2]} intensity={0.4} color="#a855f7" />
          <pointLight position={[0, -2, 3]} intensity={0.3} color="#ec4899" />
          <spotLight position={[0, 5, 0]} intensity={0.3} angle={0.5} penumbra={1} color="#ffffff" />

          {/* Scene */}
          <Monitor />
          <FloatingShapes />
          <DataStream />
          <AutoOrbitCamera />

          {/* Ground reflection */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.2, 0]}>
            <planeGeometry args={[20, 20]} />
            <meshStandardMaterial color="#050510" metalness={0.9} roughness={0.1} transparent opacity={0.5} />
          </mesh>
        </Suspense>
      </Canvas>
    </div>
  );
}
