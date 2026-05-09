import { Car } from "lucide-react";

const columns = [
  {
    title: "Product",
    links: ["Features", "Pricing", "For Dealers", "For Insurers", "Integrations"],
  },
  {
    title: "Company",
    links: ["About", "Blog", "Careers", "Press", "Contact"],
  },
  {
    title: "Resources",
    links: ["Documentation", "API Reference", "Help Center", "Community", "Release Notes"],
  },
  {
    title: "Legal",
    links: ["Privacy Policy", "Terms of Service", "Cookie Policy", "GDPR", "Security"],
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
                  <li key={link}>
                    <span className="text-sm text-gray-400 hover:text-white transition-colors cursor-pointer">
                      {link}
                    </span>
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
