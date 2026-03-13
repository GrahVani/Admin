"use client";

import { useState, useEffect } from "react";

/**
 * Hook to detect media query matches
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    
    const updateMatch = () => setMatches(media.matches);
    updateMatch();
    
    media.addEventListener("change", updateMatch);
    return () => media.removeEventListener("change", updateMatch);
  }, [query]);

  return matches;
}

/**
 * Predefined breakpoints
 */
export const breakpoints = {
  sm: "(max-width: 640px)",
  md: "(max-width: 768px)",
  lg: "(max-width: 1024px)",
  xl: "(max-width: 1280px)",
  "2xl": "(max-width: 1536px)",
};

/**
 * Hook for mobile detection
 */
export function useIsMobile(): boolean {
  return useMediaQuery(breakpoints.md);
}

/**
 * Hook for tablet detection
 */
export function useIsTablet(): boolean {
  const isMd = useMediaQuery(breakpoints.md);
  const isLg = useMediaQuery(breakpoints.lg);
  return isLg && !isMd;
}

/**
 * Hook for desktop detection
 */
export function useIsDesktop(): boolean {
  return !useMediaQuery(breakpoints.lg);
}
