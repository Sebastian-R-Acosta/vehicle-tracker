import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Bitácora para Talleres",
  description:
    "Agenda de servicios, historial por cliente, control de piezas y gestión de técnicos para tu taller.",
};

export default function WorkshopsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
