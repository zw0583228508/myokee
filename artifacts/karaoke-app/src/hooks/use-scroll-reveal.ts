import { useEffect, useRef } from "react";

const REVEAL_SELECTOR = ".ds-reveal, .ds-reveal-scale, .reveal-on-scroll";

export function useScrollReveal(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
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

    return () => {
      observer.disconnect();
      mutationObserver.disconnect();
    };
  }, [threshold]);

  return ref;
}
