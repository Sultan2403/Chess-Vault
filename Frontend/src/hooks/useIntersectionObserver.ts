import { useEffect, useRef } from "react";

interface UseIntersectionObserverOptions {
  enabled?: boolean;
  rootMargin?: string;
  threshold?: number | number[];
}

/**
 * Custom hook to detect when a DOM element enters the viewport.
 * Perfect for infinite scroll sentinel triggers without external library dependencies.
 */
export function useIntersectionObserver(
  onIntersect: () => void,
  options: UseIntersectionObserverOptions = {}
) {
  const { enabled = true, rootMargin = "300px", threshold = 0 } = options;
  const targetRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!enabled) return;

    const element = targetRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry?.isIntersecting) {
          onIntersect();
        }
      },
      {
        rootMargin,
        threshold,
      }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [enabled, onIntersect, rootMargin, threshold]);

  return targetRef;
}
