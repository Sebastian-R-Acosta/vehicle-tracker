"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, ArrowRight, Loader2, Car, Truck, Bike, Zap, Drill, Tractor, Hammer, Building2 } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { getIndustryPageLabels, IndustryType } from "@/lib/industry-labels";
import { useQueryClient } from "@tanstack/react-query";

const vehicleBaseFields = {
  year: z.number().min(1886).max(new Date().getFullYear() + 1),
  vin: z.string().length(17).optional().or(z.literal("")),
  licensePlate: z.string().max(20).optional().or(z.literal("")),
  nickname: z.string().max(100).optional(),
  vehicleType: z.enum(["car", "truck", "motorcycle", "excavator", "bulldozer", "dump_truck", "crane", "loader", "grader", "other"]).default("car"),
  status: z.enum(["active", "maintenance", "inactive", "sold"]).default("active"),
  currentMileage: z.number().min(0).default(0),
  hoursMeter: z.number().min(0).optional(),
  serialNumber: z.string().max(100).optional(),
  weightCapacity: z.number().min(0).optional(),
  constructionSiteId: z.string().optional(),
};

type VehicleFormData = z.infer<ReturnType<typeof createVehicleSchema>>;

function createVehicleSchema(t: (key: string) => string) {
  return z.object({
    make: z.string().min(1, t("validation.makeRequired")).max(100),
    model: z.string().min(1, t("validation.modelRequired")).max(100),
    ...vehicleBaseFields,
  });
}

const iconMap: Record<string, React.ElementType> = {
  car: Car, truck: Truck, motorcycle: Bike, excavator: Drill,
  bulldozer: Tractor, dump_truck: Truck, crane: Building2,
  loader: Hammer, grader: Tractor, other: Zap,
};

const constructionTypes = new Set(["excavator", "bulldozer", "dump_truck", "crane", "loader", "grader"]);

const vehicleTypeValues = ["car", "truck", "motorcycle", "excavator", "bulldozer", "dump_truck", "crane", "loader", "grader", "other"] as const;
const statusValues = ["active", "maintenance", "inactive", "sold"] as const;

const TOTAL_STEPS = 3;

export default function NewVehiclePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { t } = useLanguage();
  const labels = getIndustryPageLabels((session?.user?.industryType as IndustryType) ?? "default", "vehicles");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [step, setStep] = useState(1);
  const [constructionSites, setConstructionSites] = useState<{ id: string; name: string }[]>([]);
  const queryClient = useQueryClient();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const vin = params.get("vin");
    if (vin) {
      setValue("vin", vin);
      setStep(3);
    }
  }, []);

  const vehicleSchema = useMemo(() => createVehicleSchema(t), [t]);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    trigger,
    formState: { errors },
  } = useForm<VehicleFormData>({
    resolver: zodResolver(vehicleSchema),
    defaultValues: {
      vehicleType: "car",
      status: "active",
      currentMileage: 0,
    },
  });

  const selectedType = watch("vehicleType");
  const isConstruction = constructionTypes.has(selectedType);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  const currentOrgId = session?.user?.currentOrganizationId;

  useEffect(() => {
    if (currentOrgId && isConstruction) {
      fetch(`/api/construction-sites?organizationId=${currentOrgId}`)
        .then((res) => res.ok ? res.json() : [])
        .then((data) => setConstructionSites(data))
        .catch(() => {});
    } else {
      setConstructionSites([]);
    }
  }, [currentOrgId, isConstruction]);

  const validateStep = async (stepToValidate: number): Promise<boolean> => {
    if (stepToValidate === 1) {
      return await trigger("vehicleType");
    }
    if (stepToValidate === 2) {
      return await trigger(["make", "model", "year"]);
    }
    return true;
  };

  const handleNext = async () => {
    const valid = await validateStep(step);
    if (valid && step < TOTAL_STEPS) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const onSubmit = async (data: VehicleFormData) => {
    if (step < TOTAL_STEPS) return;
    setError("");
    setLoading(true);

    try {
      const payload: any = { ...data, organizationId: currentOrgId || undefined };
      if (!isConstruction) {
        delete payload.hoursMeter;
        delete payload.serialNumber;
        delete payload.weightCapacity;
        delete payload.constructionSiteId;
      }

      const res = await fetch("/api/vehicles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error || t("dashboard.vehicleNew.failedCreate"));
      }

      const vehicle = result;
      await queryClient.invalidateQueries({ queryKey: ["vehicles"] });
      router.push("/dashboard");
    } catch (err: any) {
      const msg = err.message || t("dashboard.vehicleNew.somethingWentWrong");
      setError(msg);
      if (msg.toLowerCase().includes("free tier") || msg.toLowerCase().includes("upgrade")) {
        toast.error(
          <div className="flex items-center gap-2">
            <span>{msg}</span>
            <Link href="/pricing" className="font-semibold underline">{t("dashboard.vehicleNew.upgradeToPro")}</Link>
          </div>,
          { duration: 6000 }
        );
      }
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const statusLabels: Record<string, string> = {
    active: t("dashboard.home.statusLabels.active"),
    maintenance: t("dashboard.home.statusLabels.inMaintenance"),
    inactive: t("dashboard.home.statusLabels.inactive"),
    sold: t("dashboard.home.statusLabels.sold"),
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link
                href="/dashboard"
                className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="w-4 h-4" />
                {t("common.back")}
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-card rounded-lg border border-border p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-primary rounded-lg">
              <Car className="w-5 h-5 text-primary-foreground" />
            </div>
            <h1 className="text-xl font-semibold text-foreground">{t(labels.newHeading)}</h1>
          </div>

          <StepIndicator currentStep={step} totalSteps={TOTAL_STEPS} />

          {error && (
            <div className="mb-6 p-3 text-sm text-destructive bg-destructive/10 rounded-lg">
              {error.toLowerCase().includes("free tier") || error.toLowerCase().includes("upgrade") ? (
                <span>{error} — <Link href="/pricing" className="font-semibold underline">{t("dashboard.vehicleNew.upgradeToPro")}</Link></span>
              ) : (
                error
              )}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {step === 1 && <StepTypeSelection selectedType={selectedType} register={register} errors={errors} />}
            {step === 2 && <StepBasicInfo register={register} errors={errors} statusLabels={statusLabels} />}
            {step === 3 && (
              <StepDetails
                isConstruction={isConstruction}
                register={register}
                errors={errors}
                constructionSites={constructionSites}
              />
            )}

            <div className="flex items-center justify-between pt-4">
              {step > 1 ? (
                <button
                  type="button"
                  onClick={handleBack}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  {t("common.back")}
                </button>
              ) : (
                <div />
              )}

              {step < TOTAL_STEPS ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity"
                >
                  {t("common.next")}
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                  {t(labels.saveAction)}
                </button>
              )}
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}

function StepIndicator({ currentStep, totalSteps }: { currentStep: number; totalSteps: number }) {
  const { t } = useLanguage();
  const stepLabels = [
    t("dashboard.vehicleNew.stepType"),
    t("dashboard.vehicleNew.stepBasic"),
    t("dashboard.vehicleNew.stepDetails"),
  ];

  return (
    <div className="flex items-center gap-2 mb-6 mt-4">
      {Array.from({ length: totalSteps }, (_, i) => i + 1).map((s) => (
        <div key={s} className="flex items-center gap-2 flex-1">
          <div className={`flex items-center justify-center w-7 h-7 rounded-full text-sm font-medium transition-colors ${
            s < currentStep
              ? "bg-primary text-primary-foreground"
              : s === currentStep
              ? "bg-primary/20 text-primary border-2 border-primary"
              : "bg-muted text-muted-foreground"
          }`}>
            {s < currentStep ? "✓" : s}
          </div>
          {s < totalSteps && (
            <div className={`flex-1 h-0.5 ${s < currentStep ? "bg-primary" : "bg-muted"}`} />
          )}
        </div>
      ))}
    </div>
  );
}

function StepTypeSelection({
  selectedType,
  register,
  errors,
}: {
  selectedType: string;
  register: any;
  errors: any;
}) {
  const { t } = useLanguage();

  return (
    <div>
      <label className="block text-sm font-medium text-foreground mb-3">
        {t("dashboard.vehicleNew.vehicleType")} <span className="text-destructive">*</span>
      </label>
      <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-3">
        {vehicleTypeValues.map((typeValue) => {
          const Icon = iconMap[typeValue];
          const isSelected = selectedType === typeValue;
          return (
            <label
              key={typeValue}
              className={`flex flex-col items-center gap-1.5 p-3 sm:p-4 rounded-lg border-2 cursor-pointer transition-all ${
                isSelected
                  ? "border-primary bg-primary/10"
                  : "border-border hover:border-primary/50"
              }`}
            >
              <input
                type="radio"
                value={typeValue}
                {...register("vehicleType")}
                className="sr-only"
              />
              <Icon className={`w-5 h-5 sm:w-6 sm:h-6 ${isSelected ? "text-primary" : "text-muted-foreground"}`} />
              <span className={`text-xs sm:text-sm font-medium leading-tight text-center ${isSelected ? "text-primary" : "text-muted-foreground"}`}>
                {t(`dashboard.home.vehicleTypes.${typeValue}`)}
              </span>
            </label>
          );
        })}
      </div>
      {errors.vehicleType && (
        <p className="mt-2 text-sm text-destructive">{errors.vehicleType.message}</p>
      )}
    </div>
  );
}

function StepBasicInfo({
  register,
  errors,
  statusLabels,
}: {
  register: any;
  errors: any;
  statusLabels: Record<string, string>;
}) {
  const { t } = useLanguage();

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">
            {t("vehicle.make")} <span className="text-destructive">*</span>
          </label>
          <input
            {...register("make")}
            className="w-full p-3 border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent bg-background text-foreground"
            placeholder={t("dashboard.vehicleNew.placeholderMake")}
          />
          {errors.make && (
            <p className="mt-1 text-sm text-destructive">{errors.make.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-1">
            {t("vehicle.model")} <span className="text-destructive">*</span>
          </label>
          <input
            {...register("model")}
            className="w-full p-3 border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent bg-background text-foreground"
            placeholder={t("dashboard.vehicleNew.placeholderModel")}
          />
          {errors.model && (
            <p className="mt-1 text-sm text-destructive">{errors.model.message}</p>
          )}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">
            {t("vehicle.year")} <span className="text-destructive">*</span>
          </label>
          <input
            type="number"
            {...register("year", { valueAsNumber: true })}
            className="w-full p-3 border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent bg-background text-foreground"
            placeholder={t("dashboard.vehicleNew.placeholderYear")}
          />
          {errors.year && (
            <p className="mt-1 text-sm text-destructive">{errors.year.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-1">
            {t("vehicle.status")}
          </label>
          <select
            {...register("status")}
            className="w-full p-3 border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent bg-background text-foreground"
          >
            {statusValues.map((s) => (
              <option key={s} value={s}>
                {statusLabels[s]}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-1">
          {t("dashboard.vehicleNew.nicknameOptional")}
        </label>
        <input
          {...register("nickname")}
          className="w-full p-3 border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent bg-background text-foreground"
          placeholder={t("dashboard.vehicleNew.placeholderNickname")}
        />
      </div>
    </>
  );
}

function StepDetails({
  isConstruction,
  register,
  errors,
  constructionSites,
}: {
  isConstruction: boolean;
  register: any;
  errors: any;
  constructionSites: { id: string; name: string }[];
}) {
  const { t } = useLanguage();

  if (isConstruction) {
    return (
      <>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              {t("dashboard.vehicleNew.hoursMeter")}
            </label>
            <input
              type="number"
              {...register("hoursMeter", { valueAsNumber: true })}
              className="w-full p-3 border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent bg-background text-foreground"
              placeholder={t("dashboard.vehicleNew.placeholderMileage")}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              {t("dashboard.vehicleNew.serialNumber")}
            </label>
            <input
              {...register("serialNumber")}
              className="w-full p-3 border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent bg-background text-foreground"
              placeholder={t("dashboard.vehicleNew.placeholderSerial")}
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              {t("dashboard.vehicleNew.weightCapacity")}
            </label>
            <input
              type="number"
              {...register("weightCapacity", { valueAsNumber: true })}
              className="w-full p-3 border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent bg-background text-foreground"
              placeholder={t("dashboard.vehicleNew.placeholderWeight")}
            />
          </div>
          {constructionSites.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                {t("dashboard.vehicleNew.constructionSite")}
              </label>
              <select
                {...register("constructionSiteId")}
                className="w-full p-3 border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent bg-background text-foreground"
              >
                <option value="">{t("dashboard.vehicleNew.noSiteAssignment")}</option>
                {constructionSites.map((site) => (
                  <option key={site.id} value={site.id}>
                    {site.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </>
    );
  }

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">
            {t("dashboard.vehicleNew.currentMileage")}
          </label>
          <input
            type="number"
            {...register("currentMileage", { valueAsNumber: true })}
            className="w-full p-3 border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent bg-background text-foreground"
            placeholder={t("dashboard.vehicleNew.placeholderMileage")}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">
            {t("vehicle.licensePlate")}
          </label>
          <input
            {...register("licensePlate")}
            className="w-full p-3 border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent bg-background text-foreground"
            placeholder={t("dashboard.vehicleNew.placeholderLicensePlate")}
            maxLength={20}
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-1">
          {t("dashboard.vehicleNew.vinOptional")}
        </label>
        <input
          {...register("vin")}
          className="w-full p-3 border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent bg-background text-foreground font-mono"
          placeholder={t("dashboard.vehicleNew.placeholderVin")}
          maxLength={17}
        />
        {errors.vin && (
          <p className="mt-1 text-sm text-destructive">{errors.vin.message}</p>
        )}
      </div>
    </>
  );
}
