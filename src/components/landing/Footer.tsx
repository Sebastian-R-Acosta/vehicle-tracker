import { Car } from "lucide-react";
import Link from "next/link";

const columns = [
  {
    title: "Product",
    links: [
      { label: "Features", href: "/#features" },
      { label: "Pricing", href: "/pricing" },
      { label: "For Car Owners", href: "/solutions/individuals" },
      { label: "For Dealerships", href: "/solutions/dealers" },
      { label: "For Insurers", href: "/solutions/insurers" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "#" },
      { label: "Blog", href: "#" },
      { label: "Careers", href: "#" },
      { label: "Press", href: "#" },
      { label: "Contact", href: "#" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Documentation", href: "#" },
      { label: "API Reference", href: "#" },
      { label: "Help Center", href: "#" },
      { label: "Community", href: "#" },
      { label: "Release Notes", href: "#" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy Policy", href: "#" },
      { label: "Terms of Service", href: "#" },
      { label: "Cookie Policy", href: "#" },
      { label: "GDPR", href: "#" },
      { label: "Security", href: "#" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="bg-gray-900 border-t border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-1.5 bg-blue-600 rounded-lg">
                <Car className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-bold text-white">Vehicle Tracker</span>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed">
              The all-in-one vehicle history and maintenance platform for dealerships and insurance companies.
            </p>
          </div>

          {columns.map((col) => (
            <div key={col.title}>
              <h4 className="text-sm font-semibold text-white mb-4">{col.title}</h4>
              <ul className="space-y-3">
                  {col.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-gray-400 hover:text-white transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-500">
            &copy; {new Date().getFullYear()} Vehicle Tracker. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <span className="text-sm text-gray-500 hover:text-gray-300 cursor-pointer">Twitter</span>
            <span className="text-sm text-gray-500 hover:text-gray-300 cursor-pointer">LinkedIn</span>
            <span className="text-sm text-gray-500 hover:text-gray-300 cursor-pointer">YouTube</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
