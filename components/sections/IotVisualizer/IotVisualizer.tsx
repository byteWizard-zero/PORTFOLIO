'use client';

import { useState, useEffect, useRef } from 'react';
import { playClick } from '@/lib/audio';
import { useDynamicLenisPrevent } from '@/lib/useDynamicLenisPrevent';
import styles from './IotVisualizer.module.css';

export function IotVisualizer() {
  const [temperature, setTemperature] = useState(25); // Celsius
  const [voltage, setVoltage] = useState(3.3); // Volts
  const [ledActive, setLedActive] = useState(false);
  const [signalStrength, setSignalStrength] = useState(-55); // dBm
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [cpuTemp, setCpuTemp] = useState(38);
  const [logs, setLogs] = useState<string[]>([]);
  const logsBodyRef = useRef<HTMLDivElement>(null);

  useDynamicLenisPrevent(logsBodyRef);

  const addLog = (msg: string) => {
    const timestamp = new Date().toLocaleTimeString().split(' ')[0];
    setLogs((prev) => [...prev, `[${timestamp}] ${msg}`].slice(-30));
  };

  // Log auto-scroll
  useEffect(() => {
    if (logsBodyRef.current) {
      logsBodyRef.current.scrollTop = logsBodyRef.current.scrollHeight;
    }
  }, [logs]);

  // Initial logs
  useEffect(() => {
    setLogs([
      `[SYSTEM] Booting IoT Telemetry Subsystem...`,
      `[ESP32] Core 0 initialized. Clock speed: 240MHz.`,
      `[ESP32] Core 1 initialized. RTOS scheduler active.`,
      `[ADC] Calibrating channel ADC1_CH0 (Pin 36)...`,
      `[WIFI] Connected to local gateway (RSSI: -55dBm).`,
      `[SYSTEM] Telemetry streams established.`
    ]);
  }, []);

  // Simulate WIFI signal variation and CPU temperature changes
  useEffect(() => {
    const interval = setInterval(() => {
      setSignalStrength((prev) => {
        const delta = Math.floor(Math.random() * 5) - 2;
        const next = Math.max(-90, Math.min(-30, prev + delta));
        return next;
      });

      setCpuTemp((prev) => {
        const baseTemp = 35 + (temperature * 0.2) + (ledActive ? 3 : 0);
        const jitter = (Math.random() * 1) - 0.5;
        return parseFloat((baseTemp + jitter).toFixed(1));
      });
    }, 1500);

    return () => clearInterval(interval);
  }, [temperature, ledActive]);

  // Canvas Oscilloscope Animation Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let offset = 0;

    const draw = () => {
      // Handle resizing of canvas backing store
      const rect = canvas.getBoundingClientRect();
      if (canvas.width !== rect.width || canvas.height !== rect.height) {
        canvas.width = rect.width;
        canvas.height = rect.height;
      }

      const { width, height } = canvas;
      ctx.clearRect(0, 0, width, height);

      // Read theme colors from computed CSS variables
      const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
      const gridColor = isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)';
      const waveColor = isDark ? '#62B6CB' : '#62B6CB'; // Teal accent
      const centerLineColor = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';

      // 1. Draw Grid
      ctx.strokeStyle = gridColor;
      ctx.lineWidth = 1;
      
      const gridSpacing = 30;
      for (let x = 0; x < width; x += gridSpacing) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += gridSpacing) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // 2. Draw Center Axis
      ctx.strokeStyle = centerLineColor;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(0, height / 2);
      ctx.lineTo(width, height / 2);
      ctx.stroke();

      // 3. Draw Telemetry Wave (Sine + Noise)
      ctx.strokeStyle = waveColor;
      ctx.lineWidth = 2.5;
      ctx.beginPath();

      const amp = (temperature * 1.5) + 10; // Amplitude mapped to temperature
      const freq = (voltage * 0.03) + 0.01; // Frequency mapped to voltage
      const midY = height / 2;

      for (let x = 0; x < width; x++) {
        // Core sine wave
        const angle = x * freq + offset;
        let y = Math.sin(angle) * amp;

        // Add simulated noise jitter
        const noise = (Math.sin(x * 0.1 + offset * 5) * 2) + ((Math.random() - 0.5) * 1.5);
        y += noise;

        // Center vertically
        const finalY = midY + y;

        if (x === 0) {
          ctx.moveTo(x, finalY);
        } else {
          ctx.lineTo(x, finalY);
        }
      }

      ctx.stroke();

      // Slow shift offset to animate the wave scrolling left
      offset += 0.08;

      animationId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [temperature, voltage]);

  const handleLedToggle = () => {
    playClick();
    setLedActive((prev) => {
      const next = !prev;
      addLog(next ? '[GPIO] Pin 2 state: HIGH (LED ON)' : '[GPIO] Pin 2 state: LOW (LED OFF)');
      return next;
    });
  };

  const handleTempChange = (val: number) => {
    setTemperature(val);
    // Limit logging frequency
    if (Math.random() < 0.15) {
      addLog(`[SENSOR] Temperature reading: ${val}°C (Resistance delta: ${Math.round(1000 - val * 8.5)}Ω)`);
    }
  };

  const handleVoltageChange = (val: number) => {
    setVoltage(val);
    if (Math.random() < 0.15) {
      addLog(`[ADC] Voltage shift detected: ${val.toFixed(2)}V (Raw ADC: ${Math.round((val/3.3)*4095)})`);
    }
  };

  return (
    <div ref={containerRef} className={styles.sectionContainer}>
      <div className={styles.header}>
        <span className={styles.eyebrow}>Embedded Systems</span>
        <h3 className={styles.title}>IoT Telemetry Visualizer</h3>
        <p className={styles.subtitle}>
          Simulate a real-time ESP32 edge microcontroller. Tweak physical inputs, toggle GPIO registers, and inspect core telemetry waves.
        </p>
      </div>

      <div className={styles.dashboard}>
        {/* Left Column: ESP32 Hardware Schematic */}
        <div className={styles.schematicPanel}>
          <h4 className={styles.panelTitle}>ESP32 Device Node (Pinout Map)</h4>
          <div className={styles.schematicWrapper}>
            <svg className={styles.espSvg} viewBox="0 0 420 320" xmlns="http://www.w3.org/2000/svg">
              {/* Circuit board substrate */}
              <rect x="30" y="20" width="360" height="280" rx="8" className={styles.boardBg} />
              
              {/* Circuit copper lines (Grid paths) */}
              <path d="M 60 40 L 60 100 L 150 100" fill="none" className={`${styles.wireLine} ${ledActive ? styles.wireActive : ''}`} />
              <path d="M 370 120 L 370 200 L 270 200" fill="none" className={styles.wireLine} />
              
              {/* ESP32 Core module shielding */}
              <rect x="150" y="80" width="120" height="160" rx="4" className={styles.chipShield} />
              <text x="210" y="150" textAnchor="middle" className={styles.chipTitle}>ESP32-WROOM</text>
              <text x="210" y="170" textAnchor="middle" className={styles.chipSubtitle}>32-BIT DUAL CORE</text>
              
              {/* Status LED */}
              <circle cx="90" cy="100" r="10" className={`${styles.boardLed} ${ledActive ? styles.boardLedActive : ''}`} />
              <text x="90" y="125" textAnchor="middle" className={styles.schematicLabel}>GPIO_02 (LED)</text>

              {/* Antenna block */}
              <rect x="170" y="30" width="80" height="30" className={styles.antennaBlock} />
              <path d="M 180 35 L 240 35 M 190 45 L 230 45 M 200 55 L 220 55" stroke="var(--color-primary-text)" strokeWidth="2" opacity="0.3" />

              {/* Board GPIO Header pins (Left and Right) */}
              {Array.from({ length: 9 }).map((_, i) => (
                <g key={`pin-l-${i}`} className={styles.headerPin}>
                  <rect x="110" y={90 + i * 16} width="16" height="8" className={styles.pinMetal} />
                  <circle cx="118" cy={94 + i * 16} r="2" fill="var(--color-background)" />
                </g>
              ))}

              {Array.from({ length: 9 }).map((_, i) => (
                <g key={`pin-r-${i}`} className={styles.headerPin}>
                  <rect x="294" y={90 + i * 16} width="16" height="8" className={styles.pinMetal} />
                  <circle cx="302" cy={94 + i * 16} r="2" fill="var(--color-background)" />
                </g>
              ))}

              {/* Virtual Temperature Sensor Chip */}
              <rect x="330" y="200" width="30" height="30" rx="3" className={styles.sensorChip} />
              <text x="345" y="250" textAnchor="middle" className={styles.schematicLabel}>TEMP_ADC</text>
            </svg>
          </div>

          <div className={styles.schematicControls}>
            <button
              type="button"
              className={`${styles.ledBtn} ${ledActive ? styles.ledBtnActive : ''}`}
              onClick={handleLedToggle}
            >
              TOGGLE GPIO_02 (VIRTUAL LED: {ledActive ? 'HIGH' : 'LOW'})
            </button>
          </div>
        </div>

        {/* Right Column: Physical Controls & Oscilloscope */}
        <div className={styles.telemetryPanel}>
          {/* Controls */}
          <div className={styles.controlsGroup}>
            <h4 className={styles.panelTitle}>Input Sensor Parameters</h4>
            
            <div className={styles.controlRow}>
              <div className={styles.labelRow}>
                <span>Thermal Sensor Input</span>
                <span>{temperature}°C</span>
              </div>
              <input
                type="range"
                min="0"
                max="80"
                value={temperature}
                onChange={(e) => handleTempChange(parseInt(e.target.value))}
                className={styles.rangeInput}
                aria-label="Sensor Temperature Slider"
              />
            </div>

            <div className={styles.controlRow}>
              <div className={styles.labelRow}>
                <span>Reference Voltage</span>
                <span>{voltage.toFixed(2)} V</span>
              </div>
              <input
                type="range"
                min="1.2"
                max="3.6"
                step="0.1"
                value={voltage}
                onChange={(e) => handleVoltageChange(parseFloat(e.target.value))}
                className={styles.rangeInput}
                aria-label="ADC Reference Voltage Slider"
              />
            </div>
          </div>

          {/* Oscilloscope canvas */}
          <div className={styles.scopeWrapper}>
            <div className={styles.scopeHeader}>
              <span>ADC_1 TELEMETRY WAVEFORM</span>
              <span className={styles.scopeLiveDot}>LIVE FEED</span>
            </div>
            <div className={styles.canvasContainer}>
              <canvas ref={canvasRef} className={styles.oscilloscopeCanvas} />
            </div>
            <div className={styles.telemetryGrid}>
              <div className={styles.telemetryItem}>
                <span className={styles.tLabel}>FREQ</span>
                <span className={styles.tValue}>{(voltage * 8).toFixed(1)} Hz</span>
              </div>
              <div className={styles.telemetryItem}>
                <span className={styles.tLabel}>AMP</span>
                <span className={styles.tValue}>{(temperature * 0.04).toFixed(2)} V</span>
              </div>
              <div className={styles.telemetryItem}>
                <span className={styles.tLabel}>RSSI</span>
                <span className={styles.tValue}>{signalStrength} dBm</span>
              </div>
              <div className={styles.telemetryItem}>
                <span className={styles.tLabel}>CPU TEMP</span>
                <span className={styles.tValue}>{cpuTemp}°C</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Terminal log panel */}
      <div className={styles.logsFooter}>
        <div className={styles.logsHeader}>
          <div className={styles.dotGroup}>
            <span className={styles.redDot}></span>
            <span className={styles.yellowDot}></span>
            <span className={styles.greenDot}></span>
          </div>
          <span className={styles.logsTitle}>esp32_serial_telemetry.log</span>
        </div>
        <div ref={logsBodyRef} className={styles.logsBody}>
          {logs.map((log, index) => {
            let colorClass = styles.logInfo;
            if (log.includes('[GPIO]')) colorClass = styles.logGpio;
            if (log.includes('[SENSOR]')) colorClass = styles.logSensor;
            if (log.includes('[SYSTEM]')) colorClass = styles.logSystem;
            if (log.includes('[ADC]')) colorClass = styles.logAdc;
            
            return (
              <div key={index} className={`${styles.logLine} ${colorClass}`}>
                {log}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
