"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  Car, ArrowRight, ArrowLeft, Check, Loader2, Upload,
  Bell, Calendar, Droplets, Gauge, Wrench,
} from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export default function OnboardingPage() {
  const { t } = useLanguage();
  const { data: session, status } = useSession();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);

  const roles = [
    { id: "personal", label: t("dashboard.onboarding.rolePersonal"), desc: t("dashboard.onboarding.rolePersonalDesc"), icon: Car },
    { id: "dealer", label: t("dashboard.onboarding.roleDealer"), desc: t("dashboard.onboarding.roleDealerDesc"), icon: Car },
    { id: "insurer", label: t("dashboard.onboarding.roleInsurer"), desc: t("dashboard.onboarding.roleInsurerDesc"), icon: Car },
    { id: "construction", label: t("dashboard.onboarding.roleConstruction"), desc: t("dashboard.onboarding.roleConstructionDesc"), icon: Car },
  ];

  const vehicleTypes = [
    { value: "car", label: t("dashboard.home.vehicleTypes.car") },
    { value: "truck", label: t("dashboard.home.vehicleTypes.truck") },
    { value: "motorcycle", label: t("dashboard.home.vehicleTypes.motorcycle") },
    { value: "excavator", label: t("dashboard.home.vehicleTypes.excavator") },
    { value: "bulldozer", label: t("dashboard.home.vehicleTypes.bulldozer") },
    { value: "dump_truck", label: t("dashboard.home.vehicleTypes.dumpTruck") },
    { value: "crane", label: t("dashboard.home.vehicleTypes.crane") },
    { value: "loader", label: t("dashboard.home.vehicleTypes.loader") },
    { value: "grader", label: t("dashboard.home.vehicleTypes.grader") },
    { value: "other", label: t("dashboard.home.vehicleTypes.other") },
  ];

  const reminderPresets = [
    { id: "oil", label: t("dashboard.onboarding.reminderOil"), icon: Droplets, defaultMiles: 5000 },
    { id: "tires", label: t("dashboard.onboarding.reminderTires"), icon: Gauge, defaultMiles: 6000 },
    { id: "brakes", label: t("dashboard.onboarding.reminderBrakes"), icon: Wrench, defaultMiles: 10000 },
    { id: "inspection", label: t("dashboard.onboarding.reminderInspection"), icon: Calendar, defaultMiles: 0, isDate: true },
  ];

  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [year, setYear] = useState(new Date().getFullYear().toString());
  const [vehicleType, setVehicleType] = useState("car");
  const [nickname, setNickname] = useState("");
  const [currentMileage, setCurrentMileage] = useState("");
  const [vin, setVin] = useState("");

  const [selectedReminders, setSelectedReminders] = useState<string[]>([]);
  const [skipUpload, setSkipUpload] = useState(true);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (status === "unauthenticated") {
    router.push("/login");
    return null;
  }

  const handleContinue = async () => {
    setSaving(true);
    try {
      if (step === 1 && selectedRole) {
        setStep(2);
        setSaving(false);
        return;
      }

      if (step === 2) {
        if (make && model && year) {
          const res = await fetch("/api/vehicles", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              make, model, year: parseInt(year),
              vehicleType, nickname: nickname || null,
              currentMileage: currentMileage ? parseInt(currentMileage) : 0,
              vin: vin || null,
            }),
          });
          if (!res.ok) console.error("Failed to create vehicle");
        }
        setStep(3);
        setSaving(false);
        return;
      }

      if (step === 3) {
        setStep(4);
        setSaving(false);
        return;
      }

      if (step === 4) {
        if (selectedReminders.length > 0 && make && model) {
          for (const reminderId of selectedReminders) {
            const preset = reminderPresets.find(r => r.id === reminderId);
            if (!preset) continue;
            await fetch("/api/reminders", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                title: `${preset.label} - ${make} ${model}`,
                type: preset.isDate ? "date" : "mileage",
                dueDate: preset.isDate ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString() : null,
                dueMileage: preset.isDate ? null : (parseInt(currentMileage || "0") + preset.defaultMiles),
                vehicleId: null,
              }),
            });
          }
        }
        await fetch("/api/user/complete-onboarding", { method: "POST" });
        router.push("/dashboard");
        return;
      }
    } catch (err) {
      console.error("Onboarding error:", err);
    }
    setSaving(false);
  };

  const handleSkip = async () => {
    await fetch("/api/user/complete-onboarding", { method: "POST" });
    router.push("/dashboard");
  };

  const stepIndicator = (num: number, label: string) => (
    <div className="flex items-center gap-2">
      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors ${
        step >= num
          ? "bg-primary text-primary-foreground"
          : "bg-muted text-muted-foreground"
      }`}>
        {step > num ? <Check className="w-4 h-4" /> : num}
      </div>
      <span className={`text-sm hidden sm:inline ${step >= num ? "text-foreground font-medium" : "text-muted-foreground"}`}>
        {label}
      </span>
    </div>
  );

  const inputClass = "w-full px-4 py-3 border border-border rounded-xl focus:ring-2 focus:ring-ring focus:border-transparent outline-none bg-background text-foreground placeholder:text-muted-foreground";
  const labelClass = "block text-sm font-medium text-foreground mb-1";
  const cardClass = "bg-card rounded-2xl shadow-xl border border-border p-8";

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <div className="flex items-center justify-center gap-4 mb-8">
          {stepIndicator(1, t("dashboard.onboarding.stepRole"))}
          <div className="w-8 h-px bg-border" />
          {stepIndicator(2, t("dashboard.onboarding.stepVehicle"))}
          <div className="w-8 h-px bg-border" />
          {stepIndicator(3, t("dashboard.onboarding.stepDocs"))}
          <div className="w-8 h-px bg-border" />
          {stepIndicator(4, t("dashboard.onboarding.stepReminders"))}
        </div>

        <div className={cardClass}>
          {step === 1 && (
            <>
              <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-6">
                <Car className="w-7 h-7 text-primary" />
              </div>
              <h1 className="text-2xl font-bold text-center text-foreground mb-2">{t("dashboard.onboarding.welcome")}</h1>
              <p className="text-muted-foreground text-center mb-8">{t("dashboard.onboarding.welcomeDesc")}</p>

              <div className="space-y-3 mb-8">
                {roles.map((role) => (
                  <button
                    key={role.id}
                    onClick={() => setSelectedRole(role.id)}
                    className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                      selectedRole === role.id
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-muted-foreground/30"
                    }`}
                  >
                    <div className="font-semibold text-foreground">{role.label}</div>
                    <div className="text-sm text-muted-foreground">{role.desc}</div>
                  </button>
                ))}
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-6">
                <Car className="w-7 h-7 text-primary" />
              </div>
              <h1 className="text-2xl font-bold text-center text-foreground mb-2">{t("dashboard.onboarding.addFirstVehicle")}</h1>
              <p className="text-muted-foreground text-center mb-8">{t("dashboard.onboarding.addFirstVehicleDesc")}</p>

              <div className="space-y-4 mb-8">
                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-1">
                    <label className={labelClass}>{t("vehicle.year")}</label>
                    <input type="number" value={year} onChange={(e) => setYear(e.target.value)} placeholder="2024" className={inputClass} />
                  </div>
                  <div className="col-span-1">
                    <label className={labelClass}>{t("vehicle.make")}</label>
                    <input type="text" value={make} onChange={(e) => setMake(e.target.value)} placeholder="Toyota" className={inputClass} />
                  </div>
                  <div className="col-span-1">
                    <label className={labelClass}>{t("vehicle.model")}</label>
                    <input type="text" value={model} onChange={(e) => setModel(e.target.value)} placeholder="Camry" className={inputClass} />
                  </div>
                </div>

                <div>
                    <label className={labelClass}>{t("dashboard.vehicleNew.nicknameOptional")}</label>
                    <input type="text" value={nickname} onChange={(e) => setNickname(e.target.value)} placeholder="My Daily Driver" className={inputClass} />
                </div>

                <div>
                    <label className={labelClass}>{t("dashboard.vehicleNew.vehicleType")}</label>
                  <select value={vehicleType} onChange={(e) => setVehicleType(e.target.value)} className={inputClass}>
                    {vehicleTypes.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelClass}>{t("dashboard.vehicleNew.currentMileage")}</label>
                    <input type="number" value={currentMileage} onChange={(e) => setCurrentMileage(e.target.value)} placeholder="25000" className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>{t("dashboard.vehicleNew.vinOptional")}</label>
                    <input type="text" value={vin} onChange={(e) => setVin(e.target.value.toUpperCase())} placeholder="1HGCM82633A004352" className={inputClass} />
                  </div>
                </div>
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-6">
                <Upload className="w-7 h-7 text-primary" />
              </div>
              <h1 className="text-2xl font-bold text-center text-foreground mb-2">{t("dashboard.onboarding.uploadDocuments")}</h1>
              <p className="text-muted-foreground text-center mb-8">{t("dashboard.onboarding.uploadDocumentsDesc")}</p>

              <div className="border-2 border-dashed border-border rounded-xl p-8 text-center mb-6 hover:border-primary/50 transition-colors cursor-pointer"
                onClick={() => setSkipUpload(false)}
              >
                <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
                <p className="text-sm text-muted-foreground mb-1">{t("dashboard.onboarding.dropFiles")}</p>
                <p className="text-xs text-muted-foreground/60">{t("dashboard.onboarding.fileFormats")}</p>
              </div>

              {!skipUpload && (
                <div className="space-y-2 mb-6">
                  <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-500" />
                      <span className="text-sm text-foreground">service_receipt.pdf</span>
                    </div>
                    <span className="text-xs text-muted-foreground">2.3 MB</span>
                  </div>
                </div>
              )}

              <button onClick={() => setSkipUpload(true)} className="block w-full text-center text-sm text-muted-foreground hover:text-foreground mb-4">
                {t("dashboard.onboarding.skipStep")}
              </button>
            </>
          )}

          {step === 4 && (
            <>
              <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-6">
                <Bell className="w-7 h-7 text-primary" />
              </div>
              <h1 className="text-2xl font-bold text-center text-foreground mb-2">{t("dashboard.onboarding.setUpReminders")}</h1>
              <p className="text-muted-foreground text-center mb-8">{t("dashboard.onboarding.setUpRemindersDesc")}</p>

              <div className="space-y-3 mb-8">
                {reminderPresets.map((reminder) => {
                  const Icon = reminder.icon;
                  const selected = selectedReminders.includes(reminder.id);
                  return (
                    <button
                      key={reminder.id}
                      onClick={() => setSelectedReminders((prev) =>
                        prev.includes(reminder.id) ? prev.filter((r) => r !== reminder.id) : [...prev, reminder.id]
                      )}
                      className={`w-full text-left p-4 rounded-xl border-2 transition-all flex items-center gap-4 ${
                        selected ? "border-primary bg-primary/5" : "border-border hover:border-muted-foreground/30"
                      }`}
                    >
                      <Icon className={`w-5 h-5 ${selected ? "text-primary" : "text-muted-foreground"}`} />
                      <div className="flex-1">
                        <div className="font-semibold text-foreground">{reminder.label}</div>
                        <div className="text-sm text-muted-foreground">
                          {reminder.isDate ? t("dashboard.onboarding.everyYear") : t("dashboard.onboarding.everyMiles", { miles: reminder.defaultMiles.toLocaleString() })}
                        </div>
                      </div>
                      {selected && <Check className="w-5 h-5 text-primary" />}
                    </button>
                  );
                })}
              </div>
            </>
          )}

          <div className="flex gap-3">
            {step > 1 ? (
              <button onClick={() => setStep(step - 1)} className="flex items-center justify-center gap-2 px-6 py-3 border border-border text-foreground rounded-xl font-semibold hover:bg-accent transition-colors">
                <ArrowLeft className="w-4 h-4" />{t("common.back")}
              </button>
            ) : (
              <button onClick={handleSkip} className="flex items-center justify-center px-6 py-3 border border-border text-muted-foreground rounded-xl font-semibold hover:text-foreground transition-colors">
                {t("dashboard.onboarding.skip")}
              </button>
            )}

            <button
              onClick={handleContinue}
              disabled={(step === 1 && !selectedRole) || saving}
              className="flex-1 py-3 bg-primary text-primary-foreground rounded-xl font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : step === 4 ? (
                <>{t("dashboard.onboarding.goToDashboard")}<ArrowRight className="w-4 h-4" /></>
              ) : (
                <>{t("dashboard.onboarding.continue")}<ArrowRight className="w-4 h-4" /></>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
