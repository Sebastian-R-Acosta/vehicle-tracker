import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Acerca de",
  description:
    "Bitácora construye la plataforma de historial y mantenimiento vehicular más completa de República Dominicana, para dueños, concesionarios, aseguradoras y talleres.",
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return children;
}
