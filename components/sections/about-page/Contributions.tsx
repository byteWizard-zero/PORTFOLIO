"use client";

import { useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { useTransition } from "@/components/transitions";
import { githubContributions, navigation } from "@/data";
import { SectionLabel } from "@/components/sections/case-study/SectionLabel";
import { playSweep } from "@/lib/audio";
import styles from "./Contributions.module.css";

const CELL = 13;
const GAP = 3;
const STEP = CELL + GAP;
const ROWS = 7;

const TAIL = 8; 
const SEG_GAP = 1; 

const SECS_PER_CELL = 0.125;
const headOpacity = (k: number) => Math.max(0.18, 1 - k * 0.1);

const CYCLE_PAUSE = 1.1;
const LEAD_IN = 0.7;

const githubUrl =
  navigation.socialLinks.find((l) => l.id === "github")?.href ??
  `https://github.com/${githubContributions.username}`;

const LEVELS = [0, 1, 2, 3, 4] as const;

type Pt = { col: number; row: number };

export function AboutPageContributions() {
  const [tooltip, setTooltip] = useState<{
    count: number;
    date: string;
    x: number;
    y: number;
  } | null>(null);
  const reduced = useReducedMotion();
  const { total, weeks } = githubContributions;

  const totalLabel = total.toLocaleString("en-US");

  const sectionRef = useRef<HTMLElement>(null);
  const { hasEntered } = useTransition();

  const cols = weeks.length;
  const width = cols * STEP - GAP;
  const height = ROWS * STEP - GAP;

  useGSAP(
    () => {
      const section = sectionRef.current;
      if (!section || reduced || !hasEntered) return;

      const segs = gsap.utils.toArray<SVGRectElement>("[data-seg]", section);
      const cells = gsap.utils.toArray<SVGRectElement>("[data-cell]", section);
      const cellByKey = new Map<string, SVGRectElement>();
      cells.forEach((c) => cellByKey.set(c.dataset.key as string, c));

      const targets: Pt[] = [];
      const litKeys = new Set<string>();
      cells.forEach((c) => {
        if (c.dataset.level !== "0") {
          const [col, row] = (c.dataset.key as string).split("-").map(Number);
          targets.push({ col, row });
          litKeys.add(c.dataset.key as string);
        }
      });

      const eaten = new Set<string>();

      const biteCell = (cell: SVGRectElement) => {

        cell.dataset.eaten = "true";
        cell.classList.add(styles.biting); 
        gsap.delayedCall(0.12, () => cell.classList.remove(styles.biting)); 
      };

      const eatAt = (route: Pt[], i: number) => {
        const key = `${route[i].col}-${route[i].row}`;
        const cell = cellByKey.get(key);
        if (cell && cell.dataset.level !== "0" && !eaten.has(key)) {
          eaten.add(key);
          biteCell(cell);
        }
      };

      const buildRoute = (): Pt[] => {
        if (!targets.length) return [];
        const visited = new Set<string>();
        const start = targets[Math.floor(Math.random() * targets.length)];
        let cur: Pt = { ...start };
        visited.add(`${cur.col}-${cur.row}`);
        const route: Pt[] = [{ ...cur }];

        while (visited.size < targets.length) {
          let best: Pt | null = null;
          let bestD = Infinity;
          for (const t of targets) {
            if (visited.has(`${t.col}-${t.row}`)) continue;
            const d = Math.abs(t.col - cur.col) + Math.abs(t.row - cur.row);
            if (d < bestD) {
              bestD = d;
              best = t;
            }
          }
          if (!best) break;

          let { col, row } = cur;
          let axis = 0;
          while (col !== best.col || row !== best.row) {
            const dc = best.col - col;
            const dr = best.row - row;
            const moveH = dc !== 0 && dr !== 0 ? axis++ % 2 === 0 : dc !== 0;
            if (moveH) col += Math.sign(dc);
            else row += Math.sign(dr);
            route.push({ col, row });
            const k = `${col}-${row}`;
            if (litKeys.has(k)) visited.add(k); 
          }
          cur = best;
        }
        return route;
      };

      const positionSnake = (route: Pt[], t: number) => {
        for (let k = 0; k < TAIL; k += 1) {
          const seg = segs[k];
          if (!seg) continue;
          const tk = t - k * SEG_GAP;
          if (tk < 0) {
            gsap.set(seg, { autoAlpha: 0 });
            continue;
          }
          const i = Math.floor(tk);
          const f = tk - i;
          const a = route[i];
          const b = route[Math.min(i + 1, route.length - 1)];
          gsap.set(seg, {
            x: (a.col + (b.col - a.col) * f) * STEP,
            y: (a.row + (b.row - a.row) * f) * STEP,
            autoAlpha: headOpacity(k),
            force3D: true,
          });
        }
      };

      const reset = () => {
        eaten.clear();
        cells.forEach((c) => {
          delete c.dataset.eaten;
          c.classList.remove(styles.biting);
        });
        gsap.set(segs, { autoAlpha: 0 });
      };

      gsap.set(segs, { autoAlpha: 0 });

      let tl: gsap.core.Timeline | null = null;
      let pending: gsap.core.Tween | null = null;
      let running = false;

      const runCycle = () => {
        if (!targets.length) return;
        if (tl) tl.kill();
        reset(); 
        const route = buildRoute();
        const proxy = { p: 0 };
        let lastEaten = -1;
        tl = gsap.timeline({
          onComplete: () => {
            if (running) pending = gsap.delayedCall(CYCLE_PAUSE, runCycle);
          },
        });
        tl.to(proxy, {
          p: route.length - 1,
          duration: route.length * SECS_PER_CELL,
          ease: "none",
          delay: LEAD_IN, // hold the regrown grid before the snake re-enters
          onUpdate: () => {
            const t = proxy.p;
            const fi = Math.min(Math.floor(t), route.length - 1);
            for (let i = lastEaten + 1; i <= fi; i += 1) eatAt(route, i);
            lastEaten = fi;
            positionSnake(route, t);
          },
        });
        
        tl.to(segs, { autoAlpha: 0, duration: 0.6, stagger: 0.05 }, ">-0.1");
      };

      const stop = () => {
        running = false;
        if (tl) tl.pause();
        if (pending) {
          pending.kill();
          pending = null;
        }
      };

      const trigger = ScrollTrigger.create({
        trigger: section,
        start: "top 85%",
        end: "bottom top",
        onToggle: (self) => {
          if (self.isActive) {
            if (!running) {
              running = true;
              runCycle();
            }
          } else {
            stop();
          }
        },
      });

      const gridWrap = section.querySelector<HTMLElement>(`.${styles.gridWrap}`);
      const listeners: { element: HTMLElement; type: string; fn: EventListenerOrEventListenerObject }[] = [];
      
      if (gridWrap && !reduced) {
        if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
        gsap.set(gridWrap, { transformPerspective: 1000, transformStyle: "preserve-3d" });
        
        const handleMouseMove = (e: Event) => {
          const mouseEvent = e as unknown as MouseEvent;
          const rect = gridWrap.getBoundingClientRect();
          const x = mouseEvent.clientX - rect.left;
          const y = mouseEvent.clientY - rect.top;
          const normX = (x / rect.width) - 0.5;
          const normY = (y / rect.height) - 0.5;

          const rotateX = -normY * 6;
          const rotateY = normX * 6;
          
          gsap.to(gridWrap, {
            rotateX: rotateX,
            rotateY: rotateY,
            x: normX * 4,
            y: normY * 4,
            duration: 0.3,
            ease: "power2.out",
            overwrite: "auto",
          });
        };
        
        const handleMouseEnter = () => {
          playSweep();
        };
        
        const handleMouseLeave = () => {
          gsap.to(gridWrap, {
            rotateX: 0,
            rotateY: 0,
            x: 0,
            y: 0,
            duration: 0.5,
            ease: "power2.out",
            overwrite: "auto",
          });
        };
        
        gridWrap.addEventListener("mousemove", handleMouseMove);
        gridWrap.addEventListener("mouseenter", handleMouseEnter);
        gridWrap.addEventListener("mouseleave", handleMouseLeave);
        
        listeners.push(
          { element: gridWrap, type: "mousemove", fn: handleMouseMove },
          { element: gridWrap, type: "mouseenter", fn: handleMouseEnter },
          { element: gridWrap, type: "mouseleave", fn: handleMouseLeave }
        );
      }

      return () => {
        trigger.kill();
        if (tl) tl.kill();
        if (pending) pending.kill();
        listeners.forEach(({ element, type, fn }) => {
          element.removeEventListener(type, fn);
        });
      };
    },
    { scope: sectionRef, dependencies: [reduced, hasEntered] },
  );

  return (
    <section
      ref={sectionRef}
      className={styles.section}
      aria-labelledby="contrib-label"
    >
      <div className={styles.inner}>
        <div className={styles.head}>
          <SectionLabel id="contrib-label" className={styles.eyebrow}>
            Contributions
          </SectionLabel>
          <span className={styles.count}>{totalLabel} in the last year</span>
        </div>

        <div className={styles.gridWrap} style={{ position: 'relative' }}>
          <svg
            className={styles.grid}
            data-grid
            viewBox={`0 0 ${width} ${height}`}
            width={width}
            height={height}
            role="img"
            aria-label={`${totalLabel} GitHub contributions in the last year`}
            preserveAspectRatio="xMidYMid meet"
          >
            {weeks.map((week, col) =>
              week.map((cell, row) =>
                cell ? (
                  <rect
                    key={`${col}-${row}`}
                    className={styles.cell}
                    data-cell
                    data-key={`${col}-${row}`}
                    data-level={cell.level}
                    x={col * STEP}
                    y={row * STEP}
                    width={CELL}
                    height={CELL}
                    rx={3}
                    ry={3}
                    aria-label={`${cell.count} contribution${cell.count === 1 ? "" : "s"} on ${cell.date}`}
                    onMouseEnter={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      const wrapEl = e.currentTarget.ownerSVGElement?.parentElement;
                      const wrapRect = wrapEl?.getBoundingClientRect();
                      if (rect && wrapRect) {
                        setTooltip({
                          count: cell.count,
                          date: cell.date,
                          x: rect.left - wrapRect.left + rect.width / 2,
                          y: rect.top - wrapRect.top,
                        });
                      }
                    }}
                    onMouseLeave={() => setTooltip(null)}
                  />
                ) : null,
              ),
            )}

            {!reduced && (
              <g className={styles.snake} data-snake aria-hidden="true">
                {Array.from({ length: TAIL }, (_, k) => (
                  <rect
                    key={k}
                    className={styles.seg}
                    data-seg
                    x={0}
                    y={0}
                    width={CELL}
                    height={CELL}
                    rx={4}
                    ry={4}
                  />
                ))}
              </g>
            )}
          </svg>

          {tooltip && (
            <div
              className={styles.tooltip}
              style={{
                left: `${tooltip.x}px`,
                top: `${tooltip.y}px`,
              }}
            >
              <span className={styles.tooltipCount}>
                {tooltip.count} commit{tooltip.count === 1 ? "" : "s"}
              </span>
              <span className={styles.tooltipDate}>{tooltip.date}</span>
            </div>
          )}
        </div>

        <div className={styles.footer}>
          <div className={styles.legend} aria-hidden="true">
            <span className={styles.legendLabel}>Less</span>
            {LEVELS.map((l) => (
              <span key={l} className={styles.legendCell} data-level={l} />
            ))}
            <span className={styles.legendLabel}>More</span>
          </div>

          <div className={styles.controls}>
            <a
              href={githubUrl}
              target="_blank"
              rel="noreferrer"
              className={styles.cta}
            >
              View on GitHub
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
