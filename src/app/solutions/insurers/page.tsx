import PageLayout from "@/components/landing/PageLayout";
import { Shield, BarChart3, FileSearch, CheckCircle, Eye, RefreshCw } from "lucide-react";
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
  {
    icon: Eye,
    title: "Ownership Transparency",
    description: "Track the full ownership chain with verified transfer records and service continuity.",
  },
  {
    icon: RefreshCw,
    title: "API-Ready Integration",
    description: "Connect our API to your underwriting, claims, and policy management systems.",
  },
  {
    icon: CheckCircle,
    title: "Compliance Reporting",
    description: "Generate audit-ready reports for regulatory compliance and risk assessment.",
  },
];

export default function InsurersPage() {
  return (
    <PageLayout>
      <section className="pt-32 pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <div className="order-2 lg:order-1">
              <div className="bg-gray-200 rounded-2xl aspect-[4/3] flex items-center justify-center">
                <span className="text-gray-400 font-medium">Analytics Preview</span>
              </div>
            </div>
            <div className="order-1 lg:order-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-100 text-indigo-700 text-sm font-medium rounded-full mb-6">
                For Insurance
              </div>
              <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
                Know What You&apos;re Insuring. Every Mile, Every Service.
              </h1>
              <p className="text-lg text-gray-500 mb-8 leading-relaxed">
                Make underwriting decisions with confidence. Vehicle Tracker gives insurers a complete
                view of every vehicle&apos;s maintenance history, service gaps, and ownership changes.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link
                  href="/register"
                  className="inline-flex items-center gap-2 px-8 py-3.5 text-base font-semibold text-white bg-indigo-600 rounded-xl hover:bg-indigo-500 transition-all shadow-lg"
                >
                  Get Started
                </Link>
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2 px-8 py-3.5 text-base font-semibold text-indigo-600 border-2 border-indigo-200 rounded-xl hover:border-indigo-400 transition-all"
                >
                  Talk to Sales
                  Talk to Sales
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Built for Insurance Professionals
            </h2>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto">
              Turn maintenance data into a competitive advantage for your book of business.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {benefits.map((b) => {
              const Icon = b.icon;
              return (
                <div key={b.title} className="p-6 bg-white rounded-xl border border-gray-200">
                  <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center mb-4">
                    <Icon className="w-5 h-5 text-indigo-600" />
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
          <h2 className="text-3xl font-bold text-gray-900 mb-6">See how insurers are using Vehicle Tracker</h2>
          <p className="text-gray-500 mb-8">Reduce claims fraud and reward safe drivers.</p>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 px-8 py-3.5 text-base font-semibold text-white bg-indigo-600 rounded-xl hover:bg-indigo-500 transition-all"
          >
            Start Free Trial
          </Link>
        </div>
      </section>
    </PageLayout>
  );
}
