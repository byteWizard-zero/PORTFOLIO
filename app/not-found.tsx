import Link from 'next/link';

export default function NotFound() {
  return (
    <div
      style={{
        minHeight: '75vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
        textAlign: 'center',
        color: 'var(--color-primary-text, #ffffff)',
        fontFamily: 'var(--font-primary, sans-serif)',
      }}
    >
      <span
        style={{
          fontFamily: 'var(--font-navbar, monospace)',
          fontSize: '0.85rem',
          letterSpacing: '0.25em',
          textTransform: 'uppercase',
          color: 'var(--color-accent-purple, #A06CD5)',
          marginBottom: '1rem',
        }}
      >
        // ERROR 404
      </span>
      <h1
        style={{
          fontSize: 'clamp(2rem, 5vw, 3.5rem)',
          fontWeight: 700,
          marginBottom: '1rem',
          letterSpacing: '-0.03em',
        }}
      >
        Route Not Found.
      </h1>
      <p
        style={{
          maxWidth: '440px',
          color: 'color-mix(in oklab, var(--color-primary-text, #fff) 65%, transparent)',
          marginBottom: '2.5rem',
          lineHeight: 1.6,
          fontSize: '1rem',
        }}
      >
        The requested coordinates do not correspond to any active deployment surface.
      </p>
      <Link
        href="/"
        style={{
          padding: '0.85rem 2rem',
          backgroundColor: 'var(--color-primary-text, #ffffff)',
          color: 'var(--color-background, #171717)',
          borderRadius: '4px',
          textDecoration: 'none',
          fontWeight: 600,
          fontSize: '0.9rem',
          letterSpacing: '0.05em',
        }}
      >
        RETURN TO BASE →
      </Link>
    </div>
  );
}
