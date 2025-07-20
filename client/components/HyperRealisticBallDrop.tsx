import { useRef, useState, useEffect, Suspense } from "react";
import { Canvas, useFrame, extend } from "@react-three/fiber";
import {
  Sphere,
  Environment,
  ContactShadows,
  shaderMaterial,
  useTexture,
} from "@react-three/drei";
import { motion, AnimatePresence } from "framer-motion";
import * as THREE from "three";

// Enhanced Glass Material with realistic refraction
const GlassMaterial = shaderMaterial(
  {
    time: 0,
    crackProgress: 0,
    mousePos: new THREE.Vector2(0, 0),
    envMapIntensity: 1.0,
    transparency: 0.1,
  },
  // Vertex shader
  `
    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vPosition;
    varying vec3 vViewPosition;
    uniform float time;
    uniform float crackProgress;
    
    void main() {
      vUv = uv;
      vNormal = normalize(normalMatrix * normal);
      vPosition = position;
      
      vec3 pos = position;
      
      // Add subtle surface perturbation for realism
      pos += normal * sin(time * 2.0 + position.x * 10.0) * 0.002;
      
      // Crack deformation
      if (crackProgress > 0.0) {
        float crackIntensity = crackProgress * 0.1;
        pos += normal * sin(position.x * 20.0 + position.y * 15.0) * crackIntensity;
      }
      
      vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
      vViewPosition = -mvPosition.xyz;
      
      gl_Position = projectionMatrix * mvPosition;
    }
  `,
  // Fragment shader
  `
    uniform float time;
    uniform float crackProgress;
    uniform vec2 mousePos;
    uniform float envMapIntensity;
    uniform float transparency;
    
    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vPosition;
    varying vec3 vViewPosition;
    
    void main() {
      vec3 viewDirection = normalize(vViewPosition);
      vec3 normal = normalize(vNormal);
      
      // Fresnel effect for realistic glass
      float fresnel = 1.0 - max(0.0, dot(viewDirection, normal));
      fresnel = pow(fresnel, 1.8);
      
      // Glass color with slight blue tint
      vec3 glassColor = vec3(0.8, 0.9, 1.0);
      
      // Caustics pattern
      vec2 causticUV = vUv * 6.0 + time * 0.3;
      float caustics = sin(causticUV.x * 3.14159) * sin(causticUV.y * 3.14159);
      caustics = pow(max(0.0, caustics), 2.0) * 0.3;
      
      // Crack pattern
      float cracks = 0.0;
      if (crackProgress > 0.0) {
        vec2 crackUV = vUv * 15.0;
        float crackPattern = sin(crackUV.x * 8.0) * sin(crackUV.y * 12.0);
        crackPattern += sin(crackUV.x * 15.0 + 1.5) * sin(crackUV.y * 8.0 + 2.0);
        cracks = step(0.7 - crackProgress * 0.5, abs(crackPattern)) * crackProgress;
      }
      
      // Final color composition
      vec3 finalColor = glassColor;
      finalColor += caustics;
      finalColor += cracks * vec3(1.0, 1.0, 1.0) * 2.0;
      
      // Enhanced fresnel for edges
      float edgeGlow = pow(fresnel, 0.5) * 0.8;
      finalColor += edgeGlow * vec3(0.2, 0.6, 1.0);
      
      float alpha = mix(transparency, 0.9, fresnel);
      alpha += cracks * 0.5;
      
      gl_FragColor = vec4(finalColor, alpha);
    }
  `,
);

extend({ GlassMaterial });

declare global {
  namespace JSX {
    interface IntrinsicElements {
      glassMaterial: any;
    }
  }
}

// Physics-based Ball Component
function PhysicsBall({
  onImpact,
  onCrackComplete,
}: {
  onImpact: () => void;
  onCrackComplete: () => void;
}) {
  const ballRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<any>(null);
  const shadowRef = useRef<THREE.Mesh>(null);

  const [phase, setPhase] = useState<
    "falling" | "bouncing" | "cracking" | "morphing"
  >("falling");
  const [position, setPosition] = useState(new THREE.Vector3(0, 8, 0));
  const [velocity, setVelocity] = useState(new THREE.Vector3(0, 0, 0));
  const [crackProgress, setCrackProgress] = useState(0);
  const [startTime] = useState(Date.now());

  useFrame((state, delta) => {
    if (!ballRef.current || !materialRef.current) return;

    const elapsed = (Date.now() - startTime) / 1000;
    materialRef.current.time = state.clock.elapsedTime;

    if (phase === "falling") {
      // Realistic gravity physics
      velocity.y -= 9.8 * delta * 1.5; // Enhanced gravity
      position.add(velocity.clone().multiplyScalar(delta));

      // Impact detection
      if (position.y <= 0.5) {
        position.y = 0.5;
        velocity.y = -velocity.y * 0.7; // Bounce damping
        velocity.x *= 0.8; // Friction
        velocity.z *= 0.8;

        if (Math.abs(velocity.y) < 0.5) {
          setPhase("bouncing");
          onImpact();

          // Start cracking after pause
          setTimeout(() => {
            setPhase("cracking");
          }, 1000);
        }
      }

      // Add slight rotation during fall
      ballRef.current.rotation.x += velocity.y * delta * 0.1;
      ballRef.current.rotation.z += velocity.x * delta * 0.1;
    }

    if (phase === "bouncing") {
      // Settle animation
      const settle = Math.sin(elapsed * 8) * 0.02 * Math.exp(-elapsed * 2);
      position.y = 0.5 + settle;
    }

    if (phase === "cracking") {
      setCrackProgress((prev) => {
        const newProgress = Math.min(prev + delta * 0.8, 1);
        if (newProgress >= 1 && prev < 1) {
          setTimeout(onCrackComplete, 500);
          setPhase("morphing");
        }
        return newProgress;
      });

      materialRef.current.crackProgress = crackProgress;

      // Crack vibration
      const vibration =
        Math.sin(state.clock.elapsedTime * 50) * 0.01 * crackProgress;
      ballRef.current.scale.setScalar(1 + vibration);
    }

    // Update position
    ballRef.current.position.copy(position);

    // Update shadow
    if (shadowRef.current) {
      shadowRef.current.position.x = position.x;
      shadowRef.current.position.z = position.z + 0.1;
      shadowRef.current.scale.setScalar(Math.max(0.5, 2 - position.y * 0.3));
      shadowRef.current.material.opacity = Math.max(
        0.1,
        0.6 - position.y * 0.1,
      );
    }
  });

  return (
    <group>
      {/* Main Ball */}
      <Sphere ref={ballRef} args={[0.5, 64, 64]}>
        <glassMaterial ref={materialRef} transparent side={THREE.DoubleSide} />
      </Sphere>

      {/* Dynamic Shadow */}
      <mesh
        ref={shadowRef}
        position={[0, 0.01, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <planeGeometry args={[2, 2]} />
        <meshBasicMaterial
          color="#000000"
          transparent
          opacity={0.3}
          blending={THREE.MultiplyBlending}
        />
      </mesh>

      {/* Contact Shadows for realism */}
      <ContactShadows
        position={[0, 0, 0]}
        opacity={0.5}
        scale={3}
        blur={2}
        far={2}
      />
    </group>
  );
}

// Particle Explosion System
function GlassParticles({ triggered }: { triggered: boolean }) {
  const particlesRef = useRef<THREE.Points>(null);
  const [particles] = useState(() => {
    const count = 200;
    const positions = new Float32Array(count * 3);
    const velocities = new Float32Array(count * 3);
    const scales = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      // Start at ball position
      positions[i * 3] = (Math.random() - 0.5) * 0.2;
      positions[i * 3 + 1] = 0.5 + (Math.random() - 0.5) * 0.2;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 0.2;

      // Explosive velocities
      const speed = 2 + Math.random() * 4;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI;

      velocities[i * 3] = Math.sin(phi) * Math.cos(theta) * speed;
      velocities[i * 3 + 1] = Math.cos(phi) * speed + 1;
      velocities[i * 3 + 2] = Math.sin(phi) * Math.sin(theta) * speed;

      scales[i] = Math.random() * 0.5 + 0.1;
    }

    return { positions, velocities, scales };
  });

  useFrame((state, delta) => {
    if (!particlesRef.current || !triggered) return;

    const positions = particlesRef.current.geometry.attributes.position
      .array as Float32Array;

    for (let i = 0; i < positions.length; i += 3) {
      const idx = i / 3;

      // Apply gravity and physics
      particles.velocities[i + 1] -= 9.8 * delta;

      // Update positions
      positions[i] += particles.velocities[i] * delta;
      positions[i + 1] += particles.velocities[i + 1] * delta;
      positions[i + 2] += particles.velocities[i + 2] * delta;

      // Air resistance
      particles.velocities[i] *= 0.98;
      particles.velocities[i + 1] *= 0.98;
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
        <bufferAttribute
          attach="attributes-scale"
          count={particles.scales.length}
          array={particles.scales}
          itemSize={1}
        />
      </bufferGeometry>
      <pointsMaterial
        color="#88ccff"
        size={0.1}
        sizeAttenuation
        transparent
        opacity={0.8}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

// Morphing Homepage Layout
function MorphingLayout({ progress }: { progress: number }) {
  return (
    <motion.div
      className="absolute inset-0 pointer-events-none"
      initial={{ opacity: 0 }}
      animate={{ opacity: progress }}
      transition={{ duration: 2, ease: "easeOut" }}
    >
      {/* Grid lines appearing */}
      <div className="absolute inset-0">
        <div
          className="absolute inset-0"
          style={{
            background: `
              linear-gradient(90deg, transparent 0%, rgba(79, 172, 254, 0.1) 50%, transparent 100%),
              linear-gradient(0deg, transparent 0%, rgba(79, 172, 254, 0.1) 50%, transparent 100%)
            `,
            backgroundSize: "100px 100px",
            opacity: progress * 0.3,
          }}
        />
      </div>

      {/* UI Elements morphing in */}
      <motion.div
        className="absolute top-8 left-8 right-8"
        initial={{ y: -100, opacity: 0 }}
        animate={{
          y: progress > 0.5 ? 0 : -100,
          opacity: progress > 0.5 ? 1 : 0,
        }}
        transition={{ duration: 1, delay: 0.5 }}
      >
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center">
              <span className="text-white font-bold">LL</span>
            </div>
            <span className="text-xl font-bold text-cyan-400">
              Loyalty Lock
            </span>
          </div>
          <div className="flex space-x-6">
            <span className="text-cyan-100">Dashboard</span>
            <span className="text-cyan-100">Analytics</span>
            <span className="text-cyan-100">Settings</span>
          </div>
        </div>
      </motion.div>

      {/* Central panels */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center"
        initial={{ scale: 0, opacity: 0 }}
        animate={{
          scale: progress > 0.7 ? 1 : 0,
          opacity: progress > 0.7 ? 1 : 0,
        }}
        transition={{ duration: 1, delay: 1 }}
      >
        <div className="grid grid-cols-3 gap-6 max-w-4xl">
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="h-32 rounded-2xl backdrop-blur-xl border border-cyan-400/20"
              style={{
                background: `
                  linear-gradient(135deg, 
                    rgba(79, 172, 254, 0.1) 0%, 
                    rgba(0, 242, 254, 0.05) 100%)
                `,
              }}
              initial={{ y: 100, opacity: 0 }}
              animate={{
                y: progress > 0.8 ? 0 : 100,
                opacity: progress > 0.8 ? 1 : 0,
              }}
              transition={{ duration: 0.8, delay: 1.2 + i * 0.1 }}
            />
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}

interface HyperRealisticBallDropProps {
  onComplete: () => void;
}

export default function HyperRealisticBallDrop({
  onComplete,
}: HyperRealisticBallDropProps) {
  const [impacted, setImpacted] = useState(false);
  const [showParticles, setShowParticles] = useState(false);
  const [morphProgress, setMorphProgress] = useState(0);
  const [isSlowMo, setIsSlowMo] = useState(false);

  // Debug: Auto-skip animation in development
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        onComplete();
      }
    };

    // Auto-skip after 8 seconds as failsafe
    const failsafe = setTimeout(() => {
      console.log("Ball drop animation failsafe triggered");
      onComplete();
    }, 8000);

    document.addEventListener("keydown", handleKeyPress);

    return () => {
      document.removeEventListener("keydown", handleKeyPress);
      clearTimeout(failsafe);
    };
  }, [onComplete]);

  const handleImpact = () => {
    setImpacted(true);
    setIsSlowMo(true);

    // End slow motion after impact
    setTimeout(() => setIsSlowMo(false), 1000);
  };

  const handleCrackComplete = () => {
    setShowParticles(true);

    // Start morphing
    setTimeout(() => {
      setMorphProgress(1);
    }, 500);

    // Complete animation
    setTimeout(() => {
      onComplete();
    }, 4000);
  };

  return (
    <motion.div
      className="fixed inset-0 z-[9999] bg-black overflow-hidden"
      initial={{ opacity: 1 }}
      exit={{
        opacity: 0,
        scale: 1.1,
        filter: "blur(10px)",
      }}
      transition={{ duration: 1.5, ease: "easeInOut" }}
    >
      {/* Ambient background */}
      <div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(circle at 30% 20%, rgba(79, 172, 254, 0.15) 0%, transparent 50%),
            radial-gradient(circle at 70% 80%, rgba(0, 242, 254, 0.1) 0%, transparent 50%),
            linear-gradient(180deg, #000011 0%, #000033 50%, #000011 100%)
          `,
        }}
      />

      {/* 3D Scene */}
      <div
        className="absolute inset-0"
        style={{
          filter: isSlowMo ? "brightness(1.2) contrast(1.1)" : "none",
          transition: "filter 0.5s ease",
        }}
      >
        <Suspense fallback={null}>
          <Canvas
            camera={{ position: [0, 3, 8], fov: 50 }}
            dpr={[1, 2]}
            gl={{
              antialias: true,
              alpha: true,
              powerPreference: "high-performance",
            }}
          >
            {/* Cinematic Lighting */}
            <ambientLight intensity={0.3} color="#4facfe" />
            <directionalLight
              position={[5, 10, 5]}
              intensity={2}
              color="#ffffff"
              castShadow
              shadow-mapSize-width={2048}
              shadow-mapSize-height={2048}
            />
            <pointLight
              position={[0, 5, 3]}
              intensity={1.5}
              color="#00f2fe"
              distance={10}
            />
            <spotLight
              position={[0, 10, 0]}
              angle={0.5}
              penumbra={0.5}
              intensity={1}
              color="#88ccff"
              castShadow
            />

            {/* Environment for reflections */}
            <Environment preset="studio" background={false} intensity={0.5} />

            {/* Ground plane */}
            <mesh
              position={[0, 0, 0]}
              rotation={[-Math.PI / 2, 0, 0]}
              receiveShadow
            >
              <planeGeometry args={[20, 20]} />
              <meshStandardMaterial
                color="#001122"
                transparent
                opacity={0.1}
                roughness={0.1}
                metalness={0.8}
              />
            </mesh>

            {/* Physics Ball */}
            <PhysicsBall
              onImpact={handleImpact}
              onCrackComplete={handleCrackComplete}
            />

            {/* Glass Particles */}
            <GlassParticles triggered={showParticles} />

            {/* Fog for depth */}
            <fog attach="fog" args={["#000011", 8, 25]} />
          </Canvas>
        </Suspense>
      </div>

      {/* Impact Effects */}
      <AnimatePresence>
        {impacted && (
          <>
            {/* Screen flash */}
            <motion.div
              className="absolute inset-0 bg-cyan-400/20"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0.8, 0] }}
              transition={{ duration: 0.3 }}
            />

            {/* Ripple effects */}
            {[...Array(4)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute left-1/2 top-1/2 border-2 border-cyan-400/30 rounded-full"
                initial={{
                  scale: 0,
                  opacity: 0.8,
                  x: "-50%",
                  y: "-50%",
                }}
                animate={{
                  scale: 30,
                  opacity: 0,
                  x: "-50%",
                  y: "-50%",
                }}
                transition={{
                  duration: 2,
                  delay: i * 0.2,
                  ease: "easeOut",
                }}
                style={{
                  width: 20,
                  height: 20,
                }}
              />
            ))}
          </>
        )}
      </AnimatePresence>

      {/* Morphing Layout */}
      <MorphingLayout progress={morphProgress} />

      {/* Status Text */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
        <motion.div
          className="text-cyan-400/60 text-sm tracking-widest font-light text-center"
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          {!impacted && "QUANTUM SPHERE MATERIALIZING..."}
          {impacted && !showParticles && "IMPACT DETECTED • ANALYZING..."}
          {showParticles &&
            morphProgress < 0.5 &&
            "GLASS MATRIX FRAGMENTING..."}
          {morphProgress >= 0.5 && "NEURAL INTERFACE EMERGING..."}
        </motion.div>
        <motion.div
          className="text-white/30 text-xs tracking-wide text-center mt-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2 }}
        >
          Press ENTER or SPACE to skip
        </motion.div>
      </div>

      {/* Progress Indicator */}
      <motion.div
        className="absolute bottom-4 right-8 w-4 h-4 border-2 border-cyan-400/50 rounded-full"
        animate={{
          scale: [1, 1.5, 1],
          opacity: [0.3, 0.8, 0.3],
          borderColor: [
            "rgba(79, 172, 254, 0.5)",
            "rgba(0, 242, 254, 0.8)",
            "rgba(79, 172, 254, 0.5)",
          ],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
        }}
      />

      {/* Slow motion indicator */}
      <AnimatePresence>
        {isSlowMo && (
          <motion.div
            className="absolute top-8 right-8 px-4 py-2 bg-cyan-400/20 backdrop-blur-md rounded-lg border border-cyan-400/30"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
          >
            <span className="text-cyan-400 text-sm font-medium">
              SLOW MOTION
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
