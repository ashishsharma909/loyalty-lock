import { useRef, useState, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Sphere, Environment } from "@react-three/drei";
import { motion, AnimatePresence } from "framer-motion";
import * as THREE from "three";

function BouncingBall({ onBurst }: { onBurst: () => void }) {
  const ballRef = useRef<THREE.Mesh>(null);
  const [position, setPosition] = useState({ x: 0, y: 8, z: 0 });
  const [velocity, setVelocity] = useState({ x: 0, y: 0, z: 0 });
  const [hasReachedCorner, setHasReachedCorner] = useState(false);
  const [shouldBurst, setShouldBurst] = useState(false);

  useFrame((state, delta) => {
    if (!ballRef.current || shouldBurst) return;

    const gravity = -9.8;
    const bounce = 0.8;
    const friction = 0.98;

    // Update velocity with gravity
    setVelocity((prev) => ({
      ...prev,
      y: prev.y + gravity * delta * 2,
    }));

    // Update position
    setPosition((prev) => {
      const newPos = {
        x: prev.x + velocity.x * delta,
        y: prev.y + velocity.y * delta,
        z: prev.z + velocity.z * delta,
      };

      // Ground collision
      if (newPos.y <= 0.5) {
        newPos.y = 0.5;
        setVelocity((v) => ({
          ...v,
          y: -v.y * bounce,
          x: v.x * friction,
        }));

        // Add some random horizontal movement after bounce
        if (Math.abs(velocity.y) > 0.1 && !hasReachedCorner) {
          setVelocity((v) => ({
            ...v,
            x: v.x + (Math.random() - 0.5) * 2,
            z: v.z + (Math.random() - 0.5) * 2,
          }));
        }
      }

      // Move towards corner after first few bounces
      if (Math.abs(velocity.y) < 2 && !hasReachedCorner) {
        const targetX = 4;
        const targetZ = 3;
        const deltaX = targetX - newPos.x;
        const deltaZ = targetZ - newPos.z;

        setVelocity((v) => ({
          ...v,
          x: v.x + deltaX * delta * 2,
          z: v.z + deltaZ * delta * 2,
        }));

        // Check if reached corner
        if (
          Math.abs(deltaX) < 0.5 &&
          Math.abs(deltaZ) < 0.5 &&
          Math.abs(velocity.y) < 1
        ) {
          setHasReachedCorner(true);
          setTimeout(() => {
            setShouldBurst(true);
            onBurst();
          }, 500);
        }
      }

      return newPos;
    });

    // Update mesh position
    if (ballRef.current) {
      ballRef.current.position.set(position.x, position.y, position.z);

      // Add rotation based on movement
      ballRef.current.rotation.x += velocity.y * delta * 0.1;
      ballRef.current.rotation.z += velocity.x * delta * 0.1;
    }
  });

  return (
    <Sphere
      ref={ballRef}
      args={[0.5, 32, 32]}
      position={[position.x, position.y, position.z]}
    >
      <meshStandardMaterial
        color="#4facfe"
        transparent
        opacity={0.9}
        roughness={0.1}
        metalness={0.8}
        emissive="#4facfe"
        emissiveIntensity={0.3}
      />
    </Sphere>
  );
}

function BurstParticles({ triggered }: { triggered: boolean }) {
  const particlesRef = useRef<THREE.Points>(null);
  const [particles] = useState(() => {
    const positions = new Float32Array(100 * 3);
    const velocities = new Float32Array(100 * 3);

    for (let i = 0; i < 100; i++) {
      // Start at corner position
      positions[i * 3] = 4 + (Math.random() - 0.5) * 0.2;
      positions[i * 3 + 1] = 0.5 + (Math.random() - 0.5) * 0.2;
      positions[i * 3 + 2] = 3 + (Math.random() - 0.5) * 0.2;

      // Random velocities for explosion
      velocities[i * 3] = (Math.random() - 0.5) * 8;
      velocities[i * 3 + 1] = Math.random() * 6 + 2;
      velocities[i * 3 + 2] = (Math.random() - 0.5) * 8;
    }

    return { positions, velocities };
  });

  useFrame((state, delta) => {
    if (!particlesRef.current || !triggered) return;

    const positions = particlesRef.current.geometry.attributes.position
      .array as Float32Array;

    for (let i = 0; i < positions.length; i += 3) {
      const index = i / 3;

      // Apply gravity and movement
      particles.velocities[i + 1] -= 9.8 * delta;

      positions[i] += particles.velocities[i] * delta;
      positions[i + 1] += particles.velocities[i + 1] * delta;
      positions[i + 2] += particles.velocities[i + 2] * delta;

      // Add some drift
      particles.velocities[i] *= 0.98;
      particles.velocities[i + 2] *= 0.98;
    }

    particlesRef.current.geometry.attributes.position.needsUpdate = true;
  });

  if (!triggered) return null;

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particles.positions.length / 3}
          array={particles.positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        color="#4facfe"
        size={0.1}
        sizeAttenuation
        transparent
        opacity={0.8}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

interface BallDropAnimationProps {
  onComplete: () => void;
}

export default function BallDropAnimation({
  onComplete,
}: BallDropAnimationProps) {
  const [showBurst, setShowBurst] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);

  const handleBurst = () => {
    setShowBurst(true);

    // Start fade out after burst
    setTimeout(() => {
      setFadeOut(true);
    }, 1000);

    // Complete animation
    setTimeout(() => {
      onComplete();
    }, 2000);
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[9999] bg-black overflow-hidden"
        initial={{ opacity: 1 }}
        animate={{ opacity: fadeOut ? 0 : 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 1, ease: "easeInOut" }}
      >
        {/* 3D Scene */}
        <div className="absolute inset-0">
          <Canvas camera={{ position: [0, 3, 8], fov: 50 }}>
            <ambientLight intensity={0.2} />
            <pointLight
              position={[5, 10, 5]}
              intensity={2}
              color="#ffffff"
              castShadow
            />
            <pointLight position={[-5, 5, 5]} intensity={1} color="#4facfe" />

            {/* Ground plane */}
            <mesh
              rotation={[-Math.PI / 2, 0, 0]}
              position={[0, 0, 0]}
              receiveShadow
            >
              <planeGeometry args={[20, 20]} />
              <meshStandardMaterial
                color="#001122"
                transparent
                opacity={0.3}
                roughness={0.1}
                metalness={0.8}
              />
            </mesh>

            <BouncingBall onBurst={handleBurst} />
            <BurstParticles triggered={showBurst} />

            <Environment preset="night" />
          </Canvas>
        </div>

        {/* 2D Effects */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Burst ripples */}
          {showBurst && (
            <>
              {[...Array(5)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute border-2 border-cyan-400/30 rounded-full"
                  style={{
                    right: "10%",
                    bottom: "20%",
                    width: 50,
                    height: 50,
                    marginLeft: -25,
                    marginBottom: -25,
                  }}
                  initial={{ scale: 0, opacity: 0.8 }}
                  animate={{ scale: 20, opacity: 0 }}
                  transition={{
                    duration: 2,
                    delay: i * 0.2,
                    ease: "easeOut",
                  }}
                />
              ))}
            </>
          )}

          {/* Corner glow effect */}
          {showBurst && (
            <motion.div
              className="absolute right-0 bottom-0 w-96 h-96"
              style={{
                background: `
                  radial-gradient(circle at 80% 80%, 
                    rgba(79, 172, 254, 0.4) 0%, 
                    rgba(0, 242, 254, 0.2) 30%, 
                    transparent 70%)
                `,
              }}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1 }}
            />
          )}
        </div>

        {/* Loading text */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
          <motion.div
            className="text-cyan-400/60 text-sm tracking-widest font-light"
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            {!showBurst
              ? "QUANTUM SPHERE INITIALIZING..."
              : "NEURAL BURST DETECTED..."}
          </motion.div>
        </div>

        {/* Corner indicator */}
        <motion.div
          className="absolute right-8 bottom-8 w-4 h-4 border-2 border-cyan-400/50 rounded-full"
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.3, 0.8, 0.3],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
          }}
        />
      </motion.div>
    </AnimatePresence>
  );
}
