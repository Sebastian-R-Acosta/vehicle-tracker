import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Bitácora para Concesionarios",
  description:
    "Historial verificable de cada unidad de tu inventario, reportes en PDF y transferencia de propiedad al comprador en un paso.",
};

export default function DealersLayout({ children }: { children: React.ReactNode }) {
  return children;
}
