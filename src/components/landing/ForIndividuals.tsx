"use client";

import { useEffect, useRef, useState } from "react";
import { Smartphone, Bell, FileText, Car, Gauge, RefreshCw } from "lucide-react";
import Link from "next/link";

const perks = [
  { icon: Smartphone, title: "Mobile-Friendly Dashboard", description: "Track all your vehicles from any device. No app download needed." },
  { icon: Bell, title: "Smart Service Reminders", description: "Get notified when it's time for an oil change, tire rotation, or inspection." },
  { icon: FileText, title: "Free PDF Reports", description: "Generate a complete vehicle history report to share with buyers or mechanics." },
  { icon: Car, title: "Up to 2 Vehicles Free", description: "Track two vehicles at no cost. Upgrade to Pro for unlimited." },
  { icon: Gauge, title: "Mileage Tracking", description: "Log odometer readings automatically when you add a service record." },
  { icon: RefreshCw, title: "Transfer Ready", description: "When you sell your car, generate a transfer code so the next owner gets the full history." },
];

export default function ForIndividuals() {
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
    <section id="for-individuals" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-100 text-green-700 text-sm font-medium rounded-full mb-4">
            For Car Owners
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Your Cars, Your History, Always in Your Pocket
          </h2>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto">
            Never wonder when your last oil change was again. Vehicle Tracker keeps every service,
            receipt, and reminder in one place — completely free to start.
          </p>
        </div>

        <div
          ref={ref}
          className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-12"
        >
          {perks.map((perk, i) => {
            const Icon = perk.icon;
            return (
              <div
                key={perk.title}
                className={`p-6 bg-gray-50 rounded-xl border border-gray-100 transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
                style={{ transitionDelay: `${i * 100}ms` }}
              >
                <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center mb-4">
                  <Icon className="w-5 h-5 text-green-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">{perk.title}</h3>
                <p className="text-sm text-gray-500">{perk.description}</p>
              </div>
            );
          })}
        </div>

        <div className="text-center">
          <Link
            href="/register"
            className="inline-flex items-center gap-2 px-8 py-3.5 text-base font-semibold text-white bg-green-600 rounded-xl hover:bg-green-500 transition-all shadow-lg hover:shadow-xl"
          >
            Get Started Free
          </Link>
          <div className="mt-4">
            <Link
              href="/solutions/individuals"
              className="text-sm text-green-600 hover:text-green-500 font-medium"
            >
              Learn more for car owners &rarr;
            </Link>
          </div>
          <p className="mt-3 text-sm text-gray-400">No credit card required. Free forever — 2 vehicles included.</p>
        </div>
      </div>
    </section>
  );
}
