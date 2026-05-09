import PageLayout from "@/components/landing/PageLayout";
import { CheckCircle, TrendingUp, Clock, Users, BarChart3, Settings } from "lucide-react";
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
    icon: Users,
    title: "Customer Retention",
    description: "Give customers a branded portal to view service history and upcoming maintenance.",
  },
  {
    icon: BarChart3,
    title: "Performance Analytics",
    description: "Track bay utilization, technician productivity, and average repair order value.",
  },
  {
    icon: Settings,
    title: "White-Label Experience",
    description: "Your logo, your domain, your brand. We're invisible to your customers.",
  },
  {
    icon: CheckCircle,
    title: "Multi-Location Ready",
    description: "Manage multiple locations from a single dashboard with role-based team access.",
  },
];

export default function DealersPage() {
  return (
    <PageLayout>
      <section className="pt-32 pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-700 text-sm font-medium rounded-full mb-6">
                For Dealerships
              </div>
              <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
                Turn Your Service Department Into a Revenue Engine
              </h1>
              <p className="text-lg text-gray-500 mb-8 leading-relaxed">
                Stop chasing paper. Vehicle Tracker gives your dealership a competitive edge with
                digital service records, automated customer communication, and powerful reporting.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link
                  href="/register"
                  className="inline-flex items-center gap-2 px-8 py-3.5 text-base font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-500 transition-all shadow-lg"
                >
                  Get Started
                </Link>
                <Link
                  href="/pricing"
                  className="inline-flex items-center gap-2 px-8 py-3.5 text-base font-semibold text-blue-600 border-2 border-blue-200 rounded-xl hover:border-blue-400 transition-all"
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

      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Everything Your Dealership Needs
            </h2>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto">
              From the service drive to the customer&apos;s phone, we keep everyone in sync.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {benefits.map((b) => {
              const Icon = b.icon;
              return (
                <div key={b.title} className="p-6 bg-white rounded-xl border border-gray-200">
                  <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center mb-4">
                    <Icon className="w-5 h-5 text-blue-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1">{b.title}</h3>
                  <p className="text-sm text-gray-500">{b.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-24 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Ready to modernize your dealership?</h2>
          <p className="text-gray-500 mb-8">Join dealerships across the country using Vehicle Tracker.</p>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 px-8 py-3.5 text-base font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-500 transition-all"
          >
            Start Free Trial
          </Link>
          <p className="mt-3 text-sm text-gray-400">No commitment. Cancel anytime.</p>
        </div>
      </section>
    </PageLayout>
  );
}
