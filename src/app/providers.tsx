"use client";

import { SessionProvider } from "next-auth/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Suspense, useState } from "react";
import { ThemeProvider } from "@/components/ThemeProvider";
import { PostHogProvider } from "@/components/PostHogProvider";
import { Toaster } from "react-hot-toast";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
          },
        },
      })
  );

  return (
    <SessionProvider>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <Suspense fallback={null}>
            <PostHogProvider>
              {children}
              <Toaster
                position="bottom-right"
                toastOptions={{
                  duration: 4000,
                  style: {
                    borderRadius: "12px",
                    padding: "12px 16px",
                    fontSize: "14px",
                  },
                  success: {
                    style: {
                      background: "#059669",
                      color: "#fff",
                    },
                    iconTheme: {
                      primary: "#fff",
                      secondary: "#059669",
                    },
                  },
                  error: {
                    style: {
                      background: "#dc2626",
                      color: "#fff",
                    },
                    duration: 5000,
                  },
                }}
              />
            </PostHogProvider>
          </Suspense>
        </ThemeProvider>
      </QueryClientProvider>
    </SessionProvider>
  );
}
