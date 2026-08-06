import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contacto",
  description:
    "Habla con el equipo de Bitácora. Respondemos consultas de flotas, concesionarios, aseguradoras y talleres en un día hábil.",
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children;
}
