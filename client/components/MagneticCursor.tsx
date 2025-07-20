import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";

const MagneticCursor = () => {
  const cursorRef = useRef<HTMLDivElement>(null);
  const cursorInnerRef = useRef<HTMLDivElement>(null);
  const [isHovering, setIsHovering] = useState(false);
  const [cursorText, setCursorText] = useState("");
  const trailRefs = useRef<HTMLDivElement[]>([]);

  useEffect(() => {
    const cursor = cursorRef.current;
    const cursorInner = cursorInnerRef.current;
    if (!cursor || !cursorInner) return;

    let mouseX = 0;
    let mouseY = 0;
    let cursorX = 0;
    let cursorY = 0;

    const updateCursor = () => {
      // Smooth cursor movement
      cursorX += (mouseX - cursorX) * 0.1;
      cursorY += (mouseY - cursorY) * 0.1;

      gsap.set(cursor, {
        x: cursorX - 20,
        y: cursorY - 20,
      });

      gsap.set(cursorInner, {
        x: mouseX - 4,
        y: mouseY - 4,
      });

      // Update trail
      trailRefs.current.forEach((trail, index) => {
        const delay = index * 0.05;
        gsap.to(trail, {
          x: cursorX - 8 - index * 2,
          y: cursorY - 8 - index * 2,
          duration: 0.3 + delay,
          ease: "power2.out",
        });
      });

      requestAnimationFrame(updateCursor);
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };

    const handleMouseEnter = (e: MouseEvent) => {
      const target = e.target;

      // Check if target is an HTML element before proceeding
      if (!target || !(target instanceof HTMLElement)) {
        return;
      }

      const cursorData = target.getAttribute("data-cursor");

      if (target.tagName === "BUTTON" || target.tagName === "A" || cursorData) {
        setIsHovering(true);
        setCursorText(cursorData || "");

        gsap.to(cursor, {
          scale: 1.5,
          backgroundColor: "rgba(139, 69, 255, 0.3)",
          borderColor: "#8b45ff",
          duration: 0.3,
        });

        gsap.to(cursorInner, {
          scale: 0.5,
          backgroundColor: "#8b45ff",
          duration: 0.3,
        });
      }
    };

    const handleMouseLeave = () => {
      setIsHovering(false);
      setCursorText("");

      gsap.to(cursor, {
        scale: 1,
        backgroundColor: "rgba(255, 255, 255, 0.1)",
        borderColor: "rgba(255, 255, 255, 0.3)",
        duration: 0.3,
      });

      gsap.to(cursorInner, {
        scale: 1,
        backgroundColor: "#ffffff",
        duration: 0.3,
      });
    };

    const handleClick = () => {
      gsap.to(cursor, {
        scale: 0.8,
        duration: 0.1,
        yoyo: true,
        repeat: 1,
      });

      // Create click ripple effect
      const ripple = document.createElement("div");
      ripple.style.cssText = `
        position: fixed;
        left: ${mouseX - 10}px;
        top: ${mouseY - 10}px;
        width: 20px;
        height: 20px;
        border-radius: 50%;
        border: 2px solid #8b45ff;
        background: radial-gradient(circle, rgba(139, 69, 255, 0.3) 0%, transparent 70%);
        pointer-events: none;
        z-index: 10000;
      `;
      document.body.appendChild(ripple);

      gsap.to(ripple, {
        scale: 4,
        opacity: 0,
        duration: 0.6,
        ease: "power2.out",
        onComplete: () => ripple.remove(),
      });
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseenter", handleMouseEnter, true);
    document.addEventListener("mouseleave", handleMouseLeave, true);
    document.addEventListener("click", handleClick);

    requestAnimationFrame(updateCursor);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseenter", handleMouseEnter, true);
      document.removeEventListener("mouseleave", handleMouseLeave, true);
      document.removeEventListener("click", handleClick);
    };
  }, []);

  // Create trail elements
  useEffect(() => {
    const trailElements = Array.from({ length: 8 }, (_, i) => {
      const trail = document.createElement("div");
      trail.style.cssText = `
        position: fixed;
        width: 16px;
        height: 16px;
        background: radial-gradient(circle, rgba(139, 69, 255, ${0.6 - i * 0.08}) 0%, transparent 70%);
        border-radius: 50%;
        pointer-events: none;
        z-index: 9999;
        transform: translate(-50%, -50%);
      `;
      document.body.appendChild(trail);
      return trail;
    });

    trailRefs.current = trailElements;

    return () => {
      trailElements.forEach((trail) => trail.remove());
    };
  }, []);

  return (
    <>
      {/* Main cursor */}
      <div
        ref={cursorRef}
        className="fixed w-10 h-10 rounded-full border border-white/30 bg-white/10 backdrop-blur-sm pointer-events-none z-[10001] hidden md:block"
        style={{
          mixBlendMode: "difference",
        }}
      >
        {cursorText && (
          <div className="absolute top-12 left-1/2 transform -translate-x-1/2 bg-black/80 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
            {cursorText}
          </div>
        )}
      </div>

      {/* Inner cursor dot */}
      <div
        ref={cursorInnerRef}
        className="fixed w-2 h-2 rounded-full bg-white pointer-events-none z-[10002] hidden md:block"
        style={{
          mixBlendMode: "difference",
        }}
      />

      {/* Global cursor styles */}
      <style jsx global>{`
        * {
          cursor: none !important;
        }

        @media (max-width: 768px) {
          * {
            cursor: auto !important;
          }
        }
      `}</style>
    </>
  );
};

export default MagneticCursor;
