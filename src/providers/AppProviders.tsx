import { type ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";

/**
 * AppProviders — single wrapper for all app-level providers.
 * Add new providers here without touching main.tsx.
 */
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 2,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}

      {/*
        Toaster — positioned top-right, styled with design system tokens.
        All toasts fired via useToast() hook — never import sonner directly.
      */}
      <Toaster
        position="top-right"
        expand={false}
        richColors
        closeButton
        toastOptions={{
          duration: 4000,
          style: {
            fontFamily: "Inter, sans-serif",
            fontSize: "13px",
            lineHeight: "19.5px",
            borderRadius: "var(--radius-md)",
            border: "1px solid var(--color-border)",
            boxShadow: "var(--shadow-card)",
          },
        }}
      />
    </QueryClientProvider>
  );
}
