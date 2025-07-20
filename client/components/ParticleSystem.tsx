import { useRef, useMemo } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Points, PointMaterial } from "@react-three/drei";
import * as THREE from "three";
import { motion } from "framer-motion";

interface ParticleProps {
  count: number;
  intensity?: number;
  speed?: number;
  size?: number;
  color?: string;
}

function ZeroGravityParticles({
  count = 1000,
  intensity = 1,
  speed = 0.5,
  size = 0.02,
  color = "#4facfe",
}: ParticleProps) {
  const meshRef = useRef<THREE.Points>(null);
  const materialRef = useRef<THREE.PointsMaterial>(null);

  // Generate particle positions and properties
  const [positions, velocities, phases] = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const velocities = new Float32Array(count * 3);
    const phases = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      // Spherical distribution
      const r = Math.random() * 10 + 5;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);

      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = r * Math.cos(phi);

      // Random velocities for organic movement
      velocities[i * 3] = (Math.random() - 0.5) * 0.02;
      velocities[i * 3 + 1] = (Math.random() - 0.5) * 0.02;
      velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.02;

      phases[i] = Math.random() * Math.PI * 2;
    }

    return [positions, velocities, phases];
  }, [count]);

  useFrame((state) => {
    if (!meshRef.current) return;

    const time = state.clock.elapsedTime * speed;
    const positions = meshRef.current.geometry.attributes.position
      .array as Float32Array;

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;

      // Swirling motion with gravitational center
      const x = positions[i3];
      const y = positions[i3 + 1];
      const z = positions[i3 + 2];

      // Distance from center
      const distance = Math.sqrt(x * x + y * y + z * z);

      // Orbital motion
      const angle = Math.atan2(z, x) + time * 0.1 * (1 / (distance * 0.1 + 1));
      const newX = distance * Math.cos(angle);
      const newZ = distance * Math.sin(angle);

      // Vertical oscillation
      const verticalPhase = phases[i] + time * 2;
      const verticalOffset = Math.sin(verticalPhase) * 0.5;

      // Apply fluid dynamics
      positions[i3] = newX + velocities[i3] * Math.sin(time + phases[i]);
      positions[i3 + 1] =
        y + verticalOffset + velocities[i3 + 1] * Math.cos(time + phases[i]);
      positions[i3 + 2] =
        newZ + velocities[i3 + 2] * Math.sin(time + phases[i] * 1.5);

      // Pulsation effect
      const pulse = Math.sin(time * 3 + distance * 0.5) * 0.3 + 0.7;
      positions[i3] *= pulse;
      positions[i3 + 1] *= pulse;
      positions[i3 + 2] *= pulse;
    }

    meshRef.current.geometry.attributes.position.needsUpdate = true;

    // Rotate the entire system
    meshRef.current.rotation.y = time * 0.1;
    meshRef.current.rotation.x = Math.sin(time * 0.05) * 0.1;

    // Breathe effect
    const breathe = Math.sin(time * 0.8) * 0.1 + 1;
    meshRef.current.scale.setScalar(breathe);

    // Material animation
    if (materialRef.current) {
      materialRef.current.size =
        size * (Math.sin(time * 2) * 0.3 + 1) * intensity;
      materialRef.current.opacity = 0.6 + Math.sin(time * 1.5) * 0.2;
    }
  });

  return (
    <Points ref={meshRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <PointMaterial
        ref={materialRef}
        transparent
        color={color}
        size={size}
        sizeAttenuation={true}
        opacity={0.6}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </Points>
  );
}

function NeuroParticles({ count = 500 }: { count?: number }) {
  const meshRef = useRef<THREE.Points>(null);
  const connectionsRef = useRef<THREE.LineSegments>(null);

  const [positions, connections] = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const connectionArray: number[] = [];

    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 20;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 20;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 20;
    }

    // Create neural connections
    for (let i = 0; i < count; i++) {
      for (let j = i + 1; j < count; j++) {
        const dx = positions[i * 3] - positions[j * 3];
        const dy = positions[i * 3 + 1] - positions[j * 3 + 1];
        const dz = positions[i * 3 + 2] - positions[j * 3 + 2];
        const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);

        if (distance < 3 && Math.random() > 0.95) {
          connectionArray.push(
            positions[i * 3],
            positions[i * 3 + 1],
            positions[i * 3 + 2],
            positions[j * 3],
            positions[j * 3 + 1],
            positions[j * 3 + 2],
          );
        }
      }
    }

    return [positions, new Float32Array(connectionArray)];
  }, [count]);

  useFrame((state) => {
    if (!meshRef.current || !connectionsRef.current) return;

    const time = state.clock.elapsedTime;
    const positions = meshRef.current.geometry.attributes.position
      .array as Float32Array;

    // Neural pulse animation
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      const phase = i * 0.1 + time * 2;
      const pulse = Math.sin(phase) * 0.2;

      positions[i3] += pulse * 0.1;
      positions[i3 + 1] += Math.cos(phase * 1.2) * 0.1;
      positions[i3 + 2] += Math.sin(phase * 0.8) * 0.1;
    }

    meshRef.current.geometry.attributes.position.needsUpdate = true;

    // Synapse firing effect
    const synapseOpacity = Math.sin(time * 4) * 0.3 + 0.2;
    if (connectionsRef.current.material instanceof THREE.LineBasicMaterial) {
      connectionsRef.current.material.opacity = synapseOpacity;
    }
  });

  return (
    <group>
      <Points ref={meshRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={count}
            array={positions}
            itemSize={3}
          />
        </bufferGeometry>
        <PointMaterial
          transparent
          color="#00f2fe"
          size={0.1}
          sizeAttenuation={true}
          opacity={0.8}
          blending={THREE.AdditiveBlending}
        />
      </Points>

      <lineSegments ref={connectionsRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={connections.length / 3}
            array={connections}
            itemSize={3}
          />
        </bufferGeometry>
        <lineBasicMaterial
          transparent
          color="#4facfe"
          opacity={0.3}
          blending={THREE.AdditiveBlending}
        />
      </lineSegments>
    </group>
  );
}

interface ParticleSystemProps {
  variant?: "fluid" | "neural" | "cosmic";
  intensity?: number;
  interactive?: boolean;
  className?: string;
}

export default function ParticleSystem({
  variant = "fluid",
  intensity = 1,
  interactive = false,
  className = "",
}: ParticleSystemProps) {
  return (
    <div className={`absolute inset-0 pointer-events-none ${className}`}>
      <Canvas camera={{ position: [0, 0, 10], fov: 60 }}>
        <ambientLight intensity={0.1} />
        <pointLight position={[10, 10, 10]} intensity={0.5} color="#4facfe" />
        <pointLight
          position={[-10, -10, -10]}
          intensity={0.3}
          color="#00f2fe"
        />

        {variant === "fluid" && (
          <>
            <ZeroGravityParticles
              count={800}
              intensity={intensity}
              color="#4facfe"
              size={0.03}
            />
            <ZeroGravityParticles
              count={400}
              intensity={intensity * 0.7}
              color="#00f2fe"
              size={0.02}
              speed={0.3}
            />
          </>
        )}

        {variant === "neural" && <NeuroParticles count={300} />}

        {variant === "cosmic" && (
          <>
            <ZeroGravityParticles
              count={1500}
              intensity={intensity}
              color="#ffffff"
              size={0.01}
              speed={0.1}
            />
            <ZeroGravityParticles
              count={200}
              intensity={intensity * 2}
              color="#4facfe"
              size={0.05}
              speed={0.8}
            />
          </>
        )}
      </Canvas>
    </div>
  );
}

// Additional component for 2D particle overlay
export function ParticleOverlay({ density = 30 }: { density?: number }) {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {[...Array(density)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full bg-gradient-to-r from-blue-400/20 to-cyan-400/20 blur-sm"
          style={{
            width: Math.random() * 4 + 1,
            height: Math.random() * 4 + 1,
            left: Math.random() * 100 + "%",
            top: Math.random() * 100 + "%",
          }}
          animate={{
            x: [0, Math.random() * 200 - 100],
            y: [0, Math.random() * 200 - 100],
            opacity: [0, 0.8, 0],
            scale: [0.5, 1.5, 0.5],
          }}
          transition={{
            duration: Math.random() * 10 + 5,
            repeat: Infinity,
            ease: "linear",
            delay: Math.random() * 5,
          }}
        />
      ))}
    </div>
  );
}
