import { useState, useRef, useEffect } from "react";
import {
  motion,
  useAnimation,
  useMotionValue,
  useTransform,
} from "framer-motion";
import { useSpring, animated } from "@react-spring/web";
import { useDrag } from "@use-gesture/react";

interface NeuralButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "neural" | "quantum";
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  className?: string;
}

export function MagneticButton({
  children,
  onClick,
  variant = "primary",
  size = "md",
  disabled = false,
  className = "",
}: NeuralButtonProps) {
  const ref = useRef<HTMLButtonElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const { scale, glow } = useSpring({
    scale: isHovered ? 1.05 : 1,
    glow: isHovered ? 1 : 0,
    config: { mass: 1, tension: 280, friction: 60 },
  });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!ref.current || !isHovered) return;

      const rect = ref.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const deltaX = e.clientX - centerX;
      const deltaY = e.clientY - centerY;

      // Magnetic effect - stronger when closer
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
      const maxDistance = 100;
      const magnetStrength = Math.max(0, 1 - distance / maxDistance);

      x.set(deltaX * magnetStrength * 0.3);
      y.set(deltaY * magnetStrength * 0.3);

      setMousePosition({ x: deltaX, y: deltaY });
    };

    if (isHovered) {
      document.addEventListener("mousemove", handleMouseMove);
    } else {
      x.set(0);
      y.set(0);
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
    };
  }, [isHovered, x, y]);

  const variants = {
    primary: "bg-gradient-to-r from-blue-500 to-cyan-500 text-white",
    secondary: "bg-gradient-to-r from-purple-500 to-pink-500 text-white",
    neural: "bg-gradient-to-r from-green-400 to-blue-500 text-white",
    quantum: "bg-gradient-to-r from-indigo-500 to-purple-600 text-white",
  };

  const sizes = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3 text-base",
    lg: "px-8 py-4 text-lg",
  };

  return (
    <motion.button
      ref={ref}
      className={`
        relative rounded-xl font-semibold transition-all duration-300 
        transform-gpu perspective-1000 overflow-hidden
        ${variants[variant]} ${sizes[size]} ${className}
        ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
      `}
      style={{ x, y, scale }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      whileTap={disabled ? {} : { scale: 0.95 }}
    >
      {/* Neural pulse background */}
      <motion.div
        className="absolute inset-0 opacity-30"
        animate={{
          background: [
            "radial-gradient(circle at 50% 50%, rgba(255,255,255,0.1) 0%, transparent 70%)",
            "radial-gradient(circle at 50% 50%, rgba(255,255,255,0.3) 0%, transparent 70%)",
            "radial-gradient(circle at 50% 50%, rgba(255,255,255,0.1) 0%, transparent 70%)",
          ],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Magnetic field visualization */}
      {isHovered && (
        <>
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-white/50 rounded-full"
              style={{
                left: "50%",
                top: "50%",
              }}
              animate={{
                x: Math.cos((i / 6) * Math.PI * 2) * 30 + mousePosition.x * 0.1,
                y: Math.sin((i / 6) * Math.PI * 2) * 30 + mousePosition.y * 0.1,
                opacity: [0, 1, 0],
                scale: [0, 1, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: i * 0.1,
                ease: "easeOut",
              }}
            />
          ))}
        </>
      )}

      {/* Glow effect */}
      <animated.div
        className="absolute inset-0 rounded-xl"
        style={{
          boxShadow: glow.to(
            (g) => `0 0 ${g * 30}px rgba(79, 172, 254, ${g * 0.6})`,
          ),
        }}
      />

      <span className="relative z-10">{children}</span>
    </motion.button>
  );
}

export function BreathingContainer({
  children,
  intensity = 1,
  rate = 0.8,
  className = "",
}: {
  children: React.ReactNode;
  intensity?: number;
  rate?: number;
  className?: string;
}) {
  return (
    <motion.div
      className={`transform-gpu ${className}`}
      animate={{
        scale: [1, 1 + 0.02 * intensity, 1],
        filter: [
          "brightness(1) blur(0px)",
          `brightness(${1 + 0.1 * intensity}) blur(${0.5 * intensity}px)`,
          "brightness(1) blur(0px)",
        ],
      }}
      transition={{
        duration: 4 / rate,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    >
      {children}
    </motion.div>
  );
}

export function NeuralPulse({
  trigger = false,
  intensity = 1,
  color = "#4facfe",
  className = "",
}: {
  trigger?: boolean;
  intensity?: number;
  color?: string;
  className?: string;
}) {
  return (
    <div className={`relative ${className}`}>
      {trigger && (
        <>
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute inset-0 rounded-full border-2 opacity-70"
              style={{ borderColor: color }}
              initial={{ scale: 0, opacity: 0.7 }}
              animate={{
                scale: [0, 2 * intensity, 3 * intensity],
                opacity: [0.7, 0.3, 0],
              }}
              transition={{
                duration: 2,
                ease: "easeOut",
                delay: i * 0.2,
              }}
            />
          ))}
        </>
      )}
    </div>
  );
}

export function SynapseConnection({
  start,
  end,
  active = false,
  intensity = 1,
}: {
  start: { x: number; y: number };
  end: { x: number; y: number };
  active?: boolean;
  intensity?: number;
}) {
  const length = Math.sqrt(
    Math.pow(end.x - start.x, 2) + Math.pow(end.y - start.y, 2),
  );
  const angle = Math.atan2(end.y - start.y, end.x - start.x);

  return (
    <motion.div
      className="absolute pointer-events-none"
      style={{
        left: start.x,
        top: start.y,
        width: length,
        height: 2,
        transformOrigin: "0 50%",
        rotate: angle + "rad",
      }}
    >
      <motion.div
        className="w-full h-full bg-gradient-to-r from-cyan-400/20 via-blue-500/40 to-cyan-400/20 rounded-full"
        animate={
          active
            ? {
                scaleX: [0, 1, 0],
                opacity: [0, intensity, 0],
                filter: [
                  "blur(0px) brightness(1)",
                  `blur(1px) brightness(${1 + intensity})`,
                  "blur(0px) brightness(1)",
                ],
              }
            : { scaleX: 0.3, opacity: 0.2 }
        }
        transition={{
          duration: active ? 1.5 : 0.5,
          ease: "easeInOut",
          repeat: active ? Infinity : 0,
        }}
      />

      {/* Traveling pulse */}
      {active && (
        <motion.div
          className="absolute top-0 w-2 h-2 bg-cyan-400 rounded-full blur-sm"
          style={{ left: 0 }}
          animate={{
            left: [0, length - 8],
            opacity: [0, 1, 0],
            scale: [0.5, 1.5, 0.5],
          }}
          transition={{
            duration: 2,
            ease: "easeInOut",
            repeat: Infinity,
            delay: Math.random() * 2,
          }}
        />
      )}
    </motion.div>
  );
}

export function QuantumField({
  children,
  distortion = 0.1,
  className = "",
}: {
  children: React.ReactNode;
  distortion?: number;
  className?: string;
}) {
  const [nodes, setNodes] = useState<
    Array<{ x: number; y: number; id: number }>
  >([]);

  useEffect(() => {
    const nodeCount = 12;
    const newNodes = Array.from({ length: nodeCount }, (_, i) => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
      id: i,
    }));
    setNodes(newNodes);
  }, []);

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Quantum field grid */}
      <div className="absolute inset-0 pointer-events-none">
        <svg className="w-full h-full" viewBox="0 0 100 100">
          <defs>
            <pattern
              id="quantumGrid"
              x="0"
              y="0"
              width="10"
              height="10"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 10 0 L 0 0 0 10"
                fill="none"
                stroke="rgba(79, 172, 254, 0.1)"
                strokeWidth="0.1"
              />
            </pattern>
          </defs>
          <rect width="100" height="100" fill="url(#quantumGrid)" />

          {/* Quantum nodes */}
          {nodes.map((node) => (
            <motion.circle
              key={node.id}
              cx={node.x}
              cy={node.y}
              r="0.5"
              fill="#4facfe"
              opacity="0.6"
              animate={{
                cx: [node.x, node.x + Math.sin(node.id) * 5, node.x],
                cy: [node.y, node.y + Math.cos(node.id) * 5, node.y],
                r: [0.5, 1, 0.5],
                opacity: [0.6, 1, 0.6],
              }}
              transition={{
                duration: 4 + Math.random() * 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          ))}

          {/* Quantum connections */}
          {nodes.map((node, i) =>
            nodes.slice(i + 1).map((otherNode, j) => {
              const distance = Math.sqrt(
                Math.pow(node.x - otherNode.x, 2) +
                  Math.pow(node.y - otherNode.y, 2),
              );
              if (distance < 25) {
                return (
                  <motion.line
                    key={`${i}-${j}`}
                    x1={node.x}
                    y1={node.y}
                    x2={otherNode.x}
                    y2={otherNode.y}
                    stroke="rgba(79, 172, 254, 0.2)"
                    strokeWidth="0.1"
                    animate={{
                      opacity: [0.2, 0.6, 0.2],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      delay: Math.random() * 3,
                    }}
                  />
                );
              }
              return null;
            }),
          )}
        </svg>
      </div>

      {/* Content with quantum distortion */}
      <motion.div
        className="relative z-10"
        animate={{
          filter: [
            "blur(0px) hue-rotate(0deg)",
            `blur(${distortion}px) hue-rotate(${distortion * 10}deg)`,
            "blur(0px) hue-rotate(0deg)",
          ],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        {children}
      </motion.div>
    </div>
  );
}

export function DNASpiral({
  height = 200,
  speed = 1,
  color1 = "#4facfe",
  color2 = "#00f2fe",
  className = "",
}: {
  height?: number;
  speed?: number;
  color1?: string;
  color2?: string;
  className?: string;
}) {
  return (
    <div className={`relative ${className}`} style={{ height }}>
      <svg className="w-full h-full" viewBox={`0 0 100 ${height}`}>
        {/* DNA strands */}
        {[...Array(2)].map((_, strandIndex) => (
          <motion.path
            key={strandIndex}
            d={`M 20 0 Q 50 ${height / 4} 80 ${height / 2} Q 50 ${
              (height * 3) / 4
            } 20 ${height}`}
            fill="none"
            stroke={strandIndex === 0 ? color1 : color2}
            strokeWidth="2"
            opacity="0.8"
            animate={{
              d: [
                `M 20 0 Q 50 ${height / 4} 80 ${height / 2} Q 50 ${
                  (height * 3) / 4
                } 20 ${height}`,
                `M 80 0 Q 50 ${height / 4} 20 ${height / 2} Q 50 ${
                  (height * 3) / 4
                } 80 ${height}`,
                `M 20 0 Q 50 ${height / 4} 80 ${height / 2} Q 50 ${
                  (height * 3) / 4
                } 20 ${height}`,
              ],
            }}
            transition={{
              duration: 4 / speed,
              repeat: Infinity,
              ease: "easeInOut",
              delay: strandIndex * 0.5,
            }}
          />
        ))}

        {/* DNA base pairs */}
        {[...Array(Math.floor(height / 20))].map((_, i) => (
          <motion.line
            key={i}
            x1="20"
            y1={i * 20}
            x2="80"
            y2={i * 20}
            stroke="rgba(255, 255, 255, 0.4)"
            strokeWidth="1"
            animate={{
              opacity: [0.4, 0.8, 0.4],
              x1: [20, 30, 20],
              x2: [80, 70, 80],
            }}
            transition={{
              duration: 2 / speed,
              repeat: Infinity,
              delay: i * 0.1,
            }}
          />
        ))}
      </svg>
    </div>
  );
}
