'use client';
import React, { useState, useEffect } from 'react';

export const ReadingRuler = ({ isActive }: { isActive: boolean }) => {
  const [mouseY, setMouseY] = useState(0);

  useEffect(() => {
    if (!isActive) return;

    const handleMouseMove = (e: MouseEvent) => {
      setMouseY(e.clientY);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [isActive]);

  if (!isActive) return null;

  return (
    <div
      className="fixed left-0 w-full h-16 bg-blue-400/10 border-y-[3px] border-blue-500/30 pointer-events-none z-50 transition-transform duration-75 ease-out backdrop-blur-[1px]"
      style={{ transform: `translateY(${mouseY - 32}px)` }}
      aria-hidden="true"
    />
  );
};
