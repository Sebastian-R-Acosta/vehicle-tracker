"use client";

import { Suspense } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Building2, Loader2, CheckCircle, XCircle } from "lucide-react";
import Link from "next/link";

function JoinContent() {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [state, setState] = useState<"loading" | "success" | "error">("loading");
  const [orgName, setOrgName] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push(`/login?callbackUrl=/join?token=${token}`);
      return;
    }

    if (status === "loading" || !token) return;

    const acceptInvitation = async () => {
      try {
        const res = await fetch("/api/organizations/join", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });

        if (!res.ok) {
          const text = await res.text();
          throw new Error(text);
        }

        const data = await res.json();
        setOrgName(data.organization.name);
        setState("success");
        await update({ currentOrganizationId: data.organization.id });
      } catch (err: any) {
        setError(err.message);
        setState("error");
      }
    };

    acceptInvitation();
  }, [status, token, router, update]);

  if (!token) {
    return (
      <div className="text-center p-8">
        <XCircle className="w-12 h-12 mx-auto text-destructive mb-4" />
        <h2 className="text-lg font-semibold text-foreground mb-2">Invalid Link</h2>
        <p className="text-muted-foreground">No invitation token provided.</p>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-lg border border-border p-8 max-w-md w-full mx-4 text-center">
      {state === "loading" && (
        <>
          <Loader2 className="w-12 h-12 mx-auto text-primary animate-spin mb-4" />
          <h2 className="text-lg font-semibold text-foreground">Joining organization...</h2>
        </>
      )}

      {state === "success" && (
        <>
          <CheckCircle className="w-12 h-12 mx-auto text-green-500 mb-4" />
          <h2 className="text-lg font-semibold text-foreground mb-2">Welcome!</h2>
          <p className="text-muted-foreground mb-6">
            You have joined <strong className="text-foreground">{orgName}</strong>
          </p>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:opacity-90"
          >
            <Building2 className="w-4 h-4" />
            Go to Dashboard
          </Link>
        </>
      )}

      {state === "error" && (
        <>
          <XCircle className="w-12 h-12 mx-auto text-destructive mb-4" />
          <h2 className="text-lg font-semibold text-foreground mb-2">Could Not Join</h2>
          <p className="text-muted-foreground mb-6">{error}</p>
          <Link href="/dashboard" className="text-primary hover:underline">
            Go to Dashboard
          </Link>
        </>
      )}
    </div>
  );
}

export default function JoinPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Suspense fallback={
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      }>
        <JoinContent />
      </Suspense>
    </div>
  );
}
