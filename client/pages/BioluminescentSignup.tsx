import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Canvas, useFrame } from "@react-three/fiber";
import { Sphere, Float, Environment, Tube } from "@react-three/drei";
import * as THREE from "three";
import LoyaltyLockLogoCSS from "@/components/LoyaltyLockLogoCSS";

// Digital Vine Component
function DigitalVine({
  path,
  delay = 0,
}: {
  path: THREE.Vector3[];
  delay?: number;
}) {
  const tubeRef = useRef<THREE.Mesh>(null);
  const [progress, setProgress] = useState(0);

  useFrame((state) => {
    if (tubeRef.current) {
      const time = state.clock.elapsedTime - delay;
      if (time > 0) {
        setProgress(Math.min(1, time * 0.3));

        // Animate the vine growing
        tubeRef.current.scale.x = progress;

        // Add organic movement
        tubeRef.current.rotation.z = Math.sin(time * 0.5) * 0.1;
      }
    }
  });

  const curve = new THREE.CatmullRomCurve3(path);

  return (
    <Tube args={[curve, 20, 0.02, 8, false]} ref={tubeRef}>
      <meshStandardMaterial
        color="#00ff41"
        transparent
        opacity={0.8}
        emissive="#00ff41"
        emissiveIntensity={0.3}
        roughness={0.1}
        metalness={0.8}
      />
    </Tube>
  );
}

// Bioluminescent Forest Background
function BioluminescentForest() {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.02;
    }
  });

  // Create vine paths
  const vinePaths = [
    [
      new THREE.Vector3(-5, -3, 0),
      new THREE.Vector3(-3, -1, 1),
      new THREE.Vector3(-1, 1, 2),
      new THREE.Vector3(1, 3, 1),
      new THREE.Vector3(3, 2, 0),
    ],
    [
      new THREE.Vector3(5, -3, -1),
      new THREE.Vector3(3, -1, 0),
      new THREE.Vector3(1, 1, -1),
      new THREE.Vector3(-1, 3, -2),
      new THREE.Vector3(-3, 2, -1),
    ],
    [
      new THREE.Vector3(0, -3, 3),
      new THREE.Vector3(2, -1, 2),
      new THREE.Vector3(0, 1, 1),
      new THREE.Vector3(-2, 3, 0),
      new THREE.Vector3(0, 4, -1),
    ],
  ];

  return (
    <group ref={groupRef}>
      {/* Floating spores */}
      {[...Array(20)].map((_, i) => (
        <Float
          key={i}
          speed={2 + i * 0.1}
          rotationIntensity={0.5}
          floatIntensity={3}
          position={[Math.sin(i) * 8, Math.cos(i) * 4, Math.sin(i * 0.5) * 6]}
        >
          <Sphere args={[0.05, 8, 8]}>
            <meshStandardMaterial
              color="#00ff41"
              transparent
              opacity={0.7}
              emissive="#00ff41"
              emissiveIntensity={0.8}
            />
          </Sphere>
        </Float>
      ))}

      {/* Digital vines */}
      {vinePaths.map((path, i) => (
        <DigitalVine key={i} path={path} delay={i * 2} />
      ))}

      {/* Glowing trees */}
      {[...Array(5)].map((_, i) => (
        <Float
          key={`tree-${i}`}
          speed={1}
          rotationIntensity={0.2}
          floatIntensity={1}
          position={[Math.cos(i * 1.2) * 12, -2, Math.sin(i * 1.2) * 12]}
        >
          <mesh>
            <cylinderGeometry args={[0.1, 0.2, 4, 8]} />
            <meshStandardMaterial
              color="#00d4aa"
              transparent
              opacity={0.6}
              emissive="#00d4aa"
              emissiveIntensity={0.4}
            />
          </mesh>
        </Float>
      ))}
    </group>
  );
}

// Ripple Effect Component
function RippleInput({
  children,
  delay = 0,
}: {
  children: React.ReactNode;
  delay?: number;
}) {
  const [isActive, setIsActive] = useState(false);

  return (
    <motion.div
      className="relative"
      initial={{ opacity: 0, x: -100, rotateY: 45 }}
      animate={{ opacity: 1, x: 0, rotateY: 0 }}
      transition={{
        duration: 1,
        delay,
        ease: "easeOut",
        type: "spring",
        stiffness: 100,
      }}
      onFocus={() => setIsActive(true)}
      onBlur={() => setIsActive(false)}
    >
      {/* Ripple effect */}
      {isActive && (
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute inset-0 border border-green-400/30 rounded-xl"
              initial={{ scale: 1, opacity: 0.6 }}
              animate={{ scale: 1.1, opacity: 0 }}
              transition={{
                duration: 1.5,
                delay: i * 0.3,
                repeat: Infinity,
              }}
            />
          ))}
        </div>
      )}
      {children}
    </motion.div>
  );
}

export default function BioluminescentSignup() {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [currentField, setCurrentField] = useState(0);
  const navigate = useNavigate();

  const fields = [
    {
      name: "fullName",
      label: "Neural Identity",
      type: "text",
      placeholder: "Enter your consciousness name",
    },
    {
      name: "email",
      label: "Quantum Address",
      type: "email",
      placeholder: "neural@consciousness.ai",
    },
    {
      name: "password",
      label: "Encryption Key",
      type: "password",
      placeholder: "Create quantum password",
    },
    {
      name: "confirmPassword",
      label: "Key Verification",
      type: "password",
      placeholder: "Confirm encryption key",
    },
  ];

  const validateField = (name: string, value: string): string => {
    switch (name) {
      case "fullName":
        if (!value.trim()) return "Identity is required";
        if (value.trim().length < 2)
          return "Identity must be at least 2 characters";
        break;
      case "email":
        if (!value) return "Email address is required";
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
          return "Invalid email address format";
        break;
      case "password":
        if (!value) return "Encryption key is required";
        if (value.length < 8) return "Key must be at least 8 characters";
        break;
      case "confirmPassword":
        if (!value) return "Key verification required";
        if (value !== formData.password) return "Keys do not synchronize";
        break;
    }
    return "";
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear error and validate
    const error = validateField(name, value);
    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Validate all fields
    const newErrors: Record<string, string> = {};
    Object.entries(formData).forEach(([key, value]) => {
      const error = validateField(key, value);
      if (error) newErrors[key] = error;
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setShowSuccess(true);
        setTimeout(() => navigate("/login"), 3000);
      } else {
        const errorData = await response.json();
        setErrors({ email: errorData.message || "Neural registration failed" });
      }
    } catch (err) {
      // Demo mode
      setShowSuccess(true);
      setTimeout(() => navigate("/login"), 3000);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-black">
      {/* Bioluminescent Forest Background */}
      <div className="absolute inset-0">
        <Canvas camera={{ position: [0, 2, 8], fov: 60 }}>
          <ambientLight intensity={0.1} />
          <pointLight position={[5, 5, 5]} intensity={1} color="#00ff41" />
          <pointLight position={[-5, 5, 5]} intensity={0.8} color="#00d4aa" />
          <pointLight position={[0, 10, 0]} intensity={1.5} color="#4facfe" />

          <BioluminescentForest />
          <Environment preset="forest" />

          {/* Volumetric fog */}
          <fog attach="fog" args={["#001100", 5, 30]} />
        </Canvas>
      </div>

      {/* Floating bio particles */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(80)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-green-400/40 rounded-full"
            style={{
              left: Math.random() * 100 + "%",
              top: Math.random() * 100 + "%",
            }}
            animate={{
              opacity: [0, 1, 0],
              scale: [0, 2, 0],
              y: [0, -100],
            }}
            transition={{
              duration: Math.random() * 6 + 4,
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
            "linear-gradient(135deg, rgba(0,17,0,0.8) 0%, rgba(0,40,20,0.6) 100%)",
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
                    "linear-gradient(45deg, #00ff41 0%, #00d4aa 100%)",
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
              className="text-green-100 hover:text-green-400 transition-colors flex items-center space-x-2 group"
            >
              <motion.span className="group-hover:-translate-x-1 transition-transform">
                ←
              </motion.span>
              <span>Return to Forest</span>
            </Link>
          </div>
        </div>
      </motion.nav>

      {/* Main Content */}
      <div className="min-h-screen flex items-center justify-center px-6 pt-20">
        <div className="w-full max-w-md">
          <AnimatePresence mode="wait">
            {!showSuccess ? (
              <motion.div
                className="relative"
                initial={{ opacity: 0, scale: 0.8, rotateX: 45 }}
                animate={{ opacity: 1, scale: 1, rotateX: 0 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 1.5, ease: "easeOut" }}
              >
                {/* Glass Cube Container */}
                <div
                  className="relative p-8 rounded-3xl overflow-hidden"
                  style={{
                    background: `
                      linear-gradient(135deg, 
                        rgba(0, 255, 65, 0.1) 0%, 
                        rgba(0, 212, 170, 0.05) 50%, 
                        rgba(79, 172, 254, 0.1) 100%)
                    `,
                    backdropFilter: "blur(25px)",
                    border: "1px solid rgba(0, 255, 65, 0.3)",
                    boxShadow: `
                      0 0 60px rgba(0, 255, 65, 0.2),
                      inset 0 0 60px rgba(0, 212, 170, 0.1)
                    `,
                  }}
                >
                  {/* Growing vine effects */}
                  <div className="absolute inset-0 pointer-events-none">
                    <svg className="absolute inset-0 w-full h-full">
                      <motion.path
                        d="M0,100 Q50,50 100,80 Q150,110 200,90"
                        stroke="rgba(0, 255, 65, 0.3)"
                        strokeWidth="2"
                        fill="none"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 3, ease: "easeInOut" }}
                      />
                      <motion.path
                        d="M200,0 Q150,30 100,20 Q50,10 0,40"
                        stroke="rgba(0, 212, 170, 0.3)"
                        strokeWidth="2"
                        fill="none"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{
                          duration: 3,
                          delay: 1,
                          ease: "easeInOut",
                        }}
                      />
                    </svg>
                  </div>

                  {/* Header */}
                  <motion.div
                    className="text-center mb-8 relative z-10"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                  >
                    <motion.div
                      className="w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 relative overflow-hidden"
                      animate={{
                        boxShadow: [
                          "0 0 20px rgba(0, 255, 65, 0.4)",
                          "0 0 40px rgba(0, 255, 65, 0.8)",
                          "0 0 20px rgba(0, 255, 65, 0.4)",
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
                          d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                        />
                      </svg>
                    </motion.div>

                    <h1
                      className="text-3xl font-bold mb-2"
                      style={{
                        background:
                          "linear-gradient(45deg, #00ff41 0%, #00d4aa 100%)",
                        backgroundClip: "text",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        fontFamily: "Orbitron, sans-serif",
                      }}
                    >
                      Neural Synthesis
                    </h1>
                    <p className="text-green-100/70">
                      Grow your digital consciousness
                    </p>
                  </motion.div>

                  {/* Form */}
                  <form
                    onSubmit={handleSubmit}
                    className="space-y-6 relative z-10"
                  >
                    {fields.map((field, index) => (
                      <RippleInput key={field.name} delay={0.2 + index * 0.2}>
                        <label className="block text-sm font-medium mb-2 text-green-100">
                          {field.label}
                        </label>
                        <div className="relative">
                          <input
                            type={field.type}
                            name={field.name}
                            value={
                              formData[field.name as keyof typeof formData]
                            }
                            onChange={handleInputChange}
                            onFocus={() => setCurrentField(index)}
                            required
                            className={`w-full px-4 py-3 bg-white/5 border rounded-xl 
                                     focus:outline-none focus:ring-2 focus:border-transparent 
                                     transition-all duration-300 text-white placeholder-green-100/50 ${
                                       errors[field.name]
                                         ? "border-red-500 focus:ring-red-500"
                                         : "border-green-400/30 focus:ring-green-400"
                                     }`}
                            placeholder={field.placeholder}
                            style={{
                              backdropFilter: "blur(10px)",
                              boxShadow: "inset 0 0 20px rgba(0, 255, 65, 0.1)",
                            }}
                          />

                          {/* Bio indicator */}
                          <motion.div
                            className="absolute right-3 top-1/2 transform -translate-y-1/2"
                            animate={{
                              scale: currentField === index ? [1, 1.3, 1] : 1,
                              opacity:
                                currentField === index ? [0.6, 1, 0.6] : 0.6,
                            }}
                            transition={{ duration: 2, repeat: Infinity }}
                          >
                            <div className="w-2 h-2 bg-green-400 rounded-full" />
                          </motion.div>
                        </div>

                        <AnimatePresence>
                          {errors[field.name] && (
                            <motion.p
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -10 }}
                              className="text-red-400 text-sm mt-1"
                            >
                              {errors[field.name]}
                            </motion.p>
                          )}
                        </AnimatePresence>
                      </RippleInput>
                    ))}

                    <motion.button
                      type="submit"
                      disabled={isLoading}
                      className="w-full px-6 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold rounded-xl 
                               transition-all duration-300 shadow-lg hover:shadow-green-500/25 disabled:opacity-50 
                               disabled:cursor-not-allowed relative overflow-hidden group"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 1 }}
                    >
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-green-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
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
                            Synthesizing Neural Pattern...
                          </>
                        ) : (
                          <>
                            <span>Begin Neural Growth</span>
                            <motion.span
                              className="ml-2"
                              animate={{ scale: [1, 1.2, 1] }}
                              transition={{ duration: 1.5, repeat: Infinity }}
                            >
                              🌱
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
                    transition={{ delay: 1.2 }}
                  >
                    <p className="text-green-100/60 mb-4">
                      Already have neural pathways?
                    </p>
                    <Link
                      to="/login"
                      className="text-green-400 hover:text-green-300 transition-colors font-medium 
                               hover:underline underline-offset-4"
                    >
                      Connect to Existing Matrix
                    </Link>
                  </motion.div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                className="text-center p-12"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1 }}
                style={{
                  background: `
                    linear-gradient(135deg, 
                      rgba(0, 255, 65, 0.1) 0%, 
                      rgba(0, 212, 170, 0.05) 100%)
                  `,
                  backdropFilter: "blur(25px)",
                  border: "1px solid rgba(0, 255, 65, 0.3)",
                  borderRadius: "1.5rem",
                }}
              >
                <motion.div
                  className="w-24 h-24 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6"
                  animate={{
                    scale: [1, 1.1, 1],
                    boxShadow: [
                      "0 0 20px rgba(0, 255, 65, 0.4)",
                      "0 0 40px rgba(0, 255, 65, 0.8)",
                      "0 0 20px rgba(0, 255, 65, 0.4)",
                    ],
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <svg
                    className="w-12 h-12 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <motion.path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 1 }}
                    />
                  </svg>
                </motion.div>

                <h2
                  className="text-3xl font-bold mb-4"
                  style={{
                    background:
                      "linear-gradient(45deg, #00ff41 0%, #00d4aa 100%)",
                    backgroundClip: "text",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    fontFamily: "Orbitron, sans-serif",
                  }}
                >
                  Neural Synthesis Complete!
                </h2>
                <p className="text-green-100/80 mb-6">
                  Your digital consciousness has been successfully cultivated.
                  Redirecting to neural access portal...
                </p>

                <motion.div
                  className="w-64 mx-auto"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-green-400 to-emerald-600 rounded-full"
                      initial={{ width: "0%" }}
                      animate={{ width: "100%" }}
                      transition={{ duration: 3 }}
                    />
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
