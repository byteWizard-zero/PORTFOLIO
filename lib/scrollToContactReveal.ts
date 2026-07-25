

export const CONTACT_APPROACH_DURATION = 1.2;
export const CONTACT_REVEAL_DURATION = 4;

const REVEAL_HANDOFF_RATIO = 0.8;

type ScrollToOptions = { duration?: number; easing?: (t: number) => number };
type ScrollToFn = (target: number, options?: ScrollToOptions) => void;

const linear = (t: number) => t;

export function scrollToContactReveal(
  scrollTo: ScrollToFn
): ReturnType<typeof setTimeout> | undefined {
  if (typeof document === 'undefined') return;
  const el = document.getElementById('contact');
  if (!el) return;

  const pinStart = el.getBoundingClientRect().top + window.scrollY;
  const maxScroll = document.documentElement.scrollHeight - window.innerHeight;

  if (maxScroll <= pinStart + 2) {
    scrollTo(maxScroll, { duration: CONTACT_APPROACH_DURATION });
    return;
  }

  if (window.scrollY >= pinStart - 2) {
    scrollTo(maxScroll, { duration: CONTACT_REVEAL_DURATION, easing: linear });
    return;
  }

  scrollTo(pinStart, { duration: CONTACT_APPROACH_DURATION });

  return setTimeout(() => {
    scrollTo(maxScroll, { duration: CONTACT_REVEAL_DURATION, easing: linear });
  }, CONTACT_APPROACH_DURATION * REVEAL_HANDOFF_RATIO * 1000);
}
