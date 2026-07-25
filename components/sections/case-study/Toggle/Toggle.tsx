"use client";

import Image from "next/image";
import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import { useGSAP } from "@gsap/react";
import { useBlockFadeIn } from "@/lib/useBlockFadeIn";
import { useWordLineReveal } from "@/lib/useWordLineReveal";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { animationConfig } from "@/data";
import type { ToggleContent, ToggleScreen } from "@/data";
import { MetaLabel } from "@/components/ui/MetaLabel";
import { useScrollLock } from "@/lib/useScrollLock";
import styles from "./Toggle.module.css";

const cs = animationConfig.caseStudy;

type Mode = "gallery" | "list";

export const Toggle = ({ label, titleLine1, titleAccent, screens }: ToggleContent) => {
  const totalPad = String(screens.length).padStart(2, "0");
  const galleryEntries: { screen: ToggleScreen; indexInAll: number }[] = screens.flatMap(
    (s, i) => (s.hasGalleryCaption ? [{ screen: s, indexInAll: i }] : [])
  );

  const sectionRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const modesRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<HTMLDivElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const modeButtonsRef = useRef<Record<Mode, HTMLButtonElement | null>>({
    gallery: null,
    list: null,
  });

  const [mode, setMode] = useState<Mode>("list");
  const eyebrowId = useId();

  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const lightboxOverlayRef = useRef<HTMLDivElement>(null);
  const lightboxImageRef = useRef<HTMLImageElement>(null);
  const lightboxCaptionRef = useRef<HTMLDivElement>(null);

  useScrollLock(lightboxIndex !== null, { compensateScrollbar: true });

  useEffect(() => {
    if (lightboxIndex !== null) {
      if (window.lenis) {
        window.lenis.stop();
      }
      return () => {
        if (window.lenis) {
          window.lenis.start();
        }
      };
    }
  }, [lightboxIndex]);

  const selectMode = (target: Mode) => {
    setMode(target);
    requestAnimationFrame(() => modeButtonsRef.current[target]?.focus());
  };

  const handleModeKey = (e: KeyboardEvent<HTMLButtonElement>) => {
    switch (e.key) {
      case "ArrowLeft":
      case "ArrowUp":
      case "ArrowRight":
      case "ArrowDown":
        e.preventDefault();
        selectMode(mode === "gallery" ? "list" : "gallery");
        break;
      case "Home":
        e.preventDefault();
        selectMode("gallery");
        break;
      case "End":
        e.preventDefault();
        selectMode("list");
        break;
    }
  };

  const [preview, setPreview] = useState<{ visible: boolean; index: number }>(
    { visible: false, index: 0 }
  );
  const xToRef = useRef<ReturnType<typeof gsap.quickTo> | null>(null);
  const yToRef = useRef<ReturnType<typeof gsap.quickTo> | null>(null);
  
  const reducedMotion = useReducedMotion();

  useBlockFadeIn(sectionRef, {
    start: cs.scrollTrigger.early,
    groups: [
      {
        targets: [modesRef, viewRef],
        y: cs.blockFade.yTall,
        duration: cs.blockFade.durationLong,
        stagger: 0.08,
      },
    ],
  });

  useWordLineReveal(titleRef, { scope: sectionRef });

  useEffect(() => {
    let id2 = 0;
    const id1 = requestAnimationFrame(() => {
      id2 = requestAnimationFrame(() => ScrollTrigger.refresh());
    });
    return () => {
      cancelAnimationFrame(id1);
      if (id2) cancelAnimationFrame(id2);
    };
  }, [mode]);

  useEffect(() => {
    const el = previewRef.current;
    return () => {
      if (el) gsap.killTweensOf(el);
      xToRef.current = null;
      yToRef.current = null;
    };
  }, []);

  const ensureQuickTo = () => {
    if (!xToRef.current && previewRef.current) {
      xToRef.current = gsap.quickTo(previewRef.current, "left", { duration: 0.55, ease: "power3" });
      yToRef.current = gsap.quickTo(previewRef.current, "top",  { duration: 0.55, ease: "power3" });
    }
  };

  const movePreview = (clientX: number, clientY: number, snap = false) => {
    ensureQuickTo();
    if (snap || reducedMotion) {
      xToRef.current?.(clientX, clientX);
      yToRef.current?.(clientY, clientY);
    } else {
      xToRef.current?.(clientX);
      yToRef.current?.(clientY);
    }
  };
  const handleRowEnter = (index: number) => (e: React.MouseEvent) => {
    movePreview(e.clientX, e.clientY, !preview.visible);
    setPreview({ visible: true, index });
  };
  const handleRowLeave = () => setPreview((p) => ({ ...p, visible: false }));
  const handleRowMove = (e: React.MouseEvent) => {
    movePreview(e.clientX, e.clientY);
  };

  const closeLightbox = () => {
    const overlay = lightboxOverlayRef.current;
    const image = lightboxImageRef.current;
    const caption = lightboxCaptionRef.current;
    if (!overlay || !image || !caption) {
      setLightboxIndex(null);
      return;
    }

    gsap.killTweensOf([overlay, image, caption]);

    gsap.timeline({
      onComplete: () => {
        setLightboxIndex(null);
      }
    })
    .to(caption, { y: 15, opacity: 0, duration: 0.25, ease: "power2.in" }, 0)
    .to(image, { scale: 0.92, opacity: 0, duration: 0.3, ease: "power2.in" }, 0)
    .to(overlay, { opacity: 0, duration: 0.3, ease: "power2.in" }, 0.05);
  };

  useEffect(() => {
    if (lightboxIndex === null) return;
    const handleKeyDown = (e: globalThis.KeyboardEvent) => {
      if (e.key === "Escape") {
        closeLightbox();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [lightboxIndex]);

  useGSAP(() => {
    if (lightboxIndex === null) return;
    const overlay = lightboxOverlayRef.current;
    const image = lightboxImageRef.current;
    const caption = lightboxCaptionRef.current;
    if (!overlay || !image || !caption) return;

    gsap.killTweensOf([overlay, image, caption]);

    gsap.fromTo(overlay,
      { opacity: 0 },
      { opacity: 1, duration: 0.4, ease: "power2.out" }
    );

    gsap.fromTo(image,
      { scale: 0.9, opacity: 0 },
      { scale: 1, opacity: 1, duration: 0.5, ease: "back.out(1.15)", delay: 0.05 }
    );

    gsap.fromTo(caption,
      { y: 20, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.4, ease: "power2.out", delay: 0.2 }
    );
  }, { dependencies: [lightboxIndex], scope: sectionRef });

  return (
    <section
      ref={sectionRef}
      className={styles.toggle}
      aria-labelledby={eyebrowId}
    >
      <div className={styles.controls}>
        <div>
          <MetaLabel id={eyebrowId}>{label}</MetaLabel>
          <h2 ref={titleRef} className={styles.title}>
            {titleLine1}{" "}
            <span className={styles.titleAccent}>{screens.length}</span>{" "}
            {titleAccent}
          </h2>
        </div>

        <div
          ref={modesRef}
          className={styles.modes}
          role="radiogroup"
          aria-label="View mode"
        >
          <button
            type="button"
            ref={(el) => { modeButtonsRef.current.gallery = el; }}
            className={styles.modeBtn}
            role="radio"
            aria-checked={mode === "gallery"}
            tabIndex={mode === "gallery" ? 0 : -1}
            onClick={() => selectMode("gallery")}
            onKeyDown={handleModeKey}
          >
            Gallery
          </button>
          <button
            type="button"
            ref={(el) => { modeButtonsRef.current.list = el; }}
            className={styles.modeBtn}
            role="radio"
            aria-checked={mode === "list"}
            tabIndex={mode === "list" ? 0 : -1}
            onClick={() => selectMode("list")}
            onKeyDown={handleModeKey}
          >
            List
          </button>
        </div>
      </div>

      <div ref={viewRef}>
        {mode === "gallery" ? (
          <div className={styles.gallery}>
            {galleryEntries.map(({ screen: s, indexInAll }) => (
              <figure key={s.image}>
                <div className={styles.frame}>
                  <Image
                    src={s.image}
                    alt={s.name}
                    width={2400}
                    height={1500}
                    sizes="(min-width: 1024px) 33vw, 100vw"
                    unoptimized
                  />
                </div>
                <figcaption className={styles.caption}>
                  <span>{`${s.num} · ${s.name}`}</span>
                  <span>
                    {String(indexInAll + 1).padStart(2, "0")} / {totalPad}
                  </span>
                </figcaption>
              </figure>
            ))}
          </div>
        ) : (
          <div className={styles.list}>
            {screens.map((s, idx) => (
              <div
                key={s.image}
                className={styles.row}
                onMouseEnter={handleRowEnter(idx)}
                onMouseLeave={handleRowLeave}
                onMouseMove={handleRowMove}
                onClick={() => setLightboxIndex(idx)}
              >
                <span className={styles.rowN}>{s.num}</span>
                <span className={styles.rowName}>{s.name}</span>
                <span className={styles.rowDesc}>{s.description}</span>
                <span className={styles.rowMeta}>{s.meta}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div
        ref={previewRef}
        className={`${styles.preview} ${preview.visible ? styles.previewVisible : ""}`}
        aria-hidden
      >
        <div
          className={styles.previewSlider}
          style={{ transform: `translateY(-${preview.index * 100}%)` }}
        >
          {screens.map((s) => (
            <div
              key={s.image}
              className={styles.previewCard}
              style={{ background: s.color }}
            >
              <Image src={s.image} alt="" width={560} height={400} sizes="360px" unoptimized />
            </div>
          ))}
        </div>
      </div>

      {lightboxIndex !== null && (
        <div
          ref={lightboxOverlayRef}
          className={styles.lightboxOverlay}
          onClick={closeLightbox}
        >
          <div className={styles.lightboxContent} onClick={(e) => e.stopPropagation()}>
            <Image
              ref={lightboxImageRef}
              src={screens[lightboxIndex].image}
              alt={screens[lightboxIndex].name}
              width={1920}
              height={1200}
              className={styles.lightboxImage}
              onClick={closeLightbox}
              unoptimized
            />
            <div ref={lightboxCaptionRef} className={styles.lightboxCaption}>
              <span className={styles.lightboxCaptionNum}>{screens[lightboxIndex].num}</span>
              <span className={styles.lightboxCaptionName}>{screens[lightboxIndex].name}</span>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
