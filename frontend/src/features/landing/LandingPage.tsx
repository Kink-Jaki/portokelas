import { StatsSection, ClosingCta } from './components/Sections';
import { AboutSection } from './components/AboutSection';
import { Hero } from './components/Hero';
import { StructureSection } from './components/StructureSection';
import { TeacherSection } from './components/TeacherSection';
import { AppSidebar } from '@/components/layout/AppSidebar';

export default function LandingPage() {
  return (
    <>
      <AppSidebar />
      <div className="lg:pl-64">
        <Hero />
        <AboutSection />
        <TeacherSection />
        <StructureSection />
        <StatsSection />
        <ClosingCta />
      </div>
    </>
  );
}