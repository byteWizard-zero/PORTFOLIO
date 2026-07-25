import { gsap } from '@/lib/gsap';
import {
  BW_IN_DUR,
  BW_IN_STAGGER,
  BW_OUT_DUR,
  BW_OUT_STAGGER,
  LEDE_IN_DUR,
  LEDE_IN_LINE_STAGGER,
  LEDE_OUT_DUR,
  LEDE_OUT_LINE_STAGGER,
  SWAP_OVERLAP,
} from './constants';

const DIRECTIONS = ['up', 'down', 'left', 'right'] as const;
type Direction = (typeof DIRECTIONS)[number];

const randomDirection = (): Direction =>
  DIRECTIONS[Math.floor(Math.random() * DIRECTIONS.length)];

const PORTAL_DIST = 110;

const directionOffset = (dir: Direction, distance = PORTAL_DIST) => {
  switch (dir) {
    case 'up':
      return { x: 0, y: -distance };
    case 'down':
      return { x: 0, y: distance };
    case 'left':
      return { x: -distance, y: 0 };
    case 'right':
      return { x: distance, y: 0 };
  }
};

type SplitClassNames = {
  
  readonly letterMask: string;
  
  readonly letterInner: string;
  
  readonly accent: string;
};

export function splitBigWord(
  word: string,
  container: HTMLElement,
  cls: SplitClassNames,
): HTMLSpanElement[] {
  container.innerHTML = '';
  const letters: HTMLSpanElement[] = [];

  for (const ch of word) {
    const mask = document.createElement('span');
    mask.className = cls.letterMask;
    if (ch === ' ') {
      mask.innerHTML = '&nbsp;';
      container.appendChild(mask);
      continue;
    }
    const inner = document.createElement('span');
    inner.className = ch === '.' ? `${cls.letterInner} ${cls.accent}` : cls.letterInner;
    inner.textContent = ch;
    mask.appendChild(inner);
    container.appendChild(mask);
    letters.push(inner);
  }
  return letters;
}

type LedeClassNames = {
  readonly ledeWord: string;
  readonly ledeWordInner: string;
  
  readonly ledeBold: string;
};

const LEDE_TAG_ALLOWLIST = /<\/?(?!(?:b|strong)\b)[a-z][^>]*>/gi;
function sanitizeLedeHtml(html: string): string {
  return html.replace(LEDE_TAG_ALLOWLIST, '');
}

export function splitLede(
  html: string,
  container: HTMLElement,
  cls: LedeClassNames,
): HTMLSpanElement[] {
  container.innerHTML = '';
  const inners: HTMLSpanElement[] = [];
  const scratch = document.createElement('div');
  scratch.innerHTML = sanitizeLedeHtml(html);

  const walk = (src: Node, target: HTMLElement, bold: boolean) => {
    if (src.nodeType === Node.TEXT_NODE) {
      const parts = (src.textContent ?? '').split(/(\s+)/);
      for (const part of parts) {
        if (!part) continue;
        if (/^\s+$/.test(part)) {
          target.appendChild(document.createTextNode(part));
          continue;
        }
        const mask = document.createElement('span');
        mask.className = cls.ledeWord;
        const inner = document.createElement('span');
        inner.className = bold ? `${cls.ledeWordInner} ${cls.ledeBold}` : cls.ledeWordInner;
        inner.textContent = part;
        mask.appendChild(inner);
        target.appendChild(mask);
        inners.push(inner);
      }
      return;
    }
    if (src.nodeType === Node.ELEMENT_NODE) {
      const el = src as HTMLElement;
      const isBold = el.tagName === 'B' || el.tagName === 'STRONG';
      el.childNodes.forEach((child) => walk(child, target, bold || isBold));
    }
  };
  scratch.childNodes.forEach((n) => walk(n, container, false));
  return inners;
}

function groupByLine(inners: HTMLSpanElement[]): HTMLSpanElement[][] {
  const tops: Array<number | null> = inners.map((inner) => {
    const parent = inner.parentElement;
    return parent ? Math.round(parent.offsetTop) : null;
  });
  const map = new Map<number, HTMLSpanElement[]>();
  inners.forEach((inner, i) => {
    const key = tops[i];
    if (key === null) return;
    let bucket = map.get(key);
    if (!bucket) {
      bucket = [];
      map.set(key, bucket);
    }
    bucket.push(inner);
  });
  return [...map.entries()]
    .sort(([a], [b]) => a - b)
    .map(([, group]) => group);
}

export function ledeRevealIn(container: HTMLElement, ledeWordInner: string): number {
  const inners = [
    ...container.querySelectorAll<HTMLSpanElement>(`.${ledeWordInner}`),
  ];
  if (!inners.length) return 0;
  const groups = groupByLine(inners);
  groups.forEach((group, lineIdx) => {
    gsap.from(group, {
      yPercent: 110,
      duration: LEDE_IN_DUR,
      delay: lineIdx * LEDE_IN_LINE_STAGGER,
      ease: 'power2.out',
      immediateRender: true,
    });
  });
  return LEDE_IN_DUR + (groups.length - 1) * LEDE_IN_LINE_STAGGER;
}

export function ledeRevealOut(container: HTMLElement, ledeWordInner: string): number {
  const inners = [
    ...container.querySelectorAll<HTMLSpanElement>(`.${ledeWordInner}`),
  ];
  if (!inners.length) return 0;
  const groups = groupByLine(inners);
  groups.forEach((group, lineIdx) => {
    gsap.to(group, {
      yPercent: -110,
      duration: LEDE_OUT_DUR,
      delay: lineIdx * LEDE_OUT_LINE_STAGGER,
      ease: 'power2.in',
    });
  });
  return LEDE_OUT_DUR + (groups.length - 1) * LEDE_OUT_LINE_STAGGER;
}

export function portalBigWordIn(letters: HTMLSpanElement[]): number {
  letters.forEach((el, i) => {
    const start = directionOffset(randomDirection());
    gsap.set(el, { x: `${start.x}%`, y: `${start.y}%` });
    gsap.to(el, {
      x: '0%',
      y: '0%',
      duration: BW_IN_DUR,
      delay: i * BW_IN_STAGGER,
      ease: 'power2.out',
    });
  });
  return letters.length ? (letters.length - 1) * BW_IN_STAGGER + BW_IN_DUR : 0;
}

export function portalBigWordOut(letters: HTMLSpanElement[]): number {
  letters.forEach((el, i) => {
    const off = directionOffset(randomDirection());
    gsap.to(el, {
      x: `${off.x}%`,
      y: `${off.y}%`,
      duration: BW_OUT_DUR,
      delay: i * BW_OUT_STAGGER,
      ease: 'power2.in',
    });
  });
  return letters.length ? (letters.length - 1) * BW_OUT_STAGGER + BW_OUT_DUR : 0;
}

export function computeSwapTiming(bwOutEnd: number, ledeOutEnd: number) {
  return {
    swapAt: Math.max(0, Math.max(bwOutEnd, ledeOutEnd) - SWAP_OVERLAP),
  };
}
