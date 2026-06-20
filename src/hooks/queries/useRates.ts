import { useQuery } from "@tanstack/react-query";
import { client } from "@/api/client";
import { ENDPOINTS } from "@/api/endpoints";

export function useExchangeRates() {
  return useQuery<unknown[]>({
    queryKey: ["rates", "exchange"],
    queryFn: async () => {
      const { data } = await client.get(ENDPOINTS.RATES.EXCHANGE);
      return data.data;
    },
    staleTime: 30_000,
  });
}

export function useFeeConfig() {
  return useQuery<unknown[]>({
    queryKey: ["rates", "fee-config"],
    queryFn: async () => {
      const { data } = await client.get(ENDPOINTS.RATES.FEE_CONFIG);
      return data.data;
    },
    staleTime: 60_000,
  });
}

export function useFeeRevenue() {
  return useQuery<unknown>({
    queryKey: ["rates", "fee-revenue"],
    queryFn: async () => {
      const { data } = await client.get(ENDPOINTS.RATES.FEE_REVENUE);
      return data.data;
    },
    staleTime: 60_000,
  });
}
