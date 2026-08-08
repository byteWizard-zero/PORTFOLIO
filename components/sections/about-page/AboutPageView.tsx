

'use client';

import dynamic from "next/dynamic";
import { Ledger } from "@/components/sections/case-study/Ledger";
import { AboutPageIntro } from "./Intro";
import { AboutPageExperience } from "./Experience";
import { AboutPageCurrentProject } from "./CurrentProject";
import { AboutPageCredentials } from "./Credentials";
import { Footer } from "@/components/layout/Footer";

const AboutPageHeroEcho = dynamic(
  () => import("./Echo").then((mod) => mod.AboutPageHeroEcho),
  { ssr: false }
);
const AboutPageContributions = dynamic(
  () => import("./Contributions").then((mod) => mod.AboutPageContributions),
  { ssr: false }
);
const AboutPageLeetCodeStats = dynamic(
  () => import("./LeetCodeStats").then((mod) => mod.AboutPageLeetCodeStats),
  { ssr: false }
);

const VITALS = [
  { label: "Status", primary: "Full time", secondary: "Builds independently" },
  { label: "Discipline", primary: "Full Stack", secondary: "Interface to infrastructure" },
  { label: "Building", primary: "FREELLMPROXY", secondary: "Universal LLM proxy API" },
  { label: "Based in", primary: "India", secondary: "A dark room with O(1) latency" },
  { label: "Ships", primary: "Real things", secondary: "Not mockups" },
];

export function AboutPageView() {
  return (
    <main>
      <AboutPageHeroEcho />
      <Ledger entries={VITALS} />
      <AboutPageIntro />
      <AboutPageExperience />
      <AboutPageCurrentProject />
      <AboutPageContributions />
      <AboutPageLeetCodeStats />
      <AboutPageCredentials />
      <Footer />
    </main>
  );
}

