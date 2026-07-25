'use client';

import { TransitionLink } from "@/components/transitions";
import { DsaRaceTrack } from "@/components/sections/Philosophy/DsaRaceTrack";
import { AiVisualizer } from "@/components/sections/AiVisualizer";
import { IotVisualizer } from "@/components/sections/IotVisualizer/IotVisualizer";
import { MemoryVisualizer } from "@/components/sections/MemoryVisualizer/MemoryVisualizer";
import { Contact } from "@/components/sections/Contact";
import { MetaLabel } from "@/components/ui/MetaLabel";
import styles from "./ArcadePage.module.css";

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
