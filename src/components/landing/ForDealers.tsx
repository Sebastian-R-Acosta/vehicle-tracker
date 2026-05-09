"use client";

import { useEffect, useRef, useState } from "react";
import { CheckCircle, TrendingUp, Clock, Users as UsersIcon } from "lucide-react";
import Link from "next/link";

const benefits = [
  {
    icon: TrendingUp,
    title: "Boost Service Revenue",
    description: "Automated reminders fill your appointment calendar and reduce no-shows by up to 40%.",
  },
  {
    icon: Clock,
    title: "Streamline Operations",
    description: "From intake to invoice, track every vehicle through your service department in real time.",
  },
  {
    icon: UsersIcon,
    title: "Customer Retention",
    description: "Give customers a branded portal to view service history and upcoming maintenance.",
  },
];

export default function ForDealers() {
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
    <section id="for-dealers" className="py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          ref={ref}
          className={`grid lg:grid-cols-2 gap-12 lg:gap-20 items-center transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
        >
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-700 text-sm font-medium rounded-full mb-6">
              For Dealerships
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Turn Your Service Department Into a Revenue Engine
            </h2>
            <p className="text-lg text-gray-500 mb-8 leading-relaxed">
              Stop chasing paper. Vehicle Tracker gives your dealership a competitive edge with
              digital service records, automated customer communication, and powerful reporting.
            </p>
            <div className="space-y-6">
              {benefits.map((b) => {
                const Icon = b.icon;
                return (
                  <div key={b.title} className="flex gap-4">
                    <div className="flex-shrink-0 w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                      <Icon className="w-5 h-5 text-blue-600" />
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
              <span>White-label branding included</span>
            </div>
            <Link
              href="/solutions/dealers"
              className="inline-flex items-center gap-1 mt-6 text-sm text-blue-600 hover:text-blue-500 font-medium"
            >
              Learn more for dealerships &rarr;
            </Link>
          </div>

          <div className="bg-gray-200 rounded-2xl aspect-[4/3] flex items-center justify-center">
            <span className="text-gray-400 font-medium">Dashboard Preview</span>
          </div>
        </div>
      </div>
    </section>
  );
}
