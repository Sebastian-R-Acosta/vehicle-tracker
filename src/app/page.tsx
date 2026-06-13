"use client";

import { useState } from "react";
import Nav from "@/components/landing/Nav";
import Hero from "@/components/landing/Hero";
import TrustBar from "@/components/landing/TrustBar";
import Features from "@/components/landing/Features";
import ForIndividuals from "@/components/landing/ForIndividuals";

import Testimonials from "@/components/landing/Testimonials";
import CTA from "@/components/landing/CTA";
import Footer from "@/components/landing/Footer";
import DemoModal from "@/components/landing/DemoModal";

export default function HomePage() {
  const [demoOpen, setDemoOpen] = useState(false);

  return (
    <div className="bg-white">
      <Nav onBookDemo={() => setDemoOpen(true)} />
      <Hero onBookDemo={() => setDemoOpen(true)} />
      <TrustBar />
      <Features />
      <ForIndividuals />
      <Testimonials />
      <CTA onBookDemo={() => setDemoOpen(true)} />
      <Footer />
      <DemoModal open={demoOpen} onClose={() => setDemoOpen(false)} />
    </div>
  );
}
