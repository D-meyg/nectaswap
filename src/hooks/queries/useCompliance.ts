import { useQuery } from "@tanstack/react-query";
import { complianceService } from "@/services/complianceService";

export function useComplianceStats() {
  return useQuery<unknown>({
    queryKey: ["compliance", "stats"],
    queryFn: async () => {
      const res = await complianceService.getStats();
      return res.data;
    },
    staleTime: 60_000,
  });
}

export function useFlaggedUsers() {
  return useQuery<unknown[]>({
    queryKey: ["compliance", "flagged-users"],
    queryFn: async () => {
      const res = await complianceService.getFlaggedUsers();
      return res.data;
    },
    staleTime: 60_000,
  });
}

export function useFlaggedTransactions() {
  return useQuery<unknown[]>({
    queryKey: ["compliance", "flagged-transactions"],
    queryFn: async () => {
      const res = await complianceService.getFlaggedTransactions();
      return res.data;
    },
    staleTime: 60_000,
  });
}

export function useRiskRules() {
  return useQuery<unknown[]>({
    queryKey: ["compliance", "risk-rules"],
    queryFn: async () => {
      const res = await complianceService.getRiskRules();
      return res.data;
    },
    staleTime: 5 * 60_000,
  });
}
