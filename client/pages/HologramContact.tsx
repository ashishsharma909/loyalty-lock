import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Canvas, useFrame } from "@react-three/fiber";
import { Box, Float, Environment, Text3D, Center } from "@react-three/drei";
import * as THREE from "three";
import LoyaltyLockLogoCSS from "@/components/LoyaltyLockLogoCSS";

// Rotating Hologram Cube Component
function HologramCube({
  onFaceClick,
  activeFace,
}: {
  onFaceClick: (face: string) => void;
  activeFace: string;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState<string | null>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.elapsedTime * 0.2;
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.3;
      meshRef.current.rotation.z = state.clock.elapsedTime * 0.1;

      // Breathing effect
      const scale = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.1;
      meshRef.current.scale.setScalar(scale);
    }
  });

  const faces = [
    { name: "profile", color: "#4facfe", icon: "👨‍💻" },
    { name: "email", color: "#00f2fe", icon: "✉️" },
    { name: "phone", color: "#a855f7", icon: "📞" },
    { name: "github", color: "#00ff41", icon: "🌐" },
    { name: "linkedin", color: "#ff6b6b", icon: "🌐" },
    { name: "info", color: "#ffd700", icon: "ℹ️" },
  ];

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
      <mesh
        ref={meshRef}
        onClick={() => onFaceClick(activeFace)}
        onPointerEnter={() => setHovered(activeFace)}
        onPointerLeave={() => setHovered(null)}
      >
        <boxGeometry args={[2, 2, 2]} />
        <meshStandardMaterial
          color={faces.find((f) => f.name === activeFace)?.color || "#4facfe"}
          transparent
          opacity={hovered ? 0.8 : 0.6}
          roughness={0.1}
          metalness={0.9}
          emissive={
            faces.find((f) => f.name === activeFace)?.color || "#4facfe"
          }
          emissiveIntensity={hovered ? 0.5 : 0.3}
        />
      </mesh>

      {/* Face indicators */}
      {faces.map((face, i) => {
        const angle = (i / faces.length) * Math.PI * 2;
        const radius = 1.5;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;

        return (
          <Float
            key={face.name}
            speed={3}
            rotationIntensity={1}
            floatIntensity={2}
            position={[x, 0, z]}
          >
            <mesh
              onClick={() => onFaceClick(face.name)}
              onPointerEnter={() => setHovered(face.name)}
              onPointerLeave={() => setHovered(null)}
            >
              <sphereGeometry args={[0.2, 16, 16]} />
              <meshStandardMaterial
                color={face.color}
                transparent
                opacity={activeFace === face.name ? 1 : 0.6}
                emissive={face.color}
                emissiveIntensity={activeFace === face.name ? 0.8 : 0.3}
              />
            </mesh>
          </Float>
        );
      })}
    </Float>
  );
}

// Cosmic Nebula Background
function CosmicNebula() {
  const particlesRef = useRef<THREE.Points>(null);
  const [particles] = useState(() => {
    const positions = new Float32Array(1000 * 3);
    const colors = new Float32Array(1000 * 3);

    for (let i = 0; i < 1000; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 50;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 50;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 50;

      const color = new THREE.Color();
      color.setHSL(Math.random() * 0.3 + 0.5, 0.8, 0.6);
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
    }

    return { positions, colors };
  });

  useFrame((state) => {
    if (particlesRef.current) {
      particlesRef.current.rotation.x = state.clock.elapsedTime * 0.05;
      particlesRef.current.rotation.y = state.clock.elapsedTime * 0.03;
    }
  });

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
          attach="attributes-color"
          count={particles.colors.length / 3}
          array={particles.colors}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.5}
        sizeAttenuation
        transparent
        opacity={0.6}
        vertexColors
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

// Pulsating Stars
function PulsatingStars() {
  return (
    <>
      {[...Array(50)].map((_, i) => (
        <Float
          key={i}
          speed={1 + i * 0.1}
          rotationIntensity={0.5}
          floatIntensity={3}
          position={[
            (Math.random() - 0.5) * 30,
            (Math.random() - 0.5) * 30,
            (Math.random() - 0.5) * 30,
          ]}
        >
          <mesh>
            <sphereGeometry args={[0.05, 8, 8]} />
            <meshStandardMaterial
              color="#ffffff"
              transparent
              opacity={0.8}
              emissive="#ffffff"
              emissiveIntensity={Math.random() * 0.5 + 0.3}
            />
          </mesh>
        </Float>
      ))}
    </>
  );
}

// Contact Info Component
function ContactInfo({ activeFace }: { activeFace: string }) {
  const contactData = {
    profile: {
      title: "Ashish Sharma",
      subtitle: "Neural Architect & AI Engineer",
      description: "Crafting digital consciousness through quantum algorithms",
      icon: "👨‍💻",
    },
    email: {
      title: "Quantum Communication",
      subtitle: "aashishsharma3283@gmail.com",
      description: "Direct neural link for project collaborations",
      icon: "✉️",
      link: "mailto:aashishsharma3283@gmail.com",
    },
    phone: {
      title: "Voice Channel",
      subtitle: "+91 8221860161",
      description: "Instant consciousness synchronization",
      icon: "📞",
      link: "tel:+918221860161",
    },
    github: {
      title: "Code Repository",
      subtitle: "github.com/aashish3283",
      description: "Open source neural networks & AI experiments",
      icon: "🌐",
      link: "https://github.com/aashish3283",
    },
    linkedin: {
      title: "Professional Network",
      subtitle: "linkedin.com/in/ashishsharma3283",
      description: "Business consciousness & career timeline",
      icon: "🌐",
      link: "https://www.linkedin.com/in/ashishsharma3283",
    },
    info: {
      title: "Neural Specifications",
      subtitle: "AI Engineer & Full-Stack Developer",
      description:
        "Specialized in machine learning, customer intelligence, and quantum UX design",
      icon: "ℹ️",
    },
  };

  const info = contactData[activeFace as keyof typeof contactData];

  return (
    <motion.div
      key={activeFace}
      initial={{ opacity: 0, scale: 0.8, rotateY: 45 }}
      animate={{ opacity: 1, scale: 1, rotateY: 0 }}
      exit={{ opacity: 0, scale: 0.8, rotateY: -45 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="text-center"
    >
      <motion.div
        className="text-6xl mb-6"
        animate={{
          scale: [1, 1.2, 1],
          rotateZ: [0, 10, -10, 0],
        }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      >
        {info.icon}
      </motion.div>

      <h2
        className="text-3xl font-bold mb-2"
        style={{
          background: "linear-gradient(45deg, #4facfe 0%, #00f2fe 100%)",
          backgroundClip: "text",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          fontFamily: "Orbitron, sans-serif",
        }}
      >
        {info.title}
      </h2>

      <p className="text-xl text-cyan-300 mb-4 font-medium">{info.subtitle}</p>

      <p className="text-cyan-100/70 mb-6 max-w-md mx-auto leading-relaxed">
        {info.description}
      </p>

      {info.link && (
        <motion.a
          href={info.link}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold rounded-xl hover:from-cyan-600 hover:to-blue-700 transition-all duration-300 group"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <span>Connect Now</span>
          <motion.span
            className="ml-2"
            animate={{ x: [0, 5, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            →
          </motion.span>
        </motion.a>
      )}
    </motion.div>
  );
}

export default function HologramContact() {
  const [activeFace, setActiveFace] = useState("profile");
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 500);
    return () => clearTimeout(timer);
  }, []);

  const handleFaceClick = (face: string) => {
    setActiveFace(face);
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-black">
      {/* Cosmic Nebula Background */}
      <div className="absolute inset-0">
        <Canvas camera={{ position: [0, 0, 10], fov: 60 }}>
          <ambientLight intensity={0.2} />
          <pointLight position={[10, 10, 10]} intensity={1} color="#4facfe" />
          <pointLight
            position={[-10, 10, 10]}
            intensity={0.8}
            color="#a855f7"
          />
          <pointLight position={[0, -10, 5]} intensity={0.6} color="#00f2fe" />

          <CosmicNebula />
          <PulsatingStars />

          {isLoaded && (
            <HologramCube
              onFaceClick={handleFaceClick}
              activeFace={activeFace}
            />
          )}

          <Environment preset="night" />
          <fog attach="fog" args={["#000033", 5, 40]} />
        </Canvas>
      </div>

      {/* Floating cosmic dust */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(100)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-px h-px rounded-full"
            style={{
              background: `hsl(${Math.random() * 60 + 180}, 80%, 60%)`,
              left: Math.random() * 100 + "%",
              top: Math.random() * 100 + "%",
            }}
            animate={{
              opacity: [0, 1, 0],
              scale: [0, 2, 0],
              y: [0, -100],
            }}
            transition={{
              duration: Math.random() * 8 + 4,
              repeat: Infinity,
              delay: Math.random() * 4,
              ease: "easeOut",
            }}
          />
        ))}
      </div>

      {/* Navigation */}
      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 1 }}
        className="fixed top-0 w-full z-50 backdrop-blur-xl"
        style={{
          background:
            "linear-gradient(135deg, rgba(0,0,0,0.9) 0%, rgba(30,0,50,0.7) 100%)",
        }}
      >
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center space-x-2 group">
              <LoyaltyLockLogoCSS size="sm" animated={true} />
              <span
                className="text-xl font-bold"
                style={{
                  background:
                    "linear-gradient(45deg, #a855f7 0%, #4facfe 100%)",
                  backgroundClip: "text",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  fontFamily: "Orbitron, sans-serif",
                }}
              >
                Quantum Contact
              </span>
            </Link>

            <div className="flex items-center space-x-6">
              <Link
                to="/"
                className="text-purple-100 hover:text-purple-300 transition-colors"
              >
                Home
              </Link>
              <Link
                to="/dashboard"
                className="text-purple-100 hover:text-purple-300 transition-colors"
              >
                Dashboard
              </Link>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Main Content */}
      <div className="min-h-screen flex items-center justify-center px-6 pt-20">
        <div className="container mx-auto max-w-6xl">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left: 3D Hologram Cube (handled in Canvas) */}
            <div className="relative h-96 lg:h-[500px]">
              <motion.div
                className="absolute inset-0 flex items-center justify-center"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1.5, ease: "easeOut" }}
              >
                {/* Instructions */}
                <motion.div
                  className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-center"
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  <p className="text-cyan-400/60 text-sm">
                    Click the floating spheres to explore
                  </p>
                </motion.div>
              </motion.div>
            </div>

            {/* Right: Contact Information */}
            <motion.div
              className="relative"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 1, delay: 0.5 }}
            >
              <div
                className="p-8 rounded-3xl backdrop-blur-xl border"
                style={{
                  background: `
                    linear-gradient(135deg, 
                      rgba(168, 85, 247, 0.1) 0%, 
                      rgba(79, 172, 254, 0.05) 50%, 
                      rgba(0, 242, 254, 0.1) 100%)
                  `,
                  borderColor: "rgba(168, 85, 247, 0.3)",
                  boxShadow:
                    "0 0 60px rgba(168, 85, 247, 0.2), inset 0 0 60px rgba(79, 172, 254, 0.1)",
                }}
              >
                {/* Holographic scan lines */}
                <div
                  className="absolute inset-0 pointer-events-none rounded-3xl"
                  style={{
                    background: `
                      repeating-linear-gradient(
                        0deg,
                        transparent,
                        transparent 2px,
                        rgba(168, 85, 247, 0.1) 2px,
                        rgba(168, 85, 247, 0.1) 4px
                      )
                    `,
                  }}
                />

                <div className="relative z-10">
                  <motion.h1
                    className="text-4xl font-bold mb-8 text-center"
                    style={{
                      background:
                        "linear-gradient(45deg, #a855f7 0%, #4facfe 100%)",
                      backgroundClip: "text",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      fontFamily: "Orbitron, sans-serif",
                    }}
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 }}
                  >
                    Holographic Interface
                  </motion.h1>

                  <AnimatePresence mode="wait">
                    <ContactInfo activeFace={activeFace} />
                  </AnimatePresence>

                  {/* Face selector buttons */}
                  <motion.div
                    className="mt-8 grid grid-cols-3 gap-3"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.2 }}
                  >
                    {[
                      { id: "profile", icon: "👨‍💻", label: "Profile" },
                      { id: "email", icon: "✉️", label: "Email" },
                      { id: "phone", icon: "📞", label: "Phone" },
                      { id: "github", icon: "🌐", label: "GitHub" },
                      { id: "linkedin", icon: "🌐", label: "LinkedIn" },
                      { id: "info", icon: "ℹ️", label: "Info" },
                    ].map((face) => (
                      <button
                        key={face.id}
                        onClick={() => handleFaceClick(face.id)}
                        className={`p-3 rounded-lg text-center transition-all duration-300 border ${
                          activeFace === face.id
                            ? "bg-gradient-to-r from-purple-500/20 to-blue-500/20 border-purple-400 shadow-lg shadow-purple-400/25"
                            : "bg-white/5 border-white/10 hover:bg-white/10"
                        }`}
                      >
                        <div className="text-2xl mb-1">{face.icon}</div>
                        <div className="text-xs text-cyan-100/70">
                          {face.label}
                        </div>
                      </button>
                    ))}
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
