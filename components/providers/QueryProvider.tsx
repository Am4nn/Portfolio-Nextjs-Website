"use client";
import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReadOnlyChildren } from "@/utils/types";

// Create a client

export default function QueryProvider({ children }: ReadOnlyChildren) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    // Provide the client to your App
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}