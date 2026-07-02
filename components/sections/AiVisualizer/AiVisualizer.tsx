'use client';

import { useState, useEffect, useRef } from 'react';
import { useReducedMotion } from '@/lib/useReducedMotion';
import { playClick } from '@/lib/audio';
import styles from './AiVisualizer.module.css';

const PRESETS = [
  {
    label: 'Code Generation',
    query: 'Write a highly optimized sorting algorithm in Rust',
    type: 'code',
  },
  {
    label: 'Creative Copy',
    query: 'Create a tagline for an offline-first database product',
    type: 'creative',
  },
  {
    label: 'Log Diagnostics',
    query: 'Analyze execution logs of a crashed Docker container',
    type: 'debug',
  },
];

const RESPONSES: Record<string, string> = {
  code: `// Optimized Rust 3-Way QuickSort
pub fn quick_sort_3way<T: Ord>(arr: &mut [T]) {
    if arr.len() <= 1 { return; }
    
    // Choose pivot (median of three logic for O(N log N) safety)
    let pivot_idx = partition(arr);
    let (left, right) = arr.split_at_mut(pivot_idx);
    
    quick_sort_3way(left);
    quick_sort_3way(&mut right[1..]);
}`,
  creative: `// Generated tagline recommendations:
1. "Zero latency. Zero dependencies. Antigravity DB."
2. "Sync while offline. Scale without limits."
3. "The database that doesn't care if you have internet."
4. "Offline-first resilience, local-first performance."`,
  debug: `// Diagnostic Report: Container Crash
[ANALYSIS] Exit Code 137 detected (SIGKILL).
[CAUSE] JVM memory usage crossed Docker container memory limit (512MB).
[REMEDY] Update Dockerfile entrypoint:
         - Change: java -jar app.jar
         - To:     java -XX:MaxRAMPercentage=75.0 -jar app.jar
         - Or:     Increase container RAM limit to 1GB.`,
  generic: `// Prompt classification completed.
[ROUTER] Intent resolved to general utility.
[REASON] Query does not closely align with predefined developer templates.
[STATUS] Executed default fallback pipeline:
         - Output streamed successfully.
         - Latency constraints satisfied.`,
};

export function AiVisualizer() {
  const [query, setQuery] = useState('');
  const [isRouting, setIsRouting] = useState(false);
  const [activeRoute, setActiveRoute] = useState<'idle' | 'code' | 'creative' | 'debug' | 'generic'>('idle');
  const [scores, setScores] = useState({ code: 0, creative: 0, debug: 0 });
  const [terminalLogs, setTerminalLogs] = useState<string[]>([]);
  const [outputResponse, setOutputResponse] = useState('');
  const [telemetry, setTelemetry] = useState({ latency: 0, tokens: 0, speed: 0, cost: 0 });
  
  const reducedMotion = useReducedMotion();
  const logsEndRef = useRef<HTMLDivElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  // Play high-frequency stream token beep using native Web Audio
  const playTokenBeep = () => {
    if (typeof window === 'undefined') return;
    const muted = localStorage.getItem('site-muted') === 'true';
    if (muted) return;

    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioContextRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(1000 + Math.random() * 400, ctx.currentTime);
      gain.gain.setValueAtTime(0.008, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.04);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.04);
    } catch (e) {
      // Fallback silently if audio context is blocked
    }
  };

  // Scroll terminal logs automatically
  useEffect(() => {
    if (logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [terminalLogs]);

  const addLog = (msg: string) => {
    setTerminalLogs((prev) => [...prev, msg]);
  };

  const handlePresetSelect = (presetQuery: string) => {
    if (isRouting) return;
    playClick();
    setQuery(presetQuery);
  };

  const routePrompt = () => {
    if (isRouting || !query.trim()) return;

    playClick();
    setIsRouting(true);
    setActiveRoute('idle');
    setScores({ code: 0, creative: 0, debug: 0 });
    setTerminalLogs([]);
    setOutputResponse('');
    setTelemetry({ latency: 0, tokens: 0, speed: 0, cost: 0 });

    const lowerQuery = query.toLowerCase();
    let targetRoute: 'code' | 'creative' | 'debug' | 'generic' = 'generic';
    let targetScores = { code: 10, creative: 10, debug: 10 };

    if (
      lowerQuery.includes('rust') ||
      lowerQuery.includes('sorting') ||
      lowerQuery.includes('algorithm') ||
      lowerQuery.includes('code') ||
      lowerQuery.includes('function')
    ) {
      targetRoute = 'code';
      targetScores = { code: 92, creative: 3, debug: 5 };
    } else if (
      lowerQuery.includes('tagline') ||
      lowerQuery.includes('database product') ||
      lowerQuery.includes('marketing') ||
      lowerQuery.includes('creative') ||
      lowerQuery.includes('tag')
    ) {
      targetRoute = 'creative';
      targetScores = { code: 2, creative: 94, debug: 4 };
    } else if (
      lowerQuery.includes('docker') ||
      lowerQuery.includes('logs') ||
      lowerQuery.includes('crashed') ||
      lowerQuery.includes('container') ||
      lowerQuery.includes('debug')
    ) {
      targetRoute = 'debug';
      targetScores = { code: 6, creative: 2, debug: 92 };
    } else {
      // Distribute fallback scores
      targetRoute = 'generic';
      targetScores = { code: 34, creative: 33, debug: 33 };
    }

    if (reducedMotion) {
      // Instant execution for users with prefers-reduced-motion active
      setScores(targetScores);
      setActiveRoute(targetRoute);
      setOutputResponse(RESPONSES[targetRoute] || RESPONSES.generic);
      setTerminalLogs([
        `[ROUTER] Classifying intent for query: "${query}"`,
        `[ROUTER] Target route established: ${targetRoute.toUpperCase()}`,
        `[STREAM] Token stream completed successfully.`,
      ]);
      setTelemetry({
        latency: 120,
        tokens: 64,
        speed: 533,
        cost: 0.00012,
      });
      setIsRouting(false);
      return;
    }

    // Step 1: Animate intent scoring
    addLog(`[ROUTER] Classifying intent for query: "${query.substring(0, 45)}${query.length > 45 ? '...' : ''}"`);
    
    let frame = 0;
    const scoreInterval = setInterval(() => {
      frame++;
      const ratio = frame / 15;
      setScores({
        code: Math.round(targetScores.code * ratio),
        creative: Math.round(targetScores.creative * ratio),
        debug: Math.round(targetScores.debug * ratio),
      });

      if (frame >= 15) {
        clearInterval(scoreInterval);
        
        // Step 2: Establish the connection pathway
        addLog(`[ROUTER] Target route selected: ${targetRoute.toUpperCase()} (${targetScores[targetRoute === 'generic' ? 'code' : targetRoute]}% confidence)`);
        setActiveRoute(targetRoute);

        setTimeout(() => {
          // Step 3: Stream the response typewriter-style
          addLog(`[GATEWAY] Initializing streaming connection to pipeline...`);
          
          setTimeout(() => {
            addLog(`[STREAM] Receiving tokens...`);
            
            const responseText = RESPONSES[targetRoute] || RESPONSES.generic;
            let charIndex = 0;
            const textLength = responseText.length;
            let currentText = '';

            const streamTimer = setInterval(() => {
              // Add a chunk of characters for speed
              const chunkSize = Math.max(1, Math.round(textLength / 40));
              currentText += responseText.substring(charIndex, charIndex + chunkSize);
              charIndex += chunkSize;
              
              setOutputResponse(currentText);
              playTokenBeep();

              // Update live telemetry counters
              const progressRatio = charIndex / textLength;
              setTelemetry({
                latency: Math.round(80 + progressRatio * 140),
                tokens: Math.round(progressRatio * 115),
                speed: Math.round(480 + Math.random() * 60),
                cost: parseFloat((progressRatio * 0.00018).toFixed(5)),
              });

              if (charIndex >= textLength) {
                clearInterval(streamTimer);
                addLog(`[STREAM] Connection closed. 100% of tokens received.`);
                addLog(`[SYSTEM] Memory cleanup nominal. Routing visualizer idle.`);
                setIsRouting(false);
              }
            }, 30);
          }, 600);
        }, 500);
      }
    }, 50);
  };

  return (
    <section className={styles.section} id="ai-visualizer">
      <div className={styles.inner}>
        <div className={styles.sectionHeader}>
          <span className={styles.eyebrow}>Agentic AI</span>
          <h2 className={styles.title}>Prompt Routing Pipeline</h2>
          <p className={styles.subtitle}>
            Submit a developer prompt below to watch the router classify intent and establish low-latency streams to Gemini or Groq models.
          </p>
        </div>

        {/* Dashboard Grid */}
        <div className={styles.dashboard}>
          {/* Left Panel: Query Input & Pipeline */}
          <div className={styles.mainPanel}>
            <div className={styles.presets}>
              {PRESETS.map((p) => (
                <button
                  key={p.label}
                  onClick={() => handlePresetSelect(p.query)}
                  disabled={isRouting}
                  className={styles.presetBtn}
                >
                  {p.label}
                </button>
              ))}
            </div>

            <div className={styles.inputGroup}>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                disabled={isRouting}
                placeholder="Type a query (e.g. Write a python function to...)"
                className={styles.textInput}
                aria-label="Agent Prompt Input"
              />
              <button
                onClick={routePrompt}
                disabled={isRouting || !query.trim()}
                className={styles.routeBtn}
              >
                {isRouting ? 'ROUTING...' : 'ROUTE QUERY'}
              </button>
            </div>

            {/* Pipeline Network Canvas */}
            <div className={styles.pipelineArea}>
              <svg className={styles.networkSvg} viewBox="0 0 500 240">
                {/* Connection lines */}
                {/* Line: Input -> Router */}
                <line
                  x1="50" y1="120" x2="160" y2="120"
                  className={`${styles.connLine} ${isRouting ? styles.activeConn : ''}`}
                />
                
                {/* Route: Router -> Gemini 2.5 Pro (Code) */}
                <path
                  d="M 190 120 Q 280 40, 370 40"
                  className={`${styles.connLine} ${activeRoute === 'code' ? styles.activeRouteCode : ''}`}
                  fill="none"
                />

                {/* Route: Router -> Groq / Llama 3 (Creative) */}
                <line
                  x1="190" y1="120" x2="370" y2="120"
                  className={`${styles.connLine} ${activeRoute === 'creative' ? styles.activeRouteCreative : ''}`}
                />

                {/* Route: Router -> Gemini 2.5 Flash (Debug) */}
                <path
                  d="M 190 120 Q 280 200, 370 200"
                  className={`${styles.connLine} ${activeRoute === 'debug' ? styles.activeRouteDebug : ''}`}
                  fill="none"
                />

                {/* Nodes */}
                {/* Node: Input */}
                <circle cx="50" cy="120" r="16" className={styles.nodeCircle} data-node="input" />
                <text x="50" y="148" textAnchor="middle" className={styles.nodeLabel}>Input</text>

                {/* Node: Router */}
                <rect x="140" y="100" width="50" height="40" rx="6" className={styles.nodeRect} data-node="router" />
                <text x="165" y="124" textAnchor="middle" className={styles.routerLabel}>Router</text>

                {/* Node: Gemini Pro */}
                <rect 
                  x="370" y="20" width="100" height="40" rx="6" 
                  className={`${styles.nodeRect} ${activeRoute === 'code' ? styles.pulsePro : ''}`} 
                  data-node="pro" 
                />
                <text x="420" y="44" textAnchor="middle" className={styles.modelLabel}>Gemini Pro</text>

                {/* Node: Groq Llama 3 */}
                <rect 
                  x="370" y="100" width="100" height="40" rx="6" 
                  className={`${styles.nodeRect} ${activeRoute === 'creative' ? styles.pulseGroq : ''}`} 
                  data-node="groq" 
                />
                <text x="420" y="124" textAnchor="middle" className={styles.modelLabel}>Llama 3 (Groq)</text>

                {/* Node: Gemini Flash */}
                <rect 
                  x="370" y="180" width="100" height="40" rx="6" 
                  className={`${styles.nodeRect} ${activeRoute === 'debug' ? styles.pulseFlash : ''}`} 
                  data-node="flash" 
                />
                <text x="420" y="204" textAnchor="middle" className={styles.modelLabel}>Gemini Flash</text>
              </svg>
            </div>
          </div>

          {/* Right Panel: Intent Scores & Response Monitor */}
          <div className={styles.monitorPanel}>
            <div className={styles.scoreBars}>
              <h4 className={styles.panelTitle}>Confidence Classification</h4>
              
              <div className={styles.scoreRow}>
                <div className={styles.scoreLabelRow}>
                  <span>Coding Intent</span>
                  <span>{scores.code}%</span>
                </div>
                <div className={styles.barTrack}>
                  <div className={styles.barFill} style={{ width: `${scores.code}%`, backgroundColor: 'var(--color-accent-purple)' }} />
                </div>
              </div>

              <div className={styles.scoreRow}>
                <div className={styles.scoreLabelRow}>
                  <span>Creative Intent</span>
                  <span>{scores.creative}%</span>
                </div>
                <div className={styles.barTrack}>
                  <div className={styles.barFill} style={{ width: `${scores.creative}%`, backgroundColor: 'var(--color-accent-gold)' }} />
                </div>
              </div>

              <div className={styles.scoreRow}>
                <div className={styles.scoreLabelRow}>
                  <span>Debug Intent</span>
                  <span>{scores.debug}%</span>
                </div>
                <div className={styles.barTrack}>
                  <div className={styles.barFill} style={{ width: `${scores.debug}%`, backgroundColor: 'var(--color-accent-teal)' }} />
                </div>
              </div>
            </div>

            {/* Response Area */}
            <div className={styles.monitorOutput}>
              <h4 className={styles.panelTitle}>Stream Monitor</h4>
              <div className={styles.outputConsole}>
                {outputResponse ? (
                  <pre className={styles.outputText}>{outputResponse}</pre>
                ) : (
                  <span className={styles.outputPlaceholder}>Awaiting pipeline stream...</span>
                )}
              </div>

              {/* Telemetry Footer */}
              <div className={styles.telemetryGrid}>
                <div className={styles.telemetryItem}>
                  <span className={styles.tLabel}>LATENCY</span>
                  <span className={styles.tValue}>{telemetry.latency}ms</span>
                </div>
                <div className={styles.telemetryItem}>
                  <span className={styles.tLabel}>TOKENS</span>
                  <span className={styles.tValue}>{telemetry.tokens}</span>
                </div>
                <div className={styles.telemetryItem}>
                  <span className={styles.tLabel}>SPEED</span>
                  <span className={styles.tValue}>{telemetry.speed} t/s</span>
                </div>
                <div className={styles.telemetryItem}>
                  <span className={styles.tLabel}>EST. COST</span>
                  <span className={styles.tValue}>${telemetry.cost.toFixed(5)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Console Logs Footer */}
        <div className={styles.logsFooter}>
          <div className={styles.logsHeader}>
            <div className={styles.dotGroup}>
              <span className={styles.redDot}></span>
              <span className={styles.yellowDot}></span>
              <span className={styles.greenDot}></span>
            </div>
            <span className={styles.logsTitle}>gateway_routing_agent.log</span>
          </div>
          <div className={styles.logsBody}>
            {terminalLogs.length === 0 ? (
              <span className={styles.logsPlaceholder}>Router pipeline idle. Input prompt to begin telemetry...</span>
            ) : (
              terminalLogs.map((log, i) => (
                <div key={i} className={styles.logLine}>{log}</div>
              ))
            )}
            <div ref={logsEndRef} />
          </div>
        </div>
      </div>
    </section>
  );
}
