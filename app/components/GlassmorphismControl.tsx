"use client";

import React, { useEffect } from 'react';

interface GlassmorphismControlProps {
  enabled: boolean;
}

const GlassmorphismControl: React.FC<GlassmorphismControlProps> = ({ enabled }) => {
  useEffect(() => {
    const root = document.documentElement;
    
    if (enabled) {
      // Apply glassmorphism effect with default transparency (75%)
      const alpha = 0.75;
      root.style.setProperty('--glass-bg-main', `rgba(255, 255, 255, ${alpha * 0.75})`);
      root.style.setProperty('--glass-bg-secondary', `rgba(255, 255, 255, ${alpha * 0.6})`);
      root.style.setProperty('--glass-bg-tertiary', `rgba(255, 255, 255, ${alpha * 0.4})`);
      root.style.setProperty('--glass-bg-quaternary', `rgba(255, 255, 255, ${alpha * 0.5})`);
    } else {
      // Disable glassmorphism by using solid backgrounds
      root.style.setProperty('--glass-bg-main', 'rgba(255, 255, 255, 0.95)');
      root.style.setProperty('--glass-bg-secondary', 'rgba(255, 255, 255, 0.9)');
      root.style.setProperty('--glass-bg-tertiary', 'rgba(255, 255, 255, 0.85)');
      root.style.setProperty('--glass-bg-quaternary', 'rgba(255, 255, 255, 0.9)');
    }
  }, [enabled]);

  // This component no longer renders any UI - it only applies CSS effects
  return null;
};

export default GlassmorphismControl; 