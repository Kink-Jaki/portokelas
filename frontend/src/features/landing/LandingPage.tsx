import { StatsSection, ClosingCta } from './components/Sections';
import { AboutSection } from './components/AboutSection';
import { Hero } from './components/Hero';
import { StructureSection } from './components/StructureSection';
import { TeacherSection } from './components/TeacherSection';

export default function LandingPage() {
  return (
    <>
      <Hero />
      <AboutSection />
      <TeacherSection />
      <StructureSection />
      <StatsSection />
      <ClosingCta />
    </>
  );
}