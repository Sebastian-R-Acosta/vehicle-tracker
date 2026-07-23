"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import {
  X, Share2, Download, Wallet, Camera, Upload,
  AlertTriangle, Clock, Shield, Car, Phone, FileText,
  ChevronRight, CircleUser, Plus
} from "lucide-react";

interface LicenseData {
  name: string | null;
  licenseNumber: string | null;
  licenseExpiry: string | null;
  licenseClass: string | null;
  licenseState: string | null;
  licenseImageFront: string | null;
  licenseImageBack: string | null;
  avatarUrl: string | null;
  phone: string | null;
  email: string | null;
}

interface VehicleData {
  id: string;
  make: string;
  model: string;
  year: number;
  vin: string | null;
  licensePlate: string | null;
}

interface WalletCard {
  id: string;
  type: "license" | "insurance" | "registration" | "roadside";
  title: string;
  subtitle: string;
  gradient: string;
  gradientHover: string;
  accentColor: string;
  expiryDate: string | null;
  valid: boolean;
  expiringSoon: boolean;
  expired: boolean;
  present: boolean;
  headerContent: React.ReactNode;
  expandedContent: React.ReactNode;
}

const CARD_PEEK = 44;
const CARD_RADIUS = 18;

function daysUntil(dateStr: string | null): number | null {
  if (!dateStr) return null;
  return Math.ceil((new Date(dateStr).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
}

function formatDate(dateStr: string | null, locale: string): string {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  return d.toLocaleDateString(locale === "es" ? "es-DO" : "en-US", {
    year: "numeric", month: "2-digit", day: "2-digit",
  });
}

function QrPlaceholder({ color }: { color: string }) {
  const cells = Array.from({ length: 11 }, () =>
    Array.from({ length: 11 }, () => Math.random() > 0.55)
  );
  for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) cells[r][c] = true;
  for (let r = 0; r < 3; r++) for (let c = 8; c < 11; c++) cells[r][c] = true;
  for (let r = 8; r < 11; r++) for (let c = 0; c < 3; c++) cells[r][c] = true;
  return (
    <svg width="64" height="64" viewBox="0 0 11 11">
      <rect width="11" height="11" fill="white" rx="1"/>
      {cells.flatMap((row, r) => row.map((on, c) =>
        on ? <rect key={`${r}-${c}`} x={c} y={r} width="1" height="1" fill={color} opacity="0.85"/> : null
      ))}
    </svg>
  );
}

export default function DocumentWallet({
  license,
  vehicles = [],
  onUpload,
  onPhotograph,
}: {
  license: LicenseData;
  vehicles?: VehicleData[];
  onUpload?: (side: "front" | "back", base64: string) => void;
  onPhotograph?: (side: "front" | "back") => void;
}) {
  const { t, locale } = useLanguage();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"front" | "back">("front");
  const frontInputRef = useRef<HTMLInputElement>(null);
  const backInputRef = useRef<HTMLInputElement>(null);

  const dlDays = daysUntil(license.licenseExpiry);
  const dlValid = dlDays === null || dlDays > 90;
  const dlExpiring = dlDays !== null && dlDays <= 90 && dlDays > 0;
  const dlExpired = dlDays !== null && dlDays <= 0;
  const hasLicenseImg = !!(license.licenseImageFront || license.licenseImageBack);

  const cards: WalletCard[] = [
    {
      id: "license",
      type: "license",
      title: t("license.cardTitle"),
      subtitle: `${t("wallet.className")} ${license.licenseClass || "—"}`,
      gradient: "linear-gradient(145deg, #f1f8e9 0%, #dcedc8 40%, #c5e1a5 100%)",
      gradientHover: "linear-gradient(145deg, #f9fbe7 0%, #e6ee9c 40%, #dce775 100%)",
      accentColor: "#33691e",
      expiryDate: license.licenseExpiry,
      valid: dlValid,
      expiringSoon: !!dlExpiring,
      expired: !!dlExpired,
      present: true,
      headerContent: (
        <div className="flex items-center gap-3 px-5 h-full">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-[#33691e]/10">
            <FileText className="w-4 h-4 text-[#33691e]" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-[#33691e] uppercase tracking-wider truncate">
              {t("license.cardTitle")}
            </p>
            <p className="text-[10px] text-[#558b2f] truncate">
              {license.name || "—"} · {license.licenseClass || "—"}
            </p>
          </div>
          {dlExpired && <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />}
          {dlExpiring && <Clock className="w-4 h-4 text-amber-600 shrink-0" />}
          <ChevronRight className="w-4 h-4 text-[#558b2f] shrink-0" />
        </div>
      ),
      expandedContent: (
        <div className="p-5 h-full flex flex-col">
          <div className="flex items-start gap-4">
            <div className="w-20 h-24 rounded-xl overflow-hidden border-2 border-white/60 bg-white/40 flex items-center justify-center shrink-0 shadow-sm">
              {license.licenseImageFront ? (
                <img src={license.licenseImageFront} alt="" className="w-full h-full object-cover" />
              ) : license.avatarUrl ? (
                <img src={license.avatarUrl} alt="" className="w-full h-full object-cover" />
              ) : (
                <CircleUser className="w-8 h-8 text-[#558b2f]/40" />
              )}
            </div>
            <div className="flex-1 min-w-0 space-y-1">
              <p className="text-[10px] uppercase tracking-wider text-[#33691e]/60 font-medium">{t("wallet.name")}</p>
              <p className="text-base font-bold text-[#1b5e20] truncate">{license.name || "—"}</p>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-2">
                <div>
                  <p className="text-[9px] uppercase tracking-wider text-[#33691e]/60 font-medium">{t("driver.licenseNumber")}</p>
                  <p className="text-sm font-mono font-bold text-[#1b5e20]">{license.licenseNumber || "—"}</p>
                </div>
                <div>
                  <p className="text-[9px] uppercase tracking-wider text-[#33691e]/60 font-medium">{t("driver.licenseClass")}</p>
                  <p className="text-sm font-bold text-[#1b5e20]">{license.licenseClass || "—"}</p>
                </div>
                <div>
                  <p className="text-[9px] uppercase tracking-wider text-[#33691e]/60 font-medium">{t("driver.licenseExpiry")}</p>
                  <p className={`text-sm font-bold ${dlExpired ? "text-red-600" : dlExpiring ? "text-amber-600" : "text-[#1b5e20]"}`}>
                    {formatDate(license.licenseExpiry, locale)}
                  </p>
                </div>
                <div>
                  <p className="text-[9px] uppercase tracking-wider text-[#33691e]/60 font-medium">{t("license.issuingCountry")}</p>
                  <p className="text-sm font-bold text-[#1b5e20]">República Dominicana</p>
                </div>
              </div>
            </div>
          </div>

          {hasLicenseImg && (
            <div className="flex gap-2 mt-3">
              <button onClick={() => setActiveTab("front")}
                className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  activeTab === "front" ? "bg-white/60 text-[#1b5e20]" : "bg-white/20 text-[#33691e] hover:bg-white/30"
                }`}>
                {t("license.front")}
              </button>
              <button onClick={() => setActiveTab("back")}
                className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  activeTab === "back" ? "bg-white/60 text-[#1b5e20]" : "bg-white/20 text-[#33691e] hover:bg-white/30"
                }`}>
                {t("license.back")}
              </button>
            </div>
          )}

          <div className="flex items-center gap-2 mt-auto pt-3">
            <div className="flex items-center gap-2">
              <QrPlaceholder color="#33691e" />
              <div className="text-[8px] text-[#33691e]/50 leading-tight max-w-[80px]">
                {t("wallet.scanToVerify")}
              </div>
            </div>
            <div className="flex-1" />
            <div className="flex gap-1.5">
              <button className="p-2 rounded-lg bg-white/30 hover:bg-white/50 transition-colors">
                <Share2 className="w-4 h-4 text-[#33691e]" />
              </button>
              <button className="p-2 rounded-lg bg-white/30 hover:bg-white/50 transition-colors">
                <Download className="w-4 h-4 text-[#33691e]" />
              </button>
              <button className="p-2 rounded-lg bg-white/30 hover:bg-white/50 transition-colors">
                <Wallet className="w-4 h-4 text-[#33691e]" />
              </button>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "insurance",
      type: "insurance",
      title: t("wallet.autoInsurance"),
      subtitle: t("wallet.fullCoverage"),
      gradient: "linear-gradient(145deg, #e8eaf6 0%, #c5cae9 40%, #9fa8da 100%)",
      gradientHover: "linear-gradient(145deg, #eef0ff 0%, #d5d8f0 40%, #b0b8e0 100%)",
      accentColor: "#283593",
      expiryDate: null,
      valid: true,
      expiringSoon: false,
      expired: false,
      present: false,
      headerContent: (
        <div className="flex items-center gap-3 px-5 h-full">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-[#283593]/10">
            <Shield className="w-4 h-4 text-[#283593]" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-[#283593] uppercase tracking-wider truncate">{t("wallet.autoInsurance")}</p>
            <p className="text-[10px] text-[#5c6bc0] truncate">{t("wallet.tapToAddPolicy")}</p>
          </div>
          <Plus className="w-4 h-4 text-[#5c6bc0] shrink-0" />
        </div>
      ),
      expandedContent: (
        <div className="p-5 h-full flex flex-col items-center justify-center">
          <div className="w-16 h-16 rounded-2xl bg-white/40 flex items-center justify-center mb-3">
            <Shield className="w-8 h-8 text-[#283593]/50" />
          </div>
          <p className="text-sm font-bold text-[#1a237e]">{t("wallet.noInsurancePolicy")}</p>
          <p className="text-xs text-[#5c6bc0] mt-1 text-center max-w-[200px]">
            {t("wallet.uploadInsuranceDesc")}
          </p>
          <label className="mt-4 flex items-center gap-2 px-4 py-2 rounded-xl bg-white/50 hover:bg-white/70 transition-colors cursor-pointer text-xs font-semibold text-[#1a237e]">
            <Upload className="w-4 h-4" />
            {t("wallet.uploadInsuranceCard")}
            <input type="file" accept="image/*" className="hidden" />
          </label>
        </div>
      ),
    },
    {
      id: "registration",
      type: "registration",
      title: t("wallet.vehicleRegistration"),
      subtitle: vehicles[0] ? `${vehicles[0].make} ${vehicles[0].model}` : t("wallet.noVehicle"),
      gradient: "linear-gradient(145deg, #e0f2f1 0%, #b2dfdb 40%, #80cbc4 100%)",
      gradientHover: "linear-gradient(145deg, #e8f5f4 0%, #c5e8e3 40%, #96d5cc 100%)",
      accentColor: "#00695c",
      expiryDate: null,
      valid: true,
      expiringSoon: false,
      expired: false,
      present: vehicles.length > 0,
      headerContent: (
        <div className="flex items-center gap-3 px-5 h-full">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-[#00695c]/10">
            <Car className="w-4 h-4 text-[#00695c]" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-[#00695c] uppercase tracking-wider truncate">{t("wallet.vehicleRegistration")}</p>
            <p className="text-[10px] text-[#4db6ac] truncate">
              {vehicles[0] ? `${vehicles[0].licensePlate || vehicles[0].vin || vehicles[0].make}` : t("wallet.noVehicles")}
            </p>
          </div>
          <ChevronRight className="w-4 h-4 text-[#4db6ac] shrink-0" />
        </div>
      ),
      expandedContent: vehicles[0] ? (
        <div className="p-5 h-full flex flex-col">
          <div className="flex items-start gap-3">
            <div className="w-14 h-14 rounded-xl bg-white/50 flex items-center justify-center shrink-0">
              <Car className="w-7 h-7 text-[#00695c]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-lg font-bold text-[#004d40]">{vehicles[0].make} {vehicles[0].model}</p>
              <p className="text-sm text-[#4db6ac]">{vehicles[0].year}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-3">
            <div>
              <p className="text-[9px] uppercase tracking-wider text-[#00695c]/60 font-medium">{t("wallet.vin")}</p>
              <p className="text-sm font-mono font-bold text-[#004d40]">{vehicles[0].vin || "—"}</p>
            </div>
            <div>
              <p className="text-[9px] uppercase tracking-wider text-[#00695c]/60 font-medium">{t("wallet.plate")}</p>
              <p className="text-sm font-bold text-[#004d40]">{vehicles[0].licensePlate || "—"}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 mt-auto pt-3">
            <div className="flex-1" />
            <div className="flex gap-1.5">
              <button className="p-2 rounded-lg bg-white/30 hover:bg-white/50 transition-colors">
                <Share2 className="w-4 h-4 text-[#00695c]" />
              </button>
              <button className="p-2 rounded-lg bg-white/30 hover:bg-white/50 transition-colors">
                <Download className="w-4 h-4 text-[#00695c]" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-5 h-full flex flex-col items-center justify-center">
          <div className="w-16 h-16 rounded-2xl bg-white/40 flex items-center justify-center mb-3">
            <Car className="w-8 h-8 text-[#00695c]/50" />
          </div>
          <p className="text-sm font-bold text-[#004d40]">{t("wallet.noVehiclesRegistered")}</p>
          <p className="text-xs text-[#4db6ac] mt-1">{t("wallet.addVehicleForRegistration")}</p>
        </div>
      ),
    },
    {
      id: "roadside",
      type: "roadside",
      title: t("wallet.roadsideAssistance"),
      subtitle: t("wallet.emergency247"),
      gradient: "linear-gradient(145deg, #bbdefb 0%, #90caf9 40%, #42a5f5 100%)",
      gradientHover: "linear-gradient(145deg, #c5e0fa 0%, #9ecff5 40%, #5cb0f5 100%)",
      accentColor: "#1565c0",
      expiryDate: null,
      valid: true,
      expiringSoon: false,
      expired: false,
      present: false,
      headerContent: (
        <div className="flex items-center gap-3 px-5 h-full">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-white/20">
            <Phone className="w-4 h-4 text-[#1565c0]" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-white uppercase tracking-wider truncate">{t("wallet.roadsideAssistance")}</p>
            <p className="text-[10px] text-white/70 truncate">{t("wallet.tapToSetup")}</p>
          </div>
          <Plus className="w-4 h-4 text-white/70 shrink-0" />
        </div>
      ),
      expandedContent: (
        <div className="p-5 h-full flex flex-col items-center justify-center">
          <div className="w-16 h-16 rounded-2xl bg-white/30 flex items-center justify-center mb-3">
            <Phone className="w-8 h-8 text-white/60" />
          </div>
          <p className="text-sm font-bold text-white">{t("wallet.noRoadsideCoverage")}</p>
          <p className="text-xs text-white/70 mt-1 text-center max-w-[200px]">
            {t("wallet.addRoadsideMembership")}
          </p>
          <button className="mt-4 flex items-center gap-2 px-4 py-2 rounded-xl bg-white/30 hover:bg-white/40 transition-colors text-xs font-semibold text-white">
            <Plus className="w-4 h-4" />
            {t("wallet.setUpCoverage")}
          </button>
        </div>
      ),
    },
  ];

  const collapsedHeight = 48 + (cards.length - 1) * CARD_PEEK;
  const isExpanded = expandedId !== null;
  const expandedCard = cards.find((c) => c.id === expandedId);

  const validCount = cards.filter((c) => c.present && c.valid).length;
  const presentCount = cards.filter((c) => c.present).length;
  const expiredCount = cards.filter((c) => c.expired).length;
  const hasIssues = cards.some((c) => c.expired || c.expiringSoon);

  const containerSpring = { type: "spring" as const, stiffness: 300, damping: 30 };

  return (
    <div className="relative">
      <div
        className="relative w-full select-none"
        style={{ height: isExpanded ? 480 : collapsedHeight }}
      >
        <AnimatePresence mode="popLayout">
          {cards.map((card, index) => {
            const isThisExpanded = expandedId === card.id;
            const collapsedTop = index * CARD_PEEK;
            const collapsedZ = index;

            return (
              <motion.div
                key={card.id}
                layout
                initial={false}
                animate={
                  isExpanded
                    ? isThisExpanded
                      ? {
                          top: 0,
                          left: 0,
                          right: 0,
                          height: 480,
                          zIndex: 50,
                          opacity: 1,
                          scale: 1,
                        }
                      : {
                          top: 0,
                          left: 0,
                          right: 0,
                          height: 48,
                          zIndex: 0,
                          opacity: 0,
                          scale: 0.92,
                        }
                    : {
                        top: collapsedTop,
                        left: 0,
                        right: 0,
                        height: 52,
                        zIndex: collapsedZ,
                        opacity: 1,
                        scale: 1,
                      }
                }
                transition={{ type: "spring", stiffness: 300, damping: 30, opacity: { duration: 0.2 } }}
                className="absolute rounded-[18px] cursor-pointer overflow-hidden"
                style={{
                  background: card.gradient,
                  boxShadow: isExpanded
                    ? "0 8px 40px rgba(0,0,0,0.18), 0 2px 8px rgba(0,0,0,0.1)"
                    : `0 ${2 + index * 1}px ${4 + index * 4}px rgba(0,0,0,${0.08 + index * 0.03})`,
                  pointerEvents: isExpanded && !isThisExpanded ? "none" : "auto",
                }}
                onClick={() => {
                  if (!isExpanded) setExpandedId(card.id);
                }}
              >
                {/* Top glassy highlight */}
                <div className="absolute top-0 left-0 right-0 h-[3px] bg-white/30 rounded-t-[18px]" />

                {/* Collapsed view header */}
                <div className="h-full flex items-center">
                  {card.headerContent}
                </div>

                {/* Expanded view content */}
                {isThisExpanded && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1, duration: 0.25 }}
                    className="absolute inset-0 pt-[52px]"
                  >
                    {/* Card type badge */}
                    <div className="absolute top-[8px] left-5 right-5 flex items-center justify-between z-10">
                      <span className="text-[10px] font-bold uppercase tracking-wider"
                        style={{ color: card.accentColor + "80" }}
                      >
                        {card.subtitle}
                      </span>
                      <button
                        onClick={(e) => { e.stopPropagation(); setExpandedId(null); }}
                        className="p-1.5 rounded-full hover:bg-black/10 transition-colors"
                      >
                        <X className="w-4 h-4" style={{ color: card.accentColor }} />
                      </button>
                    </div>
                    {card.expandedContent}
                  </motion.div>
                )}

                {/* Expired banner */}
                {!isExpanded && card.expired && (
                  <div className="absolute top-0 right-0 bg-red-500 text-white text-[8px] font-bold px-2 py-0.5 rounded-bl-lg uppercase tracking-wider">
                    {t("wallet.expired")}
                  </div>
                )}
                {!isExpanded && card.expiringSoon && (
                  <div className="absolute top-0 right-0 bg-amber-500 text-white text-[8px] font-bold px-2 py-0.5 rounded-bl-lg uppercase tracking-wider">
                    {t("wallet.expiring")}
                  </div>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>

        {/* Collapsed overlay - bottom shadow bar */}
        {!isExpanded && (
          <div
            className="absolute left-0 right-0 bottom-0 h-6 rounded-b-[18px] pointer-events-none"
            style={{
              background: "linear-gradient(0deg, rgba(0,0,0,0.06) 0%, transparent 100%)",
            }}
          />
        )}
      </div>

      {/* Summary bar */}
      <motion.div
        layout
        className="mt-4 p-4 rounded-2xl border"
        style={{
          background: "linear-gradient(135deg, #f8f9fa 0%, #f1f3f5 100%)",
          borderColor: hasIssues ? "rgba(239,68,68,0.2)" : "rgba(0,0,0,0.06)",
        }}
      >
        {hasIssues ? (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-red-700">{t("wallet.actionRequired")}</p>
              <p className="text-xs text-red-500">
                {expiredCount > 0
                  ? t("wallet.expiredDocsRenew")(expiredCount)
                  : t("wallet.someExpiringSoon")}
              </p>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
              <Shield className="w-5 h-5 text-emerald-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-emerald-700">{t("wallet.allDocumentsValid")}</p>
              <p className="text-xs text-emerald-500">
                {t("wallet.docsInWallet")(presentCount, cards.length)}
              </p>
            </div>
          </div>
        )}
      </motion.div>

      {/* Hidden file inputs for license upload */}
      <input ref={frontInputRef} type="file" accept="image/*" className="hidden" />
      <input ref={backInputRef} type="file" accept="image/*" className="hidden" />
    </div>
  );
}
