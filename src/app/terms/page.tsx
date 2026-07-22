"use client";

import PageLayout from "@/components/landing/PageLayout";
import { useLanguage } from "@/lib/i18n/LanguageContext";

const termsEs = {
  title: "Términos y Condiciones de Uso — Bitácora",
  updated: "Última actualización: julio 2026",
  intro: [
    'Bienvenido a Bitácora. Estos Términos y Condiciones ("Términos") rigen el acceso y uso de la plataforma web Bitácora (el "Servicio"), operada en la República Dominicana.',
    "Al crear una cuenta, acceder o utilizar el Servicio, usted declara que ha leído, entendido y aceptado estos Términos. Si no está de acuerdo, no debe utilizar el Servicio.",
  ],
  sections: [
    {
      heading: "1. Descripción del Servicio",
      content: [
        "Bitácora es una plataforma digital que permite a los usuarios registrar, organizar y consultar el historial de mantenimiento, reparaciones y documentación de sus vehículos. Las funcionalidades disponibles pueden incluir:",
      ],
      list: [
        "Registro de vehículos (marca, modelo, año, placa, chasis)",
        "Historial de mantenimiento y reparaciones",
        "Recordatorios de mantenimiento, seguros y vencimiento de documentos",
        "Carga y almacenamiento de imágenes/documentos (facturas, marbetes, recibos)",
        "Generación de reportes en PDF",
        "Gestión de usuarios y perfiles",
      ],
      after: "Bitácora puede modificar, suspender o descontinuar funciones, planes o precios en cualquier momento.",
    },
    {
      heading: "2. Cuenta de Usuario",
      content: [
        "Para usar el Servicio, el usuario debe crear una cuenta y se compromete a:",
      ],
      list: [
        "Proporcionar información veraz, completa y actualizada",
        "Mantener sus credenciales de acceso de forma confidencial",
        "Ser responsable de toda actividad realizada bajo su cuenta",
      ],
      after: "Bitácora no se hace responsable por accesos no autorizados derivados de negligencia del usuario (contraseñas compartidas, dispositivos desprotegidos, etc.).",
    },
    {
      heading: "3. Aceptación de los Términos",
      content: [
        "El uso del Servicio está condicionado a la aceptación de estos Términos, la cual ocurre al crear una cuenta, iniciar sesión, o continuar usando el Servicio tras una actualización de estos Términos.",
      ],
    },
    {
      heading: "4. Planes y Suscripciones",
      content: [
        "Bitácora puede ofrecer un modelo freemium con planes gratuitos y de pago. Los precios, funciones y condiciones de cada plan pueden cambiar; se notificará a los usuarios con antelación razonable ante cambios relevantes.",
      ],
      list: [
        "Las suscripciones pueden cancelarse en cualquier momento.",
        "La cancelación evita cargos futuros, pero no genera reembolsos de montos ya pagados, salvo que la ley lo exija.",
      ],
    },
    {
      heading: "5. Eliminación de Cuenta",
      content: [
        "El usuario puede eliminar su cuenta en cualquier momento desde la plataforma o contactando soporte. Tras la eliminación:",
      ],
      list: [
        "Se termina el acceso a la cuenta.",
        "Los datos se eliminan según las políticas internas de retención, salvo obligación legal de conservarlos.",
      ],
    },
    {
      heading: "6. Uso Aceptable",
      content: ["Está prohibido:"],
      list: [
        "Usar el Servicio para fines ilegales o fraudulentos",
        "Realizar ingeniería inversa o intentar vulnerar la seguridad de la plataforma",
        "Extraer datos mediante scraping, bots o herramientas automatizadas",
        "Copiar, redistribuir o explotar el contenido de la plataforma sin autorización",
        "Usar los datos de Bitácora para entrenar modelos de inteligencia artificial sin autorización expresa",
      ],
      after: "El incumplimiento puede resultar en suspensión o cancelación de la cuenta.",
    },
    {
      heading: "7. Propiedad Intelectual",
      content: [
        "El software, diseño, base de datos, marca, interfaz y demás elementos de Bitácora son propiedad de sus desarrolladores y están protegidos por las leyes de propiedad intelectual de la República Dominicana. El uso del Servicio no transfiere ningún derecho de propiedad al usuario.",
      ],
    },
    {
      heading: "8. Datos del Usuario",
      content: [
        "El usuario es responsable de la veracidad, legalidad y exactitud de la información que registra (datos del vehículo, documentos, imágenes). Los datos personales se tratarán conforme a nuestra Política de Privacidad y a la Ley No. 172-13 sobre Protección de Datos Personales de la República Dominicana.",
      ],
    },
    {
      heading: "9. Disponibilidad del Servicio y Exclusión de Garantías",
      content: [
        'Bitácora se ofrece "tal cual" y "según disponibilidad". No garantizamos operación continua, ininterrumpida o libre de errores. Pueden ocurrir interrupciones por mantenimiento, actualizaciones o fallas de terceros.',
      ],
    },
    {
      heading: "10. Limitación de Responsabilidad",
      content: [
        "En la máxima medida permitida por la ley, Bitácora no será responsable por:",
      ],
      list: [
        "Pérdidas financieras, comerciales u operativas",
        "Pérdida de datos o lucro cesante",
        "Decisiones tomadas por el usuario con base en la información registrada en la plataforma",
      ],
      after: "Bitácora no sustituye asesoría profesional (mecánica, legal o de seguros) ni sistemas críticos de seguridad vehicular.",
    },
    {
      heading: "11. Suspensión y Terminación",
      content: [
        "Bitácora puede suspender o cancelar cuentas que incumplan estos Términos, presenten indicios de fraude, o representen un riesgo técnico o legal para la plataforma.",
      ],
    },
    {
      heading: "12. Modificaciones a los Términos",
      content: [
        "Estos Términos pueden actualizarse periódicamente. La versión más reciente estará siempre disponible en el sitio web. El uso continuado del Servicio tras los cambios implica su aceptación.",
      ],
    },
    {
      heading: "13. Ley Aplicable y Jurisdicción",
      content: [
        "Estos Términos se rigen por las leyes de la República Dominicana. Cualquier controversia se someterá a los tribunales competentes de Santo Domingo, salvo que la ley disponga otra jurisdicción obligatoria.",
      ],
    },
    {
      heading: "14. Contacto",
      content: [
        "Para dudas sobre estos Términos, contáctenos en: ",
      ],
      email: "legal@vehicletracker.app",
    },
  ],
};

const termsEn = {
  title: "Terms of Service — Bitácora",
  updated: "Last updated: July 2026",
  intro: [
    'Welcome to Bitácora. These Terms of Service ("Terms") govern your access to and use of the Bitácora web platform (the "Service"), operated in the Dominican Republic.',
    "By creating an account, accessing, or using the Service, you represent that you have read, understood, and accepted these Terms. If you do not agree, you must not use the Service.",
  ],
  sections: [
    {
      heading: "1. Description of the Service",
      content: [
        "Bitácora is a digital platform that allows users to register, organize, and consult the maintenance history, repairs, and documentation of their vehicles. Available features may include:",
      ],
      list: [
        "Vehicle registration (make, model, year, license plate, VIN)",
        "Maintenance and repair history",
        "Maintenance, insurance, and document expiration reminders",
        "Image/document upload and storage (invoices, tags, receipts)",
        "PDF report generation",
        "User and profile management",
      ],
      after: "Bitácora may modify, suspend, or discontinue features, plans, or pricing at any time.",
    },
    {
      heading: "2. User Account",
      content: [
        "To use the Service, the user must create an account and agrees to:",
      ],
      list: [
        "Provide truthful, complete, and up-to-date information",
        "Keep access credentials confidential",
        "Be responsible for all activity performed under their account",
      ],
      after: "Bitácora is not responsible for unauthorized access resulting from user negligence (shared passwords, unprotected devices, etc.).",
    },
    {
      heading: "3. Acceptance of Terms",
      content: [
        "Use of the Service is conditioned on acceptance of these Terms, which occurs upon creating an account, logging in, or continuing to use the Service after an update to these Terms.",
      ],
    },
    {
      heading: "4. Plans and Subscriptions",
      content: [
        "Bitácora may offer a freemium model with free and paid plans. Prices, features, and conditions of each plan may change; users will be notified with reasonable advance notice of relevant changes.",
      ],
      list: [
        "Subscriptions may be canceled at any time.",
        "Cancellation prevents future charges but does not generate refunds for amounts already paid, unless required by law.",
      ],
    },
    {
      heading: "5. Account Deletion",
      content: [
        "The user may delete their account at any time from the platform or by contacting support. After deletion:",
      ],
      list: [
        "Access to the account is terminated.",
        "Data is deleted according to internal retention policies, unless legal obligation requires its preservation.",
      ],
    },
    {
      heading: "6. Acceptable Use",
      content: ["The following is prohibited:"],
      list: [
        "Using the Service for illegal or fraudulent purposes",
        "Reverse engineering or attempting to compromise the platform's security",
        "Extracting data through scraping, bots, or automated tools",
        "Copying, redistributing, or exploiting the platform's content without authorization",
        "Using Bitácora data to train artificial intelligence models without express authorization",
      ],
      after: "Non-compliance may result in suspension or cancellation of the account.",
    },
    {
      heading: "7. Intellectual Property",
      content: [
        "The software, design, database, brand, interface, and other elements of Bitácora are the property of its developers and are protected by the intellectual property laws of the Dominican Republic. Use of the Service does not transfer any ownership rights to the user.",
      ],
    },
    {
      heading: "8. User Data",
      content: [
        "The user is responsible for the truthfulness, legality, and accuracy of the information they register (vehicle data, documents, images). Personal data will be processed in accordance with our Privacy Policy and Law No. 172-13 on Protection of Personal Data of the Dominican Republic.",
      ],
    },
    {
      heading: "9. Service Availability and Warranty Disclaimer",
      content: [
        'Bitácora is provided "as is" and "as available." We do not guarantee continuous, uninterrupted, or error-free operation. Interruptions may occur due to maintenance, updates, or third-party failures.',
      ],
    },
    {
      heading: "10. Limitation of Liability",
      content: [
        "To the maximum extent permitted by law, Bitácora shall not be liable for:",
      ],
      list: [
        "Financial, commercial, or operational losses",
        "Data loss or lost profits",
        "Decisions made by the user based on information registered on the platform",
      ],
      after: "Bitácora does not replace professional advice (mechanical, legal, or insurance) or critical vehicle safety systems.",
    },
    {
      heading: "11. Suspension and Termination",
      content: [
        "Bitácora may suspend or cancel accounts that violate these Terms, show signs of fraud, or pose a technical or legal risk to the platform.",
      ],
    },
    {
      heading: "12. Modifications to Terms",
      content: [
        "These Terms may be updated periodically. The most recent version will always be available on the website. Continued use of the Service after changes implies acceptance.",
      ],
    },
    {
      heading: "13. Governing Law and Jurisdiction",
      content: [
        "These Terms are governed by the laws of the Dominican Republic. Any dispute shall be submitted to the competent courts of Santo Domingo, unless the law establishes another mandatory jurisdiction.",
      ],
    },
    {
      heading: "14. Contact",
      content: [
        "For questions about these Terms, contact us at: ",
      ],
      email: "legal@vehicletracker.app",
    },
  ],
};

export default function TermsPage() {
  const { locale } = useLanguage();
  const t = locale === "es" ? termsEs : termsEn;

  return (
    <PageLayout>
      <section className="pt-32 pb-24">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 prose prose-gray">
          <h1>{t.title}</h1>
          <p className="text-gray-500">{t.updated}</p>

          {t.intro.map((p, i) => (
            <p key={i}>{p}</p>
          ))}

          {t.sections.map((section, si) => (
            <div key={si}>
              <h2>{section.heading}</h2>
              {section.content.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
              {section.list && (
                <ul>
                  {section.list.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              )}
              {section.after && <p>{section.after}</p>}
              {section.email && (
                <p>
                  {section.content.map((p, i) => (
                    <span key={i}>{p}</span>
                  ))}
                  <a href={`mailto:${section.email}`}>{section.email}</a>
                </p>
              )}
            </div>
          ))}
        </div>
      </section>
    </PageLayout>
  );
}
