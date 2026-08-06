import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Bitácora para Dueños de Vehículos",
  description:
    "Registra el mantenimiento de tu carro, guarda tus documentos y recibe recordatorios antes de que venzan. Gratis hasta 2 vehículos.",
};

export default function IndividualsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
