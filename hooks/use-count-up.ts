"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Anima um número de 0 até `target` com easing (easeOutCubic).
 * Respeita prefers-reduced-motion: se o usuário pediu menos movimento, vai
 * direto ao valor final sem animar.
 */
export function useCountUp(target: number, durationMs = 1200): number {
  const [value, setValue] = useState(0);
  const rafRef = useRef<number>();

  useEffect(() => {
    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (prefersReduced) {
      setValue(target);
      return;
    }

    let startTs: number | null = null;
    const tick = (now: number) => {
      if (startTs === null) startTs = now;
      const progress = Math.min((now - startTs) / durationMs, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(target * eased));
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(tick);
      }
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current !== undefined) cancelAnimationFrame(rafRef.current);
    };
  }, [target, durationMs]);

  return value;
}
