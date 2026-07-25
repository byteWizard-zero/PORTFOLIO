import { useGSAP } from "@gsap/react";
import { type RefObject } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import {
  splitTextIntoWords,
  groupWordsByLine,
  type SplitResult,
} from "@/lib/splitTextIntoWords";
import { useTransition } from "@/components/transitions";
import staggerStyles from "./staggerText.module.css";

const WORD_REVEAL_YPERCENT = 110;
const LINE_STAGGER = 0.12;
const REVEAL_DURATION = 0.7;
const REVEAL_START = "top 85%";

type RevealOptions = {
  lineStagger?: number;
  duration?: number;
  delay?: number;
  start?: string;
  scope?: RefObject<HTMLElement | null>;
  
  exclude?: string;
};

export function useWordLineReveal(
  target: RefObject<HTMLElement | null>,
  options: RevealOptions = {}
) {
  const {
    lineStagger = LINE_STAGGER,
    duration = REVEAL_DURATION,
    delay = 0,
    start = REVEAL_START,
    scope,
    exclude,
  } = options;

  const { hasEntered } = useTransition();

  useGSAP(
    () => {
      if (!hasEntered) return;
      const root = target.current;
      if (!root) return;

      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        let split: SplitResult | null = null;
        let tl: gsap.core.Timeline | null = null;
        let trigger: ScrollTrigger | null = null;
        let resizeObserver: ResizeObserver | null = null;
        let cancelled = false;

        const buildTimeline = () => {
          if (!split || cancelled) return;
          const wasPlaying = tl ? tl.isActive() : false;
          const wasCompleted = tl ? (tl.progress() === 1 || tl.totalProgress() === 1) : false;
          if (tl) tl.kill();
          const lineGroups = groupWordsByLine(split.words);
          tl = gsap.timeline({ paused: true, delay });
          lineGroups.forEach((group, i) => {
            tl!.to(
              group,
              { yPercent: 0, duration, ease: "power2.out" },
              i * lineStagger
            );
          });
          if (wasCompleted || (trigger && (trigger.progress > 0 || trigger.isActive))) {
            tl.progress(1, false);
          } else if (wasPlaying) {
            tl.play();
          }
        };

        const setupReveal = () => {
          if (cancelled || !root.isConnected) return;
          split = splitTextIntoWords(
            root,
            staggerStyles.word,
            staggerStyles.wordInner,
            exclude
          );
          if (!split.inners.length) {
            split.revert();
            split = null;
            return;
          }

          gsap.set(split.inners, { yPercent: WORD_REVEAL_YPERCENT });
          buildTimeline();

          if (cancelled || !root.isConnected) {
            split?.revert();
            split = null;
            return;
          }

          trigger = ScrollTrigger.create({
            trigger: root,
            start,
            once: true,
            onEnter: () => tl?.play(),
            onRefresh: (self) => {
              if (self.isActive || self.progress > 0) {
                tl?.play();
              }
            },
          });

          if (trigger.progress > 0 || trigger.isActive) {
            tl?.play();
          }

          ScrollTrigger.refresh();

          if (typeof ResizeObserver !== "undefined") {
            let frame = 0;
            resizeObserver = new ResizeObserver(() => {
              cancelAnimationFrame(frame);
              frame = requestAnimationFrame(() => {
                if (split) buildTimeline();
              });
            });
            resizeObserver.observe(root);
          }
        };

        const ready =
          typeof document !== "undefined" && document.fonts?.ready
            ? document.fonts.ready
            : Promise.resolve();
        ready.then(setupReveal);

        return () => {
          cancelled = true;
          if (resizeObserver) resizeObserver.disconnect();
          if (trigger) trigger.kill();
          if (tl) tl.kill();
          if (split) {
            gsap.set(split.inners, { clearProps: "transform" });
            split.revert();
          }
        };
      });

      return () => {
        mm.revert();
      };
    },
    scope
      ? { scope, dependencies: [hasEntered] }
      : { scope: target, dependencies: [hasEntered] }
  );
}

