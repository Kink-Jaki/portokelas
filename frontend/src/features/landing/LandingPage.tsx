import { useCallback, useState } from 'react';

import { AboutSection } from './components/AboutSection';
import { Hero } from './components/Hero';
import { IntroOverlay } from './components/IntroOverlay';
import { StructureSection } from './components/StructureSection';
import { TeacherSection } from './components/TeacherSection';
import { MemoriesSection } from './components/MemoriesSection';

/** Welcome hanya diputar sekali per muat halaman, bukan tiap navigasi. */
let introPlayed = false;

/** Intro hanya tampil di layar desktop; mobile langsung ke konten. */
const DESKTOP_QUERY = '(min-width: 768px)';

export default function LandingPage() {
  const [introVisible, setIntroVisible] = useState(
    () => !introPlayed && window.matchMedia(DESKTOP_QUERY).matches,
  );

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
      <MemoriesSection />
    </>
  );
}
