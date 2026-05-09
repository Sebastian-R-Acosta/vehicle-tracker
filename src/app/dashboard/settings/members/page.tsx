"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowLeft, Loader2, Copy, Check, X, Shield, UserCog, Wrench, User } from "lucide-react";
import Link from "next/link";

interface Member {
  id: string;
  role: string;
  user: { id: string; name: string | null; email: string };
}

interface Invitation {
  id: string;
  email: string;
  role: string;
  token: string;
  expiresAt: string;
  createdAt: string;
}

const roleIcons: Record<string, React.ElementType> = {
  owner: Shield,
  admin: UserCog,
  technician: Wrench,
  customer: User,
};

const roleLabels: Record<string, string> = {
  owner: "Owner",
  admin: "Admin",
  technician: "Technician",
  customer: "Customer",
};

export default function MembersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [members, setMembers] = useState<Member[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("customer");
  const [inviteError, setInviteError] = useState("");
  const [inviteSuccess, setInviteSuccess] = useState("");
  const [copiedToken, setCopiedToken] = useState("");

  const currentOrgId = session?.user?.currentOrganizationId;

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  useEffect(() => {
    if (currentOrgId) fetchData();
    else setLoading(false);
  }, [currentOrgId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [membersRes, invitesRes] = await Promise.all([
        fetch(`/api/organizations/${currentOrgId}/members`),
        fetch(`/api/organizations/${currentOrgId}/invitations`),
      ]);
      if (membersRes.ok) setMembers(await membersRes.json());
      if (invitesRes.ok) setInvitations(await invitesRes.json());
    } catch (err) {
      console.error("Failed to fetch data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setInviteError("");
    setInviteSuccess("");

    try {
      const res = await fetch(`/api/organizations/${currentOrgId}/invitations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: inviteEmail, role: inviteRole }),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text);
      }

      const inv = await res.json();
      setInviteSuccess(`Invitation created! Share this link:`);
      setCopiedToken(inv.token);
      setInviteEmail("");
      fetchData();
    } catch (err: any) {
      setInviteError(err.message);
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!confirm("Remove this member from the organization?")) return;
    try {
      const res = await fetch(`/api/organizations/${currentOrgId}/members/${memberId}`, {
        method: "DELETE",
      });
      if (res.ok) fetchData();
    } catch (err) {
      console.error("Failed to remove member:", err);
    }
  };

  const handleChangeRole = async (memberId: string, role: string) => {
    try {
      await fetch(`/api/organizations/${currentOrgId}/members/${memberId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
      });
      fetchData();
    } catch (err) {
      console.error("Failed to change role:", err);
    }
  };

  const handleCopyLink = (token: string) => {
    const link = `${window.location.origin}/join?token=${token}`;
    navigator.clipboard.writeText(link);
    setCopiedToken(token);
    setTimeout(() => setCopiedToken(""), 2000);
  };

  const cancelInvitation = async (invitationId: string) => {
    try {
      await fetch(`/api/organizations/${currentOrgId}/invitations/${invitationId}`, {
        method: "DELETE",
      });
      fetchData();
    } catch (err) {
      console.error("Failed to cancel invitation:", err);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!currentOrgId) {
    return (
      <div className="min-h-screen bg-background">
        <header className="bg-card border-b border-border">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center h-16">
            <Link href="/dashboard" className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
              <ArrowLeft className="w-4 h-4" /> Back
            </Link>
          </div>
        </header>
        <main className="max-w-3xl mx-auto px-4 py-16 text-center text-muted-foreground">
          No organization selected.
        </main>
      </div>
    );
  }

  const inviteLink = copiedToken ? `${window.location.origin}/join?token=${copiedToken}` : "";

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center h-16">
          <Link href="/dashboard/settings" className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-4 h-4" /> Back to Settings
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold text-foreground mb-6">Members</h1>

        <div className="bg-card rounded-lg border border-border p-6 mb-8">
          <h2 className="text-lg font-semibold text-foreground mb-4">Invite Member</h2>
          <form onSubmit={handleInvite} className="space-y-4">
            <div className="flex gap-3">
              <input
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="Email address"
                required
                className="flex-1 p-3 border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent bg-background text-foreground"
              />
              <select
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value)}
                className="p-3 border border-input rounded-lg bg-background text-foreground"
              >
                <option value="customer">Customer</option>
                <option value="technician">Technician</option>
                <option value="admin">Admin</option>
              </select>
              <button
                type="submit"
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity"
              >
                Invite
              </button>
            </div>
          </form>

          {inviteError && (
            <div className="mt-3 p-3 text-sm text-destructive bg-destructive/10 rounded-lg">{inviteError}</div>
          )}

          {inviteSuccess && (
            <div className="mt-3 p-3 text-sm text-green-600 bg-green-500/10 rounded-lg">
              <p className="mb-2">{inviteSuccess}</p>
              <div className="flex items-center gap-2">
                <code className="flex-1 p-2 bg-background rounded text-xs break-all">{inviteLink}</code>
                <button
                  onClick={() => handleCopyLink(copiedToken)}
                  className="p-2 hover:bg-accent rounded"
                >
                  {copiedToken ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="bg-card rounded-lg border border-border">
          <div className="p-6 border-b border-border">
            <h2 className="text-lg font-semibold text-foreground">Current Members ({members.length})</h2>
          </div>

          <div className="divide-y divide-border">
            {members.map((member) => {
              const RoleIcon = roleIcons[member.role] || User;
              return (
                <div key={member.id} className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <RoleIcon className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">
                        {member.user.name || member.user.email}
                      </p>
                      {member.user.name && (
                        <p className="text-sm text-muted-foreground">{member.user.email}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <select
                      value={member.role}
                      onChange={(e) => handleChangeRole(member.id, e.target.value)}
                      className="text-sm p-2 border border-input rounded bg-background text-foreground"
                      disabled={member.role === "owner"}
                    >
                      {Object.entries(roleLabels).map(([key, label]) => (
                        <option key={key} value={key} disabled={key === "owner" && member.role === "owner"}>
                          {label}
                        </option>
                      ))}
                    </select>
                    {member.role !== "owner" && (
                      <button
                        onClick={() => handleRemoveMember(member.id)}
                        className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {invitations.length > 0 && (
          <div className="bg-card rounded-lg border border-border mt-6">
            <div className="p-6 border-b border-border">
              <h2 className="text-lg font-semibold text-foreground">Pending Invitations ({invitations.length})</h2>
            </div>
            <div className="divide-y divide-border">
              {invitations.map((inv) => (
                <div key={inv.id} className="flex items-center justify-between p-4">
                  <div>
                    <p className="font-medium text-foreground">{inv.email}</p>
                    <p className="text-sm text-muted-foreground capitalize">Role: {roleLabels[inv.role] || inv.role}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleCopyLink(inv.token)}
                      className="flex items-center gap-1 px-3 py-1.5 text-sm border border-input rounded hover:bg-accent"
                    >
                      {copiedToken === inv.token ? (
                        <Check className="w-3 h-3" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                      Copy Link
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
