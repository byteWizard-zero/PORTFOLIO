
export const STAR_PATH =
  'M12 0C12 0 14.5 9.5 24 12C14.5 14.5 12 24 12 24C12 24 9.5 14.5 0 12C9.5 9.5 12 0 12 0Z';

export function Star({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      width="100%"
      height="100%"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d={STAR_PATH}
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}

export const STAR_SVG_OUTLINE =
  '<svg viewBox="0 0 24 24" width="100%" height="100%" aria-hidden="true">' +
  `<path d="${STAR_PATH}" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" fill="none"/></svg>`;

export const STAR_SVG_FILLED =
  '<svg viewBox="0 0 24 24" width="100%" height="100%" fill="currentColor" aria-hidden="true">' +
  `<path d="${STAR_PATH}"/></svg>`;
