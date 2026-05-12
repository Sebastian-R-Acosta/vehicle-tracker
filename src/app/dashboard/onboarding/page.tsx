"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Car, ArrowRight, Loader2, HardHat } from "lucide-react";
import Link from "next/link";

const roles = [
  { id: "personal", label: "Car Owner", desc: "Track my personal vehicles" },
  { id: "dealer", label: "Dealership", desc: "Manage customer vehicles and service" },
  { id: "insurer", label: "Insurance", desc: "Monitor policyholder fleets" },
  { id: "construction", label: "Construction", desc: "Manage heavy equipment and fleet" },
];

async function completeOnboarding() {
  await fetch("/api/user/complete-onboarding", { method: "POST" });
}

export default function OnboardingPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (status === "unauthenticated") {
    router.push("/login");
    return null;
  }

  const handleContinue = async () => {
    if (!selectedRole) return;
    setSaving(true);
    await completeOnboarding();

    if (selectedRole === "personal") {
      router.push("/dashboard/vehicles/new?onboarding=true");
    } else {
      router.push("/dashboard/settings");
    }
  };

  const handleSkip = async () => {
    await completeOnboarding();
    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8 max-w-lg w-full">
        <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-6">
          <Car className="w-7 h-7 text-blue-600" />
        </div>
        <h1 className="text-2xl font-bold text-center text-gray-900 mb-2">
          Welcome to Vehicle Tracker
        </h1>
        <p className="text-gray-500 text-center mb-8">
          Let&apos;s get you set up. What brings you here?
        </p>

        <div className="space-y-3 mb-8">
          {roles.map((role) => (
            <button
              key={role.id}
              onClick={() => setSelectedRole(role.id)}
              className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                selectedRole === role.id
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <div className="font-semibold text-gray-900">{role.label}</div>
              <div className="text-sm text-gray-500">{role.desc}</div>
            </button>
          ))}
        </div>

        <button
          onClick={handleContinue}
          disabled={!selectedRole || saving}
          className="w-full py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-500 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
          Continue
          <ArrowRight className="w-4 h-4" />
        </button>

        <button
          onClick={handleSkip}
          className="block w-full text-center text-sm text-gray-400 mt-4 py-3 hover:text-gray-600"
        >
          Skip for now
        </button>
      </div>
    </div>
  );
}
