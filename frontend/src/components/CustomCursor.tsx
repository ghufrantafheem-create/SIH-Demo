import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export const CustomCursor: React.FC = () => {
  const [mousePosition, setMousePosition] = useState({ x: -100, y: -100 });
  const [isHovered, setIsHovered] = useState(false);
  const [isClicked, setIsClicked] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (window.matchMedia('(pointer: coarse)').matches) return;

    document.body.classList.add('custom-cursor-active');

    const onMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
      if (!isVisible) setIsVisible(true);

      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'A' ||
          target.tagName === 'BUTTON' ||
          target.tagName === 'SELECT' ||
          target.tagName === 'INPUT' ||
          target.closest('button') ||
          target.closest('a') ||
          target.getAttribute('role') === 'button' ||
          target.classList.contains('interactive-hover'))
      ) {
        setIsHovered(true);
      } else {
        setIsHovered(false);
      }
    };

    const onMouseDown = () => setIsClicked(true);
    const onMouseUp = () => setIsClicked(false);
    const onMouseLeave = () => setIsVisible(false);
    const onMouseEnter = () => setIsVisible(true);

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mouseup', onMouseUp);
    document.addEventListener('mouseleave', onMouseLeave);
    document.addEventListener('mouseenter', onMouseEnter);

    return () => {
      document.body.classList.remove('custom-cursor-active');
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mouseup', onMouseUp);
      document.removeEventListener('mouseleave', onMouseLeave);
      document.removeEventListener('mouseenter', onMouseEnter);
    };
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <>
      {/* Precision Oil Droplet & Drill Tip Core */}
      <motion.div
        className="fixed top-0 left-0 w-4 h-4 pointer-events-none z-50 flex items-center justify-center"
        animate={{
          x: mousePosition.x - 8,
          y: mousePosition.y - 8,
          scale: isClicked ? 0.6 : isHovered ? 1.5 : 1,
          opacity: isVisible ? 1 : 0
        }}
        transition={{ type: 'spring', damping: 32, stiffness: 450, mass: 0.1 }}
      >
        <svg viewBox="0 0 24 24" className="w-full h-full drop-shadow-[0_0_8px_#00e5ff]">
          {/* Oil Droplet Tip Shape */}
          <path
            d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"
            fill="#00e5ff"
            stroke="#ffab00"
            strokeWidth="1.5"
          />
        </svg>
      </motion.div>

      {/* Rotating Industrial Gear & Telemetry Compass Reticle */}
      <motion.div
        className="fixed top-0 left-0 w-11 h-11 border-2 border-dashed border-cyan-400/60 rounded-full pointer-events-none z-50 flex items-center justify-center"
        style={{
          backgroundColor: isHovered ? 'rgba(0, 229, 255, 0.08)' : 'transparent',
          boxShadow: isHovered ? '0 0 20px rgba(0, 229, 255, 0.3)' : 'none'
        }}
        animate={{
          x: mousePosition.x - 22,
          y: mousePosition.y - 22,
          scale: isClicked ? 1.4 : isHovered ? 2.2 : 1,
          rotate: isHovered ? 90 : 0
        }}
        transition={{ type: 'spring', damping: 24, stiffness: 200, mass: 0.2 }}
      >
        {/* Reticle Tick Mark Accents */}
        <div className="absolute w-1.5 h-[2px] bg-amber-400 -left-1" />
        <div className="absolute w-1.5 h-[2px] bg-amber-400 -right-1" />
        <div className="absolute h-1.5 w-[2px] bg-cyan-400 -top-1" />
        <div className="absolute h-1.5 w-[2px] bg-cyan-400 -bottom-1" />
      </motion.div>
    </>
  );
};
