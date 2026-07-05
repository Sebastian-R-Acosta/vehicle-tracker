"use client";

import { useState, useRef, useCallback } from "react";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { Camera, Upload, RotateCw, User } from "lucide-react";

interface LicenseCardProps {
  name: string | null;
  licenseNumber: string | null;
  licenseExpiry: string | null;
  licenseClass: string | null;
  licenseImageFront: string | null;
  licenseImageBack: string | null;
  avatarUrl: string | null;
  onUpload: (side: "front" | "back", base64: string) => void;
  onPhotograph: (side: "front" | "back") => void;
}

export default function LicenseCard({
  name,
  licenseNumber,
  licenseExpiry,
  licenseClass,
  licenseImageFront,
  licenseImageBack,
  avatarUrl,
  onUpload,
  onPhotograph,
}: LicenseCardProps) {
  const { t, locale } = useLanguage();
  const [flipped, setFlipped] = useState(false);
  const [activeSide, setActiveSide] = useState<"front" | "back">("front");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingSide, setUploadingSide] = useState<"front" | "back" | null>(null);

  const daysUntilExpiry = licenseExpiry
    ? Math.ceil((new Date(licenseExpiry).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null;

  const statusBadge = daysUntilExpiry === null ? null
    : daysUntilExpiry > 90 ? { label: t("license.status.valid"), class: "bg-emerald-500" }
    : daysUntilExpiry > 0 ? { label: t("license.status.expiringSoon"), class: "bg-amber-500" }
    : { label: t("license.status.expired"), class: "bg-red-500" };

  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>, side: "front" | "back") => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingSide(side);
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = (reader.result as string).split(",")[1];
      onUpload(side, base64);
      setUploadingSide(null);
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  }, [onUpload]);

  const triggerUpload = (side: "front" | "back") => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
      setActiveSide(side);
    }
  };

  const formatExpiry = (dateStr: string | null) => {
    if (!dateStr) return "—";
    const d = new Date(dateStr);
    return d.toLocaleDateString(locale === "es" ? "es-DO" : "en-US", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  const showBothSidesToggle = licenseImageFront && licenseImageBack;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold text-foreground">{t("license.cardTitle")}</h2>
          {statusBadge && (
            <span className={`px-3 py-0.5 text-xs font-bold text-white rounded-full ${statusBadge.class}`}>
              {statusBadge.label}
            </span>
          )}
        </div>
        {showBothSidesToggle && (
          <button
            onClick={() => setFlipped(!flipped)}
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
            title={t("license.tapToFlip")}
          >
            <RotateCw className="w-3.5 h-3.5" />
            {flipped ? t("license.front") : t("license.back")}
          </button>
        )}
      </div>

      <div
        className="relative perspective-[1200px] h-[220px] sm:h-[240px] cursor-pointer"
        onClick={() => showBothSidesToggle && setFlipped(!flipped)}
      >
        <div
          className={`relative w-full h-full transition-transform duration-700 [transform-style:preserve-3d] ${
            flipped ? "[transform:rotateY(180deg)]" : ""
          }`}
        >
          {/* ── FRONT FACE ── */}
          <div className={`absolute inset-0 [backface-visibility:hidden] ${flipped ? "pointer-events-none" : ""}`}>
            <div className="relative h-full rounded-2xl overflow-hidden"
              style={{
                background: "linear-gradient(145deg, #f8f9fa 0%, #e9ecef 40%, #dee2e6 100%)",
                boxShadow: `
                  0 2px 4px rgba(0,0,0,0.08),
                  0 8px 24px rgba(0,0,0,0.12),
                  0 1px 2px rgba(0,0,0,0.06),
                  inset 0 1px 0 rgba(255,255,255,0.8)
                `,
              }}
            >
              {/* Card inner border */}
              <div className="absolute inset-[3px] rounded-[14px] border border-white/40 pointer-events-none" />

              {/* Flag stripe */}
              <div className="absolute top-0 left-0 right-0 h-2"
                style={{ background: "linear-gradient(90deg, #002776 0%, #002776 33%, #fff 33%, #fff 66%, #CE1126 66%, #CE1126 100%)" }}
              />

              {/* Header */}
              <div className="absolute top-3 left-5 right-5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold"
                    style={{ background: "linear-gradient(135deg, #002776, #003d99)", color: "#fff" }}
                  >
                    RD
                  </div>
                  <span className="text-[11px] font-bold uppercase tracking-[0.15em] text-neutral-700">
                    República Dominicana
                  </span>
                </div>
                <span className="text-[9px] text-neutral-400 uppercase tracking-wider font-medium">License</span>
              </div>

              {/* Photo */}
              <div className="absolute top-[52px] left-5 w-[68px] h-[82px] rounded-lg overflow-hidden border border-neutral-300 bg-neutral-100 flex items-center justify-center shadow-inner">
                {(licenseImageFront || avatarUrl) ? (
                  <img
                    src={licenseImageFront || avatarUrl!}
                    alt="Driver"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-8 h-8 text-neutral-300" />
                )}
              </div>

              {/* Fields */}
              <div className="absolute top-[50px] left-[100px] right-5 space-y-0.5">
                <div className="mb-1">
                  <p className="text-[9px] uppercase tracking-wider text-neutral-400 font-medium">{t("driver.name")}</p>
                  <p className="text-sm font-semibold text-neutral-800 truncate">{name || "—"}</p>
                </div>
                <div>
                  <p className="text-[9px] uppercase tracking-wider text-neutral-400 font-medium">{t("driver.licenseNumber")}</p>
                  <p className="text-sm font-mono font-bold text-neutral-800 tracking-widest">{licenseNumber || "—"}</p>
                </div>
              </div>

              {/* Bottom row */}
              <div className="absolute bottom-4 left-5 right-5 grid grid-cols-3 gap-2">
                <div>
                  <p className="text-[8px] uppercase tracking-wider text-neutral-400 font-medium">{t("driver.licenseClass")}</p>
                  <p className="text-xs font-semibold text-neutral-700">{licenseClass || "—"}</p>
                </div>
                <div>
                  <p className="text-[8px] uppercase tracking-wider text-neutral-400 font-medium">{t("driver.licenseExpiry")}</p>
                  <p className={`text-xs font-bold ${daysUntilExpiry !== null && daysUntilExpiry <= 30 ? "text-red-600" : "text-neutral-700"}`}>
                    {formatExpiry(licenseExpiry)}
                  </p>
                </div>
                <div>
                  <p className="text-[8px] uppercase tracking-wider text-neutral-400 font-medium">DOB</p>
                  <p className="text-xs font-semibold text-neutral-700">—</p>
                </div>
              </div>

              {/* Holographic seal */}
              <div className="absolute top-[52px] right-5 w-[22px] h-[22px] rounded-full opacity-30"
                style={{ background: "linear-gradient(135deg, #fbbf24, #f59e0b, #fbbf24, #f59e0b)" }}
              />

              {/* Bottom gradient line */}
              <div className="absolute bottom-0 left-0 right-0 h-0.5"
                style={{ background: "linear-gradient(90deg, #002776, #fff, #CE1126)" }}
              />
            </div>
          </div>

          {/* ── BACK FACE ── */}
          <div className="absolute inset-0 [backface-visibility:hidden] [transform:rotateY(180deg)]">
            <div className="relative h-full rounded-2xl overflow-hidden"
              style={{
                background: "linear-gradient(145deg, #f8f9fa 0%, #e9ecef 40%, #dee2e6 100%)",
                boxShadow: `
                  0 2px 4px rgba(0,0,0,0.08),
                  0 8px 24px rgba(0,0,0,0.12),
                  0 1px 2px rgba(0,0,0,0.06),
                  inset 0 1px 0 rgba(255,255,255,0.8)
                `,
              }}
            >
              <div className="absolute inset-[3px] rounded-[14px] border border-white/40 pointer-events-none" />

              {/* Magnetic stripe */}
              <div className="absolute top-8 left-0 right-0 h-10"
                style={{
                  background: "linear-gradient(180deg, #1a1a1a 0%, #2d2d2d 50%, #1a1a1a 100%)",
                  boxShadow: "inset 0 2px 4px rgba(0,0,0,0.3)",
                }}
              />

              {/* Signature area */}
              <div className="absolute top-[88px] left-5 right-5">
                <p className="text-[9px] uppercase tracking-wider text-neutral-400 font-medium mb-1">Signature</p>
                <div className="h-8 rounded border border-neutral-300 bg-white/60 flex items-center px-3"
                  style={{
                    boxShadow: "inset 0 1px 2px rgba(0,0,0,0.06)",
                    background: "repeating-linear-gradient(90deg, transparent, transparent 4px, rgba(0,0,0,0.02) 4px, rgba(0,0,0,0.02) 8px)",
                  }}
                >
                  <span className="font-['Brush_Script_Mt',cursive] text-lg text-neutral-500 italic opacity-60">{name || ""}</span>
                </div>
              </div>

              {/* Barcode placeholder */}
              <div className="absolute bottom-7 left-5 right-5 flex justify-center">
                <div className="flex items-end gap-[2px] h-10">
                  {Array.from({ length: 40 }).map((_, i) => (
                    <div
                      key={i}
                      className="w-[3px] bg-neutral-600 rounded-[1px]"
                      style={{
                        height: `${Math.max(4, Math.sin(i * 1.5) * 14 + 16)}px`,
                        opacity: 0.6 + Math.random() * 0.4,
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* Footer on back */}
              <div className="absolute bottom-1 left-0 right-0 text-center">
                <span className="text-[8px] text-neutral-300 tracking-wider">Vehicle Tracker · Digital License</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Upload buttons */}
      <div className="flex gap-3">
        <label className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border-2 border-dashed cursor-pointer transition-all ${
          uploadingSide === "front" ? "opacity-50 pointer-events-none" : ""
        } border-neutral-300 hover:border-blue-400 hover:bg-blue-50/50 text-neutral-600 hover:text-blue-600`}>
          <Upload className="w-4 h-4" />
          <span className="text-sm font-medium">{t("license.uploadFront")}</span>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => handleFileSelect(e, "front")}
          />
        </label>
        <label className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border-2 border-dashed cursor-pointer transition-all ${
          uploadingSide === "back" ? "opacity-50 pointer-events-none" : ""
        } border-neutral-300 hover:border-blue-400 hover:bg-blue-50/50 text-neutral-600 hover:text-blue-600`}>
          <Upload className="w-4 h-4" />
          <span className="text-sm font-medium">{t("license.uploadBack")}</span>
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => handleFileSelect(e, "back")}
          />
        </label>
      </div>

      {showBothSidesToggle && (
        <p className="text-[11px] text-muted-foreground text-center">{t("license.tapToFlip")}</p>
      )}
    </div>
  );
}
