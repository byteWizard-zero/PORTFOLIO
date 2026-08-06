'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useGSAP } from '@gsap/react';
import { gsap } from '@/lib/gsap';
import { useReducedMotion } from '@/lib/useReducedMotion';
import styles from './Footer.module.css';

const DIRECTORY_LINKS = [
  { label: 'Work', href: '#projects', desc: 'Featured Projects & Case Studies' },
  { label: 'About', href: '/about', desc: 'Background & Developer Dossier' },
  { label: 'Services', href: '#services', desc: 'Architectural & Engineering Capabilities' },
  { label: 'Arcade', href: '/arcade', desc: 'Interactive Canvas & Shader Experiments' },
  { label: 'Contact', href: '#contact', desc: 'Initiate Direct Protocol' },
];

const SOCIAL_LINKS = [
  { label: 'GitHub', href: 'https://github.com/byteWizard-zero', handle: '@byteWizard-zero' },
  { label: 'LinkedIn', href: 'https://www.linkedin.com/in/soumya-ranjan-jana-414586370', handle: 'Soumya Ranjan Jana' },
  { label: 'LeetCode', href: 'https://leetcode.com/u/byteWizard-zero/', handle: 'byteWizard-zero' },
  { label: 'Twitter / X', href: 'https://x.com/byte_wizard1', handle: '@byte_wizard1' },
  { label: 'Instagram', href: 'https://www.instagram.com/zenith.soumya', handle: '@zenith.soumya' },
];

interface TechSpec {
  name: string;
  category: string;
  metric: string;
  description: string;
  icon: string;
}

const TECH_SPECS: TechSpec[] = [
  {
    name: 'Next.js 14',
    category: 'Core Framework',
    metric: 'App Router / SSR',
    description: 'React Server Components, edge-optimized routing, and static asset streaming.',
    icon: '⚡',
  },
  {
    name: 'TypeScript',
    category: 'Language',
    metric: '100% Strict Safety',
    description: 'Strict typing across data schemas, state hooks, and component properties.',
    icon: '🛡️',
  },
  {
    name: 'GSAP & ScrollTrigger',
    category: 'Animation Engine',
    metric: '60 FPS Hardware Accel',
    description: 'Kinetic timeline choreography, ScrollTrigger pinning, and SVG morphing.',
    icon: '✨',
  },
  {
    name: 'Lenis Scroll',
    category: 'Kinetic Motion',
    metric: 'Sub-ms Smoothness',
    description: 'Hardware-accelerated smooth inertial scrolling and touch normalization.',
    icon: '🌊',
  },
  {
    name: 'Java / DSA',
    category: 'Algorithmic Foundation',
    metric: 'O(1) Data Structs',
    description: 'High-efficiency memory management, tree traversal, and algorithmic logic.',
    icon: '☕',
  },
  {
    name: 'IoT Architecture',
    category: 'Hardware & Systems',
    metric: 'Offline-First Mesh',
    description: 'MQTT / HTTP protocols, edge sensor nodes, and real-time telemetry pipelines.',
    icon: '📡',
  },
  {
    name: 'Gemini AI',
    category: 'Agentic Intelligence',
    metric: 'Flash / Lite Routing',
    description: 'Multi-modal LLM swarm orchestration, dynamic routing, and payload parsing.',
    icon: '🤖',
  },
];

interface PingTelemetry {
  status: 'idle' | 'pinging' | 'completed';
  rtt: number | null;
  packetLoss: number;
  node: string;
  timestamp: string;
}

export function Footer() {
  const footerRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reducedMotion = useReducedMotion();

  // Dual Clocks & Timezone Offset
  const [bhubaneswarTime, setBhubaneswarTime] = useState<string>('');
  const [localTime, setLocalTime] = useState<string>('');
  const [offsetString, setOffsetString] = useState<string>('UTC+05:30');

  // Copy Email Toast State
  const [copied, setCopied] = useState(false);

  // Selected Tech Spec Modal / Drawer
  const [activeTech, setActiveTech] = useState<TechSpec | null>(null);

  // Live Ping Telemetry State
  const [pingData, setPingData] = useState<PingTelemetry>({
    status: 'idle',
    rtt: null,
    packetLoss: 0,
    node: 'BHU-IN-NODE-01',
    timestamp: '',
  });

  // Dual Clock Initialization & Sync
  useEffect(() => {
    const updateClocks = () => {
      const now = new Date();

      // Bhubaneswar (Asia/Kolkata)
      const bhuFormatted = now.toLocaleTimeString('en-US', {
        timeZone: 'Asia/Kolkata',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      });
      setBhubaneswarTime(bhuFormatted);

      // Local User Time
      const localFormatted = now.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      });
      setLocalTime(localFormatted);

      // Local Timezone Offset relative to UTC
      const offsetMinutes = -now.getTimezoneOffset();
      const sign = offsetMinutes >= 0 ? '+' : '-';
      const absMinutes = Math.abs(offsetMinutes);
      const hours = String(Math.floor(absMinutes / 60)).padStart(2, '0');
      const mins = String(absMinutes % 60).padStart(2, '0');
      setOffsetString(`UTC${sign}${hours}:${mins}`);
    };

    updateClocks();
    const interval = setInterval(updateClocks, 1000);
    return () => clearInterval(interval);
  }, []);

  // Cybernetic Canvas Wave Grid Background
  useEffect(() => {
    if (reducedMotion || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animFrameId: number;
    let width = (canvas.width = canvas.offsetWidth);
    let height = (canvas.height = canvas.offsetHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.offsetWidth;
      height = canvas.height = canvas.offsetHeight;
    };

    window.addEventListener('resize', handleResize);

    // Particle nodes
    const particleCount = 28;
    const particles: { x: number; y: number; vx: number; vy: number; radius: number; pulse: number }[] = [];

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        radius: Math.random() * 1.5 + 1,
        pulse: Math.random() * Math.PI * 2,
      });
    }

    let mouseX = width / 2;
    let mouseY = height / 2;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseX = e.clientX - rect.left;
      mouseY = e.clientY - rect.top;
    };

    canvas.addEventListener('mousemove', handleMouseMove);

    let time = 0;
    const render = () => {
      time += 0.02;
      ctx.clearRect(0, 0, width, height);

      // Animated Cyber Waveform
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(98, 182, 203, 0.12)';
      ctx.lineWidth = 1.5;

      for (let x = 0; x < width; x += 10) {
        const distToMouse = Math.abs(x - mouseX);
        const mouseInfluence = Math.max(0, 1 - distToMouse / 200) * 15;
        const y = height * 0.5 + Math.sin(x * 0.015 + time) * 12 + Math.cos(x * 0.008 - time * 0.7) * 8 + Math.sin(time * 2 + x * 0.05) * mouseInfluence;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      // Render Telemetry Particles and Connection Filaments
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.pulse += 0.03;

        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        const currentRadius = p.radius + Math.sin(p.pulse) * 0.5;

        // Mouse attraction ripple
        const dx = mouseX - p.x;
        const dy = mouseY - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 120) {
          ctx.beginPath();
          ctx.strokeStyle = `rgba(98, 182, 203, ${0.25 * (1 - dist / 120)})`;
          ctx.lineWidth = 1;
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(mouseX, mouseY);
          ctx.stroke();
        }

        ctx.beginPath();
        ctx.fillStyle = 'rgba(98, 182, 203, 0.35)';
        ctx.arc(p.x, p.y, currentRadius, 0, Math.PI * 2);
        ctx.fill();
      }

      animFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animFrameId);
      window.removeEventListener('resize', handleResize);
      if (canvas) canvas.removeEventListener('mousemove', handleMouseMove);
    };
  }, [reducedMotion]);

  // GSAP Reveal Animations
  useGSAP(() => {
    if (!footerRef.current || reducedMotion) return;

    const elements = footerRef.current.querySelectorAll(`.${styles.revealItem}`);

    gsap.fromTo(
      elements,
      { opacity: 0, y: 24 },
      {
        opacity: 1,
        y: 0,
        duration: 0.8,
        stagger: 0.08,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: footerRef.current,
          start: 'top 85%',
          toggleActions: 'play none none none',
        },
      }
    );
  }, { scope: footerRef, dependencies: [reducedMotion] });

  // Handle Quick Copy Email
  const handleCopyEmail = async () => {
    const email = 'soumyaranjanjana810@gmail.com';
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(email);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = email;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch {
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };

  // Trigger Live Simulated Telemetry Ping
  const handleRunPing = () => {
    setPingData((prev) => ({ ...prev, status: 'pinging' }));

    setTimeout(() => {
      const simulatedRtt = parseFloat((Math.random() * 1.8 + 0.3).toFixed(2));
      const nowStr = new Date().toLocaleTimeString('en-US', { hour12: false });
      setPingData({
        status: 'completed',
        rtt: simulatedRtt,
        packetLoss: 0,
        node: 'BHU-IN-NODE-01',
        timestamp: nowStr,
      });
    }, 650);
  };

  // Scroll to top smooth handler
  const handleScrollTop = () => {
    if (typeof window !== 'undefined') {
      window.scrollTo({
        top: 0,
        behavior: 'smooth',
      });
    }
  };

  return (
    <footer ref={footerRef} className={styles.footer} role="contentinfo" id="footer">
      {/* Background Interactive Cybernetic Wave Grid Canvas */}
      <canvas ref={canvasRef} className={styles.cyberCanvas} aria-hidden="true" />

      <div className={styles.inner}>
        {/* Top Telemetry & Status Bar */}
        <div className={`${styles.topBar} ${styles.revealItem}`}>
          <div className={styles.statusBadge}>
            <span className={styles.statusDot} aria-hidden="true" />
            <span className={styles.statusText}>
              SYSTEM ONLINE <span className={styles.separator}>·</span> ARCHITECTING RESILIENT SYSTEMS
            </span>
          </div>

          <div className={styles.clocksContainer}>
            <div className={styles.clockBlock}>
              <span className={styles.clockLabel}>BHUBANESWAR (HQ)</span>
              <span className={styles.clockValue}>
                {bhubaneswarTime ? `${bhubaneswarTime} IST` : '--:--:-- IST'}
              </span>
            </div>

            <span className={styles.clockDivider} aria-hidden="true">/</span>

            <div className={styles.clockBlock}>
              <span className={styles.clockLabel}>YOUR LOCAL TIME</span>
              <span className={styles.clockValue}>
                {localTime ? `${localTime} (${offsetString})` : '--:--:--'}
              </span>
            </div>
          </div>

          {/* Interactive Telemetry Ping Button */}
          <div className={styles.pingTelemetryWrap}>
            <button
              type="button"
              className={styles.pingButton}
              onClick={handleRunPing}
              disabled={pingData.status === 'pinging'}
              title="Execute simulated low-latency network telemetry handshake"
            >
              <span className={styles.pingIcon} aria-hidden="true">⚡</span>
              <span>
                {pingData.status === 'pinging'
                  ? 'TRANSMITTING PACKET...'
                  : pingData.status === 'completed'
                  ? `RTT: ${pingData.rtt}ms (200 OK)`
                  : 'RUN TELEMETRY PING'}
              </span>
            </button>
          </div>
        </div>

        {/* Main Footer Grid */}
        <div className={styles.grid}>
          {/* Column 1: Brand & Interactive Terminal Box */}
          <div className={`${styles.col} ${styles.brandCol} ${styles.revealItem}`}>
            <div className={styles.brandHeader}>
              <h2 className={styles.brandName}>Zenith Soumya</h2>
              <span className={styles.brandBadge}>Lord Artificer</span>
            </div>

            <p className={styles.brandSub}>
              CS & Engineering Student @ ITER College · Full-Stack & IoT Systems Architect
            </p>
            <p className={styles.brandDesc}>
              Engineering resilient IoT mesh architectures, offline-first mobile solutions, high-performance DSA algorithms, and agentic AI pipelines with sub-millisecond precision.
            </p>

            {/* Quick Command Terminal Box */}
            <div className={styles.terminalBox}>
              <div className={styles.terminalHeader}>
                <div className={styles.terminalDots}>
                  <span className={styles.dotRed} />
                  <span className={styles.dotYellow} />
                  <span className={styles.dotGreen} />
                </div>
                <span className={styles.terminalTitle}>artificer-console v3.1</span>
              </div>
              <div className={styles.terminalBody}>
                <span className={styles.prompt}>artificer@zenith:~$</span>
                <span className={styles.cmdText}>contact --direct-protocol</span>
                <button
                  type="button"
                  className={styles.copyEmailBtn}
                  onClick={handleCopyEmail}
                  aria-label="Copy Email Address to Clipboard"
                >
                  {copied ? (
                    <span className={styles.copiedState}>COPIED TO CLIPBOARD ✓</span>
                  ) : (
                    <span>COPY EMAIL ADDR 📋</span>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Column 2: Directory Links */}
          <div className={`${styles.col} ${styles.revealItem}`}>
            <div className={styles.colHeading}>
              <span className={styles.colHeadingIcon}>❖</span> DIRECTORY
            </div>
            <ul className={styles.linkList}>
              {DIRECTORY_LINKS.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className={styles.linkItem}>
                    <div className={styles.linkTextGroup}>
                      <span className={styles.linkLabel}>{link.label}</span>
                      <span className={styles.linkSubtext}>{link.desc}</span>
                    </div>
                    <span className={styles.arrowIcon} aria-hidden="true">↗</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Social Links */}
          <div className={`${styles.col} ${styles.revealItem}`}>
            <div className={styles.colHeading}>
              <span className={styles.colHeadingIcon}>◈</span> NEURAL PROTOCOLS
            </div>
            <ul className={styles.linkList}>
              {SOCIAL_LINKS.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.linkItem}
                  >
                    <div className={styles.linkTextGroup}>
                      <span className={styles.linkLabel}>{link.label}</span>
                      <span className={styles.linkSubtext}>{link.handle}</span>
                    </div>
                    <span className={styles.arrowIcon} aria-hidden="true">↗</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Interactive Engineered Tech Stack */}
          <div className={`${styles.col} ${styles.revealItem}`}>
            <div className={styles.colHeading}>
              <span className={styles.colHeadingIcon}>⚙</span> ENGINEERED WITH
            </div>

            <p className={styles.techHelpText}>
              Click any tech node to inspect capability telemetry:
            </p>

            <div className={styles.tagGroup}>
              {TECH_SPECS.map((spec) => {
                const isActive = activeTech?.name === spec.name;
                return (
                  <button
                    key={spec.name}
                    type="button"
                    className={`${styles.tag} ${isActive ? styles.tagActive : ''}`}
                    onClick={() => setActiveTech(isActive ? null : spec)}
                  >
                    <span className={styles.tagIcon}>{spec.icon}</span>
                    <span>{spec.name}</span>
                  </button>
                );
              })}
            </div>

            {/* Interactive Tech Spec Inspector Panel */}
            {activeTech && (
              <div className={styles.specInspector}>
                <div className={styles.specHeader}>
                  <span className={styles.specTitle}>{activeTech.icon} {activeTech.name}</span>
                  <button
                    type="button"
                    className={styles.specCloseBtn}
                    onClick={() => setActiveTech(null)}
                    aria-label="Close Tech Inspector"
                  >
                    ✕
                  </button>
                </div>
                <div className={styles.specCategory}>{activeTech.category} · <span className={styles.specMetric}>{activeTech.metric}</span></div>
                <p className={styles.specDesc}>{activeTech.description}</p>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Bar & Elevation Control */}
        <div className={`${styles.bottomBar} ${styles.revealItem}`}>
          <div className={styles.copyrightGroup}>
            <p className={styles.copyright}>
              © 2026 ZENITH SOUMYA <span className={styles.bullet}>·</span> DESIGNED & ARCHITECTED BY <span className={styles.artificerTag}>LORD ARTIFICER</span>
            </p>
            <p className={styles.secProtocol}>
              SECURITY: TLS 1.3 ENCRYPTED <span className={styles.bullet}>·</span> LATENCY: ~0.1ms
            </p>
          </div>

          <button
            type="button"
            className={styles.scrollTopBtn}
            onClick={handleScrollTop}
            aria-label="Elevate camera back to top"
          >
            <span>ELEVATE CAMERA</span>
            <span className={styles.scrollTopIcon} aria-hidden="true">↑</span>
          </button>
        </div>
      </div>
    </footer>
  );
}
