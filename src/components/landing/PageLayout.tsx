"use client";

import { useState, ReactNode } from "react";
import Nav from "./Nav";
import Footer from "./Footer";
import DemoModal from "./DemoModal";

export default function PageLayout({ children }: { children: ReactNode }) {
  const [demoOpen, setDemoOpen] = useState(false);

  return (
    <div className="bg-white min-h-screen flex flex-col">
      <Nav onBookDemo={() => setDemoOpen(true)} />
      <main className="flex-1">{children}</main>
      <Footer />
      <DemoModal open={demoOpen} onClose={() => setDemoOpen(false)} />
    </div>
  );
}
