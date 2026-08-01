'use client';

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import animationConfig from "@/data/animation-config.json";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
  gsap.defaults({
    ease: "power3.out",
    duration: animationConfig.durations.slow,
  });
}

export { gsap, ScrollTrigger };

export const ANIMATION_CONFIG = {
  duration: animationConfig.durations,
  ease: animationConfig.easing.gsap,
  stagger: animationConfig.stagger,
  delays: animationConfig.delays,
} as const;
