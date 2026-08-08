import dynamic from 'next/dynamic';
import { Hero } from '@/components/sections/Hero';
import { Projects } from '@/components/sections/Projects';
import { Archive } from '@/components/sections/Archive';
import { QuoteReveal } from '@/components/sections/QuoteReveal';
import { WelcomeScreen } from '@/components/ui/WelcomeScreen';

const Philosophy = dynamic(() => import('@/components/sections/Philosophy').then((mod) => mod.Philosophy));
const ServicesV2 = dynamic(() => import('@/components/sections/ServicesV2').then((mod) => mod.ServicesV2));
const Workflow = dynamic(() => import('@/components/sections/Workflow').then((mod) => mod.Workflow));
const Contact = dynamic(() => import('@/components/sections/Contact').then((mod) => mod.Contact));

export default function Home() {
  return (
    <>
      <WelcomeScreen />
      <Hero />
      <Philosophy />
      <ServicesV2 />
      <Projects />
      <Archive />
      <Workflow />
      <QuoteReveal />
      <Contact />
    </>
  );
}

