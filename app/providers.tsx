"use client";

import type { ReactNode } from "react";
import { WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";
import { wagmiConfig } from "@/lib/wagmi";

const queryClient = new QueryClient();

export function Providers(props: { children: ReactNode }) {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        {props.children}
        <Toaster position="top-right" />
      </QueryClientProvider>
    </WagmiProvider>
  );
}

