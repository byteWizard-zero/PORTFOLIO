import type { ServiceFace } from '@/data';
import { PAD_CELLS } from './constants';

export type DialCell = {
  
  readonly zoneIdx: number;
  
  readonly name: string;
  readonly isPad: boolean;
};

export function buildCells(zones: ReadonlyArray<ServiceFace>): DialCell[] {
  const cells: DialCell[] = [];
  for (let i = 0; i < PAD_CELLS; i++) {
    cells.push({ zoneIdx: 0, name: '', isPad: true });
  }
  zones.forEach((zone, zi) => {
    zone.tools.forEach((tool) => {
      cells.push({ zoneIdx: zi, name: tool, isPad: false });
    });
  });
  const lastZone = Math.max(0, zones.length - 1);
  for (let i = 0; i < PAD_CELLS; i++) {
    cells.push({ zoneIdx: lastZone, name: '', isPad: true });
  }
  return cells;
}

export function isZoneBoundary(cells: ReadonlyArray<DialCell>, i: number): boolean {
  const curr = cells[i];
  const prev = cells[i - 1];
  if (!curr || curr.isPad) return false;
  if (!prev) return true;
  return prev.isPad || prev.zoneIdx !== curr.zoneIdx;
}

export function countRealCells(cells: ReadonlyArray<DialCell>): number {
  return cells.filter((c) => !c.isPad).length;
}

export function indexAtNeedle(progress: number, realCount: number): number {
  return progress * Math.max(0, realCount - 1) + PAD_CELLS;
}

export function tunedAt(
  idxFloat: number,
  cells: ReadonlyArray<DialCell>,
): DialCell | null {
  if (cells.length <= 2 * PAD_CELLS) return null;
  const min = PAD_CELLS;
  const max = cells.length - 1 - PAD_CELLS;
  const i = Math.min(max, Math.max(min, Math.round(idxFloat)));
  const cell = cells[i];
  return cell && !cell.isPad ? cell : null;
}
