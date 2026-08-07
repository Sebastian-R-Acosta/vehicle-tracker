"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Check, Loader2, Search, Wrench, User, Car, ClipboardList } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { Button } from "@/components/ui/Button";

const SERVICE_TYPES: { value: string; key: string }[] = [
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

interface Customer {
  id: string;
  name: string | null;
  email: string;
  phone: string | null;
  documentId: string | null;
}

interface VehicleRef {
  id: string;
  make: string;
  model: string;
  year: number;
  licensePlate: string | null;
  currentMileage: number;
}

const inputClass =
  "w-full px-3 py-2.5 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring";

export default function WorkshopDeskPage() {
  const { t } = useLanguage();
  const { data: session } = useSession();

  const [step, setStep] = useState(1);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  // Step 1 — customer
  const [customerQuery, setCustomerQuery] = useState("");
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [customerSearched, setCustomerSearched] = useState(false);
  const [newCustomer, setNewCustomer] = useState({ name: "", email: "", phone: "", documentId: "" });

  // Step 2 — vehicle
  const [plateQuery, setPlateQuery] = useState("");
  const [vehicle, setVehicle] = useState<VehicleRef | null>(null);
  const [vehicleSearched, setVehicleSearched] = useState(false);
  const [vehicleBlocked, setVehicleBlocked] = useState(false);
  const [newVehicle, setNewVehicle] = useState({ make: "", model: "", year: "", licensePlate: "", vin: "", currentMileage: "" });

  // Step 3 — service
  const [service, setService] = useState({
    serviceType: "Oil Change",
    notes: "",
    estimatedHours: "",
    cost: "",
    mileage: "",
    status: "in_progress",
    createReminder: true,
  });
  const [result, setResult] = useState<{ nextReminder: { dueDate: string | null; dueMileage: number | null } | null } | null>(null);

  const hasOrg = !!session?.user?.currentOrganizationId;

  async function call<T>(url: string, init?: RequestInit): Promise<T | null> {
    setError("");
    setBusy(true);
    try {
      const res = await fetch(url, {
        ...init,
        headers: { "Content-Type": "application/json", ...(init?.headers || {}) },
      });
      if (!res.ok) {
        const text = await res.text();
        let message = text;
        try {
          message = JSON.parse(text).error ?? text;
        } catch {
          /* plain-text error body */
        }
        setError(message || t("workshop.genericError"));
        return null;
      }
      return (await res.json()) as T;
    } catch {
      setError(t("workshop.genericError"));
      return null;
    } finally {
      setBusy(false);
    }
  }

  const searchCustomer = async () => {
    if (!customerQuery.trim()) return;
    const data = await call<{ found: boolean; customer: Customer | null }>(
      `/api/workshop/customers?q=${encodeURIComponent(customerQuery.trim())}`
    );
    if (!data) return;
    setCustomerSearched(true);
    setCustomer(data.customer);
    if (!data.found) {
      // Pre-fill whichever field the operator just searched by.
      const q = customerQuery.trim();
      setNewCustomer((prev) => ({
        ...prev,
        email: q.includes("@") ? q : prev.email,
        documentId: !q.includes("@") && /\d/.test(q) ? q : prev.documentId,
      }));
    }
  };

  const createCustomer = async () => {
    const data = await call<{ customer: Customer }>("/api/workshop/customers", {
      method: "POST",
      body: JSON.stringify(newCustomer),
    });
    if (data?.customer) setCustomer(data.customer);
  };

  const searchVehicle = async () => {
    if (!plateQuery.trim()) return;
    const data = await call<{ found: boolean; authorized: boolean; vehicle: VehicleRef | null }>(
      `/api/workshop/vehicles?plate=${encodeURIComponent(plateQuery.trim())}`
    );
    if (!data) return;
    setVehicleSearched(true);
    setVehicleBlocked(data.found && !data.authorized);
    setVehicle(data.found && data.authorized ? data.vehicle : null);
    if (!data.found) {
      setNewVehicle((prev) => ({ ...prev, licensePlate: plateQuery.trim() }));
    }
  };

  const createVehicle = async () => {
    if (!customer) return;
    const data = await call<VehicleRef>("/api/workshop/vehicles", {
      method: "POST",
      body: JSON.stringify({ ...newVehicle, customerId: customer.id }),
    });
    if (data) setVehicle(data);
  };

  const saveService = async () => {
    if (!vehicle) return;
    const data = await call<{ nextReminder: { dueDate: string | null; dueMileage: number | null } | null }>(
      "/api/workshop/services",
      {
        method: "POST",
        body: JSON.stringify({
          vehicleId: vehicle.id,
          serviceType: service.serviceType,
          mileage: Number(service.mileage || vehicle.currentMileage),
          notes: service.notes || null,
          cost: service.cost ? Number(service.cost) : null,
          estimatedHours: service.estimatedHours ? Number(service.estimatedHours) : null,
          status: service.status,
          createReminder: service.createReminder,
        }),
      }
    );
    if (data) {
      setResult(data);
      setStep(4);
    }
  };

  const reset = () => {
    setStep(1);
    setCustomerQuery("");
    setCustomer(null);
    setCustomerSearched(false);
    setNewCustomer({ name: "", email: "", phone: "", documentId: "" });
    setPlateQuery("");
    setVehicle(null);
    setVehicleSearched(false);
    setVehicleBlocked(false);
    setNewVehicle({ make: "", model: "", year: "", licensePlate: "", vin: "", currentMileage: "" });
    setService({ serviceType: "Oil Change", notes: "", estimatedHours: "", cost: "", mileage: "", status: "in_progress", createReminder: true });
    setResult(null);
    setError("");
  };

  if (!hasOrg) {
    return (
      <div className="p-6 max-w-2xl">
        <div className="p-4 rounded-lg bg-destructive/10 text-destructive" role="alert">
          {t("workshop.notWorkshop")}
        </div>
      </div>
    );
  }

  const steps = [
    { n: 1, label: t("workshop.stepCustomer"), icon: User },
    { n: 2, label: t("workshop.stepVehicle"), icon: Car },
    { n: 3, label: t("workshop.stepService"), icon: ClipboardList },
    { n: 4, label: t("workshop.stepDone"), icon: Check },
  ];

  return (
    <div className="p-4 sm:p-6 max-w-3xl">
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Wrench className="w-6 h-6 text-primary" aria-hidden="true" />
            {t("workshop.title")}
          </h1>
          <p className="text-muted-foreground text-sm mt-1">{t("workshop.subtitle")}</p>
        </div>
        <Link href="/dashboard/workshop/history" className="text-sm text-primary hover:underline whitespace-nowrap py-3">
          {t("workshop.historyTitle")}
        </Link>
      </div>

      <ol className="flex items-center gap-2 mb-8" aria-label={t("workshop.title")}>
        {steps.map((s) => {
          const Icon = s.icon;
          const active = step === s.n;
          const done = step > s.n;
          return (
            <li key={s.n} className="flex-1">
              <div
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${
                  active ? "bg-primary text-primary-foreground" : done ? "bg-primary/10 text-primary" : "bg-secondary text-muted-foreground"
                }`}
                aria-current={active ? "step" : undefined}
              >
                <Icon className="w-4 h-4 shrink-0" aria-hidden="true" />
                <span className="truncate">{s.label}</span>
              </div>
            </li>
          );
        })}
      </ol>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm" role="alert">
          {error}
        </div>
      )}

      {step === 1 && (
        <section className="space-y-4">
          <div className="p-4 rounded-xl border border-border bg-card">
            <h2 className="font-semibold text-foreground mb-1">{t("workshop.customerSearchTitle")}</h2>
            <p className="text-sm text-muted-foreground mb-3">{t("workshop.customerSearchHint")}</p>
            <div className="flex gap-2">
              <label htmlFor="customer-q" className="sr-only">
                {t("workshop.customerSearchPlaceholder")}
              </label>
              <input
                id="customer-q"
                className={inputClass}
                value={customerQuery}
                onChange={(e) => setCustomerQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && searchCustomer()}
                placeholder={t("workshop.customerSearchPlaceholder")}
              />
              <Button onClick={searchCustomer} loading={busy} disabled={!customerQuery.trim()}>
                <Search className="w-4 h-4" aria-hidden="true" />
                {t("workshop.search")}
              </Button>
            </div>
          </div>

          {customer && (
            <div className="p-4 rounded-xl border-2 border-primary bg-primary/5">
              <p className="text-xs font-semibold text-primary mb-1">{t("workshop.customerFound")}</p>
              <p className="font-semibold text-foreground">{customer.name || customer.email}</p>
              <p className="text-sm text-muted-foreground">
                {customer.email}
                {customer.phone ? ` · ${customer.phone}` : ""}
                {customer.documentId ? ` · ${customer.documentId}` : ""}
              </p>
              <Button className="mt-3" onClick={() => setStep(2)}>
                {t("workshop.useThisCustomer")}
              </Button>
            </div>
          )}

          {customerSearched && !customer && (
            <div className="p-4 rounded-xl border border-border bg-card space-y-3">
              <p className="text-sm text-muted-foreground">{t("workshop.customerNotFound")}</p>
              <h3 className="font-semibold text-foreground">{t("workshop.newCustomer")}</h3>
              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label htmlFor="nc-name" className="block text-sm font-medium text-foreground mb-1">
                    {t("workshop.customerName")}
                  </label>
                  <input id="nc-name" className={inputClass} value={newCustomer.name} onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })} />
                </div>
                <div>
                  <label htmlFor="nc-email" className="block text-sm font-medium text-foreground mb-1">
                    {t("workshop.customerEmail")}
                  </label>
                  <input id="nc-email" type="email" className={inputClass} value={newCustomer.email} onChange={(e) => setNewCustomer({ ...newCustomer, email: e.target.value })} />
                </div>
                <div>
                  <label htmlFor="nc-phone" className="block text-sm font-medium text-foreground mb-1">
                    {t("workshop.customerPhone")}
                  </label>
                  <input id="nc-phone" className={inputClass} value={newCustomer.phone} onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })} />
                </div>
                <div>
                  <label htmlFor="nc-doc" className="block text-sm font-medium text-foreground mb-1">
                    {t("workshop.customerDocument")}
                  </label>
                  <input id="nc-doc" className={inputClass} value={newCustomer.documentId} onChange={(e) => setNewCustomer({ ...newCustomer, documentId: e.target.value })} />
                </div>
              </div>
              <Button onClick={createCustomer} loading={busy} disabled={!newCustomer.name.trim() || !newCustomer.email.trim()}>
                {t("workshop.createCustomer")}
              </Button>
            </div>
          )}
        </section>
      )}

      {step === 2 && (
        <section className="space-y-4">
          <div className="p-4 rounded-xl border border-border bg-card">
            <h2 className="font-semibold text-foreground mb-1">{t("workshop.vehicleSearchTitle")}</h2>
            <p className="text-sm text-muted-foreground mb-3">{t("workshop.vehicleSearchHint")}</p>
            <div className="flex gap-2">
              <label htmlFor="plate-q" className="sr-only">
                {t("workshop.platePlaceholder")}
              </label>
              <input
                id="plate-q"
                className={inputClass}
                value={plateQuery}
                onChange={(e) => setPlateQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && searchVehicle()}
                placeholder={t("workshop.platePlaceholder")}
              />
              <Button onClick={searchVehicle} loading={busy} disabled={!plateQuery.trim()}>
                <Search className="w-4 h-4" aria-hidden="true" />
                {t("workshop.search")}
              </Button>
            </div>
          </div>

          {vehicleBlocked && (
            <div className="p-4 rounded-xl bg-destructive/10 text-destructive text-sm" role="alert">
              {t("workshop.vehicleNotAuthorized")}
            </div>
          )}

          {vehicle && (
            <div className="p-4 rounded-xl border-2 border-primary bg-primary/5">
              <p className="text-xs font-semibold text-primary mb-1">{t("workshop.vehicleFound")}</p>
              <p className="font-semibold text-foreground">
                {vehicle.year} {vehicle.make} {vehicle.model}
              </p>
              <p className="text-sm text-muted-foreground">{vehicle.licensePlate}</p>
              <Button
                className="mt-3"
                onClick={() => {
                  setService((s) => ({ ...s, mileage: String(vehicle.currentMileage) }));
                  setStep(3);
                }}
              >
                {t("workshop.useThisVehicle")}
              </Button>
            </div>
          )}

          {vehicleSearched && !vehicle && !vehicleBlocked && (
            <div className="p-4 rounded-xl border border-border bg-card space-y-3">
              <p className="text-sm text-muted-foreground">{t("workshop.vehicleNotFound")}</p>
              <h3 className="font-semibold text-foreground">{t("workshop.newVehicle")}</h3>
              <div className="grid sm:grid-cols-2 gap-3">
                {([
                  ["make", t("workshop.make"), "text"],
                  ["model", t("workshop.model"), "text"],
                  ["year", t("workshop.year"), "number"],
                  ["licensePlate", t("workshop.plate"), "text"],
                  ["vin", t("workshop.vin"), "text"],
                  ["currentMileage", t("workshop.mileage"), "number"],
                ] as const).map(([field, label, type]) => (
                  <div key={field}>
                    <label htmlFor={`nv-${field}`} className="block text-sm font-medium text-foreground mb-1">
                      {label}
                    </label>
                    <input
                      id={`nv-${field}`}
                      type={type}
                      className={inputClass}
                      value={newVehicle[field]}
                      onChange={(e) => setNewVehicle({ ...newVehicle, [field]: e.target.value })}
                    />
                  </div>
                ))}
              </div>
              <Button onClick={createVehicle} loading={busy} disabled={!newVehicle.make.trim() || !newVehicle.model.trim() || !newVehicle.year}>
                {t("workshop.createVehicle")}
              </Button>
            </div>
          )}

          <Button variant="ghost" onClick={() => setStep(1)}>
            {t("workshop.back")}
          </Button>
        </section>
      )}

      {step === 3 && vehicle && (
        <section className="space-y-4">
          <div className="p-4 rounded-xl border border-border bg-card space-y-3">
            <h2 className="font-semibold text-foreground">{t("workshop.serviceTitle")}</h2>

            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <label htmlFor="sv-type" className="block text-sm font-medium text-foreground mb-1">
                  {t("workshop.serviceType")}
                </label>
                <select id="sv-type" className={inputClass} value={service.serviceType} onChange={(e) => setService({ ...service, serviceType: e.target.value })}>
                  {SERVICE_TYPES.map((s) => (
                    <option key={s.value} value={s.value}>
                      {t(s.key)}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="sv-mileage" className="block text-sm font-medium text-foreground mb-1">
                  {t("workshop.mileage")}
                </label>
                <input id="sv-mileage" type="number" className={inputClass} value={service.mileage} onChange={(e) => setService({ ...service, mileage: e.target.value })} />
              </div>
              <div>
                <label htmlFor="sv-hours" className="block text-sm font-medium text-foreground mb-1">
                  {t("workshop.estimatedHours")}
                </label>
                <input id="sv-hours" type="number" step="0.5" className={inputClass} value={service.estimatedHours} onChange={(e) => setService({ ...service, estimatedHours: e.target.value })} />
              </div>
              <div>
                <label htmlFor="sv-cost" className="block text-sm font-medium text-foreground mb-1">
                  {t("workshop.cost")}
                </label>
                <input id="sv-cost" type="number" step="0.01" className={inputClass} value={service.cost} onChange={(e) => setService({ ...service, cost: e.target.value })} />
              </div>
            </div>

            <div>
              <label htmlFor="sv-notes" className="block text-sm font-medium text-foreground mb-1">
                {t("workshop.description")}
              </label>
              <textarea id="sv-notes" rows={3} className={inputClass} value={service.notes} onChange={(e) => setService({ ...service, notes: e.target.value })} />
            </div>

            <div>
              <label htmlFor="sv-status" className="block text-sm font-medium text-foreground mb-1">
                {t("workshop.status")}
              </label>
              <select id="sv-status" className={inputClass} value={service.status} onChange={(e) => setService({ ...service, status: e.target.value })}>
                <option value="in_progress">{t("workshop.statusInProgress")}</option>
                <option value="ready">{t("workshop.statusReady")}</option>
                <option value="completed">{t("workshop.statusCompleted")}</option>
              </select>
            </div>

            <div className="flex items-start gap-2">
              <input
                id="sv-reminder"
                type="checkbox"
                className="mt-1 h-4 w-4 rounded border-input text-primary focus:ring-2 focus:ring-ring"
                checked={service.createReminder}
                onChange={(e) => setService({ ...service, createReminder: e.target.checked })}
              />
              <label htmlFor="sv-reminder" className="text-sm text-muted-foreground">
                {t("workshop.createReminder")}
              </label>
            </div>
          </div>

          <div className="flex gap-2">
            <Button variant="ghost" onClick={() => setStep(2)}>
              {t("workshop.back")}
            </Button>
            <Button onClick={saveService} loading={busy}>
              {t("workshop.saveService")}
            </Button>
          </div>
        </section>
      )}

      {step === 4 && (
        <section className="p-6 rounded-xl border border-border bg-card text-center">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            {busy ? <Loader2 className="w-6 h-6 animate-spin text-primary" /> : <Check className="w-6 h-6 text-primary" aria-hidden="true" />}
          </div>
          <h2 className="text-lg font-bold text-foreground">{t("workshop.savedTitle")}</h2>
          <p className="text-sm text-muted-foreground mt-1">{t("workshop.savedBody")}</p>

          {result?.nextReminder && (
            <p className="text-sm text-foreground mt-4">
              <strong>{t("workshop.nextServiceSuggested")}:</strong>{" "}
              {result.nextReminder.dueDate ? new Date(result.nextReminder.dueDate).toLocaleDateString() : ""}
              {result.nextReminder.dueMileage ? ` · ${result.nextReminder.dueMileage.toLocaleString()}` : ""}
            </p>
          )}

          <div className="flex items-center justify-center gap-2 mt-6">
            <Button onClick={reset}>{t("workshop.startAnother")}</Button>
            <Link href="/dashboard/workshop/history">
              <Button variant="outline">{t("workshop.historyTitle")}</Button>
            </Link>
          </div>
        </section>
      )}
    </div>
  );
}
