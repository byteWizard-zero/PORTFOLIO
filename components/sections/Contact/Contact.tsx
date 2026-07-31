'use client';

import { useRef, useState, useEffect, FormEvent, ReactNode } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap } from '@/lib/gsap';
import { useReducedMotion } from '@/lib/useReducedMotion';
import { content } from '@/data';
import styles from './Contact.module.css';

const c = content.contact;

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

function splitChars(text: string): ReactNode {
  return Array.from(text).map((ch, i) => (
    <span key={i} className={styles.char}>
      {ch === ' ' ? ' ' : ch}
    </span>
  ));
}

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
  originX: number;
  originY: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  initialAlpha: number;
  life: number;
  maxLife: number;
  delay: number;
  jitter: number;
}

const GRAIN_PALETTE = ['#1b2028', '#1b2028', '#282e38', '#3d4450', '#5c6470', '#858d99'];

function getCleanCanvasFont(styleFontFamily: string, fontSize: number, fontWeight: string): string {
  let cleanedFamily = styleFontFamily
    .replace(/var\([^)]+\)/g, '')
    .replace(/\/\*.*?\*\//g, '')
    .trim();

  cleanedFamily = cleanedFamily.replace(/,\s*,/g, ',').replace(/^,|,$/g, '').trim();

  if (!cleanedFamily || cleanedFamily.includes('var(')) {
    cleanedFamily = "'PP Neue Montreal', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
  }

  return `${fontWeight} ${fontSize}px ${cleanedFamily}`;
}

function sampleCharacterBitmap(
  char: string,
  fontFamily: string,
  fontSize: number,
  fontWeight: string,
  baseX: number,
  baseY: number,
  staggerIndex: number = 0
): DevourParticle[] {
  if (typeof document === 'undefined' || !char || char === ' ' || char === '\u00a0' || char === '\t') return [];

  const canvas = document.createElement('canvas');
  const size = Math.ceil(fontSize * 2.2);
  canvas.width = size;
  canvas.height = size;

  const ctx = canvas.getContext('2d');
  if (!ctx) return [];

  ctx.font = getCleanCanvasFont(fontFamily, fontSize, fontWeight);
  ctx.fillStyle = '#1b2028';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  const centerX = size / 2;
  const centerY = size / 2;
  ctx.fillText(char, centerX, centerY);

  const imgData = ctx.getImageData(0, 0, size, size);
  const data = imgData.data;
  const particles: DevourParticle[] = [];

  const step = fontSize > 44 ? 2 : 1;

  for (let py = 0; py < size; py += step) {
    for (let px = 0; px < size; px += step) {
      const idx = (py * size + px) * 4;
      const alpha = data[idx + 3];

      if (alpha > 20) {
        const opacity = alpha / 255;
        const ptX = baseX + (px - centerX);
        const ptY = baseY + (py - centerY);

        const angle = (Math.random() - 0.5) * Math.PI;
        const speed = Math.random() * 0.8 + 0.3;
        const vx = Math.cos(angle) * speed + 0.25;
        const vy = Math.sin(angle) * speed;

        const intraCharDelay = Math.floor((px / size) * 18);
        const interCharDelay = staggerIndex * 20;
        const delay = intraCharDelay + interCharDelay;

        const color = GRAIN_PALETTE[Math.floor(Math.random() * GRAIN_PALETTE.length)];
        const grainSize = Math.random() > 0.6 ? 1.3 : Math.random() > 0.3 ? 1.0 : 0.8;

        particles.push({
          x: ptX,
          y: ptY,
          originX: ptX,
          originY: ptY,
          vx,
          vy,
          size: grainSize,
          color,
          alpha: opacity,
          initialAlpha: opacity,
          life: Math.floor(Math.random() * 50 + 55),
          maxLife: 105,
          delay,
          jitter: 0.85,
        });
      }
    }
  }

  return particles;
}

function sampleTextBitmap(
  text: string,
  fontFamily: string,
  fontSize: number,
  fontWeight: string,
  startX: number,
  startY: number
): DevourParticle[] {
  if (typeof document === 'undefined' || !text) return [];

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) return [];

  ctx.font = getCleanCanvasFont(fontFamily, fontSize, fontWeight);
  let currentX = startX;
  const result: DevourParticle[] = [];

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (char === ' ' || char === '\u00a0' || char === '\t') {
      currentX += fontSize * 0.35;
      continue;
    }

    const charParticles = sampleCharacterBitmap(
      char,
      fontFamily,
      fontSize,
      fontWeight,
      currentX + (fontSize * 0.35),
      startY + (fontSize * 0.5),
      i
    );
    result.push(...charParticles);

    const charWidth = ctx.measureText(char).width;
    currentX += charWidth;
  }

  return result;
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

  const MAILTO_MAX_LENGTH = 1800;

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

        if (p.delay > 0) {
          p.delay -= 1;
          ctx.save();
          ctx.globalAlpha = p.initialAlpha;
          ctx.fillStyle = p.color;
          const jitterX = (Math.random() - 0.5) * p.jitter;
          const jitterY = (Math.random() - 0.5) * p.jitter;
          ctx.fillRect(p.originX + jitterX, p.originY + jitterY, p.size, p.size);
          ctx.restore();
          activeParticles.push(p);
          continue;
        }

        p.x += p.vx;
        p.y += p.vy;

        p.vx *= 0.92;
        p.vy *= 0.92;
        p.vx += (Math.random() - 0.4) * 0.03 + 0.01;
        p.vy += (Math.random() - 0.5) * 0.06;

        p.life -= 1;
        const lifeRatio = p.life / p.maxLife;
        p.alpha = Math.max(0, lifeRatio * p.initialAlpha);

        if (p.life > 0 && p.alpha > 0) {
          activeParticles.push(p);
          ctx.save();
          ctx.globalAlpha = p.alpha;
          ctx.fillStyle = p.color;
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

  const handleInputDeleteText = (
    deletedText: string,
    inputEl: HTMLInputElement,
    startIndex: number
  ) => {
    if (reducedMotion || !panelRef.current || !canvasRef.current || !deletedText) return;

    const panelRect = panelRef.current.getBoundingClientRect();
    const inputRect = inputEl.getBoundingClientRect();

    const style = window.getComputedStyle(inputEl);
    const fontSize = parseFloat(style.fontSize) || 32;
    const fontFamily = style.fontFamily || 'PP Neue Montreal, sans-serif';
    const fontWeight = style.fontWeight || '400';

    const ctx = canvasRef.current.getContext('2d');
    let prefixWidth = 0;
    if (ctx) {
      ctx.font = getCleanCanvasFont(fontFamily, fontSize, fontWeight);
      const prefixText = inputEl.value.slice(0, startIndex);
      prefixWidth = ctx.measureText(prefixText).width;
    } else {
      prefixWidth = startIndex * (fontSize * 0.6);
    }

    const startX = (inputRect.left - panelRect.left) + 4 + prefixWidth;
    const startY = (inputRect.top - panelRect.top) + (inputRect.height - fontSize) / 2 - 2;

    const newParticles = sampleTextBitmap(
      deletedText,
      fontFamily,
      fontSize,
      fontWeight,
      startX,
      startY
    );
    newParticles.forEach((p) => {
      p.delay = Math.floor(Math.random() * 4);
    });

    particlesRef.current.push(...newParticles);
    startAnimationLoop();
  };

  const spawnFormDevourParticles = () => {
    if (!panelRef.current || !formRef.current) return;
    const panelRect = panelRef.current.getBoundingClientRect();
    const textNodes = formRef.current.querySelectorAll<HTMLElement>(`.${styles.text}, .${styles.input}`);

    const newParticles: DevourParticle[] = [];
    textNodes.forEach((node, idx) => {
      const rect = node.getBoundingClientRect();
      const startX = rect.left - panelRect.left;
      const startY = rect.top - panelRect.top;
      const text = node instanceof HTMLInputElement ? node.value || node.placeholder : node.innerText;

      if (text && text.trim()) {
        const style = window.getComputedStyle(node);
        const fontSize = parseFloat(style.fontSize) || 32;
        const fontFamily = style.fontFamily || 'PP Neue Montreal, sans-serif';
        const fontWeight = style.fontWeight || '400';
        
        const pts = sampleTextBitmap(text.substring(0, 30), fontFamily, fontSize, fontWeight, startX, startY);
        pts.forEach(p => { p.delay += idx * 8; });
        newParticles.push(...pts);
      }
    });

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

    spawnFormDevourParticles();

    window.location.href = href;

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
        
<canvas ref={canvasRef} className={styles.devourCanvas} aria-hidden="true" />

        <form ref={formRef} className={styles.form} onSubmit={handleSubmit} noValidate>
            
            <div className={styles.row}>
              <span className={styles.text}>{SPLITS.row1Lead}</span>
              <RevealInput
                value={name}
                onChange={setName}
                placeholder={c.row1.nameLabel}
                name="name"
                onDeleteText={handleInputDeleteText}
              />
              <span className={styles.text}>{SPLITS.row1Between}</span>
              <RevealInput
                value={country}
                onChange={setCountry}
                placeholder={c.row1.countryLabel}
                name="country"
                onDeleteText={handleInputDeleteText}
              />
            </div>

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

            <div className={styles.row}>
              <span className={styles.text}>{SPLITS.row3Lead}</span>
              <RevealInput
                value={email}
                onChange={(v) => { setEmail(v); if (emailError) setEmailError(false); }}
                placeholder={channel === 'WhatsApp' ? c.row3.phoneLabel : c.row3.emailLabel}
                name="email"
                type={channel === 'WhatsApp' ? 'tel' : 'email'}
                error={emailError}
                onDeleteText={handleInputDeleteText}
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

            <div className={styles.row}>
              <span className={styles.text}>{SPLITS.row4Lead}</span>
              <RevealInput
                value={message}
                onChange={setMessage}
                placeholder={c.row4.label}
                name="message"
                onDeleteText={handleInputDeleteText}
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
  
  ariaLabel?: string;
  name: string;
  type?: string;
  grow?: boolean;
  error?: boolean;
  onDeleteText?: (deletedText: string, inputEl: HTMLInputElement, startIndex: number) => void;
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
  onDeleteText,
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

    if (typeof document !== 'undefined' && document.fonts?.ready) {
      let cancelled = false;
      document.fonts.ready
        .then(() => { if (!cancelled) measure(); })
        .catch(() => { /* fonts.ready shouldn't reject; ignore quirks. */ });
      return () => { cancelled = true; };
    }
  }, [value, placeholder, grow]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!onDeleteText || value.length === 0) return;

    const inputEl = e.currentTarget;
    const selStart = inputEl.selectionStart ?? value.length;
    const selEnd = inputEl.selectionEnd ?? value.length;

    let deletedText = '';
    let startIndex = -1;

    if (e.key === 'Backspace') {
      if (selStart !== selEnd) {
        startIndex = Math.min(selStart, selEnd);
        deletedText = value.slice(startIndex, Math.max(selStart, selEnd));
      } else if (selStart > 0) {
        if (e.ctrlKey || e.altKey) {
          const textBefore = value.slice(0, selStart);
          const match = textBefore.match(/(\s+|\w+|[^\w\s]+)$/);
          deletedText = match ? match[0] : textBefore;
          startIndex = selStart - deletedText.length;
        } else if (e.metaKey) {
          deletedText = value.slice(0, selStart);
          startIndex = 0;
        } else {
          startIndex = selStart - 1;
          deletedText = value.slice(startIndex, selStart);
        }
      }
    } else if (e.key === 'Delete') {
      if (selStart !== selEnd) {
        startIndex = Math.min(selStart, selEnd);
        deletedText = value.slice(startIndex, Math.max(selStart, selEnd));
      } else if (selStart < value.length) {
        if (e.ctrlKey || e.altKey) {
          const textAfter = value.slice(selStart);
          const match = textAfter.match(/^(\s+|\w+|[^\w\s]+)/);
          deletedText = match ? match[0] : textAfter;
          startIndex = selStart;
        } else if (e.metaKey) {
          deletedText = value.slice(selStart);
          startIndex = selStart;
        } else {
          startIndex = selStart;
          deletedText = value.slice(selStart, selStart + 1);
        }
      }
    }

    if (deletedText && startIndex >= 0) {
      onDeleteText(deletedText, inputEl, startIndex);
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
