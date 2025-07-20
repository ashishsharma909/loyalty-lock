import { motion } from "framer-motion";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  animated?: boolean;
  className?: string;
}

const LoyaltyLockLogoCSS = ({
  size = "md",
  animated = true,
  className = "",
}: LogoProps) => {
  const sizeClasses = {
    sm: "text-2xl w-12 h-8",
    md: "text-4xl w-20 h-12",
    lg: "text-6xl w-32 h-20",
  };

  return (
    <motion.div
      className={`${sizeClasses[size]} ${className} relative flex items-center justify-center font-bold select-none`}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
    >
      {/* Main LL Text */}
      <motion.div
        className="relative z-10"
        style={{
          background:
            "linear-gradient(135deg, #4facfe 0%, #00f2fe 50%, #a855f7 100%)",
          backgroundClip: "text",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          textShadow: "0 0 20px rgba(79, 172, 254, 0.5)",
          fontFamily: "Orbitron, sans-serif",
          letterSpacing: size === "sm" ? "2px" : size === "md" ? "4px" : "6px",
        }}
        animate={
          animated
            ? {
                filter: [
                  "drop-shadow(0 0 10px rgba(79, 172, 254, 0.5))",
                  "drop-shadow(0 0 20px rgba(168, 85, 247, 0.7))",
                  "drop-shadow(0 0 10px rgba(79, 172, 254, 0.5))",
                ],
              }
            : {}
        }
        transition={{
          duration: 2,
          repeat: animated ? Infinity : 0,
          ease: "easeInOut",
        }}
      >
        LL
      </motion.div>

      {/* Glowing background layers */}
      <div className="absolute inset-0 flex items-center justify-center">
        {/* Outer glow */}
        <motion.div
          className="absolute"
          style={{
            background:
              "radial-gradient(circle, rgba(79, 172, 254, 0.3) 0%, transparent 70%)",
            width: "150%",
            height: "150%",
            filter: "blur(10px)",
          }}
          animate={
            animated
              ? {
                  scale: [1, 1.2, 1],
                  opacity: [0.3, 0.6, 0.3],
                }
              : {}
          }
          transition={{
            duration: 3,
            repeat: animated ? Infinity : 0,
            ease: "easeInOut",
          }}
        />

        {/* Inner glow */}
        <motion.div
          className="absolute"
          style={{
            background:
              "radial-gradient(circle, rgba(168, 85, 247, 0.4) 0%, transparent 60%)",
            width: "100%",
            height: "100%",
            filter: "blur(5px)",
          }}
          animate={
            animated
              ? {
                  scale: [1, 1.1, 1],
                  opacity: [0.4, 0.8, 0.4],
                }
              : {}
          }
          transition={{
            duration: 2.5,
            repeat: animated ? Infinity : 0,
            ease: "easeInOut",
            delay: 0.5,
          }}
        />
      </div>

      {/* Decorative elements */}
      {size === "lg" && (
        <>
          {/* Corner sparks */}
          {[...Array(4)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-cyan-400 rounded-full"
              style={{
                top: i < 2 ? "10%" : "90%",
                left: i % 2 === 0 ? "10%" : "90%",
              }}
              animate={
                animated
                  ? {
                      opacity: [0, 1, 0],
                      scale: [0.5, 1.5, 0.5],
                    }
                  : {}
              }
              transition={{
                duration: 1.5,
                repeat: animated ? Infinity : 0,
                delay: i * 0.3,
              }}
            />
          ))}
        </>
      )}

      {/* Subtle border */}
      <div
        className="absolute inset-0 rounded-lg border border-cyan-400/20"
        style={{
          background:
            "linear-gradient(135deg, rgba(79, 172, 254, 0.1) 0%, rgba(168, 85, 247, 0.1) 100%)",
        }}
      />
    </motion.div>
  );
};

export default LoyaltyLockLogoCSS;
