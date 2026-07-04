"use client";

import { useState } from "react";
import Nav from "@/components/landing/Nav";
import Hero from "@/components/landing/Hero";
import TrustBar from "@/components/landing/TrustBar";

import ForIndividuals from "@/components/landing/ForIndividuals";
import ForDealers from "@/components/landing/ForDealers";
import ForInsurers from "@/components/landing/ForInsurers";
import ForConstruction from "@/components/landing/ForConstruction";
import ForWorkshops from "@/components/landing/ForWorkshops";
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
      <ForIndividuals />
      <ForDealers />
      <ForInsurers />
      <ForWorkshops />
      <ForConstruction />
      <Testimonials />
      <CTA onBookDemo={() => setDemoOpen(true)} />
      <Footer />
      <DemoModal open={demoOpen} onClose={() => setDemoOpen(false)} />
    </div>
  );
}
