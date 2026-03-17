import { Linking } from "react-native";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { API_BASE } from "./use-auth";

export interface CreditPackage {
  id: string;
  name: string;
  description: string;
  credits: number;
  unitAmount: number;
  currency: string;
  popular?: boolean;
}

export function usePackages() {
  return useQuery<CreditPackage[]>({
    queryKey: ["packages"],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/packages`);
      if (!res.ok) throw new Error("Failed to fetch packages");
      const data = await res.json();
      return data.packages as CreditPackage[];
    },
    staleTime: 60_000,
  });
}

export function usePurchase() {
  const qc = useQueryClient();
  return useMutation<string, Error, string>({
    mutationFn: async (packageId: string) => {
      const res = await fetch(`${API_BASE}/checkout`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ packageId }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error((err as any).error ?? `HTTP ${res.status}`);
      }
      const data = await res.json();
      return (data as any).url as string;
    },
    onSuccess: (url) => {
      // Open Stripe checkout in the device browser
      Linking.openURL(url);
      // Refresh auth after a delay to pick up new credit balance
      setTimeout(() => qc.invalidateQueries({ queryKey: ["auth"] }), 4000);
    },
  });
}
