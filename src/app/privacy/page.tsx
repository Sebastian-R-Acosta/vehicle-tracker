"use client";

import PageLayout from "@/components/landing/PageLayout";
import { useLanguage } from "@/lib/i18n/LanguageContext";

const privacyEs = {
  title: "Política de Privacidad — Bitácora",
  updated: "Última actualización: julio 2026",
  sections: [
    {
      heading: "Información que Recopilamos",
      content:
        "Recopilamos la información que usted proporciona al crear una cuenta, agregar vehículos, registrar mantenimiento y comunicarse con nosotros. Esto incluye su nombre, dirección de correo electrónico, información del vehículo (marca, modelo, VIN, kilometraje) y registros de servicio.",
    },
    {
      heading: "Cómo Usamos su Información",
      content:
        "Sus datos se utilizan para proporcionar y mejorar el servicio de Bitácora: mostrar el historial del vehículo, enviar recordatorios de mantenimiento, generar reportes y comunicar notificaciones relacionadas con el servicio. Nunca vendemos sus datos personales a terceros.",
    },
    {
      heading: "Almacenamiento y Seguridad de Datos",
      content:
        "Sus datos se almacenan de forma segura en servidores encriptados. Utilizamos medidas de seguridad estándar de la industria, incluyendo encriptación en reposo y en tránsito. Los datos del historial del vehículo se conservan mientras su cuenta esté activa.",
    },
    {
      heading: "Compartición de Datos",
      content:
        "El historial del vehículo y los registros de mantenimiento solo se comparten cuando usted elige explícitamente transferir un vehículo a otro propietario a través de nuestro sistema de códigos de transferencia. No compartimos su información personal con terceros, excepto cuando la ley lo requiera.",
    },
    {
      heading: "Sus Derechos",
      content:
        "Puede acceder, actualizar o eliminar su cuenta y los datos asociados en cualquier momento desde la configuración de su panel. Puede exportar los datos de su vehículo como reportes en PDF. La eliminación de la cuenta elimina todos los registros de vehículos y mantenimiento asociados.",
    },
    {
      heading: "Contacto",
      content:
        "Para consultas relacionadas con la privacidad, contáctenos a través de nuestra página de Contacto o por correo electrónico a ",
      email: "privacy@bitacora.app",
    },
  ],
};

const privacyEn = {
  title: "Privacy Policy — Bitácora",
  updated: "Last updated: July 2026",
  sections: [
    {
      heading: "Information We Collect",
      content:
        "We collect information you provide when creating an account, adding vehicles, logging maintenance, and communicating with us. This includes your name, email address, vehicle information (make, model, VIN, mileage), and service records.",
    },
    {
      heading: "How We Use Your Information",
      content:
        "Your data is used to provide and improve the Bitácora service: displaying vehicle history, sending maintenance reminders, generating reports, and communicating service-related notifications. We never sell your personal data to third parties.",
    },
    {
      heading: "Data Storage & Security",
      content:
        "Your data is stored securely on encrypted servers. We use industry-standard security measures including encryption at rest and in transit. Vehicle history data is retained as long as your account is active.",
    },
    {
      heading: "Data Sharing",
      content:
        "Vehicle history and maintenance records are only shared when you explicitly choose to transfer a vehicle to another owner via our transfer code system. We do not share your personal information with third parties except as required by law.",
    },
    {
      heading: "Your Rights",
      content:
        "You can access, update, or delete your account and associated data at any time from your dashboard settings. You can export your vehicle data as PDF reports. Account deletion removes all associated vehicle and maintenance records.",
    },
    {
      heading: "Contact",
      content:
        "For privacy-related inquiries, contact us via our Contact page or email ",
      email: "privacy@bitacora.app",
    },
  ],
};

export default function PrivacyPage() {
  const { locale } = useLanguage();
  const t = locale === "es" ? privacyEs : privacyEn;

  return (
    <PageLayout>
      <section className="pt-32 pb-24">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 prose prose-gray dark:prose-invert">
          <h1>{t.title}</h1>
          <p className="text-muted-foreground">{t.updated}</p>

          {t.sections.map((section, i) => (
            <div key={i}>
              <h2>{section.heading}</h2>
              {section.email ? (
                <p>
                  {section.content}
                  <a href={`mailto:${section.email}`}>{section.email}</a>.
                </p>
              ) : (
                <p>{section.content}</p>
              )}
            </div>
          ))}
        </div>
      </section>
    </PageLayout>
  );
}
