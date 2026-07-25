import { useGSAP } from "@gsap/react";
import { type RefObject } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { splitTextIntoWords, type SplitResult } from "@/lib/splitTextIntoWords";
import staggerStyles from "./staggerText.module.css";

const REVEAL_YPERCENT = 110; 
const ACT_SCRUB = 0.6; 
const PIN_END = "+=180%"; 
const ACT1_START = "top 80%"; 
const ACT1_END = "top 10%"; 
const PIN_START = "top top"; 
const ACT_OFFSET = 0.55; 
const ACT1_STAGGER = 0.6; 
const ACT2_STAGGER = 0.45; 
const ACT3_STAGGER = 0.4; 

interface UseScrubbedActsRevealOptions {
  scope: RefObject<HTMLElement | null>;
  sticky: RefObject<HTMLElement | null>;
  act1: RefObject<HTMLElement | null>;
  act2: RefObject<HTMLElement | null>;
  act3: RefObject<HTMLElement | null>;
}

export function useScrubbedActsReveal({
  scope,
  sticky,
  act1,
  act2,
  act3,
}: UseScrubbedActsRevealOptions) {
  useGSAP(
    () => {
      const sectionEl = scope.current;
      const stickyEl = sticky.current;
      const act1El = act1.current;
      const act2El = act2.current;
      const act3El = act3.current;
      if (!sectionEl || !stickyEl || !act1El || !act2El || !act3El) return;

      const mm = gsap.matchMedia();

      mm.add(
        "(prefers-reduced-motion: no-preference) and (min-width: 769px)",
        () => {
          const split1: SplitResult = splitTextIntoWords(
            act1El,
            staggerStyles.word,
            staggerStyles.wordInner
          );
          const split2: SplitResult = splitTextIntoWords(
            act2El,
            staggerStyles.word,
            staggerStyles.wordInner
          );
          const split3: SplitResult = splitTextIntoWords(
            act3El,
            staggerStyles.word,
            staggerStyles.wordInner
          );

          const inners1 = split1.inners;
          const inners2 = split2.inners;
          const inners3 = split3.inners;
          const triggers: ScrollTrigger[] = [];

          if (!inners1.length && !inners2.length && !inners3.length) {
            split1.revert();
            split2.revert();
            split3.revert();
            return;
          }

          gsap.set([...inners1, ...inners2, ...inners3], {
            yPercent: REVEAL_YPERCENT,
            opacity: 0,
          });

          if (inners1.length) {
            const tl1 = gsap.timeline({
              scrollTrigger: {
                trigger: sectionEl,
                start: ACT1_START,
                end: ACT1_END,
                scrub: ACT_SCRUB,
                invalidateOnRefresh: true,
              },
            });
            if (tl1.scrollTrigger) triggers.push(tl1.scrollTrigger);
            tl1.to(inners1, {
              yPercent: 0,
              opacity: 1,
              duration: 1,
              ease: "power2.out",
              stagger: ACT1_STAGGER / Math.max(inners1.length, 1),
            });
          }

          if (inners2.length || inners3.length) {
            const tl2 = gsap.timeline({
              scrollTrigger: {
                trigger: sectionEl,
                start: PIN_START,
                end: PIN_END,
                scrub: ACT_SCRUB,
                pin: stickyEl,
                pinType: "fixed",
                anticipatePin: 1,
                invalidateOnRefresh: true,
              },
            });
            if (tl2.scrollTrigger) triggers.push(tl2.scrollTrigger);

            if (inners2.length) {
              tl2.to(
                inners2,
                {
                  yPercent: 0,
                  opacity: 1,
                  duration: 1,
                  ease: "power2.out",
                  stagger: ACT2_STAGGER / Math.max(inners2.length, 1),
                },
                0
              );
            }

            if (inners3.length) {
              tl2.to(
                inners3,
                {
                  yPercent: 0,
                  opacity: 1,
                  duration: 1,
                  ease: "power2.out",
                  stagger: ACT3_STAGGER / Math.max(inners3.length, 1),
                },
                ACT_OFFSET
              );
            }
          }

          const refreshFrame = requestAnimationFrame(() => {
            ScrollTrigger.refresh();
          });

          return () => {
            cancelAnimationFrame(refreshFrame);
            triggers.forEach((t) => t.kill());
            split1.revert();
            split2.revert();
            split3.revert();
            // No ScrollTrigger.refresh() here: triggers.kill() releases pin
            // spacers on its own. A synchronous refresh during route-change
            // unmount forces every other trigger on the page to re-measure
            // mid-teardown — visible as transition stutter on slow devices.
          };
        }
      );

      return () => {
        mm.revert();
      };
    },
    { scope }
  );
}
