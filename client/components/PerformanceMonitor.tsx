import { useEffect, useState } from "react";
import { Monitor, Cpu, Zap } from "lucide-react";

interface PerformanceStats {
  fps: number;
  memory: number;
  connectionType: string;
  devicePixelRatio: number;
  isLowEndDevice: boolean;
}

const PerformanceMonitor = () => {
  const [stats, setStats] = useState<PerformanceStats>({
    fps: 60,
    memory: 0,
    connectionType: "unknown",
    devicePixelRatio: 1,
    isLowEndDevice: false,
  });
  const [showMonitor, setShowMonitor] = useState(false);

  useEffect(() => {
    let frameCount = 0;
    let lastTime = performance.now();
    let animationId: number;

    const measureFPS = () => {
      frameCount++;
      const currentTime = performance.now();

      if (currentTime - lastTime >= 1000) {
        const fps = Math.round((frameCount * 1000) / (currentTime - lastTime));
        frameCount = 0;
        lastTime = currentTime;

        setStats((prev) => ({ ...prev, fps }));
      }

      animationId = requestAnimationFrame(measureFPS);
    };

    const detectDeviceCapabilities = () => {
      const canvas = document.createElement("canvas");
      const gl = canvas.getContext("webgl");
      const debugInfo = gl?.getExtension("WEBGL_debug_renderer_info");
      const renderer = debugInfo
        ? gl?.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL)
        : "unknown";

      // Detect low-end devices
      const isLowEndDevice =
        navigator.hardwareConcurrency <= 4 ||
        (performance as any).memory?.usedJSHeapSize > 50000000 ||
        window.devicePixelRatio < 2 ||
        /Android.*(SM-|SAMSUNG-|GT-|SCH-)/i.test(navigator.userAgent);

      // Get connection info
      const connection = (navigator as any).connection;
      const connectionType = connection
        ? `${connection.effectiveType} (${connection.downlink}Mbps)`
        : "unknown";

      setStats((prev) => ({
        ...prev,
        memory: (performance as any).memory?.usedJSHeapSize / 1024 / 1024 || 0,
        connectionType,
        devicePixelRatio: window.devicePixelRatio,
        isLowEndDevice,
      }));

      // Auto-optimize based on performance
      if (isLowEndDevice || fps < 30) {
        document.documentElement.style.setProperty("--particle-count", "50");
        document.documentElement.style.setProperty(
          "--animation-quality",
          "low",
        );
      }
    };

    detectDeviceCapabilities();
    measureFPS();

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, []);

  const getPerformanceLevel = () => {
    if (stats.fps >= 55 && !stats.isLowEndDevice) return "optimal";
    if (stats.fps >= 30) return "good";
    return "poor";
  };

  const performanceLevel = getPerformanceLevel();

  // Auto-hide in production unless manually toggled
  if (process.env.NODE_ENV === "production" && !showMonitor) {
    return (
      <button
        onClick={() => setShowMonitor(true)}
        className="fixed bottom-6 left-6 p-2 bg-black/20 backdrop-blur-sm border border-white/10 rounded-lg text-white/50 hover:text-white/80 transition-all duration-200 text-xs"
        title="Show performance monitor"
      >
        <Monitor className="w-4 h-4" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 left-6 z-50 bg-black/20 backdrop-blur-md border border-white/10 rounded-lg p-3 text-white/80 text-xs font-mono min-w-[200px]">
      <div className="flex items-center justify-between mb-2">
        <span className="text-white/60">Performance</span>
        <button
          onClick={() => setShowMonitor(false)}
          className="text-white/40 hover:text-white/80 transition-colors"
        >
          ×
        </button>
      </div>

      <div className="space-y-1">
        {/* FPS */}
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1">
            <Zap className="w-3 h-3" />
            FPS:
          </span>
          <span
            className={`
            ${stats.fps >= 55 ? "text-green-400" : ""}
            ${stats.fps >= 30 && stats.fps < 55 ? "text-yellow-400" : ""}
            ${stats.fps < 30 ? "text-red-400" : ""}
          `}
          >
            {stats.fps}
          </span>
        </div>

        {/* Memory */}
        {stats.memory > 0 && (
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1">
              <Cpu className="w-3 h-3" />
              Memory:
            </span>
            <span
              className={`
              ${stats.memory < 50 ? "text-green-400" : ""}
              ${stats.memory >= 50 && stats.memory < 100 ? "text-yellow-400" : ""}
              ${stats.memory >= 100 ? "text-red-400" : ""}
            `}
            >
              {stats.memory.toFixed(1)}MB
            </span>
          </div>
        )}

        {/* Connection */}
        <div className="flex items-center justify-between">
          <span>Connection:</span>
          <span className="text-blue-400">{stats.connectionType}</span>
        </div>

        {/* Device info */}
        <div className="flex items-center justify-between">
          <span>DPR:</span>
          <span>{stats.devicePixelRatio}x</span>
        </div>

        {/* Performance level indicator */}
        <div className="mt-2 pt-2 border-t border-white/10">
          <div className="flex items-center justify-between">
            <span>Status:</span>
            <span
              className={`
              ${performanceLevel === "optimal" ? "text-green-400" : ""}
              ${performanceLevel === "good" ? "text-yellow-400" : ""}
              ${performanceLevel === "poor" ? "text-red-400" : ""}
            `}
            >
              {performanceLevel}
            </span>
          </div>
          {stats.isLowEndDevice && (
            <div className="text-orange-400 text-[10px] mt-1">
              Low-end mode active
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PerformanceMonitor;
