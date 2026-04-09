import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiUrl, authFetchOptions } from "@/lib/api";
import { useLang } from "@/contexts/LanguageContext";

export interface CreditPackage {
  id: string;
  name: string;
  description: string;
  credits: number;
  unitAmount: number;
  currency: string;
  popular: boolean;
}

export function usePackages() {
  return useQuery<CreditPackage[]>({
    queryKey: ["packages"],
    queryFn: async () => {
      const res = await fetch(apiUrl("/api/packages"), authFetchOptions());
      if (!res.ok) return [];
      const data = await res.json();
      return data.packages ?? [];
    },
    staleTime: 5 * 60 * 1000,
    retry: false,
  });
}

export function usePurchase() {
  const { lang } = useLang();
  return useMutation({
    mutationFn: async (packageId: string): Promise<string> => {
      const res = await fetch(apiUrl("/api/checkout"), authFetchOptions({
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ packageId, lang }),
      }));
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error((err as any).error ?? "Failed to create checkout session");
      }
      const { url } = await res.json();
      return url as string;
    },
  });
}

export function usePayPalPurchase() {
  return useMutation({
    mutationFn: async (packageId: string): Promise<string> => {
      const res = await fetch(apiUrl("/api/paypal/checkout"), authFetchOptions({
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ packageId }),
      }));
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error((err as any).error ?? "Failed to create PayPal order");
      }
      const data = await res.json();
      if (data.orderId) {
        sessionStorage.setItem("paypal_order_id", data.orderId);
      }
      return data.url as string;
    },
  });
}

export function useFulfillPayPal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (orderId: string) => {
      const res = await fetch(apiUrl("/api/paypal/capture"), authFetchOptions({
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId }),
      }));
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error((err as any).error ?? "Failed to capture PayPal payment");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["auth", "me"] });
    },
  });
}

export function useRecoverPayPal(isLoggedIn: boolean = false) {
  const queryClient = useQueryClient();
  return useQuery({
    queryKey: ["paypal", "recover"],
    queryFn: async () => {
      const token = (await import("@/lib/api")).getAuthToken();
      if (!token) return { recovered: 0 };
      const res = await fetch(apiUrl("/api/paypal/recover"), authFetchOptions());
      if (!res.ok) return { recovered: 0 };
      const data = await res.json();
      if (data.recovered > 0) {
        queryClient.invalidateQueries({ queryKey: ["auth", "me"] });
      }
      return data;
    },
    staleTime: 60 * 1000,
    retry: false,
    enabled: isLoggedIn,
  });
}

export function useFulfillPayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (sessionId: string) => {
      const res = await fetch(apiUrl("/api/credits/fulfill"), authFetchOptions({
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId }),
      }));
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error((err as any).error ?? "Failed to fulfill payment");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["auth", "me"] });
    },
  });
}
