"use client";

import Image from "next/image";
import { Fragment, useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import type { DashboardContent } from "@/data";
import styles from "./Dashboard.module.css";

const DASHBOARD_PIN_VH = 1.2;

export const Dashboard = ({ badge, figcaption, image, alt }: DashboardContent) => {
  const sectionRef = useRef<HTMLElement>(null);
  const frameRef = useRef<HTMLElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const slotRef = useRef<HTMLDivElement>(null);
  const badgeRef = useRef<HTMLSpanElement>(null);
  const cornerRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const section = sectionRef.current;
      const frame = frameRef.current;
      const image = imageRef.current;
      const slot = slotRef.current;
      if (!section || !frame || !image || !slot) return;

      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {

        const computeTarget = () => {
          const t = slot.getBoundingClientRect();
          if (t.width === 0 || t.height === 0) {
            return {
              left: 0,
              top: 0,
              width: window.innerWidth,
              height: window.innerHeight,
            };
          }
          const s = section.getBoundingClientRect();
          return {
            left: t.left - s.left,
            top: t.top - s.top,
            width: t.width,
            height: t.height,
          };
        };

        const readRadius = () =>
          parseFloat(getComputedStyle(slot).borderTopLeftRadius) || 0;

        const masterTL = gsap
          .timeline()
          .fromTo(
            frame,
            {
              left: 0,
              top: 0,
              width: () => window.innerWidth,
              height: () => window.innerHeight,
              "--card-radius": "0px",
              boxShadow: "0 0 0 0 rgba(0, 0, 0, 0)",
              immediateRender: false,
            },
            {
              left: () => computeTarget().left,
              top: () => computeTarget().top,
              width: () => computeTarget().width,
              height: () => computeTarget().height,
              "--card-radius": () => readRadius() + "px",
              boxShadow:
                "0 30px 80px -20px rgba(27, 32, 40, 0.18)",
              ease: "power2.inOut",
              duration: 0.85,
            },
            0
          )
          .fromTo(
            image,
            { scale: 1.06, yPercent: -3 },
            {
              scale: 1,
              yPercent: 0,
              ease: "none",
              duration: 0.85,
            },
            0
          )
          .fromTo(
            [badgeRef.current, cornerRef.current],
            { autoAlpha: 0, immediateRender: false },
            {
              autoAlpha: 1,
              duration: 0.15,
              ease: "power2.out",
              stagger: 0.04,
            },
            0.9
          );

        const pin = ScrollTrigger.create({
          trigger: section,
          start: "top top",
          end: () => "+=" + window.innerHeight * DASHBOARD_PIN_VH,
          pin: true,
          pinType: "fixed",
          scrub: 0.5,
          animation: masterTL,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        });

        return () => {

          const savedScrollY = window.scrollY;

          pin.kill(true);
          gsap.set(frame, { clearProps: "all" });

          gsap.set(image, { clearProps: "scale,yPercent,transform" });
          gsap.set([badgeRef.current, cornerRef.current], {
            clearProps: "all",
          });

          if (window.scrollY !== savedScrollY) window.scrollTo(0, savedScrollY);
        };
      });
    },
    { scope: sectionRef }
  );

  return (
    <section ref={sectionRef} className={styles.dashboard}>
      <div className={styles.slotWrap} aria-hidden="true">
        <div className={styles.slotContainer}>
          <div
            ref={slotRef}
            className={styles.slot}
            role="presentation"
          />
        </div>
      </div>
      <figure ref={frameRef} className={styles.frame}>
        <Image
          ref={imageRef}
          className={styles.image}
          src={image}
          alt={alt}
          width={2400}
          height={1500}
          sizes="(min-width: 1512px) 1440px, 100vw"
          unoptimized
        />
        {badge && (
          <span ref={badgeRef} className={styles.badge} aria-hidden>
            {badge.split("\n").map((line, i, arr) => (
              <Fragment key={i}>
                {line}
                {i < arr.length - 1 && <br />}
              </Fragment>
            ))}
          </span>
        )}
        {figcaption && (
          <figcaption ref={cornerRef} className={styles.corner}>
            {figcaption}
          </figcaption>
        )}
      </figure>
    </section>
  );
};
