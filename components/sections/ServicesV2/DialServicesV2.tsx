'use client';

import { useRef, type CSSProperties } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap, ScrollTrigger } from '@/lib/gsap';
import { content } from '@/data';
import { MetaLabel } from '@/components/ui/MetaLabel';
import { Star } from '@/components/ui/Star';
import {
  BAR_MAX_FRACTION,
  BAR_MIN_SCALE,
  BAR_OPACITY_MIN,
  BAR_OPACITY_RANGE,
  DIAL_WEIGHT_MAX,
  DIAL_WEIGHT_MIN,
  GAP_PX,
  HEADING_ID,
  LABEL_RIDE_GAP_PX,
  LABEL_SCALE_MAX,
  LABEL_SCALE_MIN,
  NEEDLE_FALLOFF,
  PIN_RUNWAY_REF_PX,
  PIN_RUNWAY_TALL_REF_PX,
  PIN_RUNWAY_VH,
  PIN_SCRUB,
  TOOL_OPACITY_MIN,
  TOOL_OPACITY_RANGE,
  ZONES,
  formatZoneIndex,
  zoneRail,
} from './constants';
import {
  buildCells,
  countRealCells,
  indexAtNeedle,
  isZoneBoundary,
  tunedAt,
} from './dialBuild';
import {
  computeSwapTiming,
  ledeRevealIn,
  ledeRevealOut,
  portalBigWordIn,
  portalBigWordOut,
  splitBigWord,
  splitLede,
} from './dialMotion';
import styles from './ServicesV2.module.css';

const ZONE_INDICATOR_WIDTH = `${100 / Math.max(1, ZONES.length)}%`;

export function DialServicesV2() {
  const wrapperRef = useRef<HTMLElement>(null);
  const shellRef = useRef<HTMLDivElement>(null);
  const pinRef = useRef<HTMLDivElement>(null);
  const dialwrapRef = useRef<HTMLDivElement>(null);
  const dialStripRef = useRef<HTMLDivElement>(null);
  const notchesRef = useRef<HTMLDivElement>(null);
  const bigwordRef = useRef<HTMLHeadingElement>(null);
  const ledeRef = useRef<HTMLParagraphElement>(null);
  const zoneIndicatorRef = useRef<HTMLDivElement>(null);
  const zoneRefs = useRef<Array<HTMLDivElement | null>>(Array(ZONES.length).fill(null));
  const liveRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const shellEl = shellRef.current;
      const pinEl = pinRef.current;
      const dialwrapEl = dialwrapRef.current;
      const dialStripEl = dialStripRef.current;
      const notchesEl = notchesRef.current;
      const bigwordEl = bigwordRef.current;
      const ledeEl = ledeRef.current;
      const indicatorEl = zoneIndicatorRef.current;
      if (
        !shellEl ||
        !pinEl ||
        !dialwrapEl ||
        !dialStripEl ||
        !notchesEl ||
        !bigwordEl ||
        !ledeEl ||
        !indicatorEl
      ) {
        return;
      }

      const splitCls = {
        letterMask: styles.letterMask,
        letterInner: styles.letterInner,
        accent: styles.accent,
      };
      const ledeCls = {
        ledeWord: styles.ledeWord,
        ledeWordInner: styles.ledeWordInner,
        ledeBold: styles.ledeBold,
      };

      const cells = buildCells(ZONES);
      
      const realCount = countRealCells(cells);

      const toolEls: Array<HTMLSpanElement | null> = [];
      
      const barEls: Array<HTMLSpanElement | null> = [];
      cells.forEach((cell, i) => {
        const cellEl = document.createElement('div');
        cellEl.className = styles.dialCell;
        if (!cell.isPad) {
          const tool = document.createElement('span');
          tool.className = styles.dialTool;
          tool.textContent = cell.name;
          cellEl.appendChild(tool);
          toolEls.push(tool);

          const bar = document.createElement('span');
          bar.className = styles.dialBar;
          cellEl.appendChild(bar);
          barEls.push(bar);
        } else {
          toolEls.push(null);
          barEls.push(null);
        }
        dialStripEl.appendChild(cellEl);

        const notchEl = document.createElement('div');
        notchEl.className = styles.notch;
        if (isZoneBoundary(cells, i)) {
          notchEl.classList.add(styles.notchMajor);
        }
        notchesEl.appendChild(notchEl);
      });

      const lastBarScaleQ = new Array<number>(cells.length).fill(NaN);
      const lastBarOpacityQ = new Array<number>(cells.length).fill(NaN);
      const lastToolOpacityQ = new Array<number>(cells.length).fill(NaN);
      const lastToolTranslateQ = new Array<number>(cells.length).fill(NaN);
      const lastToolScaleQ = new Array<number>(cells.length).fill(NaN);
      
      const lastToolWeight = new Array<number>(cells.length).fill(NaN);
      
      const OPACITY_Q = 1000;
      const SCALE_Q = 1000;

      let centerOffset = dialwrapEl.getBoundingClientRect().width / 2;
      
      let bandHeight = dialwrapEl.getBoundingClientRect().height;
      const wrapObserver = new ResizeObserver((entries) => {
        const entry = entries[0];
        if (!entry) return;
        centerOffset = entry.contentRect.width / 2;
        bandHeight = entry.contentRect.height;
      });
      wrapObserver.observe(dialwrapEl);

      dialStripEl.style.setProperty('--bar-max-fraction', String(BAR_MAX_FRACTION));

      const pendingDelays = new Set<gsap.core.Tween>();
      const trackDelay = (delay: gsap.core.Tween): gsap.core.Tween => {
        pendingDelays.add(delay);
        return delay;
      };

      let zoneAnimating = false;
      let pendingZoneIdx: number | null = null;
      
      let inFlightZoneIdx: number | null = null;

      let liveTimeoutId: number | null = null;
      const ANNOUNCE_DEBOUNCE_MS = 350;
      const announceZone = (zoneIdx: number) => {
        if (liveTimeoutId !== null) window.clearTimeout(liveTimeoutId);
        liveTimeoutId = window.setTimeout(() => {
          liveTimeoutId = null;
          if (!liveRef.current) return;
          const zone = ZONES[zoneIdx];
          liveRef.current.textContent = `Showing zone ${zoneIdx + 1} of ${ZONES.length}: ${zoneRail(zone)}.`;
        }, ANNOUNCE_DEBOUNCE_MS);
      };

      const paintZoneAffordances = (zoneIdx: number) => {
        const refs = zoneRefs.current;
        for (let j = 0; j < refs.length; j++) {
          const el = refs[j];
          if (!el) continue;
          el.classList.toggle(styles.zoneActive, j === zoneIdx);
        }
        indicatorEl.style.transform = `translateX(${zoneIdx * 100}%)`;
        announceZone(zoneIdx);
      };

      const transitionZone = (zoneIdx: number) => {
        
        paintZoneAffordances(zoneIdx);

        if (zoneAnimating) {
          pendingZoneIdx = zoneIdx;
          return;
        }
        zoneAnimating = true;
        inFlightZoneIdx = zoneIdx;
        const zone = ZONES[zoneIdx];

        const bwOutEnd = portalBigWordOut(
          [...bigwordEl.querySelectorAll<HTMLSpanElement>(`.${styles.letterInner}`)],
        );
        const ledeOutEnd = ledeRevealOut(ledeEl, styles.ledeWordInner);
        const { swapAt } = computeSwapTiming(bwOutEnd, ledeOutEnd);

        const swapDelay = trackDelay(
          gsap.delayedCall(swapAt, () => {
            pendingDelays.delete(swapDelay);

            const prevLetters = [
              ...bigwordEl.querySelectorAll<HTMLSpanElement>(`.${styles.letterInner}`),
            ];
            const prevLedeInners = [
              ...ledeEl.querySelectorAll<HTMLSpanElement>(`.${styles.ledeWordInner}`),
            ];
            if (prevLetters.length || prevLedeInners.length) {
              gsap.killTweensOf([...prevLetters, ...prevLedeInners]);
            }

            const newLetters = splitBigWord(zone.word, bigwordEl, splitCls);
            
            bigwordEl.dataset.zone = String(zoneIdx);
            const bwInEnd = portalBigWordIn(newLetters);

            splitLede(zone.copy, ledeEl, ledeCls);
            const ledeInEnd = ledeRevealIn(ledeEl, styles.ledeWordInner);

            const endDelay = trackDelay(
              gsap.delayedCall(Math.max(bwInEnd, ledeInEnd), () => {
                pendingDelays.delete(endDelay);
                zoneAnimating = false;
                inFlightZoneIdx = null;
                
                const displayed = Number(bigwordEl.dataset.zone);
                const next = pendingZoneIdx ?? displayed;
                pendingZoneIdx = null;
                if (next !== displayed) transitionZone(next);
              }),
            );
          }),
        );
      };

      const applyDial = (progress: number) => {
        const idxFloat = indexAtNeedle(progress, realCount);
        const x = centerOffset - (idxFloat + 0.5) * GAP_PX;
        gsap.set([dialStripEl, notchesEl], { x });

        for (let i = 0; i < cells.length; i++) {
          const el = toolEls[i];
          if (!el) continue;
          const dist = Math.abs(i - idxFloat);
          const t = Math.max(0, 1 - dist / NEEDLE_FALLOFF);
          
          const eased = t * t * (3 - 2 * t);
          const s = BAR_MIN_SCALE + (1 - BAR_MIN_SCALE) * eased;

          const bar = barEls[i];
          if (bar) {
            const barScaleQ = Math.round(s * SCALE_Q);
            if (barScaleQ !== lastBarScaleQ[i]) {
              lastBarScaleQ[i] = barScaleQ;
              bar.style.transform = `scaleY(${barScaleQ / SCALE_Q})`;
            }
            const barOpacityQ = Math.round((BAR_OPACITY_MIN + eased * BAR_OPACITY_RANGE) * OPACITY_Q);
            if (barOpacityQ !== lastBarOpacityQ[i]) {
              lastBarOpacityQ[i] = barOpacityQ;
              bar.style.opacity = String(barOpacityQ / OPACITY_Q);
            }
          }

          const toolOpacityQ = Math.round((TOOL_OPACITY_MIN + t * TOOL_OPACITY_RANGE) * OPACITY_Q);
          if (toolOpacityQ !== lastToolOpacityQ[i]) {
            lastToolOpacityQ[i] = toolOpacityQ;
            el.style.opacity = String(toolOpacityQ / OPACITY_Q);
          }
          
          const barTopPx = bandHeight * BAR_MAX_FRACTION * s;
          const toolTranslateQ = Math.round(-(barTopPx + LABEL_RIDE_GAP_PX));
          const toolScaleQ = Math.round(
            (LABEL_SCALE_MIN + eased * (LABEL_SCALE_MAX - LABEL_SCALE_MIN)) * SCALE_Q,
          );
          if (toolTranslateQ !== lastToolTranslateQ[i] || toolScaleQ !== lastToolScaleQ[i]) {
            lastToolTranslateQ[i] = toolTranslateQ;
            lastToolScaleQ[i] = toolScaleQ;
            el.style.transform = `translateY(${toolTranslateQ}px) scale(${toolScaleQ / SCALE_Q})`;
          }
          
          const toolWeight = Math.round(
            DIAL_WEIGHT_MIN + eased * (DIAL_WEIGHT_MAX - DIAL_WEIGHT_MIN),
          );
          if (toolWeight !== lastToolWeight[i]) {
            lastToolWeight[i] = toolWeight;
            el.style.fontVariationSettings = `'wght' ${toolWeight}`;
          }
        }

        const nearest = tunedAt(idxFloat, cells);
        if (!nearest) return;
        
        const effectiveZone =
          pendingZoneIdx ?? inFlightZoneIdx ?? Number(bigwordEl.dataset.zone);
        if (nearest.zoneIdx !== effectiveZone) {
          transitionZone(nearest.zoneIdx);
        }
      };

      const firstZone = ZONES[0];
      bigwordEl.dataset.zone = '0';
      splitBigWord(firstZone.word, bigwordEl, splitCls);
      splitLede(firstZone.copy, ledeEl, ledeCls);
      paintZoneAffordances(0);
      applyDial(0);

      const trigger = ScrollTrigger.create({
        trigger: shellEl,
        start: 'top top',
        
        end: () => {
          const refPx =
            window.innerHeight > PIN_RUNWAY_REF_PX
              ? PIN_RUNWAY_TALL_REF_PX
              : window.innerHeight;
          return `+=${refPx * PIN_RUNWAY_VH}`;
        },
        pin: pinEl,
        pinSpacing: true,
        
        pinType: 'fixed',
        scrub: PIN_SCRUB,
        
        anticipatePin: 0,
        
        invalidateOnRefresh: true,
        onUpdate: (self) => applyDial(self.progress),
        
        onRefresh: (self) => {
          centerOffset = dialwrapEl.getBoundingClientRect().width / 2;
          bandHeight = dialwrapEl.getBoundingClientRect().height;
          applyDial(self.progress);
        },
      });

      // Delay refresh to after the browser paints the full DialServicesV2 height,
      // so downstream triggers (Projects, Archive) recalculate correctly.
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          ScrollTrigger.refresh();
        });
      });

      return () => {
        
        [...pendingDelays].forEach((d) => d.kill());
        pendingDelays.clear();
        if (liveTimeoutId !== null) {
          window.clearTimeout(liveTimeoutId);
          liveTimeoutId = null;
        }
        gsap.killTweensOf([
          ...bigwordEl.querySelectorAll<HTMLSpanElement>(`.${styles.letterInner}`),
          ...ledeEl.querySelectorAll<HTMLSpanElement>(`.${styles.ledeWordInner}`),
          dialStripEl,
          notchesEl,
        ]);
        wrapObserver.disconnect();
        
        const savedScrollY = window.scrollY;
        trigger.kill();
        if (window.scrollY !== savedScrollY) {
          window.scrollTo(0, savedScrollY);
        }
        dialStripEl.replaceChildren();
        notchesEl.replaceChildren();
      };
    },
    { scope: wrapperRef },
  );

  return (
    <section
      ref={wrapperRef}
      id="services"
      className={styles.wrapper}
      aria-labelledby={HEADING_ID}
    >
      <h2 id={HEADING_ID} className={styles.srOnly}>
        {content.services.headline.lead} {content.services.headline.accent}
      </h2>

      <div ref={shellRef} className={styles.shell}>
        <div ref={pinRef} className={styles.pin}>
          <div className={styles.top}>
            <MetaLabel>{content.services.label}</MetaLabel>
            <div className={styles.topRow}>
              
              <h3 ref={bigwordRef} className={styles.word} />
              <p ref={ledeRef} className={styles.lede} />
            </div>
          </div>

          <div ref={dialwrapRef} className={styles.dialwrap}>
            <span className={styles.dialRuleTop} aria-hidden="true" />
            <span className={styles.dialRuleBot} aria-hidden="true" />
            <div ref={dialStripRef} className={styles.dialStrip} />
            <div ref={notchesRef} className={styles.notches} aria-hidden="true" />
            <div className={styles.needle} aria-hidden="true">
              <Star className={`${styles.needleStar} ${styles.needleStarTop}`} />
              <Star className={`${styles.needleStar} ${styles.needleStarBot}`} />
            </div>
          </div>

          <div
            className={styles.zones}
            style={{ '--zone-count': ZONES.length } as CSSProperties}
          >
            <div
              ref={zoneIndicatorRef}
              className={styles.zoneIndicator}
              style={{ width: ZONE_INDICATOR_WIDTH }}
            />
            {ZONES.map((zone, i) => (
              <div
                key={zone.word}
                ref={(el) => {
                  
                  const refs = zoneRefs.current;
                  if (i < refs.length) refs[i] = el;
                }}
                className={styles.zone}
              >
                <span className={styles.zoneNum}>{formatZoneIndex(i)}</span>
                {zoneRail(zone)}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div
        ref={liveRef}
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className={styles.srOnly}
      />
    </section>
  );
}
