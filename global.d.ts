declare module '*.module.css' {
  const classes: { readonly [key: string]: string };
  export default classes;
}

import Lenis from 'lenis';
import type { gsap } from 'gsap';
import type { ScrollTrigger } from 'gsap/ScrollTrigger';

declare global {
  interface Window {
    __freshLoad?: boolean;
    __welcomeComplete?: boolean;
    __welcomeHandoff?: boolean;
    lenis?: Lenis;
    gsap?: typeof gsap;
    ScrollTrigger?: typeof ScrollTrigger;
  }
}

export { };

