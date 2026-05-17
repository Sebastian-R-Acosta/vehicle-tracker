"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft, Camera, CameraOff, FlipHorizontal, Scan, Smartphone } from "lucide-react";
import Link from "next/link";

type FacingMode = "user" | "environment";

export default function ScanVINPage() {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraFailed, setCameraFailed] = useState(false);
  const [facingMode, setFacingMode] = useState<FacingMode>("environment");
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
    setCameraFailed(false);
  };

  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach((t) => t.stop());
      }
    };
  }, [stream]);

  const startCamera = async (facing: FacingMode = facingMode) => {
    if (stream) {
      stream.getTracks().forEach((t) => t.stop());
      setStream(null);
    }
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: facing }, width: { ideal: 1280 }, height: { ideal: 720 } },
      });
      setStream(mediaStream);
      setCameraActive(true);
      setCameraFailed(false);
    } catch {
      if (facing === "environment") {
        try {
          const fallback = await navigator.mediaDevices.getUserMedia({ video: true });
          setStream(fallback);
          setCameraActive(true);
          setCameraFailed(false);
          setFacingMode("user");
          return;
        } catch {
          setCameraFailed(true);
        }
      } else {
        setCameraFailed(true);
      }
    }
  };

  const flipCamera = () => {
    const next = facingMode === "environment" ? "user" : "environment";
    setFacingMode(next);
    startCamera(next);
  };

  const handleFileCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const imageUrl = URL.createObjectURL(file);
    if (videoRef.current) {
      videoRef.current.srcObject = null;
      videoRef.current.src = imageUrl;
      videoRef.current.play().catch(() => {});
    }
    setCameraActive(true);
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

          <div className="border-t border-border pt-6">
            <p className="text-sm text-muted-foreground text-center mb-3">
              {cameraActive ? "Point camera at VIN barcode" : "Scan with your camera"}
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
                <div className="flex items-center justify-center gap-3">
                  <button onClick={flipCamera} className="inline-flex items-center gap-1.5 px-3 py-2 text-sm border border-border rounded-lg hover:bg-accent transition-colors">
                    <FlipHorizontal className="w-4 h-4" />Flip
                  </button>
                  <button onClick={stopCamera} className="inline-flex items-center gap-1.5 px-3 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                    <CameraOff className="w-4 h-4" />Close
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3">
                <button
                  onClick={() => startCamera()}
                  className="inline-flex items-center gap-2 px-4 py-3 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity"
                >
                  <Camera className="w-4 h-4" />Open Camera
                </button>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleFileCapture}
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm border border-border rounded-lg hover:bg-accent transition-colors"
                >
                  <Camera className="w-4 h-4" />Take Photo
                </button>

                {cameraFailed && (
                  <p className="text-sm text-destructive">
                    Live camera unavailable. Use &quot;Take Photo&quot; or type the VIN manually above.
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
