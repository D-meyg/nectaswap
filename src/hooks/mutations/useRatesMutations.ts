/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { client } from "@/api/client";
import { ENDPOINTS } from "@/api/endpoints";
import { useToast } from "@/hooks/ui/useToast";

export function useOverrideExchangeRates() {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: async (payload: any) => {
      const { data } = await client.post(ENDPOINTS.RATES.OVERRIDE, payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rates"] });
      toast.show({ type: "success", title: "Rates Overridden", message: "Manual exchange rates applied." });
    },
  });
}

export function useUpdateFeeTier() {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: async ({ tier, payload }: { tier: string; payload: any }) => {
      const { data } = await client.patch(ENDPOINTS.RATES.UPDATE_TIER(tier), payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rates", "fees"] });
      toast.show({ type: "success", title: "Fees Updated", message: "Fee configuration modified." });
    },
  });
}