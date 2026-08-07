/**
 * Factory service intervals — the single source of truth for "when is this due again".
 *
 * These values were previously inlined in the vehicle maintenance API route; they are
 * the ones that actually create Reminder rows, so they win. Note that the vehicle
 * detail page still carries its own slightly different table for the PDF summary
 * (see getNextDueDate) — those two disagree and should eventually be reconciled here.
 */
export interface ServiceInterval {
  miles: number;
  months: number;
  /** Engine-hour interval, for equipment tracked by hour meter instead of odometer. */
  hours?: number;
}

export const SERVICE_INTERVALS: Record<string, ServiceInterval> = {
  "Oil Change": { miles: 5000, months: 6, hours: 250 },
  "Tire Rotation": { miles: 7500, months: 6 },
  "Brake Service": { miles: 30000, months: 24 },
  "Air Filter": { miles: 15000, months: 12 },
  "Transmission Service": { miles: 60000, months: 48 },
  "Battery Replacement": { miles: 50000, months: 48 },
  Inspection: { miles: 12000, months: 12 },
  "Hydraulic Fluid": { miles: 0, months: 12, hours: 500 },
  "Track Inspection": { miles: 0, months: 6, hours: 250 },
  "Engine Service": { miles: 0, months: 6, hours: 250 },
  "Coolant Flush": { miles: 0, months: 24, hours: 1000 },
};

export function getServiceInterval(serviceType: string): ServiceInterval | null {
  return SERVICE_INTERVALS[serviceType] ?? null;
}
