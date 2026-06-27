"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Anima um número até `target` com easing (easeOutCubic). Na primeira vez
 * sobe de 0; depois (ex.: quando um filtro muda o valor) anima a partir do
 * valor anterior, sem voltar a zero.
 *
 * Respeita prefers-reduced-motion: se o usuário pediu menos movimento, vai
 * direto ao valor final.
 */
export function useCountUp(target: number, durationMs = 1200): number {
  const [value, setValue] = useState(0);
  const fromRef = useRef(0);
  const rafRef = useRef<number>();

  useEffect(() => {
    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const from = fromRef.current;

    if (prefersReduced || from === target) {
      fromRef.current = target;
      setValue(target);
      return;
    }

    let startTs: number | null = null;
    const tick = (now: number) => {
      if (startTs === null) startTs = now;
      const progress = Math.min((now - startTs) / durationMs, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(from + (target - from) * eased));
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        fromRef.current = target;
      }
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current !== undefined) cancelAnimationFrame(rafRef.current);
    };
  }, [target, durationMs]);

  return value;
}
