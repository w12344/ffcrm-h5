import { useState, useEffect, useCallback } from 'react';

export type ScaleCurve = 'S' | 'M' | 'L';

interface UseBubbleFontScaleProps {
  curve?: ScaleCurve;
  minFontSize?: number;
  maxFontSize?: number;
}

export const calculateFontSize = (
  containerWidth: number,
  bubbleDiameterVW: number,
  curve: ScaleCurve,
  minFontSize: number,
  maxFontSize: number
): number => {
  // Calculate absolute pixel diameter of the bubble
  const diameterPx = (bubbleDiameterVW / 100) * containerWidth;
  
  // Define base scaling factors for different curves
  // These represent the ratio of font size to bubble diameter
  let scaleFactor = 0.15; // default M
  if (curve === 'S') scaleFactor = 0.12;
  if (curve === 'L') scaleFactor = 0.18;

  // Calculate raw font size
  let calculatedSize = diameterPx * scaleFactor;

  // Apply non-linear adjustment for very small or very large bubbles to ensure readability
  // For small bubbles, we bump the size up slightly
  if (diameterPx < 100) {
    calculatedSize = calculatedSize * 1.2;
  }
  
  // Clamp between min and max
  return Math.max(minFontSize, Math.min(calculatedSize, maxFontSize));
};

export const useBubbleFontScale = ({
  curve = 'M',
  minFontSize = 12,
  maxFontSize = 32
}: UseBubbleFontScaleProps = {}) => {
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1920);

  const handleResize = useCallback(() => {
    setWindowWidth(window.innerWidth);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    // Initial call
    handleResize();

    // Debounce resize event to avoid performance issues
    let timeoutId: NodeJS.Timeout;
    const debouncedResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(handleResize, 100);
    };

    window.addEventListener('resize', debouncedResize);
    
    // Also set up MutationObserver if container size changes without window resize
    const container = document.querySelector('.jx-galaxies-wrapper');
    let observer: ResizeObserver | null = null;
    
    if (container && window.ResizeObserver) {
      observer = new ResizeObserver((entries) => {
        for (let entry of entries) {
          if (entry.contentRect) {
            setWindowWidth(entry.contentRect.width);
          }
        }
      });
      observer.observe(container);
    }

    return () => {
      window.removeEventListener('resize', debouncedResize);
      if (observer) {
        observer.disconnect();
      }
    };
  }, [handleResize]);

  // Return a function that components can call with their specific vw diameter
  const getFontSize = useCallback((bubbleDiameterVW: number) => {
    return calculateFontSize(windowWidth, bubbleDiameterVW, curve, minFontSize, maxFontSize);
  }, [windowWidth, curve, minFontSize, maxFontSize]);

  return { getFontSize, windowWidth };
};
