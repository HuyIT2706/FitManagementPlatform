import React from 'react';
import LandingNavbar from '../components/landing/LandingNavbar';
import HeroSection from '../components/landing/HeroSection';
import InteractiveAiScanner from '../components/landing/InteractiveAiScanner';
import ComparisonSection from '../components/landing/ComparisonSection';
import TestimonialsSection from '../components/landing/TestimonialsSection';
import RoleSwitcher from '../components/landing/RoleSwitcher';
import FaqSection from '../components/landing/FaqSection';
import CtaBanner from '../components/landing/CtaBanner';
import LandingFooter from '../components/landing/LandingFooter';
import RootAuthGate from '../components/landing/RootAuthGate';

export default function LandingPage() {
  return (
    <RootAuthGate>
      <div className="min-h-screen bg-white text-zinc-900 selection:bg-zinc-900 selection:text-white font-sans overflow-x-hidden antialiased">
        <LandingNavbar />
        <main>
          <HeroSection />
          <InteractiveAiScanner />
          <ComparisonSection />
          <TestimonialsSection />
          <RoleSwitcher />
          <FaqSection />
          <CtaBanner />
        </main>
        <LandingFooter />
      </div>
    </RootAuthGate>
  );
}
