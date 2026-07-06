'use client';

import Link from "next/link";
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
      {/* Intro Header Section */}
      <section className={styles.heroSection}>
        <div className={styles.headerContent}>
          <MetaLabel>Interactive Systems</MetaLabel>
          <h1 className={styles.title}>Arcade</h1>
          <p className={styles.lede}>
            A testing ground for optimized algorithmic engines, autonomous prompt routing, 
            and telemetry visualization.
          </p>
          <div className={styles.launchGroup}>
            <Link href="/arcade/circuit-board" className={styles.launchBtn}>
              LAUNCH INTERACTIVE LOGIC BOARD SIMULATOR →
            </Link>
          </div>
        </div>
      </section>

      {/* Section 1: Complexity Race Arena */}
      <section className={styles.section} id="race-arena">
        <DsaRaceTrack />
      </section>

      {/* Section 2: Stack & Heap Allocator */}
      <section className={styles.section} id="memory-visualizer">
        <MemoryVisualizer />
      </section>

      {/* Section 3: IoT Telemetry Visualizer */}
      <section className={styles.section} id="iot-visualizer">
        <IotVisualizer />
      </section>

      {/* Section 4: Agentic AI Flow */}
      <AiVisualizer />

      {/* Contact Footer */}
      <Contact />
    </main>
  );
}
