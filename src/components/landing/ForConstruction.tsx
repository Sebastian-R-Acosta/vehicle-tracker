import { HardHat, Drill, Clock, BarChart3, MapPin, Wrench } from "lucide-react";
import Link from "next/link";

const benefits = [
  { icon: HardHat, title: "Heavy Equipment Tracking", description: "Track excavators, bulldozers, cranes, and more with hour-based service intervals." },
  { icon: MapPin, title: "Site Management", description: "Organize equipment by job site. See what's where at a glance." },
  { icon: Clock, title: "Hour-Based Reminders", description: "Get notified when equipment hits service hours — engine oil, hydraulics, track inspection." },
  { icon: BarChart3, title: "Equipment Status Board", description: "Know which machines are operational, idle, or down across all your sites." },
  { icon: Wrench, title: "Maintenance History", description: "Complete service records for every machine. Perfect for resale value." },
  { icon: Drill, title: "Fleet Utilization", description: "Monitor hours usage and reduce downtime with proactive scheduling." },
];

export default function ForConstruction() {
  return (
    <section className="py-16 lg:py-24 bg-amber-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-200 text-amber-800 text-sm font-medium rounded-full mb-4">
            For Construction
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Built for Heavy Equipment
          </h2>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto">
            Track hours, manage sites, and keep your fleet running. Vehicle Tracker works just as
            hard as your equipment.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {benefits.map((b) => {
            const Icon = b.icon;
            return (
              <div key={b.title} className="p-6 bg-white rounded-xl border border-amber-200">
                <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center mb-4">
                  <Icon className="w-5 h-5 text-amber-700" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">{b.title}</h3>
                <p className="text-sm text-gray-500">{b.description}</p>
              </div>
            );
          })}
        </div>

        <div className="text-center">
          <Link
            href="/solutions/construction"
            className="inline-flex items-center gap-2 px-8 py-3.5 text-base font-semibold text-white bg-amber-600 rounded-xl hover:bg-amber-500 transition-all shadow-lg hover:shadow-xl"
          >
            Learn More
          </Link>
        </div>
      </div>
    </section>
  );
}
