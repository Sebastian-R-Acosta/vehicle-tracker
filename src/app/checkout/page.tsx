"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Check, ArrowLeft, Loader2, Shield, Zap, Car } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import Nav from "@/components/landing/Nav";
import Footer from "@/components/landing/Footer";

const DOP_RATE = 60;

const plans = {
  pro: {
    nameKey: "pricing.pro",
    priceUSD: 9.99,
    priceDOP: 600,
    featureKey: "pricing.tierProFeatures",
  },
  business: {
    nameKey: "pricing.enterprise",
    priceUSD: 99,
    priceDOP: 6000,
    featureKey: "pricing.tierEnterpriseFeatures",
  },
};

export default function CheckoutPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { data: session, status } = useSession();
  const { t } = useLanguage();

  const planParam = searchParams.get("plan") as "pro" | "business" | null;
  const plan = planParam && plans[planParam] ? plans[planParam] : null;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push(`/login?callbackUrl=/checkout?plan=${planParam || "pro"}`);
    }
  }, [status, router, planParam]);

  if (status === "loading" || !session) {
    return (
      <div className="bg-background min-h-screen flex flex-col">
        <Nav />
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </main>
        <Footer />
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="bg-background min-h-screen flex flex-col">
        <Nav />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
              <h2 className="text-2xl font-bold text-foreground mb-2">
                {t("pricing.invalidPlan")}
              </h2>
              <p className="text-muted-foreground mb-6">
                {t("pricing.selectPlan")}
              </p>
              <Link href="/pricing" className="text-blue-600 hover:underline font-medium">
                {t("pricing.viewPricing")}
              </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const handleCheckout = async (method: "stripe" | "paypal") => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tier: planParam }),
      });

      if (!res.ok) {
        if (res.status === 401) {
          router.push(`/login?callbackUrl=/checkout?plan=${planParam}`);
          return;
        }
        const err = await res.json();
        setError(err.error || t("errors.paymentError"));
        return;
      }

      const { url } = await res.json();
      if (url) window.location.href = url;
    } catch {
      setError(t("errors.networkError"));
    } finally {
      setLoading(false);
    }
  };

  const features = t(plan.featureKey) as string[];

  return (
    <div className="bg-background min-h-screen flex flex-col">
      <Nav />

      <main className="flex-1 pt-28 pb-16">
        <div className="max-w-4xl mx-auto px-4">
          <Link href="/pricing" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8">
            <ArrowLeft className="w-4 h-4" />
            {t("pricing.backToPricing")}
          </Link>

          <div className="grid md:grid-cols-5 gap-8">
            {/* Plan Summary */}
            <div className="md:col-span-2">
              <div className="bg-card rounded-2xl border border-border p-6 sticky top-28">
                <div className="flex items-center gap-2 mb-4">
                  <Car className="w-5 h-5 text-primary" />
                  <span className="text-sm font-semibold text-primary uppercase tracking-wider">
                    {t(plan.nameKey)}
                  </span>
                </div>

                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-3xl font-bold text-foreground">
                    {`RD$${plan.priceDOP.toLocaleString("es-DO")}`}
                  </span>
                  <span className="text-muted-foreground text-sm">/mo</span>
                </div>

                <div className="border-t border-border pt-4">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                    {t("pricing.includes")}
                  </h4>
                  <ul className="space-y-2.5">
                    {features.map((f: string) => (
                      <li key={f} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                        <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Payment Selection */}
            <div className="md:col-span-3">
              <div className="bg-card rounded-2xl border border-border p-6">
                <h2 className="text-lg font-bold text-foreground mb-1">
                  {t("pricing.completePayment")}
                </h2>
                <p className="text-sm text-muted-foreground mb-6">
                  {t("pricing.activatingPlan", { plan: t(plan.nameKey) })}
                </p>

                {session.user.email && (
                  <div className="mb-6 p-3 bg-muted rounded-lg border border-border">
                    <span className="text-xs text-muted-foreground">
                      {t("pricing.loggedInAs")}
                    </span>
                    <p className="text-sm font-medium text-foreground">{session.user.email}</p>
                  </div>
                )}

                {error && (
                  <div className="mb-6 p-3 bg-destructive/10 rounded-lg border border-destructive/20" role="alert">
                    <p className="text-sm text-destructive">{error}</p>
                  </div>
                )}

                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-foreground">
                    {t("pricing.paymentMethod")}
                  </h3>

                  <button
                    onClick={() => handleCheckout("paypal")}
                    disabled={loading}
                    className="w-full flex items-center gap-4 p-4 rounded-xl border-2 border-border hover:border-primary hover:bg-primary/5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <div className="w-10 h-10 bg-blue-900 rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-bold text-lg">P</span>
                    </div>
                    <div className="text-left flex-1">
                      <p className="font-semibold text-foreground">PayPal</p>
                      <p className="text-xs text-muted-foreground">
                        {t("pricing.payWithPaypal")}
                      </p>
                    </div>
                    {loading && <Loader2 className="w-5 h-5 animate-spin text-primary" />}
                  </button>
                </div>

                <div className="mt-6 p-4 bg-primary/5 rounded-xl border border-primary/10">
                  <div className="flex items-start gap-3">
                    <Shield className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-semibold text-foreground">
                        {t("pricing.securePayment")}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {t("pricing.securePaymentDesc")}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <p className="text-xs text-muted-foreground text-center mt-6">
                {t("pricing.byContinuing")}
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
