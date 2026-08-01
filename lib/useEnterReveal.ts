'use client';

import { useGSAP } from "@gsap/react";
import { type RefObject } from "react";
import { gsap } from "@/lib/gsap";

type RevealSpec = {
  
  selector: string;
  
  from: gsap.TweenVars;
  
  innerSelector?: string;
  innerFrom?: gsap.TweenVars;
  duration?: number;
  
  stagger?: number;
  ease?: string;
  
  rootMargin?: string;
};

const REST: gsap.TweenVars = {
  opacity: 1,
  autoAlpha: 1,
  scale: 1,
  x: 0,
  y: 0,
  xPercent: 0,
  yPercent: 0,
  rotation: 0,
};

function restFor(from: gsap.TweenVars): gsap.TweenVars {
  const to: gsap.TweenVars = {};
  for (const key of Object.keys(from)) {
    if (key in REST) to[key] = REST[key as keyof gsap.TweenVars];
  }
  return to;
}

import { useTransition } from "@/components/transitions";

export function useEnterReveal(
  scope: RefObject<HTMLElement | null>,
  specs: RevealSpec[],
) {
  const { hasEntered } = useTransition();

  useGSAP(
    () => {
      if (!hasEntered) return;
      const root = scope.current;
      if (!root) return;

      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const observers: IntersectionObserver[] = [];
        const tweens: gsap.core.Tween[] = [];

        specs.forEach(
          ({
            selector,
            from,
            innerSelector,
            innerFrom,
            duration = 0.55,
            stagger = 0.06,
            ease = "power3.out",
            rootMargin = "0px 0px -10% 0px",
          }) => {
            const els = gsap.utils.toArray<HTMLElement>(selector, root);
            if (!els.length) return;

            const to = restFor(from);
            const innerOf = (el: HTMLElement) =>
              innerSelector
                ? el.querySelector<HTMLElement>(innerSelector)
                : null;
            const innerTo = innerFrom ? restFor(innerFrom) : null;

            gsap.set(els, from);
            if (innerFrom) {
              const inners = els.map(innerOf).filter(Boolean) as HTMLElement[];
              if (inners.length) gsap.set(inners, innerFrom);
            }

            const groupByEl = new Map<Element, HTMLElement[]>();
            const rows = new Map<number, HTMLElement[]>();
            els.forEach((el) => {
              const key = Math.round(el.getBoundingClientRect().top);
              if (!rows.has(key)) rows.set(key, []);
              rows.get(key)!.push(el);
            });
            rows.forEach((group) =>
              group.forEach((el) => groupByEl.set(el, group)),
            );

            const played = new WeakSet<Element>();

            const io = new IntersectionObserver(
              (entries) => {
                entries.forEach((entry) => {
                  if (!entry.isIntersecting) return;
                  const group = groupByEl.get(entry.target) ?? [
                    entry.target as HTMLElement,
                  ];
                  const fresh = group.filter((el) => !played.has(el));
                  if (!fresh.length) return;

                  fresh.forEach((el) => {
                    played.add(el);
                    io.unobserve(el);
                  });
                  tweens.push(
                    gsap.to(fresh, { ...to, duration, ease, stagger }),
                  );
                  if (innerTo) {
                    const inners = fresh
                      .map(innerOf)
                      .filter(Boolean) as HTMLElement[];
                    if (inners.length) {
                      tweens.push(
                        gsap.to(inners, { ...innerTo, duration, ease, stagger }),
                      );
                    }
                  }
                });
              },
              { root: null, rootMargin, threshold: 0 },
            );

            els.forEach((el) => io.observe(el));
            observers.push(io);
          },
        );

        return () => {
          observers.forEach((o) => o.disconnect());
          tweens.forEach((t) => t.kill());
          specs.forEach(({ selector, innerSelector }) => {
            const els = gsap.utils.toArray<HTMLElement>(selector, root);
            if (els.length) gsap.set(els, { clearProps: "all" });
            if (innerSelector) {
              const inners = els.map((el) => el.querySelector<HTMLElement>(innerSelector)).filter(Boolean);
              if (inners.length) gsap.set(inners, { clearProps: "all" });
            }
          });
        };
      });

      return () => {
        mm.revert();
      };
    },
    { scope, dependencies: [hasEntered, specs] },
  );
}
