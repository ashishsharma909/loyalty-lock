import { useRef, useEffect, useState } from "react";
import { Canvas, useFrame, extend } from "@react-three/fiber";
import { shaderMaterial, Sphere, Float } from "@react-three/drei";
import { motion, AnimatePresence } from "framer-motion";
import * as THREE from "three";

// Enhanced water shader with more realistic effects
const WaterDropletMaterial = shaderMaterial(
  {
    time: 0,
    impact: 0,
    mousePos: new THREE.Vector2(0, 0),
    resolution: new THREE.Vector2(1920, 1080),
  },
  // Vertex shader
  `
    varying vec2 vUv;
    varying vec3 vPosition;
    varying vec3 vNormal;
    varying vec3 vWorldPosition;
    uniform float time;
    uniform float impact;
    
    void main() {
      vUv = uv;
      vPosition = position;
      vNormal = normal;
      
      vec3 pos = position;
      
      // Add ripple effect on impact
      if (impact > 0.0) {
        float dist = length(pos.xz);
        float ripple = sin(dist * 10.0 - time * 8.0) * exp(-dist * 2.0) * impact;
        pos.y += ripple * 0.3;
      }
      
      // Organic breathing motion
      pos += normal * sin(time * 2.0 + position.x * 5.0) * 0.02;
      
      vec4 worldPosition = modelMatrix * vec4(pos, 1.0);
      vWorldPosition = worldPosition.xyz;
      
      gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
    }
  `,
  // Fragment shader
  `
    uniform float time;
    uniform float impact;
    uniform vec2 mousePos;
    uniform vec2 resolution;
    varying vec2 vUv;
    varying vec3 vPosition;
    varying vec3 vNormal;
    varying vec3 vWorldPosition;
    
    vec3 getReflection(vec3 viewDir, vec3 normal) {
      return reflect(viewDir, normal);
    }
    
    void main() {
      vec3 viewDirection = normalize(cameraPosition - vWorldPosition);
      vec3 normal = normalize(vNormal);
      
      // Fresnel effect for glass-like appearance
      float fresnel = 1.0 - max(0.0, dot(viewDirection, normal));
      fresnel = pow(fresnel, 2.0);
      
      // Volumetric core
      float core = 1.0 - fresnel;
      core = pow(core, 3.0);
      
      // Caustics pattern
      vec2 causticUV = vUv * 8.0 + time * 0.5;
      float caustics = sin(causticUV.x) * sin(causticUV.y) * 0.5 + 0.5;
      caustics = pow(caustics, 3.0);
      
      // Color mixing
      vec3 waterColor = vec3(0.2, 0.7, 1.0);
      vec3 glowColor = vec3(0.0, 0.9, 1.0);
      
      // Impact flash
      float flash = impact * exp(-time * 2.0);
      
      vec3 finalColor = mix(waterColor, glowColor, fresnel);
      finalColor += caustics * 0.3;
      finalColor += flash * vec3(1.0, 1.0, 1.0);
      
      // Iridescence
      float iridescence = sin(fresnel * 10.0 + time * 3.0) * 0.2 + 0.8;
      finalColor *= iridescence;
      
      float alpha = mix(0.6, 0.9, fresnel) + core * 0.3;
      alpha += flash * 0.5;
      
      gl_FragColor = vec4(finalColor, alpha);
    }
  `,
);

extend({ WaterDropletMaterial });

declare global {
  namespace JSX {
    interface IntrinsicElements {
      waterDropletMaterial: any;
    }
  }
}

function WaterDroplet3D({ onImpact }: { onImpact: () => void }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<any>(null);
  const [falling, setFalling] = useState(true);
  const [hasImpacted, setHasImpacted] = useState(false);
  const [mousePos, setMousePos] = useState(new THREE.Vector2(0, 0));

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos(
        new THREE.Vector2(
          (e.clientX / window.innerWidth) * 2 - 1,
          -(e.clientY / window.innerHeight) * 2 + 1,
        ),
      );
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.time = state.clock.elapsedTime;
      materialRef.current.mousePos = mousePos;
      materialRef.current.resolution = new THREE.Vector2(
        window.innerWidth,
        window.innerHeight,
      );
    }

    if (meshRef.current && falling) {
      meshRef.current.position.y -= 0.03;
      meshRef.current.rotation.x += 0.01;
      meshRef.current.rotation.z += 0.005;

      // Check for impact
      if (meshRef.current.position.y <= -1 && !hasImpacted) {
        setHasImpacted(true);
        setFalling(false);
        if (materialRef.current) {
          materialRef.current.impact = 1.0;
        }
        onImpact();
      }
    }

    if (meshRef.current && !falling && materialRef.current) {
      // Fade impact over time
      materialRef.current.impact = Math.max(
        0,
        materialRef.current.impact - 0.02,
      );
    }
  });

  return (
    <Float speed={1} rotationIntensity={0.2} floatIntensity={0.1}>
      <Sphere ref={meshRef} args={[0.8, 64, 64]} position={[0, 8, 0]}>
        <waterDropletMaterial
          ref={materialRef}
          transparent
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </Sphere>
    </Float>
  );
}

function DataParticles({ triggered }: { triggered: boolean }) {
  const particlesRef = useRef<THREE.Points>(null);
  const [particlePositions, setParticlePositions] =
    useState<Float32Array | null>(null);

  useEffect(() => {
    if (triggered) {
      const positions = new Float32Array(500 * 3);
      for (let i = 0; i < 500; i++) {
        positions[i * 3] = (Math.random() - 0.5) * 2;
        positions[i * 3 + 1] = (Math.random() - 0.5) * 2;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 2;
      }
      setParticlePositions(positions);
    }
  }, [triggered]);

  useFrame((state) => {
    if (particlesRef.current && particlePositions && triggered) {
      const positions = particlesRef.current.geometry.attributes.position
        .array as Float32Array;

      for (let i = 0; i < positions.length; i += 3) {
        // Spiral motion forming letters
        const time = state.clock.elapsedTime - 2;
        const index = i / 3;
        const angle = time * 2 + index * 0.1;
        const radius = Math.sin(time + index * 0.05) * 3;

        positions[i] = Math.cos(angle) * radius;
        positions[i + 1] = Math.sin(time * 3 + index * 0.02) * 2;
        positions[i + 2] = Math.sin(angle) * radius;
      }

      particlesRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  if (!triggered || !particlePositions) return null;

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particlePositions.length / 3}
          array={particlePositions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        color="#00f2fe"
        size={0.05}
        sizeAttenuation
        transparent
        opacity={0.8}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

interface WaterDropletHeroProps {
  onSequenceComplete: () => void;
}

export default function WaterDropletHero({
  onSequenceComplete,
}: WaterDropletHeroProps) {
  const [stage, setStage] = useState(0);
  const [showTitle, setShowTitle] = useState(false);
  const [particlesTriggered, setParticlesTriggered] = useState(false);

  useEffect(() => {
    // Start the sequence
    const timer = setTimeout(() => setStage(1), 500);
    return () => clearTimeout(timer);
  }, []);

  const handleImpact = () => {
    setParticlesTriggered(true);

    setTimeout(() => {
      setShowTitle(true);
      setStage(2);
    }, 1000);

    setTimeout(() => {
      setStage(3);
      onSequenceComplete();
    }, 4000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black overflow-hidden">
      {/* 3D Scene */}
      <div className="absolute inset-0">
        <Canvas camera={{ position: [0, 2, 8], fov: 50 }}>
          {/* Dramatic lighting */}
          <ambientLight intensity={0.1} />
          <pointLight
            position={[0, 10, 0]}
            intensity={3}
            color="#ffffff"
            castShadow
          />
          <pointLight position={[5, 5, 5]} intensity={2} color="#4facfe" />
          <pointLight position={[-5, 5, 5]} intensity={1.5} color="#00f2fe" />

          {/* Volumetric fog */}
          <fog attach="fog" args={["#000011", 5, 25]} />

          {stage >= 1 && <WaterDroplet3D onImpact={handleImpact} />}
          <DataParticles triggered={particlesTriggered} />
        </Canvas>
      </div>

      {/* 2D Overlay Elements */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Impact ripples */}
        <AnimatePresence>
          {particlesTriggered && (
            <>
              {[...Array(5)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute left-1/2 top-1/2 border-2 border-cyan-400/30 rounded-full"
                  initial={{ scale: 0, opacity: 0.8 }}
                  animate={{ scale: 20, opacity: 0 }}
                  transition={{ duration: 3, delay: i * 0.3 }}
                  style={{
                    width: 100,
                    height: 100,
                    marginLeft: -50,
                    marginTop: -50,
                  }}
                />
              ))}
            </>
          )}
        </AnimatePresence>

        {/* Title Formation */}
        <AnimatePresence>
          {showTitle && (
            <motion.div
              className="absolute inset-0 flex items-center justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 2 }}
            >
              <div className="text-center">
                <motion.h1
                  className="text-8xl font-bold mb-4"
                  style={{
                    background:
                      "linear-gradient(45deg, #4facfe 0%, #00f2fe 50%, #ffffff 100%)",
                    backgroundClip: "text",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    filter: "drop-shadow(0 0 30px rgba(79, 172, 254, 0.8))",
                    fontFamily: "Orbitron, sans-serif",
                  }}
                  initial={{ scale: 0, rotateX: 90 }}
                  animate={{ scale: 1, rotateX: 0 }}
                  transition={{
                    duration: 2,
                    ease: "easeOut",
                    type: "spring",
                    stiffness: 100,
                  }}
                >
                  Loyalty Lock
                </motion.h1>

                <motion.div
                  className="text-2xl text-cyan-300 font-light tracking-wider"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1, duration: 1.5 }}
                >
                  <motion.span
                    animate={{
                      opacity: [1, 0.3, 1],
                      textShadow: [
                        "0 0 10px rgba(0, 242, 254, 0.5)",
                        "0 0 20px rgba(79, 172, 254, 1)",
                        "0 0 10px rgba(0, 242, 254, 0.5)",
                      ],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  >
                    AI That Sees What Others Don't
                  </motion.span>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Glitch overlay */}
        <motion.div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `
              repeating-linear-gradient(
                0deg,
                transparent,
                transparent 2px,
                rgba(0, 242, 254, 0.03) 2px,
                rgba(0, 242, 254, 0.03) 4px
              )
            `,
          }}
          animate={{
            opacity: showTitle ? [0, 0.5, 0] : 0,
          }}
          transition={{
            duration: 0.1,
            repeat: showTitle ? Infinity : 0,
          }}
        />

        {/* Progress indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
          <motion.div
            className="text-cyan-400/60 text-sm tracking-widest"
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            {stage === 0 && "INITIALIZING QUANTUM CONSCIOUSNESS..."}
            {stage === 1 && "DROPLET DESCENDING THROUGH REALITY..."}
            {stage === 2 && "DATA PARTICLES REFORMING..."}
            {stage === 3 && "NEURAL NETWORK SYNCHRONIZED..."}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
