"use client";

import { useEffect, useRef, useState } from "react";
import {
  Car,
  Wrench,
  Bell,
  FileText,
  ArrowLeftRight,
  Users,
} from "lucide-react";

const features = [
  {
    icon: Car,
    title: "Vehicle Tracking",
    description:
      "Add unlimited vehicles with make, model, year, VIN, and photos. Organize by type and status at a glance.",
  },
  {
    icon: Wrench,
    title: "Maintenance Logs",
    description:
      "Log every service with date, mileage, cost, and receipt images. Automatic mileage updates included.",
  },
  {
    icon: Bell,
    title: "Smart Reminders",
    description:
      "Get automated reminders based on date or mileage intervals. Never miss an oil change or inspection again.",
  },
  {
    icon: FileText,
    title: "PDF Reports",
    description:
      "Generate professional vehicle history reports with one click. Perfect for resale, trade-ins, and claims.",
  },
  {
    icon: ArrowLeftRight,
    title: "Vehicle Transfer",
    description:
      "Securely transfer vehicle ownership with unique codes. Full history preserved for the next owner.",
  },
  {
    icon: Users,
    title: "Multi-Team Access",
    description:
      "Invite your team with role-based permissions. Technicians, sales, admin — everyone stays in sync.",
  },
];

function FadeInSection({ children }: { children: React.ReactNode }) {
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
    <div
      ref={ref}
      className={`transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
    >
      {children}
    </div>
  );
}

export default function Features() {
  return (
    <section id="features" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeInSection>
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              One Platform — Infinite Possibilities
            </h2>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto">
              Everything you need to manage vehicles, service history, and customer relationships
              in one beautiful dashboard.
            </p>
          </div>
        </FadeInSection>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, i) => {
            const Icon = feature.icon;
            return (
              <FadeInSection key={feature.title}>
                <div className="group p-8 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                  <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mb-5 group-hover:bg-blue-100 transition-colors">
                    <Icon className="w-6 h-6 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-500 text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </FadeInSection>
            );
          })}
        </div>
      </div>
    </section>
  );
}
