'use client';

import { useGSAP } from '@gsap/react';
import { gsap, ScrollTrigger } from '@/lib/gsap';
import type { RefObject } from 'react';
import {
  splitTextIntoWords,
  groupWordsByLine,
  type SplitResult,
  type SplitWord,
} from '@/lib/splitTextIntoWords';
import stagger from '@/lib/staggerText.module.css';
import { getRandomDirection, getDirectionTransform } from '@/lib/portalAnimation';
import styles from './Eclipse.module.css';

const SVGNS = 'http://www.w3.org/2000/svg';
const PIN_VH = 7.5; 
const CX = 600;
const CY = 350;
const R = 215; 
const RMOON = 232; 
const MASK_ID = 'wf-eclipse-mask';

const WORD_YPERCENT = 110;
const LINE_STAGGER = 0.12;
const REVEAL_DURATION = 0.7;

const NAME_STAGGER = 0.08;
const NAME_DURATION = 0.5;

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

function mk<K extends keyof SVGElementTagNameMap>(
  tag: K,
  attrs: Record<string, string | number>,
): SVGElementTagNameMap[K] {
  const el = document.createElementNS(SVGNS, tag) as SVGElementTagNameMap[K];
  for (const k in attrs) el.setAttribute(k, String(attrs[k]));
  return el;
}

interface DriverOptions {
  
  accents: string[];
  reducedMotion: boolean;
}

export function useEclipseDriver(
  sectionRef: RefObject<HTMLElement | null>,
  { accents, reducedMotion }: DriverOptions,
) {
  useGSAP(
    () => {
      const section = sectionRef.current;
      const svg = section?.querySelector<SVGSVGElement>('[data-schematic]');
      const viewport = section?.querySelector<HTMLElement>('[data-viewport]');
      if (!section || !svg || !viewport) return;

      const details = gsap.utils.toArray<HTMLElement>('[data-step]', section);
      const readout = section.querySelector<HTMLElement>('[data-readout]');
      const nameHost = section.querySelector<HTMLElement>('[data-stepname]');
      const stepNames = nameHost?.dataset.names?.split('|') ?? [];
      const N = accents.length;
      if (!N) return;
      const totalLabel = String(N).padStart(2, '0');

      svg.replaceChildren();

      const defs = mk('defs', {});
      const mask = mk('mask', { id: MASK_ID, maskUnits: 'userSpaceOnUse' });
      mask.appendChild(mk('circle', { cx: CX, cy: CY, r: R, fill: '#fff' }));
      const maskMoon = mk('circle', { cx: CX, cy: CY, r: RMOON, fill: '#000' });
      mask.appendChild(maskMoon);
      defs.appendChild(mask);
      svg.appendChild(defs);

      svg.appendChild(mk('circle', { class: styles.glow, cx: CX, cy: CY, r: R, mask: `url(#${MASK_ID})` }));
      svg.appendChild(mk('circle', { class: styles.discEdge, cx: CX, cy: CY, r: R }));
      const corona = mk('circle', { class: styles.corona, cx: CX, cy: CY, r: R + 6 });
      svg.appendChild(corona);
      const moon = mk('circle', { class: styles.moon, cx: CX, cy: CY, r: RMOON });
      svg.appendChild(moon);

      const baseGroup = mk('g', {});
      const litGroup = mk('g', { mask: `url(#${MASK_ID})` });
      svg.appendChild(baseGroup);
      svg.appendChild(litGroup);

      let activeIndex = -1;
      let cancelled = false;
      let namesBuilt = false;
      let clipUid = 0;
      type PortalLetter = { el: SVGTextElement; offX: number; offY: number };
      const nameLetters: Array<{ base: PortalLetter[]; lit: PortalLetter[] }> = [];

      const buildName = (name: string): { base: PortalLetter[]; lit: PortalLetter[] } => {
        const measure = mk('text', {
          class: styles.nameBase, x: CX, y: CY,
          'text-anchor': 'middle', 'dominant-baseline': 'middle',
        });
        measure.textContent = name;
        baseGroup.appendChild(measure);

        const geom: Array<{
          ch: string; cx: number;
          box: { x: number; y: number; w: number; h: number };
          offX: number; offY: number;
        }> = [];
        for (let c = 0; c < name.length; c++) {
          const fallbackSpacing = 46;
          const totalWidth = (name.length - 1) * fallbackSpacing;
          const startX = CX - totalWidth / 2;
          let cx = startX + c * fallbackSpacing;
          let box = { x: cx - 23, y: CY - 60, w: 46, h: 120 };
          try {
            const s = measure.getStartPositionOfChar(c);
            const e = measure.getEndPositionOfChar(c);
            cx = (s.x + e.x) / 2;
            const ext = measure.getExtentOfChar(c);
            box = { x: ext.x, y: ext.y, w: ext.width, h: ext.height };
          } catch {
            /* measurement unavailable (font not ready / detached) */
          }
          const d = getDirectionTransform(getRandomDirection(), 1.1);
          geom.push({ ch: name[c], cx, box, offX: d.x * box.w, offY: d.y * box.h });
        }
        measure.remove();

        const makeLayer = (group: SVGGElement, cls: string): PortalLetter[] =>
          geom.map((g) => {
            const clipId = `${MASK_ID}-c${clipUid++}`;
            const clip = mk('clipPath', { id: clipId, clipPathUnits: 'userSpaceOnUse' });
            clip.appendChild(mk('rect', {
              x: g.box.x - 2, y: g.box.y - 2, width: g.box.w + 4, height: g.box.h + 4,
            }));
            defs.appendChild(clip);
            const wrap = mk('g', { 'clip-path': `url(#${clipId})` });
            const t = mk('text', {
              class: cls, x: g.cx, y: CY,
              'text-anchor': 'middle', 'dominant-baseline': 'middle',
            });
            t.textContent = g.ch;
            wrap.appendChild(t);
            group.appendChild(wrap);
            return { el: t, offX: g.offX, offY: g.offY };
          });

        return {
          base: makeLayer(baseGroup, styles.nameBase),
          lit: makeLayer(litGroup, styles.nameLit),
        };
      };

      const showName = (i: number) => {
        const g = nameLetters[i];
        if (!g) return;
        g.base.forEach((bl, c) => {
          const pair = [bl.el, g.lit[c].el];
          gsap.killTweensOf(pair);
          gsap.set(pair, { x: bl.offX, y: bl.offY });
          gsap.to(pair, { x: 0, y: 0, duration: NAME_DURATION, ease: 'power2.out', delay: c * NAME_STAGGER });
        });
      };
      const hideName = (i: number) => {
        const g = nameLetters[i];
        if (!g) return;
        g.base.forEach((bl, c) => {
          const pair = [bl.el, g.lit[c].el];
          gsap.killTweensOf(pair);
          gsap.set(pair, { x: bl.offX, y: bl.offY });
        });
      };
      const buildNames = (staticAll = false) => {
        if (cancelled) return;
        for (let i = 0; i < N; i++) nameLetters[i] = buildName((stepNames[i] ?? '').toUpperCase());
        namesBuilt = true;
        if (staticAll) {
          nameLetters.forEach((g) => g.base.forEach((bl, c) => gsap.set([bl.el, g.lit[c].el], { x: 0, y: 0 })));
          return;
        }
        nameLetters.forEach((g) => g.base.forEach((bl, c) => gsap.set([bl.el, g.lit[c].el], { x: bl.offX, y: bl.offY })));
        if (activeIndex >= 0) showName(activeIndex);
      };

      const reveals: Array<{ play: () => void; reset: () => void } | null> =
        details.map(() => null);
      const setActive = (i: number) => {
        if (i === activeIndex) return;
        if (activeIndex >= 0) {
          reveals[activeIndex]?.reset();
          if (namesBuilt) hideName(activeIndex);
        }
        activeIndex = i;
        details.forEach((el, n) => el.classList.toggle(styles.isActive, n === i));
        section.style.setProperty('--wf-live-accent', accents[i] ?? accents[0]);
        if (readout) readout.innerHTML = `<em>${String(i + 1).padStart(2, '0')}</em> / ${totalLabel}`;
        if (namesBuilt) showName(i);
        reveals[i]?.play();
      };

      const render = (progress: number) => {
        const mx = lerp(582, 224, progress);
        const my = lerp(364, 68, progress);
        maskMoon.setAttribute('cx', String(mx));
        maskMoon.setAttribute('cy', String(my));
        moon.setAttribute('cx', String(mx));
        moon.setAttribute('cy', String(my));
        corona.style.opacity = String(Math.max(0, (progress - 0.82) / 0.18) * 0.9);
        setActive(Math.max(0, Math.min(N - 1, Math.floor(progress * N - 1e-6))));
      };

      if (reducedMotion) {
        maskMoon.setAttribute('cx', '-400');
        maskMoon.setAttribute('cy', '-400');
        moon.style.opacity = '0';
        corona.style.opacity = '0.9';
        details.forEach((el) => el.classList.add(styles.isActive));
        section.style.setProperty('--wf-live-accent', accents[N - 1] ?? accents[0]);
        if (readout) readout.innerHTML = `<em>${totalLabel}</em> / ${totalLabel}`;
        const ready = document.fonts?.ready ?? Promise.resolve();
        ready.then(() => buildNames(true));
        return () => {
          cancelled = true;
          svg.replaceChildren();
        };
      }

      const trigger = ScrollTrigger.create({
        trigger: section,
        start: 'top top',
        end: () => '+=' + window.innerHeight * PIN_VH,
        pin: viewport,
        pinType: 'fixed',
        scrub: 1,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        onUpdate: (self) => render(self.progress),
        onRefresh: (self) => render(self.progress),
      });
      render(trigger.progress);

      const splits: SplitResult[] = [];
      const buildReveals = () => {
        if (cancelled) return;
        details.forEach((el, idx) => {
          const roots = [
            el.querySelector<HTMLElement>(`.${styles.detailTitle}`),
            el.querySelector<HTMLElement>(`.${styles.detailCopy}`),
          ].filter(Boolean) as HTMLElement[];
          const words: SplitWord[] = [];
          roots.forEach((root) => {
            const split = splitTextIntoWords(root, stagger.word, stagger.wordInner);
            splits.push(split);
            words.push(...split.words);
          });
          if (!words.length) return;
          gsap.set(words.map((w) => w.inner), { yPercent: WORD_YPERCENT });
          const tl = gsap.timeline({ paused: true });
          groupWordsByLine(words).forEach((line, li) => {
            tl.to(line, { yPercent: 0, duration: REVEAL_DURATION, ease: 'power2.out' }, li * LINE_STAGGER);
          });
          reveals[idx] = { play: () => tl.restart(), reset: () => tl.pause(0) };
        });
        if (activeIndex >= 0) reveals[activeIndex]?.play();
      };
      const fontsReady = document.fonts?.ready ?? Promise.resolve();
      fontsReady.then(() => {
        buildNames();
        buildReveals();
      });

      return () => {
        cancelled = true;
        const y = window.scrollY;
        trigger.kill();
        window.scrollTo(0, y);
        splits.forEach((s) => s.revert());
        svg.replaceChildren();
      };
    },
    { scope: sectionRef, dependencies: [reducedMotion] },
  );
}
