import { useCallback, useState } from 'react';

import { AboutSection } from './components/AboutSection';
import { CanvasOrnaments } from './components/CanvasOrnaments';
import { DevNoticeDialog } from './components/DevNoticeDialog';
import { Hero } from './components/Hero';
import { IntroOverlay } from './components/IntroOverlay';
import { SectionConnector } from './components/SectionConnector';
import { StructureSection } from './components/StructureSection';
import { TeacherSection } from './components/TeacherSection';
import { MemoriesSection } from './components/MemoriesSection';

/** Welcome hanya diputar sekali per muat halaman, bukan tiap navigasi. */
let introPlayed = false;

/** Popup info pengembangan hanya tampil sekali per sesi browser. */
const DEV_NOTICE_KEY = 'craftly:dev-notice-seen';

/** Intro hanya tampil di layar desktop; mobile langsung ke konten. */
const DESKTOP_QUERY = '(min-width: 768px)';

export default function LandingPage() {
  const [introVisible, setIntroVisible] = useState(
    () => !introPlayed && window.matchMedia(DESKTOP_QUERY).matches,
  );

  const [noticeOpen, setNoticeOpen] = useState(
    () => window.sessionStorage.getItem(DEV_NOTICE_KEY) !== '1',
  );

  const handleIntroDone = useCallback(() => {
    introPlayed = true;
    setIntroVisible(false);
  }, []);

  const handleNoticeClose = useCallback(() => {
    window.sessionStorage.setItem(DEV_NOTICE_KEY, '1');
    setNoticeOpen(false);
  }, []);

  return (
    <div className="page-landing landing-canvas">
      {introVisible ? <IntroOverlay onDone={handleIntroDone} /> : null}
      {!introVisible ? <DevNoticeDialog open={noticeOpen} onClose={handleNoticeClose} /> : null}
      <CanvasOrnaments />
      <Hero />
      <AboutSection />
      <SectionConnector />
      <TeacherSection />
      <StructureSection />
      <MemoriesSection />
    </div>
  );
}
