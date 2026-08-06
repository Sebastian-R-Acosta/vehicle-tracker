import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Precios",
  description:
    "Planes de Bitácora en pesos dominicanos: gratis hasta 2 vehículos, Pro por RD$600/mes y Empresarial por RD$6,000/mes. Sin tarjeta para empezar.",
  openGraph: {
    title: "Precios | Bitácora",
    description:
      "Planes de Bitácora en pesos dominicanos: gratis hasta 2 vehículos, Pro por RD$600/mes y Empresarial por RD$6,000/mes.",
  },
};

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return children;
}
