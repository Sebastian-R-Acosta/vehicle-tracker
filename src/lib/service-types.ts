/**
 * Service types are stored in the database as English strings ("Oil Change"), because
 * they are data, not copy — they must stay stable when the customer switches language.
 * The UI therefore has to map the stored value to a translation key at render time;
 * printing the raw value leaks English into a Spanish screen.
 */
export const SERVICE_TYPES: { value: string; key: string }[] = [
  { value: "Oil Change", key: "serviceTypes.oilChange" },
  { value: "Tire Rotation", key: "serviceTypes.tireRotation" },
  { value: "Brake Service", key: "serviceTypes.brakeService" },
  { value: "Air Filter", key: "serviceTypes.airFilter" },
  { value: "Transmission Service", key: "serviceTypes.transmissionService" },
  { value: "Battery Replacement", key: "serviceTypes.batteryReplacement" },
  { value: "Inspection", key: "serviceTypes.inspection" },
  { value: "Repair", key: "serviceTypes.repair" },
  { value: "Other", key: "serviceTypes.other" },
];

const KEY_BY_VALUE = new Map(SERVICE_TYPES.map((s) => [s.value, s.key]));

/**
 * Translation key for a stored service type. Unknown values (free-text entered before
 * the list existed) fall back to the raw string so nothing renders blank.
 */
export function serviceTypeKey(value: string): string {
  return KEY_BY_VALUE.get(value) ?? value;
}

/**
 * Standalone labels for contexts that cannot reach the LanguageProvider — the PDF
 * report renders server-side and receives an explicit locale.
 */
const SERVICE_TYPE_LABELS: Record<"en" | "es", Record<string, string>> = {
  en: {
    "Oil Change": "Oil Change",
    "Tire Rotation": "Tire Rotation",
    "Brake Service": "Brake Service",
    "Air Filter": "Air Filter",
    "Transmission Service": "Transmission Service",
    "Battery Replacement": "Battery Replacement",
    Inspection: "Inspection",
    Repair: "Repair",
    Other: "Other",
  },
  es: {
    "Oil Change": "Cambio de Aceite",
    "Tire Rotation": "Rotación de Llantas",
    "Brake Service": "Servicio de Frenos",
    "Air Filter": "Filtro de Aire",
    "Transmission Service": "Servicio de Transmisión",
    "Battery Replacement": "Cambio de Batería",
    Inspection: "Inspección",
    Repair: "Reparación",
    Other: "Otro",
  },
};

export function serviceTypeLabel(value: string, locale: "en" | "es"): string {
  return SERVICE_TYPE_LABELS[locale]?.[value] ?? value;
}
