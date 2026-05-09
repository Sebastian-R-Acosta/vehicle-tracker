"use client";

import { useEffect, useRef, useState } from "react";
import { Shield, BarChart3, FileSearch, CheckCircle } from "lucide-react";
import Link from "next/link";

const benefits = [
  {
    icon: FileSearch,
    title: "Claims Verification",
    description: "Tamper-proof service records give you the data you need to validate claims quickly.",
  },
  {
    icon: BarChart3,
    title: "Risk Scoring",
    description: "Score policyholders on maintenance history. Reward well-maintained vehicles with better rates.",
  },
  {
    icon: Shield,
    title: "Fleet Management",
    description: "Monitor entire commercial fleets from one dashboard. Automated alerts for compliance gaps.",
  },
];

export default function ForInsurers() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.disconnect(); } },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section id="for-insurers" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          ref={ref}
          className={`grid lg:grid-cols-2 gap-12 lg:gap-20 items-center transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
        >
          <div className="order-2 lg:order-1">
            <div className="bg-gray-200 rounded-2xl aspect-[4/3] flex items-center justify-center">
              <span className="text-gray-400 font-medium">Analytics Preview</span>
            </div>
          </div>

          <div className="order-1 lg:order-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-100 text-indigo-700 text-sm font-medium rounded-full mb-6">
              For Insurance
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Know What You&apos;re Insuring. Every Mile, Every Service.
            </h2>
            <p className="text-lg text-gray-500 mb-8 leading-relaxed">
              Make underwriting decisions with confidence. Vehicle Tracker gives insurers a complete
              view of every vehicle&apos;s maintenance history, service gaps, and ownership changes.
            </p>
            <div className="space-y-6">
              {benefits.map((b) => {
                const Icon = b.icon;
                return (
                  <div key={b.title} className="flex gap-4">
                    <div className="flex-shrink-0 w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center">
                      <Icon className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">{b.title}</h4>
                      <p className="text-sm text-gray-500">{b.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-8 flex items-center gap-4 text-sm text-gray-500">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>API-ready for integration with your existing systems</span>
            </div>
            <Link
              href="/solutions/insurers"
              className="inline-flex items-center gap-1 mt-6 text-sm text-indigo-600 hover:text-indigo-500 font-medium"
            >
              Learn more for insurers &rarr;
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
