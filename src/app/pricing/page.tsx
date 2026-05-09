"use client";

import { Check, ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";

const tiers = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    desc: "Perfect for keeping track of your personal vehicles.",
    cta: "Get Started",
    href: "/register",
    color: "gray",
    features: [
      "Up to 2 vehicles",
      "Maintenance logging",
      "Manual reminders",
      "Basic vehicle info",
      "Email support",
    ],
  },
  {
    name: "Pro",
    price: "$9.99",
    period: "/month",
    desc: "For car enthusiasts and families with multiple vehicles.",
    cta: "Start Free Trial",
    href: "/register",
    color: "blue",
    featured: true,
    features: [
      "Unlimited vehicles",
      "PDF vehicle history reports",
      "Image upload for receipts",
      "Smart mileage-based reminders",
      "Email notifications",
      "Data export",
      "Priority support",
    ],
  },
  {
    name: "Business",
    price: "$99",
    period: "/month",
    desc: "For dealerships and insurance companies.",
    cta: "Book a Demo",
    href: "#",
    color: "indigo",
    features: [
      "Everything in Pro",
      "Multi-tenant organization",
      "Team roles (admin, tech, customer)",
      "White-label branding",
      "API access",
      "Customer portal",
      "Automated service reminders",
      "Dedicated account manager",
      "Custom integrations",
    ],
  },
];

const featureCompare = [
  { name: "Vehicles", free: "2", pro: "Unlimited", business: "Unlimited" },
  { name: "Maintenance Logs", free: true, pro: true, business: true },
  { name: "Service Reminders", free: "Manual", pro: "Smart", business: "Smart" },
  { name: "PDF Reports", free: false, pro: true, business: true },
  { name: "Image Uploads", free: false, pro: true, business: true },
  { name: "Email Notifications", free: false, pro: true, business: true },
  { name: "Multi-User Team", free: false, pro: false, business: true },
  { name: "White-Label Branding", free: false, pro: false, business: true },
  { name: "API Access", free: false, pro: false, business: true },
  { name: "Priority Support", free: false, pro: true, business: true },
];

export default function PricingPage() {
  return (
    <div className="bg-white">
      <nav className="bg-gray-900 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center">
          <Link href="/" className="flex items-center gap-2">
            <div className="p-1.5 bg-blue-600 rounded-lg">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold text-white">Vehicle Tracker</span>
          </Link>
        </div>
      </nav>

      <section className="py-20 bg-gradient-to-br from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-16">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            Simple, Transparent Pricing
          </h1>
          <p className="text-lg text-gray-500 max-w-xl mx-auto">
            Start free. Upgrade when you need more. No hidden fees, no surprises.
          </p>
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-3 gap-8 mb-20">
          {tiers.map((tier) => {
            const isFeatured = tier.featured;
            return (
              <div
                key={tier.name}
                className={`relative p-8 rounded-2xl border-2 transition-all duration-300 hover:-translate-y-1 ${
                  isFeatured
                    ? "bg-white border-blue-500 shadow-xl shadow-blue-500/10 scale-105 md:scale-105"
                    : "bg-white border-gray-200 shadow-sm hover:shadow-lg"
                }`}
              >
                {isFeatured && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-blue-600 text-white text-xs font-semibold rounded-full">
                    Most Popular
                  </div>
                )}
                <div className={`text-sm font-semibold uppercase tracking-wider mb-2 ${
                  tier.color === "blue" ? "text-blue-600" : tier.color === "indigo" ? "text-indigo-600" : "text-gray-500"
                }`}>
                  {tier.name}
                </div>
                <div className="flex items-baseline gap-1 mb-2">
                  <span className="text-4xl font-bold text-gray-900">{tier.price}</span>
                  <span className="text-gray-400">{tier.period}</span>
                </div>
                <p className="text-sm text-gray-500 mb-6">{tier.desc}</p>
                <Link
                  href={tier.href}
                  className={`flex items-center justify-center gap-2 w-full py-3 rounded-xl font-semibold text-sm transition-all ${
                    isFeatured
                      ? "bg-blue-600 text-white hover:bg-blue-500 shadow-md"
                      : "bg-gray-100 text-gray-900 hover:bg-gray-200"
                  }`}
                >
                  {tier.cta}
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
                <ul className="mt-6 space-y-3">
                  {tier.features.map((f) => (
                    <li key={f} className="flex items-start gap-3 text-sm text-gray-600">
                      <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">Full Feature Comparison</h2>
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left px-6 py-4 font-semibold text-gray-900">Feature</th>
                  <th className="text-center px-4 py-4 font-semibold text-gray-500">Free</th>
                  <th className="text-center px-4 py-4 font-semibold text-blue-600">Pro</th>
                  <th className="text-center px-4 py-4 font-semibold text-indigo-600">Business</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {featureCompare.map((row) => (
                  <tr key={row.name} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-gray-700">{row.name}</td>
                    <td className="text-center px-4 py-4">
                      {typeof row.free === "boolean" ? (
                        row.free ? <Check className="w-4 h-4 text-green-500 mx-auto" /> : <span className="text-gray-300">—</span>
                      ) : (
                        <span className="text-gray-700">{row.free}</span>
                      )}
                    </td>
                    <td className="text-center px-4 py-4">
                      {typeof row.pro === "boolean" ? (
                        row.pro ? <Check className="w-4 h-4 text-green-500 mx-auto" /> : <span className="text-gray-300">—</span>
                      ) : (
                        <span className="text-gray-700">{row.pro}</span>
                      )}
                    </td>
                    <td className="text-center px-4 py-4">
                      {typeof row.business === "boolean" ? (
                        row.business ? <Check className="w-4 h-4 text-green-500 mx-auto" /> : <span className="text-gray-300">—</span>
                      ) : (
                        <span className="text-gray-700">{row.business}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <footer className="bg-gray-900 text-gray-400 text-center py-8 text-sm">
        &copy; {new Date().getFullYear()} Vehicle Tracker. All rights reserved.
      </footer>
    </div>
  );
}
