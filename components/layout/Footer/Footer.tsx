'use client';

import { useRef, useEffect } from 'react';
import styles from './Footer.module.css';

interface GridPoint {
  baseX: number;
  baseY: number;
  currX: number;
  currY: number;
}

export function Footer() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let animationFrameId: number;
    let isVisible = false;
    let time = 0;

    // Wide grid gap spacing (generous breathing room)
    const SPACING = 68;
    const MOUSE_RADIUS = 260;

    let points: GridPoint[][] = [];
    let cols = 0;
    let rows = 0;

    const mouse = {
      x: -2000,
      y: -2000,
      currX: -2000,
      currY: -2000,
      isHovered: false,
    };

    const initGrid = () => {
      const rect = container.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);

      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);

      // Grid dimensions with padding boundary
      cols = Math.ceil(rect.width / SPACING) + 3;
      rows = Math.ceil(rect.height / SPACING) + 3;

      const startX = (rect.width - (cols - 1) * SPACING) / 2;
      const startY = (rect.height - (rows - 1) * SPACING) / 2;

      points = [];
      for (let c = 0; c < cols; c++) {
        points[c] = [];
        for (let r = 0; r < rows; r++) {
          const x = startX + c * SPACING;
          const y = startY + r * SPACING;
          points[c][r] = {
            baseX: x,
            baseY: y,
            currX: x,
            currY: y,
          };
        }
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
      mouse.isHovered = true;
    };

    const handleMouseLeave = () => {
      mouse.x = -2000;
      mouse.y = -2000;
      mouse.isHovered = false;
    };

    const render = () => {
      if (!isVisible) {
        animationFrameId = requestAnimationFrame(render);
        return;
      }

      const rect = container.getBoundingClientRect();
      time += 0.016;

      // Smooth mouse coordinate lerping
      mouse.currX += (mouse.x - mouse.currX) * 0.1;
      mouse.currY += (mouse.y - mouse.currY) * 0.1;

      // Update point coordinates with harmonic wave distortion + mouse tension
      for (let c = 0; c < cols; c++) {
        for (let r = 0; r < rows; r++) {
          const pt = points[c][r];

          // Harmonic multi-frequency distortion waves
          const waveX =
            Math.cos(pt.baseY * 0.005 + time * 0.9) * Math.sin(pt.baseX * 0.004 + time * 0.7) * 20 +
            Math.sin(pt.baseY * 0.012 + time * 1.4) * 8;

          const waveY =
            Math.sin(pt.baseX * 0.005 + time * 1.1) * Math.cos(pt.baseY * 0.004 + time * 0.8) * 24 +
            Math.cos(pt.baseX * 0.01 + time * 1.3) * 10;

          // Interactive mouse gravitational warp
          const dx = pt.baseX + waveX - mouse.currX;
          const dy = pt.baseY + waveY - mouse.currY;
          const dist = Math.sqrt(dx * dx + dy * dy);

          let mouseDispX = 0;
          let mouseDispY = 0;

          if (dist < MOUSE_RADIUS && dist > 0) {
            const factor = 1 - dist / MOUSE_RADIUS;
            const force = factor * factor * 55;
            mouseDispX = (dx / dist) * force;
            mouseDispY = (dy / dist) * force;
          }

          const targetX = pt.baseX + waveX + mouseDispX;
          const targetY = pt.baseY + waveY + mouseDispY;

          // Spring damping towards target
          pt.currX += (targetX - pt.currX) * 0.14;
          pt.currY += (targetY - pt.currY) * 0.14;
        }
      }

      ctx.clearRect(0, 0, rect.width, rect.height);

      const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
      const lineColor = isDark ? 'rgba(98, 182, 203, 0.28)' : 'rgba(27, 32, 40, 0.18)';
      const markerColor = isDark ? 'rgba(98, 182, 203, 0.65)' : 'rgba(27, 32, 40, 0.35)';

      ctx.lineWidth = 1.25;
      ctx.strokeStyle = lineColor;

      // Draw distorted horizontal spline curves
      for (let r = 0; r < rows; r++) {
        ctx.beginPath();
        ctx.moveTo(points[0][r].currX, points[0][r].currY);
        for (let c = 0; c < cols - 1; c++) {
          const p0 = points[c][r];
          const p1 = points[c + 1][r];
          const midX = (p0.currX + p1.currX) / 2;
          const midY = (p0.currY + p1.currY) / 2;
          ctx.quadraticCurveTo(p0.currX, p0.currY, midX, midY);
        }
        ctx.lineTo(points[cols - 1][r].currX, points[cols - 1][r].currY);
        ctx.stroke();
      }

      // Draw distorted vertical spline curves
      for (let c = 0; c < cols; c++) {
        ctx.beginPath();
        ctx.moveTo(points[c][0].currX, points[c][0].currY);
        for (let r = 0; r < rows - 1; r++) {
          const p0 = points[c][r];
          const p1 = points[c][r + 1];
          const midX = (p0.currX + p1.currX) / 2;
          const midY = (p0.currY + p1.currY) / 2;
          ctx.quadraticCurveTo(p0.currX, p0.currY, midX, midY);
        }
        ctx.lineTo(points[c][rows - 1].currX, points[c][rows - 1].currY);
        ctx.stroke();
      }

      // Draw precision blueprint crosshair markers at vertices
      ctx.fillStyle = markerColor;
      for (let c = 0; c < cols; c++) {
        for (let r = 0; r < rows; r++) {
          const p = points[c][r];
          // Delicate 2x2 vertex square marker
          ctx.fillRect(p.currX - 1.5, p.currY - 1.5, 3, 3);
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    initGrid();

    // IntersectionObserver to save GPU/CPU cycles when scrolled off-screen
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          isVisible = entry.isIntersecting;
        });
      },
      { threshold: 0.05 }
    );
    observer.observe(container);

    const resizeObserver = new ResizeObserver(() => {
      initGrid();
    });
    resizeObserver.observe(container);

    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseleave', handleMouseLeave);

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      observer.disconnect();
      resizeObserver.disconnect();
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  return (
    <footer className={styles.footer} role="contentinfo" id="footer">
      <div className={styles.container}>
        <div ref={containerRef} className={styles.gridCard}>
          <div className={styles.ambientGlow} aria-hidden="true" />
          <canvas ref={canvasRef} className={styles.canvas} />
        </div>
      </div>
    </footer>
  );
}
