'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[App Runtime Error]:', error);
  }, [error]);

  return (
    <div
      style={{
        minHeight: '70vh',
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
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
          color: 'var(--color-accent-purple, #A06CD5)',
          marginBottom: '1rem',
        }}
      >
        // SYSTEM RUNTIME EXCEPTION
      </span>
      <h1
        style={{
          fontSize: 'clamp(1.75rem, 4vw, 2.5rem)',
          fontWeight: 700,
          marginBottom: '1rem',
          letterSpacing: '-0.02em',
        }}
      >
        Something interrupted the signal.
      </h1>
      <p
        style={{
          maxWidth: '480px',
          color: 'color-mix(in oklab, var(--color-primary-text, #fff) 65%, transparent)',
          marginBottom: '2rem',
          lineHeight: 1.6,
          fontSize: '1rem',
        }}
      >
        An unexpected runtime exception was intercepted. You can reset the state or return to the base.
      </p>
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
        <button
          onClick={() => reset()}
          style={{
            padding: '0.75rem 1.75rem',
            backgroundColor: 'var(--color-primary-text, #ffffff)',
            color: 'var(--color-background, #171717)',
            border: 'none',
            borderRadius: '4px',
            fontWeight: 600,
            cursor: 'pointer',
            fontFamily: 'inherit',
            fontSize: '0.9rem',
          }}
        >
          Retry Connection
        </button>
        <Link
          href="/"
          style={{
            padding: '0.75rem 1.75rem',
            border: '1px solid color-mix(in oklab, var(--color-primary-text, #fff) 25%, transparent)',
            color: 'var(--color-primary-text, #ffffff)',
            borderRadius: '4px',
            textDecoration: 'none',
            fontWeight: 500,
            fontSize: '0.9rem',
          }}
        >
          Return Home →
        </Link>
      </div>
    </div>
  );
}
