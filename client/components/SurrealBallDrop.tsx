import { useRef, useState, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Sphere, Environment } from "@react-three/drei";
import { motion, AnimatePresence } from "framer-motion";
import * as THREE from "three";

interface SurrealBallProps {
  onBurst: () => void;
}

function SurrealMeteor({ onBurst }: SurrealBallProps) {
  const meteorRef = useRef<THREE.Mesh>(null);
  const trailRef = useRef<THREE.Mesh>(null);
  const [phase, setPhase] = useState<"falling" | "floating" | "bursting">(
    "falling",
  );
  const [position, setPosition] = useState(new THREE.Vector3(-3, 12, 0));
  const [velocity, setVelocity] = useState(new THREE.Vector3(1, 0, 0));
  const [scale, setScale] = useState(1);
  const [startTime] = useState(Date.now());

  useFrame((state, delta) => {
    if (!meteorRef.current) return;

    const elapsed = (Date.now() - startTime) / 1000;

    if (phase === "falling") {
      // Meteor falling diagonally with faster realistic physics
      velocity.y -= 15 * delta; // Increased gravity for faster fall
      velocity.x += 2 * delta; // Increased horizontal acceleration
      position.add(velocity.clone().multiplyScalar(delta));

      // Add fiery trail effect
      if (trailRef.current) {
        trailRef.current.position.copy(position);
        trailRef.current.position.x -= 1;
        trailRef.current.position.y += 0.5;
      }

      // Impact detection - when meteor reaches center
      if (position.y <= 0 && position.x >= -0.5) {
        position.y = 0;
        position.x = 0;
        velocity.set(0, 0, 0);
        setPhase("floating");

        // Start floating for a moment before bursting
        setTimeout(() => {
          setPhase("bursting");
          setTimeout(onBurst, 400); // Faster transition
        }, 300); // Reduced wait time
      }
    }

    if (phase === "floating") {
      // Gentle floating motion at ground level
      const floatY = Math.sin(elapsed * 4) * 0.1;
      const floatX = Math.sin(elapsed * 2) * 0.15;
      position.y = floatY;
      position.x = floatX;

      // Pulsating scale
      const pulse = 1 + Math.sin(elapsed * 8) * 0.05;
      setScale(pulse);
    }

    if (phase === "bursting") {
      // Dramatic expansion before burst
      const burstScale = 1 + Math.pow(elapsed - 2, 2) * 0.5;
      setScale(burstScale);

      // Add vibration effect
      const vibration = Math.sin(elapsed * 50) * 0.02;
      ballRef.current.position.x += vibration;
      ballRef.current.position.z += vibration;
    }

    // Update meteor position and scale
    meteorRef.current.position.copy(position);
    meteorRef.current.scale.setScalar(scale);

    // Add continuous rotation for realistic tumbling
    meteorRef.current.rotation.x += delta * 2;
    meteorRef.current.rotation.y += delta * 1.5;
    meteorRef.current.rotation.z += delta * 0.8;
  });

  return (
    <group>
      {/* Main meteor body - irregular rock-like shape */}
      <mesh ref={meteorRef}>
        <sphereGeometry args={[0.5, 8, 6]} />
        <meshStandardMaterial
          color={phase === "bursting" ? "#ff6600" : "#8B4513"}
          metalness={0.1}
          roughness={0.8}
          emissive={phase === "bursting" ? "#ff3300" : "#ff4400"}
          emissiveIntensity={phase === "bursting" ? 0.8 : 0.3}
          transparent
          opacity={phase === "bursting" ? 0.9 : 1}
        />
      </mesh>

      {/* Fiery trail effect */}
      {phase === "falling" && (
        <mesh ref={trailRef}>
          <coneGeometry args={[0.3, 2, 8]} />
          <meshBasicMaterial
            color="#ff6600"
            transparent
            opacity={0.6}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}

      {/* Impact crater ring when landed */}
      {phase !== "falling" && (
        <mesh position={[0, -0.1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.8, 1.5, 32]} />
          <meshBasicMaterial
            color="#ff4400"
            transparent
            opacity={0.4}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}
    </group>
  );
}

// Particle burst effect
function BurstParticles({ triggered }: { triggered: boolean }) {
  const particlesRef = useRef<THREE.Points>(null);
  const [particles] = useState(() => {
    const count = 100;
    const positions = new Float32Array(count * 3);
    const velocities = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;

      // Start at center
      positions[i3] = 0;
      positions[i3 + 1] = 0;
      positions[i3 + 2] = 0;

      // Random velocities for explosion
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 5 + 2;
      velocities[i3] = Math.cos(angle) * speed;
      velocities[i3 + 1] = Math.random() * 8 + 2;
      velocities[i3 + 2] = Math.sin(angle) * speed;

      // Vibrant colors
      colors[i3] = Math.random() * 0.5 + 0.5; // R
      colors[i3 + 1] = Math.random() * 0.8 + 0.2; // G
      colors[i3 + 2] = 1; // B
    }

    return { positions, velocities, colors, count };
  });

  useFrame((state, delta) => {
    if (!particlesRef.current || !triggered) return;

    const positions = particlesRef.current.geometry.attributes.position
      .array as Float32Array;

    for (let i = 0; i < particles.count; i++) {
      const i3 = i * 3;

      // Update positions based on velocities
      positions[i3] += particles.velocities[i3] * delta;
      positions[i3 + 1] += particles.velocities[i3 + 1] * delta;
      positions[i3 + 2] += particles.velocities[i3 + 2] * delta;

      // Apply gravity
      particles.velocities[i3 + 1] -= 9.8 * delta;

      // Fade out particles that fall too low
      if (positions[i3 + 1] < -5) {
        positions[i3 + 1] = -5;
        particles.velocities[i3 + 1] = 0;
      }
    }

    particlesRef.current.geometry.attributes.position.needsUpdate = true;
  });

  if (!triggered) return null;

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particles.count}
          array={particles.positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={particles.count}
          array={particles.colors}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.1}
        vertexColors
        transparent
        opacity={0.8}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

interface SurrealBallDropProps {
  onComplete: () => void;
}

export default function SurrealBallDrop({ onComplete }: SurrealBallDropProps) {
  const [phase, setPhase] = useState<
    "intro" | "dropping" | "bursting" | "complete"
  >("intro");
  const [showParticles, setShowParticles] = useState(false);

  useEffect(() => {
    // Start the sequence faster
    setTimeout(() => setPhase("dropping"), 500);

    // Keyboard skip functionality
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        setPhase("complete");
        onComplete();
      }
    };

    document.addEventListener("keydown", handleKeyPress);

    return () => {
      document.removeEventListener("keydown", handleKeyPress);
    };
  }, [onComplete]);

  const handleBurst = () => {
    setPhase("bursting");
    setShowParticles(true);

    // Complete the animation faster
    setTimeout(() => {
      setPhase("complete");
      onComplete();
    }, 800);
  };

  return (
    <AnimatePresence>
      {phase !== "complete" && (
        <motion.div
          className="fixed inset-0 z-[9999] bg-gradient-to-br from-purple-900 via-black to-blue-900"
          initial={{ opacity: 1 }}
          exit={{
            opacity: 0,
            scale: 1.2,
            filter: "blur(20px)",
          }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
        >
          {/* Surreal background effects */}
          <div className="absolute inset-0 overflow-hidden">
            {/* Floating orbs */}
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 bg-cyan-400/30 rounded-full"
                animate={{
                  x: [0, Math.random() * window.innerWidth, 0],
                  y: [0, Math.random() * window.innerHeight, 0],
                  scale: [0.5, 1.5, 0.5],
                  opacity: [0.3, 0.8, 0.3],
                }}
                transition={{
                  duration: 8 + Math.random() * 4,
                  repeat: Infinity,
                  delay: Math.random() * 2,
                }}
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                }}
              />
            ))}

            {/* Cosmic rays */}
            <motion.div
              className="absolute inset-0"
              style={{
                background: `
                  radial-gradient(circle at 30% 20%, rgba(79, 172, 254, 0.1) 0%, transparent 50%),
                  radial-gradient(circle at 70% 80%, rgba(168, 85, 247, 0.1) 0%, transparent 50%)
                `,
              }}
              animate={{
                opacity: [0.3, 0.7, 0.3],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
              }}
            />
          </div>

          {/* 3D Scene */}
          <Canvas
            camera={{ position: [0, 2, 8], fov: 50 }}
            className="absolute inset-0"
          >
            <ambientLight intensity={0.3} />
            <pointLight position={[10, 10, 10]} intensity={1} color="#4facfe" />
            <pointLight
              position={[-10, -10, -10]}
              intensity={0.5}
              color="#a855f7"
            />

            <Environment preset="night" />

            {phase !== "intro" && <SurrealMeteor onBurst={handleBurst} />}

            <BurstParticles triggered={showParticles} />
          </Canvas>

          {/* UI Elements */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            {/* Title */}
            <motion.div
              className="text-center mb-8"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 1 }}
            >
              <h1 className="text-6xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-blue-400 bg-clip-text text-transparent">
                LOYALTY LOCK
              </h1>
              <p className="text-xl text-white/60 mt-2 tracking-widest">
                AI-POWERED CUSTOMER ANALYTICS
              </p>
            </motion.div>

            {/* Status text */}
            <motion.div
              className="absolute bottom-20 left-1/2 transform -translate-x-1/2 text-center"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <div className="text-cyan-300/80 text-sm tracking-widest">
                {phase === "intro" && "LOADING SYSTEM..."}
                {phase === "dropping" && "PROCESSING DATA..."}
                {phase === "bursting" && "LAUNCHING APPLICATION..."}
              </div>

              {/* Skip instruction */}
              <motion.div
                className="text-white/40 text-xs mt-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 2 }}
              >
                Press ENTER or SPACE to skip
              </motion.div>
            </motion.div>
          </div>

          {/* Burst flash effect */}
          <AnimatePresence>
            {phase === "bursting" && (
              <motion.div
                className="absolute inset-0 bg-white"
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 0.3, 0] }}
                transition={{ duration: 0.5 }}
              />
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
