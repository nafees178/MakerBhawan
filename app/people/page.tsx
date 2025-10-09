"use client";

import DockNavigation from '@/components/DockNavigation';
import TeamSection from '@/components/sections/TeamSection';

export default function PeoplePage() {
  return (
    <main className="relative min-h-screen">
      <TeamSection />
      <DockNavigation />
    </main>
  );
}
