import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence, useAnimation } from "framer-motion";
import { gsap } from "gsap";

interface TransitionProps {
  children: React.ReactNode;
  isActive: boolean;
  type?: "fold" | "inception" | "reverse" | "tesseract" | "limbo";
  duration?: number;
  onComplete?: () => void;
}

export function FoldTransition({
  children,
  isActive,
  duration = 2,
  onComplete,
}: TransitionProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    if (isActive) {
      const tl = gsap.timeline({
        onComplete: onComplete,
      });

      // Create fold effect
      tl.to(containerRef.current, {
        rotationX: 90,
        transformOrigin: "center center",
        duration: duration / 2,
        ease: "power2.in",
      })
        .to(containerRef.current, {
          scaleY: 0,
          duration: duration / 4,
          ease: "power2.inOut",
        })
        .to(containerRef.current, {
          scaleY: 1,
          duration: duration / 4,
          ease: "power2.inOut",
        })
        .to(containerRef.current, {
          rotationX: 0,
          duration: duration / 2,
          ease: "power2.out",
        });
    }
  }, [isActive, duration, onComplete]);

  return (
    <div
      ref={containerRef}
      className="transform-gpu perspective-1000"
      style={{ transformStyle: "preserve-3d" }}
    >
      {children}
    </div>
  );
}

export function InceptionTransition({
  children,
  isActive,
  duration = 3,
  onComplete,
}: TransitionProps) {
  const [layers, setLayers] = useState<number[]>([]);

  useEffect(() => {
    if (isActive) {
      // Create recursive layers
      const layerCount = 5;
      const newLayers = Array.from({ length: layerCount }, (_, i) => i);
      setLayers(newLayers);

      setTimeout(() => {
        onComplete?.();
      }, duration * 1000);
    }
  }, [isActive, duration, onComplete]);

  return (
    <div className="relative">
      <AnimatePresence>
        {isActive &&
          layers.map((layer) => (
            <motion.div
              key={layer}
              className="absolute inset-0"
              initial={{
                scale: 1 + layer * 0.1,
                opacity: 1 - layer * 0.15,
                rotateZ: layer * 5,
              }}
              animate={{
                scale: [
                  1 + layer * 0.1,
                  1.5 + layer * 0.2,
                  0.5 + layer * 0.05,
                  1 + layer * 0.1,
                ],
                opacity: [
                  1 - layer * 0.15,
                  0.8 - layer * 0.1,
                  0.3 - layer * 0.05,
                  1 - layer * 0.15,
                ],
                rotateZ: [layer * 5, layer * 45, layer * 90, layer * 5],
              }}
              transition={{
                duration: duration,
                ease: "easeInOut",
                times: [0, 0.3, 0.7, 1],
                delay: layer * 0.1,
              }}
              style={{
                filter: `blur(${layer * 2}px) hue-rotate(${layer * 30}deg)`,
                mixBlendMode: "screen",
              }}
            >
              {children}
            </motion.div>
          ))}
      </AnimatePresence>
      <div className={isActive ? "opacity-50" : "opacity-100"}>{children}</div>
    </div>
  );
}

export function ReverseTransition({
  children,
  isActive,
  duration = 2,
  onComplete,
}: TransitionProps) {
  const [isReversing, setIsReversing] = useState(false);

  useEffect(() => {
    if (isActive) {
      setIsReversing(true);
      setTimeout(() => {
        setIsReversing(false);
        onComplete?.();
      }, duration * 1000);
    }
  }, [isActive, duration, onComplete]);

  return (
    <motion.div
      animate={
        isReversing
          ? {
              scale: [1, 0.1, 2, 1],
              rotateY: [0, 180, 360, 0],
              filter: [
                "hue-rotate(0deg) invert(0) brightness(1)",
                "hue-rotate(180deg) invert(1) brightness(2)",
                "hue-rotate(360deg) invert(0) brightness(0.5)",
                "hue-rotate(0deg) invert(0) brightness(1)",
              ],
            }
          : {}
      }
      transition={{
        duration: duration,
        ease: "easeInOut",
        times: [0, 0.3, 0.7, 1],
      }}
    >
      {children}
    </motion.div>
  );
}

export function TesseractTransition({
  children,
  isActive,
  duration = 4,
  onComplete,
}: TransitionProps) {
  const cubeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!cubeRef.current || !isActive) return;

    const tl = gsap.timeline({
      onComplete: onComplete,
    });

    // 4D cube rotation effect
    tl.to(cubeRef.current, {
      rotationX: 360,
      rotationY: 360,
      rotationZ: 180,
      scale: 0.1,
      duration: duration / 2,
      ease: "power2.inOut",
    }).to(cubeRef.current, {
      rotationX: 720,
      rotationY: 720,
      rotationZ: 360,
      scale: 1,
      duration: duration / 2,
      ease: "power2.inOut",
    });
  }, [isActive, duration, onComplete]);

  return (
    <div className="perspective-1000">
      <div
        ref={cubeRef}
        className="transform-gpu"
        style={{ transformStyle: "preserve-3d" }}
      >
        {/* Create multiple faces for tesseract effect */}
        <div className="relative">
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute inset-0"
              style={{
                transformOrigin: "center center",
                transform: `
                  rotateX(${i * 60}deg) 
                  rotateY(${i * 60}deg) 
                  translateZ(${i * 20}px)
                `,
                opacity: 0.8 - i * 0.1,
              }}
              animate={
                isActive
                  ? {
                      rotateX: [i * 60, i * 60 + 360],
                      rotateY: [i * 60, i * 60 + 360],
                      translateZ: [i * 20, i * 20 + 100, i * 20],
                    }
                  : {}
              }
              transition={{
                duration: duration,
                ease: "easeInOut",
                delay: i * 0.1,
              }}
            >
              {children}
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function LimboTransition({
  children,
  isActive,
  duration = 3,
  onComplete,
}: TransitionProps) {
  const [fragments, setFragments] = useState<number[]>([]);

  useEffect(() => {
    if (isActive) {
      const fragmentCount = 12;
      setFragments(Array.from({ length: fragmentCount }, (_, i) => i));

      setTimeout(() => {
        onComplete?.();
      }, duration * 1000);
    }
  }, [isActive, duration, onComplete]);

  return (
    <div className="relative">
      <AnimatePresence>
        {isActive &&
          fragments.map((fragment) => (
            <motion.div
              key={fragment}
              className="absolute inset-0 overflow-hidden"
              initial={{
                clipPath: `polygon(
                  ${(fragment / fragments.length) * 100}% 0%, 
                  ${((fragment + 1) / fragments.length) * 100}% 0%, 
                  ${((fragment + 1) / fragments.length) * 100}% 100%, 
                  ${(fragment / fragments.length) * 100}% 100%
                )`,
              }}
              animate={{
                clipPath: [
                  `polygon(
                    ${(fragment / fragments.length) * 100}% 0%, 
                    ${((fragment + 1) / fragments.length) * 100}% 0%, 
                    ${((fragment + 1) / fragments.length) * 100}% 100%, 
                    ${(fragment / fragments.length) * 100}% 100%
                  )`,
                  `polygon(
                    ${(fragment / fragments.length) * 100 + Math.sin(fragment) * 20}% ${Math.cos(fragment) * 20}%, 
                    ${((fragment + 1) / fragments.length) * 100 + Math.sin(fragment + 1) * 20}% ${Math.cos(fragment + 1) * 20}%, 
                    ${((fragment + 1) / fragments.length) * 100 + Math.sin(fragment + 1) * 20}% ${100 + Math.cos(fragment + 1) * 20}%, 
                    ${(fragment / fragments.length) * 100 + Math.sin(fragment) * 20}% ${100 + Math.cos(fragment) * 20}%
                  )`,
                  `polygon(
                    ${(fragment / fragments.length) * 100}% 0%, 
                    ${((fragment + 1) / fragments.length) * 100}% 0%, 
                    ${((fragment + 1) / fragments.length) * 100}% 100%, 
                    ${(fragment / fragments.length) * 100}% 100%
                  )`,
                ],
                x: [0, Math.sin(fragment * 0.5) * 100, 0],
                y: [0, Math.cos(fragment * 0.5) * 50, 0],
                rotateZ: [0, fragment * 10, 0],
              }}
              transition={{
                duration: duration,
                ease: "easeInOut",
                delay: fragment * 0.05,
                times: [0, 0.5, 1],
              }}
              style={{
                filter: `hue-rotate(${fragment * 30}deg) brightness(${1 + fragment * 0.1})`,
              }}
            >
              {children}
            </motion.div>
          ))}
      </AnimatePresence>
      <div className={isActive ? "opacity-30" : "opacity-100"}>{children}</div>
    </div>
  );
}

// Main transition component that can switch between types
export default function NolanTransition({
  children,
  isActive,
  type = "fold",
  duration = 2,
  onComplete,
}: TransitionProps) {
  const TransitionComponent = {
    fold: FoldTransition,
    inception: InceptionTransition,
    reverse: ReverseTransition,
    tesseract: TesseractTransition,
    limbo: LimboTransition,
  }[type];

  return (
    <TransitionComponent
      isActive={isActive}
      duration={duration}
      onComplete={onComplete}
    >
      {children}
    </TransitionComponent>
  );
}

// Page transition wrapper with automatic type cycling
export function NolanPageTransition({
  children,
  trigger,
  onComplete,
}: {
  children: React.ReactNode;
  trigger: boolean;
  onComplete?: () => void;
}) {
  const [currentType, setCurrentType] =
    useState<TransitionProps["type"]>("fold");
  const types: TransitionProps["type"][] = [
    "fold",
    "inception",
    "reverse",
    "tesseract",
    "limbo",
  ];

  useEffect(() => {
    if (trigger) {
      // Cycle through transition types
      const currentIndex = types.indexOf(currentType || "fold");
      const nextIndex = (currentIndex + 1) % types.length;
      setCurrentType(types[nextIndex]);
    }
  }, [trigger]);

  return (
    <NolanTransition
      isActive={trigger}
      type={currentType}
      duration={3}
      onComplete={onComplete}
    >
      {children}
    </NolanTransition>
  );
}
