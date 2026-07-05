"use client";

import { useState, useEffect } from "react";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { X, RotateCw } from "lucide-react";

interface LicenseViewerModalProps {
  open: boolean;
  onClose: () => void;
  imageFront: string | null;
  imageBack: string | null;
}

export default function LicenseViewerModal({
  open,
  onClose,
  imageFront,
  imageBack,
}: LicenseViewerModalProps) {
  const { t } = useLanguage();
  const [showingBack, setShowingBack] = useState(false);

  useEffect(() => {
    if (open) {
      setShowingBack(false);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const currentImage = showingBack ? imageBack : imageFront;
  const bothSides = imageFront && imageBack;

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative max-w-3xl w-full mx-4 flex flex-col items-center"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-full flex items-center justify-between mb-4 px-1">
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
            aria-label={t("common.close")}
          >
            <X className="w-5 h-5 text-white" />
          </button>

          {bothSides && (
            <button
              onClick={() => setShowingBack(!showingBack)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-white text-sm"
            >
              <RotateCw className="w-4 h-4" />
              {showingBack ? t("license.front") : t("license.back")}
            </button>
          )}
        </div>

        <div
          className="w-full rounded-2xl overflow-hidden cursor-pointer shadow-2xl"
          onClick={() => bothSides && setShowingBack(!showingBack)}
        >
          {currentImage ? (
            <img
              src={currentImage}
              alt={showingBack ? t("license.back") : t("license.front")}
              className="w-full h-auto object-contain max-h-[80vh]"
            />
          ) : (
            <div className="flex items-center justify-center h-64 bg-neutral-800 text-neutral-500 text-sm">
              {t("license.noPhoto")}
            </div>
          )}
        </div>

        {bothSides && (
          <p className="text-white/50 text-xs mt-4 text-center">
            {t("license.tapToFlip")}
          </p>
        )}
      </div>
    </div>
  );
}
