import type { CSSProperties } from 'react';

export function cssVars(
  vars: Record<`--${string}`, string | number>
): CSSProperties {
  return vars as CSSProperties;
}
