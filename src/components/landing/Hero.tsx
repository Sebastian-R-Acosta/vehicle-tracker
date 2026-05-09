"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowRight, Play } from "lucide-react";
import Link from "next/link";

const stats = [
  { label: "Vehicles Tracked", target: 50000, suffix: "+" },
  { label: "Dealerships", target: 500, suffix: "+" },
  { label: "Service Records", target: 250000, suffix: "+" },
];

function AnimatedCounter({ target, suffix }: { target: number; suffix: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const counted = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !counted.current) {
          counted.current = true;
          const duration = 2000;
          const steps = 60;
          const increment = target / steps;
          let current = 0;
          const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
              setCount(target);
              clearInterval(timer);
            } else {
              setCount(Math.floor(current));
            }
          }, duration / steps);
        }
      },
      { threshold: 0.5 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [target]);

  return (
    <div ref={ref} className="text-4xl md:text-5xl font-bold text-white">
      {count.toLocaleString()}{suffix}
    </div>
  );
}

export default function Hero({ onBookDemo }: { onBookDemo?: () => void }) {
  return (
    <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.12),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(255,255,255,0.08),transparent_50%)]" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center py-32">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 rounded-full text-sm text-blue-100 mb-8">
          <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          Enterprise-grade vehicle management platform
        </div>

        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-tight mb-6">
          Track Everything.
          <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-200 to-cyan-200">
            Never Miss a Service. Sell with Confidence.
          </span>
        </h1>

        <p className="text-lg md:text-xl text-blue-100 max-w-2xl mx-auto mb-10 leading-relaxed">
          The all-in-one vehicle history platform for car owners, dealerships, and insurance
          companies. Track maintenance, automate reminders, and generate reports — all from one place.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
          <Link
            href="/register"
            className="inline-flex items-center gap-2 px-8 py-3.5 text-base font-semibold text-white bg-gray-900 rounded-xl hover:bg-gray-800 transition-all shadow-xl hover:shadow-2xl"
          >
            Get Started Free
            <ArrowRight className="w-4 h-4" />
          </Link>
          <button
            onClick={onBookDemo}
            className="inline-flex items-center gap-2 px-8 py-3.5 text-base font-medium text-white border border-white/30 rounded-xl hover:bg-white/10 transition-all"
          >
            <Play className="w-4 h-4" />
            Book a Demo
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-3xl mx-auto">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <AnimatedCounter target={stat.target} suffix={stat.suffix} />
              <div className="text-sm text-blue-200 mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
