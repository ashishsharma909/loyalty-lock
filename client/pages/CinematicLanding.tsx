import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  motion,
  useScroll,
  useTransform,
  useInView,
  AnimatePresence,
} from "framer-motion";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  Sphere,
  Float,
  Environment,
  Text3D,
  Center,
  MeshDistortMaterial,
} from "@react-three/drei";
import * as THREE from "three";
import ParticleSystem from "@/components/ParticleSystem";
import LoyaltyLockLogoCSS from "@/components/LoyaltyLockLogoCSS";

// Magnetic Button Component with Liquid Morphing
function MagneticLiquidButton({
  children,
  href,
  variant = "primary",
  className = "",
}: {
  children: React.ReactNode;
  href: string;
  variant?: "primary" | "secondary" | "explore";
  className?: string;
}) {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const buttonRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    const button = buttonRef.current;
    if (!button) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!isHovered) return;

      const rect = button.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const deltaX = e.clientX - centerX;
      const deltaY = e.clientY - centerY;

      setMousePos({
        x: deltaX * 0.3,
        y: deltaY * 0.3,
      });
    };

    document.addEventListener("mousemove", handleMouseMove);
    return () => document.removeEventListener("mousemove", handleMouseMove);
  }, [isHovered]);

  const variants = {
    primary: {
      bg: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
      glow: "0 0 30px rgba(79, 172, 254, 0.6)",
    },
    secondary: {
      bg: "linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)",
      glow: "0 0 20px rgba(0, 242, 254, 0.4)",
    },
    explore: {
      bg: "linear-gradient(135deg, #a855f7 0%, #3b82f6 100%)",
      glow: "0 0 25px rgba(168, 85, 247, 0.6)",
    },
  };

  return (
    <motion.div
      className="relative"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <Link
        ref={buttonRef}
        to={href}
        className={`
          relative inline-flex items-center justify-center px-8 py-4 
          rounded-2xl font-semibold text-white overflow-hidden
          backdrop-blur-md border border-white/20 group
          transition-all duration-500 ${className}
        `}
        style={{
          background: variants[variant].bg,
          transform: isHovered
            ? `translate(${mousePos.x}px, ${mousePos.y}px)`
            : "translate(0, 0)",
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => {
          setIsHovered(false);
          setMousePos({ x: 0, y: 0 });
        }}
      >
        {/* Liquid morph background */}
        <motion.div
          className="absolute inset-0 rounded-2xl"
          style={{
            background: variants[variant].bg,
            filter: "blur(1px)",
          }}
          animate={
            isHovered
              ? {
                  borderRadius: ["1rem", "2rem", "1.5rem", "1rem"],
                  scale: [1, 1.1, 0.95, 1],
                }
              : { borderRadius: "1rem", scale: 1 }
          }
          transition={{ duration: 2, repeat: isHovered ? Infinity : 0 }}
        />

        {/* Magnetic field visualization */}
        {isHovered && (
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 bg-white/50 rounded-full"
                style={{
                  left: "50%",
                  top: "50%",
                }}
                animate={{
                  x: Math.cos((i / 8) * Math.PI * 2) * 40 + mousePos.x * 0.2,
                  y: Math.sin((i / 8) * Math.PI * 2) * 40 + mousePos.y * 0.2,
                  opacity: [0, 1, 0],
                  scale: [0, 1.5, 0],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: i * 0.1,
                }}
              />
            ))}
          </div>
        )}

        {/* Glow effect */}
        <motion.div
          className="absolute inset-0 rounded-2xl"
          style={{
            boxShadow: isHovered ? variants[variant].glow : "none",
          }}
          animate={{
            boxShadow: isHovered
              ? [
                  variants[variant].glow,
                  variants[variant].glow.replace("0.6", "1"),
                  variants[variant].glow,
                ]
              : "none",
          }}
          transition={{ duration: 2, repeat: Infinity }}
        />

        <span className="relative z-10">{children}</span>
      </Link>
    </motion.div>
  );
}

// Floating 3D Metrics
function FloatingMetrics() {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.1;
      groupRef.current.position.y = Math.sin(state.clock.elapsedTime) * 0.5;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Accuracy Sphere */}
      <Float speed={2} rotationIntensity={1} floatIntensity={2}>
        <Sphere args={[0.5, 32, 32]} position={[-2, 0, 0]}>
          <MeshDistortMaterial
            color="#4facfe"
            transparent
            opacity={0.6}
            distort={0.3}
            speed={2}
            roughness={0}
            metalness={0.8}
          />
        </Sphere>
      </Float>

      {/* Retention Cube */}
      <Float speed={1.5} rotationIntensity={2} floatIntensity={1}>
        <mesh position={[2, 0, 0]}>
          <boxGeometry args={[0.8, 0.8, 0.8]} />
          <MeshDistortMaterial
            color="#00f2fe"
            transparent
            opacity={0.7}
            distort={0.4}
            speed={1.5}
            roughness={0.1}
            metalness={0.9}
          />
        </mesh>
      </Float>

      {/* Prediction Torus */}
      <Float speed={3} rotationIntensity={0.5} floatIntensity={3}>
        <mesh position={[0, 1.5, 0]}>
          <torusGeometry args={[0.6, 0.2, 16, 100]} />
          <MeshDistortMaterial
            color="#a855f7"
            transparent
            opacity={0.8}
            distort={0.2}
            speed={3}
            roughness={0}
            metalness={1}
          />
        </mesh>
      </Float>
    </group>
  );
}

// Holographic UI Component
function HolographicCard({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-10%" });

  return (
    <motion.div
      ref={ref}
      className={`relative group ${className}`}
      initial={{ opacity: 0, y: 50, rotateX: 45 }}
      animate={inView ? { opacity: 1, y: 0, rotateX: 0 } : {}}
      transition={{ duration: 1, delay, ease: "easeOut" }}
    >
      <div
        className="relative p-8 rounded-2xl overflow-hidden backdrop-blur-xl border border-cyan-400/20"
        style={{
          background: `
            linear-gradient(135deg, 
              rgba(79, 172, 254, 0.1) 0%, 
              rgba(0, 242, 254, 0.05) 50%, 
              rgba(168, 85, 247, 0.1) 100%)
          `,
        }}
      >
        {/* Holographic scan lines */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `
              repeating-linear-gradient(
                0deg,
                transparent,
                transparent 2px,
                rgba(79, 172, 254, 0.1) 2px,
                rgba(79, 172, 254, 0.1) 4px
              )
            `,
          }}
        />

        {/* Moving shimmer */}
        <motion.div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `
              linear-gradient(90deg, 
                transparent 0%, 
                rgba(255, 255, 255, 0.1) 50%, 
                transparent 100%)
            `,
            width: "50%",
          }}
          animate={{
            x: ["-50%", "200%"],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "linear",
            delay: delay,
          }}
        />

        {/* Content */}
        <div className="relative z-10">{children}</div>

        {/* Corner glow */}
        <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-cyan-400/20 to-transparent rounded-bl-2xl" />
        <div className="absolute bottom-0 left-0 w-20 h-20 bg-gradient-to-tr from-blue-500/20 to-transparent rounded-tr-2xl" />
      </div>
    </motion.div>
  );
}

export default function CinematicLanding() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll();

  const backgroundY = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);

  return (
    <>
      {/* Main Application */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div
          ref={containerRef}
          className="min-h-screen bg-black relative overflow-hidden"
        >
          {/* Animated background layers */}
          <motion.div className="fixed inset-0 z-0" style={{ y: backgroundY }}>
            {/* Deep space background */}
            <div
              className="absolute inset-0"
              style={{
                background: `
                  radial-gradient(circle at 20% 30%, rgba(79, 172, 254, 0.1) 0%, transparent 70%),
                  radial-gradient(circle at 80% 70%, rgba(168, 85, 247, 0.1) 0%, transparent 70%),
                  radial-gradient(circle at 50% 50%, rgba(0, 20, 40, 0.8) 0%, transparent 100%),
                  linear-gradient(180deg, #000000 0%, #001122 50%, #000000 100%)
                `,
              }}
            />

            {/* Particle system */}
            <ParticleSystem variant="cosmic" intensity={2} />

            {/* Floating stars */}
            {[...Array(150)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-px h-px bg-white rounded-full"
                style={{
                  left: Math.random() * 100 + "%",
                  top: Math.random() * 100 + "%",
                }}
                animate={{
                  opacity: [0.2, 1, 0.2],
                  scale: [0.5, 2, 0.5],
                }}
                transition={{
                  duration: Math.random() * 4 + 2,
                  repeat: Infinity,
                  delay: Math.random() * 4,
                }}
              />
            ))}
          </motion.div>

          {/* Navigation */}
          <motion.nav
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="fixed top-0 w-full z-50 backdrop-blur-xl"
            style={{
              background:
                "linear-gradient(135deg, rgba(0,0,0,0.8) 0%, rgba(0,20,40,0.6) 100%)",
            }}
          >
            <div className="container mx-auto px-6 py-4">
              <div className="flex items-center justify-between">
                {/* Logo */}
                <motion.div
                  className="flex items-center space-x-3"
                  whileHover={{ scale: 1.05 }}
                >
                  <LoyaltyLockLogoCSS size="sm" animated={true} />

                  <motion.h1
                    className="text-2xl font-bold"
                    style={{
                      background:
                        "linear-gradient(45deg, #4facfe 0%, #00f2fe 100%)",
                      backgroundClip: "text",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      fontFamily: "Orbitron, sans-serif",
                    }}
                    animate={{
                      backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                    }}
                    transition={{ duration: 4, repeat: Infinity }}
                  >
                    Loyalty Lock
                  </motion.h1>
                </motion.div>

                {/* Navigation Links */}
                <div className="hidden md:flex items-center space-x-8">
                  {["Dashboard", "Contact"].map((item, index) => (
                    <motion.div
                      key={item}
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 + index * 0.1 }}
                    >
                      <Link
                        to={`/${item.toLowerCase()}`}
                        className="text-cyan-100 hover:text-cyan-400 transition-all duration-300 relative group font-medium"
                      >
                        <span className="relative z-10">{item}</span>
                        <motion.div
                          className="absolute -bottom-1 left-0 w-0 h-px bg-gradient-to-r from-cyan-400 to-blue-500 group-hover:w-full transition-all duration-300"
                          whileHover={{ scaleX: 1 }}
                          initial={{ scaleX: 0 }}
                        />
                      </Link>
                    </motion.div>
                  ))}

                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.8 }}
                  >
                    <MagneticLiquidButton href="/login" variant="secondary">
                      Get Started
                    </MagneticLiquidButton>
                  </motion.div>
                </div>
              </div>
            </div>
          </motion.nav>

          {/* Main Content */}
          <main className="relative z-10 pt-24">
            {/* Hero Section */}
            <section className="min-h-screen flex items-center justify-center px-6 relative">
              <div className="container mx-auto text-center">
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 2, ease: "easeOut" }}
                >
                  {/* Subheadline with glitch effect */}
                  <motion.div
                    className="text-3xl md:text-5xl font-light text-cyan-300 mb-8"
                    style={{ fontFamily: "Orbitron, sans-serif" }}
                  >
                    <motion.span
                      animate={{
                        opacity: [1, 0.7, 1],
                        textShadow: [
                          "0 0 10px rgba(0, 242, 254, 0.5)",
                          "0 0 20px rgba(79, 172, 254, 1), 2px 0 0 rgba(255,0,0,0.5), -2px 0 0 rgba(0,255,255,0.5)",
                          "0 0 10px rgba(0, 242, 254, 0.5)",
                        ],
                      }}
                      transition={{
                        duration: 0.1,
                        repeat: Infinity,
                        repeatType: "mirror",
                      }}
                    >
                      AI That Sees What Others Don't
                    </motion.span>
                  </motion.div>

                  <motion.p
                    className="text-xl text-cyan-100/70 mb-12 max-w-4xl mx-auto leading-relaxed font-light"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, duration: 1.5 }}
                  >
                    Unlock customer insights with advanced AI analytics. Predict
                    behavior patterns. Transform data into inevitability.
                  </motion.p>

                  {/* CTA Buttons with Liquid Morphing */}
                  <motion.div
                    className="flex flex-col md:flex-row gap-8 justify-center items-center"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1, duration: 1.5 }}
                  >
                    <MagneticLiquidButton href="/login" variant="primary">
                      <div className="flex items-center space-x-2">
                        <span>Login</span>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{
                            duration: 4,
                            repeat: Infinity,
                            ease: "linear",
                          }}
                        >
                          🔮
                        </motion.div>
                      </div>
                    </MagneticLiquidButton>

                    <MagneticLiquidButton href="/signup" variant="secondary">
                      <div className="flex items-center space-x-2">
                        <span>Sign Up</span>
                        <motion.div
                          animate={{
                            scale: [1, 1.2, 1],
                            opacity: [0.7, 1, 0.7],
                          }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                          }}
                        >
                          ✨
                        </motion.div>
                      </div>
                    </MagneticLiquidButton>

                    <MagneticLiquidButton href="/dashboard" variant="explore">
                      <div className="flex items-center space-x-2">
                        <span>Explore Demo</span>
                        <motion.div
                          animate={{
                            x: [0, 5, 0],
                          }}
                          transition={{
                            duration: 1.5,
                            repeat: Infinity,
                          }}
                        >
                          →
                        </motion.div>
                      </div>
                    </MagneticLiquidButton>
                  </motion.div>
                </motion.div>
              </div>

              {/* 3D Floating Elements */}
              <div className="absolute right-10 top-1/2 transform -translate-y-1/2 w-96 h-96 hidden lg:block">
                <Canvas camera={{ position: [0, 0, 5] }}>
                  <ambientLight intensity={0.2} />
                  <pointLight
                    position={[5, 5, 5]}
                    intensity={1}
                    color="#4facfe"
                  />
                  <pointLight
                    position={[-5, -5, -5]}
                    intensity={0.5}
                    color="#00f2fe"
                  />

                  <FloatingMetrics />
                  <Environment preset="night" />
                </Canvas>
              </div>
            </section>

            {/* Features Section with Real-time Metrics */}
            <section className="py-20 px-6">
              <div className="container mx-auto">
                <motion.div
                  className="text-center mb-16"
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 1 }}
                  viewport={{ once: true }}
                >
                  <h2
                    className="text-5xl font-bold mb-6"
                    style={{
                      background:
                        "linear-gradient(45deg, #4facfe 0%, #00f2fe 50%, #a855f7 100%)",
                      backgroundClip: "text",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      fontFamily: "Orbitron, sans-serif",
                    }}
                  >
                    Intelligence Dashboard
                  </h2>
                  <p className="text-xl text-cyan-100/70 max-w-3xl mx-auto">
                    Real-time analytics for customer behavior insights and
                    predictions
                  </p>
                </motion.div>

                <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                  {[
                    {
                      title: "System Ready",
                      value: "100%",
                      description:
                        "Platform ready for deployment and customer analysis",
                      color: "#4facfe",
                    },
                    {
                      title: "Models Available",
                      value: "5+",
                      description:
                        "Advanced machine learning models trained and ready",
                      color: "#00f2fe",
                    },
                    {
                      title: "Analytics Engine",
                      value: "Active",
                      description:
                        "Real-time customer behavior analysis capabilities",
                      color: "#a855f7",
                    },
                  ].map((metric, index) => (
                    <HolographicCard key={index} delay={index * 0.3}>
                      <div className="text-center">
                        <motion.div
                          className="text-6xl font-bold mb-4"
                          style={{
                            color: metric.color,
                            textShadow: `0 0 20px ${metric.color}`,
                            fontFamily: "Orbitron, sans-serif",
                          }}
                          animate={{
                            textShadow: [
                              `0 0 20px ${metric.color}`,
                              `0 0 40px ${metric.color}`,
                              `0 0 20px ${metric.color}`,
                            ],
                          }}
                          transition={{
                            duration: 3,
                            repeat: Infinity,
                            delay: index * 0.5,
                          }}
                        >
                          {metric.value}
                        </motion.div>

                        <h3 className="text-xl font-semibold text-white mb-3">
                          {metric.title}
                        </h3>

                        <p className="text-cyan-100/70 leading-relaxed">
                          {metric.description}
                        </p>
                      </div>
                    </HolographicCard>
                  ))}
                </div>
              </div>
            </section>

            {/* Call to Action */}
            <section className="py-20 px-6">
              <div className="container mx-auto text-center">
                <HolographicCard className="max-w-4xl mx-auto">
                  <div className="py-8">
                    <h2
                      className="text-4xl font-bold mb-6"
                      style={{
                        background:
                          "linear-gradient(45deg, #4facfe 0%, #00f2fe 100%)",
                        backgroundClip: "text",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        fontFamily: "Orbitron, sans-serif",
                      }}
                    >
                      Start Your Analytics Journey
                    </h2>

                    <p className="text-xl text-cyan-100/80 mb-8 max-w-2xl mx-auto">
                      Join the analytics revolution. Experience AI that
                      understands, predicts, and transforms customer
                      relationships through intelligent insights.
                    </p>

                    <MagneticLiquidButton href="/signup" variant="primary">
                      <div className="flex items-center space-x-3">
                        <span>Get Started Today</span>
                        <motion.div
                          animate={{
                            rotateY: [0, 360],
                            scale: [1, 1.2, 1],
                          }}
                          transition={{
                            duration: 3,
                            repeat: Infinity,
                          }}
                        >
                          🌀
                        </motion.div>
                      </div>
                    </MagneticLiquidButton>
                  </div>
                </HolographicCard>
              </div>
            </section>
          </main>

          {/* Footer */}
          <footer className="py-12 px-6 relative">
            <div className="container mx-auto text-center">
              <motion.div
                className="flex items-center justify-center space-x-3 mb-6"
                whileHover={{ scale: 1.05 }}
              >
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center">
                  <span className="text-white font-bold">LL</span>
                </div>
                <span
                  className="text-lg font-semibold"
                  style={{
                    background:
                      "linear-gradient(45deg, #4facfe 0%, #00f2fe 100%)",
                    backgroundClip: "text",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  Loyalty Lock • AI Analytics
                </span>
              </motion.div>

              <p className="text-cyan-100/40 text-sm">
                © 2024 • Powered by Advanced Analytics • All rights reserved
              </p>
            </div>
          </footer>
        </div>
      </motion.div>
    </>
  );
}
