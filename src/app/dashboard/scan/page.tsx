"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ArrowLeft, Camera, CameraOff, Loader2, Scan, Smartphone, RefreshCw,
} from "lucide-react";
import Link from "next/link";

export default function ScanVINPage() {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState("");
  const [debugInfo, setDebugInfo] = useState("");
  const [manualVin, setManualVin] = useState("");
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraLoading, setCameraLoading] = useState(false);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
      videoRef.current.play().catch(() => {});
    }
  }, [stream]);

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach((t) => t.stop());
      setStream(null);
    }
    setCameraActive(false);
    setCameraError("");
  }, [stream]);

  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach((t) => t.stop());
      }
    };
  }, [stream]);

  const startCamera = async () => {
    setCameraLoading(true);
    setCameraError("");
    setDebugInfo("");

    if (typeof window === "undefined" || !navigator.mediaDevices) {
      setCameraError("Camera API not available in this browser.");
      setCameraLoading(false);
      return;
    }

    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
      setStream(mediaStream);
      setCameraActive(true);
    } catch (err: unknown) {
      const msg = err instanceof DOMException
        ? `Error: ${err.name} — ${err.message}`
        : `Error: ${String(err)}`;
      setDebugInfo(msg);

      if (err instanceof DOMException) {
        switch (err.name) {
          case "NotAllowedError":
            setCameraError(
              "Camera access was blocked by the browser. " +
              "To fix: open browser Settings > Privacy & Security > Site Settings > Camera, " +
              'find "' + window.location.hostname + '" and set to "Allow", then reload this page.'
            );
            break;
          case "NotFoundError":
            setCameraError("No camera device found on this computer.");
            break;
          case "NotReadableError":
            setCameraError(
              "Camera is busy or in use by another app (Zoom, Teams, OBS, etc.). " +
              "Close other apps using the camera and try again."
            );
            break;
          case "OverconstrainedError":
            setCameraError("Camera does not support the requested format.");
            break;
          default:
            setCameraError(
              "Camera unavailable. " + err.message + " Type the VIN manually below."
            );
        }
      } else {
        setCameraError("Camera unavailable. Type the VIN manually below.");
      }
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

  const isValidVinLength = manualVin.trim().length === 17;
  const vinHint = manualVin.trim().length > 0 && !isValidVinLength
    ? `${manualVin.trim().length}/17 characters`
    : "";

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/dashboard" className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
                <ArrowLeft className="w-4 h-4" />Back
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
              <Smartphone className="w-4 h-4 text-muted-foreground" />
              <p className="text-sm font-medium text-foreground">Type VIN</p>
            </div>
            <form onSubmit={handleManualSubmit} className="flex gap-2 mb-6">
              <div className="flex-1 relative">
                <input
                  value={manualVin}
                  onChange={(e) => setManualVin(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ""))}
                  placeholder="e.g. 1HGCM82633A004352"
                  maxLength={17}
                  autoFocus
                  className="w-full p-3 border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent bg-background text-foreground font-mono tracking-widest text-lg"
                />
                {vinHint && (
                  <p className="absolute -bottom-5 right-0 text-xs text-muted-foreground">{vinHint}</p>
                )}
              </div>
              <button
                type="submit"
                disabled={!isValidVinLength}
                className="px-4 py-3 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 font-medium"
              >
                Look Up
              </button>
            </form>
          </div>

          <div className="border-t border-border pt-6">
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-3">
                Or use your camera to scan the VIN barcode
              </p>

              {cameraActive ? (
                <div>
                  <div className="relative mb-4 rounded-lg overflow-hidden bg-black" style={{ minHeight: 240 }}>
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 border-2 border-dashed border-primary/40 rounded-lg pointer-events-none" />
                  </div>
                  <button onClick={stopCamera} className="text-sm text-muted-foreground hover:text-foreground">
                    <CameraOff className="w-4 h-4 inline mr-1" />Close Camera
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
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

                  {cameraError && (
                    <div className="mt-4">
                      <div className="p-4 text-sm text-destructive bg-destructive/10 rounded-lg text-left">
                        <p className="font-medium mb-1">{cameraError}</p>
                        {debugInfo && (
                          <details className="mt-2">
                            <summary className="text-xs text-muted-foreground cursor-pointer">Technical details</summary>
                            <pre className="mt-1 text-xs text-muted-foreground/70 font-mono whitespace-pre-wrap">{debugInfo}</pre>
                          </details>
                        )}
                      </div>
                      <button
                        onClick={startCamera}
                        className="mt-3 inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />Try Again
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
