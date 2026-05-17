"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft, Camera, CameraOff, Scan, Smartphone } from "lucide-react";
import Link from "next/link";

export default function ScanVINPage() {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraFailed, setCameraFailed] = useState(false);
  const [manualVin, setManualVin] = useState("");

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
      videoRef.current.play().catch(() => {});
    }
  }, [stream]);

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((t) => t.stop());
      setStream(null);
    }
    setCameraActive(false);
  };

  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach((t) => t.stop());
      }
    };
  }, [stream]);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
      setStream(mediaStream);
      setCameraActive(true);
    } catch {
      setCameraFailed(true);
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

          <div className="border-t border-border pt-6 text-center">
            <p className="text-sm text-muted-foreground mb-3">
              {cameraActive ? "Point camera at VIN barcode" : "Or scan with your camera"}
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
            ) : cameraFailed ? (
              <div>
                <p className="text-sm text-destructive mb-3">
                  Camera unavailable on this device. Type the VIN manually above.
                </p>
                <button
                  onClick={startCamera}
                  className="inline-flex items-center gap-2 px-4 py-3 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity"
                >
                  <Camera className="w-4 h-4" />Try Again
                </button>
              </div>
            ) : (
              <button
                onClick={startCamera}
                className="inline-flex items-center gap-2 px-4 py-3 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity"
              >
                <Camera className="w-4 h-4" />Open Camera
              </button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
