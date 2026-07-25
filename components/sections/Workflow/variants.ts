

export type WorkflowVariant = 'eclipse' | 'ecliptic';

export const DEFAULT_VARIANT: WorkflowVariant = 'eclipse';

export const VIEWBOX = '0 0 1200 700';

export function isVariant(value: string | null | undefined): value is WorkflowVariant {
  return value === 'eclipse' || value === 'ecliptic';
}

export function workflowAccent(accent: string, index: number, count: number): string {
  return index === count - 1 ? 'var(--color-accent-purple)' : `var(--wf-${accent})`;
}
