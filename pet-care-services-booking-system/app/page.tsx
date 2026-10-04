'use client';

import React from 'react';
import Navbar from './components/Navbar';
import HeroSection from './components/HeroSection';
import PlatformFeatures from './components/PlatformFeatures';
import ServiceCatalog from './components/ServiceCatalog';
import Footer from './components/Footer';

export default function Home() {
  return (
    <main className="min-h-screen bg-white text-slate-800 flex flex-col relative selection:bg-rose-100 selection:text-rose-700">
      
      {/* Modern Frosted Navbar */}
      <Navbar />

      {/* Hero Header with Dogs & Cats Banner */}
      <HeroSection />

      {/* Platform Value & Features (Attracting potential clients) */}
      <PlatformFeatures />

      {/* Service Catalog & Live Rates */}
      <ServiceCatalog />

      {/* Clean Footer */}
      <Footer />

    </main>
  );
}
