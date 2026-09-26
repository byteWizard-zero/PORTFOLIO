'use client';

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body
        style={{
          backgroundColor: '#171717',
          color: '#ffffff',
          fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          margin: 0,
          padding: '2rem',
          textAlign: 'center',
        }}
      >
        <div>
          <h2 style={{ fontSize: '1.75rem', marginBottom: '1rem' }}>Critical System Failure</h2>
          <p style={{ color: '#a0a0a0', marginBottom: '2rem', maxWidth: '400px' }}>
            A fatal error occurred at root application level.
          </p>
          <button
            onClick={() => reset()}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: '#ffffff',
              color: '#000000',
              border: 'none',
              borderRadius: '4px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Reinitialize App
          </button>
        </div>
      </body>
    </html>
  );
}
