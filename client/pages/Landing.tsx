import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import { HeroScene3D } from "@/components/Scene3D";
import { gsap } from "gsap";

const InteractiveCard = ({
  icon,
  title,
  description,
  delay,
  index,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  delay: string;
  index: number;
}) => {
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;

    const handleMouseEnter = () => {
      gsap.to(card, {
        scale: 1.05,
        rotateX: 5,
        rotateY: 5,
        duration: 0.3,
        ease: "power2.out",
      });
    };

    const handleMouseLeave = () => {
      gsap.to(card, {
        scale: 1,
        rotateX: 0,
        rotateY: 0,
        duration: 0.3,
        ease: "power2.out",
      });
    };

    const handleMouseMove = (e: MouseEvent) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = (y - centerY) / 10;
      const rotateY = (centerX - x) / 10;

      gsap.to(card, {
        rotateX,
        rotateY,
        duration: 0.1,
        ease: "power2.out",
      });
    };

    card.addEventListener("mouseenter", handleMouseEnter);
    card.addEventListener("mouseleave", handleMouseLeave);
    card.addEventListener("mousemove", handleMouseMove);

    return () => {
      card.removeEventListener("mouseenter", handleMouseEnter);
      card.removeEventListener("mouseleave", handleMouseLeave);
      card.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: index * 0.2 }}
      className="glass-card p-8 group relative overflow-hidden cursor-pointer perspective-1000"
    >
      {/* Animated background */}
      <div className="absolute inset-0 bg-gradient-to-br from-neon-blue/5 to-neon-purple/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(10)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-neon-blue rounded-full"
            style={{
              left: Math.random() * 100 + "%",
              top: Math.random() * 100 + "%",
            }}
            animate={{
              opacity: [0, 1, 0],
              scale: [0, 1, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      <div className="relative z-10">
        <motion.div
          className="mb-6 text-neon-blue text-4xl flex justify-center"
          whileHover={{ scale: 1.2, rotate: 360 }}
          transition={{ duration: 0.5 }}
        >
          {icon}
        </motion.div>
        <h3 className="text-xl font-display font-semibold mb-4 text-center">
          {title}
        </h3>
        <p className="text-muted-foreground text-center leading-relaxed">
          {description}
        </p>
      </div>
    </motion.div>
  );
};

export default function Landing() {
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated Background with Parallax */}
      <motion.div className="fixed inset-0 -z-10" style={{ y, opacity }}>
        <div className="absolute inset-0 bg-gradient-to-br from-background via-cyber-900 to-background" />

        {/* 3D Background Scene */}
        <HeroScene3D />

        {/* Dynamic Orbs */}
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-gradient-to-r from-neon-blue/20 to-neon-purple/20 blur-xl"
            style={{
              width: Math.random() * 400 + 100,
              height: Math.random() * 400 + 100,
              left: Math.random() * 100 + "%",
              top: Math.random() * 100 + "%",
            }}
            animate={{
              x: [0, Math.random() * 200 - 100],
              y: [0, Math.random() * 200 - 100],
              scale: [1, 1.5, 1],
              opacity: [0.1, 0.3, 0.1],
            }}
            transition={{
              duration: 10 + Math.random() * 5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}
      </motion.div>

      {/* Navigation */}
      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="fixed top-0 w-full z-50 glass-card border-0 border-b border-white/10"
      >
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <motion.div
              className="flex items-center space-x-2"
              whileHover={{ scale: 1.05 }}
            >
              <motion.div
                className="w-8 h-8 rounded-lg bg-gradient-to-br from-neon-blue to-neon-purple flex items-center justify-center"
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
              >
                <span className="text-white font-bold text-sm">LL</span>
              </motion.div>
              <span className="text-xl font-display font-bold bg-gradient-to-r from-neon-blue to-neon-purple bg-clip-text text-transparent">
                Loyalty Lock
              </span>
            </motion.div>
            <div className="hidden md:flex items-center space-x-8">
              {["Home", "Dashboard", "Contact"].map((item, index) => (
                <motion.div
                  key={item}
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                >
                  <Link
                    to={item === "Home" ? "/" : `/${item.toLowerCase()}`}
                    className="text-foreground hover:text-neon-blue transition-colors relative group"
                  >
                    {item}
                    <motion.div
                      className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-neon-blue to-neon-purple group-hover:w-full transition-all duration-300"
                      initial={{ width: 0 }}
                      whileHover={{ width: "100%" }}
                    />
                  </Link>
                </motion.div>
              ))}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.8 }}
              >
                <Link
                  to="/login"
                  className="px-6 py-2 glass-card hover:bg-white/10 transition-all duration-300 rounded-xl group relative overflow-hidden"
                >
                  <span className="relative z-10">Login</span>
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-neon-blue to-neon-purple opacity-0 group-hover:opacity-20 transition-opacity duration-300"
                    initial={{ scale: 0 }}
                    whileHover={{ scale: 1 }}
                  />
                </Link>
              </motion.div>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section className="min-h-screen flex items-center justify-center px-6 relative">
        <div className="container mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.5 }}
          >
            <motion.h1
              className="text-5xl md:text-8xl font-display font-bold mb-8 leading-tight"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 0.7 }}
            >
              <motion.span
                className="bg-gradient-to-r from-neon-blue via-neon-purple to-neon-violet bg-clip-text text-transparent"
                animate={{
                  backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                }}
                transition={{
                  duration: 5,
                  repeat: Infinity,
                  ease: "linear",
                }}
              >
                Loyalty Lock
              </motion.span>
              <br />
              <motion.span
                className="text-2xl md:text-4xl font-medium text-muted-foreground"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.2, duration: 0.8 }}
              >
                AI-Powered Customer Intelligence
              </motion.span>
            </motion.h1>

            <motion.p
              className="text-xl text-muted-foreground mb-12 max-w-3xl mx-auto leading-relaxed"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.5, duration: 0.8 }}
            >
              Transform customer relationships with predictive AI that prevents
              churn, maximizes retention, and drives sustainable growth through
              intelligent insights.
            </motion.p>

            {/* Enhanced CTA Buttons */}
            <motion.div
              className="flex flex-col sm:flex-row gap-6 justify-center"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.8, duration: 0.8 }}
            >
              {[
                { text: "Get Started", to: "/signup", primary: true },
                { text: "Live Demo", to: "/dashboard", primary: false },
                { text: "Contact Us", to: "/contact", primary: false },
              ].map((button, index) => (
                <motion.div
                  key={button.text}
                  whileHover={{ scale: 1.05, y: -5 }}
                  whileTap={{ scale: 0.95 }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 2 + index * 0.1 }}
                >
                  <Link
                    to={button.to}
                    className={`relative px-8 py-4 font-semibold rounded-xl transition-all duration-300 inline-block group overflow-hidden ${
                      button.primary
                        ? "bg-gradient-to-r from-neon-blue to-neon-purple text-white shadow-lg shadow-neon-blue/25"
                        : "glass-card hover:bg-white/10 border border-neon-blue/30 hover:border-neon-blue"
                    }`}
                  >
                    <span className="relative z-10">{button.text}</span>
                    {button.primary && (
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-neon-purple to-neon-blue opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                        initial={{ scale: 0 }}
                        whileHover={{ scale: 1 }}
                      />
                    )}
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <div className="w-6 h-10 border-2 border-neon-blue/50 rounded-full flex justify-center">
            <motion.div
              className="w-1 h-3 bg-neon-blue rounded-full mt-2"
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </div>
        </motion.div>
      </section>

      {/* Enhanced Feature Cards */}
      <section className="py-32 px-6 relative">
        <div className="container mx-auto">
          <motion.div
            className="text-center mb-20"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-6xl font-display font-bold mb-6 bg-gradient-to-r from-neon-blue to-neon-purple bg-clip-text text-transparent">
              Revolutionary Features
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Experience the future of customer analytics with our cutting-edge
              AI platform
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <InteractiveCard
              delay="0.2s"
              index={0}
              icon={
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="w-12 h-12"
                >
                  <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                </svg>
              }
              title="Real-time Predictions"
              description="Advanced neural networks process customer data streams instantly, delivering precise churn probability scores with unmatched accuracy."
            />

            <InteractiveCard
              delay="0.4s"
              index={1}
              icon={
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="w-12 h-12"
                >
                  <path d="M9 11H1l8-8 8 8h-8l8 8-8-8z" />
                  <circle cx="20" cy="4" r="2" />
                </svg>
              }
              title="Actionable Insights"
              description="Transform raw data into strategic intelligence with personalized intervention recommendations that drive customer retention."
            />

            <InteractiveCard
              delay="0.6s"
              index={2}
              icon={
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="w-12 h-12"
                >
                  <path d="M12 1v6l4-4M12 23v-6l4 4M20 12h-6l4-4M4 12h6L6 8" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              }
              title="Revenue Protection"
              description="Safeguard your business growth with proactive retention strategies that convert potential churners into loyal advocates."
            />
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-32 px-6 relative">
        <div className="container mx-auto text-center">
          <motion.div
            className="glass-card p-16 max-w-4xl mx-auto relative overflow-hidden"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-neon-blue/5 to-neon-purple/5" />
            <div className="relative z-10">
              <h2 className="text-4xl md:text-5xl font-display font-bold mb-6 bg-gradient-to-r from-neon-blue to-neon-purple bg-clip-text text-transparent">
                Ready to Transform Your Business?
              </h2>
              <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                Join the AI revolution and start protecting your revenue today.
                Experience the power of predictive customer intelligence.
              </p>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  to="/signup"
                  className="inline-block px-12 py-4 bg-gradient-to-r from-neon-blue to-neon-purple text-white font-bold text-lg rounded-xl hover:shadow-2xl hover:shadow-neon-blue/25 transition-all duration-300"
                >
                  Start Your Journey
                </Link>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-white/10">
        <div className="container mx-auto text-center">
          <motion.div
            className="flex items-center justify-center space-x-2 mb-4"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            <div className="w-6 h-6 rounded bg-gradient-to-br from-neon-blue to-neon-purple"></div>
            <span className="text-lg font-display font-semibold">
              Loyalty Lock
            </span>
          </motion.div>
          <p className="text-muted-foreground">
            © 2024 Loyalty Lock. All rights reserved. Powered by AI.
          </p>
        </div>
      </footer>
    </div>
  );
}
