"use client";

import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft, Loader2, Building2, Star, Phone, MapPin, Globe, Mail,
  Pencil, Trash2,
} from "lucide-react";

interface ReviewUser {
  id: string;
  name: string | null;
}

interface Review {
  id: string;
  rating: number;
  review: string | null;
  createdAt: string;
  user: ReviewUser;
}

interface ServiceProvider {
  id: string;
  name: string;
  category: string;
  address: string | null;
  phone: string | null;
  website: string | null;
  email: string | null;
  notes: string | null;
  isPreferred: boolean;
  reviews: Review[];
}

const categoryLabels: Record<string, string> = {
  general: "General", dealership: "Dealership", independent: "Independent",
  tire: "Tire", body: "Body", transmission: "Transmission", oil: "Oil",
  brake: "Brake", electrical: "Electrical", ac: "A/C", towing: "Towing",
  detail: "Detail",
};

function StarRating({ rating, onChange }: { rating: number; onChange?: (v: number) => void }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={!onChange}
          onClick={() => onChange?.(star)}
          className={`text-lg ${onChange ? "cursor-pointer hover:scale-110" : "cursor-default"} transition-transform ${
            star <= rating ? "text-yellow-400" : "text-muted-foreground"
          }`}
        >
          {star <= rating ? "★" : "☆"}
        </button>
      ))}
    </div>
  );
}

export default function ServiceProviderDetailPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const [provider, setProvider] = useState<ServiceProvider | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editCategory, setEditCategory] = useState("");
  const [editAddress, setEditAddress] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editWebsite, setEditWebsite] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editNotes, setEditNotes] = useState("");
  const [editIsPreferred, setEditIsPreferred] = useState(false);

  const [newRating, setNewRating] = useState(0);
  const [newReview, setNewReview] = useState("");
  const [reviewError, setReviewError] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (session?.user && params.id) {
      fetchProvider();
    }
  }, [session, params.id]);

  const fetchProvider = async () => {
    try {
      const res = await fetch(`/api/service-providers/${params.id}`);
      if (res.ok) {
        const data = await res.json();
        setProvider(data);
        populateEdit(data);
      } else {
        router.push("/dashboard/service-providers");
      }
    } catch (err) {
      console.error("Failed to fetch provider:", err);
    } finally {
      setLoading(false);
    }
  };

  const populateEdit = (p: ServiceProvider) => {
    setEditName(p.name);
    setEditCategory(p.category);
    setEditAddress(p.address || "");
    setEditPhone(p.phone || "");
    setEditWebsite(p.website || "");
    setEditEmail(p.email || "");
    setEditNotes(p.notes || "");
    setEditIsPreferred(p.isPreferred);
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this provider? This action cannot be undone.")) return;
    setDeleting(true);
    try {
      await fetch(`/api/service-providers/${params.id}`, { method: "DELETE" });
      router.push("/dashboard/service-providers");
    } catch (err) {
      console.error("Failed to delete provider:", err);
    } finally {
      setDeleting(false);
    }
  };

  const handleEdit = async () => {
    try {
      const res = await fetch(`/api/service-providers/${params.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editName,
          category: editCategory,
          address: editAddress || undefined,
          phone: editPhone || undefined,
          website: editWebsite || undefined,
          email: editEmail || undefined,
          notes: editNotes || undefined,
          isPreferred: editIsPreferred,
        }),
      });
      if (res.ok) {
        const updated = await res.json();
        setProvider({ ...provider!, ...updated });
        setEditing(false);
      }
    } catch (err) {
      console.error("Failed to update provider:", err);
    }
  };

  const handleAddReview = async () => {
    if (newRating < 1) {
      setReviewError("Please select a rating");
      return;
    }
    setReviewError("");
    setSubmittingReview(true);
    try {
      const res = await fetch(`/api/service-providers/${params.id}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating: newRating, review: newReview || undefined }),
      });
      if (res.ok) {
        const created = await res.json();
        setProvider({
          ...provider!,
          reviews: [created, ...provider!.reviews],
        });
        setNewRating(0);
        setNewReview("");
      } else {
        const err = await res.json();
        setReviewError(err.error || "Failed to submit review");
      }
    } catch (err) {
      setReviewError("Something went wrong");
    } finally {
      setSubmittingReview(false);
    }
  };

  if (status === "loading" || loading || !provider) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const avg = provider.reviews.length
    ? provider.reviews.reduce((s, r) => s + r.rating, 0) / provider.reviews.length
    : 0;

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link
                href="/dashboard/service-providers"
                className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </Link>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  if (editing) {
                    handleEdit();
                  } else {
                    setEditing(true);
                  }
                }}
                className="p-3 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg"
              >
                <Pencil className="w-4 h-4" />
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="p-3 text-destructive hover:text-destructive hover:bg-destructive/10 rounded-lg"
              >
                {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-start gap-4 mb-8">
          <div className="p-3 bg-primary/10 rounded-xl">
            <Building2 className="w-8 h-8 text-primary" />
          </div>
          <div className="flex-1">
            {editing ? (
              <div className="space-y-3">
                <input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full p-3 border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent bg-background text-foreground text-lg font-bold"
                />
                <div className="flex items-center gap-4">
                  <select
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value)}
                    className="p-2 border border-input rounded-lg bg-background text-foreground"
                  >
                    {Object.entries(categoryLabels).map(([k, v]) => (
                      <option key={k} value={k}>{v}</option>
                    ))}
                  </select>
                  <label className="flex items-center gap-2 text-sm text-foreground">
                    <input
                      type="checkbox"
                      checked={editIsPreferred}
                      onChange={(e) => setEditIsPreferred(e.target.checked)}
                      className="rounded border-input"
                    />
                    Preferred
                  </label>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <input value={editAddress} onChange={(e) => setEditAddress(e.target.value)} placeholder="Address" className="p-2 border border-input rounded-lg bg-background text-foreground" />
                  <input value={editPhone} onChange={(e) => setEditPhone(e.target.value)} placeholder="Phone" className="p-2 border border-input rounded-lg bg-background text-foreground" />
                  <input value={editWebsite} onChange={(e) => setEditWebsite(e.target.value)} placeholder="Website" className="p-2 border border-input rounded-lg bg-background text-foreground" />
                  <input value={editEmail} onChange={(e) => setEditEmail(e.target.value)} placeholder="Email" className="p-2 border border-input rounded-lg bg-background text-foreground" />
                </div>
                <textarea value={editNotes} onChange={(e) => setEditNotes(e.target.value)} placeholder="Notes" className="w-full p-2 border border-input rounded-lg bg-background text-foreground min-h-[80px]" />
                <div className="flex gap-2">
                  <button onClick={handleEdit} className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90">Save</button>
                  <button onClick={() => { setEditing(false); populateEdit(provider); }} className="px-4 py-2 border border-input rounded-lg text-foreground hover:bg-accent">Cancel</button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-start justify-between">
                  <div>
                    <h1 className="text-2xl font-bold text-foreground">{provider.name}</h1>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-sm px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground">
                        {categoryLabels[provider.category] || provider.category}
                      </span>
                      {provider.isPreferred && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-50 text-yellow-700">
                          <Star className="w-3 h-3" />
                          Preferred
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 mt-3">
                  <span className="text-yellow-500 text-lg">
                    {Array.from({ length: 5 }, (_, i) =>
                      i < Math.round(avg) ? "★" : "☆",
                    ).join("")}
                  </span>
                  <span className="text-muted-foreground text-sm">
                    {avg.toFixed(1)} ({provider.reviews.length} review{provider.reviews.length !== 1 ? "s" : ""})
                  </span>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3 mb-8">
          <div className="lg:col-span-2 space-y-6">
            {!editing && (
              <div className="bg-card rounded-lg border border-border p-6">
                <h2 className="text-lg font-semibold text-foreground mb-4">Contact Info</h2>
                <div className="space-y-3">
                  {provider.phone && (
                    <p className="flex items-center gap-2 text-foreground">
                      <Phone className="w-4 h-4 text-muted-foreground" />
                      {provider.phone}
                    </p>
                  )}
                  {provider.email && (
                    <p className="flex items-center gap-2 text-foreground">
                      <Mail className="w-4 h-4 text-muted-foreground" />
                      {provider.email}
                    </p>
                  )}
                  {provider.website && (
                    <p className="flex items-center gap-2 text-foreground">
                      <Globe className="w-4 h-4 text-muted-foreground" />
                      <a href={provider.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                        {provider.website}
                      </a>
                    </p>
                  )}
                  {provider.address && (
                    <p className="flex items-center gap-2 text-foreground">
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                      {provider.address}
                    </p>
                  )}
                </div>
                {provider.notes && (
                  <div className="mt-4 pt-4 border-t border-border">
                    <p className="text-sm font-medium text-foreground mb-1">Notes</p>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">{provider.notes}</p>
                  </div>
                )}
              </div>
            )}

            <div className="bg-card rounded-lg border border-border">
              <div className="px-6 py-4 border-b border-border">
                <h2 className="text-lg font-semibold text-foreground">Add Review</h2>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Rating</label>
                    <StarRating rating={newRating} onChange={setNewRating} />
                  </div>
                  <div>
                    <textarea
                      value={newReview}
                      onChange={(e) => setNewReview(e.target.value)}
                      placeholder="Share your experience..."
                      className="w-full p-3 border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent bg-background text-foreground min-h-[80px]"
                    />
                  </div>
                  {reviewError && (
                    <p className="text-sm text-destructive">{reviewError}</p>
                  )}
                  <button
                    onClick={handleAddReview}
                    disabled={submittingReview}
                    className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 disabled:opacity-50"
                  >
                    {submittingReview && <Loader2 className="w-4 h-4 animate-spin" />}
                    Submit Review
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-card rounded-lg border border-border">
              <div className="px-6 py-4 border-b border-border">
                <h2 className="text-lg font-semibold text-foreground">
                  Reviews ({provider.reviews.length})
                </h2>
              </div>
              {provider.reviews.length === 0 ? (
                <div className="p-12 text-center">
                  <Star className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No reviews yet</p>
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {provider.reviews.map((review) => (
                    <div key={review.id} className="p-6">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-foreground">
                          {review.user.name || "Anonymous"}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <StarRating rating={review.rating} />
                      {review.review && (
                        <p className="mt-2 text-sm text-muted-foreground">{review.review}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
