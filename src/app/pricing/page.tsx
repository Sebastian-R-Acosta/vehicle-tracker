"use client";

import { Check, ArrowRight, Sparkles, Zap, Shield, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { useABTest } from "@/lib/ab-test";

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
      "1 vehicle",
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
  { name: "Vehicles", free: "1", pro: "Unlimited", business: "Unlimited" },
  { name: "Maintenance Logs", free: true, pro: true, business: true },
  { name: "Service Reminders", free: "Manual", pro: "Smart", business: "Smart" },
  { name: "PDF Reports", free: false, pro: true, business: true },
  { name: "Image Uploads", free: false, pro: true, business: true },
  { name: "Email Notifications", free: false, pro: true, business: true },
  { name: "Recall Alerts", free: false, pro: true, business: true },
  { name: "Value Reports", free: false, pro: true, business: true },
  { name: "Digital Glovebox", free: false, pro: true, business: true },
  { name: "Multi-User Team", free: false, pro: false, business: true },
  { name: "White-Label Branding", free: false, pro: false, business: true },
  { name: "API Access", free: false, pro: false, business: true },
  { name: "Priority Support", free: false, pro: true, business: true },
];

function PricingCards({ variant }: { variant: string }) {
  const router = useRouter();
  const { data: session } = useSession();
  const [loading, setLoading] = useState<string | null>(null);

  const handleUpgrade = async (tier: "pro" | "business") => {
    if (!session) {
      router.push("/login?callbackUrl=/pricing");
      return;
    }
    setLoading(tier);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tier }),
      });
      if (res.ok) {
        const { url } = await res.json();
        window.location.href = url;
      } else if (res.status === 401) {
        router.push("/login?callbackUrl=/pricing");
      } else {
        const err = await res.json();
        alert(err.error || "Something went wrong");
      }
    } catch {
      alert("Could not connect to payment server");
    } finally {
      setLoading(null);
    }
  };

  if (variant === "variant_a") {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-3 gap-8 mb-20">
        {tiers.map((tier) => {
          const isFeatured = tier.featured;
          return (
            <div
              key={tier.name}
              className={`relative p-8 rounded-2xl border-2 transition-all duration-300 hover:-translate-y-1 ${
                isFeatured
                  ? "bg-white border-blue-500 shadow-xl shadow-blue-500/10 md:scale-105"
                  : "bg-white border-gray-200 shadow-sm hover:shadow-lg"
              }`}
            >
              {isFeatured && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-semibold rounded-full flex items-center gap-1">
                  <Zap className="w-3 h-3" />
                  Best Value
                </div>
              )}
              <div className={`text-sm font-semibold uppercase tracking-wider mb-2 ${
                tier.color === "blue" ? "text-blue-600" : tier.color === "indigo" ? "text-indigo-600" : "text-gray-500"
              }`}>
                {tier.name}
              </div>
              <div className="flex items-baseline gap-1 mb-1">
                <span className="text-4xl font-bold text-gray-900">{tier.price}</span>
                <span className="text-gray-400">{tier.period}</span>
              </div>
              {isFeatured && (
                <p className="text-xs text-green-600 font-medium mb-1">
                  Save 17% with annual billing &mdash; $99.99/yr
                </p>
              )}
              <p className="text-sm text-gray-500 mb-6">{tier.desc}</p>

              {tier.name === "Pro" && (
                <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
                  <p className="text-xs text-blue-700 font-medium">
                    Includes Recall Alerts, Value Reports &amp; Digital Glovebox
                  </p>
                </div>
              )}

              {tier.name === "Free" ? (
                <Link
                  href="/register"
                  className="flex items-center justify-center gap-2 w-full py-3 rounded-xl font-semibold text-sm transition-all bg-gray-100 text-gray-900 hover:bg-gray-200"
                >
                  {tier.cta}
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              ) : (
                <button
                  onClick={() => handleUpgrade(tier.name.toLowerCase() as "pro" | "business")}
                  disabled={loading === tier.name.toLowerCase()}
                  className="flex items-center justify-center gap-2 w-full py-3 rounded-xl font-semibold text-sm transition-all bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:opacity-90 shadow-md disabled:opacity-50"
                >
                  {loading === tier.name.toLowerCase() ? <Loader2 className="w-4 h-4 animate-spin" /> : <>{tier.cta}<ArrowRight className="w-3.5 h-3.5" /></>}
                </button>
              )}
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
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-3 gap-8 mb-20">
      {tiers.map((tier) => {
        const isFeatured = tier.featured;
        return (
          <div
            key={tier.name}
            className={`relative p-8 rounded-2xl border-2 transition-all duration-300 hover:-translate-y-1 ${
              isFeatured
                ? "bg-white border-blue-500 shadow-xl shadow-blue-500/10 md:scale-105"
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
            {tier.name === "Free" ? (
                <Link
                  href="/register"
                  className="flex items-center justify-center gap-2 w-full py-3 rounded-xl font-semibold text-sm transition-all bg-gray-100 text-gray-900 hover:bg-gray-200"
                >
                  {tier.cta}
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              ) : (
                <button
                  onClick={() => handleUpgrade(tier.name.toLowerCase() as "pro" | "business")}
                  disabled={loading === tier.name.toLowerCase()}
                  className="flex items-center justify-center gap-2 w-full py-3 rounded-xl font-semibold text-sm transition-all bg-blue-600 text-white hover:bg-blue-500 shadow-md disabled:opacity-50"
                >
                  {loading === tier.name.toLowerCase() ? <Loader2 className="w-4 h-4 animate-spin" /> : <>{tier.cta}<ArrowRight className="w-3.5 h-3.5" /></>}
                </button>
              )}
            {isFeatured && (
              <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-100">
                <p className="text-xs text-green-700 font-medium">
                  New: Recall alerts, value reports &amp; digital glovebox included
                </p>
              </div>
            )}
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
  );
}

export default function PricingPage() {
  const pricingVariant = useABTest("pricing_layout");

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

      <section className="py-12 md:py-20 bg-gradient-to-br from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-16">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            Simple, Transparent Pricing
          </h1>
          <p className="text-lg text-gray-500 max-w-xl mx-auto">
            Start free. Upgrade when you need more. No hidden fees, no surprises.
          </p>
          {pricingVariant === "variant_a" && (
            <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-full border border-blue-200">
              <Shield className="w-4 h-4 text-blue-600" />
              <span className="text-sm text-blue-700 font-medium">
                New: Recall alerts, value reports &amp; digital glovebox
              </span>
            </div>
          )}
        </div>

        <PricingCards variant={pricingVariant} />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">Full Feature Comparison</h2>
          <div className="bg-white rounded-2xl border border-gray-200 overflow-x-auto shadow-sm">
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
                        row.free ? <Check className="w-4 h-4 text-green-500 mx-auto" /> : <span className="text-gray-300">&mdash;</span>
                      ) : (
                        <span className="text-gray-700">{row.free}</span>
                      )}
                    </td>
                    <td className="text-center px-4 py-4">
                      {typeof row.pro === "boolean" ? (
                        row.pro ? <Check className="w-4 h-4 text-green-500 mx-auto" /> : <span className="text-gray-300">&mdash;</span>
                      ) : (
                        <span className="text-gray-700">{row.pro}</span>
                      )}
                    </td>
                    <td className="text-center px-4 py-4">
                      {typeof row.business === "boolean" ? (
                        row.business ? <Check className="w-4 h-4 text-green-500 mx-auto" /> : <span className="text-gray-300">&mdash;</span>
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
