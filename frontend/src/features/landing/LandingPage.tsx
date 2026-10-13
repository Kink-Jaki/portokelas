import { useCallback, useState } from 'react';

import { StatsSection } from './components/Sections';
import { AboutSection } from './components/AboutSection';
import { Hero } from './components/Hero';
import { IntroOverlay } from './components/IntroOverlay';
import { StructureSection } from './components/StructureSection';
import { TeacherSection } from './components/TeacherSection';
import { MemoriesSection } from './components/MemoriesSection';

/** Welcome hanya diputar sekali per muat halaman, bukan tiap navigasi. */
let introPlayed = false;

export default function LandingPage() {
  const [introVisible, setIntroVisible] = useState(!introPlayed);

  const handleIntroDone = useCallback(() => {
    introPlayed = true;
    setIntroVisible(false);
  }, []);

  return (
    <>
      {introVisible ? <IntroOverlay onDone={handleIntroDone} /> : null}
      <Hero />
      <AboutSection />
      <TeacherSection />
      <StructureSection />
      <StatsSection />
      <MemoriesSection />
    </>
  );
}
