"use client";

import { useSession, signOut } from "next-auth/react";
import { useState, useEffect, useRef } from "react";
import { Building2, User, ChevronDown, LogOut, Settings, Plus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import CreateOrgModal from "./CreateOrgModal";

interface Org {
  id: string;
  name: string;
  slug: string;
  logoUrl: string | null;
  role: string;
}

export default function OrgSwitcher() {
  const { data: session, update } = useSession();
  const router = useRouter();
  const [orgs, setOrgs] = useState<Org[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const currentOrgId = session?.user?.currentOrganizationId;

  const fetchOrgs = () => {
    setLoading(true);
    fetch("/api/organizations")
      .then((r) => r.ok ? r.json() : [])
      .then((data) => setOrgs(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchOrgs();
  }, [session]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const currentOrg = orgs.find((o) => o.id === currentOrgId);

  const switchOrg = async (orgId: string | null) => {
    setOpen(false);
    await fetch("/api/user/current-org", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ organizationId: orgId }),
    });
    await update({ currentOrganizationId: orgId });
    router.refresh();
  };

  return (
    <>
      <div ref={ref} className="relative">
        <button
          onClick={() => setOpen(!open)}
          className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg hover:bg-accent transition-colors"
        >
          {currentOrg ? (
            <>
              <Building2 className="w-4 h-4 text-primary" />
              <span className="font-medium text-foreground max-w-[140px] truncate">
                {currentOrg.name}
              </span>
            </>
          ) : (
            <>
              <User className="w-4 h-4 text-primary" />
              <span className="font-medium text-foreground">Personal</span>
            </>
          )}
          <ChevronDown className="w-3 h-3 text-muted-foreground" />
        </button>

        {open && (
          <div className="absolute top-full left-0 mt-1 w-64 bg-card border border-border rounded-lg shadow-lg z-50 py-1">
            <div className="px-3 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Switch account
            </div>

            <button
              onClick={() => switchOrg(null)}
              className={`w-full flex items-center gap-3 px-3 py-2 text-sm hover:bg-accent transition-colors ${!currentOrgId ? "bg-accent" : ""}`}
            >
              <User className="w-4 h-4" />
              <span>Personal</span>
            </button>

            {orgs.map((org) => (
              <button
                key={org.id}
                onClick={() => switchOrg(org.id)}
                className={`w-full flex items-center gap-3 px-3 py-2 text-sm hover:bg-accent transition-colors ${org.id === currentOrgId ? "bg-accent" : ""}`}
              >
                <Building2 className="w-4 h-4" />
                <div className="flex-1 text-left">
                  <div className="font-medium text-foreground truncate">{org.name}</div>
                  <div className="text-xs text-muted-foreground capitalize">{org.role}</div>
                </div>
              </button>
            ))}

            <div className="border-t border-border mt-1 pt-1">
              <button
                onClick={() => { setOpen(false); setShowCreateModal(true); }}
                className="w-full flex items-center gap-3 px-3 py-2 text-sm hover:bg-accent transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Create Organization</span>
              </button>
              <Link
                href="/dashboard/settings"
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-3 py-2 text-sm hover:bg-accent transition-colors"
              >
                <Settings className="w-4 h-4" />
                <span>Settings</span>
              </Link>
              <button
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="w-full flex items-center gap-3 px-3 py-2 text-sm hover:bg-accent transition-colors text-destructive"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign out</span>
              </button>
            </div>
          </div>
        )}
      </div>

      <CreateOrgModal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreated={fetchOrgs}
      />
    </>
  );
}
