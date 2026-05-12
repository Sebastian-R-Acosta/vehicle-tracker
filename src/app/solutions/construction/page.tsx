import PageLayout from "@/components/landing/PageLayout";
import { HardHat, Drill, Clock, BarChart3, MapPin, Wrench, Gauge, RefreshCw } from "lucide-react";
import Link from "next/link";

const benefits = [
  {
    icon: HardHat,
    title: "Heavy Equipment Tracking",
    description: "Track excavators, bulldozers, dump trucks, cranes, loaders, and graders with support for serial numbers and weight capacity.",
  },
  {
    icon: MapPin,
    title: "Job Site Organization",
    description: "Group equipment by construction site. See all machines assigned to a project in one dashboard.",
  },
  {
    icon: Clock,
    title: "Hour-Based Service Intervals",
    description: "Set reminders based on hours meter readings — engine oil every 250 hours, hydraulic fluid every 500 hours, and more.",
  },
  {
    icon: BarChart3,
    title: "Equipment Status Board",
    description: "Real-time status per machine: Operational, Idle, Down, or In Maintenance. Know your fleet health instantly.",
  },
  {
    icon: Wrench,
    title: "Complete Service History",
    description: "Log every repair, inspection, and part replacement. Full PDF reports for resale or compliance.",
  },
  {
    icon: Gauge,
    title: "Hours Utilization Reports",
    description: "Measure how many hours each machine runs. Identify underutilized equipment and optimize your fleet.",
  },
  {
    icon: RefreshCw,
    title: "Transfer Ready",
    description: "When you sell or move equipment between sites, generate a transfer code to preserve the service history.",
  },
  {
    icon: Drill,
    title: "Multi-Site Fleet Management",
    description: "Manage equipment across multiple job sites from one account. Role-based access for site supervisors.",
  },
];

export default function ConstructionPage() {
  return (
    <PageLayout>
      <section className="pt-32 pb-16 lg:pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 lg:gap-20 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-100 text-amber-700 text-sm font-medium rounded-full mb-6">
                For Construction
              </div>
              <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
                Heavy Equipment Fleet Management, Simplified
              </h1>
              <p className="text-lg text-gray-500 mb-8 leading-relaxed">
                Stop tracking hours on spreadsheets. Vehicle Tracker gives you a complete view of
                your construction equipment fleet — hours, maintenance, site assignments, and
                equipment status, all in one place.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link
                  href="/register"
                  className="inline-flex items-center gap-2 px-8 py-3.5 text-base font-semibold text-white bg-amber-600 rounded-xl hover:bg-amber-500 transition-all shadow-lg"
                >
                  Get Started
                </Link>
                <Link
                  href="/pricing"
                  className="inline-flex items-center gap-2 px-8 py-3.5 text-base font-semibold text-amber-600 border-2 border-amber-200 rounded-xl hover:border-amber-400 transition-all"
                >
                  View Pricing
                </Link>
              </div>
            </div>
            <div className="bg-gray-200 rounded-2xl aspect-[4/3] flex items-center justify-center">
              <span className="text-gray-400 font-medium">Dashboard Preview</span>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 lg:py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Everything Your Fleet Needs
            </h2>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto">
              From hours tracking to site management — built for construction companies.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((b) => {
              const Icon = b.icon;
              return (
                <div key={b.title} className="p-6 bg-white rounded-xl border border-gray-200">
                  <div className="w-10 h-10 bg-amber-50 rounded-lg flex items-center justify-center mb-4">
                    <Icon className="w-5 h-5 text-amber-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1">{b.title}</h3>
                  <p className="text-sm text-gray-500">{b.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-16 lg:py-24 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Ready to modernize your fleet?</h2>
          <p className="text-gray-500 mb-8">Join construction companies using Vehicle Tracker to reduce downtime.</p>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 px-8 py-3.5 text-base font-semibold text-white bg-amber-600 rounded-xl hover:bg-amber-500 transition-all"
          >
            Start Free Trial
          </Link>
          <p className="mt-3 text-sm text-gray-400">No commitment. Cancel anytime.</p>
        </div>
      </section>
    </PageLayout>
  );
}
