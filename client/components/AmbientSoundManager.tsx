import { useEffect, useRef, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";

interface AmbientSoundManagerProps {
  soundUrl?: string;
  volume?: number;
  autoPlay?: boolean;
}

const AmbientSoundManager = ({
  soundUrl = "/ambient-space.mp3",
  volume = 0.15,
  autoPlay = true,
}: AmbientSoundManagerProps) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentVolume, setCurrentVolume] = useState(volume);

  useEffect(() => {
    // Create audio element
    audioRef.current = new Audio();
    audioRef.current.loop = true;
    audioRef.current.volume = currentVolume;
    audioRef.current.preload = "auto";

    // Set audio source to a data URL for ambient space sound (synthesized)
    // In production, you'd use an actual audio file
    const audioContext = new (window.AudioContext ||
      (window as any).webkitAudioContext)();

    const createAmbientSound = () => {
      const duration = 30; // 30 seconds loop
      const sampleRate = audioContext.sampleRate;
      const numSamples = duration * sampleRate;
      const arrayBuffer = audioContext.createBuffer(2, numSamples, sampleRate);

      for (let channel = 0; channel < 2; channel++) {
        const channelData = arrayBuffer.getChannelData(channel);
        for (let i = 0; i < numSamples; i++) {
          // Create ambient space-like sound with low-frequency oscillations
          const time = i / sampleRate;
          const lowFreq = Math.sin(time * 0.5) * 0.1;
          const midFreq = Math.sin(time * 2) * 0.05;
          const highFreq = Math.sin(time * 8) * 0.02;
          const noise = (Math.random() - 0.5) * 0.01;

          channelData[i] = (lowFreq + midFreq + highFreq + noise) * 0.3;
        }
      }

      return arrayBuffer;
    };

    // For now, we'll use a simple data URL approach
    // In production, replace with actual ambient music file
    if (autoPlay) {
      const playAmbient = async () => {
        try {
          // Create a simple ambient tone
          const oscillator = audioContext.createOscillator();
          const gainNode = audioContext.createGain();

          oscillator.connect(gainNode);
          gainNode.connect(audioContext.destination);

          oscillator.frequency.value = 60; // Low frequency
          gainNode.gain.value = 0.05;

          oscillator.start();

          // Gradually fade in
          gainNode.gain.exponentialRampToValueAtTime(
            currentVolume * 0.1,
            audioContext.currentTime + 3,
          );

          setIsPlaying(true);

          // Clean up after 30 seconds and restart
          setTimeout(() => {
            oscillator.stop();
            if (autoPlay) playAmbient();
          }, 30000);
        } catch (error) {
          console.log("Audio autoplay blocked by browser");
        }
      };

      // Attempt to play after user interaction
      const handleFirstInteraction = () => {
        playAmbient();
        document.removeEventListener("click", handleFirstInteraction);
        document.removeEventListener("keydown", handleFirstInteraction);
      };

      document.addEventListener("click", handleFirstInteraction);
      document.addEventListener("keydown", handleFirstInteraction);

      return () => {
        document.removeEventListener("click", handleFirstInteraction);
        document.removeEventListener("keydown", handleFirstInteraction);
      };
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [autoPlay, currentVolume]);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch(console.error);
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-black/20 backdrop-blur-md border border-white/10 rounded-full px-4 py-2 group hover:bg-black/30 transition-all duration-300">
      <button
        onClick={toggleMute}
        className="p-2 rounded-full hover:bg-white/10 transition-all duration-200 text-white/70 hover:text-white"
        aria-label={isMuted ? "Unmute ambient sound" : "Mute ambient sound"}
      >
        {isMuted ? (
          <VolumeX className="w-4 h-4" />
        ) : (
          <Volume2 className="w-4 h-4" />
        )}
      </button>

      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <input
          type="range"
          min="0"
          max="1"
          step="0.05"
          value={currentVolume}
          onChange={(e) => {
            const vol = parseFloat(e.target.value);
            setCurrentVolume(vol);
            if (audioRef.current) {
              audioRef.current.volume = vol;
            }
          }}
          className="w-16 h-1 bg-white/20 rounded-lg appearance-none slider-thumb"
        />
        <span className="text-xs text-white/50 font-mono min-w-[2rem]">
          {Math.round(currentVolume * 100)}%
        </span>
      </div>

      {/* Visualizer */}
      <div className="flex items-center gap-1 ml-2">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className={`w-0.5 bg-gradient-to-t from-blue-400 to-purple-400 rounded-full transition-all duration-200 ${
              isPlaying && !isMuted ? "animate-pulse h-3" : "h-1"
            }`}
            style={{
              animationDelay: `${i * 150}ms`,
              animationDuration: `${800 + i * 200}ms`,
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default AmbientSoundManager;
