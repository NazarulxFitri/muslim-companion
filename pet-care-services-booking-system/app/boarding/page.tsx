import React from 'react';
import Navbar from '../components/Navbar';
import BoardingWizard from '../components/BoardingWizard';
import Footer from '../components/Footer';

export const metadata = {
  title: 'Pet Boarding & Hotel Suite Booking | Paws & Whiskers',
  description: 'Reserve luxury pet hotel suites, 24/7 camera access & daily updates for your cats and dogs.'
};

export default function BoardingPage() {
  return (
    <div className="bg-white min-h-screen flex flex-col justify-between">
      <div>
        <Navbar />
        <main>
          <BoardingWizard />
        </main>
      </div>
      <Footer />
    </div>
  );
}
