import "./global.css";

import { useState, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import CinematicLanding from "./pages/CinematicLanding";
import HolographicLogin from "./pages/HolographicLogin";
import BioluminescentSignup from "./pages/BioluminescentSignup";
import CommandCenterDashboard from "./pages/CommandCenterDashboard";
import HologramContact from "./pages/HologramContact";
import NotFound from "./pages/NotFound";
import SurrealBallDrop from "./components/SurrealBallDrop";
import LenisProvider from "./components/LenisProvider";
import AmbientSoundManager from "./components/AmbientSoundManager";
import MagneticCursor from "./components/MagneticCursor";
import SEOHead from "./components/SEOHead";
import ErrorBoundary from "./components/ErrorBoundary";
import LoadingOverlay from "./components/LoadingOverlay";
import PerformanceMonitor from "./components/PerformanceMonitor";

const queryClient = new QueryClient();

const App = () => {
  const [showBallDrop, setShowBallDrop] = useState(true);
  const [appReady, setAppReady] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Check if user has already seen the ball drop in this session
    const hasSeenBallDrop = sessionStorage.getItem("hasSeenBallDrop");
    if (hasSeenBallDrop) {
      setShowBallDrop(false);
      setAppReady(true);
    }
  }, []);

  const handleBallDropComplete = () => {
    sessionStorage.setItem("hasSeenBallDrop", "true");
    setShowBallDrop(false);
    setTimeout(() => setAppReady(true), 500);
  };

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <SEOHead />
          <Toaster />
          <Sonner />
          <MagneticCursor />
          <LoadingOverlay isLoading={isLoading} />

          {showBallDrop && (
            <SurrealBallDrop onComplete={handleBallDropComplete} />
          )}

          {appReady && (
            <LenisProvider>
              <BrowserRouter>
                <Routes>
                  <Route path="/" element={<CinematicLanding />} />
                  <Route path="/login" element={<HolographicLogin />} />
                  <Route path="/signup" element={<BioluminescentSignup />} />
                  <Route
                    path="/dashboard"
                    element={<CommandCenterDashboard />}
                  />
                  <Route path="/contact" element={<HologramContact />} />
                  {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
                <AmbientSoundManager />
                <PerformanceMonitor />
              </BrowserRouter>
            </LenisProvider>
          )}
        </TooltipProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

createRoot(document.getElementById("root")!).render(<App />);
