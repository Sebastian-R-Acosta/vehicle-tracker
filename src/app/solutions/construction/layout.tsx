import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Bitácora para Constructoras",
  description:
    "Controla equipos y maquinaria por obra: horómetro, mantenimiento preventivo, choferes asignados e inventario de piezas.",
};

export default function ConstructionLayout({ children }: { children: React.ReactNode }) {
  return children;
}
