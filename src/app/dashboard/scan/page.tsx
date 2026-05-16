"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { ArrowLeft, Camera, Loader2, Scan } from "lucide-react";
import Link from "next/link";

export default function ScanVINPage() {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState("");
  const [manualVin, setManualVin] = useState("");
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraLoading, setCameraLoading] = useState(false);

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((t) => t.stop());
      setStream(null);
    }
    setCameraActive(false);
  };

  const startCamera = async () => {
    setCameraLoading(true);
    setCameraError("");
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      setStream(mediaStream);
      setCameraActive(true);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch {
      setCameraError("Camera access denied or unavailable on this device.");
    } finally {
      setCameraLoading(false);
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const vin = manualVin.trim().toUpperCase();
    if (vin) {
      router.push(`/dashboard/vehicles/new?vin=${encodeURIComponent(vin)}`);
    }
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
                Back
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-card rounded-lg border border-border p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-primary rounded-lg">
              <Scan className="w-5 h-5 text-primary-foreground" />
            </div>
            <h1 className="text-xl font-semibold text-foreground">Scan VIN</h1>
          </div>

          <div className="border-t border-border pt-6">
            <div className="flex items-center gap-2 mb-3">
              <Camera className="w-4 h-4 text-muted-foreground" />
              <p className="text-sm font-medium text-foreground">Type VIN</p>
            </div>
            <form onSubmit={handleManualSubmit} className="flex gap-2 mb-6">
              <input
                value={manualVin}
                onChange={(e) => setManualVin(e.target.value.toUpperCase())}
                placeholder="e.g. 1HGCM82633A004352"
                maxLength={17}
                autoFocus
                className="flex-1 p-3 border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent bg-background text-foreground font-mono"
              />
              <button
                type="submit"
                disabled={manualVin.trim().length === 0}
                className="px-4 py-3 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                Look Up
              </button>
            </form>
          </div>

          <div className="border-t border-border pt-6">
            {!cameraActive ? (
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-3">
                  Or use your camera to scan the VIN barcode
                </p>
                <button
                  onClick={startCamera}
                  disabled={cameraLoading}
                  className="inline-flex items-center gap-2 px-4 py-3 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {cameraLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Camera className="w-4 h-4" />
                  )}
                  {cameraLoading ? "Requesting Camera..." : "Open Camera"}
                </button>
              </div>
            ) : (
              <div>
                <div className="relative mb-4 rounded-lg overflow-hidden bg-black">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    className="w-full h-auto max-h-80 object-cover"
                  />
                  <div className="absolute inset-0 border-2 border-dashed border-primary/40 rounded-lg pointer-events-none" />
                </div>
                <button
                  onClick={stopCamera}
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  Close Camera
                </button>
              </div>
            )}

            {cameraError && (
              <div className="mt-4 p-3 text-sm text-destructive bg-destructive/10 rounded-lg">
                {cameraError}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
