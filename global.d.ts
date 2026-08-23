declare module '*.module.css' {
  const classes: { readonly [key: string]: string };
  export default classes;
}

import Lenis from 'lenis';

declare global {
  interface Window {
    __freshLoad?: boolean;
    __welcomeComplete?: boolean;
    __welcomeHandoff?: boolean;
    lenis?: Lenis;
  }
}

export { };

