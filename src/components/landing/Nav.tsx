"use client";

import { useState } from "react";
import { Menu, X, Car } from "lucide-react";

const links = [
  { href: "#features", label: "Features" },
  { href: "#for-dealers", label: "For Dealers" },
  { href: "#for-insurers", label: "For Insurers" },
  { href: "#how-it-works", label: "How It Works" },
];

export default function Nav({ onBookDemo }: { onBookDemo: () => void }) {
  const [open, setOpen] = useState(false);

  const handleClick = (href: string) => {
    setOpen(false);
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-gray-900/95 backdrop-blur border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <a href="#" className="flex items-center gap-2.5">
            <div className="p-1.5 bg-blue-600 rounded-lg">
              <Car className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold text-white">Vehicle Tracker</span>
          </a>

          <div className="hidden md:flex items-center gap-8">
            {links.map((link) => (
              <button
                key={link.href}
                onClick={() => handleClick(link.href)}
                className="text-sm text-gray-300 hover:text-white transition-colors"
              >
                {link.label}
              </button>
            ))}
            <button
              onClick={onBookDemo}
              className="px-5 py-2.5 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-500 transition-all"
            >
              Book a Demo
            </button>
          </div>

          <button
            onClick={() => setOpen(!open)}
            className="md:hidden p-2 text-gray-300 hover:text-white"
          >
            {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="md:hidden bg-gray-900 border-t border-white/10 px-4 py-4 space-y-3">
          {links.map((link) => (
            <button
              key={link.href}
              onClick={() => handleClick(link.href)}
              className="block w-full text-left text-sm text-gray-300 hover:text-white py-2"
            >
              {link.label}
            </button>
          ))}
          <button
            onClick={() => { setOpen(false); onBookDemo(); }}
            className="w-full px-5 py-2.5 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-500"
          >
            Book a Demo
          </button>
        </div>
      )}
    </nav>
  );
}
