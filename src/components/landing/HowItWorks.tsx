"use client";

import { useEffect, useRef, useState } from "react";
import { UserPlus, Car, Zap } from "lucide-react";

const steps = [
  {
    icon: UserPlus,
    title: "Create Your Account",
    description:
      "Sign up in under a minute. Set up your dealership or insurance organization with your team members and roles.",
  },
  {
    icon: Car,
    title: "Add Your Vehicles",
    description:
      "Import vehicles one by one or in bulk. Add VIN, photos, service history, and assign to customers instantly.",
  },
  {
    icon: Zap,
    title: "Start Tracking",
    description:
      "Log maintenance, send automated reminders, generate PDF reports, and watch your operations transform.",
  },
];

export default function HowItWorks() {
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
    <section id="how-it-works" className="py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            From Signup to Sold in 3 Steps
          </h2>
          <p className="text-lg text-gray-500 max-w-xl mx-auto">
            Getting started takes minutes. Seeing results takes even less.
          </p>
        </div>

        <div
          ref={ref}
          className="grid md:grid-cols-3 gap-8 lg:gap-12"
        >
          {steps.map((step, i) => {
            const Icon = step.icon;
            return (
              <div
                key={step.title}
                className={`relative text-center transition-all duration-700 delay-${i * 200} ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
                style={{ transitionDelay: `${i * 200}ms` }}
              >
                <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 relative">
                  <Icon className="w-7 h-7 text-white" />
                  <div className="absolute -top-2 -right-2 w-7 h-7 bg-gray-900 rounded-full flex items-center justify-center">
                    <span className="text-xs font-bold text-white">{i + 1}</span>
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {step.title}
                </h3>
                <p className="text-sm text-gray-500 leading-relaxed max-w-xs mx-auto">
                  {step.description}
                </p>
                {i < steps.length - 1 && (
                  <div className="hidden md:block absolute top-8 -right-6 w-12 h-0.5 bg-gray-200" />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
