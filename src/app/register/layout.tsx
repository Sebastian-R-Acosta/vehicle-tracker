import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Crear Cuenta",
  description:
    "Crea tu cuenta gratis en Bitácora y empieza a registrar el mantenimiento, documentos y recordatorios de tus vehículos.",
  openGraph: {
    title: "Crear Cuenta | Bitácora",
    description: "Crea tu cuenta gratis y empieza a registrar el mantenimiento de tus vehículos.",
  },
};

export default function RegisterLayout({ children }: { children: React.ReactNode }) {
  return children;
}
