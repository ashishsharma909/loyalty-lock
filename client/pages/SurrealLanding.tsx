import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, useScroll, useTransform, useInView } from "framer-motion";
import ParticleSystem, { ParticleOverlay } from "@/components/ParticleSystem";
import {
  LiquidText,
  DimensionalScroll,
  ScrollTriggerReveal,
  LiquidMorph,
} from "@/components/LiquidCrystal";
import {
  MagneticButton,
  BreathingContainer,
  QuantumField,
  DNASpiral,
} from "@/components/NeuralInteractions";
import NolanTransition from "@/components/NolanTransitions";
import { Canvas, useFrame } from "@react-three/fiber";
import { Sphere, Float, Environment, useTexture } from "@react-three/drei";
import * as THREE from "three";

function FloatingDataSphere() {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.elapsedTime * 0.2;
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.3;

      const scale = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.1;
      meshRef.current.scale.setScalar(scale * (hovered ? 1.2 : 1));
    }
  });

  return (
    <Float speed={2} rotationIntensity={1} floatIntensity={2}>
      <Sphere
        ref={meshRef}
        args={[1, 64, 64]}
        onPointerEnter={() => setHovered(true)}
        onPointerLeave={() => setHovered(false)}
      >
        <meshStandardMaterial
          color="#4facfe"
          transparent
          opacity={0.3}
          roughness={0.1}
          metalness={0.9}
          emissive="#4facfe"
          emissiveIntensity={0.2}
        />
      </Sphere>
    </Float>
  );
}

function HolographicScene() {
  return (
    <div className="absolute inset-0 opacity-40">
      <Canvas camera={{ position: [0, 0, 5], fov: 60 }}>
        <ambientLight intensity={0.2} />
        <pointLight position={[10, 10, 10]} intensity={1} color="#4facfe" />
        <pointLight
          position={[-10, -10, -10]}
          intensity={0.5}
          color="#00f2fe"
        />

        <FloatingDataSphere />

        {/* Additional floating elements */}
        {[...Array(5)].map((_, i) => (
          <Float
            key={i}
            speed={1 + i * 0.5}
            rotationIntensity={0.5}
            floatIntensity={1}
            position={[Math.sin(i) * 4, Math.cos(i) * 2, -2 - i * 0.5]}
          >
            <Sphere args={[0.2, 16, 16]}>
              <meshStandardMaterial
                color={i % 2 === 0 ? "#00f2fe" : "#4facfe"}
                transparent
                opacity={0.6}
                emissive={i % 2 === 0 ? "#00f2fe" : "#4facfe"}
                emissiveIntensity={0.3}
              />
            </Sphere>
          </Float>
        ))}

        <Environment preset="night" />
      </Canvas>
    </div>
  );
}

export default function SurrealLanding() {
  const [currentDimension, setCurrentDimension] = useState(0);
  const dimensions = ["galaxy", "underwater", "datasphere", "void"] as const;
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll();

  const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentDimension((prev) => (prev + 1) % dimensions.length);
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen relative overflow-hidden bg-black">
      {/* Dynamic Particle Background */}
      <ParticleSystem variant="cosmic" intensity={1.5} />
      <ParticleOverlay density={40} />

      {/* Holographic 3D Scene */}
      <HolographicScene />

      {/* Navigation with Neural Breathing */}
      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 2, ease: "easeOut" }}
        className="fixed top-0 w-full z-50 backdrop-blur-xl border-b border-white/10"
        style={{
          background:
            "linear-gradient(135deg, rgba(0,0,0,0.8) 0%, rgba(20,20,40,0.6) 100%)",
        }}
      >
        <BreathingContainer intensity={0.5} rate={1.2}>
          <div className="container mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <motion.div
                className="flex items-center space-x-3"
                whileHover={{ scale: 1.05 }}
              >
                <QuantumField className="w-10 h-10" distortion={0.2}>
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center relative overflow-hidden">
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                      animate={{ x: [-100, 100] }}
                      transition={{ duration: 3, repeat: Infinity }}
                    />
                    <span className="text-white font-bold text-lg relative z-10">
                      LL
                    </span>
                  </div>
                </QuantumField>

                <LiquidText
                  size="lg"
                  variant="hologram"
                  className="font-display"
                >
                  Loyalty Lock
                </LiquidText>
              </motion.div>

              <div className="hidden md:flex items-center space-x-8">
                {["Home", "Dashboard", "Contact"].map((item, index) => (
                  <motion.div
                    key={item}
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1 + index * 0.2 }}
                  >
                    <Link
                      to={item === "Home" ? "/" : `/${item.toLowerCase()}`}
                      className="text-cyan-100 hover:text-cyan-400 transition-all duration-300 relative group font-medium"
                    >
                      <span className="relative z-10">{item}</span>
                      <motion.div
                        className="absolute -bottom-1 left-0 w-0 h-px bg-gradient-to-r from-cyan-400 to-blue-500 group-hover:w-full transition-all duration-300"
                        initial={{ scaleX: 0 }}
                        whileHover={{ scaleX: 1 }}
                      />
                    </Link>
                  </motion.div>
                ))}

                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 1.6 }}
                >
                  <MagneticButton variant="neural" size="sm">
                    <Link to="/login">Neural Link</Link>
                  </MagneticButton>
                </motion.div>
              </div>
            </div>
          </div>
        </BreathingContainer>
      </motion.nav>

      {/* Hero Section - Consciousness Awakening */}
      <section className="min-h-screen flex items-center justify-center relative">
        <motion.div className="absolute inset-0 z-0" style={{ y, opacity }}>
          <div
            className="absolute inset-0"
            style={{
              background: `
                radial-gradient(circle at 20% 30%, rgba(79, 172, 254, 0.15) 0%, transparent 70%),
                radial-gradient(circle at 80% 70%, rgba(0, 242, 254, 0.1) 0%, transparent 70%),
                conic-gradient(from 0deg at 50% 50%, transparent 0%, rgba(79, 172, 254, 0.05) 50%, transparent 100%)
              `,
            }}
          />
        </motion.div>

        <div className="container mx-auto px-6 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 3, ease: "easeOut" }}
          >
            {/* Main Title with Liquid Crystal Effect */}
            <LiquidMorph intensity={0.05} speed={0.8}>
              <LiquidText
                size="2xl"
                variant="quantum"
                animate={true}
                className="mb-8 leading-tight"
              >
                Loyalty Lock
              </LiquidText>
            </LiquidMorph>

            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1, duration: 2 }}
            >
              <LiquidText
                size="xl"
                variant="crystal"
                animate={true}
                delay={1.5}
                className="mb-6 text-cyan-200/80"
              >
                AI Consciousness • Neural Networks • Quantum Intelligence
              </LiquidText>
            </motion.div>

            <motion.p
              className="text-xl text-cyan-100/60 mb-12 max-w-4xl mx-auto leading-relaxed font-light"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 2, duration: 1.5 }}
            >
              Enter the quantum realm where customer consciousness meets
              artificial intelligence. Experience reality through the lens of
              predictive neural networks, where every interaction echoes through
              infinite digital dimensions.
            </motion.p>

            {/* Magnetic CTA Buttons */}
            <motion.div
              className="flex flex-col sm:flex-row gap-8 justify-center items-center"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 2.5, duration: 1.5 }}
            >
              <MagneticButton variant="quantum" size="lg">
                <Link to="/signup" className="flex items-center space-x-2">
                  <span>Initialize Consciousness</span>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 4,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                  >
                    ⚡
                  </motion.div>
                </Link>
              </MagneticButton>

              <MagneticButton variant="neural" size="lg">
                <Link to="/dashboard" className="flex items-center space-x-2">
                  <span>Neural Interface</span>
                  <motion.div
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    🧠
                  </motion.div>
                </Link>
              </MagneticButton>

              <MagneticButton variant="primary" size="lg">
                <Link to="/contact" className="flex items-center space-x-2">
                  <span>Quantum Contact</span>
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    🌌
                  </motion.div>
                </Link>
              </MagneticButton>
            </motion.div>
          </motion.div>
        </div>

        {/* DNA Spiral Indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 3 }}
        >
          <DNASpiral height={80} speed={1.5} />
        </motion.div>
      </section>

      {/* Dimensional Feature Sections */}
      <DimensionalScroll dimension={dimensions[0]} intensity={2}>
        <section className="min-h-screen flex items-center px-6 py-20">
          <div className="container mx-auto">
            <ScrollTriggerReveal direction="scale" delay={0.5}>
              <LiquidText
                size="xl"
                variant="plasma"
                className="text-center mb-16"
              >
                Reality Shift: Predictive Consciousness
              </LiquidText>
            </ScrollTriggerReveal>

            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <ScrollTriggerReveal direction="left" delay={0.8}>
                <QuantumField className="p-12" distortion={0.15}>
                  <div className="space-y-6">
                    <LiquidText size="lg" variant="neural">
                      Neural Prediction Matrix
                    </LiquidText>
                    <p className="text-cyan-100/70 leading-relaxed text-lg">
                      Witness customer behavior through quantum tunnels of
                      possibility. Our AI consciousness processes infinite
                      parallel realities to predict churn with supernatural
                      accuracy.
                    </p>
                    <ul className="space-y-3">
                      {[
                        "Quantum state analysis of customer emotions",
                        "Parallel universe churn probability calculations",
                        "Neural network dream interpretation",
                        "Subconscious behavior pattern recognition",
                      ].map((item, i) => (
                        <motion.li
                          key={i}
                          className="flex items-center space-x-3 text-cyan-200/80"
                          initial={{ opacity: 0, x: -20 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.2 }}
                        >
                          <motion.div
                            className="w-2 h-2 bg-cyan-400 rounded-full"
                            animate={{ scale: [1, 1.5, 1] }}
                            transition={{
                              duration: 2,
                              repeat: Infinity,
                              delay: i * 0.3,
                            }}
                          />
                          {item}
                        </motion.li>
                      ))}
                    </ul>
                  </div>
                </QuantumField>
              </ScrollTriggerReveal>

              <ScrollTriggerReveal direction="right" delay={1}>
                <div className="relative h-96">
                  <Canvas camera={{ position: [0, 0, 5] }}>
                    <ambientLight intensity={0.3} />
                    <pointLight
                      position={[5, 5, 5]}
                      intensity={1}
                      color="#4facfe"
                    />

                    <Float speed={2} rotationIntensity={2} floatIntensity={3}>
                      <Sphere args={[1.5, 32, 32]}>
                        <meshStandardMaterial
                          color="#4facfe"
                          transparent
                          opacity={0.4}
                          roughness={0}
                          metalness={1}
                          emissive="#4facfe"
                          emissiveIntensity={0.3}
                        />
                      </Sphere>
                    </Float>

                    <Environment preset="night" />
                  </Canvas>
                </div>
              </ScrollTriggerReveal>
            </div>
          </div>
        </section>
      </DimensionalScroll>

      <DimensionalScroll dimension={dimensions[1]} intensity={1.5}>
        <section className="min-h-screen flex items-center px-6 py-20">
          <div className="container mx-auto text-center">
            <ScrollTriggerReveal direction="rotate" delay={0.3}>
              <LiquidText size="xl" variant="hologram" className="mb-16">
                Submerged in Data Depths
              </LiquidText>
            </ScrollTriggerReveal>

            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {[
                {
                  title: "Depth Analytics",
                  description:
                    "Dive deep into customer psyche through layers of consciousness",
                  icon: "🌊",
                },
                {
                  title: "Fluid Intelligence",
                  description:
                    "AI that flows like water, adapting to every customer's emotional current",
                  icon: "💧",
                },
                {
                  title: "Pressure Points",
                  description:
                    "Identify critical moments where reality bends and customers decide",
                  icon: "⚡",
                },
              ].map((feature, index) => (
                <ScrollTriggerReveal
                  key={index}
                  direction="up"
                  delay={0.5 + index * 0.3}
                >
                  <BreathingContainer intensity={0.3} rate={1}>
                    <div
                      className="p-8 rounded-2xl relative group overflow-hidden"
                      style={{
                        background:
                          "linear-gradient(135deg, rgba(0,100,150,0.1) 0%, rgba(0,150,200,0.05) 100%)",
                        backdropFilter: "blur(20px)",
                        border: "1px solid rgba(0,200,255,0.2)",
                      }}
                    >
                      <motion.div
                        className="text-6xl mb-6"
                        animate={{
                          rotateY: [0, 180, 360],
                          scale: [1, 1.2, 1],
                        }}
                        transition={{
                          duration: 4,
                          repeat: Infinity,
                          ease: "easeInOut",
                        }}
                      >
                        {feature.icon}
                      </motion.div>

                      <LiquidText size="lg" variant="crystal" className="mb-4">
                        {feature.title}
                      </LiquidText>

                      <p className="text-cyan-100/70 leading-relaxed">
                        {feature.description}
                      </p>

                      {/* Underwater bubbles effect */}
                      <div className="absolute inset-0 pointer-events-none">
                        {[...Array(8)].map((_, i) => (
                          <motion.div
                            key={i}
                            className="absolute w-2 h-2 bg-cyan-400/30 rounded-full"
                            style={{
                              left: Math.random() * 100 + "%",
                              top: "100%",
                            }}
                            animate={{
                              y: [-20, -300],
                              opacity: [0, 0.6, 0],
                              scale: [0.5, 1, 0.5],
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
                    </div>
                  </BreathingContainer>
                </ScrollTriggerReveal>
              ))}
            </div>
          </div>
        </section>
      </DimensionalScroll>

      <DimensionalScroll dimension={dimensions[2]} intensity={2}>
        <section className="min-h-screen flex items-center px-6 py-20">
          <div className="container mx-auto text-center">
            <ScrollTriggerReveal direction="scale" delay={0.2}>
              <LiquidText size="xl" variant="neural" className="mb-16">
                Enter the Machine Consciousness
              </LiquidText>
            </ScrollTriggerReveal>

            <ScrollTriggerReveal direction="up" delay={0.8}>
              <QuantumField className="p-16 max-w-4xl mx-auto" distortion={0.3}>
                <div className="text-center space-y-8">
                  <LiquidText size="lg" variant="quantum">
                    The Future is Breathing
                  </LiquidText>

                  <p className="text-2xl text-cyan-100/80 leading-relaxed font-light">
                    Step beyond the boundaries of traditional analytics. In this
                    realm, AI doesn't just process data — it dreams with it,
                    creating prophecies from the quantum foam of customer
                    intentions.
                  </p>

                  <motion.div
                    className="flex justify-center"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    transition={{ delay: 1 }}
                  >
                    <MagneticButton variant="quantum" size="lg">
                      <Link
                        to="/dashboard"
                        className="flex items-center space-x-3"
                      >
                        <span>Begin Neural Immersion</span>
                        <motion.div
                          animate={{ rotate: [0, 360] }}
                          transition={{
                            duration: 3,
                            repeat: Infinity,
                            ease: "linear",
                          }}
                        >
                          🌀
                        </motion.div>
                      </Link>
                    </MagneticButton>
                  </motion.div>
                </div>
              </QuantumField>
            </ScrollTriggerReveal>
          </div>
        </section>
      </DimensionalScroll>

      {/* Final Void Section */}
      <DimensionalScroll dimension={dimensions[3]} intensity={1}>
        <section className="min-h-screen flex items-center px-6 py-20">
          <div className="container mx-auto text-center">
            <ScrollTriggerReveal direction="rotate" delay={0.3}>
              <LiquidText size="xl" variant="crystal" className="mb-12">
                Welcome to the Void
              </LiquidText>
            </ScrollTriggerReveal>

            <ScrollTriggerReveal direction="scale" delay={0.8}>
              <p className="text-xl text-white/60 max-w-2xl mx-auto mb-12 leading-relaxed">
                In the space between thoughts, between data points, between
                heartbeats— that's where true insight lives. Join us in the
                beautiful emptiness where all possibilities exist
                simultaneously.
              </p>
            </ScrollTriggerReveal>

            <motion.div
              className="text-8xl mb-8"
              animate={{
                opacity: [0.3, 1, 0.3],
                scale: [1, 1.1, 1],
                rotateZ: [0, 5, -5, 0],
              }}
              transition={{
                duration: 6,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              ∞
            </motion.div>
          </div>
        </section>
      </DimensionalScroll>

      {/* Footer - Quantum Signature */}
      <footer className="py-12 px-6 border-t border-cyan-400/20 relative">
        <BreathingContainer intensity={0.2}>
          <div className="container mx-auto text-center">
            <motion.div
              className="flex items-center justify-center space-x-3 mb-6"
              whileHover={{ scale: 1.05 }}
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center">
                <span className="text-white font-bold">LL</span>
              </div>
              <LiquidText size="md" variant="hologram">
                Loyalty Lock • Quantum Division
              </LiquidText>
            </motion.div>

            <p className="text-cyan-100/40 text-sm">
              © 2024 • Transmitted from Neural Dimension α-7 • All realities
              reserved
            </p>
          </div>
        </BreathingContainer>
      </footer>
    </div>
  );
}
