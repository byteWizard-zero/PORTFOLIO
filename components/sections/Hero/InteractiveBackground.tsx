'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { gsap } from '@/lib/gsap';
import { useAccentColor } from '@/lib/AccentColorContext';
import { useReducedMotion } from '@/lib/useReducedMotion';
import { hexToRgb } from '@/lib/colorUtils';
import { features } from '@/data';
import styles from './InteractiveBackground.module.css';

const cfg = features.interactiveBackground;
const BASE_GRID_SPACING = cfg.grid.spacing;
const PLUS_SIZE = cfg.grid.plusSignSize;
const STROKE_WIDTH = cfg.grid.strokeWidth;
const MOUSE_RADIUS = cfg.physics.mouseRadius;

const PUSH_STRENGTH = 32;
const STATIC_OPACITY = 0.22;
const HOVER_OPACITY_BOOST = 0.4;

const MOUSE_EASE = 0.12;

const MOVE_DECAY = 0.85;
const IDLE_TIMEOUT_MS = 150;
const DPR_CAP_DESKTOP = 2;
const DPR_CAP_MOBILE = 1.5;
const MOBILE_BREAKPOINT = 768;
const FAR = -100000;

const OFFSCREEN = FAR / 2;

const computeGridSpacing = (vw: number) =>
  Math.max(BASE_GRID_SPACING, Math.min(40, Math.round(vw / 96)));

const VERT_SRC = `attribute vec2 aPos;
void main() { gl_Position = vec4(aPos, 0.0, 1.0); }`;

const FRAG_SRC = `precision highp float;
uniform vec2 uResolution;
uniform float uDpr;
uniform vec2 uMouse;
uniform float uSpacing;
uniform float uPlusSize;
uniform float uStrokeWidth;
uniform float uMouseRadius;
uniform float uPushStrength;
uniform vec3 uAccent;
uniform float uStaticOpacity;
uniform float uHoverBoost;

float plusMask(vec2 local, float hp, float hs) {
  float h = step(abs(local.x), hs) * step(abs(local.y), hp);
  float v = step(abs(local.y), hs) * step(abs(local.x), hp);
  return max(h, v);
}

void main() {
  // gl_FragCoord is physical pixels, bottom-left origin. Convert to CSS px,
  // top-left origin to match the mouse coordinate space.
  vec2 p = gl_FragCoord.xy / uDpr;
  p.y = (uResolution.y / uDpr) - p.y;

  float hp = uPlusSize * 0.5;
  float hs = uStrokeWidth * 0.5;
  float mouseDist = length(p - uMouse);
  float searchR = uMouseRadius + uPushStrength;

  vec2 cellId = floor(p / uSpacing);
  float alpha = 0.0;

  if (mouseDist > searchR) {
    // Far from the cursor: single at-origin plus from the current cell.
    vec2 center = (cellId + 0.5) * uSpacing;
    alpha = plusMask(p - center, hp, hs) * uStaticOpacity;
  } else {
    // Inside the warp halo: a sign from a neighbor cell may have been pushed
    // into this fragment. Test a 5x5 neighborhood.
    for (int dy = -2; dy <= 2; dy++) {
      for (int dx = -2; dx <= 2; dx++) {
        vec2 cid = cellId + vec2(float(dx), float(dy));
        vec2 orig = (cid + 0.5) * uSpacing;
        vec2 toCell = orig - uMouse;
        float d = length(toCell);
        vec2 displaced = orig;
        if (d < uMouseRadius && d > 0.0001) {
          float strength = (uMouseRadius - d) / uMouseRadius;
          displaced += (toCell / d) * strength * uPushStrength;
        }
        float m = plusMask(p - displaced, hp, hs);
        if (m > 0.0) {
          float dmouse = length(displaced - uMouse);
          float boost = max(0.0, 1.0 - dmouse / uMouseRadius) * uHoverBoost;
          alpha = max(alpha, uStaticOpacity + boost);
        }
      }
    }
  }

  gl_FragColor = vec4(uAccent, alpha);
}`;

type Mode = 'gl' | 'fallback';

const detectInitialMode = (): Mode => {
  if (typeof window === 'undefined') return 'fallback';
  const spacing = computeGridSpacing(window.innerWidth);
  document.documentElement.style.setProperty('--plus-grid-spacing', `${spacing}px`);
  if (window.matchMedia('(pointer: coarse)').matches) return 'fallback';
  if (window.innerWidth < MOBILE_BREAKPOINT) return 'fallback';
  return 'gl';
};

function compileShader(
  gl: WebGLRenderingContext,
  type: number,
  src: string,
): WebGLShader | null {
  const sh = gl.createShader(type);
  if (!sh) return null;
  gl.shaderSource(sh, src);
  gl.compileShader(sh);
  if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('[InteractiveBackground] shader compile:', gl.getShaderInfoLog(sh));
    }
    gl.deleteShader(sh);
    return null;
  }
  return sh;
}

export function InteractiveBackground() {
  const reducedMotion = useReducedMotion();
  const { color: accentColor } = useAccentColor();

  const [mode, setMode] = useState<Mode>('fallback');
  useEffect(() => {
    setMode(detectInitialMode());
  }, []);
  const effectiveMode: Mode = reducedMotion ? 'fallback' : mode;

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const glRef = useRef<WebGLRenderingContext | null>(null);
  const uniformsRef = useRef<Record<string, WebGLUniformLocation | null>>({});

  const mouseRef = useRef({ x: FAR, y: FAR });
  const easedRef = useRef({ x: FAR, y: FAR });
  const isHoveringRef = useRef(false);

  const moveFactorRef = useRef(0);
  const lastMoveAtRef = useRef(0);

  const accentRgbRef = useRef<[number, number, number]>([0.384, 0.714, 0.796]);

  const tickerActiveRef = useRef(false);
  const animateRef = useRef<(() => void) | null>(null);

  const stopTicker = useCallback(() => {
    if (tickerActiveRef.current && animateRef.current) {
      gsap.ticker.remove(animateRef.current);
      tickerActiveRef.current = false;
    }
  }, []);
  const startTicker = useCallback(() => {
    if (!tickerActiveRef.current && animateRef.current) {
      gsap.ticker.add(animateRef.current);
      tickerActiveRef.current = true;
    }
  }, []);

  useEffect(() => {
    if (effectiveMode !== 'gl') return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    let program: WebGLProgram | null = null;
    let vert: WebGLShader | null = null;
    let frag: WebGLShader | null = null;
    let buf: WebGLBuffer | null = null;

    const setupGL = (): boolean => {
      const opts: WebGLContextAttributes = {
        alpha: true,
        premultipliedAlpha: false,
        antialias: false,
        powerPreference: 'low-power',

        preserveDrawingBuffer: true,
      };
      const gl = (canvas.getContext('webgl', opts) ||
        canvas.getContext('experimental-webgl', opts)) as WebGLRenderingContext | null;
      if (!gl) {
        if (process.env.NODE_ENV !== 'production') {
          console.info('[InteractiveBackground] mode=fallback reason=no-webgl');
        }
        return false;
      }
      vert = compileShader(gl, gl.VERTEX_SHADER, VERT_SRC);
      frag = compileShader(gl, gl.FRAGMENT_SHADER, FRAG_SRC);
      if (!vert || !frag) return false;
      program = gl.createProgram();
      if (!program) return false;
      gl.attachShader(program, vert);
      gl.attachShader(program, frag);
      gl.linkProgram(program);
      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        if (process.env.NODE_ENV !== 'production') {
          console.error('[InteractiveBackground] link:', gl.getProgramInfoLog(program));
        }
        return false;
      }
      gl.useProgram(program);

      buf = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, buf);
      gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
        gl.STATIC_DRAW,
      );
      const aPos = gl.getAttribLocation(program, 'aPos');
      gl.enableVertexAttribArray(aPos);
      gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

      gl.enable(gl.BLEND);

      gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
      gl.clearColor(0, 0, 0, 0);

      uniformsRef.current = {
        uResolution: gl.getUniformLocation(program, 'uResolution'),
        uDpr: gl.getUniformLocation(program, 'uDpr'),
        uMouse: gl.getUniformLocation(program, 'uMouse'),
        uSpacing: gl.getUniformLocation(program, 'uSpacing'),
        uPlusSize: gl.getUniformLocation(program, 'uPlusSize'),
        uStrokeWidth: gl.getUniformLocation(program, 'uStrokeWidth'),
        uMouseRadius: gl.getUniformLocation(program, 'uMouseRadius'),
        uPushStrength: gl.getUniformLocation(program, 'uPushStrength'),
        uAccent: gl.getUniformLocation(program, 'uAccent'),
        uStaticOpacity: gl.getUniformLocation(program, 'uStaticOpacity'),
        uHoverBoost: gl.getUniformLocation(program, 'uHoverBoost'),
      };
      glRef.current = gl;

      if (process.env.NODE_ENV !== 'production') {
        const renderer = gl.getParameter(gl.RENDERER) || 'unknown';
        console.info(`[InteractiveBackground] mode=webgl renderer="${renderer}"`);
      }
      return true;
    };

    const resize = () => {
      const gl = glRef.current;
      if (!gl) return;
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const isMobile = vw < MOBILE_BREAKPOINT;
      const dpr = Math.min(
        window.devicePixelRatio || 1,
        isMobile ? DPR_CAP_MOBILE : DPR_CAP_DESKTOP,
      );
      canvas.width = Math.round(vw * dpr);
      canvas.height = Math.round(vh * dpr);
      canvas.style.width = `${vw}px`;
      canvas.style.height = `${vh}px`;
      const spacing = computeGridSpacing(vw);
      document.documentElement.style.setProperty('--plus-grid-spacing', `${spacing}px`);
      gl.viewport(0, 0, canvas.width, canvas.height);
      const u = uniformsRef.current;
      gl.uniform2f(u.uResolution!, canvas.width, canvas.height);
      gl.uniform1f(u.uDpr!, dpr);
      gl.uniform1f(u.uSpacing!, spacing);
      gl.uniform1f(u.uPlusSize!, PLUS_SIZE);
      gl.uniform1f(u.uStrokeWidth!, STROKE_WIDTH);
      gl.uniform1f(u.uMouseRadius!, MOUSE_RADIUS);
      gl.uniform1f(u.uPushStrength!, PUSH_STRENGTH);
      gl.uniform1f(u.uStaticOpacity!, STATIC_OPACITY);
      gl.uniform1f(u.uHoverBoost!, HOVER_OPACITY_BOOST);
      const [r, g, b] = accentRgbRef.current;
      gl.uniform3f(u.uAccent!, r, g, b);
      
      gl.uniform2f(u.uMouse!, easedRef.current.x, easedRef.current.y);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
    };

    if (!setupGL()) {
      setMode('fallback');
      return;
    }
    resize();

    const animate = () => {
      const gl = glRef.current;
      if (!gl) return;
      if (document.hidden) return;

      const e = easedRef.current;
      const m = mouseRef.current;
      const tx = isHoveringRef.current ? m.x : FAR;
      const ty = isHoveringRef.current ? m.y : FAR;
      e.x += (tx - e.x) * MOUSE_EASE;
      e.y += (ty - e.y) * MOUSE_EASE;

      const now = performance.now();
      const idle = !isHoveringRef.current || now - lastMoveAtRef.current > IDLE_TIMEOUT_MS;
      if (idle) moveFactorRef.current *= MOVE_DECAY;

      const u = uniformsRef.current;
      gl.uniform1f(u.uPushStrength!, PUSH_STRENGTH * moveFactorRef.current);
      gl.uniform2f(u.uMouse!, e.x, e.y);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLES, 0, 6);

      const converged =
        Math.abs(tx - e.x) < 0.01 && Math.abs(ty - e.y) < 0.01;
      if (converged && moveFactorRef.current < 0.001) {
        moveFactorRef.current = 0;
        stopTicker();
      }
    };
    animateRef.current = animate;

    const onMove = (ev: MouseEvent) => {
      if (easedRef.current.x < OFFSCREEN) {

        easedRef.current.x = ev.clientX;
        easedRef.current.y = ev.clientY;
      }
      mouseRef.current.x = ev.clientX;
      mouseRef.current.y = ev.clientY;
      isHoveringRef.current = true;
      moveFactorRef.current = 1;
      lastMoveAtRef.current = performance.now();
      startTicker();
    };
    const onLeave = () => {
      isHoveringRef.current = false;
      startTicker();
    };
    const onMouseOut = (ev: MouseEvent) => {
      if (!ev.relatedTarget) onLeave();
    };
    const onResize = () => {
      resize();
      startTicker();
    };
    const onLost = (ev: Event) => {

      ev.preventDefault();
      if (process.env.NODE_ENV !== 'production') {
        console.warn('[InteractiveBackground] WebGL context lost — awaiting restore');
      }
      stopTicker();
      glRef.current = null;
      program = null;
      vert = null;
      frag = null;
      buf = null;
      uniformsRef.current = {};
    };
    const onRestored = () => {
      if (process.env.NODE_ENV !== 'production') {
        console.info('[InteractiveBackground] WebGL context restored — rebuilding');
      }
      if (!setupGL()) {
        setMode('fallback');
        return;
      }
      resize();
      startTicker();
    };

    window.addEventListener('mousemove', onMove, { passive: true });
    window.addEventListener('mouseout', onMouseOut);
    window.addEventListener('blur', onLeave);
    window.addEventListener('resize', onResize);
    canvas.addEventListener('webglcontextlost', onLost);
    canvas.addEventListener('webglcontextrestored', onRestored);

    return () => {
      stopTicker();
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseout', onMouseOut);
      window.removeEventListener('blur', onLeave);
      window.removeEventListener('resize', onResize);
      canvas.removeEventListener('webglcontextlost', onLost);
      canvas.removeEventListener('webglcontextrestored', onRestored);

      const gl = glRef.current;
      if (gl) {
        if (program) gl.deleteProgram(program);
        if (vert) gl.deleteShader(vert);
        if (frag) gl.deleteShader(frag);
        if (buf) gl.deleteBuffer(buf);
        gl.getExtension('WEBGL_lose_context')?.loseContext();
      }
      glRef.current = null;
      uniformsRef.current = {};
    };
  }, [effectiveMode, startTicker, stopTicker]);

  useEffect(() => {
    const { r, g, b } = hexToRgb(accentColor);
    const norm: [number, number, number] = [r / 255, g / 255, b / 255];
    
    accentRgbRef.current = norm;

    if (effectiveMode !== 'gl') return;
    const gl = glRef.current;
    const u = uniformsRef.current.uAccent;
    if (gl && u) {
      gl.uniform3f(u, norm[0], norm[1], norm[2]);
      startTicker();
    }
  }, [accentColor, effectiveMode, startTicker]);

  if (effectiveMode === 'fallback') {
    return (
      <div className={styles.root} aria-hidden="true">
        <div className={styles.staticGrid} />
      </div>
    );
  }
  return (
    <div className={styles.root} aria-hidden="true">
      <canvas ref={canvasRef} className={styles.glCanvas} />
    </div>
  );
}
