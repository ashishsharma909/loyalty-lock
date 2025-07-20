import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Canvas, useFrame } from "@react-three/fiber";
import { Sphere, Float } from "@react-three/drei";
import * as THREE from "three";
import LoyaltyLockLogoCSS from "@/components/LoyaltyLockLogoCSS";

// Starfield component that responds to mouse movement
function InteractiveStarfield({
  mousePosition,
}: {
  mousePosition: { x: number; y: number };
}) {
  const pointsRef = useRef<THREE.Points>(null);
  const [starPositions] = useState(() => {
    const positions = new Float32Array(2000 * 3);
    for (let i = 0; i < 2000; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 100;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 100;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 100;
    }
    return positions;
  });

  useFrame((state) => {
    if (pointsRef.current) {
      // Rotate based on mouse position
      pointsRef.current.rotation.x = mousePosition.y * 0.1;
      pointsRef.current.rotation.y = mousePosition.x * 0.1;

      // Pulsing effect
      const scale = 1 + Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
      pointsRef.current.scale.setScalar(scale);
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={starPositions.length / 3}
          array={starPositions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        color="#ffffff"
        size={0.1}
        sizeAttenuation
        transparent
        opacity={0.8}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

// Floating holographic elements
function HolographicElements() {
  return (
    <>
      {[...Array(8)].map((_, i) => (
        <Float
          key={i}
          speed={2 + i * 0.2}
          rotationIntensity={1}
          floatIntensity={2}
          position={[Math.sin(i) * 8, Math.cos(i) * 4, Math.sin(i * 0.5) * 6]}
        >
          <Sphere args={[0.1, 16, 16]}>
            <meshStandardMaterial
              color={i % 2 === 0 ? "#4facfe" : "#00f2fe"}
              transparent
              opacity={0.6}
              emissive={i % 2 === 0 ? "#4facfe" : "#00f2fe"}
              emissiveIntensity={0.5}
            />
          </Sphere>
        </Float>
      ))}
    </>
  );
}

// Fingerprint scanning animation
function FingerprintScanner({ isActive }: { isActive: boolean }) {
  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
      <motion.div
        className="relative w-32 h-32"
        animate={isActive ? { scale: [1, 1.1, 1] } : {}}
        transition={{ duration: 2, repeat: Infinity }}
      >
        {/* Fingerprint pattern */}
        <svg
          viewBox="0 0 100 100"
          className="w-full h-full opacity-20"
          style={{ filter: "drop-shadow(0 0 10px rgba(79, 172, 254, 0.6))" }}
        >
          {[...Array(8)].map((_, i) => (
            <motion.circle
              key={i}
              cx="50"
              cy="50"
              r={10 + i * 5}
              fill="none"
              stroke="#4facfe"
              strokeWidth="0.5"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={
                isActive
                  ? {
                      pathLength: 1,
                      opacity: [0, 0.8, 0],
                    }
                  : {}
              }
              transition={{
                duration: 2,
                delay: i * 0.2,
                repeat: Infinity,
              }}
            />
          ))}
        </svg>

        {/* Scanning beam */}
        {isActive && (
          <motion.div
            className="absolute inset-0 bg-gradient-to-b from-cyan-400/20 to-transparent"
            animate={{
              y: [-130, 130],
              opacity: [0, 0.8, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        )}
      </motion.div>
    </div>
  );
}

export default function HolographicLogin() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [glassShatter, setGlassShatter] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth) * 2 - 1,
        y: -(e.clientY / window.innerHeight) * 2 + 1,
      });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setIsScanning(true);

    try {
      const response = await fetch("http://localhost:5000/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        // Trigger glass shatter animation
        setGlassShatter(true);
        setTimeout(() => {
          navigate("/dashboard");
        }, 1500);
      } else {
        const errorData = await response.json();
        setError(errorData.message || "Authentication failed. Access denied.");
      }
    } catch (err) {
      // Demo mode - simulate successful login
      setTimeout(() => {
        setGlassShatter(true);
        setTimeout(() => {
          navigate("/dashboard");
        }, 1500);
      }, 2000);
    } finally {
      setIsLoading(false);
      setTimeout(() => setIsScanning(false), 3000);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-black">
      {/* Starfield Background */}
      <div className="absolute inset-0">
        <Canvas camera={{ position: [0, 0, 20], fov: 60 }}>
          <ambientLight intensity={0.1} />
          <pointLight position={[10, 10, 10]} intensity={0.5} color="#4facfe" />

          <InteractiveStarfield mousePosition={mousePosition} />
          <HolographicElements />
        </Canvas>
      </div>

      {/* Cosmic dust particles */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(100)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-px h-px bg-cyan-400/30 rounded-full"
            style={{
              left: Math.random() * 100 + "%",
              top: Math.random() * 100 + "%",
            }}
            animate={{
              opacity: [0, 1, 0],
              scale: [0, 2, 0],
              x: mousePosition.x * 50,
              y: mousePosition.y * 30,
            }}
            transition={{
              duration: Math.random() * 4 + 2,
              repeat: Infinity,
              delay: Math.random() * 2,
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
            "linear-gradient(135deg, rgba(0,0,0,0.8) 0%, rgba(0,20,40,0.6) 100%)",
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
                    "linear-gradient(45deg, #4facfe 0%, #00f2fe 100%)",
                  backgroundClip: "text",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  fontFamily: "Orbitron, sans-serif",
                }}
              >
                Loyalty Lock
              </span>
            </Link>

            <Link
              to="/"
              className="text-cyan-100 hover:text-cyan-400 transition-colors flex items-center space-x-2 group"
            >
              <motion.span className="group-hover:-translate-x-1 transition-transform">
                ←
              </motion.span>
              <span>Back to Neural Matrix</span>
            </Link>
          </div>
        </div>
      </motion.nav>

      {/* Main Login Content */}
      <div className="min-h-screen flex items-center justify-center px-6 pt-20">
        <motion.div
          className="w-full max-w-md relative"
          initial={{ opacity: 0, scale: 0.8, rotateY: 45 }}
          animate={{ opacity: 1, scale: 1, rotateY: 0 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
        >
          {/* Glass Login Card */}
          <AnimatePresence mode="wait">
            <motion.div
              className="relative p-8 rounded-3xl overflow-hidden"
              style={{
                background: `
                  linear-gradient(135deg, 
                    rgba(79, 172, 254, 0.1) 0%, 
                    rgba(0, 242, 254, 0.05) 50%, 
                    rgba(168, 85, 247, 0.1) 100%)
                `,
                backdropFilter: "blur(25px)",
                border: "1px solid rgba(79, 172, 254, 0.3)",
                boxShadow: `
                  0 0 60px rgba(79, 172, 254, 0.2),
                  inset 0 0 60px rgba(0, 242, 254, 0.1)
                `,
              }}
              animate={
                glassShatter
                  ? {
                      scale: [1, 1.1, 0],
                      opacity: [1, 0.5, 0],
                      rotateZ: [0, 5, 15],
                    }
                  : {}
              }
              transition={{ duration: 1.5 }}
            >
              {/* Fingerprint Scanner */}
              <FingerprintScanner isActive={isScanning} />

              {/* Glass shatter effect */}
              {glassShatter && (
                <div className="absolute inset-0 pointer-events-none">
                  {[...Array(20)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute bg-gradient-to-r from-cyan-400/30 to-blue-500/30"
                      style={{
                        width: Math.random() * 40 + 10,
                        height: Math.random() * 40 + 10,
                        left: Math.random() * 100 + "%",
                        top: Math.random() * 100 + "%",
                      }}
                      initial={{ scale: 1, opacity: 0.8 }}
                      animate={{
                        scale: [1, 0],
                        opacity: [0.8, 0],
                        x: Math.random() * 200 - 100,
                        y: Math.random() * 200 - 100,
                        rotate: Math.random() * 360,
                      }}
                      transition={{ duration: 1.5, delay: i * 0.05 }}
                    />
                  ))}
                </div>
              )}

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

              {/* Header */}
              <div className="text-center mb-8 relative z-10">
                <motion.div
                  className="w-20 h-20 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 relative overflow-hidden"
                  animate={{
                    boxShadow: [
                      "0 0 20px rgba(79, 172, 254, 0.4)",
                      "0 0 40px rgba(79, 172, 254, 0.8)",
                      "0 0 20px rgba(79, 172, 254, 0.4)",
                    ],
                  }}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                    animate={{ x: [-100, 100] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                  <svg
                    className="w-10 h-10 text-white relative z-10"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                </motion.div>

                <h1
                  className="text-3xl font-bold mb-2"
                  style={{
                    background:
                      "linear-gradient(45deg, #4facfe 0%, #00f2fe 100%)",
                    backgroundClip: "text",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    fontFamily: "Orbitron, sans-serif",
                  }}
                >
                  Neural Access Portal
                </h1>
                <p className="text-cyan-100/70">
                  Authenticate your consciousness
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm"
                  >
                    {error}
                  </motion.div>
                )}

                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <label className="block text-sm font-medium mb-2 text-cyan-100">
                    Neural ID (Email)
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 bg-white/5 border border-cyan-400/30 rounded-xl 
                               focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent 
                               transition-all duration-300 text-white placeholder-cyan-100/50"
                      placeholder="consciousness@neural.matrix"
                      style={{
                        backdropFilter: "blur(10px)",
                        boxShadow: "inset 0 0 20px rgba(79, 172, 254, 0.1)",
                      }}
                    />
                    <motion.div
                      className="absolute right-3 top-1/2 transform -translate-y-1/2"
                      animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.6, 1, 0.6],
                      }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <svg
                        className="w-5 h-5 text-cyan-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                    </motion.div>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <label className="block text-sm font-medium mb-2 text-cyan-100">
                    Quantum Key (Password)
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 bg-white/5 border border-cyan-400/30 rounded-xl 
                               focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent 
                               transition-all duration-300 text-white placeholder-cyan-100/50"
                      placeholder="Enter quantum encryption key"
                      style={{
                        backdropFilter: "blur(10px)",
                        boxShadow: "inset 0 0 20px rgba(79, 172, 254, 0.1)",
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-cyan-400 hover:text-cyan-300 transition-colors"
                    >
                      <motion.div
                        animate={{ scale: showPassword ? 1.1 : 1 }}
                        transition={{ duration: 0.2 }}
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          {showPassword ? (
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L6.5 6.5m3.378 3.378a3 3 0 004.243 4.243M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                          ) : (
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                            />
                          )}
                        </svg>
                      </motion.div>
                    </button>
                  </div>
                </motion.div>

                <motion.button
                  type="submit"
                  disabled={isLoading}
                  className="w-full px-6 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold rounded-xl 
                           transition-all duration-300 shadow-lg hover:shadow-cyan-500/25 disabled:opacity-50 
                           disabled:cursor-not-allowed relative overflow-hidden group"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                >
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-blue-600 to-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    initial={{ x: "-100%" }}
                    whileHover={{ x: "0%" }}
                  />
                  <span className="relative z-10 flex items-center justify-center">
                    {isLoading ? (
                      <>
                        <motion.div
                          className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full mr-2"
                          animate={{ rotate: 360 }}
                          transition={{
                            duration: 1,
                            repeat: Infinity,
                            ease: "linear",
                          }}
                        />
                        Scanning Neural Patterns...
                      </>
                    ) : (
                      <>
                        <span>Access Neural Matrix</span>
                        <motion.span
                          className="ml-2"
                          animate={{ x: [0, 5, 0] }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                        >
                          →
                        </motion.span>
                      </>
                    )}
                  </span>
                </motion.button>
              </form>

              <motion.div
                className="mt-8 text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.9 }}
              >
                <p className="text-cyan-100/60 mb-4">
                  Neural patterns not yet synchronized?
                </p>
                <Link
                  to="/signup"
                  className="text-cyan-400 hover:text-cyan-300 transition-colors font-medium 
                           hover:underline underline-offset-4"
                >
                  Initialize New Consciousness
                </Link>
              </motion.div>

              {/* Demo credentials */}
              <motion.div
                className="mt-6 p-4 bg-white/5 rounded-xl border border-cyan-400/20"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1.1 }}
              >
                <h3 className="text-sm font-semibold text-cyan-400 mb-2">
                  Demo Access Codes
                </h3>
                <p className="text-xs text-cyan-100/70">
                  Email: admin@loyaltylock.ai
                  <br />
                  Password: neural2024
                </p>
              </motion.div>
            </motion.div>
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}
