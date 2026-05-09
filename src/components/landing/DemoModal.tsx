"use client";

import { useState } from "react";
import { X, Loader2, CheckCircle } from "lucide-react";

interface DemoModalProps {
  open: boolean;
  onClose: () => void;
}

export default function DemoModal({ open, onClose }: DemoModalProps) {
  const [form, setForm] = useState({ name: "", email: "", company: "", phone: "", message: "" });
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    setError("");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Something went wrong. Please try again.");
      setDone(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg p-8">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
        >
          <X className="w-5 h-5" />
        </button>

        {done ? (
          <div className="text-center py-8">
            <CheckCircle className="w-14 h-14 text-green-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">Thanks for reaching out!</h3>
            <p className="text-gray-500 mb-6">
              We&apos;ll get back to you within 24 hours to schedule your demo.
            </p>
            <button
              onClick={onClose}
              className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-500 font-medium"
            >
              Close
            </button>
          </div>
        ) : (
          <>
            <h3 className="text-xl font-bold text-gray-900 mb-1">Book a Demo</h3>
            <p className="text-sm text-gray-500 mb-6">
              Fill out the form and we&apos;ll show you how Vehicle Tracker can transform your business.
            </p>

            {error && (
              <div className="mb-4 p-3 text-sm text-red-600 bg-red-50 rounded-lg">{error}</div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    placeholder="John Smith"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    required
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    placeholder="john@dealer.com"
                  />
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Company <span className="text-red-500">*</span>
                  </label>
                  <input
                    required
                    value={form.company}
                    onChange={(e) => setForm({ ...form, company: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    placeholder="AutoNation"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                <textarea
                  rows={3}
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  placeholder="Tell us about your needs..."
                />
              </div>
              <button
                type="submit"
                disabled={sending}
                className="w-full py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-500 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {sending && <Loader2 className="w-4 h-4 animate-spin" />}
                {sending ? "Sending..." : "Submit Request"}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
