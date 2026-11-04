import { useEffect, useState, useSyncExternalStore, type RefObject } from 'react';

const reducedQuery = '(prefers-reduced-motion: reduce)';

/** True when the visitor asked for less motion. False during SSR. */
export function useReducedMotion(): boolean {
  return useSyncExternalStore(
    (onChange) => {
      const query = window.matchMedia(reducedQuery);
      query.addEventListener('change', onChange);
      return () => query.removeEventListener('change', onChange);
    },
    () => window.matchMedia(reducedQuery).matches,
    () => false
  );
}

/** True while the element is on screen. Use it to pause animation loops. */
export function useInView(
  ref: RefObject<Element | null>,
  rootMargin = '0px'
): boolean {
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const observer = new IntersectionObserver(
      ([entry]) => setInView(Boolean(entry?.isIntersecting)),
      { rootMargin }
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [ref, rootMargin]);
  return inView;
}

/** Fine pointer with hover: desktop mice and trackpads, not touch screens. */
export function useFinePointer(): boolean {
  return useSyncExternalStore(
    (onChange) => {
      const query = window.matchMedia('(hover: hover) and (pointer: fine)');
      query.addEventListener('change', onChange);
      return () => query.removeEventListener('change', onChange);
    },
    () => window.matchMedia('(hover: hover) and (pointer: fine)').matches,
    () => false
  );
}
