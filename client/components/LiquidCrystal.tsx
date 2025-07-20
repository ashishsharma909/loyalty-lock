import { useState, useRef, useEffect } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useInView,
  AnimatePresence,
} from "framer-motion";
import { Canvas, useFrame } from "@react-three/fiber";
import { Text3D, Center, Float } from "@react-three/drei";
import * as THREE from "three";

interface LiquidTextProps {
  children: string;
  size?: "sm" | "md" | "lg" | "xl" | "2xl";
  variant?: "crystal" | "plasma" | "hologram" | "neural" | "quantum";
  animate?: boolean;
  delay?: number;
  className?: string;
}

export function LiquidText({
  children,
  size = "md",
  variant = "crystal",
  animate = true,
  delay = 0,
  className = "",
}: LiquidTextProps) {
  const [isVisible, setIsVisible] = useState(false);
  const textRef = useRef<HTMLDivElement>(null);
  const inView = useInView(textRef, { once: true, margin: "-10%" });

  useEffect(() => {
    if (inView) {
      setTimeout(() => setIsVisible(true), delay * 1000);
    }
  }, [inView, delay]);

  const sizes = {
    sm: "text-sm",
    md: "text-xl",
    lg: "text-3xl",
    xl: "text-5xl",
    "2xl": "text-7xl",
  };

  const variants = {
    crystal: {
      background: "linear-gradient(45deg, #4facfe 0%, #00f2fe 100%)",
      filter: "drop-shadow(0 0 10px rgba(79, 172, 254, 0.6))",
    },
    plasma: {
      background:
        "linear-gradient(45deg, #ff006e 0%, #8338ec 50%, #3a86ff 100%)",
      filter: "drop-shadow(0 0 15px rgba(255, 0, 110, 0.6))",
    },
    hologram: {
      background:
        "linear-gradient(45deg, #00f5ff 0%, #00d4aa 50%, #00ff41 100%)",
      filter: "drop-shadow(0 0 20px rgba(0, 245, 255, 0.6))",
    },
    neural: {
      background:
        "linear-gradient(45deg, #72ff00 0%, #00ffa3 50%, #00d4ff 100%)",
      filter: "drop-shadow(0 0 12px rgba(114, 255, 0, 0.6))",
    },
    quantum: {
      background:
        "linear-gradient(45deg, #a855f7 0%, #3b82f6 50%, #06b6d4 100%)",
      filter: "drop-shadow(0 0 18px rgba(168, 85, 247, 0.6))",
    },
  };

  return (
    <div ref={textRef} className={`relative overflow-hidden ${className}`}>
      <motion.div
        className={`font-display font-bold ${sizes[size]} bg-clip-text text-transparent`}
        style={{
          background: variants[variant].background,
          filter: variants[variant].filter,
          WebkitBackgroundClip: "text",
          backgroundClip: "text",
        }}
        initial={animate ? { opacity: 0, scale: 0.8 } : {}}
        animate={
          isVisible && animate
            ? {
                opacity: 1,
                scale: 1,
                background: [
                  variants[variant].background,
                  variants[variant].background.replace("45deg", "90deg"),
                  variants[variant].background.replace("45deg", "135deg"),
                  variants[variant].background,
                ],
              }
            : {}
        }
        transition={{
          duration: 2,
          ease: "easeOut",
          background: {
            duration: 6,
            repeat: Infinity,
            ease: "linear",
          },
        }}
      >
        {children.split("").map((char, index) => (
          <motion.span
            key={index}
            className="inline-block"
            initial={animate ? { opacity: 0, y: 50, rotateX: -90 } : {}}
            animate={
              isVisible && animate
                ? {
                    opacity: 1,
                    y: 0,
                    rotateX: 0,
                  }
                : {}
            }
            transition={{
              duration: 0.8,
              delay: delay + index * 0.1,
              ease: "easeOut",
            }}
            whileHover={{
              scale: 1.2,
              rotateY: 10,
              filter: "brightness(1.5)",
            }}
          >
            {char === " " ? "\u00A0" : char}
          </motion.span>
        ))}
      </motion.div>

      {/* Liquid shimmer effect */}
      {isVisible && (
        <motion.div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.8) 50%, transparent 100%)",
            width: "20%",
          }}
          animate={{
            x: ["-20%", "120%"],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2,
          }}
        />
      )}

      {/* Crystal particles */}
      {isVisible && variant === "crystal" && (
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(12)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-cyan-400 rounded-full"
              style={{
                left: Math.random() * 100 + "%",
                top: Math.random() * 100 + "%",
              }}
              animate={{
                opacity: [0, 1, 0],
                scale: [0, 1.5, 0],
                y: [0, -20],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function Text3DLiquid({
  children,
  size = 1,
  color = "#4facfe",
}: {
  children: string;
  size?: number;
  color?: string;
}) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x =
        Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.2;

      // Liquid morphing effect
      const scale = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.05;
      meshRef.current.scale.setScalar(scale);
    }
  });

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
      <Center>
        <Text3D
          ref={meshRef}
          font="/fonts/helvetiker_regular.typeface.json"
          size={size}
          height={0.2}
          curveSegments={32}
          bevelEnabled
          bevelThickness={0.02}
          bevelSize={0.02}
          bevelOffset={0}
          bevelSegments={16}
        >
          {children}
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={0.3}
            metalness={0.8}
            roughness={0.2}
            transparent
            opacity={0.9}
          />
        </Text3D>
      </Center>
    </Float>
  );
}

interface DimensionalScrollProps {
  children: React.ReactNode;
  dimension?: "galaxy" | "underwater" | "datasphere" | "void";
  intensity?: number;
}

export function DimensionalScroll({
  children,
  dimension = "galaxy",
  intensity = 1,
}: DimensionalScrollProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [0.8, 1, 1.2]);

  const getDimensionBackground = () => {
    switch (dimension) {
      case "galaxy":
        return (
          <div className="absolute inset-0">
            <div
              className="absolute inset-0"
              style={{
                background: `
                  radial-gradient(circle at 20% 30%, rgba(138, 43, 226, 0.3) 0%, transparent 50%),
                  radial-gradient(circle at 80% 70%, rgba(75, 0, 130, 0.3) 0%, transparent 50%),
                  radial-gradient(circle at 50% 50%, rgba(25, 25, 112, 0.2) 0%, transparent 80%),
                  linear-gradient(180deg, #000011 0%, #000033 50%, #000011 100%)
                `,
              }}
            />
            {/* Stars */}
            {[...Array(100)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-px h-px bg-white rounded-full"
                style={{
                  left: Math.random() * 100 + "%",
                  top: Math.random() * 100 + "%",
                }}
                animate={{
                  opacity: [0.2, 1, 0.2],
                  scale: [0.5, 1.5, 0.5],
                }}
                transition={{
                  duration: Math.random() * 3 + 2,
                  repeat: Infinity,
                  delay: Math.random() * 3,
                }}
              />
            ))}
          </div>
        );

      case "underwater":
        return (
          <div className="absolute inset-0">
            <div
              className="absolute inset-0"
              style={{
                background: `
                  radial-gradient(ellipse at 30% 20%, rgba(0, 100, 150, 0.4) 0%, transparent 70%),
                  radial-gradient(ellipse at 70% 80%, rgba(0, 150, 200, 0.3) 0%, transparent 70%),
                  linear-gradient(180deg, #001122 0%, #003366 50%, #001122 100%)
                `,
              }}
            />
            {/* Bubbles */}
            {[...Array(30)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute bg-cyan-400/20 rounded-full"
                style={{
                  width: Math.random() * 20 + 5,
                  height: Math.random() * 20 + 5,
                  left: Math.random() * 100 + "%",
                  bottom: "0%",
                }}
                animate={{
                  y: [-100, -window.innerHeight - 100],
                  opacity: [0, 0.6, 0],
                  scale: [0.5, 1, 0.5],
                }}
                transition={{
                  duration: Math.random() * 10 + 5,
                  repeat: Infinity,
                  delay: Math.random() * 5,
                  ease: "easeOut",
                }}
              />
            ))}
          </div>
        );

      case "datasphere":
        return (
          <div className="absolute inset-0">
            <div
              className="absolute inset-0"
              style={{
                background: `
                  conic-gradient(from 0deg, #00ff41 0%, #00d4aa 25%, #00f5ff 50%, #4facfe 75%, #00ff41 100%),
                  radial-gradient(circle, transparent 30%, rgba(0, 0, 0, 0.8) 70%)
                `,
              }}
            />
            {/* Data streams */}
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute h-px bg-gradient-to-r from-transparent via-cyan-400 to-transparent"
                style={{
                  width: Math.random() * 200 + 100,
                  left: Math.random() * 100 + "%",
                  top: Math.random() * 100 + "%",
                  transform: `rotate(${Math.random() * 360}deg)`,
                }}
                animate={{
                  opacity: [0, 1, 0],
                  scaleX: [0, 1, 0],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: Math.random() * 2,
                }}
              />
            ))}
          </div>
        );

      case "void":
        return (
          <div className="absolute inset-0">
            <div
              className="absolute inset-0 bg-black"
              style={{
                background: `
                  radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0.05) 0%, transparent 50%),
                  linear-gradient(45deg, transparent 49%, rgba(255, 255, 255, 0.02) 50%, transparent 51%)
                `,
              }}
            />
            {/* Void particles */}
            {[...Array(50)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-px h-px bg-white/30"
                style={{
                  left: Math.random() * 100 + "%",
                  top: Math.random() * 100 + "%",
                }}
                animate={{
                  opacity: [0, 0.3, 0],
                  x: [0, Math.random() * 100 - 50],
                  y: [0, Math.random() * 100 - 50],
                }}
                transition={{
                  duration: Math.random() * 8 + 4,
                  repeat: Infinity,
                  delay: Math.random() * 4,
                }}
              />
            ))}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <motion.div
      ref={containerRef}
      className="relative min-h-screen overflow-hidden"
      style={{ y, opacity, scale }}
    >
      {getDimensionBackground()}

      <motion.div
        className="relative z-10"
        style={{
          filter: useTransform(
            scrollYProgress,
            [0, 0.5, 1],
            [`blur(0px)`, `blur(${intensity}px)`, `blur(0px)`],
          ),
        }}
      >
        {children}
      </motion.div>

      {/* Dimensional portal effect */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `
            radial-gradient(circle at 50% 50%, 
              transparent 40%, 
              rgba(79, 172, 254, ${useTransform(scrollYProgress, [0, 0.5, 1], [0, 0.1, 0])}) 60%, 
              transparent 80%)
          `,
        }}
      />
    </motion.div>
  );
}

export function ScrollTriggerReveal({
  children,
  direction = "up",
  delay = 0,
  distance = 100,
  className = "",
}: {
  children: React.ReactNode;
  direction?: "up" | "down" | "left" | "right" | "scale" | "rotate";
  delay?: number;
  distance?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-10%" });

  const getInitialState = () => {
    switch (direction) {
      case "up":
        return { opacity: 0, y: distance };
      case "down":
        return { opacity: 0, y: -distance };
      case "left":
        return { opacity: 0, x: distance };
      case "right":
        return { opacity: 0, x: -distance };
      case "scale":
        return { opacity: 0, scale: 0.5 };
      case "rotate":
        return { opacity: 0, rotateY: 90 };
      default:
        return { opacity: 0, y: distance };
    }
  };

  const getAnimateState = () => {
    switch (direction) {
      case "up":
      case "down":
        return { opacity: 1, y: 0 };
      case "left":
      case "right":
        return { opacity: 1, x: 0 };
      case "scale":
        return { opacity: 1, scale: 1 };
      case "rotate":
        return { opacity: 1, rotateY: 0 };
      default:
        return { opacity: 1, y: 0 };
    }
  };

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={getInitialState()}
      animate={inView ? getAnimateState() : {}}
      transition={{
        duration: 0.8,
        delay: delay,
        ease: "easeOut",
      }}
    >
      {children}
    </motion.div>
  );
}

export function LiquidMorph({
  children,
  speed = 1,
  intensity = 0.1,
  className = "",
}: {
  children: React.ReactNode;
  speed?: number;
  intensity?: number;
  className?: string;
}) {
  return (
    <motion.div
      className={className}
      animate={{
        scale: [1, 1 + intensity, 1 - intensity / 2, 1],
        skewX: [0, intensity * 10, -intensity * 10, 0],
        skewY: [0, -intensity * 5, intensity * 5, 0],
      }}
      transition={{
        duration: 4 / speed,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    >
      {children}
    </motion.div>
  );
}
