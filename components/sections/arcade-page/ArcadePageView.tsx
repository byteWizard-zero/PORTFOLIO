'use client';

import dynamic from "next/dynamic";
import { TransitionLink } from "@/components/transitions";
import { MetaLabel } from "@/components/ui/MetaLabel";
import styles from "./ArcadePage.module.css";

const DsaRaceTrack = dynamic(
  () => import("@/components/sections/Philosophy/DsaRaceTrack").then((mod) => mod.DsaRaceTrack),
  { ssr: false }
);
const MemoryVisualizer = dynamic(
  () => import("@/components/sections/MemoryVisualizer/MemoryVisualizer").then((mod) => mod.MemoryVisualizer),
  { ssr: false }
);
const IotVisualizer = dynamic(
  () => import("@/components/sections/IotVisualizer/IotVisualizer").then((mod) => mod.IotVisualizer),
  { ssr: false }
);
const AiVisualizer = dynamic(
  () => import("@/components/sections/AiVisualizer").then((mod) => mod.AiVisualizer),
  { ssr: false }
);
const Contact = dynamic(
  () => import("@/components/sections/Contact").then((mod) => mod.Contact),
  { ssr: false }
);

export function ArcadePageView() {
  return (
    <main className={styles.main}>
      
      <section className={styles.heroSection}>
        <div className={styles.headerContent}>
          <MetaLabel>Interactive Systems</MetaLabel>
          <h1 className={styles.title}>Arcade</h1>
          <p className={styles.lede}>
            A testing ground for optimized algorithmic engines, autonomous prompt routing, 
            and telemetry visualization.
          </p>
          <div className={styles.launchGroup}>
            <TransitionLink 
              href="/arcade/circuit-board" 
              className={styles.launchBtn}
              payload={{ accent: '#62B6CB' }}
            >
              LAUNCH INTERACTIVE LOGIC BOARD SIMULATOR →
            </TransitionLink>
          </div>
        </div>
      </section>

      <section className={styles.section} id="race-arena">
        <DsaRaceTrack />
      </section>

      <section className={styles.section} id="memory-visualizer">
        <MemoryVisualizer />
      </section>

      <section className={styles.section} id="iot-visualizer">
        <IotVisualizer />
      </section>

      <AiVisualizer />

      <Contact />
    </main>
  );
}
