'use client';

import { useRef, useState, useEffect, FormEvent, ReactNode } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap } from '@/lib/gsap';
import { useReducedMotion } from '@/lib/useReducedMotion';
import { content } from '@/data';
import styles from './Contact.module.css';

const c = content.contact;

// Scrub-timeline pacing (in timeline units; each row consumes 1 unit).
// Inside a row:
//   chars   : 0.00 → 0.65        typewriter stagger
//   inputs  : 0.25 → 0.65        input wrap fade-up
//   borders : 0.30 → 0.80        underline width 0% → 100%
//   chips   : 0.55 → 0.95        chip group fade-up
//   gap     : 0.95 → 1.00        small breather before next row
const TIMING = {
  CHAR_DURATION: 0.65,
  CHAR_STAGGER: 0.018,
  INPUT_DURATION: 0.4,
  INPUT_STAGGER: 0.08,
  INPUT_OFFSET: 0.25,
  BORDER_DURATION: 0.5,
  BORDER_STAGGER: 0.1,
  BORDER_OFFSET: 0.3,
  CHIP_DURATION: 0.4,
  CHIP_STAGGER: 0.08,
  CHIP_OFFSET: 0.55,
  SUBMIT_DURATION: 0.5,
} as const;

// Render a static string as one <span> per character so each glyph can be
// tweened independently. Whitespace is rendered as a non-breaking space so it
// doesn't collapse when each char is `display: inline-block` and the parent
// switches to `white-space: normal` at mobile breakpoints.
//
// NOTE (F-IN-01): key={i} (index) is used intentionally. The input is always
// a static string from the JSON import (see SPLITS at module scope) — the
// character list never reorders or partially updates, so index keys are safe.
function splitChars(text: string): ReactNode {
  return Array.from(text).map((ch, i) => (
    <span key={i} className={styles.char}>
      {ch === ' ' ? ' ' : ch}
    </span>
  ));
}

// Content is a static JSON import — splits never change, so build them once
// at module scope instead of memoizing per render.
const SPLITS = {
  row1Lead: splitChars(`${c.row1.greeting} ${c.row1.recipient}${c.row1.afterName} `),
  row1Between: splitChars(` ${c.row1.between} `),
  row2Lead: splitChars(`${c.row2.lead} `),
  row3Lead: splitChars(`${c.row3.lead} `),
  row4Lead: splitChars(`${c.row4.lead} `),
};

const SUBMIT_CHARS = Array.from(c.submit);

interface DevourParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  initialAlpha: number;
  life: number;
  maxLife: number;
}

// Pixel-perfect character bitmap sampler for 1:1 grain disintegration
function sampleCharacterBitmap(
  char: string,
  fontFamily: string,
  fontSize: number,
  fontWeight: string
): { x: number; y: number; opacity: number }[] {
  if (typeof document === 'undefined') return [];

  const canvas = document.createElement('canvas');
  const size = Math.ceil(fontSize * 1.5);
  canvas.width = size;
  canvas.height = size;

  const ctx = canvas.getContext('2d');
  if (!ctx) return [];

  ctx.font = `${fontWeight} ${fontSize}px ${fontFamily}`;
  ctx.fillStyle = '#1b2028';
  ctx.textBaseline = 'top';
  ctx.fillText(char, 0, 0);

  const imgData = ctx.getImageData(0, 0, size, size);
  const data = imgData.data;
  const pixels: { x: number; y: number; opacity: number }[] = [];

  for (let py = 0; py < size; py += 1) {
    for (let px = 0; px < size; px += 1) {
      const idx = (py * size + px) * 4;
      const alpha = data[idx + 3];
      if (alpha > 25) {
        pixels.push({
          x: px,
          y: py,
          opacity: alpha / 255,
        });
      }
    }
  }

  return pixels;
}

export function Contact() {
  const sectionRef = useRef<HTMLElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reducedMotion = useReducedMotion();

  const [name, setName] = useState('');
  const [country, setCountry] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [topic, setTopic] = useState<string | null>(null);
  const [channel, setChannel] = useState<string | null>(c.row3.defaultSelected);
  const [emailError, setEmailError] = useState(false);
  const [mailtoLengthError, setMailtoLengthError] = useState(false);

  const particlesRef = useRef<DevourParticle[]>([]);
  const animFrameRef = useRef<number | null>(null);
  const isAnimatingRef = useRef(false);

  // Maximum mailto: URL length before most OS / mail-client combinations
  // silently fail (empirically ~2 000 chars; 1 800 gives comfortable headroom).
  const MAILTO_MAX_LENGTH = 1800;

  // Sync canvas size with device pixel ratio
  useEffect(() => {
    const syncCanvasSize = () => {
      if (!canvasRef.current || !panelRef.current) return;
      const panel = panelRef.current;
      const canvas = canvasRef.current;
      const rect = panel.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;

      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;

      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.resetTransform();
        ctx.scale(dpr, dpr);
      }
    };

    syncCanvasSize();
    window.addEventListener('resize', syncCanvasSize);
    return () => window.removeEventListener('resize', syncCanvasSize);
  }, []);

  // Animation Loop for 1:1 Grain Noise Disintegration
  const startAnimationLoop = () => {
    if (isAnimatingRef.current) return;
    isAnimatingRef.current = true;

    const render = () => {
      const canvas = canvasRef.current;
      if (!canvas) {
        isAnimatingRef.current = false;
        return;
      }
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        isAnimatingRef.current = false;
        return;
      }

      const dpr = window.devicePixelRatio || 1;
      ctx.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr);

      const activeParticles: DevourParticle[] = [];
      const particles = particlesRef.current;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;

        // Sand/grain rightward drift physics matching the reference image
        p.vx *= 0.94;
        p.vy *= 0.94;
        p.vx += 0.08; // rightward wind drift
        p.vy += (Math.random() - 0.5) * 0.08;

        p.life -= 1;
        const lifeRatio = p.life / p.maxLife;
        p.alpha = Math.max(0, lifeRatio * p.initialAlpha);

        if (p.life > 0 && p.alpha > 0) {
          activeParticles.push(p);
          ctx.save();
          ctx.globalAlpha = p.alpha;
          ctx.fillStyle = p.color;

          // Render exact 1x1 noise grain pixel
          ctx.fillRect(p.x, p.y, p.size, p.size);

          ctx.restore();
        }
      }

      particlesRef.current = activeParticles;

      if (activeParticles.length > 0) {
        animFrameRef.current = requestAnimationFrame(render);
      } else {
        isAnimatingRef.current = false;
      }
    };

    animFrameRef.current = requestAnimationFrame(render);
  };

  // Spawn Pixel-Perfect Grain Disintegration on Backspace
  const handleInputBackspace = (char: string, inputEl: HTMLInputElement) => {
    if (reducedMotion || !panelRef.current || !canvasRef.current) return;

    const panelRect = panelRef.current.getBoundingClientRect();
    const inputRect = inputEl.getBoundingClientRect();

    const style = window.getComputedStyle(inputEl);
    const fontSize = parseFloat(style.fontSize) || 32;
    const fontFamily = style.fontFamily || 'PP Neue Montreal, sans-serif';
    const fontWeight = style.fontWeight || '400';
    const inkColor = style.color || '#1b2028';

    const ctx = canvasRef.current.getContext('2d');
    let textWidthBefore = 0;
    let charWidth = 0;
    if (ctx) {
      ctx.font = `${fontWeight} ${fontSize}px ${fontFamily}`;
      textWidthBefore = ctx.measureText(inputEl.value).width;
      charWidth = ctx.measureText(char).width;
    } else {
      textWidthBefore = inputEl.value.length * (fontSize * 0.6);
      charWidth = fontSize * 0.6;
    }

    const charLeft = (inputRect.left - panelRect.left) + Math.max(0, textWidthBefore - charWidth);
    const charTop = (inputRect.top - panelRect.top) + (inputRect.height - fontSize) / 2 - 2;

    // Extract exact pixel bitmap of erased character
    const sampledPixels = sampleCharacterBitmap(char, fontFamily, fontSize, fontWeight);

    const newParticles: DevourParticle[] = [];
    for (let i = 0; i < sampledPixels.length; i++) {
      const sp = sampledPixels[i];
      const vx = Math.random() * 2.2 + 0.5;
      const vy = (Math.random() - 0.5) * 1.2;

      newParticles.push({
        x: charLeft + sp.x,
        y: charTop + sp.y,
        vx,
        vy,
        size: Math.random() > 0.6 ? 1.2 : 1.0,
        color: inkColor,
        alpha: sp.opacity,
        initialAlpha: sp.opacity,
        life: Math.floor(Math.random() * 25 + 25),
        maxLife: 50,
      });
    }

    particlesRef.current.push(...newParticles);
    startAnimationLoop();
  };

  // Spawn Master Form Submission Grain Disintegration
  const spawnFormDevourParticles = () => {
    if (!panelRef.current || !formRef.current) return;
    const panelRect = panelRef.current.getBoundingClientRect();
    const formRect = formRef.current.getBoundingClientRect();

    const startX = formRect.left - panelRect.left;
    const startY = formRect.top - panelRect.top;
    const width = formRect.width;
    const height = formRect.height;

    const count = 900;
    const colors = ['#1B2028', '#2C323B', '#454C57', '#000000'];
    const newParticles: DevourParticle[] = [];

    for (let i = 0; i < count; i++) {
      const px = startX + Math.random() * width;
      const py = startY + Math.random() * height;
      const vx = Math.random() * 3.5 + 0.8;
      const vy = (Math.random() - 0.5) * 1.8;

      newParticles.push({
        x: px,
        y: py,
        vx,
        vy,
        size: Math.random() > 0.6 ? 1.2 : 1.0,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: 1,
        initialAlpha: 1,
        life: Math.floor(Math.random() * 35 + 30),
        maxLife: 65,
      });
    }

    particlesRef.current.push(...newParticles);
    startAnimationLoop();
  };

  useGSAP(() => {
    if (!sectionRef.current || !panelRef.current || !formRef.current) return;

    const form = formRef.current;
    const panel = panelRef.current;

    const chars = form.querySelectorAll<HTMLElement>(`.${styles.char}`);
    const revealItems = form.querySelectorAll<HTMLElement>(`.${styles.revealItem}`);
    const inputBorders = form.querySelectorAll<HTMLElement>(`.${styles.inputBorder}`);
    const submit = form.querySelector<HTMLElement>(`.${styles.submit}`);

    gsap.set(chars, { opacity: 0 });
    gsap.set(revealItems, { opacity: 0, y: 14 });
    gsap.set(inputBorders, { width: 0 });
    if (submit) gsap.set(submit, { opacity: 0, y: 20 });

    if (reducedMotion) {
      gsap.set(chars, { opacity: 1 });
      gsap.set(revealItems, { opacity: 1, y: 0 });
      gsap.set(inputBorders, { width: '100%' });
      if (submit) gsap.set(submit, { opacity: 1, y: 0 });
      return;
    }

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: panel,
        end: '+=150%',
        pin: panel,
        pinSpacing: true,
        scrub: 1,
        invalidateOnRefresh: true,
        anticipatePin: 1,
      },
      defaults: { ease: 'none' },
    });

    const rows = form.querySelectorAll<HTMLElement>(`.${styles.row}`);
    rows.forEach((row, rowIdx) => {
      const start = rowIdx;
      const rowChars = row.querySelectorAll<HTMLElement>(`.${styles.char}`);
      const rowBorders = row.querySelectorAll<HTMLElement>(`.${styles.inputBorder}`);
      const rowInputs = row.querySelectorAll<HTMLElement>(`.${styles.inputWrap}`);
      const rowChips = row.querySelectorAll<HTMLElement>(`.${styles.chip}`);

      if (rowChars.length) {
        tl.to(
          rowChars,
          {
            opacity: 1,
            duration: TIMING.CHAR_DURATION,
            stagger: { each: TIMING.CHAR_STAGGER, from: 'start' },
          },
          start
        );
      }

      if (rowInputs.length) {
        tl.to(
          rowInputs,
          { opacity: 1, y: 0, duration: TIMING.INPUT_DURATION, stagger: TIMING.INPUT_STAGGER },
          start + TIMING.INPUT_OFFSET
        );
      }

      if (rowBorders.length) {
        tl.to(
          rowBorders,
          { width: '100%', duration: TIMING.BORDER_DURATION, stagger: TIMING.BORDER_STAGGER },
          start + TIMING.BORDER_OFFSET
        );
      }

      if (rowChips.length) {
        tl.to(
          rowChips,
          { opacity: 1, y: 0, duration: TIMING.CHIP_DURATION, stagger: TIMING.CHIP_STAGGER },
          start + TIMING.CHIP_OFFSET
        );
      }
    });

    if (submit) {
      tl.to(submit, { opacity: 1, y: 0, duration: TIMING.SUBMIT_DURATION }, rows.length);
    }
  }, { scope: sectionRef, dependencies: [reducedMotion] });

  function handleSubmit(e: FormEvent) {
    e.preventDefault();

    const trimmedEmail = email.trim();
    const inputEl = formRef.current?.querySelector<HTMLInputElement>('input[name="email"]');
    const emailOk = inputEl ? inputEl.validity.valid && trimmedEmail.length > 0 : trimmedEmail.includes('@');
    if (!emailOk) {
      setEmailError(true);
      return;
    }
    setEmailError(false);
    setMailtoLengthError(false);

    const trimmedName = name.trim();
    const trimmedCountry = country.trim();
    const trimmedMessage = message.trim();
    const resolvedTopic = topic ?? 'New message';

    const subject = encodeURIComponent(`${resolvedTopic} — ${trimmedName || 'A friend'}`);
    const body = encodeURIComponent(
      [
        `Hi ${c.row1.recipient},`,
        '',
        `I'm ${trimmedName || '—'}, reaching out from ${trimmedCountry || '—'}.`,
        `Topic: ${resolvedTopic}.`,
        `Best channel: ${channel ?? '—'} (${trimmedEmail || '—'}).`,
        '',
        trimmedMessage || '—',
      ].join('\r\n')
    );

    const href = `mailto:${c.fallback.email}?subject=${subject}&body=${body}`;

    if (href.length > MAILTO_MAX_LENGTH) {
      setMailtoLengthError(true);
      return;
    }

    // 1. Trigger particle devouring swarm
    spawnFormDevourParticles();

    // 2. Execute mail client directly
    window.location.href = href;

    // 3. Reset form inputs so text devours cleanly into particles
    setName('');
    setCountry('');
    setEmail('');
    setMessage('');
    setTopic(null);
  }

  return (
    <section
      ref={sectionRef}
      className={styles.section}
      id="contact"
      aria-labelledby="contact-heading"
    >
      <h2 id="contact-heading" className={styles.srOnly}>Contact</h2>

      <div ref={panelRef} className={styles.panel}>
        {/* Particle Canvas Overlay */}
        <canvas ref={canvasRef} className={styles.devourCanvas} aria-hidden="true" />

        <form ref={formRef} className={styles.form} onSubmit={handleSubmit} noValidate>
            {/* Row 1 — greeting + name + country */}
            <div className={styles.row}>
              <span className={styles.text}>{SPLITS.row1Lead}</span>
              <RevealInput
                value={name}
                onChange={setName}
                placeholder={c.row1.nameLabel}
                name="name"
                onBackspace={handleInputBackspace}
              />
              <span className={styles.text}>{SPLITS.row1Between}</span>
              <RevealInput
                value={country}
                onChange={setCountry}
                placeholder={c.row1.countryLabel}
                name="country"
                onBackspace={handleInputBackspace}
              />
            </div>

            {/* Row 2 — topic chips */}
            <div className={styles.row}>
              <span className={styles.text}>{SPLITS.row2Lead}</span>
              <div className={styles.chipGroup} role="group" aria-label="Topic">
                {c.row2.options.map((opt) => (
                  <Chip
                    key={opt}
                    label={opt}
                    selected={topic === opt}
                    onSelect={() => setTopic(topic === opt ? null : opt)}
                  />
                ))}
              </div>
            </div>

            {/* Row 3 — email + channel chips */}
            <div className={styles.row}>
              <span className={styles.text}>{SPLITS.row3Lead}</span>
              <RevealInput
                value={email}
                onChange={(v) => { setEmail(v); if (emailError) setEmailError(false); }}
                placeholder={channel === 'WhatsApp' ? c.row3.phoneLabel : c.row3.emailLabel}
                name="email"
                type={channel === 'WhatsApp' ? 'tel' : 'email'}
                error={emailError}
                onBackspace={handleInputBackspace}
                grow
              />
              <div className={styles.chipGroup} role="group" aria-label="Channel">
                {c.row3.options.map((opt) => (
                  <Chip
                    key={opt}
                    label={opt}
                    selected={channel === opt}
                    onSelect={() => setChannel(channel === opt ? null : opt)}
                  />
                ))}
              </div>
            </div>

            {/* Row 4 — message */}
            <div className={styles.row}>
              <span className={styles.text}>{SPLITS.row4Lead}</span>
              <RevealInput
                value={message}
                onChange={setMessage}
                placeholder={c.row4.label}
                name="message"
                onBackspace={handleInputBackspace}
                grow
              />
            </div>

            <button type="submit" className={styles.submit}>
              <span className={styles.submitTextWrap}>
                <span className={styles.submitTextBase}>
                  {SUBMIT_CHARS.map((char, i) => (
                    <span
                      key={i}
                      className={styles.submitChar}
                      style={{ transitionDelay: `${i * 0.025}s` }}
                    >
                      {char === ' ' ? ' ' : char}
                    </span>
                  ))}
                </span>
                <span className={styles.submitTextClone} aria-hidden="true">
                  {SUBMIT_CHARS.map((char, i) => (
                    <span
                      key={i}
                      className={styles.submitChar}
                      style={{ transitionDelay: `${i * 0.025}s` }}
                    >
                      {char === ' ' ? ' ' : char}
                    </span>
                  ))}
                </span>
              </span>
              <span className={styles.submitArrow} aria-hidden="true">
                <svg viewBox="0 0 19 19" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M1.25 17.75L17.75 1.25M17.75 1.25L17.75 17.75M17.75 1.25L1.25 1.25"
                    stroke="currentColor"
                    strokeWidth="2.5"
                  />
                </svg>
              </span>
            </button>

            {mailtoLengthError && (
              <p className={styles.fallback} role="alert" aria-live="polite">
                Your message is too long for the email link. Please shorten it and try again, or email directly:{' '}
                <a className={styles.fallbackLink} href={`mailto:${c.fallback.email}`}>
                  {c.fallback.email}
                </a>
              </p>
            )}

            <p className={styles.fallback}>
              {c.fallback.label}{' '}
              <a className={styles.fallbackLink} href={`mailto:${c.fallback.email}`}>
                {c.fallback.email}
              </a>
            </p>
          </form>
        </div>
      </section>
    );
  }

interface RevealInputProps {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  /** Optional override; defaults to `placeholder`. */
  ariaLabel?: string;
  name: string;
  type?: string;
  grow?: boolean;
  error?: boolean;
  onBackspace?: (char: string, inputEl: HTMLInputElement) => void;
}

const INPUT_WIDTH_BUFFER_MIN = 12;
const INPUT_WIDTH_BUFFER_RATIO = 0.3;

function RevealInput({
  value,
  onChange,
  placeholder,
  ariaLabel = placeholder,
  name,
  type = 'text',
  grow = false,
  error = false,
  onBackspace,
}: RevealInputProps) {
  const mirrorRef = useRef<HTMLSpanElement>(null);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    if (grow || !mirrorRef.current) return;

    const measure = () => {
      const el = mirrorRef.current;
      if (!el) return;
      const measured = Math.ceil(el.getBoundingClientRect().width);
      const fontPx = parseFloat(getComputedStyle(el).fontSize);
      const buffer = Math.max(
        INPUT_WIDTH_BUFFER_MIN,
        Math.round(fontPx * INPUT_WIDTH_BUFFER_RATIO)
      );
      setWidth(measured + buffer);
    };

    measure();

    // Re-measure after the custom font loads — initial paint uses fallback.
    if (typeof document !== 'undefined' && document.fonts?.ready) {
      let cancelled = false;
      document.fonts.ready
        .then(() => { if (!cancelled) measure(); })
        .catch(() => { /* fonts.ready shouldn't reject; ignore quirks. */ });
      return () => { cancelled = true; };
    }
  }, [value, placeholder, grow]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && value.length > 0 && onBackspace) {
      const deletedChar = value[value.length - 1];
      onBackspace(deletedChar, e.currentTarget);
    }
  };

  return (
    <span
      className={`${styles.inputWrap} ${styles.revealItem} ${grow ? styles.inputWrapGrow : ''} ${error ? styles.inputWrapError : ''}`}
    >
      <span ref={mirrorRef} className={styles.inputMirror} aria-hidden="true">
        {value || placeholder}
      </span>
      <input
        className={styles.input}
        type={type}
        name={name}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        aria-label={ariaLabel}
        aria-invalid={error || undefined}
        autoComplete="off"
        style={!grow && width ? { width: `${width}px` } : undefined}
      />
      {/* Animated underline — width drives 0% → 100% during scroll reveal. */}
      <span className={styles.inputBorder} aria-hidden="true" />
    </span>
  );
}

interface ChipProps {
  label: string;
  selected: boolean;
  onSelect: () => void;
}

function Chip({ label, selected, onSelect }: ChipProps) {
  // Two stacked layers (base + clone), each split into per-character spans.
  // Base rests; clone sits at translateY(100%). On hover the base slides up
  // off-canvas and the clone slides into place, with a per-char transition
  // delay creating a left-to-right cascade. The clone is aria-hidden so it
  // doesn't duplicate the accessible name; visible base spans concatenate
  // into the button name automatically.
  //
  // NOTE (F-IN-01): key={i} on chars is intentional — chip labels come from
  // the static JSON import (c.row2.options / c.row3.options) and never reorder.
  const chars = Array.from(label);
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onSelect}
      className={`${styles.chip} ${styles.revealItem} ${selected ? styles.chipSelected : ''}`}
    >
      <span className={styles.chipTextWrap}>
        <span className={styles.chipTextBase}>
          {chars.map((ch, i) => (
            <span
              key={i}
              className={styles.chipChar}
              style={{ transitionDelay: `${i * 0.02}s` }}
            >
              {ch === ' ' ? ' ' : ch}
            </span>
          ))}
        </span>
        <span className={styles.chipTextClone} aria-hidden="true">
          {chars.map((ch, i) => (
            <span
              key={i}
              className={styles.chipChar}
              style={{ transitionDelay: `${i * 0.02}s` }}
            >
              {ch === ' ' ? ' ' : ch}
            </span>
          ))}
        </span>
      </span>
    </button>
  );
}
