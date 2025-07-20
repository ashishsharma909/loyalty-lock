import { Canvas, useFrame } from "@react-three/fiber";
import {
  OrbitControls,
  Sphere,
  MeshDistortMaterial,
  Float,
} from "@react-three/drei";
import { useRef } from "react";
import * as THREE from "three";

function AnimatedSphere({
  position,
  color,
  size = 1,
}: {
  position: [number, number, number];
  color: string;
  size?: number;
}) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.elapsedTime * 0.2;
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.3;
    }
  });

  return (
    <Float speed={2} rotationIntensity={1} floatIntensity={2}>
      <Sphere ref={meshRef} args={[size, 32, 32]} position={position}>
        <MeshDistortMaterial
          color={color}
          attach="material"
          distort={0.6}
          speed={1.5}
          roughness={0.1}
          metalness={0.8}
        />
      </Sphere>
    </Float>
  );
}

function DataVisualization() {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.1;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Central Node */}
      <AnimatedSphere position={[0, 0, 0]} color="#00d4ff" size={0.8} />

      {/* Orbiting Nodes */}
      {[...Array(8)].map((_, i) => {
        const angle = (i / 8) * Math.PI * 2;
        const radius = 3;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;
        const y = Math.sin(i) * 0.5;

        return (
          <AnimatedSphere
            key={i}
            position={[x, y, z]}
            color={i % 2 === 0 ? "#8b5cf6" : "#a855f7"}
            size={0.3}
          />
        );
      })}

      {/* Connection Lines */}
      {[...Array(8)].map((_, i) => {
        const angle = (i / 8) * Math.PI * 2;
        const radius = 3;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;
        const y = Math.sin(i) * 0.5;

        const geometry = new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(0, 0, 0),
          new THREE.Vector3(x, y, z),
        ]);

        return (
          <line key={`line-${i}`} geometry={geometry}>
            <lineBasicMaterial
              color="#00d4ff"
              opacity={0.3}
              transparent
              linewidth={2}
            />
          </line>
        );
      })}
    </group>
  );
}

export default function Scene3D({
  className = "",
  interactive = false,
}: {
  className?: string;
  interactive?: boolean;
}) {
  return (
    <div className={`w-full h-full ${className}`}>
      <Canvas
        camera={{ position: [0, 0, 8], fov: 50 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={0.4} />
        <pointLight position={[10, 10, 10]} intensity={0.8} color="#00d4ff" />
        <pointLight
          position={[-10, -10, -10]}
          intensity={0.5}
          color="#8b5cf6"
        />

        <DataVisualization />

        {interactive && (
          <OrbitControls
            enableZoom={false}
            enablePan={false}
            autoRotate
            autoRotateSpeed={1}
          />
        )}
      </Canvas>
    </div>
  );
}

export function HeroScene3D() {
  return (
    <div className="absolute inset-0 opacity-30">
      <Scene3D interactive={false} />
    </div>
  );
}

export function DashboardScene3D() {
  return (
    <div className="w-full h-96">
      <Scene3D interactive={true} />
    </div>
  );
}
