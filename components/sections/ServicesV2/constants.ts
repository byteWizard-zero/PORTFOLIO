import { getServicesFaces } from '@/data';
import type { ServiceFace } from '@/data';

export const ZONES: ReadonlyArray<ServiceFace> = getServicesFaces();

export const GAP_PX = 220;

export const PAD_CELLS = 3;

export const PIN_RUNWAY_VH = 10;

export const PIN_RUNWAY_REF_PX = 900;

export const PIN_RUNWAY_TALL_REF_PX = 600;

export const PIN_SCRUB = 1.0;

export const BW_OUT_DUR = 0.28;
export const BW_OUT_STAGGER = 0.022;
export const BW_IN_DUR = 0.45;
export const BW_IN_STAGGER = 0.04;

export const LEDE_IN_DUR = 0.7;
export const LEDE_IN_LINE_STAGGER = 0.12;
export const LEDE_OUT_DUR = 0.35;
export const LEDE_OUT_LINE_STAGGER = 0.06;

export const SWAP_OVERLAP = 0.08;

export const HEADING_ID = 'services-v2-heading';

export const formatZoneIndex = (i: number): string =>
  String(i + 1).padStart(2, '0');

export const zoneRail = (z: ServiceFace): string =>
  z.rail || z.word.replace(/\.$/, '');

export const BAR_MAX_FRACTION = 0.42;

export const BAR_MIN_SCALE = 0.05;

export const LABEL_RIDE_GAP_PX = 14;

export const NEEDLE_FALLOFF = 2.4;

export const BAR_OPACITY_MIN = 0.22;
export const BAR_OPACITY_RANGE = 0.78;

export const TOOL_OPACITY_MIN = 0.3;
export const TOOL_OPACITY_RANGE = 0.7;

export const LABEL_SCALE_MIN = 0.9;
export const LABEL_SCALE_MAX = 1.28;

export const DIAL_WEIGHT_MIN = 400;
export const DIAL_WEIGHT_MAX = 700;

export interface ClassifiedChar {
  ch: string;
  accent: boolean;
}

export function classifyFaceWord(word: string): ClassifiedChar[] {
  return word.split('').map((ch) => ({
    ch: ch === ' ' ? '\u00a0' : ch,
    accent: ch === '.',
  }));
}

