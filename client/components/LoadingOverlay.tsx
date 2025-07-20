import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2 } from "lucide-react";

interface LoadingOverlayProps {
  isLoading: boolean;
  message?: string;
  progress?: number;
  showProgress?: boolean;
}

const LoadingOverlay = ({
  isLoading,
  message = "Initializing neural pathways...",
  progress = 0,
  showProgress = false,
}: LoadingOverlayProps) => {
  const [displayProgress, setDisplayProgress] = useState(0);

  useEffect(() => {
    if (showProgress) {
      const interval = setInterval(() => {
        setDisplayProgress((prev) => {
          const target = progress;
          const diff = target - prev;
          return prev + diff * 0.1;
        });
      }, 16);

      return () => clearInterval(interval);
    }
  }, [progress, showProgress]);

  const loadingMessages = [
    "Calibrating quantum processors...",
    "Synchronizing neural networks...",
    "Loading consciousness matrix...",
    "Activating holographic systems...",
    "Establishing cosmic connections...",
    "Initializing reality engine...",
  ];

  const [currentMessage, setCurrentMessage] = useState(message);

  useEffect(() => {
    if (isLoading) {
      const interval = setInterval(() => {
        setCurrentMessage(
          loadingMessages[Math.floor(Math.random() * loadingMessages.length)],
        );
      }, 2000);

      return () => clearInterval(interval);
    }
  }, [isLoading]);

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[10000] bg-black/80 backdrop-blur-sm flex items-center justify-center"
        >
          <div className="relative">
            {/* Background glow effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-full blur-3xl scale-150" />

            {/* Main loading container */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1, duration: 0.4 }}
              className="relative bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-8 text-center space-y-6 min-w-[320px]"
            >
              {/* Animated loader */}
              <div className="relative">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                  className="w-16 h-16 mx-auto"
                >
                  <div className="w-full h-full border-4 border-purple-500/20 border-t-purple-500 rounded-full" />
                </motion.div>

                {/* Inner spinning element */}
                <motion.div
                  animate={{ rotate: -360 }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                  className="absolute inset-2 border-2 border-blue-400/30 border-b-blue-400 rounded-full"
                />

                {/* Center dot */}
                <div className="absolute inset-1/2 w-2 h-2 bg-white rounded-full transform -translate-x-1/2 -translate-y-1/2 animate-pulse" />
              </div>

              {/* Loading message */}
              <motion.div
                key={currentMessage}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="space-y-2"
              >
                <h3 className="text-lg font-semibold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                  {currentMessage}
                </h3>
                <p className="text-sm text-gray-400">
                  Please wait while we prepare your experience
                </p>
              </motion.div>

              {/* Progress bar (if enabled) */}
              {showProgress && (
                <div className="space-y-2">
                  <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full"
                      style={{ width: `${displayProgress}%` }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 font-mono">
                    {Math.round(displayProgress)}% complete
                  </p>
                </div>
              )}

              {/* Floating particles */}
              <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl">
                {[...Array(8)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-1 h-1 bg-white/40 rounded-full"
                    animate={{
                      x: [0, Math.random() * 200 - 100],
                      y: [0, Math.random() * 200 - 100],
                      opacity: [0, 1, 0],
                    }}
                    transition={{
                      duration: 3 + Math.random() * 2,
                      repeat: Infinity,
                      delay: Math.random() * 2,
                    }}
                    style={{
                      left: `${Math.random() * 100}%`,
                      top: `${Math.random() * 100}%`,
                    }}
                  />
                ))}
              </div>
            </motion.div>

            {/* Outer ring effect */}
            <motion.div
              animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.1, 0.3] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute inset-0 border border-purple-500/30 rounded-full"
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LoadingOverlay;
