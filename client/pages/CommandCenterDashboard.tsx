import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  Sphere,
  Float,
  Environment,
  Text3D,
  Center,
  Box,
  Cylinder,
} from "@react-three/drei";
import * as THREE from "three";
import CustomerAnalysisInterface from "@/components/CustomerAnalysisInterface";
import LoyaltyLockLogoCSS from "@/components/LoyaltyLockLogoCSS";

// Floating Command Panel Component
function CommandPanel({
  position,
  rotation = [0, 0, 0],
  children,
}: {
  position: [number, number, number];
  rotation?: [number, number, number];
  children: React.ReactNode;
}) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.position.y =
        position[1] + Math.sin(state.clock.elapsedTime + position[0]) * 0.2;
      meshRef.current.rotation.x =
        rotation[0] + Math.sin(state.clock.elapsedTime * 0.5) * 0.05;
      meshRef.current.rotation.z =
        rotation[2] + Math.cos(state.clock.elapsedTime * 0.3) * 0.02;
    }
  });

  return (
    <Float speed={1} rotationIntensity={0.2} floatIntensity={0.5}>
      <mesh ref={meshRef} position={position} rotation={rotation}>
        <boxGeometry args={[3, 2, 0.1]} />
        <meshStandardMaterial
          color="#1a1a2e"
          transparent
          opacity={0.8}
          roughness={0.1}
          metalness={0.9}
          emissive="#4facfe"
          emissiveIntensity={0.1}
        />
      </mesh>
    </Float>
  );
}

// 3D Data Visualization
function DataVisualization() {
  const groupRef = useRef<THREE.Group>(null);
  const [dataPoints] = useState(() =>
    Array.from({ length: 50 }, (_, i) => ({
      x: (Math.random() - 0.5) * 8,
      y: (Math.random() - 0.5) * 8,
      z: (Math.random() - 0.5) * 8,
      value: Math.random(),
    })),
  );

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.1;
    }
  });

  return (
    <group ref={groupRef}>
      {dataPoints.map((point, i) => (
        <Float
          key={i}
          speed={2 + i * 0.1}
          rotationIntensity={1}
          floatIntensity={2}
          position={[point.x, point.y, point.z]}
        >
          <Sphere args={[0.1, 8, 8]}>
            <meshStandardMaterial
              color={point.value > 0.5 ? "#00f2fe" : "#4facfe"}
              transparent
              opacity={0.8}
              emissive={point.value > 0.5 ? "#00f2fe" : "#4facfe"}
              emissiveIntensity={point.value}
            />
          </Sphere>
        </Float>
      ))}

      {/* Connection lines */}
      {dataPoints.slice(0, 20).map((point, i) => {
        const nextPoint = dataPoints[(i + 1) % 20];
        const start = new THREE.Vector3(point.x, point.y, point.z);
        const end = new THREE.Vector3(nextPoint.x, nextPoint.y, nextPoint.z);
        const geometry = new THREE.BufferGeometry().setFromPoints([start, end]);

        return (
          <line key={`line-${i}`} geometry={geometry}>
            <lineBasicMaterial
              color="#4facfe"
              transparent
              opacity={0.3}
              linewidth={1}
            />
          </line>
        );
      })}
    </group>
  );
}

// Holographic Interface Component
function HolographicPanel({
  title,
  children,
  className = "",
  delay = 0,
  glowColor = "#4facfe",
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
  delay?: number;
  glowColor?: string;
}) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      className={`relative group cursor-pointer ${className}`}
      initial={{ opacity: 0, scale: 0.8, rotateX: 45 }}
      animate={{ opacity: 1, scale: 1, rotateX: 0 }}
      transition={{ duration: 1, delay, ease: "easeOut" }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      whileHover={{ scale: 1.02, y: -5 }}
    >
      <div
        className="relative p-6 rounded-2xl overflow-hidden backdrop-blur-xl border transition-all duration-500"
        style={{
          background: `
            linear-gradient(135deg, 
              rgba(79, 172, 254, 0.1) 0%, 
              rgba(0, 242, 254, 0.05) 50%, 
              rgba(168, 85, 247, 0.1) 100%)
          `,
          borderColor: isHovered ? glowColor : "rgba(79, 172, 254, 0.2)",
          boxShadow: isHovered
            ? `0 0 30px ${glowColor}40`
            : "0 0 20px rgba(79, 172, 254, 0.1)",
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
                ${glowColor}20 2px,
                ${glowColor}20 4px
              )
            `,
          }}
        />

        {/* Corner indicators */}
        <div className="absolute top-2 right-2 w-3 h-3 border-t-2 border-r-2 border-cyan-400/50" />
        <div className="absolute bottom-2 left-2 w-3 h-3 border-b-2 border-l-2 border-cyan-400/50" />

        {/* Moving edge glow */}
        <motion.div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `
              linear-gradient(90deg, 
                transparent 0%, 
                ${glowColor}40 50%, 
                transparent 100%)
            `,
            width: "50%",
          }}
          animate={
            isHovered
              ? {
                  x: ["-50%", "200%"],
                }
              : {}
          }
          transition={{
            duration: 2,
            repeat: isHovered ? Infinity : 0,
            ease: "linear",
          }}
        />

        {/* Header */}
        <div className="relative z-10 mb-4">
          <h3
            className="text-lg font-semibold mb-2"
            style={{
              color: glowColor,
              textShadow: `0 0 10px ${glowColor}`,
              fontFamily: "Orbitron, sans-serif",
            }}
          >
            {title}
          </h3>
        </div>

        {/* Content */}
        <div className="relative z-10">{children}</div>

        {/* Pulsing core */}
        <motion.div
          className="absolute top-1/2 right-4 w-2 h-2 rounded-full"
          style={{ backgroundColor: glowColor }}
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.6, 1, 0.6],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>
    </motion.div>
  );
}

// AI Prediction Chart Component
function PredictionChart({ data }: { data: number[] }) {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <span className="text-cyan-100/80 text-sm">Churn Probability</span>
        <motion.span
          className="text-2xl font-bold"
          style={{
            color: data[data.length - 1] > 50 ? "#ff4444" : "#00f2fe",
            textShadow: `0 0 10px ${
              data[data.length - 1] > 50 ? "#ff4444" : "#00f2fe"
            }`,
          }}
          animate={{
            scale: [1, 1.1, 1],
          }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          {data[data.length - 1].toFixed(1)}%
        </motion.span>
      </div>

      {/* Animated chart bars */}
      <div className="flex items-end space-x-1 h-20">
        {data.map((value, i) => (
          <motion.div
            key={i}
            className="flex-1 bg-gradient-to-t from-cyan-500 to-blue-400 rounded-t-sm"
            initial={{ height: 0 }}
            animate={{ height: `${value}%` }}
            transition={{ duration: 1, delay: i * 0.1 }}
            style={{
              background: `linear-gradient(to top, 
                ${value > 50 ? "#ff4444" : "#4facfe"}, 
                ${value > 50 ? "#ff6666" : "#00f2fe"})`,
            }}
          />
        ))}
      </div>
    </div>
  );
}

export default function CommandCenterDashboard() {
  const [activePanel, setActivePanel] = useState("overview");
  const [predictionData] = useState(() =>
    Array.from({ length: 12 }, () => Math.random() * 100),
  );
  const [metrics] = useState({
    accuracy: 97,
    datasets: 12,
    models: 8,
    uptime: 100,
  });

  return (
    <div className="min-h-screen relative overflow-hidden bg-black">
      {/* Deep Space Background */}
      <div className="absolute inset-0">
        <Canvas camera={{ position: [0, 5, 15], fov: 60 }}>
          <ambientLight intensity={0.1} />
          <pointLight position={[10, 10, 10]} intensity={1} color="#4facfe" />
          <pointLight
            position={[-10, 10, 10]}
            intensity={0.8}
            color="#00f2fe"
          />
          <pointLight position={[0, -10, 5]} intensity={0.5} color="#a855f7" />

          {/* Floating command panels */}
          <CommandPanel position={[-6, 2, -5]} rotation={[0, 0.3, 0]} />
          <CommandPanel position={[6, 1, -8]} rotation={[0, -0.2, 0]} />
          <CommandPanel position={[0, 3, -12]} rotation={[0.1, 0, 0]} />

          {/* 3D Data visualization */}
          <DataVisualization />

          {/* Space environment */}
          <Environment preset="night" />

          {/* Volumetric fog */}
          <fog attach="fog" args={["#000033", 10, 50]} />
        </Canvas>
      </div>

      {/* Starfield */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(200)].map((_, i) => (
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
      </div>

      {/* Navigation */}
      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 1 }}
        className="fixed top-0 w-full z-50 backdrop-blur-xl"
        style={{
          background:
            "linear-gradient(135deg, rgba(0,0,0,0.9) 0%, rgba(0,20,60,0.7) 100%)",
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
                Command Center
              </span>
            </Link>

            <div className="flex items-center space-x-6">
              <Link
                to="/"
                className="text-cyan-100 hover:text-cyan-400 transition-colors"
              >
                Home
              </Link>
              <Link
                to="/contact"
                className="text-cyan-100 hover:text-cyan-400 transition-colors"
              >
                Contact
              </Link>
              <div className="w-8 h-8 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-semibold">AS</span>
              </div>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Main Dashboard Content */}
      <main className="relative z-10 pt-24 pb-12 px-6">
        <div className="container mx-auto max-w-7xl">
          {/* Header */}
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
          >
            <h1
              className="text-5xl font-bold mb-4"
              style={{
                background:
                  "linear-gradient(45deg, #4facfe 0%, #00f2fe 50%, #a855f7 100%)",
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                fontFamily: "Orbitron, sans-serif",
              }}
            >
              Command Center Dashboard
            </h1>
            <p className="text-xl text-cyan-100/70">
              Real-time Analytics • Customer Intelligence System
            </p>
          </motion.div>

          {/* Control Tabs */}
          <motion.div
            className="flex justify-center mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className="flex space-x-1 p-1 bg-white/5 backdrop-blur-xl rounded-xl border border-cyan-400/20">
              {[
                { id: "overview", label: "Overview", icon: "🌌" },
                { id: "predictions", label: "Predictions", icon: "🔮" },
                { id: "analytics", label: "Analytics", icon: "📊" },
                { id: "ai-insights", label: "AI Insights", icon: "🧠" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActivePanel(tab.id)}
                  className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 flex items-center space-x-2 ${
                    activePanel === tab.id
                      ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/25"
                      : "text-cyan-100/70 hover:text-cyan-100 hover:bg-white/5"
                  }`}
                >
                  <span>{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>
          </motion.div>

          {/* Dashboard Panels */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activePanel}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.5 }}
              className="grid lg:grid-cols-3 gap-6"
            >
              {/* Main Metrics */}
              <HolographicPanel
                title="System Metrics"
                delay={0.1}
                glowColor="#4facfe"
                className="lg:col-span-2"
              >
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    {
                      label: "Model Accuracy",
                      value: `${metrics.accuracy}%`,
                      color: "#00f2fe",
                    },
                    {
                      label: "Model Accuracy",
                      value: `${metrics.accuracy}%`,
                      color: "#4facfe",
                    },
                    {
                      label: "Models Trained",
                      value: `${metrics.models}`,
                      color: "#a855f7",
                    },
                    {
                      label: "Datasets Loaded",
                      value: `${metrics.datasets}`,
                      color: "#00ff41",
                    },
                  ].map((metric, i) => (
                    <div key={i} className="text-center">
                      <motion.div
                        className="text-2xl font-bold mb-1"
                        style={{
                          color: metric.color,
                          textShadow: `0 0 10px ${metric.color}`,
                          fontFamily: "Orbitron, sans-serif",
                        }}
                        animate={{
                          textShadow: [
                            `0 0 10px ${metric.color}`,
                            `0 0 20px ${metric.color}`,
                            `0 0 10px ${metric.color}`,
                          ],
                        }}
                        transition={{
                          duration: 3,
                          repeat: Infinity,
                          delay: i * 0.5,
                        }}
                      >
                        {metric.value}
                      </motion.div>
                      <div className="text-sm text-cyan-100/60">
                        {metric.label}
                      </div>
                    </div>
                  ))}
                </div>
              </HolographicPanel>

              {/* AI Status */}
              <HolographicPanel
                title="System Status"
                delay={0.3}
                glowColor="#00f2fe"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-cyan-100/80 text-sm">ML Engine</span>
                    <motion.div
                      className="w-3 h-3 bg-green-400 rounded-full"
                      animate={{
                        scale: [1, 1.3, 1],
                        opacity: [0.8, 1, 0.8],
                      }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-cyan-100/80 text-sm">
                      Analytics Engine
                    </span>
                    <motion.div
                      className="w-3 h-3 bg-cyan-400 rounded-full"
                      animate={{
                        scale: [1, 1.3, 1],
                        opacity: [0.8, 1, 0.8],
                      }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-cyan-100/80 text-sm">
                      Data Streams
                    </span>
                    <motion.div
                      className="w-3 h-3 bg-blue-400 rounded-full"
                      animate={{
                        scale: [1, 1.3, 1],
                        opacity: [0.8, 1, 0.8],
                      }}
                      transition={{ duration: 1.8, repeat: Infinity }}
                    />
                  </div>
                </div>
              </HolographicPanel>

              {/* Churn Prediction */}
              <HolographicPanel
                title="Prediction Analytics"
                delay={0.5}
                glowColor="#a855f7"
                className="lg:col-span-2"
              >
                <PredictionChart data={predictionData} />
              </HolographicPanel>

              {/* AI Recommendations */}
              <HolographicPanel
                title="Smart Recommendations"
                delay={0.7}
                glowColor="#00ff41"
              >
                <div className="space-y-3">
                  {[
                    "Activate retention protocol for high-risk segment",
                    "Deploy personalized engagement campaigns",
                    "Optimize customer journey touchpoints",
                    "Implement predictive intervention model",
                  ].map((rec, i) => (
                    <motion.div
                      key={i}
                      className="flex items-start space-x-3 p-3 bg-white/5 rounded-lg"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.2 + 1 }}
                    >
                      <motion.div
                        className="w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0"
                        animate={{
                          scale: [1, 1.5, 1],
                          opacity: [0.6, 1, 0.6],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          delay: i * 0.3,
                        }}
                      />
                      <span className="text-sm text-cyan-100/80">{rec}</span>
                    </motion.div>
                  ))}
                </div>
              </HolographicPanel>
            </motion.div>
          </AnimatePresence>

          {/* Customer Analysis Interface Section */}
          <motion.div
            className="mt-12"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.8 }}
          >
            <CustomerAnalysisInterface />
          </motion.div>
        </div>
      </main>
    </div>
  );
}
