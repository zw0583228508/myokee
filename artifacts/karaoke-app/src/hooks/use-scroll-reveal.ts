import { useCallback, useRef } from "react";

const REVEAL_SELECTOR = ".ds-reveal, .ds-reveal-scale, .reveal-on-scroll";

/**
 * Scroll-reveal hook.
 *
 * Returns a CALLBACK ref — this is critical: pages like JobDetails first
 * render a loading state without the container, so an effect that runs only
 * on mount never sees the element and every `.ds-reveal` child stays at
 * opacity 0 forever (blank page). A callback ref runs whenever the real
 * container actually mounts, no matter how late.
 */
export function useScrollReveal(threshold = 0.15) {
  const cleanupRef = useRef<(() => void) | null>(null);

  return useCallback(
    (el: HTMLDivElement | null) => {
      // Tear down observers from a previous container.
      if (cleanupRef.current) {
        cleanupRef.current();
        cleanupRef.current = null;
      }
      if (!el) return;

      // Respect reduced-motion: reveal everything immediately, no observers.
      const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (prefersReduced) {
        el.querySelectorAll(REVEAL_SELECTOR).forEach((child) => child.classList.add("revealed"));
        return;
      }

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add("revealed");
              observer.unobserve(entry.target);
            }
          });
        },
        { threshold, rootMargin: "0px 0px -40px 0px" }
      );

      const observeAll = () => {
        el.querySelectorAll(REVEAL_SELECTOR).forEach((child) => {
          if (!child.classList.contains("revealed")) observer.observe(child);
        });
      };

      observeAll();

      // Watch for content rendered later (async data, tab switches, etc.)
      // so it also gets observed instead of staying invisible.
      const mutationObserver = new MutationObserver(() => observeAll());
      mutationObserver.observe(el, { childList: true, subtree: true });

      cleanupRef.current = () => {
        observer.disconnect();
        mutationObserver.disconnect();
      };
    },
    [threshold]
  );
}
