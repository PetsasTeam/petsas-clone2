"use client";

import { useEffect, useRef } from 'react';

export function useRevealOnScroll<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new window.IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          node.classList.add('visible');
          observer.disconnect();
        }
      },
      { threshold: 0.15 }
    );
    node.classList.add('reveal');
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return ref;
} 