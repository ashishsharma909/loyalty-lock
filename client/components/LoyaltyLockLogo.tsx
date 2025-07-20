import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Text3D, Center, useMatcapTexture } from "@react-three/drei";
import { motion } from "framer-motion";
import * as THREE from "three";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  animated?: boolean;
  className?: string;
}

function AnimatedLL() {
  const groupRef = useRef<THREE.Group>(null);
  const [matcapTexture] = useMatcapTexture("7B5254_E9DCC7_B19986_C8AC91", 256);

  useFrame((state) => {
    if (groupRef.current) {
      // Gentle floating animation
      groupRef.current.position.y =
        Math.sin(state.clock.elapsedTime * 0.8) * 0.1;

      // Subtle rotation
      groupRef.current.rotation.y =
        Math.sin(state.clock.elapsedTime * 0.3) * 0.1;

      // Slight tilt
      groupRef.current.rotation.x =
        Math.sin(state.clock.elapsedTime * 0.4) * 0.05;
    }
  });

  return (
    <group ref={groupRef}>
      <Center>
        <group>
          {/* First L */}
          <Text3D
            font="/fonts/helvetiker_bold.typeface.json"
            size={1}
            height={0.3}
            curveSegments={12}
            position={[-0.8, 0, 0]}
          >
            L
            <meshMatcapMaterial matcap={matcapTexture} />
          </Text3D>

          {/* Second L */}
          <Text3D
            font="/fonts/helvetiker_bold.typeface.json"
            size={1}
            height={0.3}
            curveSegments={12}
            position={[0.2, 0, 0]}
          >
            L
            <meshMatcapMaterial matcap={matcapTexture} />
          </Text3D>

          {/* Glowing rim light */}
          <pointLight
            position={[0, 2, 2]}
            intensity={0.5}
            color="#4facfe"
            distance={10}
          />
          <pointLight
            position={[0, -2, 2]}
            intensity={0.3}
            color="#a855f7"
            distance={8}
          />
        </group>
      </Center>
    </group>
  );
}

function StaticLL() {
  const [matcapTexture] = useMatcapTexture("7B5254_E9DCC7_B19986_C8AC91", 256);

  return (
    <Center>
      <group>
        {/* First L */}
        <Text3D
          font="/fonts/helvetiker_bold.typeface.json"
          size={1}
          height={0.2}
          curveSegments={8}
          position={[-0.8, 0, 0]}
        >
          L
          <meshMatcapMaterial matcap={matcapTexture} />
        </Text3D>

        {/* Second L */}
        <Text3D
          font="/fonts/helvetiker_bold.typeface.json"
          size={1}
          height={0.2}
          curveSegments={8}
          position={[0.2, 0, 0]}
        >
          L
          <meshMatcapMaterial matcap={matcapTexture} />
        </Text3D>

        {/* Ambient lighting */}
        <ambientLight intensity={0.4} />
        <pointLight position={[2, 2, 2]} intensity={0.3} color="#4facfe" />
      </group>
    </Center>
  );
}

const LoyaltyLockLogo = ({
  size = "md",
  animated = true,
  className = "",
}: LogoProps) => {
  const sizeMap = {
    sm: "w-16 h-12",
    md: "w-24 h-18",
    lg: "w-32 h-24",
  };

  const cameraPosition: [number, number, number] =
    size === "sm" ? [0, 0, 5] : size === "md" ? [0, 0, 4] : [0, 0, 3.5];

  return (
    <motion.div
      className={`${sizeMap[size]} ${className}`}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
    >
      <Canvas
        camera={{ position: cameraPosition, fov: 50 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: "transparent" }}
      >
        <ambientLight intensity={0.2} />
        <directionalLight
          position={[5, 5, 5]}
          intensity={0.8}
          color="#ffffff"
          castShadow
        />

        {animated ? <AnimatedLL /> : <StaticLL />}
      </Canvas>

      {/* Glow effect background */}
      <div
        className="absolute inset-0 -z-10 rounded-lg opacity-30"
        style={{
          background:
            "radial-gradient(circle, rgba(79, 172, 254, 0.2) 0%, transparent 70%)",
          filter: "blur(8px)",
        }}
      />
    </motion.div>
  );
};

export default LoyaltyLockLogo;
