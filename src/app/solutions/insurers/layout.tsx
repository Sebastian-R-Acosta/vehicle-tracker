import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Bitácora para Aseguradoras",
  description:
    "Verifica reclamos con historial de mantenimiento respaldado por kilometraje, fotos y documentos con fecha.",
};

export default function InsurersLayout({ children }: { children: React.ReactNode }) {
  return children;
}
