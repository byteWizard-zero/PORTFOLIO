

export const PROJECTS_APPROACH_DURATION = 1.2;
export const PROJECTS_REVEAL_DURATION = 2.5;

const REVEAL_HANDOFF_RATIO = 0.8;

const OPEN_LAND_FRACTION = 0.85;

const SPLIT_RUNWAY_VH = 1.4;

type ScrollToOptions = { duration?: number; easing?: (t: number) => number };
type ScrollToFn = (target: number, options?: ScrollToOptions) => void;

const linear = (t: number) => t;

export function scrollToProjectsReveal(
  scrollTo: ScrollToFn
): ReturnType<typeof setTimeout> | undefined {
  if (typeof document === 'undefined') return;
  const container = document.getElementById('projects');
  const firstSection = container?.querySelector<HTMLElement>('[data-first="true"]');
  if (!firstSection) return;

  const pinStart = firstSection.getBoundingClientRect().top + window.scrollY;

  const isHandoffCard =
    firstSection.dataset.last === 'true' && container?.dataset.overlapActive === 'true';
  const splitRange = isHandoffCard
    ? window.innerHeight * SPLIT_RUNWAY_VH
    : firstSection.offsetHeight - window.innerHeight;

  const prefersReduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

  if (splitRange <= 0 || prefersReduced) {
    scrollTo(Math.max(pinStart, 0), { duration: PROJECTS_APPROACH_DURATION });
    return;
  }

  const revealTarget = pinStart + OPEN_LAND_FRACTION * splitRange;

  if (window.scrollY >= pinStart - 2 && window.scrollY <= revealTarget) {
    scrollTo(revealTarget, { duration: PROJECTS_REVEAL_DURATION, easing: linear });
    return;
  }

  scrollTo(pinStart, { duration: PROJECTS_APPROACH_DURATION });

  return setTimeout(() => {
    scrollTo(revealTarget, { duration: PROJECTS_REVEAL_DURATION, easing: linear });
  }, PROJECTS_APPROACH_DURATION * REVEAL_HANDOFF_RATIO * 1000);
}
