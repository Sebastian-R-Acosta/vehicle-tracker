import PageLayout from "@/components/landing/PageLayout";
import { Smartphone, Bell, FileText, Car, Gauge, RefreshCw } from "lucide-react";
import Link from "next/link";

const perks = [
  { icon: Smartphone, title: "Mobile-Friendly Dashboard", description: "Track all your vehicles from any device. No app download needed." },
  { icon: Bell, title: "Smart Service Reminders", description: "Get notified when it's time for an oil change, tire rotation, or inspection." },
  { icon: FileText, title: "Free PDF Reports", description: "Generate a complete vehicle history report to share with buyers or mechanics." },
  { icon: Car, title: "Up to 2 Vehicles Free", description: "Track two vehicles at no cost. Upgrade to Pro for unlimited." },
  { icon: Gauge, title: "Mileage Tracking", description: "Log odometer readings automatically when you add a service record." },
  { icon: RefreshCw, title: "Transfer Ready", description: "When you sell your car, generate a transfer code so the next owner gets the full history." },
];

export default function IndividualsPage() {
  return (
    <PageLayout>
      <section className="pt-32 pb-16 lg:pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-100 text-green-700 text-sm font-medium rounded-full mb-4">
              For Car Owners
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
              Your Cars, Your History, Always in Your Pocket
            </h1>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto">
              Never wonder when your last oil change was again. Vehicle Tracker keeps every service,
              receipt, and reminder in one place — completely free to start.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {perks.map((perk, i) => {
              const Icon = perk.icon;
              return (
                <div key={perk.title} className="p-6 bg-gray-50 rounded-xl border border-gray-100">
                  <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center mb-4">
                    <Icon className="w-5 h-5 text-green-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1">{perk.title}</h3>
                  <p className="text-sm text-gray-500">{perk.description}</p>
                </div>
              );
            })}
          </div>

          <div className="text-center">
            <Link
              href="/register"
              className="inline-flex items-center gap-2 px-8 py-3.5 text-base font-semibold text-white bg-green-600 rounded-xl hover:bg-green-500 transition-all shadow-lg hover:shadow-xl"
            >
              Get Started Free
            </Link>
            <p className="mt-3 text-sm text-gray-400">No credit card required. Free forever — 2 vehicles included.</p>
          </div>
        </div>
      </section>

      <section className="py-16 lg:py-24 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">How It Works</h2>
          <div className="grid sm:grid-cols-3 gap-8">
            {[
              { step: "1", title: "Sign Up Free", desc: "Create your account in 30 seconds. No credit card needed." },
              { step: "2", title: "Add Your Vehicles", desc: "Enter make, model, and mileage. Add up to 2 vehicles free." },
              { step: "3", title: "Log & Relax", desc: "Record services as they happen. We handle the reminders." },
            ].map((item) => (
              <div key={item.step}>
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-green-700 font-bold text-lg">{item.step}</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">{item.title}</h3>
                <p className="text-sm text-gray-500">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 lg:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Ready to take control of your car&apos;s history?</h2>
          <p className="text-gray-500 mb-8">Join thousands of car owners who never miss a service.</p>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 px-8 py-3.5 text-base font-semibold text-white bg-green-600 rounded-xl hover:bg-green-500 transition-all"
          >
            Get Started Free
          </Link>
        </div>
      </section>
    </PageLayout>
  );
}
