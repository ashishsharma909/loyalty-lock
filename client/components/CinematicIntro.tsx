import { useState, useEffect, useRef } from "react";
import {
  motion,
  AnimatePresence,
  useSpring,
  useTransform,
} from "framer-motion";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Sphere, shaderMaterial } from "@react-three/drei";
import * as THREE from "three";
import { extend } from "@react-three/fiber";

// Custom shader material for the water droplet
const WaterMaterial = shaderMaterial(
  {
    time: 0,
    intensity: 1.0,
    opacity: 1.0,
  },
  // Vertex shader
  `
    varying vec2 vUv;
    varying vec3 vPosition;
    varying vec3 vNormal;
    uniform float time;
    
    void main() {
      vUv = uv;
      vPosition = position;
      vNormal = normal;
      
      vec3 pos = position;
      pos.y += sin(time * 2.0 + position.x * 5.0) * 0.1;
      
      gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
    }
  `,
  // Fragment shader
  `
    uniform float time;
    uniform float intensity;
    uniform float opacity;
    varying vec2 vUv;
    varying vec3 vPosition;
    varying vec3 vNormal;
    
    void main() {
      vec3 viewDirection = normalize(cameraPosition - vPosition);
      float fresnel = dot(viewDirection, vNormal);
      fresnel = pow(1.0 - fresnel, 3.0);
      
      vec3 color = vec3(0.4, 0.8, 1.0);
      color += fresnel * vec3(0.0, 0.4, 0.8);
      
      float pulse = sin(time * 3.0) * 0.5 + 0.5;
      color *= intensity * (0.8 + pulse * 0.2);
      
      float rim = 1.0 - dot(viewDirection, vNormal);
      rim = pow(rim, 2.0);
      color += rim * vec3(0.2, 0.6, 1.0);
      
      gl_FragColor = vec4(color, opacity * (0.7 + fresnel * 0.3));
    }
  `,
);

extend({ WaterMaterial });

declare global {
  namespace JSX {
    interface IntrinsicElements {
      waterMaterial: any;
    }
  }
}

function WaterDroplet({ onImpact }: { onImpact: () => void }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<any>(null);
  const [falling, setFalling] = useState(true);
  const [hasImpacted, setHasImpacted] = useState(false);

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.time = state.clock.elapsedTime;
    }

    if (meshRef.current && falling) {
      meshRef.current.position.y -= 0.02;

      // Check for impact
      if (meshRef.current.position.y <= 0 && !hasImpacted) {
        setHasImpacted(true);
        setFalling(false);
        onImpact();
      }
    }

    if (meshRef.current && !falling) {
      // Create ripple effect
      const scale = 1 + Math.sin(state.clock.elapsedTime * 4) * 0.3;
      meshRef.current.scale.setScalar(scale);
    }
  });

  return (
    <Sphere ref={meshRef} args={[0.3, 64, 64]} position={[0, 8, 0]}>
      <waterMaterial
        ref={materialRef}
        transparent
        side={THREE.DoubleSide}
        intensity={2.0}
        opacity={0.8}
      />
    </Sphere>
  );
}

function RippleEffect({ triggered }: { triggered: boolean }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<any>(null);

  useFrame((state) => {
    if (materialRef.current && triggered) {
      materialRef.current.time = state.clock.elapsedTime;

      if (meshRef.current) {
        const scale = 1 + (state.clock.elapsedTime - 1) * 2;
        meshRef.current.scale.setScalar(Math.min(scale, 10));

        const opacity = Math.max(0, 1 - (state.clock.elapsedTime - 1) * 0.5);
        materialRef.current.opacity = opacity;
      }
    }
  });

  if (!triggered) return null;

  return (
    <mesh ref={meshRef} position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[2, 2, 32, 32]} />
      <waterMaterial
        ref={materialRef}
        transparent
        intensity={1.5}
        opacity={0.6}
      />
    </mesh>
  );
}

function Scene3D({
  showDroplet,
  onImpact,
  rippleTriggered,
}: {
  showDroplet: boolean;
  onImpact: () => void;
  rippleTriggered: boolean;
}) {
  return (
    <Canvas camera={{ position: [0, 2, 5], fov: 50 }}>
      <ambientLight intensity={0.2} />
      <pointLight position={[0, 10, 0]} intensity={2} color="#ffffff" />
      <pointLight position={[5, 5, 5]} intensity={1} color="#4facfe" />
      <pointLight position={[-5, 5, 5]} intensity={1} color="#00f2fe" />

      {/* God rays effect */}
      <fog attach="fog" args={["#000011", 1, 20]} />

      {showDroplet && <WaterDroplet onImpact={onImpact} />}
      <RippleEffect triggered={rippleTriggered} />
    </Canvas>
  );
}

interface CinematicIntroProps {
  onComplete: () => void;
}

export default function CinematicIntro({ onComplete }: CinematicIntroProps) {
  const [stage, setStage] = useState(0);
  const [showDroplet, setShowDroplet] = useState(false);
  const [rippleTriggered, setRippleTriggered] = useState(false);
  const [showLoginCard, setShowLoginCard] = useState(false);

  useEffect(() => {
    // Stage 0: Darkness
    const timer1 = setTimeout(() => {
      setStage(1);
      setShowDroplet(true);
    }, 1000);

    return () => clearTimeout(timer1);
  }, []);

  const handleImpact = () => {
    setRippleTriggered(true);

    setTimeout(() => {
      setShowLoginCard(true);
      setStage(2);
    }, 1500);

    setTimeout(() => {
      setStage(3);
      onComplete();
    }, 4000);
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[9999] bg-black overflow-hidden"
        initial={{ opacity: 1 }}
        exit={{ opacity: 0, scale: 1.1 }}
        transition={{ duration: 2, ease: "easeInOut" }}
      >
        {/* Volumetric fog background */}
        <div className="absolute inset-0">
          <div
            className="absolute inset-0"
            style={{
              background: `
                radial-gradient(circle at 50% 0%, rgba(79, 172, 254, 0.1) 0%, transparent 50%),
                radial-gradient(circle at 50% 100%, rgba(0, 242, 254, 0.1) 0%, transparent 50%),
                linear-gradient(180deg, #000011 0%, #000033 50%, #000011 100%)
              `,
            }}
          />
        </div>

        {/* 3D Scene */}
        <div className="absolute inset-0">
          <Scene3D
            showDroplet={showDroplet}
            onImpact={handleImpact}
            rippleTriggered={rippleTriggered}
          />
        </div>

        {/* Particle effects */}
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(50)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-blue-400/30 rounded-full"
              style={{
                left: Math.random() * 100 + "%",
                top: Math.random() * 100 + "%",
              }}
              animate={{
                opacity: [0, 1, 0],
                scale: [0, 1, 0],
                y: [0, -100],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                delay: Math.random() * 4,
                ease: "easeOut",
              }}
            />
          ))}
        </div>

        {/* Login Card Transformation */}
        <AnimatePresence>
          {showLoginCard && (
            <motion.div
              className="absolute inset-0 flex items-center justify-center pointer-events-none"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 2 }}
            >
              <motion.div
                className="relative"
                initial={{ scale: 0, rotateY: 180 }}
                animate={{ scale: 1, rotateY: 0 }}
                transition={{
                  duration: 2,
                  ease: "easeOut",
                  type: "spring",
                  stiffness: 50,
                }}
              >
                {/* Glowing glass card */}
                <div
                  className="w-96 h-64 rounded-3xl relative overflow-hidden"
                  style={{
                    background: `
                      linear-gradient(135deg, 
                        rgba(255, 255, 255, 0.1) 0%, 
                        rgba(255, 255, 255, 0.05) 50%, 
                        rgba(255, 255, 255, 0.1) 100%)
                    `,
                    backdropFilter: "blur(20px)",
                    border: "1px solid rgba(255, 255, 255, 0.2)",
                    boxShadow: `
                      0 0 60px rgba(79, 172, 254, 0.4),
                      inset 0 0 60px rgba(0, 242, 254, 0.1)
                    `,
                  }}
                >
                  {/* Floating light particles inside */}
                  {[...Array(20)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute w-2 h-2 bg-blue-300/50 rounded-full"
                      style={{
                        left: Math.random() * 100 + "%",
                        top: Math.random() * 100 + "%",
                      }}
                      animate={{
                        x: [0, Math.random() * 20 - 10],
                        y: [0, Math.random() * 20 - 10],
                        opacity: [0.3, 0.8, 0.3],
                        scale: [0.5, 1, 0.5],
                      }}
                      transition={{
                        duration: 3 + Math.random() * 2,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                    />
                  ))}

                  {/* Central glow */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <motion.div
                      className="w-32 h-32 rounded-full"
                      style={{
                        background: `
                          radial-gradient(circle, 
                            rgba(79, 172, 254, 0.6) 0%, 
                            rgba(0, 242, 254, 0.3) 50%, 
                            transparent 100%)
                        `,
                      }}
                      animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.6, 1, 0.6],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                    />
                  </div>

                  {/* Liquid text */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <motion.h1
                      className="text-4xl font-display font-bold text-white"
                      style={{
                        textShadow: "0 0 30px rgba(79, 172, 254, 0.8)",
                        filter: "drop-shadow(0 0 10px rgba(0, 242, 254, 0.6))",
                      }}
                      animate={{
                        textShadow: [
                          "0 0 30px rgba(79, 172, 254, 0.8)",
                          "0 0 50px rgba(0, 242, 254, 1)",
                          "0 0 30px rgba(79, 172, 254, 0.8)",
                        ],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                    >
                      Loyalty Lock
                    </motion.h1>
                  </div>
                </div>

                {/* Outer glow ring */}
                <motion.div
                  className="absolute inset-0 rounded-3xl"
                  style={{
                    border: "2px solid transparent",
                    background: `
                      linear-gradient(45deg, 
                        rgba(79, 172, 254, 0.4), 
                        rgba(0, 242, 254, 0.4)) border-box
                    `,
                    WebkitMask: `
                      linear-gradient(#fff 0 0) padding-box, 
                      linear-gradient(#fff 0 0)
                    `,
                    WebkitMaskComposite: "destination-out",
                  }}
                  animate={{
                    rotate: [0, 360],
                  }}
                  transition={{
                    duration: 10,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Stage indicators */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
          <motion.div
            className="text-white/60 text-sm font-light tracking-widest"
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            {stage === 0 && "INITIALIZING..."}
            {stage === 1 && "CONSCIOUSNESS AWAKENING..."}
            {stage === 2 && "NEURAL NETWORK SYNCHRONIZED..."}
            {stage === 3 && "WELCOME TO THE MACHINE..."}
          </motion.div>
        </div>

        {/* DNA spiral loader in corner */}
        <div className="absolute bottom-8 right-8">
          <motion.div
            className="w-12 h-12 relative"
            animate={{ rotate: 360 }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          >
            <div className="absolute inset-0 border-2 border-transparent border-t-blue-400 rounded-full" />
            <div className="absolute inset-2 border-2 border-transparent border-b-cyan-400 rounded-full" />
            <div className="absolute inset-4 border-2 border-transparent border-l-blue-300 rounded-full" />
          </motion.div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
