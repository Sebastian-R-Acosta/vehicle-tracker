import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

export function useFetch<T>(
  key: string[],
  url: string,
  options?: { enabled?: boolean }
) {
  return useQuery<T>({
    queryKey: key,
    queryFn: async () => {
      const res = await fetch(url);
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Request failed" }));
        throw new Error(err.error || `HTTP ${res.status}`);
      }
      return res.json();
    },
    enabled: options?.enabled,
  });
}

interface MutationOptions {
  method?: "POST" | "PUT" | "PATCH" | "DELETE";
  successMessage?: string;
  errorMessage?: string;
  invalidateKeys?: string[][];
  onSuccess?: () => void;
}

export function useMutationToast(
  url: string,
  options: MutationOptions = {}
) {
  const queryClient = useQueryClient();
  const { method = "POST", successMessage, errorMessage, invalidateKeys, onSuccess } = options;

  return useMutation({
    mutationFn: async (body?: unknown) => {
      const res = await fetch(url, {
        method,
        headers: body ? { "Content-Type": "application/json" } : undefined,
        body: body ? JSON.stringify(body) : undefined,
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Request failed" }));
        throw new Error(err.error || `HTTP ${res.status}`);
      }
      return res.json();
    },
    onSuccess: () => {
      if (successMessage) toast.success(successMessage);
      if (invalidateKeys) {
        invalidateKeys.forEach((key) => queryClient.invalidateQueries({ queryKey: key }));
      }
      onSuccess?.();
    },
    onError: (err: Error) => {
      toast.error(errorMessage || err.message || "Something went wrong");
    },
  });
}

export function useDeleteToast(
  url: string,
  options: { invalidateKeys: string[][]; successMessage?: string }
) {
  const queryClient = useQueryClient();
  const { invalidateKeys, successMessage = "Deleted successfully" } = options;

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`${url}/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Delete failed" }));
        throw new Error(err.error || `HTTP ${res.status}`);
      }
      return res.json();
    },
    onSuccess: () => {
      toast.success(successMessage);
      invalidateKeys.forEach((key) => queryClient.invalidateQueries({ queryKey: key }));
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to delete");
    },
  });
}
