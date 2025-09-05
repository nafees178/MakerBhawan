"use client";

import DockNavigation from '@/components/DockNavigation';
import HomeSection from '@/components/sections/HomeSection';
import AboutSection from '@/components/sections/AboutSection';
import FacilitiesSection from '@/components/sections/FacilitiesSection';
import ProjectsSection from '@/components/sections/ProjectsSection';
import EventsSection from '@/components/sections/EventsSection';
import TeamSection from '@/components/sections/TeamSection';
import GallerySection from '@/components/sections/GallerySection';
import ContactSection from '@/components/sections/ContactSection';

export default function Home() {
  return (
    <main className="relative min-h-screen">
      <HomeSection />
      <AboutSection />
      <FacilitiesSection />
      <ProjectsSection />
      <EventsSection />
      <TeamSection />
      <GallerySection />
      <ContactSection />
      
      <DockNavigation />
    </main>
  );
}